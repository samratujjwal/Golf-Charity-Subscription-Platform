import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";

export class CharityService {
  constructor(charityRepository) {
    this.charityRepository = charityRepository;
  }

  async getAllCharities({ search, featured }) {
    return this.charityRepository.getAllCharities({
      search: search?.trim(),
      featuredOnly: featured === "true",
    });
  }

  async getCharityById(charityId) {
    this.validateObjectId(charityId, "Invalid charity id");

    const charity = await this.charityRepository.getCharityById(charityId);

    if (!charity) {
      throw new ApiError(404, "Charity not found");
    }

    return charity;
  }

  async selectCharity(userId, charityId) {
    this.validateObjectId(userId, "Invalid user id");
    this.validateObjectId(charityId, "Invalid charity id");

    const charity = await this.charityRepository.getCharityById(charityId);

    if (!charity) {
      throw new ApiError(404, "Charity not found");
    }

    const updatedUser = await this.charityRepository.updateUserCharity(
      userId,
      charityId,
    );

    return {
      charity,
      user: {
        id: updatedUser._id.toString(),
        charityId: updatedUser.charityId
          ? updatedUser.charityId.toString()
          : null,
      },
      message: "Charity selected successfully",
    };
  }

  // NEW: Update the user's charity contribution percentage
  async updateCharityPercentage(userId, percentage) {
    this.validateObjectId(userId, "Invalid user id");

    const normalizedPercentage = Number(percentage);

    if (!Number.isFinite(normalizedPercentage)) {
      throw new ApiError(400, "Percentage must be a number");
    }

    if (normalizedPercentage < 10 || normalizedPercentage > 100) {
      throw new ApiError(400, "Charity percentage must be between 10 and 100");
    }

    // Update the user's active subscription charityPercentage
    const updatedSubscription =
      await this.charityRepository.updateActiveSubscriptionCharityPercentage(
        userId,
        normalizedPercentage,
      );

    if (!updatedSubscription) {
      throw new ApiError(
        404,
        "No active subscription found to update charity percentage",
      );
    }

    return {
      charityPercentage: updatedSubscription.charityPercentage,
      message: "Charity percentage updated successfully",
    };
  }

  // NEW: Independent one-time donation to a charity (not subscription-tied)
  async makeDonation(userId, charityId, amount) {
    this.validateObjectId(userId, "Invalid user id");
    this.validateObjectId(charityId, "Invalid charity id");

    const normalizedAmount = Number(amount);

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      throw new ApiError(400, "Donation amount must be greater than zero");
    }

    if (normalizedAmount > 10000) {
      throw new ApiError(
        400,
        "Single donation cannot exceed $10,000. Please contact support for larger donations.",
      );
    }

    const charity = await this.charityRepository.getCharityById(charityId);

    if (!charity) {
      throw new ApiError(404, "Charity not found");
    }

    const updatedCharity = await this.charityRepository.incrementDonations(
      charityId,
      normalizedAmount,
    );

    // Record the donation
    const donation = await this.charityRepository.createDonation({
      userId,
      charityId,
      amount: normalizedAmount,
      type: "direct",
    });

    return {
      donation: {
        id: donation._id.toString(),
        charityId: donation.charityId.toString(),
        amount: donation.amount,
        type: donation.type,
        createdAt: donation.createdAt,
      },
      charity: {
        id: updatedCharity._id.toString(),
        name: updatedCharity.name,
        totalDonations: updatedCharity.totalDonations,
      },
      message: `Thank you! Your $${normalizedAmount.toFixed(2)} donation to ${charity.name} has been recorded.`,
    };
  }

  // NEW: Get user's donation history
  async getUserDonations(userId) {
    this.validateObjectId(userId, "Invalid user id");
    return this.charityRepository.getUserDonations(userId);
  }

  async createCharity(payload) {
    const normalizedPayload = this.validateAndNormalizeCharity(payload);
    await this.ensureNameIsAvailable(normalizedPayload.name);

    const charity =
      await this.charityRepository.createCharity(normalizedPayload);
    return charity;
  }

  async updateCharity(charityId, payload) {
    this.validateObjectId(charityId, "Invalid charity id");

    const existingCharity =
      await this.charityRepository.getCharityById(charityId);

    if (!existingCharity) {
      throw new ApiError(404, "Charity not found");
    }

    const normalizedPayload = this.validateAndNormalizeCharity(payload, true);

    if (normalizedPayload.name) {
      await this.ensureNameIsAvailable(normalizedPayload.name, charityId);
    }

    return this.charityRepository.updateCharity(charityId, normalizedPayload);
  }

  async deleteCharity(charityId) {
    this.validateObjectId(charityId, "Invalid charity id");

    const deletedCharity =
      await this.charityRepository.deleteCharity(charityId);

    if (!deletedCharity) {
      throw new ApiError(404, "Charity not found");
    }

    return {
      message: "Charity deleted successfully",
      charity: deletedCharity,
    };
  }

  async incrementDonations(charityId, amount) {
    this.validateObjectId(charityId, "Invalid charity id");

    const normalizedAmount = Number(amount);

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      throw new ApiError(400, "Contribution amount must be greater than zero");
    }

    const charity = await this.charityRepository.getCharityById(charityId);

    if (!charity) {
      throw new ApiError(404, "Charity not found");
    }

    return this.charityRepository.incrementDonations(
      charityId,
      normalizedAmount,
    );
  }

  async ensureNameIsAvailable(name, excludeId = null) {
    const existingCharity = await this.charityRepository.findCharityByName(
      name,
      excludeId,
    );

    if (existingCharity) {
      throw new ApiError(409, "A charity with that name already exists");
    }
  }

  validateAndNormalizeCharity(payload, isPartial = false) {
    const normalizedPayload = {};

    if (!isPartial || payload.name !== undefined) {
      if (!payload.name?.trim()) {
        throw new ApiError(400, "Charity name is required");
      }
      normalizedPayload.name = payload.name.trim();
    }

    if (!isPartial || payload.description !== undefined) {
      normalizedPayload.description = payload.description?.trim() || "";
    }

    if (!isPartial || payload.image !== undefined) {
      normalizedPayload.image = payload.image?.trim() || "";
    }

    if (!isPartial || payload.isFeatured !== undefined) {
      normalizedPayload.isFeatured = Boolean(payload.isFeatured);
    }

    return normalizedPayload;
  }

  validateObjectId(value, message) {
    if (!mongoose.isValidObjectId(value)) {
      throw new ApiError(400, message);
    }
  }
}
