import { Router } from "express";
import * as historyController from "../controllers/historyController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { historyDetailValidator } from "../validators/historyValidator.js";
import { handleValidationResult } from "../validators/validationResult.js";

const router = Router();

router.use(authenticate);

router.get("/", historyController.getAllHistories);

/**
 * @swagger
 * /histories/detections:
 *   get:
 *     tags:
 *       - History
 *     summary: Get detection history list
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Detection histories retrieved
 *       401:
 *         description: Unauthorized
 */
router.get("/detections", historyController.getDetectionHistories);

/**
 * @swagger
 * /histories/translations:
 *   get:
 *     tags:
 *       - History
 *     summary: Get translation history list
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Translation histories retrieved
 *       401:
 *         description: Unauthorized
 */
router.get("/translations", historyController.getTranslationHistories);

router.get("/:id", historyController.getHistoryDetailByAnyId);

router.delete("/:id", historyController.deleteHistoryByAnyId);

/**
 * @swagger
 * /histories/{type}/{id}:
 *   get:
 *     tags:
 *       - History
 *     summary: Get history detail
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [detection, translation]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: History detail retrieved
 *       404:
 *         description: History not found
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/:type/:id",
  historyDetailValidator,
  handleValidationResult,
  historyController.getHistoryDetail,
);

/**
 * @swagger
 * /histories/{type}/{id}:
 *   delete:
 *     tags:
 *       - History
 *     summary: Delete history record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [detection, translation]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: History deleted successfully
 *       404:
 *         description: History not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/:type/:id",
  historyDetailValidator,
  handleValidationResult,
  historyController.deleteHistory,
);

export { router as historyRoutes };
