import { z } from "zod";

const ALLOWED_EXTENSIONS = ["png", "jpeg", "jfif", "jpg"];

export const createBrandSchema = z.object({
  body: z.object({
    name: z
      .string({
        error: "Brand name is required",
      })
      .min(2, "Brand name must be at least 2 characters")
      .max(50, "Brand name cannot be exceed 50 characters"),
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
        error: "Brand image file is required",
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
  file: z
    .object(
      {
        fieldname: z.string(),
        originalname: z.string(),
        mimetype: z.string(),
        buffer: z.instanceof(Buffer),
      },
      {
        error: "Brand image file is required",
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
    )
    .optional(),
});
