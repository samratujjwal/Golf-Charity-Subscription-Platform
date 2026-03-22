import mongoose from "mongoose";
import { DrawConfigModel } from "./draw-config.model.js";
import { DrawModel } from "../draws/draw.model.js";
import { ScoreModel } from "../scores/score.model.js";
import { WinningModel } from "../winnings/winning.model.js";
import { AuthModel } from "../auth/auth.model.js";
import { SubscriptionModel } from "../subscriptions/subscription.model.js";

export class DrawRepository {
  async getConfig() {
    return DrawConfigModel.findOne({ key: "default" }).lean().exec();
  }

  async updateConfig(type) {
    return DrawConfigModel.findOneAndUpdate(
      { key: "default" },
      { $set: { type, key: "default" } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
      .lean()
      .exec();
  }

  async createDraw(payload) {
    return DrawModel.create(payload);
  }

  async getDrawByMonthYear(month, year) {
    return DrawModel.findOne({ month, year }).lean().exec();
  }

  async getDrawById(drawId) {
    return DrawModel.findById(drawId).lean().exec();
  }

  async getLatestDraw() {
    return DrawModel.findOne({})
      .sort({ year: -1, month: -1, createdAt: -1 })
      .lean()
      .exec();
  }

  async updateDrawStatus(drawId, status) {
    return DrawModel.findByIdAndUpdate(
      drawId,
      { $set: { status } },
      { new: true },
    )
      .lean()
      .exec();
  }

  async publishDraw(drawId, publishedAt) {
    return DrawModel.findByIdAndUpdate(
      drawId,
      { $set: { publishedAt } },
      { new: true },
    )
      .lean()
      .exec();
  }

  async getAllUserScores() {
    return ScoreModel.find({ "scores.0": { $exists: true } })
      .select({ userId: 1, scores: 1, updatedAt: 1 })
      .populate({ path: "userId", select: "name email role charityId" })
      .lean()
      .exec();
  }

  async getUserScoreByUserId(userId) {
    return ScoreModel.findOne({ userId })
      .select({ userId: 1, scores: 1, updatedAt: 1 })
      .lean()
      .exec();
  }

  async findWinningByUserAndDraw(userId, drawId) {
    return WinningModel.findOne({ userId, drawId }).lean().exec();
  }

  async listWinningsByDraw(drawId) {
    return WinningModel.find({ drawId })
      .select({
        userId: 1,
        drawId: 1,
        matchCount: 1,
        prizeAmount: 1,
        status: 1,
        createdAt: 1,
      })
      .populate({ path: "userId", select: "name email" })
      .sort({ matchCount: -1, createdAt: 1 })
      .lean()
      .exec();
  }

  async bulkUpsertWinnings(entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
      return [];
    }

    await WinningModel.bulkWrite(
      entries.map((entry) => ({
        updateOne: {
          filter: {
            userId: new mongoose.Types.ObjectId(entry.userId),
            drawId: new mongoose.Types.ObjectId(entry.drawId),
          },
          update: {
            $setOnInsert: entry,
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    return this.listWinningsByDraw(entries[0].drawId);
  }

  // Used by email winner alerts on run
  async getUserById(userId) {
    return AuthModel.findById(userId)
      .select({ name: 1, email: 1 })
      .lean()
      .exec();
  }

  // Used by email draw results on publish
  async getActiveSubscriptionsWithUsers() {
    return SubscriptionModel.find({ status: "active" })
      .populate({ path: "userId", select: "name email" })
      .lean()
      .exec();
  }
}
