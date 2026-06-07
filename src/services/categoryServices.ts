import { cloudinary } from "../config/cloudinary.js";
import { prisma } from "../config/prisma.js";

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

  // We will handle errors later
  if (!category) throw new Error("There is no category with that Id");

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

  // We will handle this error later
  if (!category) throw new Error("There is no category with that ID");

  if (categoryData.parentCategoryId === categoryId) {
    // We will handle errors later
    throw new Error("A category cannot be its own parent!");
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
  const [category, _] = await prisma.$transaction([
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

  return category;
};
