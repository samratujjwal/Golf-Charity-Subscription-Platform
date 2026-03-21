import { Router } from 'express';
import { verifyJWT } from '../../middleware/auth.middleware.js';
import { StripeSubscriptionController } from './subscription.controller.js';
import { StripeSubscriptionRepository } from './subscription.repository.js';
import { StripeSubscriptionService } from './subscription.service.js';

const subscriptionRepository = new StripeSubscriptionRepository();
const subscriptionService = new StripeSubscriptionService(subscriptionRepository);
const subscriptionController = new StripeSubscriptionController(subscriptionService);

const router = Router();

router.post('/create-checkout-session', verifyJWT, subscriptionController.createCheckoutSession);
router.get('/current', verifyJWT, subscriptionController.current);

export const subscriptionWebhookHandler = subscriptionController.webhook;
export default router;
