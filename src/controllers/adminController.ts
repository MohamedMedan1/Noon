import type { Request, Response } from 'express';
import * as adminService from '../services/adminService.js';

export const getPendingRequests = async (req: Request, res: Response): Promise<void> => {
  const requests = await adminService.fetchPendingSellerRequests();
  res.status(200).json({ status: 'Success', count: requests.length, data: { requests } });
};

export const approveSellerRequest = async (req: Request, res: Response): Promise<void> => {
  const requestId = Array.isArray(req.params.requestId) ? req.params.requestId[0] : req.params.requestId;
  if (!requestId || !req.user?.id) {
    res.status(400).json({ status: 'Error', message: 'requestId is required and admin must be logged in' });
    return;
  }

  const sellerRequest = await adminService.findSellerRequestById(requestId);
  if (!sellerRequest) {
    res.status(404).json({ status: 'Error', message: 'Seller request not found' });
    return;
  }

  if (sellerRequest.status !== 'Pending') {
    res.status(400).json({ status: 'Error', message: `This request has already been ${sellerRequest.status.toLowerCase()}` });
    return;
  }


await adminService.approveSellerRequestService(requestId, req.user!.id, sellerRequest.userId, sellerRequest);
  res.status(200).json({ status: 'Success', message: 'Seller request approved. User has been upgraded to Seller.' });
};

export const rejectSellerRequest = async (req: Request, res: Response): Promise<void> => {
  const requestId = Array.isArray(req.params.requestId) ? req.params.requestId[0] : req.params.requestId;
  const { adminNotes } = req.body;

  if (!requestId || !req.user?.id) {
    res.status(400).json({ status: 'Error', message: 'requestId is required' });
    return;
  }

  if (!adminNotes || !adminNotes.trim()) {
    res.status(400).json({ status: 'Error', message: 'adminNotes are required when rejecting a request' });
    return;
  }

  const sellerRequest = await adminService.findSellerRequestById(requestId);
  if (!sellerRequest) {
    res.status(404).json({ status: 'Error', message: 'Seller request not found' });
    return;
  }

  if (sellerRequest.status !== 'Pending') {
    res.status(400).json({ status: 'Error', message: `This request has already been ${sellerRequest.status.toLowerCase()}` });
    return;
  }

await adminService.rejectSellerRequestService(requestId, req.user!.id, adminNotes.trim());
  res.status(200).json({ status: 'Success', message: 'Seller request rejected. User can revise and resubmit.' });
};