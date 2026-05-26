import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool(
  env.databaseUrl
    ? { connectionString: env.databaseUrl }
    : {
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 5432),
        database: process.env.DB_NAME || "dyslexialens",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
      },
);

export const query = (text, params = []) => pool.query(text, params);
