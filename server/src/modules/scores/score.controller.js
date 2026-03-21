import { ApiResponse } from '../../utils/ApiResponse.js';

export class ScoreController {
  constructor(scoreService) {
    this.scoreService = scoreService;
  }

  add = async (req, res, next) => {
    try {
      const result = await this.scoreService.addScore(req.params.userId, req.body);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  getByUser = async (req, res, next) => {
    try {
      const result = await this.scoreService.getScores(req.params.userId);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };
}
