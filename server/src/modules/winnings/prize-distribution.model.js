import mongoose from 'mongoose';

const tierBreakdownSchema = new mongoose.Schema(
  {
    tier: {
      type: Number,
      enum: [3, 4, 5],
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    rollover: {
      type: Boolean,
      required: true,
      default: false,
    },
    winnersCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    amountPerWinner: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { _id: false },
);

const prizeDistributionSchema = new mongoose.Schema(
  {
    drawId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Draw',
      required: true,
      unique: true,
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2020,
      max: 2100,
    },
    poolPercentage: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    eligibleSubscriptionCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    basePoolAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    carryForwardAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    totalPoolAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    jackpotCarryForwardAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    tierBreakdown: {
      type: [tierBreakdownSchema],
      default: [],
    },
    distributedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

prizeDistributionSchema.index({ year: -1, month: -1 }, { name: 'distribution_cycle_idx' });

export const PrizeDistributionModel = mongoose.model('PrizeDistribution', prizeDistributionSchema);

