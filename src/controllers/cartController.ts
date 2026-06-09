/// controllers/cartController.ts
import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js'; 
import { addToCartSchema, updateCartItemSchema } from '../validator/cartValidator.js';

// GET /api/v1/cart
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ status: 'Error', message: 'Not authenticated' });
      return;
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        cartItems: {
          include: {
            product: {
              select: {
                id: true, name: true, price: true,
                images: true, stock: true,
              },
            },
          },
        },
      },
    });     

    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      res.status(200).json({
        status: 'Success',
        data: { cart: { cartItems: [], total: 0 } },
      });
      return;
    }

    const total = cart.cartItems.reduce(
      (sum, item) => sum + (item.product?.price || 0) * item.quantity, 0
    );

    res.status(200).json({
      status: 'Success',
      data: { cart: { ...cart, total } },
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'Error', 
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }) 
    });
  }
};

// POST /api/v1/cart/items
export const addItemToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ status: 'Error', message: 'Not authenticated' });
      return;
    }

    const validation = addToCartSchema.safeParse(req.body);
    if (validation.success === false) {
      const issue = validation.error?.issues?.[0];
      res.status(400).json({
        status: 'Error',
        message: issue?.message ?? 'Invalid request data',
      });
      return;
    }

    const { productId, quantity = 1 } = validation.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ status: 'Error', message: 'Product not found' });
      return;
    }

    const cart = await prisma.cart.upsert({
      where: { userId: req.user.id },
      create: { userId: req.user.id },
      update: {},
    });

    const existingItem = await prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } }
    });

    const totalRequestedQuantity = existingItem ? existingItem.quantity + quantity : quantity;

    if (product.stock < totalRequestedQuantity) {
      res.status(400).json({ 
        status: 'Error', 
        message: `Insufficient stock. You already have ${existingItem?.quantity || 0} in cart, and max available is ${product.stock}` 
      });
      return;
    }

    const cartItem = await prisma.cartItem.upsert({
      where: { cartId_productId: { cartId: cart.id, productId } },
      create: { cartId: cart.id, productId, quantity },
      update: { quantity: { increment: quantity } },
    });

    res.status(200).json({
      status: 'Success',
      message: 'Item added to cart',
      data: { cartItem },
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'Error', 
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }) 
    });
  }
};

// PATCH /api/v1/cart/items/:itemId
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ status: 'Error', message: 'Not authenticated' });
      return;
    }

    const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
    if (!itemId) {
      res.status(400).json({ status: 'Error', message: 'itemId is required' });
      return;
    }

    const validation = updateCartItemSchema.safeParse(req.body);
    if (validation.success === false) {
      const issue = validation.error?.issues?.[0];
      res.status(400).json({
        
        status: 'Error',
        message: issue?.message ?? 'Invalid request data',
      });
      return;
    }

    const { quantity } = validation.data;

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId: req.user.id } },
      include: { product: { select: { stock: true } } },
    });

    if (!cartItem) {
      res.status(404).json({ status: 'Error', message: 'Cart item not found' });
      return;
    }

    if (!cartItem.product || cartItem.product.stock < quantity) {
      res.status(400).json({ status: 'Error', message: 'Insufficient stock' });
      return;
    }

    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    res.status(200).json({
      status: 'Success',
      message: 'Cart item updated',
      data: { cartItem: updated },
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'Error', 
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }) 
    });
  }
};

// DELETE /api/v1/cart/items/:itemId
export const removeCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ status: 'Error', message: 'Not authenticated' });
      return;
    }

    const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
    if (!itemId) {
      res.status(400).json({ status: 'Error', message: 'itemId is required' });
      return;
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId: req.user.id } },
    });

    if (!cartItem) {
      res.status(404).json({ status: 'Error', message: 'Cart item not found' });
      return;
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    res.status(200).json({ status: 'Success', message: 'Item removed from cart' });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'Error', 
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }) 
    });
  }
};

// DELETE /api/v1/cart
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ status: 'Error', message: 'Not authenticated' });
      return;
    }

    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });

    if (!cart) {
      res.status(404).json({ status: 'Error', message: 'Cart not found' });
      return;
    }

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    res.status(200).json({ status: 'Success', message: 'Cart cleared successfully' });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'Error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};