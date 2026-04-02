export const ResidentQueries = {
  INSERT_WALK_IN: `
    INSERT INTO residents (
      hostel_kuid, branch_no, room_kuid, bed_kuid,
      full_name, phone_number, email, cnic,
      emergency_contact_name, emergency_phone,
      room_type, check_in_date,
      monthly_rent, security_deposit, ac_charges,
      payment_mode, transaction_id, status
    ) VALUES (
      $1, $2, $3, $4,
      $5, $6, $7, $8,
      $9, $10,
      $11, $12,
      $13, $14, $15,
      $16, $17, 'ACTIVE'
    )
    RETURNING *
  `,

  FIND_BY_KUID: `
    SELECT * FROM residents WHERE kuid = $1
  `,
  INSERT_USER: `
    INSERT INTO "user" (full_name, phone,password, email, cnic_number) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING kuid
  `,
  INSERT_RESIDENT: `
  INSERT INTO "resident" (
    user_kuid, assigned_bed_kuid, type, 
    emergency_contact_1, 
    check_in_date
  )
  VALUES ($1, $2, $3, $4, $5)
  RETURNING kuid, user_kuid, assigned_bed_kuid, type, 
            emergency_contact_1, emergency_contact_2, 
            is_active, check_in_date, checkout_out_date, 
            created_at, updated_at
`,
  INSERT_RESIDENT_MONTHLY_RENT: `
INSERT INTO "resident_monthly_rent" (
    resident_kuid, rent_period, total_amount, due_date, status
  )
  VALUES ($1, $2, $3, $4, $5)
  RETURNING kuid, resident_kuid, rent_period, total_amount, 
            due_date, status, created_at, updated_at
`,
  INSERT_PAYMENT: `
  INSERT INTO payment (
    user_kuid, payment_type_kuid, payment_account_kuid,
    hostel_kuid, room_kuid, bed_kuid,
    amount,
    txn_reference, status, verification_status
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  RETURNING *
`,
  GET_RESIDENT_STATS: `
  SELECT
    COUNT(r.kuid)                                                        AS total_residents,
    COUNT(CASE WHEN r.type = 'WALK-IN' THEN 1 END)                      AS total_walk_in,
    COUNT(CASE WHEN r.type = 'ONLINE' THEN 1 END)                       AS total_online,
    COUNT(CASE WHEN rmr.status = 'PAID' THEN 1 END)                     AS rent_paid,
    COUNT(CASE WHEN rmr.status = 'PENDING' AND rmr.due_date < NOW() 
          THEN 1 END)                                                    AS rent_due
  FROM resident r
  LEFT JOIN resident_monthly_rent rmr ON rmr.resident_kuid = r.kuid
  WHERE r.is_active = true
`,
};
