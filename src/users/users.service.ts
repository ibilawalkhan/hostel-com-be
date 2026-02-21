import { Injectable } from '@nestjs/common';
import { UserRepository } from '../auth/repositories/user.repository';
import { RoleRepository } from '../auth/repositories/role.repository';
import { User } from '../auth/interfaces/user.interface';
import { PasswordService } from '../common/services/password.service';
import { LoggerService } from '../common/services/logger.service';
import { TransactionHelper } from '../common/database/transaction.helper';
import { validateUserUniqueness } from '../auth/helper/validation.helper';
import { handleSignupError } from '../auth/helper/error.helper';
import type { AddNewWardenDto } from '../auth/dto/auth.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly passwordService: PasswordService,
    private readonly logger: LoggerService,
    private readonly transactionHelper: TransactionHelper,
  ) {}

  async getCurrentUser(kuid: string): Promise<User | null> {
    return this.userRepository.findByKuid(kuid);
  }

  async addNewWarden(data: AddNewWardenDto) {
    const {
      full_name,
      phone_number,
      email,
      assigned_hostel,
      assigned_branch,
      permission_kuids,
    } = data;

    await validateUserUniqueness(
      this.userRepository,
      this.logger,
      phone_number,
      email ?? null,
      null,
    );

    const temporaryPassword = this.passwordService.generateTemporaryPassword();
    const passwordHash = await this.passwordService.hash(temporaryPassword);

    try {
      const result = await this.transactionHelper.executeInTransaction(
        async (client) => {
          const newUser = await this.userRepository.create(
            client,
            full_name,
            phone_number,
            email ?? null,
            passwordHash,
          );

          const role = await this.roleRepository.create(
            client,
            newUser.kuid,
            'WARDEN',
            assigned_hostel,
            assigned_branch ?? null,
          );

          if (permission_kuids?.length) {
            await this.roleRepository.assignPermissions(
              client,
              role.kuid,
              permission_kuids,
            );
          }

          return { user: newUser, role, temporaryPassword };
        },
      );

      this.logger.log(
        `Warden created successfully: ${result.user.kuid}`,
        'UsersService',
      );

      return {
        message: 'Warden created successfully',
        user: {
          kuid: result.user.kuid,
          full_name: result.user.full_name,
          phone: result.user.phone,
          email: result.user.email,
          role: result.role.name,
          assigned_hostel: result.role.assigned_hostel,
          assigned_branch: result.role.hostel_branch,
        },
        temporary_password: result.temporaryPassword,
        permissions_assigned: permission_kuids.length,
      };
    } catch (error) {
      handleSignupError(error, phone_number, this.logger);
    }
  }
}
