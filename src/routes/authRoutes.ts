import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  signupWithEmail,
  loginWithEmail,
  verifyOtp,
  resendOtp,
  loginWithPassword,
  createAdminBySuper,
} from '../controllers/authController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validateMiddleware.js';

import {
  signupSchema,
  loginEmailSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginPasswordSchema,
  createAdminSchema,
}    from '../schemas/authSchema.js';
 
const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: 'Error', message: 'Too many requests from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/signup', authLimiter, validate(signupSchema), signupWithEmail);
router.post('/login', authLimiter, validate(loginEmailSchema), loginWithEmail);
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), verifyOtp);
router.post('/resend-otp', authLimiter, validate(resendOtpSchema), resendOtp);

router.post('/login-password', authLimiter, validate(loginPasswordSchema), loginWithPassword);

router.post(
  '/create-admin', 
  protect, 
  restrictTo('SuperAdmin'), 
  validate(createAdminSchema), 
  createAdminBySuper
);

export default router;