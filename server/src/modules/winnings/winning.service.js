import mongoose from "mongoose";
import {
  cloudinary,
  assertCloudinaryConfigured,
} from "../../config/cloudinary.js";
import { ApiError } from "../../utils/ApiError.js";
import { emailService } from "../notifications/email.service.js";

const DEFAULT_POOL_PERCENTAGE = Number(process.env.PRIZE_POOL_PERCENTAGE || 50);
const TIER_RULES = {
  5: { percentage: 40, rollover: true, label: "5-Number Match" },
  4: { percentage: 35, rollover: false, label: "4-Number Match" },
  3: { percentage: 25, rollover: false, label: "3-Number Match" },
};
const MATCH_TIERS = [5, 4, 3];

export class WinningService {
  constructor(winningRepository) {
    this.winningRepository = winningRepository;
  }

  async listUserWinnings(userId) {
    this.validateObjectId(userId, "Invalid user id");
    const winnings = await this.winningRepository.listUserWinnings(userId);
    return winnings.map((winning) => this.serializeWinning(winning));
  }

  async listAdminWinnings(filters = {}) {
    const winnings = await this.winningRepository.getAdminWinnings(filters);
    return winnings.map((winning) =>
      this.serializeWinning(winning, { includeUser: true, includeDraw: true }),
    );
  }

  async calculatePrizePool(drawId) {
    this.validateObjectId(drawId, "Invalid draw id");
    const draw = await this.getDrawOrThrow(drawId);
    const { monthStart, monthEnd } = this.getCycleBounds(draw.year, draw.month);
    const subscriptions =
      await this.winningRepository.getEligibleSubscriptionsForMonth({
        monthStart,
        monthEnd,
      });
    const previousDistribution =
      await this.winningRepository.getLatestDistributionBeforeCycle({
        year: draw.year,
        month: draw.month,
      });

    const basePoolCents = subscriptions.reduce((sum, sub) => {
      return (
        sum +
        Math.round((this.toCents(sub.amount) * DEFAULT_POOL_PERCENTAGE) / 100)
      );
    }, 0);
    const carryForwardCents = this.toCents(
      previousDistribution?.jackpotCarryForwardAmount || 0,
    );
    const totalPoolCents = basePoolCents + carryForwardCents;

    return {
      draw: this.serializeDraw(draw),
      poolPercentage: DEFAULT_POOL_PERCENTAGE,
      eligibleSubscriptionCount: subscriptions.length,
      basePoolAmount: this.fromCents(basePoolCents),
      carryForwardAmount: this.fromCents(carryForwardCents),
      totalPoolAmount: this.fromCents(totalPoolCents),
      tierShares: this.buildTierShares(totalPoolCents),
    };
  }

  async distributePrizes(drawId) {
    this.validateObjectId(drawId, "Invalid draw id");
    const draw = await this.getDrawOrThrow(drawId);

    if (draw.status !== "completed") {
      throw new ApiError(
        409,
        "Prize distribution can only run after the draw is completed",
      );
    }

    const poolSummary = await this.calculatePrizePool(drawId);
    const winners = await this.winningRepository.getWinningsByDraw(drawId);
    const aggregation =
      await this.winningRepository.aggregateWinningsByDraw(drawId);
    const groupedWinners = this.groupWinnersByTier(winners);
    const aggregateCounts = aggregation.reduce((map, item) => {
      map[item._id] = item.count;
      return map;
    }, {});
    const totalPoolCents = this.toCents(poolSummary.totalPoolAmount);
    const updates = [];
    const tierBreakdown = [];
    let jackpotCarryForwardCents = 0;

    MATCH_TIERS.forEach((tier) => {
      const winnersInTier = groupedWinners[tier];
      const rule = TIER_RULES[tier];
      const tierAllocationCents = Math.round(
        (totalPoolCents * rule.percentage) / 100,
      );
      const amountPerWinnerCents =
        winnersInTier.length > 0
          ? Math.floor(tierAllocationCents / winnersInTier.length)
          : 0;

      if (rule.rollover && winnersInTier.length === 0)
        jackpotCarryForwardCents = tierAllocationCents;

      tierBreakdown.push({
        tier,
        label: rule.label,
        percentage: rule.percentage,
        rollover: rule.rollover,
        winnersCount: aggregateCounts[tier] || winnersInTier.length,
        amount: this.fromCents(tierAllocationCents),
        amountPerWinner: this.fromCents(amountPerWinnerCents),
      });

      winnersInTier.forEach((winner) =>
        updates.push({
          winningId: winner._id,
          drawId,
          prizeAmount: this.fromCents(amountPerWinnerCents),
        }),
      );
    });

    if (updates.length > 0)
      await this.winningRepository.bulkUpdatePrizeAmounts(updates);

    const distributionRecord =
      await this.winningRepository.upsertDistributionByDrawId(drawId, {
        month: draw.month,
        year: draw.year,
        poolPercentage: DEFAULT_POOL_PERCENTAGE,
        eligibleSubscriptionCount: poolSummary.eligibleSubscriptionCount,
        basePoolAmount: poolSummary.basePoolAmount,
        carryForwardAmount: poolSummary.carryForwardAmount,
        totalPoolAmount: poolSummary.totalPoolAmount,
        jackpotCarryForwardAmount: this.fromCents(jackpotCarryForwardCents),
        tierBreakdown,
        distributedAt: new Date(),
      });

    const refreshedWinners =
      await this.winningRepository.getWinningsByDraw(drawId);

    return {
      draw: this.serializeDraw(draw),
      prizePool: {
        poolPercentage: DEFAULT_POOL_PERCENTAGE,
        eligibleSubscriptionCount: poolSummary.eligibleSubscriptionCount,
        basePoolAmount: poolSummary.basePoolAmount,
        carryForwardAmount: poolSummary.carryForwardAmount,
        totalPoolAmount: poolSummary.totalPoolAmount,
        jackpotCarryForwardAmount: this.fromCents(jackpotCarryForwardCents),
      },
      tierBreakdown,
      winnings: refreshedWinners.map((w) =>
        this.serializeWinning(w, { includeUser: true, includeDraw: true }),
      ),
      distributedAt: distributionRecord.distributedAt,
    };
  }

  async uploadProof({ userId, winningId, imageData }) {
    this.validateObjectId(userId, "Invalid user id");
    this.validateObjectId(winningId, "Invalid winning id");

    if (
      !imageData ||
      typeof imageData !== "string" ||
      !imageData.startsWith("data:image/")
    ) {
      throw new ApiError(400, "A valid image file is required");
    }

    const winning = await this.winningRepository.getWinningById(winningId);
    if (!winning) throw new ApiError(404, "Winning entry not found");

    if (winning.userId._id.toString() !== userId) {
      throw new ApiError(
        403,
        "You can only upload proof for your own winnings",
      );
    }

    // Allow re-upload after rejection (PRD flow: pending → rejected → re-upload → pending)
    if (winning.status !== "pending" && winning.status !== "rejected") {
      throw new ApiError(
        409,
        "Proof can only be uploaded while the winning is pending or rejected",
      );
    }

    try {
      assertCloudinaryConfigured();
    } catch {
      throw new ApiError(500, "Proof storage is not configured");
    }

    const uploadResponse = await cloudinary.uploader.upload(imageData, {
      folder: "golf-charity-platform/winnings-proof",
      resource_type: "image",
      public_id: `winning-${winningId}-${Date.now()}`,
      overwrite: true,
    });

    let updatedWinning = await this.winningRepository.updateWinningProof(
      winningId,
      uploadResponse.secure_url,
    );

    // Reset rejected → pending so admin can verify again
    if (winning.status === "rejected") {
      updatedWinning = await this.winningRepository.updateWinningStatus(
        winningId,
        "pending",
      );
    }

    return this.serializeWinning(updatedWinning, {
      includeUser: true,
      includeDraw: true,
    });
  }

  async verifyWinning(winningId) {
    this.validateObjectId(winningId, "Invalid winning id");
    const winning = await this.winningRepository.getWinningById(winningId);
    if (!winning) throw new ApiError(404, "Winning entry not found");
    if (!winning.proofImage)
      throw new ApiError(409, "Proof must be uploaded before verification");
    if (winning.status === "verified")
      throw new ApiError(409, "This winning has already been verified");
    if (winning.status === "paid")
      throw new ApiError(409, "Paid winnings cannot be modified");
    if (winning.status === "rejected")
      throw new ApiError(
        409,
        "Rejected winnings cannot be verified — user must re-upload proof",
      );

    const updatedWinning = await this.winningRepository.updateWinningStatus(
      winningId,
      "verified",
    );
    return this.serializeWinning(updatedWinning, {
      includeUser: true,
      includeDraw: true,
    });
  }

  async rejectWinning(winningId) {
    this.validateObjectId(winningId, "Invalid winning id");
    const winning = await this.winningRepository.getWinningById(winningId);
    if (!winning) throw new ApiError(404, "Winning entry not found");
    if (winning.status === "paid")
      throw new ApiError(409, "Paid winnings cannot be rejected");
    if (winning.status === "rejected")
      throw new ApiError(409, "This winning has already been rejected");

    const updatedWinning = await this.winningRepository.updateWinningStatus(
      winningId,
      "rejected",
    );

    // Email: notify user to re-upload
    try {
      const drawDoc = winning.drawId?._id ? winning.drawId : null;
      if (winning.userId?.email && drawDoc) {
        await emailService.sendProofRejected({
          to: winning.userId.email,
          userName: winning.userId.name,
          month: drawDoc.month,
          year: drawDoc.year,
        });
      }
    } catch (_) {
      /* non-fatal */
    }

    return this.serializeWinning(updatedWinning, {
      includeUser: true,
      includeDraw: true,
    });
  }

  async markWinningPaid(winningId) {
    this.validateObjectId(winningId, "Invalid winning id");
    const winning = await this.winningRepository.getWinningById(winningId);
    if (!winning) throw new ApiError(404, "Winning entry not found");
    if (winning.status !== "verified")
      throw new ApiError(409, "Only verified winnings can be marked as paid");
    if (this.toCents(winning.prizeAmount) <= 0)
      throw new ApiError(
        409,
        "Prize distribution must run before marking a winning as paid",
      );

    const updatedWinning = await this.winningRepository.updateWinningStatus(
      winningId,
      "paid",
    );

    // Email: payout confirmed
    try {
      const drawDoc = winning.drawId?._id ? winning.drawId : null;
      if (winning.userId?.email && drawDoc) {
        await emailService.sendPayoutConfirmation({
          to: winning.userId.email,
          userName: winning.userId.name,
          prizeAmount: winning.prizeAmount,
          month: drawDoc.month,
          year: drawDoc.year,
        });
      }
    } catch (_) {
      /* non-fatal */
    }

    return this.serializeWinning(updatedWinning, {
      includeUser: true,
      includeDraw: true,
    });
  }

  buildTierShares(totalPoolCents) {
    return MATCH_TIERS.map((tier) => {
      const rule = TIER_RULES[tier];
      return {
        tier,
        label: rule.label,
        percentage: rule.percentage,
        rollover: rule.rollover,
        amount: this.fromCents(
          Math.round((totalPoolCents * rule.percentage) / 100),
        ),
      };
    });
  }

  groupWinnersByTier(winnings) {
    return winnings.reduce(
      (groups, winning) => {
        groups[winning.matchCount].push(winning);
        return groups;
      },
      { 3: [], 4: [], 5: [] },
    );
  }

  getCycleBounds(year, month) {
    return {
      monthStart: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)),
      monthEnd: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
    };
  }

  async getDrawOrThrow(drawId) {
    const draw = await this.winningRepository.getDrawById(drawId);
    if (!draw) throw new ApiError(404, "Draw not found");
    return draw;
  }

  serializeWinning(winning, options = {}) {
    const { includeUser = false, includeDraw = false } = options;
    return {
      id: winning._id.toString(),
      userId: winning.userId?._id
        ? winning.userId._id.toString()
        : winning.userId.toString(),
      drawId: winning.drawId?._id
        ? winning.drawId._id.toString()
        : winning.drawId.toString(),
      matchCount: winning.matchCount,
      prizeAmount: Number(Number(winning.prizeAmount || 0).toFixed(2)),
      status: winning.status,
      proofImage: winning.proofImage,
      createdAt: winning.createdAt,
      updatedAt: winning.updatedAt,
      user:
        includeUser && winning.userId?._id
          ? {
              id: winning.userId._id.toString(),
              name: winning.userId.name,
              email: winning.userId.email,
            }
          : null,
      draw:
        includeDraw && winning.drawId?._id
          ? this.serializeDraw(winning.drawId)
          : null,
    };
  }

  serializeDraw(draw) {
    return {
      id: draw._id.toString(),
      month: draw.month,
      year: draw.year,
      numbers: draw.numbers,
      type: draw.type,
      status: draw.status,
      createdAt: draw.createdAt,
    };
  }

  toCents(value) {
    return Math.round(Number(value || 0) * 100);
  }
  fromCents(value) {
    return Number((value / 100).toFixed(2));
  }
  validateObjectId(value, message) {
    if (!mongoose.isValidObjectId(value)) throw new ApiError(400, message);
  }
}
