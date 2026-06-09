import { cloudinary } from "../config/cloudinary.js";
import { prisma } from "../config/prisma.js";

export const createProductService = async (
  productData: any,
  mainImgId: string,
) => {
  const readyProductData = {
    ...productData,
    price: Number(productData.price),
    stock: Number(productData.stock),
    imagePublicId: mainImgId,
  };

  const product = await prisma.product.create({
    data: readyProductData,
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

  // We will handle errors later
  if (!product) throw new Error("There is no product with that Id");

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

  // We will handle errors later
  if (!product) throw new Error("There is no product with that id");

  if (hasNewImage) await cloudinary.uploader.destroy(product.imagePublicId);

  const updateProduct = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      ...productData,
      ...(hasNewImage && { imagePublicId: newImageId }),
    },
  });

  return updateProduct;
};

export const deleteProductService = async (productId: string) => {
  const product = await prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      isActive: false,
    },
  });

  // We will handle errors later
  if (!product) throw new Error("There is no product with that Id");

  return product;
};

export const addImageService = async (productId: string, productData: any) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  // We will handle errors later
  if (!product) throw new Error("There is no product with that Id");

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

  // We will handle errors later
  if (!product) throw new Error("There is no product with that Id");

  const isImageExist = product.subImagesPublicIds.includes(imageId);

  // We will handle errors later
  if (!isImageExist) {
    throw new Error("This image does not belong to the specified product");
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
