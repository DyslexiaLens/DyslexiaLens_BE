import { db } from "../config/db.js";

// Record an OTP verification attempt
export const recordOtpAttempt = async ({ email, success }) => {
  await db.query(
    `INSERT INTO otp_attempts (email, success, attempted_at)
     VALUES ($1, $2, NOW())`,
    [email, success],
  );
};

// Get failed OTP attempt count in last 10 minutes
export const getOtpFailedAttemptCount = async (email) => {
  const { rows } = await db.query(
    `SELECT COUNT(*) as count
     FROM otp_attempts
     WHERE email = $1
       AND success = false
       AND attempted_at > NOW() - INTERVAL '10 minutes'`,
    [email],
  );
  return parseInt(rows[0].count, 10);
};

// Check if OTP verification is locked due to too many failed attempts
export const isOtpLocked = async (email) => {
  const failedCount = await getOtpFailedAttemptCount(email);
  return failedCount >= 5;
};

// Get remaining lockout time in minutes
export const getOtpRemainingLockoutTime = async (email) => {
  const { rows } = await db.query(
    `SELECT MAX(attempted_at) as last_attempt
     FROM otp_attempts
     WHERE email = $1
       AND success = false
       AND attempted_at > NOW() - INTERVAL '10 minutes'`,
    [email],
  );

  if (!rows[0].last_attempt) return 0;

  const lastAttempt = new Date(rows[0].last_attempt);
  const lockoutEnd = new Date(lastAttempt.getTime() + 10 * 60 * 1000);
  const now = new Date();

  if (lockoutEnd <= now) return 0;

  return Math.ceil((lockoutEnd - now) / (60 * 1000));
};

// Reset failed OTP attempts after successful verification
export const resetOtpFailedAttempts = async (email) => {
  await db.query(
    `DELETE FROM otp_attempts
     WHERE email = $1 AND success = false`,
    [email],
  );
};
