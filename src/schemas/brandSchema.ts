import { z } from "zod";

export const createBrandSchema = z.object({
  body: z.object({
    name: z
      .string({
        error: "Brand name is required",
      })
      .min(2, "Brand name must be at least 2 characters")
      .max(50, "Brand name cannot be exceed 50 characters"),
  }),
  file: z.object(
    {
      fieldname: z.string(),
      originalname: z.string(),
      mimetype: z.string().refine((val) => val.startsWith("image/"), {
        message: "Only image files are allowed",
      }),
      buffer: z.instanceof(Buffer),
    },
    {
      error: "Brand image file is required",
    },
  ),
});

export const updateBrandSchema = z.object({
  body: z.object({
    name: z
      .string({
        error: "Brand name is required",
      })
      .min(2, "Brand name must be at least 2 characters")
      .max(50, "Brand name cannot be exceed 50 characters")
      .optional(),
  }),
  file: z.object(
    {
      fieldname: z.string(),
      originalname: z.string(),
      mimetype: z.string().refine((val) => val.startsWith("image/"), {
        message: "Only image files are allowed",
      }),
      buffer: z.instanceof(Buffer),
    },
    {
      error: "Brand image file is required",
    },
  ).optional(),
});
