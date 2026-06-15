import { prisma } from '../config/prisma.js';

export const findSellerRequestById = async (id: string) => {
  return await prisma.sellerRequest.findUnique({
    where: { id },
  });
};

export const fetchPendingSellerRequests = async () => {
  return await prisma.sellerRequest.findMany({
    where: { status: 'Pending' },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
    orderBy: { created_at: 'asc' },
  });
};

export const approveSellerRequestService = async (
  sellerId: string,
  userId: string,
  adminId: string,
  sellerRequest: any
) => {
  return await prisma.$transaction(async (tx) => {
    await tx.sellerRequest.update({
      where: { id: sellerId },
      data: {
        status: 'Approved',
        reviewedBy: adminId,
        reviewedAt: new Date(),
      },
    });

    await tx.sellerProfile.create({
      data: {
        userId: sellerRequest.userId,
        storeName: sellerRequest.storeName,
        storeDescription: sellerRequest.storeDescription,
        businessEmail: sellerRequest.businessEmail,
        businessPhone: sellerRequest.businessPhone,
        businessAddress: sellerRequest.businessAddress,
        taxNumber: sellerRequest.taxNumber,
      },
    });

    await tx.user.update({
      where: { id: sellerRequest.userId },
      data: { role: 'Seller' },
    });
  });
};

export const rejectSellerRequestService = async (
  sellerId: string,
  adminId: string,
  adminNotes: string
) => {
  return await prisma.sellerRequest.update({
    where: { id: sellerId },
    data: {
      status: 'Rejected',
      adminNotes,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    },
  });
};