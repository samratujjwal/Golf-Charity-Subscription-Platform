import { CharityModel } from './charity.model.js';

export class CharityRepository {
  async createCharity(payload) {
    return CharityModel.create(payload);
  }

  async listCharities(searchTerm) {
    const filter = searchTerm ? { $text: { $search: searchTerm } } : {};

    return CharityModel.find(filter)
      .sort(searchTerm ? { score: { $meta: 'textScore' } } : { isFeatured: -1, createdAt: -1 })
      .lean()
      .exec();
  }

  async getFeaturedCharities() {
    return CharityModel.find({ isFeatured: true }).sort({ totalDonations: -1 }).lean().exec();
  }

  async updateDonationTotal(charityId, donationAmount) {
    return CharityModel.findByIdAndUpdate(
      charityId,
      { $inc: { totalDonations: donationAmount } },
      { new: true },
    )
      .lean()
      .exec();
  }

  async findCharityById(charityId) {
    return CharityModel.findById(charityId).lean().exec();
  }
}
