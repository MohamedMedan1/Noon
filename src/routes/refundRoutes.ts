import express from "express";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { getAllRefunds, getRefund, handleRefund } from "../controllers/refundController.js";
import { validate } from "../middlewares/validate.js";
import { rejectRefundSchema } from "../schemas/refundSchema.js";

const router = express.Router();

// Apply Authentication
router.use(protect);

router.get("/",getAllRefunds);
router.get("/:id", getRefund);

// Apply Authorization
// router.use(restrictTo("SuperAdmin", "Admin"))

router.patch("/:id/accept",handleRefund("accept"));
router.patch("/:id/reject",validate(rejectRefundSchema),handleRefund("reject"));

export default router;