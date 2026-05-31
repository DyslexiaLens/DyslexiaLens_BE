import { Router } from "express";
import * as authController from "../controllers/authController.js";
import {
  changePasswordValidator,
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  verifyOtpValidator,
} from "../validators/authValidator.js";
import { handleValidationResult } from "../validators/validationResult.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { sendOtpEmail } from "../utils/sendEmail.js";

const router = Router();

router.get("/me", authenticate, authController.getMe);
router.post("/logout", authenticate, authController.logout);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *             required:
 *               - fullName
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: User registered successfully
 *       409:
 *         description: Email already registered
 *       400:
 *         description: Validation error
 */
router.post(
  "/register",
  registerValidator,
  handleValidationResult,
  authController.register,
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: Password123
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful, returns access token
 *       401:
 *         description: Invalid email or password
 *       400:
 *         description: Validation error
 */
router.post(
  "/login",
  loginValidator,
  handleValidationResult,
  authController.login,
);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Request password reset OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: OTP sent (if email registered)
 *       400:
 *         description: Validation error
 */
router.post(
  "/forgot-password",
  forgotPasswordValidator,
  handleValidationResult,
  authController.forgotPassword,
);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify OTP code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               otpCode:
 *                 type: string
 *                 example: "123456"
 *             required:
 *               - email
 *               - otpCode
 *     responses:
 *       200:
 *         description: OTP verified
 *       400:
 *         description: Invalid or expired OTP
 */
router.post(
  "/verify-otp",
  verifyOtpValidator,
  handleValidationResult,
  authController.verifyOtp,
);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Reset password with OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               otpCode:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123
 *             required:
 *               - email
 *               - otpCode
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid OTP or validation error
 */
router.post(
  "/reset-password",
  resetPasswordValidator,
  handleValidationResult,
  authController.resetPassword,
);

/**
 * @swagger
 * /auth/change-password/otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Request OTP for changing password (authenticated)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/change-password/otp",
  authenticate,
  authController.requestChangePasswordOtp,
);

/**
 * @swagger
 * /auth/change-password:
 *   patch:
 *     tags:
 *       - Auth
 *     summary: Change password (authenticated)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: Password123
 *               otpCode:
 *                 type: string
 *                 example: "123456"
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123
 *             required:
 *               - currentPassword
 *               - otpCode
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Current password incorrect, invalid OTP, or validation error
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/change-password",
  authenticate,
  changePasswordValidator,
  handleValidationResult,
  authController.changePassword,
);

router.post("/test-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email parameter is required in the request body",
      });
    }

    await sendOtpEmail({
      to: email,
      otp: "123456",
    });

    res.status(200).json({
      success: true,
      message: "Email berhasil dikirim",
    });
  } catch (error) {
    console.error("EMAIL ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
export { router as authRoutes };
