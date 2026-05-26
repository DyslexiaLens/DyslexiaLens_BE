import { query } from "../config/database.js";

export const createPasswordResetOtp = async ({
  userId,
  otpCode,
  expiresAt,
}) => {
  const sql = `
    INSERT INTO password_reset_otps (user_id, otp_code, expires_at)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, otp_code, expires_at, is_used;
  `;
  const { rows } = await query(sql, [userId, otpCode, expiresAt]);
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
