import { Router } from 'express';
import { getSellerProfile, updateSellerProfile } from '../controllers/sellerController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(protect, restrictTo('Seller'));

router.route('/profile').get(getSellerProfile).patch(updateSellerProfile);

export default router;