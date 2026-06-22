import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { createBrandService, deleteBrandService, getAllBrandsService, updateBrandService } from "../services/brandServices.js";

export const getAllBrands = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const brands = await getAllBrandsService(req.query);
  
  res.status(200).json({
    status: "success",
    results: brands.length,
    data: brands,
  });
};

export const createNewBrand = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const newBrand = await createBrandService(req.body, req.file?.cloudData);

  res.status(201).json({
    status: "success",
    data: newBrand,
  });
};

export const getBrand = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const brandId = req.params.id;

  const brand = await prisma.brand.findUnique({
    where: {
      id: String(brandId),
    },
  });

  // We will handle errors later
  if (!brand) throw new Error();

  res.status(200).json({
    status: "suceess",
    data: brand,
  });
};

export const updateBrand = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const brandId = String(req.params.id);

  const brand = await updateBrandService(brandId,req.body,!!req.file,req.file?.cloudData)
  res.status(200).json({
    status: "success",
    data: brand,
  });
};

export const deleteBrand = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const brandId = String(req.params.id);

  const brand = await deleteBrandService(brandId);

  res.status(200).json({
    status: "success",
    data: brand,
  });
};
