import type { Request, Response } from 'express';
import * as cartService from '../services/cartService.js';
import asyncHandler from 'express-async-handler';

export const getCart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ status: 'Error', message: 'Not authenticated' });
    return;
  }

  const cart = await cartService.getCartByUserId(req.user.id);
  if (!cart || !cart.cartItems || cart?.cartItems?.length === 0) {
    res.status(200).json({ status: 'Success', data: { cart: { cartItems: [], total: 0 } } });
    return;
  }

  const total = cart.cartItems.reduce((sum: number, item: any) => {
  return sum + (Number(item.product?.price ?? 0) * item.quantity);
  }, 0);

  res.status(200).json({ status: 'Success', data: { cart: { ...cart, total } } });
});

export const addItemToCart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ status: 'Error', message: 'Not authenticated' });
    return;
  }

  const { productId, quantity = 1 } = req.body;

  try {
    const cartItem = await cartService.safeAddItemToCartService(req.user.id, productId, quantity);
    res.status(200).json({ status: 'Success', message: 'Item added to cart', data: { cartItem } });
  } catch (error: any) {
    if (error.message === 'PRODUCT_NOT_FOUND') {
      res.status(404).json({ status: 'Error', message: 'Product not found' });
    } else if (error.message.startsWith('INSUFFICIENT_STOCK')) {
      const [_, inCart, stock] = error.message.split(':');
      res.status(400).json({ status: 'Error', message: `Insufficient stock. You already have ${inCart} in cart, and max available is ${stock}` });
    } else {
      throw error;
    }
  }
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ status: 'Error', message: 'Not authenticated' });
    return;
  }

  const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  const { quantity } = req.body;

  if (!itemId) {
    res.status(400).json({ status: 'Error', message: 'itemId is required' });
    return;
  }

  try {
    const updated = await cartService.safeUpdateCartItemQuantityService(req.user.id, itemId, quantity);
    res.status(200).json({ status: 'Success', message: 'Cart item updated', data: { cartItem: updated } });
  } catch (error: any) {
    if (error.message === 'CART_ITEM_NOT_FOUND') {
      res.status(404).json({ status: 'Error', message: 'Cart item not found' });
    } else if (error.message === 'INSUFFICIENT_STOCK') {
      res.status(400).json({ status: 'Error', message: 'Insufficient stock' });
    } else {
      throw error;
    }
  }
});

export const removeCartItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ status: 'Error', message: 'Not authenticated' });
    return;
  }

  const itemId = Array.isArray(req.params.itemId) ? req.params.itemId[0] : req.params.itemId;
  if (!itemId) {
    res.status(400).json({ status: 'Error', message: 'itemId is required' });
    return;
  }

  const deleted = await cartService.removeCartItemService(req.user.id, itemId);
  if (!deleted) {
    res.status(404).json({ status: 'Error', message: 'Cart item not found' });
    return;
  }

  res.status(200).json({ status: 'Success', message: 'Item removed from cart' });
});

export const clearCart = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ status: 'Error', message: 'Not authenticated' });
    return;
  }

  const cleared = await cartService.clearCartService(req.user.id);
  if (!cleared) {
    res.status(404).json({ status: 'Error', message: 'Cart not found' });
    return;
  }

  res.status(200).json({ status: 'Success', message: 'Cart cleared successfully' });
});