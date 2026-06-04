import { app } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/database.js";
import {
  cleanupExpiredOtps,
  cleanupOldOtpAttempts,
} from "./models/otpModel.js";

// Cleanup job for expired OTPs and old attempts
const runCleanupJob = async () => {
  try {
    const otpsDeleted = await cleanupExpiredOtps();
    const attemptsDeleted = await cleanupOldOtpAttempts();
    if (otpsDeleted > 0 || attemptsDeleted > 0) {
      console.log(
        `Cleanup: ${otpsDeleted} OTPs, ${attemptsDeleted} OTP attempts deleted`,
      );
    }
  } catch (error) {
    console.error("Cleanup job failed:", error.message);
  }
};

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);

      // Run cleanup every 24 hours
      setInterval(runCleanupJob, 24 * 60 * 60 * 1000);
      // Run initial cleanup on startup
      runCleanupJob();
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

if (!process.env.VERCEL) {
  startServer();
}
