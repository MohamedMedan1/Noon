import type { Request, Response } from 'express';
import * as requestService from '../services/sellerRequestService.js';
import type { Prisma } from '../generated/prisma/index.js';

export const submitSellerRequest = async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ status: 'Error', message: 'Not authenticated' });
    return;
  }

  const currentUser = await requestService.checkUserRole(req.user.id);
  if (currentUser?.role === 'Seller') {
    res.status(400).json({ status: 'Error', message: 'You are already a seller.' });
    return;
  }

  const existingRequest = await requestService.findRequestByUserId(req.user.id);
  if (existingRequest?.status === 'Pending') {
    res.status(400).json({ status: 'Error', message: 'You already have a pending seller request. Please wait for admin review.' });
    return;
  }

  const cleanData = Object.fromEntries(
    Object.entries(req.body).filter(([_, value]) => value !== undefined)
  ) as Prisma.SellerRequestUpdateInput;

  const sellerRequest = await requestService.submitOrUpdateSellerRequest(
    req.user.id,
    req.body.storeName,
    req.body.businessEmail,
    cleanData
  );

  res.status(201).json({ status: 'Success', message: 'Your seller request has been submitted and is pending review.', data: { sellerRequest } });
};