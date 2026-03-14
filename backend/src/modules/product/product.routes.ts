import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware.js';

const router = Router();
const controller = new ProductController();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', controller.getProducts);
router.get('/:id', controller.getProduct);
router.post('/', controller.createProduct);
router.put('/:id', controller.updateProduct);
router.delete('/:id', controller.deleteProduct);

export default router;
