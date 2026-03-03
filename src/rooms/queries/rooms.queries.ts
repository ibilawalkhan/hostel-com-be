export const RoomsQueries = {
  FIND_ROOM_BY_KUID: `
    SELECT * FROM room WHERE kuid = $1
  `,

  DELETE_BEDS_BY_ROOM_KUID: `
    DELETE FROM bed WHERE room_kuid = $1
  `,

  FIND_WASHROOM_BY_ROOM_KUID: `
    SELECT kuid FROM washroom WHERE room_kuid = $1 LIMIT 1
  `,

  UPDATE_WASHROOM: `
    UPDATE washroom SET photos = $1, updated_at = NOW() WHERE kuid = $2
  `,

  DELETE_WASHROOM_BY_ROOM_KUID: `
    DELETE FROM washroom WHERE room_kuid = $1
  `,

  DELETE_ROOM_FACILITIES_BY_ROOM_KUID: `
    DELETE FROM room_facility WHERE room_kuid = $1
  `,

  DELETE_WASHROOM_FACILITIES_BY_WASHROOM_KUID: `
    DELETE FROM washroom_facilities WHERE washroom_kuid = $1
  `,

  DELETE_ROOM: `
    DELETE FROM room WHERE kuid = $1
  `,

  INSERT_ROOM: `
    INSERT INTO room (hostel_kuid, room_type, room_no, floor_no, room_size, status, photos)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,

  INSERT_BED: `
    INSERT INTO bed (room_kuid, bed_no, monthly_rent, bed_occupied_enum)
    VALUES ($1, $2, $3, $4)
  `,

  INSERT_WASHROOM: `
    INSERT INTO washroom (room_kuid, name, photos)
    VALUES ($1, $2, $3)
    RETURNING kuid
  `,

  INSERT_ROOM_FACILITY: `
    INSERT INTO room_facility (room_kuid, facility_kuid)
    VALUES ($1, $2)
    ON CONFLICT (room_kuid, facility_kuid) DO NOTHING
  `,

  INSERT_WASHROOM_FACILITY: `
    INSERT INTO washroom_facilities (washroom_kuid, facility_kuid)
    VALUES ($1, $2)
    ON CONFLICT (washroom_kuid, facility_kuid) DO NOTHING
  `,

  COUNT_ROOMS_PAGINATED: `
    SELECT count(*)::int AS total
    FROM room
    WHERE is_active = true
      AND ($1::text IS NULL OR hostel_kuid = $1)
  `,

  FIND_ROOMS_PAGINATED: `
    SELECT
      r.kuid,
      r.room_no,
      r.room_type AS type,
      (r.room_type::int) AS capacity,
      coalesce(b.occupied, 0)::int AS occupied,
      coalesce(b.empty_count, 0)::int AS empty_count,
      r.status,
      b.price_per_bed
    FROM room r
    LEFT JOIN LATERAL (
      SELECT
        count(*) FILTER (WHERE bed_occupied_enum = 'OCCUPIED') AS occupied,
        count(*) FILTER (WHERE bed_occupied_enum = 'AVAILABLE') AS empty_count,
        round(avg(monthly_rent)::numeric, 2) AS price_per_bed
      FROM bed
      WHERE room_kuid = r.kuid AND is_active = true
    ) b ON true
    WHERE r.is_active = true
      AND ($1::text IS NULL OR r.hostel_kuid = $1)
    ORDER BY r.room_no
    LIMIT $2 OFFSET $3
  `,

  GET_ROOM_BED_STATS: `
    SELECT
      count(DISTINCT r.kuid)::int AS total_rooms,
      count(b.kuid)::int AS total_beds,
      count(b.kuid) FILTER (WHERE b.bed_occupied_enum = 'OCCUPIED')::int AS occupied_beds,
      count(b.kuid) FILTER (WHERE b.bed_occupied_enum = 'AVAILABLE')::int AS available_beds
    FROM room r
    LEFT JOIN bed b ON b.room_kuid = r.kuid AND b.is_active = true
    WHERE r.is_active = true
      AND ($1::text IS NULL OR r.hostel_kuid = $1)
  `,

  FIND_ROOM_DETAILS_ROOM: `
    SELECT kuid, hostel_kuid, room_type, room_no, floor_no, room_size, status, photos, is_active, created_at, updated_at
    FROM room WHERE kuid = $1 AND is_active = true
  `,

  FIND_BEDS_BY_ROOM_KUID: `
    SELECT kuid, room_kuid, bed_no, monthly_rent, bed_photos_url, bed_occupied_enum, is_active, created_at, updated_at
    FROM bed WHERE room_kuid = $1 AND is_active = true ORDER BY bed_no
  `,

  FIND_WASHROOM_BY_ROOM_KUID_FULL: `
    SELECT kuid, room_kuid, name, photos, is_active, created_at, updated_at
    FROM washroom WHERE room_kuid = $1 LIMIT 1
  `,

  FIND_ROOM_FACILITIES_BY_ROOM_KUID: `
    SELECT facility_kuid FROM room_facility WHERE room_kuid = $1
  `,

  FIND_WASHROOM_FACILITIES_BY_WASHROOM_KUID: `
    SELECT facility_kuid FROM washroom_facilities WHERE washroom_kuid = $1
  `,
} as const;
