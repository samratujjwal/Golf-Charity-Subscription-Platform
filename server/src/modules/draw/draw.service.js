import mongoose from "mongoose";
import { logger } from "../../config/logger.js";
import { ApiError } from "../../utils/ApiError.js";
import { emailService } from "../notifications/email.service.js";

const DRAW_NUMBER_COUNT = 5;
const DRAW_MIN_NUMBER = 1;
const DRAW_MAX_NUMBER = 45;

export class DrawService {
  constructor(drawRepository) {
    this.drawRepository = drawRepository;
  }

  async getDrawConfig() {
    const config = await this.drawRepository.getConfig();

    return {
      type: config?.type || "random",
      updatedAt: config?.updatedAt || null,
    };
  }

  async updateDrawConfig(type) {
    if (!["random", "algorithm"].includes(type)) {
      throw new ApiError(400, "Draw type must be either random or algorithm");
    }

    const config = await this.drawRepository.updateConfig(type);

    return {
      type: config.type,
      updatedAt: config.updatedAt,
      message: "Draw configuration updated successfully",
    };
  }

  async publishCurrentDraw() {
    const { month, year } = this.getCurrentCycle();
    const currentDraw = await this.drawRepository.getDrawByMonthYear(
      month,
      year,
    );

    if (!currentDraw) {
      throw new ApiError(404, "No draw exists for the current month");
    }

    if (currentDraw.status !== "completed") {
      throw new ApiError(409, "Draw must be run before publishing results");
    }

    if (currentDraw.publishedAt) {
      throw new ApiError(409, "Draw results have already been published");
    }

    const publishedDraw = await this.drawRepository.publishDraw(
      currentDraw._id,
      new Date(),
    );

    logger.info(
      { drawId: currentDraw._id.toString(), month, year },
      "Monthly draw published",
    );

    // Email: send draw results to all active subscribers
    try {
      const activeSubscriptions =
        await this.drawRepository.getActiveSubscriptionsWithUsers();

      await Promise.allSettled(
        activeSubscriptions.map(async (sub) => {
          const user = sub.userId;
          if (!user?.email) return;

          const scoreDoc = await this.drawRepository.getUserScoreByUserId(
            user._id,
          );
          const userScores = scoreDoc?.scores || [];
          const result = this.calculateMatches(
            userScores,
            publishedDraw.numbers,
          );

          await emailService.sendDrawResults({
            to: user.email,
            userName: user.name,
            month,
            year,
            drawNumbers: publishedDraw.numbers,
            matchCount: result.matchCount,
            isWinner: result.matchCount >= 3,
          });
        }),
      );
    } catch (_) {
      /* non-fatal */
    }

    return this.serializeDraw(publishedDraw);
  }

  async getLatestDrawForUser(userId) {
    this.validateObjectId(userId, "Invalid user id");

    const latestDraw = await this.drawRepository.getLatestDraw();

    if (!latestDraw) {
      return null;
    }

    const scoreDocument =
      await this.drawRepository.getUserScoreByUserId(userId);
    const userScores = scoreDocument?.scores || [];
    const result = this.buildUserResult(userScores, latestDraw.numbers);
    const storedWinning = await this.drawRepository.findWinningByUserAndDraw(
      userId,
      latestDraw._id,
    );

    return {
      draw: this.serializeDraw(latestDraw),
      userResult: {
        matchCount: result.matchCount,
        matchedNumbers: result.matchedNumbers,
        matchedScoreEntries: result.matchedScoreEntries,
        isWinner: result.matchCount >= 3,
        winningStatus: storedWinning?.status || null,
        prizeAmount: storedWinning?.prizeAmount || 0,
        proofImage: storedWinning?.proofImage || "",
      },
    };
  }

  async createDraw({ type, strategy = "most_frequent" } = {}) {
    const { month, year } = this.getCurrentCycle();
    const configuredType = type || (await this.getDrawConfig()).type;

    if (!["random", "algorithm"].includes(configuredType)) {
      throw new ApiError(400, "Draw type must be either random or algorithm");
    }

    if (!["most_frequent", "least_frequent"].includes(strategy)) {
      throw new ApiError(
        400,
        "Strategy must be either most_frequent or least_frequent",
      );
    }

    const existingDraw = await this.drawRepository.getDrawByMonthYear(
      month,
      year,
    );

    if (existingDraw) {
      throw new ApiError(409, "A draw already exists for the current month");
    }

    const numbers = await this.generateDrawNumbers(configuredType, strategy);
    const draw = await this.drawRepository.createDraw({
      month,
      year,
      numbers,
      type: configuredType,
      status: "pending",
      publishedAt: null,
    });

    logger.info(
      { month, year, type: configuredType, numbers },
      "Monthly draw created",
    );

    return this.serializeDraw(draw);
  }

  async simulateDraw({ type, strategy = "most_frequent", drawId } = {}) {
    let draw;

    if (drawId) {
      this.validateObjectId(drawId, "Invalid draw id");
      const storedDraw = await this.drawRepository.getDrawById(drawId);

      if (!storedDraw) {
        throw new ApiError(404, "Draw not found");
      }

      draw = storedDraw;
    } else {
      const configuredType = type || (await this.getDrawConfig()).type;

      if (!["random", "algorithm"].includes(configuredType)) {
        throw new ApiError(400, "Draw type must be either random or algorithm");
      }

      if (!["most_frequent", "least_frequent"].includes(strategy)) {
        throw new ApiError(
          400,
          "Strategy must be either most_frequent or least_frequent",
        );
      }

      const { month, year } = this.getCurrentCycle();

      draw = {
        _id: "simulation",
        month,
        year,
        numbers: await this.generateDrawNumbers(configuredType, strategy),
        type: configuredType,
        status: "pending",
        publishedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const evaluation = await this.evaluateDrawAgainstScores(
      draw.numbers,
      draw._id === "simulation" ? null : draw._id,
    );

    return {
      draw: this.serializeDraw(draw),
      predictedWinners: evaluation.winners,
      matchDistribution: evaluation.distribution,
      totalParticipants: evaluation.totalParticipants,
      totalWinners: evaluation.winners.length,
      simulation: true,
    };
  }

  async runCurrentDraw() {
    const { month, year } = this.getCurrentCycle();
    const currentDraw = await this.drawRepository.getDrawByMonthYear(
      month,
      year,
    );

    if (!currentDraw) {
      throw new ApiError(404, "No draw exists for the current month");
    }

    if (currentDraw.status === "completed") {
      throw new ApiError(409, "This month's draw has already been completed");
    }

    const evaluation = await this.evaluateDrawAgainstScores(
      currentDraw.numbers,
      currentDraw._id,
    );

    await this.drawRepository.bulkUpsertWinnings(
      evaluation.winners.map((winner) => ({
        userId: winner.user.id,
        drawId: currentDraw._id,
        matchCount: winner.matchCount,
        prizeAmount: 0,
        status: "pending",
        proofImage: "",
      })),
    );

    const updatedDraw = await this.drawRepository.updateDrawStatus(
      currentDraw._id,
      "completed",
    );

    logger.info(
      {
        drawId: currentDraw._id.toString(),
        month,
        year,
        winners: evaluation.winners.length,
      },
      "Monthly draw executed",
    );

    // Email: send winner alerts immediately
    try {
      await Promise.allSettled(
        evaluation.winners.map(async (winner) => {
          const userDoc = await this.drawRepository.getUserById(winner.user.id);
          if (userDoc?.email) {
            await emailService.sendWinnerAlert({
              to: userDoc.email,
              userName: userDoc.name,
              matchCount: winner.matchCount,
              month,
              year,
            });
          }
        }),
      );
    } catch (_) {
      /* non-fatal */
    }

    return {
      draw: this.serializeDraw(updatedDraw),
      winners: evaluation.winners,
      matchDistribution: evaluation.distribution,
      totalParticipants: evaluation.totalParticipants,
      totalWinners: evaluation.winners.length,
    };
  }

  async generateDrawNumbers(type, strategy = "most_frequent") {
    if (type === "random") {
      return this.generateRandomNumbers();
    }

    const scoreDocuments = await this.drawRepository.getAllUserScores();
    const frequencyMap = new Map();

    scoreDocuments.forEach((document) => {
      document.scores.forEach((score) => {
        const key = Number(score.value);
        frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
      });
    });

    const sortedCandidates = [...frequencyMap.entries()].sort((left, right) => {
      if (strategy === "least_frequent") {
        if (left[1] !== right[1]) {
          return left[1] - right[1];
        }

        return left[0] - right[0];
      }

      if (left[1] !== right[1]) {
        return right[1] - left[1];
      }

      return left[0] - right[0];
    });

    const selected = [];

    sortedCandidates.forEach(([value]) => {
      if (selected.length >= DRAW_NUMBER_COUNT) {
        return;
      }

      if (!selected.includes(value)) {
        selected.push(value);
      }
    });

    if (selected.length < DRAW_NUMBER_COUNT) {
      const fillerNumbers = this.generateRandomNumbers(selected);
      selected.push(
        ...fillerNumbers.slice(0, DRAW_NUMBER_COUNT - selected.length),
      );
    }

    return [...selected].sort((left, right) => left - right);
  }

  calculateMatches(userScores, drawNumbers) {
    const normalizedDrawNumbers = new Set(drawNumbers.map(Number));
    const uniqueUserNumbers = [
      ...new Set(userScores.map((score) => Number(score.value))),
    ];
    const matchedNumbers = uniqueUserNumbers
      .filter((value) => normalizedDrawNumbers.has(value))
      .sort((left, right) => left - right);

    return {
      matchCount: matchedNumbers.length,
      matchedNumbers,
      matchedScoreEntries: userScores
        .filter((score) => matchedNumbers.includes(Number(score.value)))
        .map((score) => ({
          value: Number(score.value),
          date: new Date(score.date).toISOString(),
        }))
        .sort((left, right) => new Date(right.date) - new Date(left.date)),
    };
  }

  async evaluateDrawAgainstScores(drawNumbers, drawId = null) {
    const scoreDocuments = await this.drawRepository.getAllUserScores();
    const distribution = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const winners = [];

    scoreDocuments.forEach((document) => {
      const userId = document.userId?._id
        ? document.userId._id.toString()
        : document.userId.toString();
      const userName = document.userId?.name || "Unknown user";
      const userEmail = document.userId?.email || "";
      const result = this.calculateMatches(document.scores || [], drawNumbers);

      distribution[result.matchCount] += 1;

      if (result.matchCount >= 3) {
        winners.push({
          user: {
            id: userId,
            name: userName,
            email: userEmail,
          },
          drawId: drawId ? drawId.toString() : null,
          matchCount: result.matchCount,
          matchedNumbers: result.matchedNumbers,
          matchedScoreEntries: result.matchedScoreEntries,
        });
      }
    });

    winners.sort(
      (left, right) =>
        right.matchCount - left.matchCount ||
        left.user.name.localeCompare(right.user.name),
    );

    return {
      winners,
      distribution,
      totalParticipants: scoreDocuments.length,
    };
  }

  buildUserResult(userScores, drawNumbers) {
    return this.calculateMatches(userScores || [], drawNumbers);
  }

  getCurrentCycle() {
    const now = new Date();

    return {
      month: now.getUTCMonth() + 1,
      year: now.getUTCFullYear(),
    };
  }

  generateRandomNumbers(existingNumbers = []) {
    const result = [...existingNumbers];

    while (result.length < DRAW_NUMBER_COUNT) {
      const candidate =
        Math.floor(Math.random() * DRAW_MAX_NUMBER) + DRAW_MIN_NUMBER;

      if (!result.includes(candidate)) {
        result.push(candidate);
      }
    }

    return result.sort((left, right) => left - right);
  }

  serializeDraw(draw) {
    return {
      id: draw._id?.toString?.() || String(draw._id),
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
