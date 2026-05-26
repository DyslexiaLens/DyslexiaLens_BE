import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import * as aiService from "../services/aiService.js";
import { HttpError } from "../utils/httpError.js";

export const uploadDetectionImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new HttpError(400, "Image file is required");
  }

  const result = await aiService.detectDyslexia({
    userId: req.user.userId,
    filePath: req.file.path,
  });

  return sendSuccess(res, result, "Detection success", 201);
});

export const uploadTranslationImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new HttpError(400, "Image file is required");
  }

  const result = await aiService.translateImageText({
    userId: req.user.userId,
    filePath: req.file.path,
  });

  return sendSuccess(res, result, "Translation success", 201);
});
