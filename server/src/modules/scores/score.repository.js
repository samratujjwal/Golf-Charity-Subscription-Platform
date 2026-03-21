import { ScoreModel } from './score.model.js';

export class ScoreRepository {
  async getScoresByUserId(userId) {
    return ScoreModel.findOne({ userId }).select({ userId: 1, scores: 1, updatedAt: 1 }).lean().exec();
  }

  async upsertScores(userId, scores) {
    return ScoreModel.findOneAndUpdate(
      { userId },
      { $set: { userId, scores } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    )
      .lean()
      .exec();
  }
}
