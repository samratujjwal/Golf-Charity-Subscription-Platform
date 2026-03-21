import { SubscriptionModel } from './subscription.model.js';

export class SubscriptionRepository {
  async createSubscription(payload) {
    return SubscriptionModel.create(payload);
  }

  async getActiveSubscription(userId) {
    return SubscriptionModel.findOne({ userId, status: 'active' }).lean().exec();
  }

  async updateSubscriptionStatus(subscriptionId, status) {
    return SubscriptionModel.findByIdAndUpdate(subscriptionId, { status }, { new: true }).lean().exec();
  }

  async listUserSubscriptions(userId) {
    return SubscriptionModel.find({ userId }).sort({ createdAt: -1 }).lean().exec();
  }

  async findSubscriptionById(subscriptionId) {
    return SubscriptionModel.findById(subscriptionId).lean().exec();
  }

  async findSubscriptionByStripeSubscriptionId(stripeSubscriptionId) {
    return SubscriptionModel.findOne({ stripeSubscriptionId }).lean().exec();
  }
}
