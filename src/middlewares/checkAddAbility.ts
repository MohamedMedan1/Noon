import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";

export const checkAddAbility = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const productId = String(req.params?.id);

  const product = await prisma.product.findUnique({
    where: {
      id: productId
    }
  });

  // We will handle errors later
  if (!product) throw new Error("There is no product with that Id");

  const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

  const subImgsLength = product.subImages.length; 
  const newSubImgsLength = files?.subImages?.length || 0;

  // We will handle errors later
  if (newSubImgsLength === 0) throw new Error("Please provide at least one subImage to add");

  // We will handle errors later
  if ((subImgsLength + newSubImgsLength) >= 4){
    throw new Error(`Your product already has ${subImgsLength} subImages, you want to add new ${newSubImgsLength} subImages and max limit is 4 subImages`);
  }

  return next();
};
