import { HttpError } from "../utils/httpError.js";

const postgresErrorMap = {
  23505: { statusCode: 409, message: "Data sudah ada" },
  23503: { statusCode: 400, message: "Data referensi tidak valid" },
  "22P02": { statusCode: 400, message: "Format input tidak valid" },
};

const multerErrorMap = {
  LIMIT_FILE_SIZE: { statusCode: 413, message: "Ukuran file melebihi batas maksimum" },
};

export const notFoundHandler = (_req, _res, next) => {
  next(new HttpError(404, "Rute tidak ditemukan"));
};

export const errorHandler = (error, _req, res, _next) => {
  console.error("Unhandled API Error:", error);

  if (error?.code && multerErrorMap[error.code]) {
    const mapped = multerErrorMap[error.code];
    return res.status(mapped.statusCode).json({
      success: false,
      message: mapped.message,
      errors: null,
    });
  }

  if (error.code && postgresErrorMap[error.code]) {
    const mapped = postgresErrorMap[error.code];
    return res.status(mapped.statusCode).json({
      success: false,
      message: mapped.message,
      errors: null,
    });
  }

  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message =
    error instanceof HttpError ? error.message : "Kesalahan server internal";
  const details = error instanceof HttpError ? error.details : null;

  const response = {
    success: false,
    message,
    errors: null,
  };

  if (details && typeof details === "object") {
    response.errorType = details.errorType || null;
    response.remainingAttempts = details.remainingAttempts ?? null;
    response.remainingMinutes = details.remainingMinutes ?? null;
  }

  return res.status(statusCode).json(response);
};
