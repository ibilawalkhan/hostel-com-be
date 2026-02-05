import { PoolClient } from 'pg';
import { AuthAccountQueries } from '../queries/auth.queries';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthMethodRepository {
  async createPasswordAuth(
    client: PoolClient,
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await client.query(AuthAccountQueries.INSERT_PASSWORD_AUTH, [
      userId,
      passwordHash,
    ]);
  }

  async updatePassword(
    client: PoolClient,
    userId: string,
    newPasswordHash: string,
  ): Promise<void> {
    await client.query(AuthAccountQueries.UPDATE_PASSWORD, [
      newPasswordHash,
      userId,
    ]);
  }
}
