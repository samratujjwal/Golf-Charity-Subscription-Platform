import mongoose from 'mongoose';
import { AuthModel } from '../auth/auth.model.js';
import { DrawModel } from '../draws/draw.model.js';
import { PaymentModel } from '../payments/payment.model.js';
import { ScoreModel } from '../scores/score.model.js';
import { SubscriptionModel } from '../subscriptions/subscription.model.js';
import { PrizeDistributionModel } from '../winnings/prize-distribution.model.js';
import { WinningModel } from '../winnings/winning.model.js';
import { CharityModel } from '../charities/charity.model.js';

export class AdminRepository {
  async getUserById(userId) {
    return AuthModel.findById(userId).exec();
  }

  async listUsers({ page, limit, search }) {
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      AuthModel.find(filter)
        .select({ password: 0, refreshToken: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      AuthModel.countDocuments(filter),
    ]);

    const userIds = items.map((user) => user._id);
    const scoreDocs = userIds.length > 0
      ? await ScoreModel.find({ userId: { $in: userIds } })
          .select({ userId: 1, scores: 1, updatedAt: 1 })
          .lean()
          .exec()
      : [];

    const scoreMap = new Map(scoreDocs.map((scoreDoc) => [scoreDoc.userId.toString(), scoreDoc.scores || []]));

    return {
      items: items.map((user) => ({
        ...user,
        scores: scoreMap.get(user._id.toString()) || [],
      })),
      total,
    };
  }

  async updateUserProfile(userId, payload) {
    return AuthModel.findByIdAndUpdate(userId, { $set: payload }, { new: true, runValidators: true })
      .select({ password: 0, refreshToken: 0 })
      .lean()
      .exec();
  }

  async updateUserBlockState(userId, isBlocked) {
    const update = { isBlocked };

    if (isBlocked) {
      update.refreshToken = null;
    }

    return AuthModel.findByIdAndUpdate(userId, { $set: update }, { new: true })
      .select({ password: 0, refreshToken: 0 })
      .lean()
      .exec();
  }

  async updateUserRole(userId, role) {
    return AuthModel.findByIdAndUpdate(userId, { $set: { role } }, { new: true })
      .select({ password: 0, refreshToken: 0 })
      .lean()
      .exec();
  }

  async listSubscriptions({ page, limit, status }) {
    const filter = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      SubscriptionModel.find(filter)
        .populate({ path: 'userId', select: 'name email role isBlocked' })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      SubscriptionModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  async getSubscriptionById(subscriptionId) {
    return SubscriptionModel.findById(subscriptionId).lean().exec();
  }

  async updateSubscriptionStatus(subscriptionId, status) {
    return SubscriptionModel.findByIdAndUpdate(subscriptionId, { $set: { status } }, { new: true })
      .populate({ path: 'userId', select: 'name email role isBlocked' })
      .lean()
      .exec();
  }

  async listDraws({ page, limit, status }) {
    const filter = status ? { status } : {};
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      DrawModel.find(filter)
        .sort({ year: -1, month: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      DrawModel.countDocuments(filter),
    ]);

    return { items, total };
  }

  async getDashboardMetrics({ monthStart, monthEnd }) {
    const [
      totalUsers,
      activeSubscriptions,
      monthlyRevenueResult,
      totalPrizePoolResult,
      totalWinningsPaidResult,
      charityContributionResult,
      drawCount,
      winDistribution,
      successfulPayments,
    ] = await Promise.all([
      AuthModel.countDocuments({}),
      SubscriptionModel.countDocuments({ status: 'active' }),
      PaymentModel.aggregate([
        {
          $match: {
            status: 'success',
            createdAt: { $gte: monthStart, $lte: monthEnd },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]),
      PrizeDistributionModel.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$totalPoolAmount' },
          },
        },
      ]),
      WinningModel.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$prizeAmount' } } },
      ]),
      CharityModel.aggregate([
        { $group: { _id: null, total: { $sum: '$totalDonations' } } },
      ]),
      DrawModel.countDocuments({}),
      WinningModel.aggregate([
        { $group: { _id: '$matchCount', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      PaymentModel.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    return {
      totalUsers,
      activeSubscriptions,
      monthlyRevenue: monthlyRevenueResult[0]?.total || 0,
      totalPrizePool: totalPrizePoolResult[0]?.total || 0,
      totalWinningsPaid: totalWinningsPaidResult[0]?.total || 0,
      charityContributionTotal: charityContributionResult[0]?.total || 0,
      drawCount,
      lifetimeRevenue: successfulPayments[0]?.total || 0,
      winDistribution,
    };
  }

  async listRecentActivity() {
    return Promise.all([
      AuthModel.find({}).select({ name: 1, email: 1, createdAt: 1 }).sort({ createdAt: -1 }).limit(5).lean().exec(),
      SubscriptionModel.find({}).select({ userId: 1, plan: 1, status: 1, createdAt: 1 }).populate({ path: 'userId', select: 'name email' }).sort({ createdAt: -1 }).limit(5).lean().exec(),
      DrawModel.find({}).sort({ createdAt: -1 }).limit(5).lean().exec(),
      WinningModel.find({}).select({ userId: 1, drawId: 1, matchCount: 1, status: 1, prizeAmount: 1, createdAt: 1 }).populate({ path: 'userId', select: 'name email' }).populate({ path: 'drawId', select: 'month year' }).sort({ createdAt: -1 }).limit(5).lean().exec(),
    ]);
  }
}
