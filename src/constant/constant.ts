// Constants
export const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
export const SALT_ROUNDS = 10;
export const REDIS_TTL = 60 * 10; // Cache data for 10 minutes