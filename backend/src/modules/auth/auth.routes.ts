import { Router } from 'express';
import { authController } from './auth.controller.js';

import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authMiddleware, authController.getMe);

export default router;
