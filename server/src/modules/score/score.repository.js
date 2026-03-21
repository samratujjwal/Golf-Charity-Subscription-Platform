import { ScoreModel } from '../scores/score.model.js';

export class ScoreRepository {
  async findByUserId(userId) {
    return ScoreModel.findOne({ userId }).select({ userId: 1, scores: 1, updatedAt: 1 }).lean().exec();
  }

  async createScoreDoc(userId) {
    return ScoreModel.create({
      userId,
      scores: [],
    });
  }

  async updateScores(userId, scores) {
    return ScoreModel.findOneAndUpdate(
      { userId },
      { $set: { scores } },
      { new: true },
    )
      .select({ userId: 1, scores: 1, updatedAt: 1 })
      .lean()
      .exec();
  }
}
