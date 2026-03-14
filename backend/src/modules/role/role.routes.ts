import { Router } from 'express';
import { roleController } from './role.controller.js';
import { authMiddleware, roleGuard } from '../../shared/middlewares/auth.middleware.js';
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', roleGuard(['ADMIN']), roleController.getRoles);
router.put('/:id', roleGuard(['ADMIN']), roleController.updateRole);

export default router;
