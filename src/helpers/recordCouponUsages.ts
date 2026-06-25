import type { Prisma } from "../generated/prisma/client.js";

export const recordCouponUsages = async (
  orderId: string,
  userId: string,
  cart: any,
  tx: Prisma.TransactionClient,
) => {
  const couponsQueries = cart.couponCodes.map((cur: any) =>
    tx.coupon.findFirst({
      where: {
        code: cur.toUpperCase().trim(),
      },
    }),
  );

  // Get All Coupons
  const coupons = (await Promise.all(couponsQueries)).filter(Boolean);

  if (coupons.length > 0) {
    const usagesQueries = coupons.map((cur) =>
      tx.couponUsage.create({
        data: {
          couponId: String(cur?.id),
          orderId: orderId,
          userId,
        },
      }),
    );

    const updateCouponsQueries = coupons.map((cur) => {
      let data: { usageNumber: { increment: number }; isValid?: boolean } = {
        usageNumber: { increment: 1 },
      };

      if (Number(cur.usageNumber) + 1 >= Number(cur.usageLimit)) {
        data["isValid"] = false;
      }

      return tx.coupon.update({
        where: {
          id: String(cur.id),
        },
        data,
      });
    });

    await Promise.all([...usagesQueries, ...updateCouponsQueries]);
  }
};
