import { z } from "zod";

export const createReviewSchema = z.object({
  comment: z.string().min(3, "Comment must be at least 3 characters long"),
  rating: z
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5"),
});