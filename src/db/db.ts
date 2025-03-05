import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import { cleanEnv, str, port } from "envalid";

dotenv.config();

// Validate and sanitize environment variables
const env = cleanEnv(process.env, {
  DB_HOST: str(),
  DB_USER: str(),
  DB_PASSWORD: str(),
  DB_NAME: str(),
  DB_PORT: port({ default: 5432 }),
});

const pool = new Pool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  port: env.DB_PORT,
});

export const db = drizzle(pool);
export default db;
