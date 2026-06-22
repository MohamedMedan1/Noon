import express from "express";
import {
  addImage,
  createNewProduct,
  deleteImage,
  deleteProduct,
  getAllProducts,
  getProduct,
  updateProduct,
} from "../controllers/productController.js";
import { validate } from "../middlewares/validate.js";
import {
  addImageSchema,
  createProductSchema,
  deleteImageSchema,
  updateProductSchema,
} from "../schemas/productSchema.js";
import { uploadMulter } from "../middlewares/uploadMulter.js";
import { uploadImageToCloud } from "../middlewares/UploadImageToCloud.js";
import { generateSlug } from "../middlewares/generateSlug.js";
import { checkAddAbility } from "../middlewares/checkAddAbility.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(getAllProducts)
  .post(
    protect,
    restrictTo("Seller"),
    uploadMulter("fields"),
    validate(createProductSchema),
    generateSlug,
    uploadImageToCloud("products", "multi"),
    createNewProduct,
  );

router
  .route("/:id/images")
  .post(
    protect,
    restrictTo("Seller"),
    uploadMulter("fields"),
    checkAddAbility,
    validate(addImageSchema),
    uploadImageToCloud("products", "multi"),
    addImage,
  )
  .delete(
    validate(deleteImageSchema),
    protect,
    restrictTo("Seller"),
    deleteImage,
  );

router.route("/:id/status").patch(protect, restrictTo("Seller"), deleteProduct);

router
  .route("/:id")
  .get(getProduct)
  .patch(
    protect,
    restrictTo("Seller"),
    uploadMulter("single"),
    validate(updateProductSchema),
    generateSlug,
    uploadImageToCloud("products", "single"),
    updateProduct,
  );

export default router;
