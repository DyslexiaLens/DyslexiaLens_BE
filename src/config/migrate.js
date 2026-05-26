import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.resolve(__dirname, "../../migrations");

const runMigrations = async () => {
  const client = await pool.connect();

  try {
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");
      console.log(`Migration success: ${file}`);
    }

    console.log("All migrations completed");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

runMigrations();
