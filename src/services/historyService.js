import {
  deleteHistoryByAnyType,
  deleteHistoryById,
  getAllHistoriesByUser,
  getHistoryById,
  getHistoryDetailById,
  getHistoriesByUserAndType,
} from "../models/historyModel.js";
import { HttpError } from "../utils/httpError.js";

const assertType = (type) => {
  if (!["detection", "translation"].includes(type)) {
    throw new HttpError(400, "History type must be detection or translation");
  }
};

export const getHistories = async (userId, type) => {
  assertType(type);
  return getHistoriesByUserAndType(userId, type);
};

export const getAllHistories = async (userId) => {
  return getAllHistoriesByUser(userId);
};

export const getHistoryDetail = async (userId, type, historyId) => {
  assertType(type);
  const history = await getHistoryDetailById(userId, type, historyId);
  if (!history) {
    throw new HttpError(404, "History not found");
  }
  return history;
};

export const getHistoryDetailByAnyId = async (userId, historyId) => {
  const history = await getHistoryById(userId, historyId);
  if (!history) {
    throw new HttpError(404, "History not found");
  }
  return history;
};

export const deleteHistory = async (userId, type, historyId) => {
  assertType(type);
  const deleted = await deleteHistoryById(userId, type, historyId);
  if (!deleted) {
    throw new HttpError(404, "History not found");
  }
  return { deleted: true };
};

export const deleteHistoryByAnyId = async (userId, historyId) => {
  const deleted = await deleteHistoryByAnyType(userId, historyId);
  if (!deleted) {
    throw new HttpError(404, "History not found");
  }
  return { deleted: true };
};
