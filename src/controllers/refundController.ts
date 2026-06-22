import type { NextFunction, Request, Response } from "express";
import {
  acceptRefundService,
  getAllRefundsService,
  getRefundService,
  rejectRefundService,
} from "../services/refundServices.js";

export const getAllRefunds = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = String(req.user?.id);
  const userRole = String(req.user?.role);

  const refunds = await getAllRefundsService(userId, userRole,req.query);

  res.status(200).json({
    status: "success",
    results: refunds.length,
    data: refunds,
  });
};

export const getRefund = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refundId = String(req.params.id);
  const userId = String(req.user?.id);
  const userRole = String(req.user?.role);

  const refund = await getRefundService(userId, userRole, refundId);

  res.status(200).json({
    status: "success",
    data: refund,
  });
};

export const handleRefund =
  (handleType: "accept" | "reject") =>
  async (req: Request, res: Response, next: NextFunction) => {
    const refundId = String(req.params.id);

    const refund =
      handleType === "accept"
        ? await acceptRefundService(refundId)
        : await rejectRefundService(refundId, req.body.rejectReason);

    res.status(200).json({
      status: "success",
      data: refund,
    });
  };
