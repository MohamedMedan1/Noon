import { z } from "zod";

export const couponValueTypesEnum = z.enum(["Percentage", "Fixed"]);

export const createCouponSchema = z.object({
  body: z.object({
    code: z
      .string({ error: "Coupon code is required" })
      .trim()
      .min(3, "Code must be at least 3 characters")
      .max(20, "Code cannot exceed 20 characters")
      .toUpperCase(),
    value: z
      .number({ error: "Discount value is required" })
      .positive("Value must be a positive number"),
    valueType: couponValueTypesEnum,
    usageLimit: z
      .number({ error: "Usage limit is required" })
      .int("Usage limit must be an integer")
      .positive("Usage limit must be greater than 0"),
    minOrderValue: z
      .number()
      .positive("Minimum order value must be positive")
      .nullable()
      .optional(),
    maxDiscountValue: z
      .number()
      .positive("Maximum discount value must be positive")
      .nullable()
      .optional(),
    expiredTime: z.iso
      .datetime({ error: "Invalid date format, must be ISO 8601" })
      .refine((dateStr) => new Date(dateStr) > new Date(), {
        error: "Expiry time must be in the future",
      }),
  }),
});

export const updateCouponSchema = z.object({
  body: z.object({
    value: z.number().positive("Value must be a positive number").optional(),
    usageLimit: z
      .number()
      .int("Usage limit must be an integer")
      .positive("Usage limit must be greater than 0")
      .optional(),
    minOrderValue: z
      .number()
      .positive("Minimum order value must be positive")
      .nullable()
      .optional(),
    maxDiscountValue: z
      .number()
      .positive("Maximum discount value must be positive")
      .nullable()
      .optional(),
    expiredTime: z.iso
      .datetime()
      .refine((dateStr) => new Date(dateStr) > new Date(), {
        error: "Expiry time must be in the future",
      })
      .optional(),
  }),
});

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type updateCouponInput = z.infer<typeof updateCouponSchema>;
