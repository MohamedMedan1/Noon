import express from "express";
import { createNewBrand, deleteBrand, getAllBrands, getBrand, updateBrand } from "../controllers/brandController.js";
import { validate } from "../middlewares/validate.js";
import { createBrandSchema, updateBrandSchema } from "../schemas/brandSchema.js";
import { uploadImage } from "../middlewares/uploadImage.js";
import { uploadImageToCloud } from "../middlewares/UploadImageToCloud.js";
import { generateSlug } from "../middlewares/generateSlug.js";

const router = express.Router();

router.route("/")
  .get(getAllBrands)
  .post(uploadImage,validate(createBrandSchema),generateSlug,uploadImageToCloud("brands"),createNewBrand);
  
router.route("/:id/status")
  .patch(deleteBrand);

router.route("/:id")
  .get(getBrand)
  .patch(uploadImage,validate(updateBrandSchema),generateSlug,uploadImageToCloud("brands"),updateBrand);

export default router; 