import { Injectable, NotFoundException } from '@nestjs/common';
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

  findAll() {
    return `This action returns all hostel`;
  }

  findOne(id: number) {
    return `This action returns a #${id} hostel`;
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

  remove(id: number) {
    return `This action removes a #${id} hostel`;
  }
}
