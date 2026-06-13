import { prisma } from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/client.js';

export const checkUserRole = async (id: string) => {
  return await prisma.user.findUnique({ 
    where: { id }, 
    select: { role: true } 
  });
};

export const findRequestByUserId = async (userId: string) => {
  return await prisma.sellerRequest.findUnique({ where: { userId } });
};

export const submitOrUpdateSellerRequest = async (
  userId: string,
  storeName: string,
  businessEmail: string,
  cleanData: Prisma.SellerRequestUpdateInput
) => {
  return await prisma.sellerRequest.upsert({
    where: { userId },
    update: {
      ...cleanData,
      status: 'Pending',
      adminNotes: null,
      reviewedBy: null,
      reviewedAt: null,
    },
    create: {
      userId,
      storeName,
      businessEmail,
      ...cleanData,
      status: 'Pending',
    } as Prisma.SellerRequestCreateInput,
  });
};