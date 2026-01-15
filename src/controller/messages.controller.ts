import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { producer } from "../config/kafka";

export async function createMessage(req: Request, res: Response) {
  const userId = (req as any).user!.userId;
  const { chatId, content } = req.body;

  if (!chatId || !content?.trim()) {
    return res.status(400).json({
      message: "chatId and content are required",
    });
  }

  // 1. Check membership
  const isMember = await prisma.chatMember.findFirst({
    where: {
      chatId,
      userId,
    },
  });

  if (!isMember) {
    return res.status(403).json({
      message: "Not authorized to send messages",
    });
  }

  // 2. Save message
  const message = await prisma.message.create({
    data: {
      chatId,
      userId,
      content,
    },
    select: {
      id: true,
      content: true,
      userId: true,
      createdAt: true,
      readAt: true,
    },
  });

  // 2. Kafka event (AFTER DB write)
  await producer.send({
    topic: "chat.messages",
    messages: [
      {
        key: chatId, // 🔥 keeps ordering per chat
        value: JSON.stringify(message),
      },
    ],
  });

  req.app.locals.io.to(chatId).emit("message:new", message);

  // 3. (Later) Produce Kafka event here
  res.status(201).json(message);
}
