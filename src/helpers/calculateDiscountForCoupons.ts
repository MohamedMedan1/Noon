import { prisma } from "../config/prisma.js";
import { calculateCartTotalPrice } from "./calculateCartTotalPrice.js";

export const calculateDiscountForCoupons = async (
  cart: any,
  newCoupon?: any,
) => {
  let discount = 0;

  const couponsQueries = cart.couponCodes.map((cur: any) =>
    prisma.coupon.findFirst({
      where: {
        code: cur.toUpperCase().trim(),
      },
      include: {
        vendor: { select: { role: true } },
      },
    }),
  );

  // Get All Used Coupons
  const coupons = [...(await Promise.all(couponsQueries)), newCoupon];

  if (coupons.length > 0) {
    discount = coupons.reduce((acc, curCoupon) => {
      if (curCoupon?.valueType === "Fixed") {
        if (curCoupon?.vendor.role === "Seller") {
          const sellerProductsTotalPrice = calculateCartTotalPrice(
            cart,
            String(curCoupon.vendorId),
          );
          return (
            acc + Math.min(Number(curCoupon.value), sellerProductsTotalPrice)
          );
        } else {
          const cartTotalPrice = calculateCartTotalPrice(
            cart,
          );
          return (
            acc + Math.min(Number(curCoupon.value), cartTotalPrice)
          );
        }
      } else {
        if (curCoupon?.vendor.role === "Seller") {
          const sellerProductsTotalPrice = calculateCartTotalPrice(
            cart,
            String(curCoupon.vendorId),
          );
          return (
            acc + (Number(sellerProductsTotalPrice) * curCoupon.value) / 100
          );
        } else {
            const cartTotalPrice = calculateCartTotalPrice(
            cart,
          );
          return acc + (Number(curCoupon?.value) * cartTotalPrice) / 100;
        }
      }
    }, 0);
  }

  return discount;
};
