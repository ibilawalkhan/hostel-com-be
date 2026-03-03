import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateBedDto } from './dto/update-bed.dto';
import { BedRepository } from './repository/bed.repository';
import { TransactionHelper } from '../common/database/transaction.helper';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class BedService {
  constructor(
    private readonly bedRepository: BedRepository,
    private readonly transactionHelper: TransactionHelper,
    private readonly logger: LoggerService,
  ) { }

  async update(bedKuid: string, dto: UpdateBedDto) {

    const updated = await this.transactionHelper.executeInTransaction(async (client) => {

      const bed = await this.bedRepository.findBedByKuid(client, bedKuid);

      if (!bed) {
        throw new NotFoundException('Bed not found');
      }

      const bedUpdates: { monthly_rent?: number | null; bed_occupied_enum?: 'OCCUPIED' | 'RESERVED' | 'AVAILABLE' } = {};

      if (dto.rent !== undefined) bedUpdates.monthly_rent = dto.rent;

      if (dto.status !== undefined) bedUpdates.bed_occupied_enum = dto.status;

      if (Object.keys(bedUpdates).length > 0) {
        await this.bedRepository.updateBed(client, bedKuid, bedUpdates);
      }

      if (dto.assigned_resident_kuid !== undefined) {

        await this.bedRepository.clearResidentsAssignedToBed(client, bedKuid);

        const residentKuid = dto.assigned_resident_kuid?.trim() || null;

        if (residentKuid) {

          const residentExists = await this.bedRepository.existsResidentByKuid(client, residentKuid);

          if (!residentExists) {
            throw new NotFoundException('Resident not found');
          }

          await this.bedRepository.setResidentAssignedBed(client, residentKuid, bedKuid);
        }
      }

      const bedAfter = await this.bedRepository.findBedByKuid(client, bedKuid);
      const resident_kuid = await this.bedRepository.getResidentKuidByAssignedBed(client, bedKuid);

      return { bed: bedAfter, resident_kuid };
    });

    this.logger.log(`Bed ${bedKuid} updated`, 'BedService');
    return { message: 'Bed updated successfully', bed: updated.bed, resident_kuid: updated.resident_kuid };
  }

}
