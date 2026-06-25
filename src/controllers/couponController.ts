import type { NextFunction, Request, Response } from "express";
import {
  applyCouponService,
  createCouponService,
  deleteCouponService,
  getAllCouponsService,
  getCouponService,
  getUsagesService,
  undoCouponService,
  updateCouponService,
} from "../services/couponService.js";

export const getAllCoupons = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = String(req.user?.id);
  const userRole = String(req.user?.role);

  const coupons = await getAllCouponsService(userId, userRole, req.query);

  res.status(200).json({
    status: "success",
    results: coupons.length,
    data: coupons,
  });
};

export const createNewCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = String(req.user?.id);

  const coupon = await createCouponService(userId, req.body);

  res.status(200).json({
    status: "success",
    data: coupon,
  });
};

export const getCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const couponId = String(req.params.id);
  const userId = String(req.user?.id);
  const userRole = String(req.user?.role);

  const coupon = await getCouponService(couponId, userId, userRole);

  res.status(200).json({
    status: "success",
    data: coupon,
  });
};

export const updateCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const couponId = String(req.params.id);
  const userId = String(req.user?.id);

  const coupon = await updateCouponService(couponId, userId, req.body);

  res.status(200).json({
    status: "success",
    data: coupon,
  });
};

export const deleteCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const couponId = String(req.params.id);
  const userId = String(req.user?.id);

  const coupon = await deleteCouponService(couponId, userId);

  res.status(200).json({
    status: "success",
    data: coupon,
  });
};

export const applyCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = String(req.user?.id);
  const cartWithCoupon = await applyCouponService(String(req.body.code), userId);

  res.status(200).json({
    status: "success",
    data: cartWithCoupon,
  });
};

export const undoCoupon = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = String(req.user?.id);
  const cartWithoutCoupon = await undoCouponService(String(req.body.code), userId);

  res.status(200).json({
    status: "success",
    data: cartWithoutCoupon,
  });
};

export const getCouponUsages = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const couponId = String(req.params.id);
  const userId = String(req.user?.id);
  const userRole = String(req.user?.role);

  const usages = await getUsagesService(couponId, userId, userRole);

  res.status(200).json({
    status: "success",
    data: usages,
  });
};
