import { Router } from "express";
import { getUsersController } from "../controller/user.controller";

const router = Router();

router.get("/", getUsersController);

export default router;
