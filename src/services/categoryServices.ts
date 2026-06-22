import { cloudinary } from "../config/cloudinary.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";
import { PrismaQueryFeatures } from "../utils/prismaQueryFeatures.js";

export const getAllCategoriesService = async (queryString: any) => {
  const features = new PrismaQueryFeatures(queryString, { isActive: true })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  return await features.execute(prisma.category);
};

export const createCategoryService = async (
  categoryData: any,
  imagePublicId: string,
) => {
  const category = await prisma.category.create({
    data: { ...categoryData, imagePublicId },
  });

  return category;
};

export const getCategoryService = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    include: {
      parentCategory: {
        select: { name: true },
      },
    },
  });

  if (!category) {
    throw new AppError("There is no category with that Id", 404);
  }

  return category;
};

export const updateCategoryService = async (
  categoryData: any,
  categoryId: string,
  hasNewImage: boolean,
  newImageId: string,
) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new AppError("There is no category with that Id", 404);
  }

  if (categoryData.parentCategoryId === categoryId) {
    throw new AppError("A category cannot be its own parent!", 400);
  }

  if (hasNewImage) await cloudinary.uploader.destroy(category.imagePublicId);

  const updatedCategory = await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: {
      ...categoryData,
      ...(hasNewImage && { imagePublicId: newImageId }),
    },
  });

  return updatedCategory;
};

export const deleteCategoryService = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError("There is no category with that Id", 404);
  }

  const [updatedCategory, _] = await prisma.$transaction([
    prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        isActive: false,
      },
    }),
    prisma.category.updateMany({
      where: {
        parentCategoryId: categoryId,
      },
      data: {
        isActive: false,
      },
    }),
  ]);

  return updatedCategory;
};
