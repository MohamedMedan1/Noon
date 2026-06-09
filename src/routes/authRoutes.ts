import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  authWithEmail,
  verifyOtp,
  resendOtp,
  createAdminBySuper,
} from '../controllers/authController.js';
import { protect, isSuperAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

/*const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: 'Error', message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});*/

router.post('/request-otp',  authWithEmail);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp',   resendOtp);
router.post('/create-admin', protect, isSuperAdmin, createAdminBySuper);

export default router;