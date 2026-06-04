-- 005_otp_hash.sql
-- Add hashed OTP column for security

-- Add new column for hashed OTP
ALTER TABLE password_reset_otps
ADD COLUMN IF NOT EXISTS otp_code_hash VARCHAR(255);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_otps_user_id
  ON password_reset_otps (user_id, created_at DESC);

-- Note: Existing plain text OTPs will be hashed by a one-time migration script
-- New OTPs will be stored as hashes
