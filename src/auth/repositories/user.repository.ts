import { Injectable, Inject } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { User, UserWithPassword } from '../interfaces/user.interface';
import { UserQueries } from '../queries/auth.queries';

@Injectable()
export class UserRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async existsByEmail(email: string): Promise<boolean> {
    if (!email) return false;
    const result = await this.pool.query(UserQueries.IS_USER_EXISTS_BY_EMAIL, [email]);
    return result.rows.length > 0;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    const result = await this.pool.query(UserQueries.IS_USER_EXISTS_BY_PHONE, [phone]);
    return result.rows.length > 0;
  }

  async existsByCnic(cnicNumber: string): Promise<boolean> {
    const result = await this.pool.query(UserQueries.IS_USER_EXISTS_BY_CNIC, [cnicNumber]);
    return result.rows.length > 0;
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email) return null;
    const result = await this.pool.query(UserQueries.FIND_BY_EMAIL, [email]);
    return result.rows[0] || null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const result = await this.pool.query(UserQueries.FIND_BY_PHONE, [phone]);
    return result.rows[0] || null;
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<UserWithPassword | null> {
    if (!email) return null;
    const result = await this.pool.query(
      UserQueries.FIND_BY_EMAIL_WITH_PASSWORD,
      [email],
    );
    return result.rows[0] || null;
  }

  async findByPhoneWithPassword(
    phone: string,
  ): Promise<UserWithPassword | null> {
    const result = await this.pool.query(
      UserQueries.FIND_BY_PHONE_WITH_PASSWORD,
      [phone],
    );
    return result.rows[0] || null;
  }

  async findByKuid(kuid: string): Promise<User | null> {
    const result = await this.pool.query(UserQueries.FIND_BY_KUID, [kuid]);
    return result.rows[0] || null;
  }

  async findByKuidWithPassword(
    kuid: string,
  ): Promise<UserWithPassword | null> {
    const result = await this.pool.query(
      UserQueries.FIND_BY_KUID_WITH_PASSWORD,
      [kuid],
    );
    return result.rows[0] || null;
  }

  async create(
    client: PoolClient,
    fullName: string,
    phone: string,
    email: string | null,
    passwordHash: string,
    cnicNumber?: string | null,
    cnicFront?: string | null,
    cnicBack?: string | null,
  ): Promise<User> {
    // If CNIC fields are provided, use the full INSERT query
    if (cnicNumber && cnicFront && cnicBack) {
      const result = await client.query(UserQueries.INSERT_USER, [
        fullName,
        phone,
        email,
        passwordHash,
        cnicNumber,
        cnicFront,
        cnicBack,
      ]);
      return result.rows[0];
    }

    // Otherwise, use the query without CNIC fields
    const result = await client.query(UserQueries.INSERT_USER_WITHOUT_CNIC, [
      fullName,
      phone,
      email,
      passwordHash,
    ]);

    return result.rows[0];
  }

  async updateWardenVerification(
    client: PoolClient,
    userKuid: string,
    cnicFront: string,
    cnicBack: string,
    selfie: string,
  ): Promise<User> {
    const result = await client.query(UserQueries.UPDATE_WARDEN_VERIFICATION, [
      cnicFront,
      cnicBack,
      selfie,
      userKuid,
    ]);
    return result.rows[0];
  }
}
