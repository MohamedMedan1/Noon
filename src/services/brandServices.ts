import { prisma } from "../config/prisma.js";
import { cloudinary } from "../config/cloudinary.js";
import { AppError } from "../utils/appError.js";
import { PrismaQueryFeatures } from "../utils/prismaQueryFeatures.js";

export const getAllBrandsService = async (queryString:any) => {
  const features = new PrismaQueryFeatures(queryString, { isActive: true })
    .filter()
    .sort()
    .limitFields()
    .paginate();
  
  return await features.execute(prisma.brand);
};

export const createBrandService = async (
  brandData: any,
  imagePublicId: string,
) => {
  const newBrand = await prisma.brand.create({
    data: { ...brandData, imagePublicId },
  });

  return newBrand;
};

export const updateBrandService = async (
  brandId: string,
  updateData: any,
  hasNewImage: boolean,
  newImageId: string,
) => {
  const brand = await prisma.brand.findUnique({
    where: {
      id: brandId,
    },
  });

  // We will handle errors later
  if (!brand) {
    throw new AppError("There is no brand with that Id!",404)
  };

  // If admin change brand Image then delete the old one
  if (hasNewImage) await cloudinary.uploader.destroy(brand.imagePublicId);

  const updatedBrand = await prisma.brand.update({
    where: {
      id: brandId,
    },
    data: {
      ...updateData,
      ...(hasNewImage && { imagePublicId: newImageId }),
    },
  });

  return updatedBrand;
};

export const deleteBrandService = async (brandId: string) => {
  const brand = await prisma.brand.findUnique({
    where: { id: brandId }
  });

  if (!brand) {
    throw new AppError("There is no brand with that Id!", 404);
  }

  const deletedBrand = await prisma.brand.update({
    where: { id: brandId },
    data: { isActive: false },
  });
  
  return deletedBrand;
};
