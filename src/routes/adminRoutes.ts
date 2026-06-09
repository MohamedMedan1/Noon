import { Router } from 'express';
import { approveSeller, getPendingSellers } from '../controllers/adminController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(protect, restrictTo('Admin', 'SuperAdmin'));

router.get('/sellers/pending', getPendingSellers);
router.patch('/sellers/:sellerId/review', approveSeller);

export default router;