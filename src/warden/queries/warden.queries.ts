export const WardenQueries = {
  
  FIND_WARDENS_BY_OWNER_KUID: `
    SELECT
      u.kuid AS user_kuid,
      u.full_name,
      u.email,
      u.phone,
      u.is_active,
      u.created_at,
      r.kuid AS role_kuid,
      h.name AS hostel_name,
      hb.branch_number AS branch_number
    FROM "user" u
    INNER JOIN role r ON r.user_kuid = u.kuid AND r.name = 'WARDEN'
    INNER JOIN hostel h ON h.kuid = r.assigned_hostel_kuid AND h.owner_kuid = $1
    LEFT JOIN hostel_branch hb ON hb.kuid = r.hostel_branch_kuid
    ORDER BY u.created_at DESC
  `,

  FIND_PERMISSIONS_BY_ROLE_KUIDS: `
    SELECT rp.role_kuid, p.permission_name
    FROM role_permission rp
    INNER JOIN permission p ON p.kuid = rp.permission_kuid
    WHERE rp.role_kuid = ANY($1)
  `,

  FIND_WARDEN_BY_USER_KUID_AND_OWNER_KUID: `
    SELECT
      u.kuid AS user_kuid,
      u.full_name,
      u.email,
      u.phone,
      u.is_active,
      u.created_at,
      r.kuid AS role_kuid,
      h.name AS hostel_name,
      hb.branch_number AS branch_number
    FROM "user" u
    INNER JOIN role r ON r.user_kuid = u.kuid AND r.name = 'WARDEN'
    INNER JOIN hostel h ON h.kuid = r.assigned_hostel_kuid AND h.owner_kuid = $1
    LEFT JOIN hostel_branch hb ON hb.kuid = r.hostel_branch_kuid
    WHERE u.kuid = $2
    LIMIT 1
  `,
} as const;
