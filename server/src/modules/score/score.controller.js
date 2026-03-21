import { ApiResponse } from '../../utils/ApiResponse.js';

export class ScoreController {
  constructor(scoreService) {
    this.scoreService = scoreService;
  }

  add = async (req, res, next) => {
    try {
      const result = await this.scoreService.addScore(req.user.userId, req.body.value, req.body.date);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  get = async (req, res, next) => {
    try {
      const result = await this.scoreService.getScores(req.user.userId);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  edit = async (req, res, next) => {
    try {
      const result = await this.scoreService.editScore(
        req.user.userId,
        req.params.index,
        req.body.value,
        req.body.date,
      );
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };
}
