import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      required: true,
      default: "active",
      index: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    charityPercentage: {
      type: Number,
      default: 10,
      min: 10,
      max: 100,
    },
    stripeCustomerId: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
      trim: true,
    },
    stripePriceId: {
      type: String,
      default: null,
      index: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

subscriptionSchema.index(
  { userId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" },
    name: "unique_active_subscription_per_user",
  },
);

subscriptionSchema.index(
  { stripeSubscriptionId: 1 },
  {
    unique: true,
    sparse: true,
    name: "unique_stripe_subscription_id",
  },
);

subscriptionSchema.path("endDate").validate(function validateDateRange(
  endDate,
) {
  return this.startDate && endDate && endDate > this.startDate;
}, "End date must be later than start date");

export const SubscriptionModel = mongoose.model(
  "Subscription",
  subscriptionSchema,
);
