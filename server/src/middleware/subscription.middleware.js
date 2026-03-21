import { ApiError } from '../utils/ApiError.js';
import { SubscriptionRepository } from '../modules/subscriptions/subscription.repository.js';

const subscriptionRepository = new SubscriptionRepository();

export async function requireActiveSubscription(req, res, next) {
  try {
    if (!req.user?.userId) {
      throw new ApiError(401, 'Authentication is required');
    }

    if (req.user.role === 'admin') {
      return next();
    }

    const subscription = await subscriptionRepository.getActiveSubscription(req.user.userId);

    if (!subscription) {
      throw new ApiError(403, 'An active subscription is required to access this resource');
    }

    if (new Date(subscription.endDate) <= new Date()) {
      throw new ApiError(403, 'Your subscription has expired');
    }

    req.subscription = subscription;
    return next();
  } catch (error) {
    return next(error);
  }
}
