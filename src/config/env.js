import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL,
  frontendUrl:
    process.env.FRONTEND_URL || "https://dyslexia-lens-fe.vercel.app",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  otpExpiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES || 10),
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  mailFrom: process.env.SMTP_FROM || "",
  maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 5),
  aiModelBaseUrl: process.env.AI_MODEL_BASE_URL || "http://localhost:7860",
  aiModelApiKey: process.env.AI_MODEL_API_KEY || "KunciRahasia123!",
  aiModelTimeoutMs: Number(process.env.AI_MODEL_TIMEOUT_MS || 30000),
};
