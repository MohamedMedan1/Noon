import { prisma } from "../config/prisma.js";

export const getAllOrdersService = async (userId: string, userRole: string) => {
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

  const orders = await prisma.order.findMany({ where: getCondition });

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
            },
          },
        },
      },
    },
  });

  if (!cart?.cartItems || cart?.cartItems.length === 0) {
    // We will handle errors later
    throw new Error("Your cart is still empty!");
  }

  const totalCartPrice = Number(
    cart?.cartItems.reduce(
      (sum, cur) => sum + Number(cur.product.price ?? 0) * cur.quantity,
      0,
    ),
  );

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        totalPrice: totalCartPrice,
        orderPrice: totalCartPrice - 0,
        userId,
      },
    });

    const payment = await tx.payment.create({
      data: {
        ...orderData,
        PaidImagePublicId: imageId,
        totalPaid: totalCartPrice,
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
    // We will handle errors later
    throw new Error("There is no order or order items with that Id");
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
    // We will handle this error later
    throw new Error("There is no order with that id");
  }

  if (order?.status !== "Pending") {
    // We will handle this error later
    throw new Error(
      `You can only approve order when is it still Pending now it is ${order.status}!`,
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
    // We will handle this error later
    throw new Error("There is no order with that id");
  }

  if (order?.status !== "Pending") {
    // We will handle this error later
    throw new Error(
      `You can only cancle your order when is it still Pending now it is ${order.status}!`,
    );
  }

  const orderItems = await prisma.orderItem.findMany({
    where: {
      orderId,
    },
  });

  if (!orderItems || orderItems.length === 0) {
    // We will handle this error later
    throw new Error("There is no orderItems with that orderId!");
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
    // We will handle this error later
    throw new Error("There is no order with that id");
  }

  if (order.userId !== userId) {
    // We will handle errors later
    throw new Error("You can only refund your own orders!");
  }

  if (["Pending", "Canceled"].includes(order?.status)) {
    // We will handle this error later
    throw new Error(
      `You can only refund your order when is it already Confirmed now it is ${order.status}!`,
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
