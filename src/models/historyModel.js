import { query } from "../config/database.js";

const getHistoryTable = (type) =>
  type === "detection" ? "detection_histories" : "translation_histories";

const detectionSelectColumns = `
  id,
  user_id,
  image_url,
  predicted_text,
  confidence,
  result_label,
  NULL::TEXT AS source_text,
  NULL::TEXT AS translated_text,
  NULL::TEXT AS source_language,
  NULL::TEXT AS target_language,
  raw_response,
  created_at,
  'detection' AS type
`;

const translationSelectColumns = `
  id,
  user_id,
  image_url,
  NULL::TEXT AS predicted_text,
  NULL::NUMERIC AS confidence,
  NULL::TEXT AS result_label,
  source_text,
  translated_text,
  source_language,
  target_language,
  raw_response,
  created_at,
  'translation' AS type
`;

export const createDetectionHistory = async ({
  userId,
  imageUrl,
  predictedText,
  confidence,
  resultLabel,
  rawResponse,
}) => {
  const sql = `
    INSERT INTO detection_histories
      (user_id, image_url, predicted_text, confidence, result_label, raw_response)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const { rows } = await query(sql, [
    userId,
    imageUrl,
    predictedText,
    confidence,
    resultLabel,
    rawResponse,
  ]);
  return rows[0];
};

export const createTranslationHistory = async ({
  userId,
  imageUrl,
  sourceText,
  translatedText,
  sourceLanguage,
  targetLanguage,
  rawResponse,
}) => {
  const sql = `
    INSERT INTO translation_histories
      (user_id, image_url, source_text, translated_text, source_language, target_language, raw_response)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const { rows } = await query(sql, [
    userId,
    imageUrl,
    sourceText,
    translatedText,
    sourceLanguage,
    targetLanguage,
    rawResponse,
  ]);
  return rows[0];
};

export const getHistoriesByUserAndType = async (userId, type) => {
  const table = getHistoryTable(type);
  const { rows } = await query(
    `SELECT * FROM ${table} WHERE user_id = $1 ORDER BY created_at DESC;`,
    [userId],
  );
  return rows;
};

export const getAllHistoriesByUser = async (userId) => {
  const sql = `
    SELECT * FROM (
      SELECT ${detectionSelectColumns}
      FROM detection_histories
      WHERE user_id = $1
      UNION ALL
      SELECT ${translationSelectColumns}
      FROM translation_histories
      WHERE user_id = $1
    ) AS histories
    ORDER BY created_at DESC;
  `;
  const { rows } = await query(sql, [userId]);
  return rows;
};

export const getHistoryById = async (userId, historyId) => {
  const sql = `
    SELECT * FROM (
      SELECT ${detectionSelectColumns}
      FROM detection_histories
      WHERE user_id = $1 AND id = $2
      UNION ALL
      SELECT ${translationSelectColumns}
      FROM translation_histories
      WHERE user_id = $1 AND id = $2
    ) AS histories
    LIMIT 1;
  `;
  const { rows } = await query(sql, [userId, historyId]);
  return rows[0] || null;
};

export const getHistoryDetailById = async (userId, type, historyId) => {
  const table = getHistoryTable(type);
  const { rows } = await query(
    `SELECT * FROM ${table} WHERE id = $1 AND user_id = $2 LIMIT 1;`,
    [historyId, userId],
  );
  return rows[0] || null;
};

export const deleteHistoryById = async (userId, type, historyId) => {
  const table = getHistoryTable(type);
  const { rowCount } = await query(
    `DELETE FROM ${table} WHERE id = $1 AND user_id = $2;`,
    [historyId, userId],
  );
  return rowCount > 0;
};

export const deleteHistoryByAnyType = async (userId, historyId) => {
  const deletedDetection = await deleteHistoryById(
    userId,
    "detection",
    historyId,
  );
  if (deletedDetection) {
    return true;
  }

  return deleteHistoryById(userId, "translation", historyId);
};
