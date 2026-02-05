import { Injectable, Inject } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { User, UserWithPassword } from '../interfaces/user.interface';
import { UserQueries } from '../queries/auth.queries';

@Injectable()
export class UserRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async existsByEmail(email: string): Promise<boolean> {
    const result = await this.pool.query(UserQueries.IS_USER_EXISTS, [email]);
    return result.rows.length > 0;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(UserQueries.FIND_BY_EMAIL, [email]);
    return result.rows[0] || null;
  }

  async findByEmailWithPassword(
    email: string,
  ): Promise<UserWithPassword | null> {
    const result = await this.pool.query(
      UserQueries.FIND_BY_EMAIL_WITH_PASSWORD,
      [email],
    );
    return result.rows[0] || null;
  }

  async create(
    client: PoolClient,
    email: string,
    name: string,
    termsAccepted: boolean,
  ): Promise<User> {
    const result = await client.query(UserQueries.INSERT_USER, [
      email,
      name,
      termsAccepted,
    ]);

    return result.rows[0];
  }

  async markEmailVerified(userId: string): Promise<void> {
    await this.pool.query(UserQueries.UPDATE_EMAIL_VERIFIED, [userId]);
  }
}
