import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';

export class DrawService {
  constructor(drawRepository) {
    this.drawRepository = drawRepository;
  }

  async createDraw(payload) {
    const { month, year, numbers, type = 'random', status = 'pending' } = payload;

    const normalizedMonth = Number(month);
    const normalizedYear = Number(year);
    const normalizedNumbers = Array.isArray(numbers) ? numbers.map(Number) : [];

    if (!Number.isInteger(normalizedMonth) || normalizedMonth < 1 || normalizedMonth > 12) {
      throw new ApiError(400, 'Month must be between 1 and 12');
    }

    if (!Number.isInteger(normalizedYear) || normalizedYear < 2020) {
      throw new ApiError(400, 'Year must be valid');
    }

    if (normalizedNumbers.length !== 5) {
      throw new ApiError(400, 'Draw must contain exactly 5 numbers');
    }

    if (normalizedNumbers.some((number) => !Number.isInteger(number) || number < 1 || number > 45)) {
      throw new ApiError(400, 'Draw numbers must be integers between 1 and 45');
    }

    if (new Set(normalizedNumbers).size !== normalizedNumbers.length) {
      throw new ApiError(400, 'Draw numbers must be unique');
    }

    const existingDraw = await this.drawRepository.findByMonthAndYear(normalizedMonth, normalizedYear);

    if (existingDraw) {
      throw new ApiError(409, 'A draw already exists for this month and year');
    }

    const draw = await this.drawRepository.createDraw({
      month: normalizedMonth,
      year: normalizedYear,
      numbers: normalizedNumbers,
      type,
      status,
    });

    return this.sanitizeDraw(draw);
  }

  async listDraws(status) {
    return this.drawRepository.listDraws(status);
  }

  async updateDrawStatus(drawId, status) {
    if (!mongoose.isValidObjectId(drawId)) {
      throw new ApiError(400, 'Invalid draw id');
    }

    const draw = await this.drawRepository.findDrawById(drawId);

    if (!draw) {
      throw new ApiError(404, 'Draw not found');
    }

    return this.drawRepository.updateDrawStatus(drawId, status);
  }

  sanitizeDraw(draw) {
    return {
      id: draw._id.toString(),
      month: draw.month,
      year: draw.year,
      numbers: draw.numbers,
      type: draw.type,
      status: draw.status,
      createdAt: draw.createdAt,
      updatedAt: draw.updatedAt,
    };
  }
}
