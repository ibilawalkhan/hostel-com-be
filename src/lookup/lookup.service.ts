import { Injectable } from '@nestjs/common';
import { LookupRepository } from './lookup.repository';

@Injectable()
export class LookupService {
  constructor(private lookupRepository: LookupRepository) {}

  async getAllMetadata() {
    return this.lookupRepository.findAllMetadata();
  }
}
