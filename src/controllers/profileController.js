import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import * as profileService from "../services/profileService.js";

export const getProfile = asyncHandler(async (req, res) => {
  const result = await profileService.getProfile(req.user.userId);
  return sendSuccess(res, result, "Get profile success");
});

export const updateProfile = asyncHandler(async (req, res) => {
  const result = await profileService.updateProfile(req.user.userId, req.body);
  return sendSuccess(res, result, "Update profile success");
});

export const updateAddress = asyncHandler(async (req, res) => {
  const result = await profileService.updateAddress(req.user.userId, req.body);
  return sendSuccess(res, result, "Update address success");
});
