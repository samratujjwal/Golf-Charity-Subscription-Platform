import mongoose from 'mongoose';
import { AuthModel } from '../auth/auth.model.js';
import { CharityModel } from '../charities/charity.model.js';
import { PaymentModel } from '../payments/payment.model.js';
import { SubscriptionModel } from '../subscriptions/subscription.model.js';

export class StripeSubscriptionRepository {
  async findUserById(userId) {
    return AuthModel.findById(userId).lean().exec();
  }

  async findUserByEmail(email) {
    return AuthModel.findOne({ email }).lean().exec();
  }

  async findActiveSubscriptionByUserId(userId) {
    return SubscriptionModel.findOne({ userId, status: 'active' }).lean().exec();
  }

  async findSubscriptionByStripeSubscriptionId(stripeSubscriptionId) {
    return SubscriptionModel.findOne({ stripeSubscriptionId }).lean().exec();
  }

  async findLatestSubscriptionByUserId(userId) {
    return SubscriptionModel.findOne({ userId }).sort({ createdAt: -1 }).lean().exec();
  }

  async upsertSubscriptionByStripeSubscriptionId(stripeSubscriptionId, payload) {
    return SubscriptionModel.findOneAndUpdate(
      { stripeSubscriptionId },
      { $set: { ...payload, stripeSubscriptionId } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
      .lean()
      .exec();
  }

  async updateSubscriptionById(subscriptionId, payload) {
    return SubscriptionModel.findByIdAndUpdate(subscriptionId, { $set: payload }, { new: true }).lean().exec();
  }

  async expireOtherActiveSubscriptions(userId, keepSubscriptionId = null) {
    const filter = {
      userId: new mongoose.Types.ObjectId(userId),
      status: 'active',
    };

    if (keepSubscriptionId) {
      filter._id = { $ne: new mongoose.Types.ObjectId(keepSubscriptionId) };
    }

    return SubscriptionModel.updateMany(filter, { $set: { status: 'expired' } }).exec();
  }

  async findPaymentByTransactionId(transactionId) {
    return PaymentModel.findOne({ transactionId }).lean().exec();
  }

  async createPayment(payload) {
    return PaymentModel.create(payload);
  }

  async updatePaymentByTransactionId(transactionId, payload) {
    return PaymentModel.findOneAndUpdate(
      { transactionId },
      { $set: payload },
      { new: true },
    )
      .lean()
      .exec();
  }

  async upsertPaymentByTransactionId(transactionId, payload) {
    return PaymentModel.findOneAndUpdate(
      { transactionId },
      { $set: { ...payload, transactionId } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
      .lean()
      .exec();
  }

  async incrementCharityDonations(charityId, amount) {
    return CharityModel.findByIdAndUpdate(
      charityId,
      { $inc: { totalDonations: amount } },
      { new: true },
    )
      .lean()
      .exec();
  }
}
