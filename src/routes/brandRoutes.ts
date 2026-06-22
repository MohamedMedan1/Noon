import express from "express";
import {
  createNewBrand,
  deleteBrand,
  getAllBrands,
  getBrand,
  updateBrand,
} from "../controllers/brandController.js";
import { validate } from "../middlewares/validate.js";
import {
  createBrandSchema,
  updateBrandSchema,
} from "../schemas/brandSchema.js";
import { uploadMulter } from "../middlewares/uploadMulter.js";
import { uploadImageToCloud } from "../middlewares/UploadImageToCloud.js";
import { generateSlug } from "../middlewares/generateSlug.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getAllBrands)
  .post(
    protect,
    restrictTo("SuperAdmin", "Admin"),
    uploadMulter("single"),
    validate(createBrandSchema),
    generateSlug,
    uploadImageToCloud("brands", "single"),
    createNewBrand,
  );

router
  .route("/:id/status")
  .patch(protect, restrictTo("SuperAdmin", "Admin"), deleteBrand);

router
  .route("/:id")
  .get(getBrand)
  .patch(
    protect,
    restrictTo("SuperAdmin", "Admin"),
    uploadMulter("single"),
    validate(updateBrandSchema),
    generateSlug,
    uploadImageToCloud("brands", "single"),
    updateBrand,
  );

export default router;
