import { prisma } from '../config/prisma.js';
import type { Prisma } from '../generated/prisma/client.js';

export const getCartByUserId = async (userId: string) => {
  return await prisma.cart.findUnique({
    where: { userId },
    include: {
      cartItems: {
        include: {
          product: { select: { id: true, name: true, price: true, image: true, stock: true } },
        },
      },
    },
  });
};

export const safeAddItemToCartService = async (userId: string, productId: string, requestedQuantity: number) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw new Error('PRODUCT_NOT_FOUND');

    const cart = await tx.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });

    const existingItem = await tx.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    const totalRequestedQuantity = existingItem
      ? existingItem.quantity + requestedQuantity
      : requestedQuantity;

    if (product.stock < totalRequestedQuantity) {
      throw new Error(`INSUFFICIENT_STOCK:${existingItem?.quantity || 0}:${product.stock}`);
    }

    // <Handle Rece condition> decrament stock of product via add item to cart 
    await prisma.product.updateMany({
      where: {
        id: productId
      },
      data: {
        stock: { decrement: requestedQuantity }
      }
    });

    return await tx.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      create: { cartId: cart.id, productId, quantity: requestedQuantity },
      update: { quantity: { increment: requestedQuantity } },
    });
  });
};

export const safeUpdateCartItemQuantityService = async (userId: string, itemId: string, newQuantity: number) => {
  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const cartItem = await tx.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
      include: { product: true },
    });

    if (!cartItem) throw new Error('CART_ITEM_NOT_FOUND');
    if (!cartItem.product || cartItem.product.stock < newQuantity) throw new Error('INSUFFICIENT_STOCK');

    return await tx.cartItem.update({
      where: { id: itemId },
      data: { quantity: newQuantity },
    });
  });
};

export const removeCartItemService = async (userId: string, itemId: string) => {
  const cartItem = await prisma.cartItem.findFirst({ where: { id: itemId, cart: { userId } } });
  if (!cartItem) return null;
  return await prisma.cartItem.delete({ where: { id: itemId } });
};

export const clearCartService = async (userId: string) => {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return null;
  return await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
};