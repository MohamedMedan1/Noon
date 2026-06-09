import type { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

// PATCH /api/v1/admin/sellers/:sellerId/review
export const approveSeller = async (req: Request, res: Response): Promise<void> => {
  try {
    const sellerId = Array.isArray(req.params.sellerId)
      ? req.params.sellerId[0]
      : req.params.sellerId;

    const { action, adminNotes } = req.body;

    if (!sellerId) {
      res.status(400).json({ status: 'Error', message: 'sellerId is required' });
      return;
    }

    if (!action || !['Approve', 'Reject'].includes(action)) {
      res.status(400).json({
        status: 'Error',
        message: 'Invalid action. Must be "Approve" or "Reject"',
      });
      return;
    }

    if (action === 'Reject' && !adminNotes) {
      res.status(400).json({
        status: 'Error',
        message: 'adminNotes are required when rejecting a request',
      });
      return;
    }

    const sellerRequest = await prisma.sellerRequest.findUnique({
      where: { id: sellerId },
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

    // ─── Approve 
    if (action === 'Approve') {
      await prisma.$transaction(async (tx) => {
        await tx.sellerRequest.update({
          where: { id: sellerId },
          data: {
            status: 'Approved',
            reviewedBy: req.user!.id,
            reviewedAt: new Date(),
          },
        });

        await tx.sellerProfile.create({
          data: {
            userId: sellerRequest.userId,
            storeName: sellerRequest.storeName,
            storeDescription: sellerRequest.storeDescription,
            businessEmail: sellerRequest.businessEmail,
            businessPhone: sellerRequest.businessPhone,
            businessAddress: sellerRequest.businessAddress,
            taxNumber: sellerRequest.taxNumber,
          },
        });

        await tx.user.update({
          where: { id: sellerRequest.userId },
          data: { role: 'Seller' },
        });
      });

      res.status(200).json({
        status: 'Success',
        message: 'Seller request approved. User has been upgraded to Seller.',
      });
      return;
    }

    // ─── Reject 
    if (action === 'Reject') {
      await prisma.sellerRequest.update({
        where: { id: sellerId },
        data: {
          status: 'Rejected',
          adminNotes,
          reviewedBy: req.user!.id,
          reviewedAt: new Date(),
        },
      });

      res.status(200).json({
        status: 'Success',
        message: 'Seller request rejected. User can revise and resubmit.',
      });
      return;
    }
  } catch (error: any) {
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { error: error.message }),
    });
  }
};

// GET /api/v1/admin/sellers/pending
export const getPendingSellers = async (req: Request, res: Response): Promise<void> => {
  try {
    const pendingRequests = await prisma.sellerRequest.findMany({
      where: { status: 'Pending' },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { created_at: 'asc' },
    });

    res.status(200).json({
      status: 'Success',
      count: pendingRequests.length,
      data: { requests: pendingRequests },
    });
  } catch (error: any) {
    console.error('Error fetching pending seller requests:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Internal server error',
      error: error.message
    });
  }
};