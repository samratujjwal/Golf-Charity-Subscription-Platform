import { ApiResponse } from '../../utils/ApiResponse.js';

export class AdminController {
  constructor(adminService) {
    this.adminService = adminService;
  }

  dashboard = async (req, res, next) => {
    try {
      const result = await this.adminService.getDashboard();
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  analytics = async (req, res, next) => {
    try {
      const result = await this.adminService.getAnalytics();
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  listUsers = async (req, res, next) => {
    try {
      const result = await this.adminService.listUsers(req.query);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  updateUserProfile = async (req, res, next) => {
    try {
      const result = await this.adminService.updateUserProfile(req.params.id, req.body);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  updateUserScores = async (req, res, next) => {
    try {
      const result = await this.adminService.updateUserScores(req.params.id, req.body.scores);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  blockUser = async (req, res, next) => {
    try {
      const result = await this.adminService.blockUser(req.params.id, req.body.isBlocked);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  changeRole = async (req, res, next) => {
    try {
      const result = await this.adminService.updateUserRole(req.params.id, req.body.role);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  listSubscriptions = async (req, res, next) => {
    try {
      const result = await this.adminService.listSubscriptions(req.query);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  updateSubscriptionStatus = async (req, res, next) => {
    try {
      const result = await this.adminService.updateSubscriptionStatus(req.params.id, req.body.status);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  listDraws = async (req, res, next) => {
    try {
      const result = await this.adminService.listDraws(req.query);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  getDrawConfig = async (req, res, next) => {
    try {
      const result = await this.adminService.getDrawConfig();
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  updateDrawConfig = async (req, res, next) => {
    try {
      const result = await this.adminService.updateDrawConfig(req.body.type);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  createDraw = async (req, res, next) => {
    try {
      const result = await this.adminService.createDraw(req.body);
      return res.status(201).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  runDraw = async (req, res, next) => {
    try {
      const result = await this.adminService.runDraw();
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  simulateDraw = async (req, res, next) => {
    try {
      const result = await this.adminService.simulateDraw(req.body);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  publishDraw = async (req, res, next) => {
    try {
      const result = await this.adminService.publishDraw();
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  listCharities = async (req, res, next) => {
    try {
      const result = await this.adminService.listCharities(req.query);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  createCharity = async (req, res, next) => {
    try {
      const result = await this.adminService.createCharity(req.body);
      return res.status(201).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  updateCharity = async (req, res, next) => {
    try {
      const result = await this.adminService.updateCharity(req.params.id, req.body);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  deleteCharity = async (req, res, next) => {
    try {
      const result = await this.adminService.deleteCharity(req.params.id);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  listWinnings = async (req, res, next) => {
    try {
      const result = await this.adminService.listWinnings(req.query);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  calculatePrizePool = async (req, res, next) => {
    try {
      const result = await this.adminService.calculatePrizePool(req.params.drawId);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  distributePrizes = async (req, res, next) => {
    try {
      const result = await this.adminService.distributePrizes(req.params.drawId);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  verifyWinning = async (req, res, next) => {
    try {
      const result = await this.adminService.verifyWinning(req.params.id);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  markWinningPaid = async (req, res, next) => {
    try {
      const result = await this.adminService.markWinningPaid(req.params.id);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };
}
