import type { Request, Response, NextFunction } from "express";
import {
  createReviewService,
  getProductReviewsService,
  toggleReviewStatusService,
  deleteReviewService,
  addCommentToReviewService,
  updateReviewService,
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

export const addReview = async (
  req: Request<{ productId: string }>, 
  res: Response, 
  next: NextFunction
) => {
  const review = await createReviewService(
    req.user!.id,
    req.params.productId,
    req.body
  );
  sendResponse(res, 201, review);
};

export const addReviewComment = async (
  req: Request<{ id: string }>, 
  res: Response, 
  next: NextFunction
) => {
  const comment = await addCommentToReviewService(
    req.user!.id,
    req.params.id,
    req.body.text
  );
  sendResponse(res, 201, comment, "Comment added successfully");
};

export const updateReview = async (
  req: Request<{ id: string }>, 
  res: Response, 
  next: NextFunction
) => {
  const updatedReview = await updateReviewService(
    req.user!.id,
    req.params.id,
    req.body
  );
  sendResponse(res, 200, updatedReview, "Review updated successfully");
};

export const getProductReviews = async (
  req: Request<{ productId: string }>, 
  res: Response, 
  next: NextFunction
) => {
  const result = await getProductReviewsService(req.params.productId);
  sendResponse(res, 200, result);
};

export const toggleReviewStatus = async (
  req: Request<{ id: string }>, 
  res: Response, 
  next: NextFunction
) => {
  const updated = await toggleReviewStatusService(req.params.id);
  sendResponse(res, 200, updated, "Review status updated successfully");
};

export const deleteReview = async (
  req: Request<{ id: string }>, 
  res: Response, 
  next: NextFunction
) => {
  await deleteReviewService(
    req.params.id,
    req.user!.id,
    req.user!.role
  );
  sendResponse(res, 200, undefined, "Review deleted successfully");
};