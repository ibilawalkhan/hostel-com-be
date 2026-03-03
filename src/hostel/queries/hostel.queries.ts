export const HostelQueries = {
  FIND_BY_KUID: `SELECT * FROM hostel WHERE kuid = $1`,

  INSERT_HOSTEL: `
    INSERT INTO hostel (owner_kuid, name,
      city_kuid, area_kuid, full_address_text, latitude, longitude, near_by, gender_allowed, type, visitor_policy, smoking, admission_photos_url, reception_photos_url, mess_area_photos_url, parking_type, security_deposit, admission_fee)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
    RETURNING *
  `,

  INSERT_HOSTEL_BRANCH: `
    INSERT INTO hostel_branch (hostel_kuid, branch_number)
    VALUES ($1, $2)
  `,

  SELECT_HOSTEL_BRANCH: `
    SELECT kuid, branch_number FROM hostel_branch WHERE hostel_kuid = $1 LIMIT 1
  `,

  UPDATE_HOSTEL_BRANCH: `
    UPDATE hostel_branch SET branch_number = $1 WHERE hostel_kuid = $2
  `,

  INSERT_HOSTEL_FACILITY: `
    INSERT INTO hostel_facility (hostel_kuid, facility_kuid)VALUES ($1, $2) ON CONFLICT (hostel_kuid, facility_kuid) DO NOTHING
  `,

  FIND_FACILITY_KUIDS_BY_HOSTEL: `
    SELECT facility_kuid FROM hostel_facility WHERE hostel_kuid = $1
  `,

  DELETE_HOSTEL_FACILITIES: `
    DELETE FROM hostel_facility WHERE hostel_kuid = $1
  `,

  LIST_HOSTELS_BODY: `
    SELECT
      h.name AS hostel_name,
      h.status,
      h.verification_badge,
      (SELECT hb.branch_number FROM hostel_branch hb WHERE hb.hostel_kuid = h.kuid LIMIT 1) AS branch_no,
      h.full_address_text AS address,
      COALESCE(room_bed.total_rooms, 0)::int AS total_rooms,
      COALESCE(room_bed.total_beds, 0)::int AS total_beds,
      CASE
        WHEN COALESCE(room_bed.total_beds, 0) > 0
        THEN ROUND(100.0 * room_bed.occupied_beds / room_bed.total_beds, 2)
        ELSE 0
      END AS total_occupancy,
      warden.warden_name
    FROM hostel h
    LEFT JOIN LATERAL (
      SELECT
        count(DISTINCT r.kuid)::int AS total_rooms,
        count(b.kuid)::int AS total_beds,
        count(b.kuid) FILTER (WHERE b.bed_occupied_enum = 'OCCUPIED')::int AS occupied_beds
      FROM room r
      LEFT JOIN bed b ON b.room_kuid = r.kuid AND b.is_active = true
      WHERE r.hostel_kuid = h.kuid AND r.is_active = true
    ) room_bed ON true
    LEFT JOIN LATERAL (
      SELECT u.full_name AS warden_name
      FROM role r
      JOIN "user" u ON u.kuid = r.user_kuid
      WHERE r.assigned_hostel_kuid = h.kuid AND r.name = 'WARDEN' AND r.is_active = true
      LIMIT 1
    ) warden ON true
  `,

  GET_HOSTEL_STATS: `
    SELECT
      count(DISTINCT h.kuid)::int AS total_hostels,
      count(DISTINCT r.kuid)::int AS total_rooms,
      count(b.kuid)::int AS total_beds,
      CASE
        WHEN count(b.kuid) > 0
        THEN ROUND(100.0 * count(b.kuid) FILTER (WHERE b.bed_occupied_enum = 'OCCUPIED') / count(b.kuid), 2)
        ELSE 0
      END AS avg_occupancy
    FROM hostel h
    LEFT JOIN room r ON r.hostel_kuid = h.kuid AND r.is_active = true
    LEFT JOIN bed b ON b.room_kuid = r.kuid AND b.is_active = true
    WHERE h.owner_kuid = $1
  `,
} as const;
