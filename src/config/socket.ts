import { Server } from "socket.io";
import http from "http";
import jwt from "jsonwebtoken";
import {
  addUserToChat,
  chatPresence,
  removeUserFromChat,
} from "../util/precense";

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

    socket.on("join", (chatId: string) => {
      socket.join(chatId);

      addUserToChat(chatId, userId);

      // 🔥 notify others in chat
      socket.to(chatId).emit("user:online", {
        userId,
        chatId,
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

    socket.on("typing", ({ chatId }) => {
      socket.to(chatId).emit("typing");
    });
  });

  return io;
}
