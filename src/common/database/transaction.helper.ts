import { Inject } from "@nestjs/common";
import { LoggerService } from "../services/logger.service";
import { Pool, PoolClient } from "pg";

export class TransactionHelper {
  constructor(@Inject('PG_POOL') private pool: Pool, private readonly logger: LoggerService) {}

  async executeInTransaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    this.logger.log('Executing transaction', 'TransactionHelper');
    const client = await this.pool.connect();

    try {
      this.logger.log('Beginning transaction', 'TransactionHelper');

      await client.query('BEGIN');
      const result = await callback(client);

      this.logger.log('Committing transaction', 'TransactionHelper');
      await client.query('COMMIT');

      this.logger.log('Transaction committed', 'TransactionHelper');
      return result;
    } catch (error) {
      this.logger.error(`Transaction failed: ${error.message}`, error.stack, 'TransactionHelper');

      await client.query('ROLLBACK');

      throw error;
    } finally {
      client.release();
    }
  }
}
