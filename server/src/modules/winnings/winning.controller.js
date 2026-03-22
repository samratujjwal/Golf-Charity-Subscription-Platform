import { ApiResponse } from "../../utils/ApiResponse.js";

export class WinningController {
  constructor(winningService) {
    this.winningService = winningService;
  }

  listMine = async (req, res, next) => {
    try {
      const result = await this.winningService.listUserWinnings(
        req.user.userId,
      );
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  uploadProof = async (req, res, next) => {
    try {
      const result = await this.winningService.uploadProof({
        userId: req.user.userId,
        winningId: req.body.winningId,
        imageData: req.body.imageData,
      });
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  calculatePool = async (req, res, next) => {
    try {
      const result = await this.winningService.calculatePrizePool(
        req.params.drawId,
      );
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  listAdmin = async (req, res, next) => {
    try {
      const result = await this.winningService.listAdminWinnings({
        status: req.query.status,
        drawId: req.query.drawId,
      });
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  distribute = async (req, res, next) => {
    try {
      const result = await this.winningService.distributePrizes(
        req.params.drawId,
      );
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  verify = async (req, res, next) => {
    try {
      const result = await this.winningService.verifyWinning(req.params.id);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  // NEW: Reject a winning — admin found proof invalid
  reject = async (req, res, next) => {
    try {
      const result = await this.winningService.rejectWinning(req.params.id);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  markPaid = async (req, res, next) => {
    try {
      const result = await this.winningService.markWinningPaid(req.params.id);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };
}
