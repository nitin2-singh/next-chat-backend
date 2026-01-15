import { Router } from "express";
import { createMessage } from "../controller/messages.controller";

const router = Router();

router.post("/", createMessage);

export default router;
