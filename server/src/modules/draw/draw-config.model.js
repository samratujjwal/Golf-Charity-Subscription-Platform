import mongoose from 'mongoose';

const drawConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
    },
    type: {
      type: String,
      enum: ['random', 'algorithm'],
      default: 'random',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const DrawConfigModel = mongoose.model('DrawConfig', drawConfigSchema);
