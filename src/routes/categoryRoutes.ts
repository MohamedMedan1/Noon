import express from "express";
import { createNewCategory, deleteCategory, getAllCategories, getCategory, updateCategory } from "../controllers/categoryController.js";
import { uploadImage } from "../middlewares/uploadImage.js";
import { uploadImageToCloud } from "../middlewares/UploadImageToCloud.js";
import { generateSlug } from "../middlewares/generateSlug.js";
import { validate } from "../middlewares/validate.js";
import { createCategorySchema, updateCategorySchema } from "../schemas/categorySchema.js";

const router = express.Router();

router.route("/")
  .get(getAllCategories)
  .post(uploadImage,validate(createCategorySchema),generateSlug,uploadImageToCloud("categories"),createNewCategory)

router.patch("/:id/status", deleteCategory);

router.route("/:id")
  .get(getCategory)
  .patch(uploadImage,validate(updateCategorySchema),generateSlug,uploadImageToCloud("categories"),updateCategory);


export default router;