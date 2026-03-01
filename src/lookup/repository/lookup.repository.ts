import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { FacilityRow } from '../interfaces/metadata.interfaces';

@Injectable()
export class LookupRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async findComplaintCategories() {
    const result = await this.pool.query(
      `SELECT kuid, category_name FROM complaintcategory ORDER BY category_name`,
    );
    console.log("Categories result: ", result.rows)
    
    return result.rows;
  }

  async findComplaintPriorities() {
    const result = await this.pool.query(
      `SELECT kuid, priority_name FROM priority ORDER BY priority_name`,
    );
    console.log("Priorities result: ", result.rows)

    return result.rows;
  }

  async findPermissions() {
    const result = await this.pool.query(
      `SELECT kuid, permission_name, description FROM permission ORDER BY permission_name`,
    );
    console.log("Permissions result: ", result.rows)

    return result.rows;
  }

  async findFacilities() {
    const result = await this.pool.query(
      `SELECT kuid, name, icon, is_active, scope FROM facilities WHERE is_active = true ORDER BY name`,
    );
    console.log("Facilities result: ", result.rows)

    return result.rows;
  }

  async findPaymentTypes() {
    const result = await this.pool.query(
      `SELECT kuid, name, description FROM payment_type ORDER BY name`,
    );
    console.log("Payment Types result: ", result.rows)

    return result.rows;
  }

  async findAccountTypes() {
    const result = await this.pool.query(
      `SELECT kuid, name FROM account_type ORDER BY name`,
    );
    console.log("Account Types result: ", result.rows)

    return result.rows;
  }

  async findHostelsByOwner(ownerKuid: string) {
    const result = await this.pool.query(
      `SELECT kuid, name, country, city_kuid, area_kuid, full_address_text, gender_allowed, type
       FROM hostel
       WHERE owner_kuid = $1
       ORDER BY name`,
      [ownerKuid],
    );
    console.log("Hostels result: ", result.rows)

    return result.rows;
  }

  async findBranchesByHostelKuids(hostelKuids: string[]) {
    if (hostelKuids.length === 0) return [];

    const result = await this.pool.query(
      `SELECT kuid, hostel_kuid, branch_number
       FROM hostel_branch
       WHERE hostel_kuid = ANY($1)
       ORDER BY hostel_kuid, branch_number`,
      [hostelKuids],
    );
    console.log("Branches result: ", result.rows)

    return result.rows;
  }

  async fetchAllCities() {
    const result = await this.pool.query(
      `SELECT kuid, city_name
       FROM city
       ORDER BY city_name`,
    );
    console.log('Cities result: ', result.rows);

    return result.rows;
  }

  async fetchAllAreas() {
    const result = await this.pool.query(
      `SELECT kuid, area_name, city_kuid
       FROM area
       ORDER BY area_name`,
    );
    console.log('Areas result: ', result.rows);

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
