import { Router } from 'express';
import { addItemToCart, updateCartItem, getCart, removeCartItem } from '../controllers/cartController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validate.js'
import { addToCartSchema, updateCartItemSchema } from '../schemas/cartSchemas.js';

const router = Router();

router.use(protect);

router.get('/', getCart);
router.post('/', validate(addToCartSchema), addItemToCart); 
router.put('/:itemId', validate(updateCartItemSchema), updateCartItem);
router.delete('/:itemId', removeCartItem); 

export default router;