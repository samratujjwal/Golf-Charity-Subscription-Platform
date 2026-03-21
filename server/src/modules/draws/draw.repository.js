import { DrawModel } from './draw.model.js';

export class DrawRepository {
  async createDraw(payload) {
    return DrawModel.create(payload);
  }

  async findByMonthAndYear(month, year) {
    return DrawModel.findOne({ month, year }).lean().exec();
  }

  async listDraws(status) {
    const filter = status ? { status } : {};
    return DrawModel.find(filter).sort({ year: -1, month: -1 }).lean().exec();
  }

  async updateDrawStatus(drawId, status) {
    return DrawModel.findByIdAndUpdate(drawId, { status }, { new: true }).lean().exec();
  }

  async findDrawById(drawId) {
    return DrawModel.findById(drawId).lean().exec();
  }
}
