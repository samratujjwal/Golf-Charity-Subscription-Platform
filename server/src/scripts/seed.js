import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { AuthModel } from '../modules/auth/auth.model.js';
import { CharityModel } from '../modules/charities/charity.model.js';
import { DrawModel } from '../modules/draws/draw.model.js';
import { PaymentModel } from '../modules/payments/payment.model.js';
import { ScoreModel } from '../modules/scores/score.model.js';
import { SubscriptionModel } from '../modules/subscriptions/subscription.model.js';
import { WinningModel } from '../modules/winnings/winning.model.js';

dotenv.config();

async function seed() {
  await connectDatabase();

  await Promise.all([
    WinningModel.deleteMany({}),
    PaymentModel.deleteMany({}),
    SubscriptionModel.deleteMany({}),
    ScoreModel.deleteMany({}),
    DrawModel.deleteMany({}),
    CharityModel.deleteMany({}),
    AuthModel.deleteMany({}),
  ]);

  const [adminUser, standardUser] = await AuthModel.create([
    {
      name: 'Admin User',
      email: 'admin@golfcharity.com',
      password: 'Password123!',
      role: 'admin',
    },
    {
      name: 'Sample Member',
      email: 'member@golfcharity.com',
      password: 'Password123!',
      role: 'user',
    },
  ]);

  const charity = await CharityModel.create({
    name: 'First Tee Future Fund',
    description: 'Supports youth access to golf, mentorship, and character education.',
    image: 'https://example.com/charity-first-tee.jpg',
    isFeatured: true,
    totalDonations: 2500,
  });

  const subscription = await SubscriptionModel.create({
    userId: standardUser._id,
    plan: 'monthly',
    status: 'active',
    startDate: new Date('2026-03-01T00:00:00.000Z'),
    endDate: new Date('2026-03-31T23:59:59.999Z'),
    amount: 49,
    charityPercentage: 15,
  });

  await ScoreModel.create({
    userId: standardUser._id,
    scores: [
      { value: 8, date: new Date('2026-02-01T09:00:00.000Z') },
      { value: 11, date: new Date('2026-02-08T09:00:00.000Z') },
      { value: 7, date: new Date('2026-02-15T09:00:00.000Z') },
      { value: 10, date: new Date('2026-02-22T09:00:00.000Z') },
      { value: 9, date: new Date('2026-03-01T09:00:00.000Z') },
    ],
  });

  const draw = await DrawModel.create({
    month: 3,
    year: 2026,
    numbers: [4, 9, 17, 23, 41],
    type: 'random',
    status: 'completed',
  });

  await PaymentModel.create({
    userId: standardUser._id,
    subscriptionId: subscription._id,
    amount: 49,
    currency: 'USD',
    status: 'success',
    paymentProvider: 'stripe',
    transactionId: 'txn_seed_20260301',
  });

  await WinningModel.create({
    userId: standardUser._id,
    drawId: draw._id,
    matchCount: 3,
    prizeAmount: 150,
    status: 'verified',
    proofImage: 'https://example.com/proof/member-win-2026-03.png',
  });

  console.log('Seed complete');
  console.log({
    adminUser: adminUser.email,
    memberUser: standardUser.email,
    charity: charity.name,
    subscriptionId: subscription._id.toString(),
    drawId: draw._id.toString(),
  });
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
