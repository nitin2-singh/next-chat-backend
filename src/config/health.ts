import { prisma } from "./prisma";
import { redis } from "./redis";
import { producer } from "./kafka";

export async function checkConnections() {
  console.log("🔍 Checking service connections...");

  // PostgreSQL
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ PostgreSQL connected");
  } catch (err) {
    console.error("❌ PostgreSQL connection failed");
    throw err;
  }

  // Redis
  try {
    const pong = await redis.ping();
    if (pong !== "PONG") throw new Error("Invalid Redis response");
    console.log("✅ Redis connected");
  } catch (err) {
    console.error("❌ Redis connection failed");
    throw err;
  }

  // Kafka
  try {
    await producer.connect();
    console.log("✅ Kafka producer connected");
  } catch (err) {
    console.error("❌ Kafka connection failed");
    throw err;
  }
}
