import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const getJwtSecret = () => {
  if (!env.jwtSecret) {
    throw new Error("JWT_SECRET environment variable is not configured");
  }

  return env.jwtSecret;
};

export const signAccessToken = (payload) =>
  jwt.sign(payload, getJwtSecret(), { expiresIn: env.jwtExpiresIn });

export const verifyAccessToken = (token) => jwt.verify(token, getJwtSecret());
