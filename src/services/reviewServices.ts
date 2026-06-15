import { prisma } from "../config/prisma.js";

interface CreateReviewInput {
  comment: string;
  rating: number;
}

const appError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

const findReviewOrThrow = async (reviewId: string) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw appError("Review not found", 404);
  return review;
};

const recalculateProductRating = async (productId: string) => {
  const { _avg } = await prisma.review.aggregate({
    where: { productId, isActive: true },
    _avg: { rating: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: { avgRatings: _avg.rating ?? 0 },
  });
};

export const createReviewService = async (
  userId: string,
  productId: string,
  reviewData: CreateReviewInput
) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw appError("Product not found", 404);

  const hasPurchased = await prisma.order.findFirst({
    where: {
      userId,
      status: "Delivered",
      OrderItems: { some: { productId } },
    },
  });
  if (!hasPurchased) {
    throw appError(
      "You can only review products you have purchased and received.",
      403
    );
  }

  const existingReview = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (existingReview) throw appError("You already reviewed this product", 400);

  const review = await prisma.review.create({
    data: {
      userId,
      productId,
      comment: reviewData.comment,
      rating: reviewData.rating,
    },
  });

  await recalculateProductRating(productId);
  return review;
};

export const getProductReviewsService = async (productId: string) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw appError("Product not found", 404);

  const [reviews, stats] = await Promise.all([
    prisma.review.findMany({
      where: { productId, isActive: true },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.aggregate({
      where: { productId, isActive: true },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  return {
    averageRating: stats._avg.rating ?? 0,
    totalReviews: stats._count.rating ?? 0,
    reviews,
  };
};

export const toggleReviewStatusService = async (reviewId: string) => {
  const review = await findReviewOrThrow(reviewId);

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: { isActive: !review.isActive },
  });

  await recalculateProductRating(review.productId);
  return updated;
};

export const deleteReviewService = async (
  reviewId: string,
  userId: string,
  userRole: string
) => {
  const review = await findReviewOrThrow(reviewId);

  const isOwner = review.userId === userId;
  const isAdmin = ["Admin", "SuperAdmin"].includes(userRole);
  if (!isOwner && !isAdmin) {
    throw appError("You are not authorized to delete this review", 403);
  }

  await prisma.review.delete({ where: { id: reviewId } });
  await recalculateProductRating(review.productId);
};