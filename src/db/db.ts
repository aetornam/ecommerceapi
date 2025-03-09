import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import { cleanEnv, str, port } from "envalid";

dotenv.config();

// Detect if running inside Docker
const isDocker = process.env.IS_DOCKER === "true";

// Determine DB host dynamically
const env = cleanEnv(process.env, {
  DB_HOST: str({ default: isDocker ? "host.docker.internal" : "localhost" }),
  DB_PORT: port({ default: isDocker ? 5433 : 5433 }), // Use Fly.io DB port for Docker
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
  ssl: isDocker ? false : undefined, // ✅ Remove SSL for Fly.io
}); 

export const db = drizzle(pool);
export default db;
