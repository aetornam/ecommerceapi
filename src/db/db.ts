import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import { cleanEnv, str, port } from "envalid";

dotenv.config();

// Check if running locally (FLY_APP_NAME is only available in Fly.io)
const isLocal = !process.env.FLY_APP_NAME;

const env = cleanEnv(process.env, {
  DB_HOST: str({ default: isLocal ? "localhost" : "ecommerce-db-app.internal" }),
  DB_PORT: port({ default: isLocal ? 5433 : 5432 }), // Use 5433 for local proxy
  DB_USER: str(),
  DB_PASSWORD: str(),
  DB_NAME: str(),
});

const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  ssl: isLocal ? false : { rejectUnauthorized: false }, // Only use SSL on Fly.io
});

export const db = drizzle(pool);
export default db;
