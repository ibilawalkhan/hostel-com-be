import { Injectable } from '@nestjs/common';
import { LookupRepository } from './lookup.repository';

@Injectable()
export class LookupService {
  constructor(private lookupRepository: LookupRepository) {}

  async getComplaintCategories() {
    return { categories: await this.lookupRepository.findComplaintCategories() };
  }

  async getComplaintPriorities() {
    return { priorities: await this.lookupRepository.findComplaintPriorities() };
  }

  async getFacilities() {
    return { facilities: await this.lookupRepository.findFacilities() };
  }

  async getPaymentTypes() {
    return { payment_types: await this.lookupRepository.findPaymentTypes() };
  }

  async getAccountTypes() {
    return { account_types: await this.lookupRepository.findAccountTypes() };
  }

  async getPermissions() {
    return { permissions: await this.lookupRepository.findPermissions() };
  }
}
