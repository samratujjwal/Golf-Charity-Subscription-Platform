import { ApiResponse } from '../../utils/ApiResponse.js';

export class DrawController {
  constructor(drawService) {
    this.drawService = drawService;
  }

  create = async (req, res, next) => {
    try {
      const result = await this.drawService.createDraw(req.body);
      return res.status(201).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const result = await this.drawService.listDraws(req.query.status);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  updateStatus = async (req, res, next) => {
    try {
      const result = await this.drawService.updateDrawStatus(req.params.drawId, req.body.status);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };
}
