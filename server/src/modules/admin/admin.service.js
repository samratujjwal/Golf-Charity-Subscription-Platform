import mongoose from 'mongoose';
import { CharityService } from '../charity/charity.service.js';
import { ApiError } from '../../utils/ApiError.js';

export class AdminService {
  constructor(adminRepository, analyticsService, drawService, winningService, scoreService, charityService) {
    this.adminRepository = adminRepository;
    this.analyticsService = analyticsService;
    this.drawService = drawService;
    this.winningService = winningService;
    this.scoreService = scoreService;
    this.charityService = charityService;
  }

  async getDashboard() {
    return this.analyticsService.getDashboardAnalytics();
  }

  async getAnalytics() {
    return this.analyticsService.getDashboardAnalytics();
  }

  async listUsers(query) {
    const { page, limit } = this.normalizePagination(query);
    const result = await this.adminRepository.listUsers({
      page,
      limit,
      search: query.search?.trim() || '',
    });

    return {
      items: result.items.map((user) => this.serializeUser(user)),
      pagination: this.buildPagination(page, limit, result.total),
    };
  }

  async updateUserProfile(userId, payload) {
    this.validateObjectId(userId, 'Invalid user id');

    const existingUser = await this.adminRepository.getUserById(userId);

    if (!existingUser) {
      throw new ApiError(404, 'User not found');
    }

    const normalizedName = payload.name.trim();
    const normalizedEmail = payload.email.trim().toLowerCase();

    const updatedUser = await this.adminRepository.updateUserProfile(userId, {
      name: normalizedName,
      email: normalizedEmail,
    });

    return this.serializeUser(updatedUser);
  }

  async updateUserScores(userId, scores) {
    this.validateObjectId(userId, 'Invalid user id');

    const existingUser = await this.adminRepository.getUserById(userId);

    if (!existingUser) {
      throw new ApiError(404, 'User not found');
    }

    return this.scoreService.replaceScores(userId, scores);
  }

  async blockUser(userId, isBlocked) {
    this.validateObjectId(userId, 'Invalid user id');

    const existingUser = await this.adminRepository.getUserById(userId);

    if (!existingUser) {
      throw new ApiError(404, 'User not found');
    }

    const updatedUser = await this.adminRepository.updateUserBlockState(userId, isBlocked);
    return this.serializeUser(updatedUser);
  }

  async updateUserRole(userId, role) {
    this.validateObjectId(userId, 'Invalid user id');

    const existingUser = await this.adminRepository.getUserById(userId);

    if (!existingUser) {
      throw new ApiError(404, 'User not found');
    }

    const updatedUser = await this.adminRepository.updateUserRole(userId, role);
    return this.serializeUser(updatedUser);
  }

  async listSubscriptions(query) {
    const { page, limit } = this.normalizePagination(query);
    const result = await this.adminRepository.listSubscriptions({
      page,
      limit,
      status: query.status || '',
    });

    return {
      items: result.items.map((subscription) => this.serializeSubscription(subscription)),
      pagination: this.buildPagination(page, limit, result.total),
    };
  }

  async updateSubscriptionStatus(subscriptionId, status) {
    this.validateObjectId(subscriptionId, 'Invalid subscription id');

    const subscription = await this.adminRepository.getSubscriptionById(subscriptionId);

    if (!subscription) {
      throw new ApiError(404, 'Subscription not found');
    }

    const updated = await this.adminRepository.updateSubscriptionStatus(subscriptionId, status);
    return this.serializeSubscription(updated);
  }

  async listDraws(query) {
    const { page, limit } = this.normalizePagination(query);
    const result = await this.adminRepository.listDraws({
      page,
      limit,
      status: query.status || '',
    });

    return {
      items: result.items.map((draw) => this.serializeDraw(draw)),
      pagination: this.buildPagination(page, limit, result.total),
    };
  }

  async getDrawConfig() {
    return this.drawService.getDrawConfig();
  }

  async updateDrawConfig(type) {
    return this.drawService.updateDrawConfig(type);
  }

  async createDraw(payload) {
    return this.drawService.createDraw(payload);
  }

  async runDraw() {
    return this.drawService.runCurrentDraw();
  }

  async simulateDraw(payload) {
    return this.drawService.simulateDraw(payload);
  }

  async publishDraw() {
    return this.drawService.publishCurrentDraw();
  }

  async listCharities(query) {
    return this.charityService.getAllCharities(query || {});
  }

  async createCharity(payload) {
    return this.charityService.createCharity(payload);
  }

  async updateCharity(charityId, payload) {
    return this.charityService.updateCharity(charityId, payload);
  }

  async deleteCharity(charityId) {
    return this.charityService.deleteCharity(charityId);
  }

  async listWinnings(query) {
    return this.winningService.listAdminWinnings(query);
  }

  async calculatePrizePool(drawId) {
    return this.winningService.calculatePrizePool(drawId);
  }

  async distributePrizes(drawId) {
    return this.winningService.distributePrizes(drawId);
  }

  async verifyWinning(winningId) {
    return this.winningService.verifyWinning(winningId);
  }

  async markWinningPaid(winningId) {
    return this.winningService.markWinningPaid(winningId);
  }

  normalizePagination(query) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
    return { page, limit };
  }

  buildPagination(page, limit, total) {
    return {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  serializeUser(user) {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: Boolean(user.isBlocked),
      charityId: user.charityId ? user.charityId.toString() : null,
      scores: Array.isArray(user.scores) ? user.scores.map((score) => ({
        value: score.value,
        date: score.date,
      })) : [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  serializeSubscription(subscription) {
    return {
      id: subscription._id.toString(),
      plan: subscription.plan,
      status: subscription.status,
      amount: subscription.amount,
      charityPercentage: subscription.charityPercentage,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      user: subscription.userId?._id
        ? {
            id: subscription.userId._id.toString(),
            name: subscription.userId.name,
            email: subscription.userId.email,
            role: subscription.userId.role,
            isBlocked: Boolean(subscription.userId.isBlocked),
          }
        : null,
    };
  }

  serializeDraw(draw) {
    return {
      id: draw._id.toString(),
      month: draw.month,
      year: draw.year,
      numbers: draw.numbers,
      type: draw.type,
      status: draw.status,
      publishedAt: draw.publishedAt || null,
      createdAt: draw.createdAt,
      updatedAt: draw.updatedAt,
    };
  }

  validateObjectId(value, message) {
    if (!mongoose.isValidObjectId(value)) {
      throw new ApiError(400, message);
    }
  }
}

