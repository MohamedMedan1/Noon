import { prisma } from "../config/prisma.js";
import { calculateCartTotalPrice } from "../helpers/calculateCartTotalPrice.js";
import { calculateDiscountForCoupons } from "../helpers/calculateDiscountForCoupons.js";
import { recordCouponUsages } from "../helpers/recordCouponUsages.js";
import { unRecordCouponUsages } from "../helpers/unRecordCouponUsages.js";
import { AppError } from "../utils/appError.js";
import { PrismaQueryFeatures } from "../utils/prismaQueryFeatures.js";

export const getAllOrdersService = async (
  userId: string,
  userRole: string,
  queryString: any,
) => {
  let getCondition = {};

  if (userRole === "Customer") {
    getCondition = { userId };
  } else if (userRole === "Seller") {
    getCondition = {
      orderItem: {
        some: {
          product: {
            seller: {
              userId,
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

  const orders = await features.execute(prisma.order);

  return orders;
};

export const createOrderService = async (
  orderData: any,
  userId: string,
  imageId: string,
) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      cartItems: {
        include: {
          product: {
            select: {
              price: true,
              seller:true
            },
          },
        },
      },
    },
  });

  if (!cart?.cartItems || cart?.cartItems.length === 0) {
    throw new AppError("Your cart is still empty!", 400);
  }

  const totalPrice = calculateCartTotalPrice(cart);
  const discount = await calculateDiscountForCoupons(cart);

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        totalPrice,
        orderPrice: totalPrice - discount,
        discount,
        userId,
      },
    });

    await tx.payment.create({
      data: {
        ...orderData,
        PaidImagePublicId: imageId,
        totalPaid: totalPrice - discount,
        orderId: newOrder.id,
      },
    });

    const orderItemsOperations = cart?.cartItems.map((cur) =>
      tx.orderItem.create({
        data: {
          orderId: newOrder.id,
          productId: cur.productId,
          quantity: cur.quantity,
          pricePerOne: Number(cur.product.price),
        },
      }),
    );

    await Promise.all(orderItemsOperations);

    // Record used coupons into couponsUsages  
    await recordCouponUsages(String(newOrder.id), userId, cart, tx);

    await tx.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        couponCodes:[]
      }
    });

    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return newOrder;
  });

  return order;
};

export const getOrderService = async (
  orderId: string,
  userId: string,
  userRole: string,
) => {
  let getCondition = {};

  if (userRole === "Customer") {
    getCondition = { userId };
  } else if (userRole === "Seller") {
    getCondition = {
      orderItem: {
        some: {
          product: {
            seller: {
              userId,
            },
          },
        },
      },
    };
  }

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      ...getCondition,
    },
    include: {
      orderItem: {
        select: {
          quantity: true,
          pricePerOne: true,
          product: {
            select: {
              name: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!order || !order.orderItem || order.orderItem.length === 0) {
    throw new AppError("There is no order or order items with that Id", 404);
  }

  return order;
};

export const approveOrderService = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new AppError("There is no order with that id", 404);
  }

  if (order?.status !== "Pending") {
    throw new AppError(
      `You can only approve order when is it still Pending now it is ${order.status}!`,
      403,
    );
  }

  const approvedOrder = await prisma.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: "Confirmed",
    },
  });

  return approvedOrder;
};

export const cancelOrderService = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new AppError("There is no order with that id", 404);
  }

  if (order?.status !== "Pending") {
    throw new AppError(
      `You can only cancel order when is it still Pending now it is ${order.status}!`,
      403,
    );
  }

  const orderItems = await prisma.orderItem.findMany({
    where: {
      orderId,
    },
  });

  if (!orderItems || orderItems.length === 0) {
    throw new AppError("There is no orderItems with that orderId!", 404);
  }

  const canceledOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: {
        id: orderId,
        status: "Pending",
      },
      data: {
        status: "Canceled",
      },
    });

    const stockUpdates = orderItems?.map((cur) =>
      tx.product.update({
        where: {
          id: cur.productId,
        },
        data: {
          stock: { increment: Number(cur.quantity) },
        },
      }),
    );

    await Promise.all(stockUpdates);

    await unRecordCouponUsages(tx, orderId,String(order.userId))

    return order;
  });

  return canceledOrder;
};

export const refundOrderService = async (
  orderId: string,
  refundData: any,
  userId: string,
) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    throw new AppError("There is no order with that id!", 404);
  }

  if (order.userId !== userId) {
    throw new AppError("You can only refund your own orders!", 403);
  }

  if (["Pending", "Canceled"].includes(order?.status)) {
    throw new AppError(
      `You can only refund your order when is it already Confirmed now it is ${order.status}!`,
      403,
    );
  }

  // Create Refund Request
  const [refundedRequestedOrder, refundRequest] = await prisma.$transaction([
    prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: "RefundRequested",
      },
    }),

    prisma.refundRequest.create({
      data: {
        ...refundData,
        orderId,
        userId,
      },
    }),
  ]);

  return { refundedRequestedOrder, refundRequest };
};
