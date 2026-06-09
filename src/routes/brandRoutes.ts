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

const router = express.Router();

router
  .route("/")
  .get(getAllBrands)
  .post(
    uploadMulter("single"),
    validate(createBrandSchema),
    generateSlug,
    uploadImageToCloud("brands"),
    createNewBrand,
  );

router.route("/:id/status").patch(deleteBrand);

router
  .route("/:id")
  .get(getBrand)
  .patch(
    uploadMulter("single"),
    validate(updateBrandSchema),
    generateSlug,
    uploadImageToCloud("brands"),
    updateBrand,
  );

export default router;
