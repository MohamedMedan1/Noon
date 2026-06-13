import type { Request, Response } from 'express';
import * as sellerService from '../services/sellerServices.js';
import type { Prisma } from '../generated/prisma/client.js';
import asyncHandler from 'express-async-handler';
export const getSellerProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) { 
    res.status(401).json({ status: 'Error', message: 'Not authenticated' });
    return; 
  }

  const sellerProfile = await sellerService.findSellerProfileByUserId(req.user.id);
  if (!sellerProfile) {
    res.status(404).json({ status: 'Error', message: 'Seller profile not found.' });
    return;
  }

  res.status(200).json({ status: 'Success', data: { sellerProfile } });
});

export const updateSellerProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ status: 'Error', message: 'Not authenticated' });
    return;
  }

  const cleanData = Object.fromEntries(
    Object.entries(req.body).filter(([_, value]) => value !== undefined)
  ) as Prisma.SellerProfileUpdateInput;

  try {
    const sellerProfile = await sellerService.upsertSellerProfileService(req.user.id, req.body.storeName, cleanData);
    res.status(200).json({ status: 'Success', message: 'Seller profile saved successfully', data: { sellerProfile } });
  } catch (error: any) {
    if (error.message === 'STORE_NAME_REQUIRED_FOR_CREATION') {
      res.status(400).json({ status: 'Error', message: 'Store name is absolutely required to create a brand new profile.' });
    } else {
      throw error;
    }
  }
});