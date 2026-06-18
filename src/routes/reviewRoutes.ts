import { Router } from "express";
import {
  addReview,
  getProductReviews,
  toggleReviewStatus,
  deleteReview,
  addReviewComment,
  updateReview,
} from "../controllers/reviewController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { createReviewSchema, createCommentSchema, updateReviewSchema } from "../schemas/reviewSchema.js";

const router = Router();

router.get("/product/:productId", getProductReviews);

router.use(protect);

router.post("/product/:productId", validate(createReviewSchema), addReview);
router.post("/:id/comment", validate(createCommentSchema), addReviewComment);
router.patch("/:id", validate(updateReviewSchema), updateReview);
router.delete("/:id", deleteReview);
router.patch("/:id/toggle", restrictTo("Admin", "SuperAdmin"), toggleReviewStatus);

export default router;