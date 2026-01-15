import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "chat-backend",
  brokers: ["localhost:9092"],
});

export const producer = kafka.producer();
export const consumer = kafka.consumer({ groupId: "chat-group" });

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
