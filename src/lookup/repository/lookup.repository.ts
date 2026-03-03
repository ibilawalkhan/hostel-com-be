import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { FacilityRow } from '../interfaces/metadata.interfaces';
import { LookupQueries } from '../queries/lookup.queries';

@Injectable()
export class LookupRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findComplaintCategories() {
    const result = await this.pool.query(LookupQueries.FIND_COMPLAINT_CATEGORIES);
    return result.rows;
  }

  async findComplaintPriorities() {
    const result = await this.pool.query(LookupQueries.FIND_COMPLAINT_PRIORITIES);
    return result.rows;
  }

  async findPermissions() {
    const result = await this.pool.query(LookupQueries.FIND_PERMISSIONS);
    return result.rows;
  }

  async findFacilities() {
    const result = await this.pool.query(LookupQueries.FIND_FACILITIES);
    return result.rows;
  }

  async findPaymentTypes() {
    const result = await this.pool.query(LookupQueries.FIND_PAYMENT_TYPES);
    return result.rows;
  }

  async findAccountTypes() {
    const result = await this.pool.query(LookupQueries.FIND_ACCOUNT_TYPES);
    return result.rows;
  }

  async findHostelsByOwner(ownerKuid: string) {
    const result = await this.pool.query(LookupQueries.FIND_HOSTELS_BY_OWNER, [ownerKuid]);
    return result.rows;
  }

  async findBranchesByHostelKuids(hostelKuids: string[]) {
    if (hostelKuids.length === 0) return [];
    const result = await this.pool.query(LookupQueries.FIND_BRANCHES_BY_HOSTEL_KUIDS, [hostelKuids]);
    return result.rows;
  }

  async fetchAllCities() {
    const result = await this.pool.query(LookupQueries.FETCH_ALL_CITIES);
    return result.rows;
  }

  async fetchAllAreas() {
    const result = await this.pool.query(LookupQueries.FETCH_ALL_AREAS);
    return result.rows;
  }

  async findAllMetadata(ownerKuid: string) {
    const [
      categories,
      priorities,
      permissions,
      facilities,
      paymentTypes,
      accountTypes,
      hostels,
      cities,
      areas
    ] = await Promise.all([
      this.findComplaintCategories(),
      this.findComplaintPriorities(),
      this.findPermissions(),
      this.findFacilities(),
      this.findPaymentTypes(),
      this.findAccountTypes(),
      this.findHostelsByOwner(ownerKuid),
      this.fetchAllCities(),
      this.fetchAllAreas(),
    ]);

    const hostelKuids = hostels.map((h) => h.kuid);
    const branches = await this.findBranchesByHostelKuids(hostelKuids);

    const hostelsWithBranches = hostels.map((hostel) => ({
      ...hostel,
      branches: branches.filter((b) => b.hostel_kuid === hostel.kuid),
    }));

    const hostelFacilities: FacilityRow[] = [];
    const roomFacilities: FacilityRow[] = [];
    const washroomFacilities: FacilityRow[] = [];

    for (const facility of facilities as FacilityRow[]) {
      if (facility.scope === 'hostel') {
        hostelFacilities.push(facility);
      } else if (facility.scope === 'room') {
        roomFacilities.push(facility);
      } else if (facility.scope === 'washroom') {
        washroomFacilities.push(facility);
      }
    }

    return {
      categories,
      priorities,
      permissions,
      hostel_facilities: hostelFacilities,
      room_facilities: roomFacilities,
      washroom_facilities: washroomFacilities,
      cities,
      areas,
      payment_types: paymentTypes,
      account_types: accountTypes,
      hostels: hostelsWithBranches,
    };
  }
}
