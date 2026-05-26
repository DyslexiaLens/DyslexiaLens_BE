import dotenv from "dotenv";

dotenv.config();

const requiredEnvs = ["JWT_SECRET"];

requiredEnvs.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  otpExpiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES || 10),
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 5),
};
