import { Router } from 'express';
import { getMe, updateMe } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(protect);

router.route('/me').get(getMe).patch(updateMe);

export default router;   