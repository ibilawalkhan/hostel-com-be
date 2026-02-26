// Reusable SELECT columns for issue list items
const ISSUE_LIST_COLUMNS = `
  c.id,
  c.kuid,
  c.room_no,
  c.title,
  c.description,
  c.status,
  c.attachment_url,
  c.created_at,
  c.updated_at,
  'ISS' || LPAD(c.id::text, 3, '0') AS issue_number,
  cc.category_name,
  p.priority_name,
  h.name AS hostel_name,
  hb.branch_number,
  u.full_name AS submitted_by,
  (SELECT COUNT(*) FROM comments cm WHERE cm.complaint_kuid = c.kuid)::int AS comment_count
`;

const ISSUE_LIST_JOINS = `
  INNER JOIN complaintcategory cc ON cc.kuid = c.category_kuid
  INNER JOIN priority p           ON p.kuid  = c.priority_kuid
  INNER JOIN hostel h             ON h.kuid  = c.hostel_kuid
  INNER JOIN hostel_branch hb     ON hb.kuid = c.branch_kuid
  INNER JOIN role r               ON r.kuid  = c.role_kuid
  INNER JOIN "user" u             ON u.kuid  = r.user_kuid
`;

export const IssueQueries = {
  // ─── Context-specific lookups ─────────────────────────────────────────────

  GET_RESIDENT_HOSTELS: `
    SELECT DISTINCT
      h.kuid AS hostel_kuid,
      h.name AS hostel_name
    FROM resident res
    INNER JOIN bed b    ON b.kuid  = res.assigned_bed_kuid
    INNER JOIN room rm  ON rm.kuid = b.room_kuid
    INNER JOIN hostel h ON h.kuid  = rm.hostel_kuid
    WHERE res.user_kuid = $1
      AND res.is_active = TRUE
    ORDER BY h.name
  `,

  GET_BRANCHES_BY_HOSTEL: `
    SELECT kuid, branch_number
    FROM hostel_branch
    WHERE hostel_kuid = $1
    ORDER BY branch_number
  `,

  // ─── Issue CRUD ───────────────────────────────────────────────────────────

  CREATE_ISSUE: `
    INSERT INTO complaint
      (hostel_kuid, branch_kuid, role_kuid, category_kuid, priority_kuid,
       room_no, title, description, attachment_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `,

  // Customer: my issues — filter by the user's kuid (through the role join)
  GET_MY_ISSUES: `
    SELECT ${ISSUE_LIST_COLUMNS}
    FROM complaint c
    ${ISSUE_LIST_JOINS}
    WHERE r.user_kuid = $1
    ORDER BY c.created_at DESC
  `,

  // Single issue by kuid (used for detail view)
  GET_ISSUE_BY_KUID: `
    SELECT ${ISSUE_LIST_COLUMNS}
    FROM complaint c
    ${ISSUE_LIST_JOINS}
    WHERE c.kuid = $1
  `,

  // ─── Comments ─────────────────────────────────────────────────────────────

  GET_COMMENTS_BY_COMPLAINT: `
    SELECT
      cm.kuid,
      cm.user_kuid,
      cm.parent_kuid,
      cm.comment,
      cm.complaint_kuid,
      cm.created_at,
      cm.updated_at,
      u.full_name AS commenter_name
    FROM comments cm
    INNER JOIN "user" u ON u.kuid = cm.user_kuid
    WHERE cm.complaint_kuid = $1
    ORDER BY cm.created_at ASC
  `,

  ADD_COMMENT: `
    INSERT INTO comments (user_kuid, complaint_kuid, comment, parent_kuid)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,

  // ─── Owner / Warden ───────────────────────────────────────────────────────

  GET_OWNER_STATS: `
    SELECT
      COUNT(*) FILTER (WHERE c.status = 'OPEN')::int                                  AS open_count,
      COUNT(*) FILTER (WHERE c.status = 'INPROGRESS')::int                            AS inprogress_count,
      COUNT(*) FILTER (WHERE c.status = 'CLOSED')::int                                AS closed_count,
      COUNT(*) FILTER (WHERE c.status != 'CLOSED' AND p.priority_name = 'Critical')::int AS critical_count
    FROM complaint c
    INNER JOIN priority p ON p.kuid = c.priority_kuid
    INNER JOIN hostel h   ON h.kuid = c.hostel_kuid
    WHERE h.owner_kuid = $1
  `,

  UPDATE_STATUS: `
    UPDATE complaint
    SET status = $1, updated_at = NOW()
    WHERE kuid = $2
    RETURNING *
  `,
} as const;
