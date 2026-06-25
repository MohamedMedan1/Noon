import type { Prisma } from "../generated/prisma/client.js";

export const unRecordCouponUsages = async (
  tx: Prisma.TransactionClient,
  orderId: string,
  userId: string,
) => {
  const couponsUsages = await tx.couponUsage.findMany({
    where: {
      orderId,
    },
    include: {
      coupon: true,
    },
  });

  if (couponsUsages && couponsUsages.length > 0) {
    // Delete all couponUsages for that canceled\refunded order.
    await tx.couponUsage.deleteMany({
      where: {
        orderId,
        userId,
      },
    });

    const coupons = couponsUsages.map((cur) => cur.coupon);

    if (coupons && coupons.length > 0) {
      const updateCouponsQueries = coupons.map((cur) => {
        let data: { usageNumber: { decrement: number }; isValid?: boolean } = {
          usageNumber: { decrement: 1 },
        };

        if (new Date(cur.expiredTime) > new Date()) {
          data["isValid"] = true;
        }

        // Decrement all coupons usageNumber by one
        return tx.coupon.update({
          where: {
            id: String(cur?.id),
          },
          data,
        });
      });

      await Promise.all(updateCouponsQueries);
    }
  }
};
