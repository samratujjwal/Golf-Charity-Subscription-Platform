import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    charityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    // 'direct' = one-time independent donation; 'subscription' = auto from subscription payment
    type: {
      type: String,
      enum: ["direct", "subscription"],
      default: "direct",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

donationSchema.index({ userId: 1, createdAt: -1 });
donationSchema.index({ charityId: 1, createdAt: -1 });

export const DonationModel = mongoose.model("Donation", donationSchema);
