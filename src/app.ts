import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import chatRoutes from "./routes/chat.route";
import userRoutes from "./routes/user.routes";
import messagesRoutes from "./routes/messages.route";

import { errorMiddleware } from "./middleware/error-middleware";
import { requireAuthByDefault } from "./middleware/auth-middleware";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requireAuthByDefault);

app.use("/auth", authRoutes);
app.use("/chats", chatRoutes);
app.use("/users", userRoutes);
app.use("/messages", messagesRoutes);

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.use(errorMiddleware);

export default app;
