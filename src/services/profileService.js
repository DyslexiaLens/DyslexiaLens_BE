import {
  findUserById,
  updateUserProfileById,
  upsertUserAddress,
} from "../models/userModel.js";
import { HttpError } from "../utils/httpError.js";

const mapProfileResponse = (user) => {
  if (!user) {
    return null;
  }

  const createdAt = user.created_at ?? user.createdAt ?? null;

  return {
    id: user.id,
    fullName: user.full_name ?? user.fullName ?? "",
    name: user.full_name ?? user.fullName ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    birthDate: user.birth_date ?? user.birthDate ?? null,
    avatarUrl: user.avatar_url ?? user.avatarUrl ?? null,
    createdAt,
    created_at: createdAt,
    personalInfo: {
      fullName: user.full_name ?? user.fullName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      birthDate: user.birth_date ?? user.birthDate ?? null,
      avatarUrl: user.avatar_url ?? user.avatarUrl ?? null,
      joinedAt: createdAt,
    },
    address: {
      city: user.city ?? "",
      postalCode: user.postal_code ?? user.postalCode ?? "",
      country: user.country ?? "",
    },
  };
};

export const getProfile = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  return mapProfileResponse(user);
};

export const updateProfile = async (userId, payload) => {
  const user = await updateUserProfileById(userId, payload);
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  return mapProfileResponse(user);
};

export const updateAddress = async (userId, payload) => {
  const user = await upsertUserAddress(userId, payload);
  return mapProfileResponse(user);
};
