import { ApiResponse } from '../../utils/ApiResponse.js';

export class DrawController {
  constructor(drawService) {
    this.drawService = drawService;
  }

  latest = async (req, res, next) => {
    try {
      const result = await this.drawService.getLatestDrawForUser(req.user.userId);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const result = await this.drawService.createDraw(req.body);
      return res.status(201).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  run = async (req, res, next) => {
    try {
      const result = await this.drawService.runCurrentDraw();
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  simulate = async (req, res, next) => {
    try {
      const result = await this.drawService.simulateDraw(req.body);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };
}
