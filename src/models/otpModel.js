import { query } from "../config/database.js";
import { hashPassword, comparePassword } from "../utils/password.js";

export const createPasswordResetOtp = async ({
  userId,
  otpCode,
  expiresAt,
}) => {
  // Invalidate any existing unused OTPs for this user
  await query(
    `UPDATE password_reset_otps SET is_used = TRUE
     WHERE user_id = $1 AND is_used = FALSE`,
    [userId],
  );

  // Hash the OTP before storing
  const otpCodeHash = await hashPassword(otpCode);

  const sql = `
    INSERT INTO password_reset_otps (user_id, otp_code, otp_code_hash, expires_at)
    VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, otp_code, expires_at, is_used;
  `;
  const { rows } = await query(sql, [userId, otpCode, otpCodeHash, expiresAt]);
  return rows[0];
};

export const findLatestOtpByUserId = async (userId) => {
  const sql = `
    SELECT *
    FROM password_reset_otps
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1;
  `;
  const { rows } = await query(sql, [userId]);
  return rows[0] || null;
};

export const markOtpAsUsed = async (otpId) => {
  await query("UPDATE password_reset_otps SET is_used = TRUE WHERE id = $1;", [
    otpId,
  ]);
};

// Compare OTP with stored hash (supports both plain text and hashed OTPs)
export const compareOtp = async (otpCode, otpRecord) => {
  // If otp_code_hash exists, use hash comparison
  if (otpRecord.otp_code_hash) {
    return comparePassword(otpCode, otpRecord.otp_code_hash);
  }
  // Fallback to plain text comparison for backward compatibility
  return otpCode === otpRecord.otp_code;
};

// Cleanup expired and used OTPs (run periodically)
export const cleanupExpiredOtps = async () => {
  const result = await query(
    `DELETE FROM password_reset_otps
     WHERE expires_at < NOW() - INTERVAL '24 hours'
        OR (is_used = TRUE AND created_at < NOW() - INTERVAL '7 days')`,
  );
  return result.rowCount;
};

// Cleanup old OTP attempts (run periodically)
export const cleanupOldOtpAttempts = async () => {
  const result = await query(
    `DELETE FROM otp_attempts
     WHERE attempted_at < NOW() - INTERVAL '24 hours'`,
  );
  return result.rowCount;
};
