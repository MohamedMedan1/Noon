import z from "zod";

const ALLOWED_EXTENSIONS = ["png", "jpeg", "jfif", "jpg"];

export const createOrderSchema = z.object({
  body: z.object({
    transactionId: z.string({
      error: "TransactionId is required to confirm your order",
    }),
    paymentMethod: z.string({
      error:
        "Please choose your payment method you can choose between 'InstaPay' and 'VodafoneCash'",
    }),
  }),
  file: z
    .object(
      {
        fieldname: z.string(),
        originalname: z.string(),
        mimetype: z.string(),
        buffer: z.instanceof(Buffer),
      },
      {
        error: "paid image is required",
      },
    )
    .refine(
      (file) => {
        if (file.mimetype.startsWith("image/")) return true;

        const fileExtension = file.originalname.split(".").pop()?.toLowerCase();
        return fileExtension
          ? ALLOWED_EXTENSIONS.includes(fileExtension)
          : false;
      },
      {
        message:
          "Invalid file type. Only JPG, JPEG, JFIF, and PNG images are allowed.",
        path: ["mimetype"],
      },
    ),
});

export const refundOrderSchema = z.object({
  body: z.object({
    reason: z
      .string({ error: "Refund reason is required" })
      .min(
        10,
        "Refund reason must be at least 10 characters. Please explain in detail.",
      )
      .max(50, "Refund reason can be at most 50 characters"),
  }),
  file: z
    .object(
      {
        fieldname: z.string(),
        originalname: z.string(),
        mimetype: z.string(),
        buffer: z.instanceof(Buffer),
      },
      {
        error: "Refund image is required",
      },
    )
    .optional()
    .refine(
      (file) => {
        if (!file) return true;
        if (file.mimetype.startsWith("image/")) return true;

        const fileExtension = file.originalname.split(".").pop()?.toLowerCase();
        return fileExtension
          ? ALLOWED_EXTENSIONS.includes(fileExtension)
          : false;
      },
      {
        message:
          "Invalid file type. Only JPG, JPEG, JFIF, and PNG images are allowed.",
        path: ["mimetype"],
      },
    ),
});
