import { Router } from 'express';
import { CategoryController } from './category.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware.js';

const router = Router();
const controller = new CategoryController();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', controller.getCategories);
router.post('/', controller.createCategory);
router.put('/:id', controller.updateCategory);
router.delete('/:id', controller.deleteCategory);

export default router;
