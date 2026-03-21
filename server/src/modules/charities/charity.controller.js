import { ApiResponse } from '../../utils/ApiResponse.js';

export class CharityController {
  constructor(charityService) {
    this.charityService = charityService;
  }

  create = async (req, res, next) => {
    try {
      const result = await this.charityService.createCharity(req.body);
      return res.status(201).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  list = async (req, res, next) => {
    try {
      const result = await this.charityService.listCharities(req.query.search);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  featured = async (req, res, next) => {
    try {
      const result = await this.charityService.getFeaturedCharities();
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  addDonation = async (req, res, next) => {
    try {
      const result = await this.charityService.addDonation(req.params.charityId, req.body.amount);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };
}
