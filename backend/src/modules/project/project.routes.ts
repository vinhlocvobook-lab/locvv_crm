import { Router } from 'express';
import { projectController } from './project.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/dashboard', projectController.getProjectDashboard);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProjectById);
router.post('/', projectController.createProject);
router.put('/:id/members/:userId/permissions', projectController.updateMemberPermissions);

export default router;
