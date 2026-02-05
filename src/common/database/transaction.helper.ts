import { Inject } from "@nestjs/common";
import { Pool, PoolClient } from "pg";

export class TransactionHelper {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async executeInTransaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
