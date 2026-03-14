import { Router } from 'express';
import { ManufacturerController } from './manufacturer.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware.js';

const router = Router();
const controller = new ManufacturerController();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', controller.getManufacturers);
router.post('/', controller.createManufacturer);
router.put('/:id', controller.updateManufacturer);
router.delete('/:id', controller.deleteManufacturer);

export default router;
