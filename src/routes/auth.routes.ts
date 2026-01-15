import { Router } from "express";
import {
  fetchMeController,
  loginController,
  signupController,
} from "../controller/auth.controller";

const router = Router();

router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/me", fetchMeController);

export default router;
