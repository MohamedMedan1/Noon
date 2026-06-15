import type { Request, Response, NextFunction } from "express";
import {
  createReviewService,
  getProductReviewsService,
  toggleReviewStatusService,
  deleteReviewService,
} from "../services/reviewServices.js";

const sendResponse = (
  res: Response,
  statusCode: number,
  data?: unknown,
  message?: string
) => {
  res.status(statusCode).json({
    status: "success",
    ...(message && { message }),
    ...(data !== undefined && { data }),
  });
};

export const addReview = async (req: Request, res: Response, next: NextFunction) => {
  const review = await createReviewService(
    (req as any).user.id,
    req.params.productId as string,
    req.body
  );
  sendResponse(res, 201, review);
};

export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  const result = await getProductReviewsService(req.params.productId as string);
  sendResponse(res, 200, result);
};

export const toggleReviewStatus = async (req: Request, res: Response, next: NextFunction) => {
  const updated = await toggleReviewStatusService(req.params.id as string);
  sendResponse(res, 200, updated, "Review status updated successfully");
};

export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
  await deleteReviewService(
    req.params.id as string,
    (req as any).user.id,
    (req as any).user.role
  );
  sendResponse(res, 200, undefined, "Review deleted successfully");
};