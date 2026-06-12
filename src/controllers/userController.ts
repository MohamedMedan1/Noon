import type { Request, Response } from 'express';
import * as userService from '../services/userServices.js';
import asyncHandler from 'express-async-handler';

export const getMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ status: 'Error', message: 'Not authenticated' });
    return;
  }

  const user = await userService.findUserProfileById(req.user.id);
  if (!user) {
    res.status(404).json({ status: 'Error', message: 'User not found' });
    return;
  }

  res.status(200).json({ status: 'Success', data: { user } });
});

export const updateMe = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user?.id) {
    res.status(401).json({ status: 'Error', message: 'Not authenticated' });
    return;
  }

  const cleanData: Record<string, any> = {};
  if (req.body.name !== undefined) cleanData.name = req.body.name;
  if (req.body.phone !== undefined) cleanData.phone = req.body.phone;
  if (req.body.address !== undefined) cleanData.address = req.body.address;

  const updatedUser = await userService.updateUserProfileService(req.user.id, cleanData);

  res.status(200).json({
    status: 'Success',
    message: 'Profile updated successfully',
    data: { user: updatedUser },
  });
});