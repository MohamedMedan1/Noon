import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import {
  createCategoryService,
  deleteCategoryService,
  getAllCategoriesService,
  getCategoryService,
  updateCategoryService,
} from "../services/categoryServices.js";

export const getAllCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const categories = await getAllCategoriesService(req.query);

  res.status(200).json({
    status: "success",
    result: categories.length,
    data: categories,
  });
};

export const createNewCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const newCategory = await createCategoryService(
    req.body,
    req.file?.cloudData,
  );
  res.status(201).json({
    status: "success",
    data: newCategory,
  });
};

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const categoryId = String(req.params.id);

  const category = await getCategoryService(categoryId);

  res.status(200).json({
    status: "success",
    data: category,
  });
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const categoryId = String(req.params.id);

  const category = await updateCategoryService(
    req.body,
    categoryId,
    !!req.file,
    req.file?.cloudData,
  );

  res.status(200).json({
    status: "success",
    data: category,
  });
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const categoryId = String(req.params.id);

  const category = await deleteCategoryService(categoryId);

  res.status(200).json({
    status: "success",
    data: category,
  });
};
