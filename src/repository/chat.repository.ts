import { prisma } from "../config/prisma";

export const chatRepository = {
  async findByUserId(userId: string) {
    const chats = await prisma.chat.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // 👈 last message only
        },
      },
      orderBy: {
        messages: {},
      },
    });

    return chats;
  },
};
