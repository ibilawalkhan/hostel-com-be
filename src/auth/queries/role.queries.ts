export const RoleQueries = {
  INSERT_ROLE: `
    INSERT INTO role (user_kuid, name, assigned_hostel_kuid, hostel_branch_kuid)
    VALUES ($1, $2, $3, $4)
    RETURNING kuid, user_kuid, assigned_hostel_kuid, hostel_branch_kuid, name, is_active, created_at, updated_at
  `,

  FIND_BY_USER_KUID: `
    SELECT kuid, user_kuid, assigned_hostel_kuid, hostel_branch_kuid, name, is_active, created_at, updated_at
    FROM role
    WHERE user_kuid = $1
    ORDER BY created_at DESC
  `,

  INSERT_ROLE_PERMISSION: `
    INSERT INTO role_permission (role_kuid, permission_kuid)
    VALUES ($1, $2)
    ON CONFLICT (role_kuid, permission_kuid) DO NOTHING
  `,

  FIND_PERMISSIONS_BY_ROLE_NAME: `
    SELECT p.kuid, p.permission_name, p.description
    FROM permission p
    INNER JOIN role_permission rp ON p.kuid = rp.permission_kuid
    INNER JOIN role r ON rp.role_kuid = r.kuid
    WHERE r.name = $1
  `,

  FIND_PERMISSIONS_BY_ROLE_KUID: `
    SELECT p.kuid, p.permission_name, p.description
    FROM permission p
    INNER JOIN role_permission rp ON p.kuid = rp.permission_kuid
    WHERE rp.role_kuid = $1
  `,
} as const;

