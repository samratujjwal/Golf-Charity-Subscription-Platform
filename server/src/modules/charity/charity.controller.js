import { ApiResponse } from "../../utils/ApiResponse.js";

export class CharityController {
  constructor(charityService) {
    this.charityService = charityService;
  }

  getAll = async (req, res, next) => {
    try {
      const result = await this.charityService.getAllCharities(req.query);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const result = await this.charityService.getCharityById(req.params.id);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  select = async (req, res, next) => {
    try {
      const result = await this.charityService.selectCharity(
        req.user.userId,
        req.body.charityId,
      );
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  // NEW: User updates their charity contribution percentage
  updatePercentage = async (req, res, next) => {
    try {
      const result = await this.charityService.updateCharityPercentage(
        req.user.userId,
        req.body.percentage,
      );
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  // NEW: User makes an independent (non-subscription) donation
  donate = async (req, res, next) => {
    try {
      const result = await this.charityService.makeDonation(
        req.user.userId,
        req.body.charityId,
        req.body.amount,
      );
      return res.status(201).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  // NEW: Get user's own donation history
  myDonations = async (req, res, next) => {
    try {
      const result = await this.charityService.getUserDonations(
        req.user.userId,
      );
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  create = async (req, res, next) => {
    try {
      const result = await this.charityService.createCharity(req.body);
      return res.status(201).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  update = async (req, res, next) => {
    try {
      const result = await this.charityService.updateCharity(
        req.params.id,
        req.body,
      );
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };

  remove = async (req, res, next) => {
    try {
      const result = await this.charityService.deleteCharity(req.params.id);
      return res.status(200).json(ApiResponse.success(result));
    } catch (error) {
      return next(error);
    }
  };
}
