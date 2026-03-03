export const BedQueries = {
  FIND_BED_BY_KUID: `
    SELECT kuid, room_kuid, bed_no, monthly_rent, bed_photos_url, bed_occupied_enum, is_active, created_at, updated_at
    FROM bed
    WHERE kuid = $1
  `,

  SELECT_BED_BY_KUID: `
    SELECT * FROM bed WHERE kuid = $1
  `,

  CLEAR_RESIDENTS_ASSIGNED_TO_BED: `
    UPDATE resident SET assigned_bed_kuid = NULL, updated_at = NOW() WHERE assigned_bed_kuid = $1
  `,

  SET_RESIDENT_ASSIGNED_BED: `
    UPDATE resident SET assigned_bed_kuid = $1, updated_at = NOW() WHERE kuid = $2
  `,

  EXISTS_RESIDENT_BY_KUID: `
    SELECT 1 FROM resident WHERE kuid = $1 LIMIT 1
  `,

  GET_RESIDENT_KUID_BY_ASSIGNED_BED: `
    SELECT kuid FROM resident WHERE assigned_bed_kuid = $1 LIMIT 1
  `,
} as const;
