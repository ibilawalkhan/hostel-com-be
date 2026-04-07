export const PaymentsQueries = {
  FIND_PAYMENT_BY_KUID: `
    SELECT
      p.*,
      json_build_object(
        'kuid', u.kuid,
        'full_name', u.full_name,
        'email', u.email,
        'phone', u.phone
      ) AS user,
      json_build_object(
        'kuid', pt.kuid,
        'name', pt.name,
        'description', pt.description
      ) AS payment_type,
      json_build_object(
        'kuid', pa.kuid,
        'hostel_kuid', pa.hostel_kuid,
        'account_type_kuid', pa.account_type_kuid,
        'account_title', pa.account_title,
        'account_number', pa.account_number,
        'bank_name', pa.bank_name,
        'is_active', pa.is_active
      ) AS payment_account,
      json_build_object(
        'kuid', h.kuid,
        'name', h.name
      ) AS hostel,
      json_build_object(
        'kuid', r.kuid,
        'room_no', r.room_no,
        'floor_no', r.floor_no,
        'room_type', r.room_type
      ) AS room,
      json_build_object(
        'kuid', b.kuid,
        'bed_no', b.bed_no,
        'monthly_rent', b.monthly_rent,
        'bed_occupied_enum', b.bed_occupied_enum
      ) AS bed,
      CASE
        WHEN reviewer.kuid IS NULL THEN NULL
        ELSE json_build_object(
          'kuid', reviewer.kuid,
          'full_name', reviewer.full_name,
          'email', reviewer.email,
          'phone', reviewer.phone
        )
      END AS reviewer
    FROM payment p
    LEFT JOIN "user" u ON p.user_kuid = u.kuid
    LEFT JOIN payment_type pt ON p.payment_type_kuid = pt.kuid
    LEFT JOIN payment_account pa ON p.payment_account_kuid = pa.kuid
    LEFT JOIN hostel h ON p.hostel_kuid = h.kuid
    LEFT JOIN room r ON p.room_kuid = r.kuid
    LEFT JOIN bed b ON p.bed_kuid = b.kuid
    LEFT JOIN "user" reviewer ON p.reviewed_by_user_kuid = reviewer.kuid
    WHERE p.kuid = $1
  `,

  LIST_PAYMENTS_BASE: `
    SELECT
      p.*,
      json_build_object(
        'kuid', u.kuid,
        'full_name', u.full_name,
        'email', u.email,
        'phone', u.phone
      ) AS user,
      json_build_object(
        'kuid', pt.kuid,
        'name', pt.name,
        'description', pt.description
      ) AS payment_type,
      json_build_object(
        'kuid', pa.kuid,
        'hostel_kuid', pa.hostel_kuid,
        'account_type_kuid', pa.account_type_kuid,
        'account_title', pa.account_title,
        'account_number', pa.account_number,
        'bank_name', pa.bank_name,
        'is_active', pa.is_active
      ) AS payment_account,
      json_build_object(
        'kuid', h.kuid,
        'name', h.name
      ) AS hostel,
      json_build_object(
        'kuid', r.kuid,
        'room_no', r.room_no,
        'floor_no', r.floor_no,
        'room_type', r.room_type
      ) AS room,
      json_build_object(
        'kuid', b.kuid,
        'bed_no', b.bed_no,
        'monthly_rent', b.monthly_rent,
        'bed_occupied_enum', b.bed_occupied_enum
      ) AS bed,
      CASE
        WHEN reviewer.kuid IS NULL THEN NULL
        ELSE json_build_object(
          'kuid', reviewer.kuid,
          'full_name', reviewer.full_name,
          'email', reviewer.email,
          'phone', reviewer.phone
        )
      END AS reviewer
    FROM payment p
    LEFT JOIN "user" u ON p.user_kuid = u.kuid
    LEFT JOIN payment_type pt ON p.payment_type_kuid = pt.kuid
    LEFT JOIN payment_account pa ON p.payment_account_kuid = pa.kuid
    LEFT JOIN hostel h ON p.hostel_kuid = h.kuid
    LEFT JOIN room r ON p.room_kuid = r.kuid
    LEFT JOIN bed b ON p.bed_kuid = b.kuid
    LEFT JOIN "user" reviewer ON p.reviewed_by_user_kuid = reviewer.kuid
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
    SELECT
      p.*,
      json_build_object(
        'kuid', u.kuid,
        'full_name', u.full_name,
        'email', u.email,
        'phone', u.phone
      ) AS user,
      json_build_object(
        'kuid', pt.kuid,
        'name', pt.name,
        'description', pt.description
      ) AS payment_type,
      json_build_object(
        'kuid', pa.kuid,
        'hostel_kuid', pa.hostel_kuid,
        'account_type_kuid', pa.account_type_kuid,
        'account_title', pa.account_title,
        'account_number', pa.account_number,
        'bank_name', pa.bank_name,
        'is_active', pa.is_active
      ) AS payment_account,
      json_build_object(
        'kuid', h.kuid,
        'name', h.name
      ) AS hostel,
      json_build_object(
        'kuid', r.kuid,
        'room_no', r.room_no,
        'floor_no', r.floor_no,
        'room_type', r.room_type
      ) AS room,
      json_build_object(
        'kuid', b.kuid,
        'bed_no', b.bed_no,
        'monthly_rent', b.monthly_rent,
        'bed_occupied_enum', b.bed_occupied_enum
      ) AS bed,
      CASE
        WHEN reviewer.kuid IS NULL THEN NULL
        ELSE json_build_object(
          'kuid', reviewer.kuid,
          'full_name', reviewer.full_name,
          'email', reviewer.email,
          'phone', reviewer.phone
        )
      END AS reviewer
    FROM payment p
    LEFT JOIN "user" u ON p.user_kuid = u.kuid
    LEFT JOIN payment_type pt ON p.payment_type_kuid = pt.kuid
    LEFT JOIN payment_account pa ON p.payment_account_kuid = pa.kuid
    LEFT JOIN hostel h ON p.hostel_kuid = h.kuid
    LEFT JOIN room r ON p.room_kuid = r.kuid
    LEFT JOIN bed b ON p.bed_kuid = b.kuid
    LEFT JOIN "user" reviewer ON p.reviewed_by_user_kuid = reviewer.kuid
    ORDER BY p.created_at DESC
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