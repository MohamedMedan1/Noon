import express from "express";
import { applyCoupon, createNewCoupon, deleteCoupon, getAllCoupons, getCoupon, getCouponUsages, undoCoupon, updateCoupon } from "../controllers/couponController.js";
import { protect, restrictTo } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validate.js";
import { createCouponSchema, updateCouponSchema } from "../schemas/couponSchema.js";

const router = express.Router();

router.use(protect,restrictTo("Seller","Admin","SuperAdmin"));

router.route("/")
  .get(getAllCoupons)
  .post(validate(createCouponSchema),createNewCoupon);

router.route("/:id")
  .get(getCoupon)
  .patch(validate(updateCouponSchema),updateCoupon)
  .delete(deleteCoupon); 

router.get("/:id/usages", getCouponUsages);

router.use(restrictTo("Customer"));

router.post("/apply",applyCoupon);
router.patch("/undo",undoCoupon);


export default router;