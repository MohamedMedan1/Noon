import type { Request, Response } from 'express';
import * as wishlistService from '../services/wishlistService.js';

export const getWishlist = async (req: Request, res: Response): Promise<void> => {
  const wishlist = await wishlistService.getWishlistByUserId(req.user!.id);

  if (!wishlist || wishlist.items.length === 0) {
    res.status(200).json({ status: 'Success', data: { wishlist: { items: [] } } });
    return;
  }

  res.status(200).json({ status: 'Success', data: { wishlist } });
};

export const addItemToWishlist = async (req: Request, res: Response): Promise<void> => {
  const { productId } = req.body;

  try {
    const item = await wishlistService.addItemToWishlistService(req.user!.id, productId);
    res.status(201).json({ status: 'Success', message: 'Item added to wishlist', data: { item } });
  } catch (error: any) {
    if (error.message === 'PRODUCT_NOT_FOUND') {
      res.status(404).json({ status: 'Error', message: 'Product not found' });
    } else if (error.message === 'ALREADY_IN_WISHLIST') {
      res.status(400).json({ status: 'Error', message: 'Product is already in your wishlist' });
    } else {
      throw error;
    }
  }
};

export const removeItemFromWishlist = async (req: Request, res: Response): Promise<void> => {
  const productId = Array.isArray(req.params.productId)
    ? req.params.productId[0]
    : req.params.productId;

  if (!productId) {
    res.status(400).json({ status: 'Error', message: 'productId is required' });
    return;
  }

  const deleted = await wishlistService.removeItemFromWishlistService(req.user!.id, productId);
  if (!deleted) {
    res.status(404).json({ status: 'Error', message: 'Item not found in wishlist' });
    return;
  }

  res.status(200).json({ status: 'Success', message: 'Item removed from wishlist' });
};

export const clearWishlist = async (req: Request, res: Response): Promise<void> => {
  const cleared = await wishlistService.clearWishlistService(req.user!.id);
  if (!cleared) {
    res.status(404).json({ status: 'Error', message: 'Wishlist not found' });
    return;
  }

  res.status(200).json({ status: 'Success', message: 'Wishlist cleared' });
};