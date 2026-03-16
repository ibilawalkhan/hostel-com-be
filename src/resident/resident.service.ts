import { Injectable } from '@nestjs/common';
import { CreateWalkInDto } from './dto/create-walk-in.dto';
import { ResidentRepository } from './repository/resident.repository';
import { TransactionHelper } from '../common/database/transaction.helper';
import { LoggerService } from '../common/services/logger.service';
import { RoleRepository } from '../auth/repositories/role.repository';
import { PasswordService } from '../common/services/password.service';

@Injectable()
export class ResidentService {
  constructor(
    private readonly residentRepository: ResidentRepository,
    private readonly transactionHelper: TransactionHelper,
    private readonly roleRepository: RoleRepository,
    private readonly passwordService: PasswordService,

    private readonly logger: LoggerService,
  ) {}

  async walkIn(createWalkInDto: CreateWalkInDto, staffKuid: string) {
    const result = await this.transactionHelper.executeInTransaction(
      async (client) => {
        const passwordHash = await this.passwordService.hash(
          createWalkInDto.password,
        );

        // 1. create walk-in
        const user = await this.residentRepository.createUser(
          client,
          createWalkInDto.full_name,
          createWalkInDto.phone_number,
          passwordHash,
          createWalkInDto.email ?? null, // 👈 converts undefined to null
          createWalkInDto.cnic,
        );

        const role = await this.roleRepository.create(
          client,
          user.kuid,
          'CUSTOMER',
          createWalkInDto.hostel_kuid, // assignedHostel
          createWalkInDto.branch_kuid, // hostelBranch (or branch_no)
        );
        // 3. create resident
        const resident = await this.residentRepository.createResident(
          client,
          user.kuid,
          createWalkInDto,
        );

        const monthlyRent = await this.residentRepository.createMonthlyRent(
          client,
          resident.kuid,
          createWalkInDto,
        );

        // 5. create payment
        const payment = await this.residentRepository.createPayment(
          client,
          user.kuid,
          resident.kuid,
          createWalkInDto,
        );
        return { resident, monthlyRent, role, payment };
      },
    );

    this.logger.log(
      `Walk-in resident created: ${JSON.stringify(createWalkInDto)}`,
      'ResidentService',
    );
    this.logger.log(
      `Walk-in resident created: ${JSON.stringify(staffKuid)}`,
      'ResidentService',
    );

    return {
      message: 'Walk-in registered successfully',
      result: result,
    };
  }
}
