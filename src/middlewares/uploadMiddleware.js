import multer from "multer";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new HttpError(400, "Only JPG and PNG image files are allowed"));
  }
  cb(null, true);
};

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
  fileFilter,
}).single("image");
