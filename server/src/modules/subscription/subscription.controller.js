import { ApiResponse } from '../../utils/ApiResponse.js';

export class StripeSubscriptionController {
  constructor(subscriptionService) {
    this.subscriptionService = subscriptionService;
  }

  createCheckoutSession = async (req, res, next) => {
    try {
      const result = await this.subscriptionService.createCheckoutSession({
        userId: req.user.userId,
        plan: req.body.plan,
      });

      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  current = async (req, res, next) => {
    try {
      const result = await this.subscriptionService.getCurrentSubscription(req.user.userId, req.query.session_id || null);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  webhook = async (req, res, next) => {
    try {
      const result = await this.subscriptionService.handleWebhook({
        signature: req.headers['stripe-signature'],
        rawBody: req.body,
      });

      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };
}

