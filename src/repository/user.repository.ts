import { prisma } from "../config/prisma";

export const userRepository = {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  create(email: string, password: string, firstName: string, lastName: string) {
    return prisma.user.create({
      data: { email, password, firstName, lastName },
    });
  },
};
