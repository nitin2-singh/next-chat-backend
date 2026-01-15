import { Request, Response } from "express";
import { prisma } from "../config/prisma";

export async function getUsersController(req: Request, res: Response) {
  const userId = (req as any).user.userId;
  const search = (req.query.search as string)?.trim();

  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          id: {
            not: userId, // 👈 exclude self
          },
        },
        {
          OR: [
            {
              firstName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
    take: 10, // 👈 LIMIT (important)
  });

  res.status(201).json({ users: users });
}
