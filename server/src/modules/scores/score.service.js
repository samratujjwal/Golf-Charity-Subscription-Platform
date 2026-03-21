import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';

export class ScoreService {
  constructor(scoreRepository) {
    this.scoreRepository = scoreRepository;
  }

  async addScore(userId, scorePayload) {
    this.validateObjectId(userId, 'Invalid user id');

    const value = Number(scorePayload.value);
    const date = scorePayload.date ? new Date(scorePayload.date) : new Date();

    if (!Number.isInteger(value) || value < 1 || value > 45) {
      throw new ApiError(400, 'Score value must be an integer between 1 and 45');
    }

    if (Number.isNaN(date.getTime())) {
      throw new ApiError(400, 'Score date must be valid');
    }

    const scoreDocument = await this.scoreRepository.getScoresByUserId(userId);
    const nextScores = [...(scoreDocument?.scores || []), { value, date }]
      .sort((left, right) => new Date(left.date) - new Date(right.date))
      .slice(-5);

    return this.scoreRepository.upsertScores(userId, nextScores);
  }

  async getScores(userId) {
    this.validateObjectId(userId, 'Invalid user id');
    const scores = await this.scoreRepository.getScoresByUserId(userId);
    return scores || { userId, scores: [] };
  }

  validateObjectId(value, message) {
    if (!mongoose.isValidObjectId(value)) {
      throw new ApiError(400, message);
    }
  }
}
