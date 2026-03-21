import { PaymentModel } from './payment.model.js';

export class PaymentRepository {
  async createPayment(payload) {
    return PaymentModel.create(payload);
  }

  async listPaymentsByUser(userId) {
    return PaymentModel.find({ userId }).sort({ createdAt: -1 }).lean().exec();
  }

  async updatePaymentStatus(paymentId, status) {
    return PaymentModel.findByIdAndUpdate(paymentId, { status }, { new: true }).lean().exec();
  }

  async findPaymentByTransactionId(transactionId) {
    return PaymentModel.findOne({ transactionId }).lean().exec();
  }
}
