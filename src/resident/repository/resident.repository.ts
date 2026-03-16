import { Injectable, Inject } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { CreateWalkInDto } from '../dto/create-walk-in.dto';
import {
  PaymentRow,
  ResidentMonthlyRentRow,
  ResidentRow,
  WalkInRow,
} from '../interface/resident.interface';
import { ResidentQueries } from '../queries/resident.queries';

@Injectable()
export class ResidentRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async createUser(
    client: PoolClient,
    full_name: string,
    phone_number: string,
    password: string,
    email: string | null,
    cnic: string,
  ): Promise<{ kuid: string }> {
    const result = await client.query(ResidentQueries.INSERT_USER, [
      full_name,
      phone_number,
      password,
      email ?? null,
      cnic,
    ]);
    return result.rows[0];
  }

  async createResident(
    client: PoolClient,
    userKuid: string,
    dto: CreateWalkInDto,
  ): Promise<ResidentRow> {
    // 👇 check lengths
    console.log({
      userKuid: `${userKuid} (${userKuid.length})`,
      bed_kuid: `${dto.bed_kuid} (${dto.bed_kuid.length})`,
      room_type: `${dto.room_type} (${dto.room_type.length})`,
      emergency_contact_name: `${dto.emergency_contact_name} (${dto.emergency_contact_name.length})`,
      check_in_date: `${dto.check_in_date} (${dto.check_in_date.length})`,
    });

    const result = await client.query(ResidentQueries.INSERT_RESIDENT, [
      userKuid,
      dto.bed_kuid,
      dto.resident_type,
      dto.emergency_contact_name,
      dto.check_in_date,
    ]);
    return result.rows[0];
  }

  async createMonthlyRent(
    client: PoolClient,
    residentKuid: string,
    dto: CreateWalkInDto,
  ): Promise<ResidentMonthlyRentRow> {
    const rentPeriod = new Date(dto.check_in_date).toISOString().slice(0, 7); // 👈 '2026-03'
    const dueDate = new Date(dto.check_in_date);
    dueDate.setDate(5);

    const totalAmount = dto.monthly_rent + (dto.ac_charges ?? 0);

    const result = await client.query(
      ResidentQueries.INSERT_RESIDENT_MONTHLY_RENT,
      [
        residentKuid,
        rentPeriod, // 👈 now '2026-03' (7 chars)
        totalAmount,
        dueDate,
        'PENDING',
      ],
    );
    return result.rows[0];
  }
  async createPayment(
    client: PoolClient,
    userKuid: string,
    residentKuid: string,
    dto: CreateWalkInDto,
  ): Promise<PaymentRow> {
    const bedKuid = dto.bed_kuid.replace(/-/g, '');
    const roomKuid = dto.room_kuid.replace(/-/g, '');

    const totalAmount =
      dto.monthly_rent + (dto.security_deposit ?? 0) + (dto.ac_charges ?? 0);

    const result = await client.query(ResidentQueries.INSERT_PAYMENT, [
      userKuid,
      dto.payment_type_kuid,
      dto.payment_account_kuid ?? null,
      dto.hostel_kuid,
      roomKuid,
      bedKuid,
      // dto.payment_mode,
      totalAmount,
      dto.transaction_id ?? null,
      'PENDING',
      'UNDER-REVIEW',
    ]);
    return result.rows[0];
  }
}
