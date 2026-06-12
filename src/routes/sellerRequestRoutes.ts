import { Router } from 'express';
import { submitSellerRequest } from '../controllers/sellerRequestController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';
import { sellerRequestSchema } from '../schemas/authSchema.js';

const router = Router();

router.post(
  '/submit', 
  protect, 
  restrictTo('Customer'), 
  validate(sellerRequestSchema), 
  submitSellerRequest
);

export default router;