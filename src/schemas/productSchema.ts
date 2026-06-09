import z from "zod";

const imageFileSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  mimetype: z.string().refine((val) => val.startsWith("image/"), {
    message: "Only image files are allowed",
  }),
  buffer: z.instanceof(Buffer),
  size: z.number().max(5 * 1024 * 1024, "Image size cannot exceed 5MB"),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string({ error: "Product name is required" })
      .min(2, "Product name must be at least 2 characters")
      .max(50, "Product name cannot be exceed 50 characters"),
    description: z
      .string({ error: "Product description is required" })
      .min(3, "Product description must be at least 3 characters")
      .max(100, "Product description cannot be exceed 100 characters"),
    price: z.coerce
      .number({ error: "Product price is required" })
      .gt(0, "Product price should be greater than 0"),
    stock: z.coerce
      .number({ error: "Product stock is required" })
      .gte(0, "Product stock should be greater than or equal 0"),
    categoryId: z.uuid({
      error: "CategoryId is required to complete product creation",
    }),
    brandId: z.uuid({
      error: "BrandId is required to complete product creation",
    }),
  }),
  files: z.object(
    {
      image: z.array(imageFileSchema).nonempty({
        message: "Product main image is required",
      }),
      subImages: z
        .array(imageFileSchema)
        .max(4, "You can upload up to 4 sub-images only")
        .optional(),
    },
    {
      error: "Product images are required",
    },
  ),
});
export const updateProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Product name must be at least 2 characters")
      .max(50, "Product name cannot be exceed 50 characters")
      .optional(),
    description: z
      .string()
      .min(3, "Product description must be at least 3 characters")
      .max(100, "Product description cannot be exceed 100 characters")
      .optional(),
    price: z.coerce
      .number()
      .gt(0, "Product price should be greater than 0")
      .optional(),
    stock: z.coerce
      .number()
      .gte(0, "Product stock should be greater than or equal 0")
      .optional(),
    categoryId: z.uuid().optional(),
    brandId: z.uuid().optional(),
  }),
  files: z
    .object({
      image: z.array(imageFileSchema).nonempty().optional(),
    })
    .optional(),
});

export const addImageSchema = z.object({
  files: z.object(
    {
      subImages: z
        .array(imageFileSchema)
        .max(4, "You can upload up to 4 sub-images only"),
    },
    {
      error: "Product images are required",
    },
  ),
});

export const deleteImageSchema = z.object({
  body: z.object({
    imageId: z.string({ error: "Image publicId is required to delete" }),
  }),
});
