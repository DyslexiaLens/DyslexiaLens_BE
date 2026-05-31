import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import * as profileController from "../controllers/profileController.js";
import {
  updateAddressValidator,
  updateProfileValidator,
} from "../validators/profileValidator.js";
import { handleValidationResult } from "../validators/validationResult.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /profile:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/", profileController.getProfile);

/**
 * @swagger
 * /profile:
 *   patch:
 *     tags:
 *       - Profile
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               birthDate:
 *                 type: string
 *                 format: date
 *               avatarUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/",
  updateProfileValidator,
  handleValidationResult,
  profileController.updateProfile,
);

/**
 * @swagger
 * /profile/address:
 *   patch:
 *     tags:
 *       - Profile
 *     summary: Update user address
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               postalCode:
 *                 type: string
 *             required:
 *               - country
 *               - city
 *               - postalCode
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/address",
  updateAddressValidator,
  handleValidationResult,
  profileController.updateAddress,
);

export { router as profileRoutes };
