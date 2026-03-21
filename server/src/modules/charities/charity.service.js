import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';

export class CharityService {
  constructor(charityRepository) {
    this.charityRepository = charityRepository;
  }

  async createCharity(payload) {
    const { name, description = '', image = '', isFeatured = false } = payload;

    if (!name?.trim()) {
      throw new ApiError(400, 'Charity name is required');
    }

    const charity = await this.charityRepository.createCharity({
      name: name.trim(),
      description: description.trim(),
      image: image.trim(),
      isFeatured,
    });

    return {
      id: charity._id.toString(),
      name: charity.name,
      description: charity.description,
      image: charity.image,
      isFeatured: charity.isFeatured,
      totalDonations: charity.totalDonations,
      createdAt: charity.createdAt,
      updatedAt: charity.updatedAt,
    };
  }

  async listCharities(searchTerm) {
    return this.charityRepository.listCharities(searchTerm?.trim());
  }

  async getFeaturedCharities() {
    return this.charityRepository.getFeaturedCharities();
  }

  async addDonation(charityId, donationAmount) {
    if (!mongoose.isValidObjectId(charityId)) {
      throw new ApiError(400, 'Invalid charity id');
    }

    if (Number(donationAmount) <= 0) {
      throw new ApiError(400, 'Donation amount must be greater than zero');
    }

    const charity = await this.charityRepository.findCharityById(charityId);

    if (!charity) {
      throw new ApiError(404, 'Charity not found');
    }

    return this.charityRepository.updateDonationTotal(charityId, Number(donationAmount));
  }
}
