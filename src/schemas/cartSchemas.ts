import { z } from "zod";

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string().min(1, "productId is required"),
    quantity: z
      .number()
      .int("quantity must be an integer")
      .min(1, "quantity must be at least 1")
      .optional(),
  }),
});

export const updateCartItemSchema = z.object({
  body: z.object({
    quantity: z
      .number()
      .int("quantity must be an integer")
      .min(1, "quantity must be at least 1"),
  }),
});
