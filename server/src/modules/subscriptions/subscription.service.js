import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';

export class SubscriptionService {
  constructor(subscriptionRepository) {
    this.subscriptionRepository = subscriptionRepository;
  }

  async createSubscription(payload) {
    const { userId, plan, status = 'active', startDate, endDate, amount, charityPercentage } = payload;

    this.validateObjectId(userId, 'Invalid user id');

    const normalizedStartDate = new Date(startDate);
    const normalizedEndDate = new Date(endDate);

    if (Number.isNaN(normalizedStartDate.getTime()) || Number.isNaN(normalizedEndDate.getTime())) {
      throw new ApiError(400, 'Start date and end date must be valid dates');
    }

    if (normalizedEndDate <= normalizedStartDate) {
      throw new ApiError(400, 'End date must be later than start date');
    }

    if (status === 'active') {
      const existingActiveSubscription = await this.subscriptionRepository.getActiveSubscription(userId);

      if (existingActiveSubscription) {
        throw new ApiError(409, 'User already has an active subscription');
      }
    }

    const subscription = await this.subscriptionRepository.createSubscription({
      userId,
      plan,
      status,
      startDate: normalizedStartDate,
      endDate: normalizedEndDate,
      amount,
      charityPercentage,
    });

    return this.sanitizeSubscription(subscription);
  }

  async getActiveSubscription(userId) {
    this.validateObjectId(userId, 'Invalid user id');

    const subscription = await this.subscriptionRepository.getActiveSubscription(userId);

    return subscription;
  }

  async updateSubscriptionStatus(subscriptionId, status) {
    this.validateObjectId(subscriptionId, 'Invalid subscription id');

    const subscription = await this.subscriptionRepository.findSubscriptionById(subscriptionId);

    if (!subscription) {
      throw new ApiError(404, 'Subscription not found');
    }

    if (status === 'active') {
      const existingActiveSubscription = await this.subscriptionRepository.getActiveSubscription(subscription.userId);

      if (existingActiveSubscription && existingActiveSubscription._id.toString() !== subscriptionId) {
        throw new ApiError(409, 'User already has an active subscription');
      }
    }

    const updatedSubscription = await this.subscriptionRepository.updateSubscriptionStatus(subscriptionId, status);
    return updatedSubscription;
  }

  async listUserSubscriptions(userId) {
    this.validateObjectId(userId, 'Invalid user id');
    return this.subscriptionRepository.listUserSubscriptions(userId);
  }

  sanitizeSubscription(subscription) {
    return {
      id: subscription._id.toString(),
      userId: subscription.userId.toString(),
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      amount: subscription.amount,
      charityPercentage: subscription.charityPercentage,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }

  validateObjectId(value, message) {
    if (!mongoose.isValidObjectId(value)) {
      throw new ApiError(400, message);
    }
  }
}
