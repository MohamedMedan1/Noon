import { Router } from 'express';
import { getPendingRequests, approveSellerRequest,  rejectSellerRequest } from '../controllers/adminController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(protect, restrictTo('Admin', 'SuperAdmin'));

router.get('/pending-sellers', protect, restrictTo('Admin', 'SuperAdmin'), getPendingRequests);
router.patch('/approve-seller/:requestId', protect, restrictTo('Admin', 'SuperAdmin'), approveSellerRequest);
router.patch('/reject-seller/:requestId', protect, restrictTo('Admin', 'SuperAdmin'), rejectSellerRequest);


export default router;