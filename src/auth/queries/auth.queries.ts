export const UserQueries = {
  IS_USER_EXISTS: `
    SELECT 1 
    FROM USERS 
    WHERE email = $1
  `,

  FIND_BY_EMAIL: `
    SELECT kuid, email, name, terms_accepted, email_verified, created_at, updated_at
    FROM USERS 
    WHERE email = $1
  `,

  FIND_BY_EMAIL_WITH_PASSWORD: `
    SELECT 
      u.kuid, 
      u.email, 
      u.name, 
      u.terms_accepted, 
      u.email_verified,
      u.created_at, 
      u.updated_at, 
      a.password_hash
    FROM USERS u
    INNER JOIN AUTH_Accounts a ON u.kuid = a.user_id
    WHERE u.email = $1 AND a.provider = 'password'
  `,

  INSERT_USER: `
    INSERT INTO USERS (email, name, terms_accepted, email_verified) 
    VALUES ($1, $2, $3, false) 
    RETURNING kuid, email, name, terms_accepted, email_verified, created_at, updated_at
  `,

  UPDATE_EMAIL_VERIFIED: `
    UPDATE USERS 
    SET email_verified = true, updated_at = NOW()
    WHERE kuid = $1
    RETURNING kuid, email, email_verified
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
