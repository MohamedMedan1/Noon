import { prisma } from "../config/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { calculateCartTotalPrice } from "../helpers/calculateCartTotalPrice.js";
import { calculateDiscountForCoupons } from "../helpers/calculateDiscountForCoupons.js";
import { validateCouponUsageLimit } from "../helpers/validateCouponUsageLimit.js";
import type {
  CreateCouponInput,
  updateCouponInput,
} from "../schemas/couponSchema.js";
import { AppError } from "../utils/appError.js";
import { PrismaQueryFeatures } from "../utils/prismaQueryFeatures.js";

export const getAllCouponsService = async (
  userId: string,
  userRole: string,
  queryString: any,
) => {
  let getCondition: any = { deletedAt: null };

  if (userRole === "Seller") {
    getCondition = {
      ...getCondition,
      vendorId: userId,
    };
  }

  const features = new PrismaQueryFeatures(queryString, getCondition);

  const coupons = await features.execute(prisma.coupon);

  return coupons;
};

export const createCouponService = async (userId: string, couponData: any) => {
  const code = couponData?.code;

  const existingCoupon = await prisma.coupon.findFirst({
    where: {
      code,
    },
  });

  if (existingCoupon) {
    throw new AppError("This coupon is already exist", 400);
  }

  const coupon = await prisma.coupon.create({
    data: {
      ...couponData,
      vendorId: userId,
      expiredTime: new Date(couponData.expiredTime),
    },
  });

  return coupon;
};

export const getCouponService = async (
  couponId: string,
  userId: string,
  userRole: string,
) => {
  const coupon = await prisma.coupon.findFirst({
    where: {
      id: couponId,
      deletedAt: null,
    },
    include: {
      vendor: {
        select: {
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  if (!coupon) {
    throw new AppError("There is no coupon with that Id!", 404);
  }

  if (
    coupon.vendorId !== userId &&
    !["Admin", "SuperAdmin"].includes(userRole)
  ) {
    throw new AppError(
      "You can only see your coupons and that not yours!",
      403,
    );
  }

  return coupon;
};

export const updateCouponService = async (
  couponId: string,
  userId: string,
  couponData: updateCouponInput,
) => {
  const coupon = await prisma.coupon.findFirst({
    where: {
      id: couponId,
      deletedAt: null,
    },
  });

  if (!coupon) {
    throw new AppError("There is no coupon with that Id", 404);
  }

  if (coupon.vendorId !== userId) {
    throw new AppError("You can only update your own coupons!", 403);
  }

  const { body } = couponData;
  const updateData: any = {
    value: body.value ?? undefined,
    usageLimit: body.usageLimit ?? undefined,
    minOrderValue: body.minOrderValue ?? undefined,
    maxDiscountValue: body.maxDiscountValue ?? undefined,
    expiredTime: body.expiredTime ? new Date(body.expiredTime) : undefined,
  };

  const updatedCoupon = await prisma.coupon.update({
    where: {
      id: couponId,
    },
    data: updateData,
  });

  return updatedCoupon;
};

export const deleteCouponService = async (couponId: string, userId: string) => {
  const coupon = await prisma.coupon.findFirst({
    where: {
      id: couponId,
      deletedAt: null,
    },
  });

  if (!coupon) {
    throw new AppError("There is no coupon with that Id", 404);
  }

  if (coupon.vendorId !== userId) {
    throw new AppError(
      "You can only delete your coupons and You don't own that ",
      403,
    );
  }

  const deletedCoupon = await prisma.coupon.update({
    where: {
      id: couponId,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return deletedCoupon;
};

export const getUsagesService = async (
  couponId: string,
  userId: string,
  userRole: string,
) => {
  const couponWithUsages = await prisma.coupon.findFirst({
    where: {
      id: couponId,
      ...(!["Admin", "SuperAdmin"].includes(userRole)
        ? { vendorId: userId }
        : {}),
    },
    include: {
      couponUsages: {
        include: {
          order: true,
        },
      },
    },
  });

  if (!couponWithUsages) {
    const checkCouponExist = await prisma.coupon.findUnique({
      where: { id: couponId },
    });
    if (!checkCouponExist) {
      throw new AppError("There is no coupon with that Id!", 404);
    }
    throw new AppError("You only can access your own coupons!", 403);
  }

  return couponWithUsages.couponUsages;
};

export const applyCouponService = async (
  couponCode: string,
  userId: string,
) => {
  const coupon = await prisma.coupon.findFirst({
    where: {
      code: couponCode.toUpperCase().trim(),
      isValid: true,
      deletedAt: null,
      expiredTime: { gt: new Date() },
      usageNumber: { lt: prisma.coupon.fields.usageLimit },
    },
    include: {
      vendor: true,
    },
  });

  if (!coupon) {
    throw new AppError("There no valid coupon with that Id!", 404);
  }

  // --- Cart coupons validations ---
  const userCart = await prisma.cart.findFirst({
    where: {
      userId,
    },
    include: {
      cartItems: {
        include: {
          product: {
            include: {
              seller: true,
            },
          },
        },
      },
    },
  });

  if (!userCart || userCart.cartItems.length === 0) {
    throw new AppError(
      "There is no cart for this user or no items in cart! ",
      404,
    );
  }

  if (new Set(userCart.couponCodes).has(coupon.code)) {
    throw new AppError(
      "You have already applied this coupon to your cart! ",
      403,
    );
  }

  // Check couponUsages for that user
  await validateCouponUsageLimit(String(coupon.id), userId);

  // Check if coupon is owned by seller then it is logical for your cart to hold at least one product for this seller
  if (coupon.vendor.role === "Seller") {
    const isExist = userCart.cartItems.some(
      (cur) => cur.product.seller.userId === coupon.vendor.id,
    );
    if (!isExist) {
      throw new AppError(
        "This coupon for seller that there is no product for him in your cart!",
        403,
      );
    }
  }

  const cartTotalPrice = calculateCartTotalPrice(userCart); 
  const totalDiscount = await calculateDiscountForCoupons(userCart,coupon);

  // Check if all coupon discount is at most 90% of order price
  if (totalDiscount > (cartTotalPrice * 90) / 100) {
    throw new AppError(
      "Sorry you cannot use this coupon due to the total discount of all applied coupons will be over than 90% of totalPrice ",
      403,
    );
  }

  // Apply Coupon
  const updatedCart = await prisma.cart.update({
    where: {
      userId,
    },
    data: {
      couponCodes: { push: couponCode.toUpperCase().trim() },
    },
  });

  return updatedCart;
};

export const undoCouponService = async (couponCode: string, userId: string) => {
  const fomratedCode = couponCode.toUpperCase().trim();
  
  const userCart = await prisma.cart.findFirst({
    where: {
      userId,
    }
  });

  if (!userCart) {
    throw new AppError("There is no cart for this user",400);
  }

  if (!new Set(userCart.couponCodes).has(fomratedCode)) {
    throw new AppError("You haven't applied this coupon to your cart!", 400);
  }

  const filteredCodes = userCart.couponCodes.filter(cur => cur !== fomratedCode);

  const updatedCart = await prisma.cart.update({
    where: {
      userId,
    },
    data: {
      couponCodes: { set: filteredCodes }
    }
  });

  return updatedCart;
}
