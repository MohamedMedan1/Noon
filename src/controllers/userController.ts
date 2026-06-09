import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { updateMeSchema } from '../validator/authValidator.js';

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ status: 'Error', message: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        isVerified: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      res.status(404).json({ status: 'Error', message: 'User not found' });
      return;
    }

    res.status(200).json({
      status: 'Success',
      data: { user },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

export const updateMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ status: 'Error', message: 'Not authenticated' });
      return;
    }

    const validation = updateMeSchema.safeParse(req.body);
    if (validation.success === false) {
      const issue = validation.error?.issues?.[0];
      res.status(400).json({
        status: 'Error',
        message: issue?.message ?? 'Invalid request data',
      });
      return;
    }

    const updateData: {
      name?: string;
      phone?: string;
      address?: string;
    } = {};


    if (validation.data.name !== undefined) 
      updateData.name = validation.data.name;

    if (validation.data.phone !== undefined)
       updateData.phone = validation.data.phone;

    if (validation.data.address !== undefined)
       updateData.address = validation.data.address;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        role: true,
        updated_at: true,
      },
    });

    res.status(200).json({
      status: 'Success',
      message: 'Profile updated successfully',
      data: { user: updatedUser },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};