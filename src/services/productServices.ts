import { cloudinary } from "../config/cloudinary.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";
import { PrismaQueryFeatures } from "../utils/prismaQueryFeatures.js";

export const getAllProductsService = async (queryString: any) => {
  const features = new PrismaQueryFeatures(queryString, {
    isActive: true,
    category: {
      isActive: true,
    },
    brand: {
      isActive: true,
    },
  })
    .filter()
    .sort()
    .limitFields()
    .paginate();

  return await features.execute(prisma.product);
};

export const createProductService = async (
  productData: any,
  mainImgId: string,
  sellerId: string,
) => {
  const readyProductData = {
    ...productData,
    price: Number(productData.price),
    stock: Number(productData.stock),
    imagePublicId: mainImgId,
  };

  const sellerProfile = await prisma.sellerProfile.findFirst({
    where: {
      userId: sellerId,
    },
  });

  if (!sellerProfile) {
    throw new AppError("There is no seller profile with that Id", 404);
  }

  const product = await prisma.product.create({
    data: {
      ...readyProductData,
      sellerId:sellerProfile.id,
    },
  });

  return product;
};

export const getProductService = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: {
        select: { name: true },
      },
      brand: {
        select: { name: true },
      },
    },
  });

  if (!product) {
    throw new AppError("There is no product with that Id", 404);
  }

  return product;
};

export const updateProductService = async (
  productId: string,
  productData: any,
  hasNewImage: boolean,
  newImageId?: string,
) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError("There is no product with that Id", 404);
  }

  if (hasNewImage) await cloudinary.uploader.destroy(product.imagePublicId);

  const readyUpdateData = { ...productData };
  if (readyUpdateData.price)
    readyUpdateData.price = Number(readyUpdateData.price);
  if (readyUpdateData.stock)
    readyUpdateData.stock = Number(readyUpdateData.stock);

  const updateProduct = await prisma.product.update({
    where: { id: productId },
    data: {
      ...readyUpdateData,
      ...(hasNewImage && { imagePublicId: newImageId }),
    },
  });

  return updateProduct;
};

export const deleteProductService = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError("There is no product with that Id", 404);
  }

  const deletedProduct = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      isActive: false,
    },
  });

  return deletedProduct;
};

export const addImageService = async (productId: string, productData: any) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError("There is no product with that Id", 404);
  }

  const updateData = {
    subImages: [...(product.subImages || []), ...(productData.subImages || [])],
    subImagesPublicIds: [
      ...(product.subImagesPublicIds || []),
      ...(productData.subImagesPublicIds || []),
    ],
  };

  const updatedProduct = await prisma.product.update({
    where: {
      id: productId,
    },
    data: updateData,
  });

  return updatedProduct;
};

export const deleteImageService = async (
  productId: string,
  imageId: string,
) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new AppError("There is no product with that Id", 404);
  }

  const isImageExist = product.subImagesPublicIds.includes(imageId);

  // We will handle errors later
  if (!isImageExist) {
    throw new AppError(
      "This image does not belong to the specified product",
      404,
    );
  }

  await cloudinary.uploader.destroy(imageId);

  // Remove imageUrl from subImages array
  const subImages = (product.subImages || []).filter(
    (cur) => !cur.includes(imageId),
  );
  // Remove imageId from subImagesPublicIds array
  const subImagesPublicIds = (product.subImagesPublicIds || []).filter(
    (cur) => cur !== imageId,
  );

  const updatedProduct = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      subImages,
      subImagesPublicIds,
    },
  });

  return updatedProduct;
};
