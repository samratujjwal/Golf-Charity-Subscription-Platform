import { Router } from 'express';
import { SubscriptionRepository } from '../subscriptions/subscription.repository.js';
import { PaymentController } from './payment.controller.js';
import { PaymentRepository } from './payment.repository.js';
import { PaymentService } from './payment.service.js';

const router = Router();
const paymentRepository = new PaymentRepository();
const subscriptionRepository = new SubscriptionRepository();
const paymentService = new PaymentService(paymentRepository, subscriptionRepository);
const paymentController = new PaymentController(paymentService);

router.post('/', paymentController.create);
router.get('/users/:userId', paymentController.listByUser);
router.patch('/:paymentId/status', paymentController.updateStatus);

export default router;
