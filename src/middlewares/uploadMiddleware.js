import path from "path";
import { mkdirSync } from "fs";
import multer from "multer";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

const uploadDir = "uploads/";
mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new HttpError(400, "Only image files are allowed"));
  }
  cb(null, true);
};

export const uploadImage = multer({
  storage,
  limits: { fileSize: env.maxFileSizeMb * 1024 * 1024 },
  fileFilter,
}).single("image");
