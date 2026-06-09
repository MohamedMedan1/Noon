import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sellerRequestSchema } from '../validator/authValidator.js';

export const submitSellerRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ status: 'Error', message: 'Not authenticated' });
      return;
    }

    const validation = sellerRequestSchema.safeParse(req.body);
    if (validation.success === false) {
      const issue = validation.error?.issues?.[0];
      res.status(400).json({
        status: 'Error',
        message: issue?.message ?? 'Invalid request data',
      });
      return;
    }

    const updateData: {
      storeName?: string;
      businessEmail?: string;
      storeDescription?: string | null;
      businessPhone?: string | null;
      businessAddress?: string | null;
      taxNumber?: string | null;
    } = {};

    if (validation.data.storeName !== undefined) 
        updateData.storeName = validation.data.storeName;

    if (validation.data.businessEmail !== undefined)
         updateData.businessEmail = validation.data.businessEmail;

    if (validation.data.storeDescription !== undefined)
         updateData.storeDescription = validation.data.storeDescription;

    if (validation.data.businessPhone !== undefined)
         updateData.businessPhone = validation.data.businessPhone;

    if (validation.data.businessAddress !== undefined) 
        updateData.businessAddress = validation.data.businessAddress;

    if (validation.data.taxNumber !== undefined)
         updateData.taxNumber = validation.data.taxNumber;

    const createData = {
      storeName: validation.data.storeName,
      businessEmail: validation.data.businessEmail,
      storeDescription: validation.data.storeDescription ?? null,
      businessPhone: validation.data.businessPhone ?? null,
      businessAddress: validation.data.businessAddress ?? null,
      taxNumber: validation.data.taxNumber ?? null,
    };

    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    });

    if (currentUser?.role === 'Seller') {
      res.status(400).json({
        status: 'Error',
        message: 'You are already a seller.',
      });
      return;
    }

    const existingRequest = await prisma.sellerRequest.findUnique({
      where: { userId: req.user.id },
    });

    if (existingRequest?.status === 'Pending') {
      res.status(400).json({
        status: 'Error',
        message: 'You already have a pending seller request. Please wait for admin review.',
      });
      return;
    }

    const sellerRequest = await prisma.sellerRequest.upsert({
      where: { userId: req.user.id },
      update: {
        ...updateData,
        status: 'Pending',
        adminNotes: null,
        reviewedBy: null,
        reviewedAt: null,
      },
      create: {
        userId: req.user.id,
        ...createData,
        status: 'Pending',
      },
    });

    res.status(201).json({
      status: 'Success',
      message: 'Your seller request has been submitted and is pending review.',
      data: { sellerRequest },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

export const getPendingRequests = async (req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.sellerRequest.findMany({
      where: { status: 'Pending' },
      include: {
        user: {
          select: { id: true, email: true, name: true, phone: true },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    res.status(200).json({
      status: 'Success',
      count: requests.length,
      data: { requests },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

export const approveSellerRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = Array.isArray(req.params.requestId) ? req.params.requestId[0] : req.params.requestId;

    if (!requestId) {
      res.status(400).json({ status: 'Error', message: 'requestId is required' });
      return;
    }

    if (!req.user?.id) {
      res.status(401).json({ status: 'Error', message: 'Not authenticated' });
      return;
    }

    const sellerRequest = await prisma.sellerRequest.findUnique({
      where: { id: requestId },
    });

    if (!sellerRequest) {
      res.status(404).json({ status: 'Error', message: 'Seller request not found' });
      return;
    }

    if (sellerRequest.status !== 'Pending') {
      res.status(400).json({
        status: 'Error',
        message: `This request has already been ${sellerRequest.status.toLowerCase()}`,
      });
      return;
    }

    await prisma.$transaction([
      prisma.sellerRequest.update({
        where: { id: requestId },
        data: {
          status: 'Approved',
          reviewedBy: req.user.id,
          reviewedAt: new Date(),
        },
      }),

      prisma.sellerProfile.create({
        data: {
          userId: sellerRequest.userId,
          storeName: sellerRequest.storeName,
          storeDescription: sellerRequest.storeDescription,
          businessEmail: sellerRequest.businessEmail,
          businessPhone: sellerRequest.businessPhone,
          businessAddress: sellerRequest.businessAddress,
          taxNumber: sellerRequest.taxNumber,
        },
      }),

      prisma.user.update({
        where: { id: sellerRequest.userId },
        data: { role: 'Seller' },
      }),
    ]);

    res.status(200).json({
      status: 'Success',
      message: 'Seller request approved. User has been upgraded to Seller.',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

export const rejectSellerRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const requestId = Array.isArray(req.params.requestId) ? req.params.requestId[0] : req.params.requestId;
    const { adminNotes } = req.body;

    if (!requestId) {
      res.status(400).json({ status: 'Error', message: 'requestId is required' });
      return;
    }

    if (!req.user?.id) {
      res.status(401).json({ status: 'Error', message: 'Not authenticated' });
      return;
    }

    if (!adminNotes || !adminNotes.trim()) {
      res.status(400).json({
        status: 'Error',
        message: 'adminNotes are required when rejecting a request',
      });
      return;
    }

    const sellerRequest = await prisma.sellerRequest.findUnique({
      where: { id: requestId },
    });

    if (!sellerRequest) {
      res.status(404).json({ status: 'Error', message: 'Seller request not found' });
      return;
    }

    if (sellerRequest.status !== 'Pending') {
      res.status(400).json({
        status: 'Error',
        message: `This request has already been ${sellerRequest.status.toLowerCase()}`,
      });
      return;
    }

    await prisma.sellerRequest.update({
      where: { id: requestId },
      data: {
        status: 'Rejected',
        adminNotes: adminNotes.trim(),
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
      },
    });

    res.status(200).json({
      status: 'Success',
      message: 'Seller request rejected. User can revise and resubmit.',
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};