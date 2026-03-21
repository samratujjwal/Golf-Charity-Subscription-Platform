import mongoose from 'mongoose';
import { WinningModel } from './winning.model.js';
import { PrizeDistributionModel } from './prize-distribution.model.js';
import { SubscriptionModel } from '../subscriptions/subscription.model.js';
import { DrawModel } from '../draws/draw.model.js';

export class WinningRepository {
  async createWinning(payload) {
    return WinningModel.create(payload);
  }

  async findWinningByUserAndDraw(userId, drawId) {
    return WinningModel.findOne({ userId, drawId }).lean().exec();
  }

  async listUserWinnings(userId) {
    return WinningModel.find({ userId })
      .populate({ path: 'drawId', select: 'month year numbers type status createdAt' })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async getWinningById(winningId) {
    return WinningModel.findById(winningId)
      .populate({ path: 'drawId', select: 'month year numbers status type createdAt' })
      .populate({ path: 'userId', select: 'name email' })
      .lean()
      .exec();
  }

  async getWinningsByDraw(drawId) {
    return WinningModel.find({ drawId })
      .populate({ path: 'userId', select: 'name email' })
      .sort({ matchCount: -1, createdAt: 1 })
      .lean()
      .exec();
  }

  async getAdminWinnings({ status, drawId } = {}) {
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (drawId) {
      filter.drawId = drawId;
    }

    return WinningModel.find(filter)
      .populate({ path: 'userId', select: 'name email' })
      .populate({ path: 'drawId', select: 'month year numbers status type createdAt' })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async updateWinningStatus(winningId, status) {
    return WinningModel.findByIdAndUpdate(winningId, { $set: { status } }, { new: true })
      .populate({ path: 'drawId', select: 'month year numbers status type createdAt' })
      .populate({ path: 'userId', select: 'name email' })
      .lean()
      .exec();
  }

  async updateWinningProof(winningId, proofImage) {
    return WinningModel.findByIdAndUpdate(winningId, { $set: { proofImage } }, { new: true })
      .populate({ path: 'drawId', select: 'month year numbers status type createdAt' })
      .populate({ path: 'userId', select: 'name email' })
      .lean()
      .exec();
  }

  async bulkUpdatePrizeAmounts(updates) {
    if (!Array.isArray(updates) || updates.length === 0) {
      return [];
    }

    await WinningModel.bulkWrite(
      updates.map((update) => ({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(update.winningId) },
          update: {
            $set: { prizeAmount: update.prizeAmount },
          },
        },
      })),
      { ordered: false },
    );

    return this.getWinningsByDraw(updates[0].drawId);
  }

  async getDistributionByDrawId(drawId) {
    return PrizeDistributionModel.findOne({ drawId }).lean().exec();
  }

  async getLatestDistributionBeforeCycle({ year, month }) {
    return PrizeDistributionModel.findOne({
      $or: [
        { year: { $lt: year } },
        { year, month: { $lt: month } },
      ],
    })
      .sort({ year: -1, month: -1, createdAt: -1 })
      .lean()
      .exec();
  }

  async upsertDistributionByDrawId(drawId, payload) {
    return PrizeDistributionModel.findOneAndUpdate(
      { drawId },
      { $set: { ...payload, drawId } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
      .lean()
      .exec();
  }

  async getDrawById(drawId) {
    return DrawModel.findById(drawId).lean().exec();
  }

  async getEligibleSubscriptionsForMonth({ monthStart, monthEnd }) {
    return SubscriptionModel.find({
      status: 'active',
      startDate: { $lte: monthEnd },
      endDate: { $gte: monthStart },
    })
      .select({ userId: 1, amount: 1, plan: 1, status: 1, startDate: 1, endDate: 1 })
      .lean()
      .exec();
  }

  async aggregateWinningsByDraw(drawId) {
    return WinningModel.aggregate([
      { $match: { drawId: new mongoose.Types.ObjectId(String(drawId)) } },
      {
        $group: {
          _id: '$matchCount',
          count: { $sum: 1 },
          winningIds: { $push: '$_id' },
        },
      },
      { $sort: { _id: -1 } },
    ]);
  }
}

