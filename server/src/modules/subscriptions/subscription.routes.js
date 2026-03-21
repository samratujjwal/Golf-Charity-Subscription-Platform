import { Router } from 'express';
import { SubscriptionController } from './subscription.controller.js';
import { SubscriptionRepository } from './subscription.repository.js';
import { SubscriptionService } from './subscription.service.js';

const router = Router();
const subscriptionRepository = new SubscriptionRepository();
const subscriptionService = new SubscriptionService(subscriptionRepository);
const subscriptionController = new SubscriptionController(subscriptionService);

router.post('/', subscriptionController.create);
router.get('/users/:userId/active', subscriptionController.getActive);
router.get('/users/:userId', subscriptionController.listByUser);
router.patch('/:subscriptionId/status', subscriptionController.updateStatus);

export default router;
