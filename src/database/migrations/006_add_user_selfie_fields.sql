-- ============================================================
-- Migration: 006_add_user_selfie_fields
-- Date: 2024-02-18
-- Description: Add selfie image to user table
-- ============================================================

BEGIN;

-- Add new columns for selfie images
ALTER TABLE "user" ADD COLUMN selfie TEXT;

COMMIT;