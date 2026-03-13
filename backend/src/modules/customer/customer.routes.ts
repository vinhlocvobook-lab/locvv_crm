import { Router } from 'express';
import { CustomerController } from './customer.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';
import { tenantMiddleware } from '../../shared/middlewares/tenant.middleware.js';

const router = Router();
const controller = new CustomerController();

router.use(authMiddleware);
router.use(tenantMiddleware);

router.get('/', controller.getCustomers);
router.get('/:id', controller.getCustomer);
router.post('/', controller.createCustomer);

export default router;
