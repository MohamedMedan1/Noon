import z from "zod";

export const rejectRefundSchema = z.object({
  body: z.object({
    rejectReason: z
      .string({ error: "Rejection reason is required" })
      .min(
        10,
        "Rejection reason must be at least 10 characters. Please explain in detail.",
      )
      .max(200,"Refund reason can be at most 200 characters"),
  }),
});
