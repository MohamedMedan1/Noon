import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    rating: z
      .number()
      .int()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot be more than 5"),
    text: z.string().min(3, "Comment must be at least 3 characters long"),
  }),
  params: z.object({
    productId: z.string(),
  }),
  query: z.object({}).optional(),
});

export const createCommentSchema = z.object({
  body: z.object({
    text: z.string().min(3, "Comment must be at least 3 characters long"),
  }),
  params: z.object({
    id: z.string(),
  }),
  query: z.object({}).optional(),
});

export const updateReviewSchema = z.object({
  body: z
    .object({
      rating: z
        .number()
        .int()
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot be more than 5")
        .optional(),
      text: z.string().min(3, "Comment must be at least 3 characters long").optional(),
    })
    .refine((data) => data.rating !== undefined || data.text !== undefined, {
      message: "At least one of rating or text must be provided",
    }),
  params: z.object({
    id: z.string(),
  }),
  query: z.object({}).optional(),
});