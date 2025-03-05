import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redis from "../config/redisClient"; // Import Redis client

// **Rate Limiting Middleware**
export const rateLimiter = rateLimit({
    store: new RedisStore({
      sendCommand: async (...args: [string, ...string[]]): Promise<import("rate-limit-redis").RedisReply> => {
        return (await redis.call(...args)) as import("rate-limit-redis").RedisReply;
      },
    }),
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Allow 100 requests per minute per IP
    message: "Too many requests, please try again later.",
  });