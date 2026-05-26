import {
  findUserById,
  updateUserProfileById,
  upsertUserAddress,
} from "../models/userModel.js";
import { HttpError } from "../utils/httpError.js";

export const getProfile = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  return user;
};

export const updateProfile = async (userId, payload) => {
  const user = await updateUserProfileById(userId, payload);
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  return user;
};

export const updateAddress = async (userId, payload) => {
  const user = await upsertUserAddress(userId, payload);
  return user;
};
