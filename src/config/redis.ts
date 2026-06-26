import Redis from "ioredis";
import "dotenv/config";
console.log("process.env.REDIS_URL", process.env.REDIS_URL);
export const redis = new Redis({
  host: process.env.REDIS_URL,
  port: 6379,
});
