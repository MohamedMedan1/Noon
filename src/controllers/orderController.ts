import type { NextFunction, Request, Response } from "express";
import {
  approveOrderService,
  cancelOrderService,
  createOrderService,
  getAllOrdersService,
  getOrderService,
  refundOrderService,
} from "../services/orderServices.js";

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = String(req.user?.id);
  const userRole = String(req.user?.role);

  const orders = await getAllOrdersService(userId, userRole,req.query);

  res.status(201).json({
    status: "success",
    result: orders.length,
    data: orders,
  });
};

export const createNewOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {

  const userId = String(req.user?.id);
  
  const order = await createOrderService(
    req.body,
    userId,
    req.file?.cloudData,
  );

  res.status(201).json({
    status: "success",
    data: order,
  });
};

export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const orderId = String(req.params?.id);
  const userId = String(req.user?.id);
  const userRole = String(req.user?.role);

  const order = await getOrderService(orderId,userId,userRole);

  res.status(201).json({
    status: "success",
    data: order,
  });
};

export const approveOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userRole = String(req.user?.role);
  const orderId = String(req.params?.id);

  const order = await approveOrderService(orderId);

  res.status(201).json({
    status: "success",
    data: order,
  });
};

export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userRole = String(req.user?.role);
  const orderId = String(req.params?.id);

  const order = await cancelOrderService(orderId);

  res.status(201).json({
    status: "success",
    data: order,
  });
};

export const refundOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userRole = String(req.user?.role);
  const userId = String(req.user?.id);
  const orderId = String(req.params?.id);

  const {refundedRequestedOrder,refundRequest} = await refundOrderService(orderId,req.body,userId);

  res.status(201).json({
    status: "success",
    data: {
      order: refundedRequestedOrder,
      refundRequest
    },
  });
};


