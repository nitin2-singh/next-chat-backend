import Redis from "ioredis";
import "dotenv/config";
console.log("process.env.REDIS_URL", process.env.REDIS_URL);
export const redis = new Redis(process.env.REDIS_URL!);
