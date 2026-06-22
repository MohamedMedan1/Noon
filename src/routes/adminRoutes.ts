import { Router } from 'express';
import { getPendingRequests, approveSellerRequest,  rejectSellerRequest } from '../controllers/adminController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = Router();

// router.use(protect, restrictTo('Admin', 'SuperAdmin'));

router.get('/pending-sellers', getPendingRequests);
router.patch('/approve-seller/:requestId',approveSellerRequest);
router.patch('/reject-seller/:requestId',rejectSellerRequest);


export default router;