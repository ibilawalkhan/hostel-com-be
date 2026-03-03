export const LookupQueries = {
  FIND_COMPLAINT_CATEGORIES: `
    SELECT kuid, category_name FROM complaintcategory ORDER BY category_name
  `,

  FIND_COMPLAINT_PRIORITIES: `
    SELECT kuid, priority_name FROM priority ORDER BY priority_name
  `,

  FIND_PERMISSIONS: `
    SELECT kuid, permission_name, description FROM permission ORDER BY permission_name
  `,

  FIND_FACILITIES: `
    SELECT kuid, name, icon, is_active, scope FROM facilities WHERE is_active = true ORDER BY name
  `,

  FIND_PAYMENT_TYPES: `
    SELECT kuid, name, description FROM payment_type ORDER BY name
  `,

  FIND_ACCOUNT_TYPES: `
    SELECT kuid, name FROM account_type ORDER BY name
  `,

  FIND_HOSTELS_BY_OWNER: `
    SELECT kuid, name, country, city_kuid, area_kuid, full_address_text, gender_allowed, type
    FROM hostel
    WHERE owner_kuid = $1
    ORDER BY name
  `,

  FIND_BRANCHES_BY_HOSTEL_KUIDS: `
    SELECT kuid, hostel_kuid, branch_number
    FROM hostel_branch
    WHERE hostel_kuid = ANY($1)
    ORDER BY hostel_kuid, branch_number
  `,

  FETCH_ALL_CITIES: `
    SELECT kuid, city_name
    FROM city
    ORDER BY city_name
  `,

  FETCH_ALL_AREAS: `
    SELECT kuid, area_name, city_kuid
    FROM area
    ORDER BY area_name
  `,
} as const;
