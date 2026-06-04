import { query } from "../config/database.js";

const MAX_ATTEMPTS = 3;
const LOCKOUT_MINUTES = 15;

export const recordLoginAttempt = async ({ email, ipAddress, success }) => {
  const sql = `
    INSERT INTO login_attempts (email, ip_address, success)
    VALUES ($1, $2, $3);
  `;
  await query(sql, [email, ipAddress, success]);
};

export const getFailedAttemptCount = async (email) => {
  const sql = `
    SELECT COUNT(*) as count
    FROM login_attempts
    WHERE email = $1
      AND success = FALSE
      AND attempted_at > NOW() - INTERVAL '${LOCKOUT_MINUTES} minutes';
  `;
  const { rows } = await query(sql, [email]);
  return parseInt(rows[0].count, 10);
};

export const isAccountLocked = async (email) => {
  const failedCount = await getFailedAttemptCount(email);
  return failedCount >= MAX_ATTEMPTS;
};

export const getRemainingLockoutTime = async (email) => {
  const sql = `
    SELECT attempted_at
    FROM login_attempts
    WHERE email = $1
      AND success = FALSE
    ORDER BY attempted_at DESC
    LIMIT 1;
  `;
  const { rows } = await query(sql, [email]);

  if (rows.length === 0) return 0;

  const lastAttempt = new Date(rows[0].attempted_at);
  const lockoutEnd = new Date(lastAttempt.getTime() + LOCKOUT_MINUTES * 60 * 1000);
  const now = new Date();

  if (now >= lockoutEnd) return 0;

  return Math.ceil((lockoutEnd - now) / 60000);
};

export const resetFailedAttempts = async (email) => {
  const sql = `
    DELETE FROM login_attempts
    WHERE email = $1 AND success = FALSE;
  `;
  await query(sql, [email]);
};

export const clearOldAttempts = async () => {
  const sql = `
    DELETE FROM login_attempts
    WHERE attempted_at < NOW() - INTERVAL '${LOCKOUT_MINUTES} minutes';
  `;
  await query(sql);
};
