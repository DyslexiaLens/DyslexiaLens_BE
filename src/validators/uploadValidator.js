import { HttpError } from "../utils/httpError.js";

export const requireUploadedFile = (req, _res, next) => {
  if (!req.file) {
    return next(new HttpError(400, "Image file is required"));
  }
  return next();
};
