import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';

export class PaymentService {
  constructor(paymentRepository, subscriptionRepository) {
    this.paymentRepository = paymentRepository;
    this.subscriptionRepository = subscriptionRepository;
  }

  async createPayment(payload) {
    const {
      userId,
      subscriptionId = null,
      amount,
      currency = 'USD',
      status = 'pending',
      paymentProvider,
      transactionId,
    } = payload;

    this.validateObjectId(userId, 'Invalid user id');

    const normalizedAmount = Number(amount);
    const normalizedProvider = paymentProvider?.trim();
    const normalizedTransactionId = transactionId?.trim();

    if (!Number.isFinite(normalizedAmount) || normalizedAmount < 0) {
      throw new ApiError(400, 'Amount must be zero or greater');
    }

    if (!normalizedProvider) {
      throw new ApiError(400, 'Payment provider is required');
    }

    if (!normalizedTransactionId) {
      throw new ApiError(400, 'Transaction id is required');
    }

    if (subscriptionId) {
      this.validateObjectId(subscriptionId, 'Invalid subscription id');

      const subscription = await this.subscriptionRepository.findSubscriptionById(subscriptionId);

      if (!subscription) {
        throw new ApiError(404, 'Subscription not found');
      }
    }

    const existingPayment = await this.paymentRepository.findPaymentByTransactionId(normalizedTransactionId);

    if (existingPayment) {
      throw new ApiError(409, 'Transaction id already exists');
    }

    const payment = await this.paymentRepository.createPayment({
      userId,
      subscriptionId,
      amount: normalizedAmount,
      currency: currency.trim().toUpperCase(),
      status,
      paymentProvider: normalizedProvider,
      transactionId: normalizedTransactionId,
    });

    return this.sanitizePayment(payment);
  }

  async listPaymentsByUser(userId) {
    this.validateObjectId(userId, 'Invalid user id');
    return this.paymentRepository.listPaymentsByUser(userId);
  }

  async updatePaymentStatus(paymentId, status) {
    this.validateObjectId(paymentId, 'Invalid payment id');
    return this.paymentRepository.updatePaymentStatus(paymentId, status);
  }

  sanitizePayment(payment) {
    return {
      id: payment._id.toString(),
      userId: payment.userId.toString(),
      subscriptionId: payment.subscriptionId ? payment.subscriptionId.toString() : null,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentProvider: payment.paymentProvider,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  validateObjectId(value, message) {
    if (!mongoose.isValidObjectId(value)) {
      throw new ApiError(400, message);
    }
  }
}
