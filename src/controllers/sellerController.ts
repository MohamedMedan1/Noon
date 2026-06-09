import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sellerProfileSchema } from '../validator/authValidator.js';

export const getSellerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ status: 'Error', message: 'Not authenticated' });
      return;
    }

    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!sellerProfile) {
      res.status(404).json({
        status: 'Error',
        message: 'Seller profile not found. Please create your store profile first.',
      });
      return;
    }

    res.status(200).json({
      status: 'Success',
      data: { sellerProfile },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

export const updateSellerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ status: 'Error', message: 'Not authenticated' });
      return;
    }

    const validation = sellerProfileSchema.safeParse(req.body);
    if (validation.success === false) {
      const issue = validation.error?.issues?.[0];
      res.status(400).json({
        status: 'Error',
        message: issue?.message ?? 'Invalid request data',
      });
      return;
    }

    // هنا بنشيل أي حقل قيمته undefined عشان نرضي الـ exactOptionalPropertyTypes
    const profileData = Object.fromEntries(
      Object.entries(validation.data).filter(([_, value]) => value !== undefined)
    );

    const existingProfile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user.id },
    });

    const sellerProfile = await prisma.sellerProfile.upsert({
      where: { userId: req.user.id },
      update: profileData,
      create: {
        userId: req.user.id,
        storeName: validation.data.storeName,
        ...profileData,
      },
    });

    res.status(200).json({
      status: 'Success',
      message: existingProfile
        ? 'Seller profile updated successfully'
        : 'Seller profile created successfully',
      data: { sellerProfile },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};