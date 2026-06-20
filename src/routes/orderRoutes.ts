import express from "express";
import {
  approveOrder,
  cancelOrder,
  createNewOrder,
  getAllOrders,
  getOrder,
  refundOrder,
} from "../controllers/orderController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { uploadMulter } from "../middlewares/uploadMulter.js";
import { uploadImageToCloud } from "../middlewares/UploadImageToCloud.js";
import { validate } from "../middlewares/validate.js";
import {
  createOrderSchema,
  refundOrderSchema,
} from "../schemas/orderSchema.js";

const router = express.Router();

router.use(protect);

// Secure API
router.patch("/:id/approve", restrictTo("SuperAdmin", "Admin"), approveOrder);

// Get Just One Order
router.get("/:id", getOrder);
router.patch("/:id/cancel", restrictTo("Customer"), cancelOrder);
router.patch(
  "/:id/refund",
  restrictTo("Customer"),
  uploadMulter("single"),
  validate(refundOrderSchema),
  uploadImageToCloud("refunds","single"),
  refundOrder,
);

// Get All Order and Create new order
router
  .route("/")
  .get(getAllOrders)
  .post(
    restrictTo("Customer"),
    uploadMulter("single", "paidImage"),
    validate(createOrderSchema),
    uploadImageToCloud("payments", "single", "paidImage"),
    createNewOrder,
  );

export default router;
