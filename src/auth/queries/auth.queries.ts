export const UserQueries = {
  IS_USER_EXISTS_BY_EMAIL: `
    SELECT 1 
    FROM "user" 
    WHERE email = $1
  `,

  IS_USER_EXISTS_BY_PHONE: `
    SELECT 1 
    FROM "user" 
    WHERE phone = $1
  `,

  IS_USER_EXISTS_BY_CNIC: `
    SELECT 1 
    FROM "user" 
    WHERE cnic_number = $1
  `,

  FIND_BY_EMAIL: `
    SELECT kuid, full_name, phone, email, cnic_number, cnic_front, cnic_back, selfie, is_active, created_at, updated_at
    FROM "user" 
    WHERE email = $1
  `,

  FIND_BY_PHONE: `
    SELECT kuid, full_name, phone, email, cnic_number, cnic_front, cnic_back, selfie, is_active, created_at, updated_at
    FROM "user" 
    WHERE phone = $1
  `,

  FIND_BY_EMAIL_WITH_PASSWORD: `
    SELECT 
      kuid, 
      full_name,
      phone,
      email, 
      cnic_number,
      cnic_front,
      cnic_back,
      selfie,
      is_active,
      password,
      created_at, 
      updated_at
    FROM "user"
    WHERE email = $1
  `,

  FIND_BY_PHONE_WITH_PASSWORD: `
    SELECT 
      kuid, 
      full_name,
      phone,
      email, 
      cnic_number,
      cnic_front,
      cnic_back,
      selfie,
      is_active,
      password,
      created_at, 
      updated_at
    FROM "user"
    WHERE phone = $1
  `,

  FIND_BY_KUID: `
    SELECT kuid, full_name, phone, email, cnic_number, cnic_front, cnic_back, selfie, is_active, created_at, updated_at
    FROM "user"
    WHERE kuid = $1
  `,

  FIND_BY_KUID_WITH_PASSWORD: `
    SELECT 
      kuid, 
      full_name,
      phone,
      email, 
      cnic_number,
      cnic_front,
      cnic_back,
      selfie,
      is_active,
      password,
      created_at, 
      updated_at
    FROM "user"
    WHERE kuid = $1
  `,

  UPDATE_WARDEN_VERIFICATION: `
    UPDATE "user"
    SET cnic_front = $1, cnic_back = $2, selfie = $3, updated_at = NOW()
    WHERE kuid = $4
    RETURNING kuid, full_name, phone, email, cnic_number, cnic_front, cnic_back, selfie, is_active, created_at, updated_at
  `,

  INSERT_USER: `
    INSERT INTO "user" (full_name, phone, email, password, cnic_number, cnic_front, cnic_back) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) 
    RETURNING kuid, full_name, phone, email, cnic_number, cnic_front, cnic_back, is_active, created_at, updated_at
  `,

  INSERT_USER_WITHOUT_CNIC: `
    INSERT INTO "user" (full_name, phone, email, password) 
    VALUES ($1, $2, $3, $4) 
    RETURNING kuid, full_name, phone, email, cnic_number, cnic_front, cnic_back, is_active, created_at, updated_at
  `,
} as const;

export const AuthAccountQueries = {
  INSERT_PASSWORD_AUTH: `
    INSERT INTO AUTH_Accounts (user_id, password_hash, provider) 
    VALUES ($1, $2, 'password')
  `,

  GET_AUTH_METHOD: `
    SELECT user_id, provider, created_at
    FROM AUTH_Accounts
    WHERE user_id = $1 AND provider = $2
  `,

  UPDATE_PASSWORD: `
    UPDATE AUTH_Accounts
    SET password_hash = $1, updated_at = NOW()
    WHERE user_id = $2 AND provider = 'password'
  `,
} as const;
