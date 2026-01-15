import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/signup",
  "/auth/refresh",
  "/health",
];

export function requireAuthByDefault(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  //allow socket
  if (req.path.startsWith("/socket.io")) {
    console.log("skipped socket.io");
    return next();
  }

  // allow public routes
  if (PUBLIC_ROUTES.includes(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
