-- 004_otp_attempts.sql
-- Tracks OTP verification attempts for brute force protection

CREATE TABLE IF NOT EXISTS otp_attempts (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by email and time range
CREATE INDEX IF NOT EXISTS idx_otp_attempts_email_time
  ON otp_attempts (email, attempted_at DESC);

-- Auto-cleanup old records (older than 24 hours)
-- Run this periodically or use pg_cron
-- DELETE FROM otp_attempts WHERE attempted_at < NOW() - INTERVAL '24 hours';
