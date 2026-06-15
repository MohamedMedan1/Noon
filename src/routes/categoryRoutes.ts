import express from "express";
import {
  createNewCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  updateCategory,
} from "../controllers/categoryController.js";
import { uploadMulter } from "../middlewares/uploadMulter.js";
import { uploadImageToCloud } from "../middlewares/UploadImageToCloud.js";
import { generateSlug } from "../middlewares/generateSlug.js";
import { validate } from "../middlewares/validate.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/categorySchema.js";

const router = express.Router();

router
  .route("/")
  .get(getAllCategories)
  .post(
    uploadMulter("single"),
    validate(createCategorySchema),
    generateSlug,
    uploadImageToCloud("categories","single"),
    createNewCategory,
  );

router.patch("/:id/status", deleteCategory);

router
  .route("/:id")
  .get(getCategory)
  .patch(
    uploadMulter("single"),
    validate(updateCategorySchema),
    generateSlug,
    uploadImageToCloud("categories","single"),
    updateCategory,
  );

export default router;
