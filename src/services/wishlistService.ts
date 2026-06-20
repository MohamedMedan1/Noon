import { prisma } from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/client.js';

export const getWishlistByUserId = async (userId: string) => {
  return await prisma.wishlist.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, name: true, price: true, images: true, stock: true },
          },
        },
        orderBy: { created_at: 'desc' },
      },
    },
  });
};

export const addItemToWishlistService = async (userId: string, productId: string) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('PRODUCT_NOT_FOUND');

    const wishlist = await tx.wishlist.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const existing = await tx.wishlistItem.findUnique({
      where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
    });
    if (existing) throw new Error('ALREADY_IN_WISHLIST');

    return await tx.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId },
    });
  });
};

export const removeItemFromWishlistService = async (userId: string, productId: string) => {
  const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
  if (!wishlist) return null;

  const item = await prisma.wishlistItem.findUnique({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
  });
  if (!item) return null;

  return await prisma.wishlistItem.delete({
    where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
  });
};

export const clearWishlistService = async (userId: string) => {
  const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
  if (!wishlist) return null;
  return await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id } });
};