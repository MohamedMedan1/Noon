import { prisma } from "../config/prisma.js";
import { unRecordCouponUsages } from "../helpers/unRecordCouponUsages.js";
import { AppError } from "../utils/appError.js";
import { PrismaQueryFeatures } from "../utils/prismaQueryFeatures.js";

export const getAllRefundsService = async (
  userId: string,
  userRole: string,
  queryString: any,
) => {
  let getCondition = {};

  if (userRole === "Customer") {
    getCondition = { userId };
  } else if (userRole === "Seller") {
    getCondition = {
      order: {
        orderItem: {
          some: {
            product: {
              seller: {
                userId,
              },
            },
          },
        },
      },
    };
  }

  const features = new PrismaQueryFeatures(queryString, getCondition)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const refunds = await features.execute(prisma.refundRequest);

  return refunds;
};

export const getRefundService = async (
  userId: string,
  userRole: string,
  refundId: string,
) => {
  let getCondition = {};

  if (userRole === "Customer") {
    getCondition = { userId };
  } else if (userRole === "Seller") {
    getCondition = {
      order: {
        orderItem: {
          some: {
            product: {
              seller: {
                userId,
              },
            },
          },
        },
      },
    };
  }

  const refund = await prisma.refundRequest.findFirst({
    where: {
      id: refundId,
      ...getCondition,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      order: true,
    },
  });

  if (!refund) {
    throw new AppError(
      "Refund request not found or you don't have permission to view it",
      404,
    );
  }

  return refund;
};

export const acceptRefundService = async (refundId: string) => {
  const refund = await prisma.refundRequest.findFirst({
    where: {
      id: refundId,
      status: "Pending",
    },
  });

  if (!refund) {
    throw new AppError("There is no request refund with that Id", 404);
  }

  const refundDetails = await prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: {
        id: String(refund.orderId),
        status:"RefundRequested",
      },
      include: {
        orderItem: true,
      },
      data: {
        status: "Refunded",
      },
    });

    const refunded = await tx.refundRequest.update({
      where: {
        id: refundId,
      },
      data: {
        status: "Accepted",
      },
    });

    const stockOperations = order.orderItem.map((cur) =>
      tx.product.update({
        where: {
          id: cur.productId,
        },
        data: {
          stock: { increment: cur.quantity },
        },
      }),
    );

    await Promise.all(stockOperations);

    await unRecordCouponUsages(tx,String(order.id),String(order.userId))

    return { order, refunded };
  });

  return refundDetails;
};

export const rejectRefundService = async (
  refundId: string,
  rejectReason: string,
) => {
  const refund = await prisma.refundRequest.findFirst({
    where: {
      id: refundId,
      status: "Pending",
    },
  });

  if (!refund) {
    throw new AppError("There is no request refund with that Id", 404);
  }

  const [order, rejectedRefund] = await prisma.$transaction([
    prisma.order.update({
      where: {
        id: String(refund.orderId),
      },
      data: {
        status: "RefundedRejected",
      },
    }),

    prisma.refundRequest.update({
      where: {
        id: refundId,
      },
      data: {
        rejectReason,
        status: "Rejected",
      },
    }),
  ]);

  return { order, rejectedRefund };
};
