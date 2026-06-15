import { prisma } from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/client.js';

export const findUserProfileById = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      role: true,
      isVerified: true,
      created_at: true,
    },
  });
};

export const updateUserProfileService = async (id: string, cleanData: Prisma.UserUpdateInput) => {
  return await prisma.user.update({
    where: { id },
    data: cleanData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      role: true,
    },
  });
};