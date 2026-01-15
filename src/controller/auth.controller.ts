import { Request, Response } from "express";
import * as authService from "../services/auth.service";

export async function signupController(req: Request, res: Response) {
  const { email, password, firstName, lastName } = req.body;
  const result = await authService.signup(email, password, firstName, lastName);
  res.status(201).json(result);
}

export async function loginController(req: Request, res: Response) {
  const { email, password } = req.body;

  const result = await authService.login(email, password);
  res.status(200).json(result);
}

export async function fetchMeController(req: Request, res: Response) {
  const userId = (req as any).user!.userId;
  const result = await authService.getUser(userId);
  res.status(200).json(result);
}
