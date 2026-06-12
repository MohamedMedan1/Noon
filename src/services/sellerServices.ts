import type { Prisma } from '../generated/prisma/index.js';
import { prisma } from '../config/prisma.js';

export const findSellerProfileByUserId = async (userId: string) => {
  return await prisma.sellerProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });
};

export const upsertSellerProfileService = async (
  userId: string,
  storeName: string,
  cleanData: Prisma.SellerProfileUpdateInput
) => {
  return await prisma.sellerProfile.upsert({
    where: { userId },
    update: cleanData,
    create: {
      userId,
      storeName,
      ...cleanData,
    } as Prisma.SellerProfileCreateInput,
  });
};