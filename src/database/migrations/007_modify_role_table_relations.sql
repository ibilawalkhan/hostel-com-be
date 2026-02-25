BEGIN;

-- Step 1: Clean
UPDATE role
SET assigned_hostel = NULL
WHERE assigned_hostel NOT IN (SELECT kuid FROM hostel);

UPDATE role
SET hostel_branch = NULL
WHERE hostel_branch NOT IN (SELECT kuid FROM hostel_branch);

-- Step 2: Rename
ALTER TABLE role
  RENAME COLUMN assigned_hostel TO assigned_hostel_kuid;

ALTER TABLE role
  RENAME COLUMN hostel_branch TO hostel_branch_kuid;

-- Step 3: Add foreign keys
ALTER TABLE role
  ADD CONSTRAINT fk_role_hostel
  FOREIGN KEY (assigned_hostel_kuid)
  REFERENCES hostel (kuid)
  ON DELETE SET NULL;

ALTER TABLE role
  ADD CONSTRAINT fk_role_hostel_branch
  FOREIGN KEY (hostel_branch_kuid)
  REFERENCES hostel_branch (kuid)
  ON DELETE SET NULL;

COMMIT;