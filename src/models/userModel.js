import { query } from "../config/database.js";

export const createUser = async ({ fullName, email, passwordHash }) => {
  const sql = `
    INSERT INTO users (full_name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, full_name, email, created_at;
  `;
  const { rows } = await query(sql, [fullName, email, passwordHash]);
  return rows[0];
};

export const findUserByEmail = async (email) => {
  const { rows } = await query(
    "SELECT * FROM users WHERE email = $1 LIMIT 1;",
    [email],
  );
  return rows[0] || null;
};

export const findUserById = async (userId) => {
  const sql = `
    SELECT u.id, u.full_name, u.email, u.phone, u.birth_date, u.avatar_url,
           a.street, a.city, a.province, a.postal_code, a.country
    FROM users u
    LEFT JOIN user_addresses a ON a.user_id = u.id
    WHERE u.id = $1
    LIMIT 1;
  `;
  const { rows } = await query(sql, [userId]);
  return rows[0] || null;
};

export const updateUserProfileById = async (userId, payload) => {
  const fields = [];
  const values = [];

  if (payload.fullName !== undefined) {
    fields.push(`full_name = $${fields.length + 1}`);
    values.push(payload.fullName);
  }
  if (payload.phone !== undefined) {
    fields.push(`phone = $${fields.length + 1}`);
    values.push(payload.phone);
  }
  if (payload.birthDate !== undefined) {
    fields.push(`birth_date = $${fields.length + 1}`);
    values.push(payload.birthDate);
  }
  if (payload.avatarUrl !== undefined) {
    fields.push(`avatar_url = $${fields.length + 1}`);
    values.push(payload.avatarUrl);
  }

  if (!fields.length) {
    return findUserById(userId);
  }

  values.push(userId);
  const sql = `
    UPDATE users
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${values.length}
    RETURNING id;
  `;
  await query(sql, values);
  return findUserById(userId);
};

export const upsertUserAddress = async (userId, payload) => {
  const sql = `
    INSERT INTO user_addresses (user_id, street, city, province, postal_code, country)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (user_id)
    DO UPDATE SET
      street = EXCLUDED.street,
      city = EXCLUDED.city,
      province = EXCLUDED.province,
      postal_code = EXCLUDED.postal_code,
      country = EXCLUDED.country,
      updated_at = NOW();
  `;
  await query(sql, [
    userId,
    payload.street,
    payload.city,
    payload.province,
    payload.postalCode,
    payload.country,
  ]);

  return findUserById(userId);
};

export const updateUserPasswordById = async (userId, passwordHash) => {
  await query(
    "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2;",
    [passwordHash, userId],
  );
};
