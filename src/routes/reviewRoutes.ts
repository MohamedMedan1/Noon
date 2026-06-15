import { Router } from "express";
import {
  addReview,
  getProductReviews,
  toggleReviewStatus,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { createReviewSchema } from "../schemas/reviewSchema.js";

const router = Router();

router.get("/product/:productId", getProductReviews);

router.use(protect);

router.post("/product/:productId", validate(createReviewSchema), addReview);
router.delete("/:id", deleteReview);
router.patch("/:id/toggle", restrictTo("Admin", "SuperAdmin"), toggleReviewStatus);

export default router;