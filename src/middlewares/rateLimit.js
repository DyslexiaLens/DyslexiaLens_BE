import rateLimit from "express-rate-limit";

// General rate limiter: 100 requests per 15 minutes per IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak request dari IP ini, coba lagi dalam 15 menit",
  },
});

// OTP request rate limiter: 3 requests per 15 minutes per IP
// Prevents email bombing
export const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak permintaan OTP, coba lagi dalam 15 menit",
  },
});

// OTP verification rate limiter: 5 attempts per 15 minutes per IP
// Prevents brute force OTP (6 digits = 900K combinations)
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Terlalu banyak percobaan verifikasi OTP, coba lagi dalam 15 menit",
  },
});

// Login rate limiter: 5 attempts per 15 minutes per IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Terlalu banyak percobaan login, coba lagi dalam 15 menit",
  },
});

// Password change rate limiter: 3 requests per 15 minutes per IP
export const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Terlalu banyak permintaan ubah password, coba lagi dalam 15 menit",
  },
});
