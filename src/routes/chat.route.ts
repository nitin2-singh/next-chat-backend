import { Router } from "express";
import {
  findCreateChat,
  getChat,
  getChatMessages,
  readMessage,
} from "../controller/chat.controller";

const router = Router();

router.post("/", findCreateChat);
router.get("/", getChat);
router.get("/:id/messages", getChatMessages);
router.get("/:id/read", readMessage);

export default router;
