export const PaymentsQueries = {
  FIND_PAYMENT_BY_KUID: `
    SELECT * FROM payment WHERE kuid = $1
  `,

  LIST_PAYMENTS_BASE: `
    SELECT * FROM payment
  `,

  INSERT_PAYMENT: `
    INSERT INTO payment (
      user_kuid,
      payment_type_kuid,
      payment_account_kuid,
      hostel_kuid,
      room_kuid,
      bed_kuid,
      payment_method,
      amount,
      payment_attachment_url,
      txn_reference,
      status,
      verification_status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, 'PENDING'), $12)
    RETURNING *
  `,

  INSERT_PAYMENT_ACCOUNT: `
    INSERT INTO payment_account (
      hostel_kuid,
      account_type_kuid,
      account_title,
      account_number,
      bank_name
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,

  GET_ALL_PAYMENTS: `
    SELECT * FROM payment
  `,

  GET_PAYMENT_STATS: `
    SELECT
      COALESCE(SUM(amount) FILTER (WHERE status = 'COMPLETED'), 0) AS total_revenue,
      COALESCE(SUM(amount) FILTER (WHERE status = 'PENDING'), 0) AS pending_amount,
      COALESCE(SUM(amount) FILTER (WHERE status = 'FAILED'), 0) AS overdue_amount,
      COALESCE(COUNT(*) FILTER (WHERE status = 'COMPLETED'), 0)::int AS successful_payments
    FROM payment
  `,
};