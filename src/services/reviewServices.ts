import { prisma } from "../config/prisma.js";

interface CreateReviewInput {
  rating: number;
  comment: string;
}

interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

const appError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
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
      orderItem: { some: { productId } },
    },
  });
  if (!hasPurchased) {
    throw appError("You can only review products you have purchased and received.", 403);
  }

  const existingReview = await prisma.review.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  if (existingReview) throw appError("You already rated this product.", 400);

  return await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        userId,
        productId,
        rating: reviewData.rating,
        comment: reviewData.comment,
      },
    });

    const stats = await tx.review.aggregate({
      where: { productId, isActive: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.product.update({
      where: { id: productId },
      data: {
        avgRatings: stats._avg.rating ?? 0,
        ratingsQuantity: stats._count.rating ?? 0,
      },
    });

    return review;
  });
};

export const updateReviewService = async (
  userId: string,
  reviewId: string,
  updateData: UpdateReviewInput
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) throw appError("Review not found", 404);
  if (review.userId !== userId) throw appError("You can only update your own review", 403);

  return await prisma.$transaction(async (tx) => {
    const updatedReview = await tx.review.update({
      where: { id: reviewId },
      data: {
        ...(updateData.rating !== undefined && { rating: updateData.rating }),
        ...(updateData.comment !== undefined && { comment: updateData.comment }),
      },
    });

    const stats = await tx.review.aggregate({
      where: { productId: review.productId, isActive: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.product.update({
      where: { id: review.productId },
      data: {
        avgRatings: stats._avg.rating ?? 0,
        ratingsQuantity: stats._count.rating ?? 0,
      },
    });

    return updatedReview;
  });
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
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw appError("Review not found", 404);

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.review.update({
      where: { id: reviewId },
      data: { isActive: !review.isActive },
    });

    const stats = await tx.review.aggregate({
      where: { productId: review.productId, isActive: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.product.update({
      where: { id: review.productId },
      data: {
        avgRatings: stats._avg.rating ?? 0,
        ratingsQuantity: stats._count.rating ?? 0,
      },
    });

    return updated;
  });
};
export const addCommentToReviewService = async (
  userId: string,
  reviewId: string,
  text: string
) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw appError("Review not found", 404);

  return await prisma.review.update({
    where: { id: reviewId },
    data: { comment: text },
    include: {
      user: { select: { id: true, name: true } },
    },
  });
};

export const deleteReviewService = async (
  reviewId: string,
  userId: string,
  userRole: string
) => {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw appError("Review not found", 404);

  const isOwner = review.userId === userId;
  const isAdmin = ["Admin", "SuperAdmin"].includes(userRole);
  if (!isOwner && !isAdmin) {
    throw appError("You are not authorized to delete this review", 403);
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: reviewId } });

    const stats = await tx.review.aggregate({
      where: { productId: review.productId, isActive: true },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.product.update({
      where: { id: review.productId },
      data: {
        avgRatings: stats._avg.rating ?? 0,
        ratingsQuantity: stats._count.rating ?? 0,
      },
    });
  });
};