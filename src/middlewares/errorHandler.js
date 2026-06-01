import { HttpError } from "../utils/httpError.js";

const postgresErrorMap = {
  23505: { statusCode: 409, message: "Data already exists" },
  23503: { statusCode: 400, message: "Invalid reference data" },
  "22P02": { statusCode: 400, message: "Invalid input format" },
};

const multerErrorMap = {
  LIMIT_FILE_SIZE: { statusCode: 413, message: "File size exceeds maximum limit" },
};

export const notFoundHandler = (_req, _res, next) => {
  next(new HttpError(404, "Route not found"));
};

export const errorHandler = (error, _req, res, _next) => {
  // Log the full error to the terminal for debugging
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
    error instanceof HttpError ? error.message : "Internal server error";
  const errors = error instanceof HttpError ? error.details : null;

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
