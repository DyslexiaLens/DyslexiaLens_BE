import { app } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/database.js";

const startServer = async () => {
  try {
    await pool.query("SELECT 1");
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

if (!process.env.VERCEL) {
  startServer();
}
