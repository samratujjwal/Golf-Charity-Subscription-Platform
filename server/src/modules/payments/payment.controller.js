import { ApiResponse } from '../../utils/ApiResponse.js';

export class PaymentController {
  constructor(paymentService) {
    this.paymentService = paymentService;
  }

  create = async (req, res, next) => {
    try {
      const result = await this.paymentService.createPayment(req.body);
      return res.status(201).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  listByUser = async (req, res, next) => {
    try {
      const result = await this.paymentService.listPaymentsByUser(req.params.userId);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const result = await this.paymentService.updatePaymentStatus(req.params.paymentId, req.body.status);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };
}
