import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import {
  addImageService,
  createProductService,
  deleteImageService,
  deleteProductService,
  getProductService,
  updateProductService,
} from "../services/productServices.js";

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: {
        isActive: true,
      },
      brand: {
        isActive: true,
      },
    },
  });

  res.status(200).json({
    status: "success",
    result: products.length,
    data: products,
  });
};

export const createNewProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const product = await createProductService(req.body, req.files?.cloudData);

  res.status(201).json({
    status: "success",
    data: product,
  });
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const productId = String(req.params?.id);

  const product = await getProductService(productId);

  res.status(201).json({
    status: "success",
    data: product,
  });
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const productId = String(req.params?.id);

  const product = await updateProductService(
    productId,
    req.body,
    !!req.file,
    req.file?.cloudData,
  );

  res.status(200).json({
    status: "success",
    data: product,
  });
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const productId = String(req.params?.id);

  const product = await deleteProductService(productId);

  res.status(201).json({
    status: "success",
    data: product,
  });
};

export const addImage = async(req: Request,
  res: Response,
  next: NextFunction,
) => {

  const productId = String(req.params?.id);

  const product = await addImageService(productId, req.body);

  res.status(200).json({
    status: "success",
    data: product,
  });
}

export const deleteImage = async(req: Request,
  res: Response,
  next: NextFunction,
) => {

  const productId = String(req.params?.id);

  const product = await deleteImageService(productId,req.body?.imageId);
  
  res.status(200).json({
    status: "success",
    data: product,
  });
}