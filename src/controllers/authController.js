import * as authService from "../services/authService.js";
import * as profileService from "../services/profileService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return sendSuccess(res, result, "Register success", 201);
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return sendSuccess(res, result, "Login success");
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  return sendSuccess(res, result, result.message);
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const result = await authService.verifyOtp(req.body);
  return sendSuccess(res, result, "OTP verified");
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  return sendSuccess(res, result, "Password reset success");
});

export const changePassword = asyncHandler(async (req, res) => {
  const result = await authService.changePassword({
    userId: req.user.userId,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
  });
  return sendSuccess(res, result, "Password changed");
});

export const getMe = asyncHandler(async (req, res) => {
  const result = await profileService.getProfile(req.user.userId);
  return sendSuccess(res, result, "Get profile success");
});

export const logout = asyncHandler(async (_req, res) => {
  return sendSuccess(res, { loggedOut: true }, "Logout success");
});
