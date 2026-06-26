import "dotenv/config";
import fs from "fs";
import path from "path";
import { Kafka, logLevel } from "kafkajs";

const ca = fs.readFileSync(path.join(process.cwd(), "./", "ca.pem"), "utf8");

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID!,

  brokers: [process.env.KAFKA_BROKERS!],

  ssl: {
    ca: [ca],
  },

  sasl: {
    mechanism: "scram-sha-256",
    username: process.env.KAFKA_USERNAME!,
    password: process.env.KAFKA_PASSWORD!,
  },

  logLevel: logLevel.DEBUG,
});

export const producer = kafka.producer();

export const consumer = kafka.consumer({
  groupId: "chat-group",
});

// kafka-consumer.ts
export async function startKafkaConsumer(io: any) {
  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      const payload = JSON.parse(message.value.toString());

      // 🔥 fan-out via Socket.IO
      io.to(payload.chatId).emit("message:new", payload);
    },
  });
}

// bootstrap.ts
export async function initKafka() {
  await producer.connect();
  await consumer.connect();

  await consumer.subscribe({
    topic: "chat.messages",
    fromBeginning: false,
  });

  console.log("Kafka connected");
}
