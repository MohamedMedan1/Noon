import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";

export const validateCouponUsageLimit = async (
  couponId: string,
  userId: string,
) => {
  // Check couponUsages for that user
  const existingCouponUsage = await prisma.couponUsage.findFirst({
    where: {
      couponId: String(couponId),
      userId,
    },
  });

  if (existingCouponUsage) {
    throw new AppError("You have already used this coupon before!", 403);
  }
};
