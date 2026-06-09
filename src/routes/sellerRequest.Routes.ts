import { Router } from 'express';
import {
  submitSellerRequest,
  getPendingRequests,
  approveSellerRequest,
  rejectSellerRequest,
} from '../controllers/sellerRequisetControll.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', protect, restrictTo('Customer'), submitSellerRequest);
router.get('/pending', protect, restrictTo('Admin', 'SuperAdmin'), getPendingRequests);
router.patch('/:requestId/approve', protect, restrictTo('Admin', 'SuperAdmin'), approveSellerRequest);
router.patch('/:requestId/reject', protect, restrictTo('Admin', 'SuperAdmin'), rejectSellerRequest);

export default router;