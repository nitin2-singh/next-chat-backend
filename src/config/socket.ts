import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import {
  addUserToChat,
  chatPresence,
  removeUserFromChat,
} from "../util/precense";
import { prisma } from "./prisma";

export function setupSocket(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  // 🔐 Socket authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Unauthorized"));

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };

      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;

    console.log("🟢 Socket connected:", socket.id, userId);

    // Join user-specific private room for global real-time notifications
    socket.join(userId);

    socket.on("join", (chatId: string) => {
      socket.join(chatId);

      addUserToChat(chatId, userId);

      // 🔥 notify others in chat
      socket.to(chatId).emit("user:online", {
        userId,
        chatId,
      });

      // Send initial presence back to the client
      const presence = chatPresence.get(chatId);
      socket.emit("presence:sync", {
        chatId,
        onlineUserIds: presence ? Array.from(presence) : [],
      });
    });

    socket.on("leave", (chatId: string) => {
      socket.leave(chatId);

      removeUserFromChat(chatId, userId);

      socket.to(chatId).emit("user:offline", {
        userId,
        chatId,
      });
    });

    socket.on("disconnect", () => {
      // remove user from ALL chats they joined
      for (const [chatId, users] of chatPresence.entries()) {
        if (users.has(userId)) {
          removeUserFromChat(chatId, userId);
          socket.to(chatId).emit("user:offline", {
            userId,
            chatId,
          });
        }
      }

      console.log("🔴 Socket disconnected:", socket.id);
    });

    socket.on("typing", async ({ chatId }) => {
      // Find other members of this chat to notify them in their private user rooms
      try {
        const members = await prisma.chatMember.findMany({
          where: {
            chatId,
            userId: { not: userId },
          },
        });

        members.forEach((member) => {
          io.to(member.userId).emit("typing", { chatId, userId });
        });
      } catch (err) {
        console.error("Typing socket broadcast error:", err);
      }
    });
  });

  return io;
}
