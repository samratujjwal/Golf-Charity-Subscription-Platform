import { CharityModel } from '../charities/charity.model.js';
import { AuthModel } from '../auth/auth.model.js';

export class CharityRepository {
  async getAllCharities({ search, featuredOnly }) {
    const filter = {};

    if (featuredOnly) {
      filter.isFeatured = true;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    return CharityModel.find(filter)
      .sort(search ? { score: { $meta: 'textScore' }, isFeatured: -1 } : { isFeatured: -1, totalDonations: -1, createdAt: -1 })
      .lean()
      .exec();
  }

  async getCharityById(charityId) {
    return CharityModel.findById(charityId).lean().exec();
  }

  async findCharityByName(name, excludeId = null) {
    const filter = {
      name: new RegExp(`^${this.escapeRegex(name)}$`, 'i'),
    };

    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    return CharityModel.findOne(filter).lean().exec();
  }

  async createCharity(payload) {
    return CharityModel.create(payload);
  }

  async updateCharity(charityId, payload) {
    return CharityModel.findByIdAndUpdate(charityId, { $set: payload }, { new: true }).lean().exec();
  }

  async deleteCharity(charityId) {
    return CharityModel.findByIdAndDelete(charityId).lean().exec();
  }

  async incrementDonations(charityId, amount) {
    return CharityModel.findByIdAndUpdate(
      charityId,
      { $inc: { totalDonations: amount } },
      { new: true },
    )
      .lean()
      .exec();
  }

  async updateUserCharity(userId, charityId) {
    return AuthModel.findByIdAndUpdate(userId, { charityId }, { new: true }).lean().exec();
  }

  escapeRegex(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
