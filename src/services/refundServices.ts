import { prisma } from "../config/prisma.js";

export const getAllRefundsService = async (
  userId: string,
  userRole: string,
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
  const refunds = await prisma.refundRequest.findMany({
    where: getCondition,
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
    // We will handle errors later
    throw new Error(
      "Refund request not found or you don't have permission to view it",
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
    // We will handle this error later
    throw new Error("There is no request refund with that Id");
  }

  const [refundedOrder, acceptedRefund] = await prisma.$transaction([
    prisma.order.update({
      where: {
        id: String(refund.orderId),
      },
      data: {
        status: "Refunded",
      },
    }),

    prisma.refundRequest.update({
      where: {
        id: refundId,
      },
      data: {
        status: "Accepted",
      },
    }),
  ]);

  return { refundedOrder, acceptedRefund };
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
    // We will handle this error later
    throw new Error("There is no request refund with that Id");
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
