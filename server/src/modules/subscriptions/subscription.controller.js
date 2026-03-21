import { ApiResponse } from '../../utils/ApiResponse.js';

export class SubscriptionController {
  constructor(subscriptionService) {
    this.subscriptionService = subscriptionService;
  }

  create = async (req, res, next) => {
    try {
      const result = await this.subscriptionService.createSubscription(req.body);
      return res.status(201).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  getActive = async (req, res, next) => {
    try {
      const result = await this.subscriptionService.getActiveSubscription(req.params.userId);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  listByUser = async (req, res, next) => {
    try {
      const result = await this.subscriptionService.listUserSubscriptions(req.params.userId);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const result = await this.subscriptionService.updateSubscriptionStatus(req.params.subscriptionId, req.body.status);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };
}
