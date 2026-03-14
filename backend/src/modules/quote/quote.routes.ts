import { Router } from 'express';
import { quoteController } from './quote.controller.js';
import { authMiddleware } from '../../shared/middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);

router.post('/', quoteController.create);
router.get('/', quoteController.getAll);
router.get('/:id', quoteController.getOne);
router.post('/:id/submit', quoteController.submit);
router.post('/:id/supplier-quotes', quoteController.submitSupplierQuote);
router.post('/:id/approve', quoteController.approve);
router.put('/:id', quoteController.update);

export default router;
