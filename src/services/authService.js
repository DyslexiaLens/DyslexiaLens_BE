import { env } from "../config/env.js";
import { sendOtpEmail } from "../utils/sendEmail.js";
import {
  createPasswordResetOtp,
  findLatestOtpByUserId,
  markOtpAsUsed,
} from "../models/otpModel.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserPasswordById,
} from "../models/userModel.js";
import { HttpError } from "../utils/httpError.js";
import { generateOtpCode } from "../utils/otp.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { signAccessToken } from "../utils/jwt.js";

const buildPublicUser = (user) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  createdAt: user.created_at,
});

export const register = async ({ fullName, email, password }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new HttpError(409, "Email already registered");
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ fullName, email, passwordHash });

  return buildPublicUser(user);
};

export const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new HttpError(401, "Invalid email or password");
  }

  const isPasswordMatch = await comparePassword(password, user.password_hash);
  if (!isPasswordMatch) {
    throw new HttpError(401, "Invalid email or password");
  }

  const token = signAccessToken({ userId: user.id, email: user.email });

  return {
    accessToken: token,
    user: buildPublicUser(user),
  };
};

export const forgotPassword = async ({ email }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    return {
      message: "If email is registered, OTP has been sent",
    };
  }

  const otpCode = generateOtpCode();
  const expiresAt = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);

  await createPasswordResetOtp({
    userId: user.id,
    otpCode,
    expiresAt,
  });

  await sendOtpEmail({
    to: user.email,
    otp: otpCode,
  });

  return {
    message: "If email is registered, OTP has been sent",
    otpCode: env.nodeEnv === "development" ? otpCode : undefined,
  };
};

export const verifyOtp = async ({ email, otpCode }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new HttpError(400, "Invalid OTP request");
  }

  const latestOtp = await findLatestOtpByUserId(user.id);
  if (!latestOtp || latestOtp.is_used || latestOtp.otp_code !== otpCode) {
    throw new HttpError(400, "OTP invalid or already used");
  }

  if (new Date(latestOtp.expires_at) < new Date()) {
    throw new HttpError(400, "OTP expired");
  }

  return { verified: true };
};

export const resetPassword = async ({ email, otpCode, newPassword }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new HttpError(400, "Invalid reset password request");
  }

  const latestOtp = await findLatestOtpByUserId(user.id);
  if (!latestOtp || latestOtp.is_used || latestOtp.otp_code !== otpCode) {
    throw new HttpError(400, "OTP invalid or already used");
  }

  if (new Date(latestOtp.expires_at) < new Date()) {
    throw new HttpError(400, "OTP expired");
  }

  const passwordHash = await hashPassword(newPassword);
  await updateUserPasswordById(user.id, passwordHash);
  await markOtpAsUsed(latestOtp.id);

  return { reset: true };
};

export const changePassword = async ({
  userId,
  currentPassword,
  newPassword,
  otpCode,
}) => {
  const userById = await findUserById(userId);
  if (!userById) {
    throw new HttpError(404, "User not found");
  }

  const fullUser = await findUserByEmail(userById.email);
  const valid = await comparePassword(currentPassword, fullUser.password_hash);

  if (!valid) {
    throw new HttpError(400, "Current password is incorrect");
  }

  // Jika otpCode tidak dikirim, berarti ini Langkah 1 (Inisiasi Ubah Password & Kirim OTP)
  if (!otpCode) {
    const generatedOtp = generateOtpCode();
    const expiresAt = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);

    await createPasswordResetOtp({
      userId: userById.id,
      otpCode: generatedOtp,
      expiresAt,
    });

    await sendOtpEmail({
      to: userById.email,
      otp: generatedOtp,
    });

    return {
      requiresOtp: true,
      message: "OTP has been sent to your email",
      otpCode: env.nodeEnv === "development" ? generatedOtp : undefined,
    };
  }

  // Jika otpCode dikirim, berarti ini Langkah 2 (Verifikasi OTP & Update Password)
  const latestOtp = await findLatestOtpByUserId(userId);
  if (!latestOtp || latestOtp.is_used || latestOtp.otp_code !== otpCode) {
    throw new HttpError(400, "OTP invalid or already used");
  }

  if (new Date(latestOtp.expires_at) < new Date()) {
    throw new HttpError(400, "OTP expired");
  }

  const passwordHash = await hashPassword(newPassword);
  await updateUserPasswordById(userId, passwordHash);
  await markOtpAsUsed(latestOtp.id);

  return { changed: true };
};

export const requestChangePasswordOtp = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const otpCode = generateOtpCode();
  const expiresAt = new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000);

  await createPasswordResetOtp({
    userId: user.id,
    otpCode,
    expiresAt,
  });

  await sendOtpEmail({
    to: user.email,
    otp: otpCode,
  });

  return {
    message: "OTP has been sent to your email",
    otpCode: env.nodeEnv === "development" ? otpCode : undefined,
  };
};
