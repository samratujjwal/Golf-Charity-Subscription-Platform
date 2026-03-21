import mongoose from 'mongoose';

const winningSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    drawId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Draw',
      required: true,
      index: true,
    },
    matchCount: {
      type: Number,
      enum: [3, 4, 5],
      required: true,
    },
    prizeAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'paid'],
      default: 'pending',
      index: true,
    },
    proofImage: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

winningSchema.index({ userId: 1, drawId: 1 }, { unique: true, name: 'unique_user_draw_winning' });
winningSchema.index({ drawId: 1, status: 1 }, { name: 'draw_status_winning_idx' });

export const WinningModel = mongoose.model('Winning', winningSchema);
