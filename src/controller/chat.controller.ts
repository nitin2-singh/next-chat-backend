import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function findCreateChat(req: Request, res: Response) {
  const currentUserId = (req as any).user!.userId;
  const { userId: otherUserId } = req.body;

  if (currentUserId === otherUserId) {
    return res.status(400).json({ message: "Cannot chat with yourself" });
  }

  const otherUser = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  if (!otherUser) {
    return res.status(404).json({ message: "User not found" });
  }

  const existingChat = await prisma.chat.findFirst({
    where: {
      AND: [
        { members: { some: { userId: currentUserId } } },
        { members: { some: { userId: otherUserId } } },
      ],
    },
  });

  if (existingChat) {
    return res.json({ chatId: existingChat.id, user: otherUser });
  }

  const chat = await prisma.chat.create({
    data: {
      members: {
        create: [{ userId: currentUserId }, { userId: otherUserId }],
      },
    },
  });

  res.status(201).json({ chatId: chat.id, user: otherUser });
}

export async function getChat(req: Request, res: Response) {
  const userId = (req as any).user!.userId;

  const chats = await prisma.chat.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1, // last message only
      },
    },
  });

  const result = await Promise.all(
    chats.map(async (chat) => {
      const otherUser = chat.members
        .map((m) => m.user)
        .find((u) => u.id !== userId)!;

      const unreadCount = await prisma.message.count({
        where: {
          chatId: chat.id,
          readAt: null,
          userId: {
            not: userId,
          },
        },
      });

      return {
        chatId: chat.id,
        user: otherUser,
        lastMessage: chat.messages[0] ?? null,
        updatedAt: chat.messages[0]?.createdAt ?? chat.createdAt,
        unreadCount,
      };
    })
  );

  res.json(result);
}

export async function getChatMessages(req: Request, res: Response) {
  const chatId = req.params.id;
  const userId = (req as any).user!.userId;

  // 1. Check membership
  const isMember = await prisma.chatMember.findFirst({
    where: {
      chatId,
      userId,
    },
  });

  if (!isMember) {
    return res.status(403).json({
      message: "Not authorized to view this chat",
    });
  }

  // 2. Fetch messages
  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      userId: true,
      createdAt: true,
      readAt: true,
    },
  });

  res.json(messages);
}

export async function readMessage(req: Request, res: Response) {
  const chatId = req.params.id;
  const userId = (req as any).user!.userId;

  await prisma.message.updateMany({
    where: {
      chatId,
      readAt: null,
      userId: {
        not: userId, // 👈 only messages from others
      },
    },
    data: {
      readAt: new Date(),
    },
  });

  const io = req.app.locals.io;

  io.to(chatId).emit("message:read", {
    chatId,
    readerId: userId,
  });

  res.json({ success: true });
}
