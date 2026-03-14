import { Router } from 'express';
import { userController } from './user.controller.js';
import { authMiddleware, roleGuard } from '../../shared/middlewares/auth.middleware.js';
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware.js';

const router = Router();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', roleGuard(['ADMIN']), userController.getUsers);
router.get('/:id', userController.getUser);
router.post('/', roleGuard(['ADMIN']), userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', roleGuard(['ADMIN']), userController.deleteUser);

export default router;
