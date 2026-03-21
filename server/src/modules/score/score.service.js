import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';

export class ScoreService {
  constructor(scoreRepository) {
    this.scoreRepository = scoreRepository;
  }

  async addScore(userId, value, date) {
    this.validateObjectId(userId, 'Invalid user id');

    const nextScore = {
      value: this.normalizeValue(value),
      date: this.normalizeDate(date),
    };

    let scoreDocument = await this.scoreRepository.findByUserId(userId);

    if (!scoreDocument) {
      const createdDocument = await this.scoreRepository.createScoreDoc(userId);
      scoreDocument = {
        _id: createdDocument._id,
        userId: createdDocument.userId,
        scores: [],
        updatedAt: createdDocument.updatedAt,
      };
    }

    const nextScores = [...scoreDocument.scores];

    if (nextScores.length >= 5) {
      const oldestIndex = this.findOldestScoreIndex(nextScores);
      nextScores.splice(oldestIndex, 1);
    }

    nextScores.push(nextScore);

    const savedDocument = await this.scoreRepository.updateScores(
      userId,
      this.sortScoresDescending(nextScores),
    );

    return this.serializeScoreDocument(savedDocument);
  }

  async getScores(userId) {
    this.validateObjectId(userId, 'Invalid user id');

    const scoreDocument = await this.scoreRepository.findByUserId(userId);

    if (!scoreDocument) {
      return {
        userId,
        scores: [],
        updatedAt: null,
      };
    }

    return this.serializeScoreDocument(scoreDocument);
  }

  async editScore(userId, index, value, date) {
    this.validateObjectId(userId, 'Invalid user id');

    const normalizedIndex = Number(index);

    if (!Number.isInteger(normalizedIndex) || normalizedIndex < 0) {
      throw new ApiError(400, 'Score index must be a non-negative integer');
    }

    const scoreDocument = await this.scoreRepository.findByUserId(userId);

    if (!scoreDocument || scoreDocument.scores.length === 0) {
      throw new ApiError(404, 'No scores found for this user');
    }

    const nextScores = this.sortScoresDescending(scoreDocument.scores);

    if (normalizedIndex >= nextScores.length) {
      throw new ApiError(404, 'Score entry not found');
    }

    nextScores[normalizedIndex] = {
      value: this.normalizeValue(value),
      date: this.normalizeDate(date),
    };

    const savedDocument = await this.scoreRepository.updateScores(
      userId,
      this.sortScoresDescending(nextScores),
    );

    return this.serializeScoreDocument(savedDocument);
  }

  async replaceScores(userId, scores) {
    this.validateObjectId(userId, 'Invalid user id');

    if (!Array.isArray(scores)) {
      throw new ApiError(400, 'Scores must be an array');
    }

    if (scores.length > 5) {
      throw new ApiError(400, 'A user can only store up to 5 scores');
    }

    let scoreDocument = await this.scoreRepository.findByUserId(userId);

    if (!scoreDocument) {
      const createdDocument = await this.scoreRepository.createScoreDoc(userId);
      scoreDocument = {
        _id: createdDocument._id,
        userId: createdDocument.userId,
        scores: [],
        updatedAt: createdDocument.updatedAt,
      };
    }

    const normalizedScores = scores.map((score) => ({
      value: this.normalizeValue(score.value),
      date: this.normalizeDate(score.date),
    }));

    const savedDocument = await this.scoreRepository.updateScores(
      userId,
      this.sortScoresDescending(normalizedScores),
    );

    return this.serializeScoreDocument(savedDocument);
  }

  normalizeValue(value) {
    const normalizedValue = Number(value);

    if (!Number.isInteger(normalizedValue) || normalizedValue < 1 || normalizedValue > 45) {
      throw new ApiError(400, 'Score value must be an integer between 1 and 45');
    }

    return normalizedValue;
  }

  normalizeDate(date) {
    if (!date) {
      throw new ApiError(400, 'Score date is required');
    }

    const normalizedDate =
      typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? new Date(`${date}T00:00:00.000Z`)
        : new Date(date);

    if (Number.isNaN(normalizedDate.getTime())) {
      throw new ApiError(400, 'Score date must be valid');
    }

    return normalizedDate;
  }

  findOldestScoreIndex(scores) {
    return scores.reduce((oldestIndex, currentScore, currentIndex, allScores) => {
      const oldestDate = new Date(allScores[oldestIndex].date).getTime();
      const currentDate = new Date(currentScore.date).getTime();

      return currentDate < oldestDate ? currentIndex : oldestIndex;
    }, 0);
  }

  sortScoresDescending(scores) {
    return [...scores].sort((left, right) => new Date(right.date) - new Date(left.date));
  }

  serializeScoreDocument(scoreDocument) {
    return {
      userId: scoreDocument.userId.toString(),
      scores: this.sortScoresDescending(scoreDocument.scores).map((score) => ({
        value: score.value,
        date: new Date(score.date).toISOString(),
      })),
      updatedAt: scoreDocument.updatedAt,
    };
  }

  validateObjectId(value, message) {
    if (!mongoose.isValidObjectId(value)) {
      throw new ApiError(400, message);
    }
  }
}
