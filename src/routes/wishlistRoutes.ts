import { Router } from 'express';
import { getWishlist, addItemToWishlist, removeItemFromWishlist, clearWishlist } from '../controllers/wishlistController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js';
import { addToWishlistSchema } from '../schemas/wishlistSchema.js';

const router = Router();

router.use(protect);

router.route('/')
  .get(getWishlist)
  .post(validate(addToWishlistSchema), addItemToWishlist)
  .delete(clearWishlist);

router.delete('/items/:productId', removeItemFromWishlist);

export default router;