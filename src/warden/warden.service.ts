import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../auth/repositories/user.repository';
import { RoleRepository } from '../auth/repositories/role.repository';
import { PasswordService } from '../common/services/password.service';
import { LoggerService } from '../common/services/logger.service';
import { TransactionHelper } from '../common/database/transaction.helper';
import { validateUserUniqueness } from '../auth/helper/validation.helper';
import { handleSignupError } from '../auth/helper/error.helper';
import type { AddNewWardenDto } from '../auth/dto/auth.dto';
import { WardenRepository } from './repository/warden.repository';
import type { WardenListItem } from './interfaces/warden-list-item.interface';
import type { UpdateWardenDto } from './dto/update-warden.dto';

@Injectable()
export class WardenService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly wardenRepository: WardenRepository,
    private readonly passwordService: PasswordService,
    private readonly logger: LoggerService,
    private readonly transactionHelper: TransactionHelper,
  ) { }

  async addNewWarden(data: AddNewWardenDto) {
    const {
      full_name,
      phone_number,
      assigned_hostel,
      assigned_branch,
      permission_kuids,
    } = data;

    await validateUserUniqueness(
      this.userRepository,
      this.logger,
      phone_number,
      null,
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
            null,
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
        'WardenService',
      );

      const roleRow = result.role as { assigned_hostel_kuid?: string; hostel_branch_kuid?: string };

      return {
        message: 'Warden created successfully',
        user: {
          kuid: result.user.kuid,
          full_name: result.user.full_name,
          phone: result.user.phone,
          email: result.user.email,
          role: result.role.name,
          assigned_hostel: roleRow.assigned_hostel_kuid ?? (result.role as { assigned_hostel?: string }).assigned_hostel,
          assigned_branch: roleRow.hostel_branch_kuid ?? (result.role as { hostel_branch?: string }).hostel_branch,
        },
        temporary_password: result.temporaryPassword,
        permissions_assigned: permission_kuids.length,
      };

    } catch (error) {
      handleSignupError(error, phone_number, this.logger);
    }
  }

  async getWardenList(ownerKuid: string): Promise<{
    wardens: WardenListItem[];
    total_wardens: number;
    active_wardens: number;
  }> {
    const rows = await this.wardenRepository.findWardensByOwnerKuid(ownerKuid);

    const roleKuids = [...new Set(rows.map((r) => r.role_kuid))];

    const permissionRows = await this.wardenRepository.findPermissionsByRoleKuids(roleKuids);

    const permissionsByRole = permissionRows.reduce<Record<string, string[]>>(
      (acc, { role_kuid, permission_name }) => {
        if (!acc[role_kuid]) acc[role_kuid] = [];
        acc[role_kuid].push(permission_name);
        return acc;
      },
      {},
    );

    const wardens: WardenListItem[] = rows.map((r) => ({
      kuid: r.user_kuid,
      name: r.full_name,
      status: r.is_active ? 'active' : 'inactive',
      email: r.email ?? null,
      phone: r.phone,
      assigned_hostel_name: r.hostel_name,
      branch: r.branch_number ?? null,
      permissions: permissionsByRole[r.role_kuid] ?? [],
      created_at: r.created_at.toISOString(),
    }));

    const total_wardens = wardens.length;
    const active_wardens = wardens.filter((w) => w.status === 'active').length;

    return { total_wardens, active_wardens, wardens };
  }

  async editWarden(wardenUserKuid: string, ownerKuid: string, dto: UpdateWardenDto) {
    const warden = await this.wardenRepository.findWardenByUserKuidAndOwnerKuid(
      ownerKuid,
      wardenUserKuid,
    );
    if (!warden) {
      throw new NotFoundException('Warden not found');
    }

    if (dto.phone_number !== undefined && dto.phone_number.trim() !== '') {
      const existing = await this.userRepository.findByPhone(dto.phone_number.trim());
      if (existing && existing.kuid !== wardenUserKuid) {
        throw new ConflictException('Phone number already in use');
      }
    }

    await this.transactionHelper.executeInTransaction(async (client) => {
      if (dto.full_name !== undefined || dto.phone_number !== undefined) {
        await this.userRepository.updateProfile(client, wardenUserKuid, {
          full_name: dto.full_name ?? undefined,
          phone: dto.phone_number ?? undefined,
        });
      }
      if (
        dto.assigned_hostel !== undefined ||
        dto.assigned_branch !== undefined
      ) {
        await this.roleRepository.updateWardenAssignment(client, warden.role_kuid, {
          assigned_hostel_kuid: dto.assigned_hostel ?? undefined,
          hostel_branch_kuid: dto.assigned_branch ?? undefined,
        });
      }
      if (dto.permission_kuids !== undefined) {
        await this.roleRepository.deletePermissionsByRoleKuid(client, warden.role_kuid);
        if (dto.permission_kuids.length > 0) {
          await this.roleRepository.assignPermissions(
            client,
            warden.role_kuid,
            dto.permission_kuids,
          );
        }
      }
    });

    this.logger.log(`Warden ${wardenUserKuid} updated by owner ${ownerKuid}`, 'WardenService');
    return {
      message: 'Warden updated successfully',
      user_kuid: wardenUserKuid,
    };
  }

  async deleteWarden(wardenUserKuid: string, ownerKuid: string) {
    const warden = await this.wardenRepository.findWardenByUserKuidAndOwnerKuid(
      ownerKuid,
      wardenUserKuid,
    );
    if (!warden) {
      throw new NotFoundException('Warden not found');
    }

    await this.transactionHelper.executeInTransaction(async (client) => {
      await this.roleRepository.deletePermissionsByRoleKuid(client, warden.role_kuid);
      await this.roleRepository.deleteByKuid(client, warden.role_kuid);
      await this.roleRepository.deleteUserByKuid(client, wardenUserKuid);
    });

    this.logger.log(`Warden ${wardenUserKuid} removed by owner ${ownerKuid}`, 'WardenService');
    return {
      message: 'Warden deleted successfully',
      user_kuid: wardenUserKuid,
    };
  }
}
