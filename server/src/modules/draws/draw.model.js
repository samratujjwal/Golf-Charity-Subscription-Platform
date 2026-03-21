import mongoose from 'mongoose';

const drawSchema = new mongoose.Schema(
  {
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
    numbers: {
      type: [Number],
      required: true,
      validate: [
        {
          validator(numbers) {
            return Array.isArray(numbers) && numbers.length === 5;
          },
          message: 'Draw must contain exactly 5 numbers',
        },
        {
          validator(numbers) {
            return numbers.every((number) => Number.isInteger(number) && number >= 1 && number <= 45);
          },
          message: 'Draw numbers must be integers between 1 and 45',
        },
        {
          validator(numbers) {
            return new Set(numbers).size === numbers.length;
          },
          message: 'Draw numbers must be unique',
        },
      ],
    },
    type: {
      type: String,
      enum: ['random', 'algorithm'],
      default: 'random',
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

drawSchema.index({ month: 1, year: 1 }, { unique: true, name: 'unique_month_year_draw' });

export const DrawModel = mongoose.model('Draw', drawSchema);
