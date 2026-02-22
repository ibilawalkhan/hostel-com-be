-- =============================================================
-- Adjust complaint status constraint
-- Adds 'OPEN' and 'CLOSED', removes the old typo 'RESOVLED'
-- =============================================================
BEGIN;

-- Dynamically drop whatever name PostgreSQL auto-generated
-- for the inline CHECK on the status column
DO $$
DECLARE
  v_constraint TEXT;
BEGIN
  SELECT conname INTO v_constraint
  FROM pg_constraint
  WHERE conrelid = 'complaint'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%status%';

  IF v_constraint IS NOT NULL THEN
    EXECUTE 'ALTER TABLE complaint DROP CONSTRAINT ' || quote_ident(v_constraint);
  END IF;
END $$;

ALTER TABLE complaint
  ADD CONSTRAINT complaint_status_check
  CHECK (status IN ('OPEN', 'INPROGRESS', 'CLOSED'));

ALTER TABLE complaint
  ALTER COLUMN status SET DEFAULT 'OPEN';

COMMIT;
