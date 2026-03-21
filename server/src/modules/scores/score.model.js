import mongoose from 'mongoose';

const scoreEntrySchema = new mongoose.Schema(
  {
    value: {
      type: Number,
      required: true,
      min: 1,
      max: 45,
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const scoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    scores: {
      type: [scoreEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ScoreModel = mongoose.model('Score', scoreSchema);
