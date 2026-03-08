import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { UpdateHostelDto } from './dto/update-hostel.dto';
import { HostelRepository } from './repository/hostel.repository';
import { TransactionHelper } from '../common/database/transaction.helper';
import { LoggerService } from '../common/services/logger.service';

@Injectable()
export class HostelService {
  constructor(
    private readonly hostelRepository: HostelRepository,
    private readonly transactionHelper: TransactionHelper,
    private readonly logger: LoggerService,
  ) {}

  async create(createHostelDto: CreateHostelDto, ownerKuid: string) {
    const { facilities, branch_no } = createHostelDto;

    const result = await this.transactionHelper.executeInTransaction(
      async (client) => {
        const hostel = await this.hostelRepository.createHostel(
          client,
          ownerKuid,
          createHostelDto,
        );

        await this.hostelRepository.createHostelBranch(
          client,
          hostel.kuid,
          branch_no,
        );

        await this.hostelRepository.addHostelFacilities(
          client,
          hostel.kuid,
          facilities,
        );

        return hostel;
      },
    );

    this.logger.log(
      `Hostel created successfully: ${result.kuid}`,
      'HostelService',
    );

    return {
      message: 'Hostel created successfully',
      hostel: result,
    };
  }

  async listAllHostels() {
    return this.hostelRepository.listAllHostels();
  }

  async searchHostels(params: { name?: string; branch?: string }) {
    return this.hostelRepository.searchHostels(params);
  }

  async getHostelStats(ownerKuid: string) {
    return this.hostelRepository.getHostelStats(ownerKuid);
  }

  async applyFilters(params: {
    hostel_kuid?: string;
    branch_kuid?: string;
    room_type?: string;
    status?: string;
    floor_no?: string;
    min_price?: number;
    max_price?: number;
    availability?: string;
    room_kuid?: string;
  }) {
    return this.hostelRepository.findRoomsWithFilters(params);
  }

  async update(
    hostelKuid: string,
    updateHostelDto: UpdateHostelDto,
  ) {
    const { facilities, branch_no } = updateHostelDto;

    const result = await this.transactionHelper.executeInTransaction(
      async (client) => {
        const existing = await this.hostelRepository.findByKuid(
          client,
          hostelKuid,
        );

        if (!existing) {
          throw new NotFoundException('Hostel not found');
        }

        const updatedHostel = await this.hostelRepository.updateHostel(
          client,
          existing,
          updateHostelDto,
        );

        await this.hostelRepository.upsertHostelBranch(
          client,
          hostelKuid,
          branch_no,
        );

        await this.hostelRepository.replaceHostelFacilities(
          client,
          hostelKuid,
          facilities,
        );

        return updatedHostel;
      },
    );

    this.logger.log(
      `Hostel updated successfully: ${result.kuid}`,
      'HostelService',
    );

    return {
      message: 'Hostel updated successfully',
      hostel: result,
    };
  }

  async deleteHostel(hostelKuid: string, ownerKuid: string) {

    await this.transactionHelper.executeInTransaction(async (client) => {

      const hostel = await this.hostelRepository.findByKuid(client, hostelKuid);
      if (!hostel) {
        throw new NotFoundException('Hostel not found');
      }

      if (hostel.owner_kuid !== ownerKuid) {
        throw new ForbiddenException('Only the owner can delete this hostel');
      }

      await this.hostelRepository.deleteHostel(client, hostelKuid);
    });

    this.logger.log(`Hostel ${hostelKuid} deleted by owner ${ownerKuid}`, 'HostelService');

    return {
      message: 'Hostel deleted successfully',
      hostel_kuid: hostelKuid,
    };
    
  }
}
