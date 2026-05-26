import { Router } from "express";
import * as aiController from "../controllers/aiController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { uploadImage } from "../middlewares/uploadMiddleware.js";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /ai/detections:
 *   post:
 *     tags:
 *       - AI
 *     summary: Upload image for dyslexia detection
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *             required:
 *               - image
 *     responses:
 *       201:
 *         description: Detection completed successfully
 *       400:
 *         description: File upload error
 *       401:
 *         description: Unauthorized
 */
router.post("/detections", uploadImage, aiController.uploadDetectionImage);
router.post("/predict", uploadImage, aiController.uploadDetectionImage);

/**
 * @swagger
 * /ai/translations:
 *   post:
 *     tags:
 *       - AI
 *     summary: Upload image for text translation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *             required:
 *               - image
 *     responses:
 *       201:
 *         description: Translation completed successfully
 *       400:
 *         description: File upload error
 *       401:
 *         description: Unauthorized
 */
router.post("/translations", uploadImage, aiController.uploadTranslationImage);
router.post("/translate", uploadImage, aiController.uploadTranslationImage);

export { router as aiRoutes };
