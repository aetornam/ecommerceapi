import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import dotenv from "dotenv";
import { cleanEnv, str, port, bool } from "envalid";

dotenv.config();

// Validate and sanitize environment variables
const env = cleanEnv(process.env, {
  DATABASE_URL: str(),
  DB_SSL: bool({ default: false }), // SSL option (true/false)
});

// Create the PostgreSQL connection pool
const pool = new Pool({
  connectionString: env.DATABASE_URL, // Safe and validated
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : undefined, // Handle SSL correctly
});

// Create Drizzle ORM instance
export const db = drizzle(pool);
export default db;
