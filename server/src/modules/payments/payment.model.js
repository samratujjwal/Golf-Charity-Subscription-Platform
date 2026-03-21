import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
      index: true,
    },
    paymentProvider: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    transactionId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

paymentSchema.index({ transactionId: 1 }, { unique: true, name: 'unique_transaction_id' });

export const PaymentModel = mongoose.model('Payment', paymentSchema);
