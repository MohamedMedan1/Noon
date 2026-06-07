import z from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string({
        error: "Category name is required",
      })
      .min(2, "Category name must be at least 2 characters")
      .max(50, "Category name cannot be exceed 50 characters"),
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
      error: "Category image file is required",
    },
  ),
});
export const updateCategorySchema = z.object({
  body: z.object({
    name: z
      .string({
        error: "Category name is required",
      })
      .min(2, "Category name must be at least 2 characters")
      .max(50, "Category name cannot be exceed 50 characters")
      .optional(),
    parentCategoryId: z
      .string()
      .uuid("Invalid category ID format")
      .nullable()
      .optional(),
  }),
  file: z
    .object(
      {
        fieldname: z.string(),
        originalname: z.string(),
        mimetype: z.string().refine((val) => val.startsWith("image/"), {
          message: "Only image files are allowed",
        }),
        buffer: z.instanceof(Buffer),
      },
      {
        error: "Category image file is required",
      },
    )
    .optional(),
});
