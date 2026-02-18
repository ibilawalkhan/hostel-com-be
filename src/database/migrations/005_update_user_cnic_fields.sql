-- ============================================================
-- Migration: 005_update_user_cnic_fields
-- Date: 2024-02-18
-- Description: Rename cnic to cnic_number, add cnic_front and cnic_back
-- ============================================================

BEGIN;

-- Rename cnic column
ALTER TABLE "user" RENAME COLUMN cnic TO cnic_number;

-- Add new columns for CNIC images
ALTER TABLE "user" ADD COLUMN cnic_front TEXT;
ALTER TABLE "user" ADD COLUMN cnic_back TEXT;

COMMIT;