import { validationResult } from "express-validator";
import { HttpError } from "../utils/httpError.js";

export const handleValidationResult = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(new HttpError(400, "Validation error", errors.array()));
  }

  return next();
};
