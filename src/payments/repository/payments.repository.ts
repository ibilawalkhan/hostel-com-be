import { Injectable, Inject } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { PaymentsQueries } from '../queries/payments.queries';
import {
  CreatePaymentInput,
  CreatePaymentAccountInput,
  PaymentFilters,
  PaymentAccountRow,
  PaymentRow,
  PaymentStats,
  UpdatePaymentReviewInput,
} from '../interface/payments.interface';

@Injectable()
export class PaymentsRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async createPaymentAccount(
    client: PoolClient,
    input: CreatePaymentAccountInput,
  ): Promise<PaymentAccountRow> {
    const result = await client.query(PaymentsQueries.INSERT_PAYMENT_ACCOUNT, [
      input.hostel_kuid ?? null,
      input.account_type_kuid,
      input.account_title,
      input.account_number,
      input.bank_name ?? null,
    ]);
    return result.rows[0] as PaymentAccountRow;
  }

  async findByKuid(
    client: PoolClient,
    paymentKuid: string,
  ): Promise<PaymentRow | null> {
    const result = await client.query(PaymentsQueries.FIND_PAYMENT_BY_KUID, [paymentKuid]);
    return (result.rows[0] as PaymentRow) || null;
  }

  async createPayment(
    client: PoolClient,
    input: CreatePaymentInput,
  ): Promise<PaymentRow> {
    const result = await client.query(PaymentsQueries.INSERT_PAYMENT, [
      input.user_kuid,
      input.payment_type_kuid,
      input.payment_account_kuid,
      input.hostel_kuid,
      input.room_kuid,
      input.bed_kuid,
      input.payment_method ?? null,
      input.amount,
      input.payment_attachment_url ?? null,
      input.txn_reference ?? null,
      input.status ?? 'PENDING',
      input.verification_status ?? 'UNDER-REVIEW',
    ]);
    return result.rows[0];
  }

  async findAllPayments(): Promise<PaymentRow[]> {
    const result = await this.pool.query(PaymentsQueries.GET_ALL_PAYMENTS);
    return result.rows;
  }

  async findPaymentsWithFilters(filters: PaymentFilters): Promise<PaymentRow[]> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (filters.user_kuid?.trim()) {
      conditions.push(`p.user_kuid = $${idx}`);
      values.push(filters.user_kuid.trim());
      idx += 1;
    }

    if (filters.hostel_kuid?.trim()) {
      conditions.push(`p.hostel_kuid = $${idx}`);
      values.push(filters.hostel_kuid.trim());
      idx += 1;
    }

    if (filters.room_kuid?.trim()) {
      conditions.push(`p.room_kuid = $${idx}`);
      values.push(filters.room_kuid.trim());
      idx += 1;
    }

    if (filters.bed_kuid?.trim()) {
      conditions.push(`p.bed_kuid = $${idx}`);
      values.push(filters.bed_kuid.trim());
      idx += 1;
    }

    if (filters.payment_type_kuid?.trim()) {
      conditions.push(`p.payment_type_kuid = $${idx}`);
      values.push(filters.payment_type_kuid.trim());
      idx += 1;
    }

    if (filters.payment_account_kuid?.trim()) {
      conditions.push(`p.payment_account_kuid = $${idx}`);
      values.push(filters.payment_account_kuid.trim());
      idx += 1;
    }

    if (filters.payment_method?.trim()) {
      conditions.push(`p.payment_method ILIKE $${idx}`);
      values.push(`%${filters.payment_method.trim()}%`);
      idx += 1;
    }

    if (filters.status) {
      conditions.push(`p.status = $${idx}`);
      values.push(filters.status);
      idx += 1;
    }

    if (filters.verification_status) {
      conditions.push(`p.verification_status = $${idx}`);
      values.push(filters.verification_status);
      idx += 1;
    }

    if (filters.min_amount !== undefined && filters.min_amount !== null) {
      conditions.push(`p.amount >= $${idx}`);
      values.push(filters.min_amount);
      idx += 1;
    }

    if (filters.max_amount !== undefined && filters.max_amount !== null) {
      conditions.push(`p.amount <= $${idx}`);
      values.push(filters.max_amount);
      idx += 1;
    }

    const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
    const query = `${PaymentsQueries.LIST_PAYMENTS_BASE.trim()}${whereClause} ORDER BY p.created_at DESC`;
    const result = await this.pool.query(query, values);
    return result.rows as PaymentRow[];
  }

  async updatePaymentReview(
    client: PoolClient,
    paymentKuid: string,
    updates: UpdatePaymentReviewInput,
  ): Promise<PaymentRow> {
    const sets: string[] = [
      'verification_status = $1',
      'reviewed_by_user_kuid = $2',
      'reviewed_at = $3',
      'rejection_reason = $4',
      'updated_at = NOW()',
    ];
    const values: unknown[] = [
      updates.verification_status,
      updates.reviewed_by_user_kuid,
      updates.reviewed_at,
      updates.rejection_reason,
    ];

    if (updates.status !== undefined) {
      sets.push(`status = $${values.length + 1}`);
      values.push(updates.status);
    }

    values.push(paymentKuid);

    const query = `
      UPDATE payment
      SET ${sets.join(', ')}
      WHERE kuid = $${values.length}
      RETURNING *
    `;
    const result = await client.query(query, values);
    return result.rows[0] as PaymentRow;
  }

  async getPaymentStats(): Promise<PaymentStats> {
    const result = await this.pool.query(PaymentsQueries.GET_PAYMENT_STATS);
    const row = result.rows[0] || {};
    return {
      total_revenue: Number(row.total_revenue ?? 0),
      pending_amount: Number(row.pending_amount ?? 0),
      overdue_amount: Number(row.overdue_amount ?? 0),
      successful_payments: Number(row.successful_payments ?? 0),
    };
  }
}