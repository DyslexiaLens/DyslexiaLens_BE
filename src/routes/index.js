import { Router } from "express";
import { authRoutes } from "./authRoutes.js";
import { profileRoutes } from "./profileRoutes.js";
import { aiRoutes } from "./aiRoutes.js";
import { historyRoutes } from "./historyRoutes.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { uploadImage } from "../middlewares/uploadMiddleware.js";
import { HttpError } from "../utils/httpError.js";
import { sendSuccess } from "../utils/response.js";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags:
 *       - System
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: API is healthy and operational
 */
router.get("/health", (_req, res) =>
  sendSuccess(res, { status: "healthy" }, "API healthy"),
);

/**
 * @swagger
 * /uploads:
 *   post:
 *     tags:
 *       - System
 *     summary: Upload an image file
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
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation or file upload error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/uploads", authenticate, uploadImage, (req, res) => {
  if (!req.file) {
    throw new HttpError(400, "Image file is required");
  }

  return sendSuccess(
    res,
    {
      imagePath: req.file.path,
      fileName: req.file.filename,
    },
    "Upload success",
    201,
  );
});

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/ai", aiRoutes);
router.use("/analysis", aiRoutes);
router.use("/histories", historyRoutes);
router.use("/history", historyRoutes);

export { router };
