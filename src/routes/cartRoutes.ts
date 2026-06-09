import { Router } from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(protect);

router.route('/').get(getCart).delete(clearCart);
router.post('/items', addItemToCart);
router.route('/items/:itemId').patch(updateCartItem).delete(removeCartItem);

export default router;