import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import * as historyService from "../services/historyService.js";

export const getDetectionHistories = asyncHandler(async (req, res) => {
  const result = await historyService.getHistories(
    req.user.userId,
    "detection",
  );
  return sendSuccess(res, result, "Get detection histories success");
});

export const getAllHistories = asyncHandler(async (req, res) => {
  const result = await historyService.getAllHistories(req.user.userId);
  return sendSuccess(res, { histories: result }, "Get history success");
});

export const getTranslationHistories = asyncHandler(async (req, res) => {
  const result = await historyService.getHistories(
    req.user.userId,
    "translation",
  );
  return sendSuccess(res, result, "Get translation histories success");
});

export const getHistoryDetail = asyncHandler(async (req, res) => {
  const result = await historyService.getHistoryDetail(
    req.user.userId,
    req.params.type,
    Number(req.params.id),
  );
  return sendSuccess(res, result, "Get history detail success");
});

export const getHistoryDetailByAnyId = asyncHandler(async (req, res) => {
  const result = await historyService.getHistoryDetailByAnyId(
    req.user.userId,
    Number(req.params.id),
  );
  return sendSuccess(res, { history: result }, "Get history detail success");
});

export const deleteHistory = asyncHandler(async (req, res) => {
  const result = await historyService.deleteHistory(
    req.user.userId,
    req.params.type,
    Number(req.params.id),
  );
  return sendSuccess(res, result, "Delete history success");
});

export const deleteHistoryByAnyId = asyncHandler(async (req, res) => {
  const result = await historyService.deleteHistoryByAnyId(
    req.user.userId,
    Number(req.params.id),
  );
  return sendSuccess(res, result, "Delete history success");
});
