import { Router } from "express";
import { adminOnly, verifyJWT } from "../../middleware/auth.middleware.js";
import { validateRequest } from "../../middleware/validate.middleware.js";
import { CharityRepository } from "../charity/charity.repository.js";
import { CharityService } from "../charity/charity.service.js";
import { DrawRepository } from "../draw/draw.repository.js";
import { DrawService } from "../draw/draw.service.js";
import { ScoreRepository } from "../score/score.repository.js";
import { ScoreService } from "../score/score.service.js";
import { WinningRepository } from "../winnings/winning.repository.js";
import { WinningService } from "../winnings/winning.service.js";
import { AdminController } from "./admin.controller.js";
import { AdminRepository } from "./admin.repository.js";
import { AdminService } from "./admin.service.js";
import { AnalyticsService } from "./analytics.service.js";
import {
  blockUserSchema,
  charitySchema,
  charityUpdateSchema,
  drawActionSchema,
  drawConfigSchema,
  drawIdSchema,
  paginationSchema,
  roleSchema,
  subscriptionStatusSchema,
  updateUserSchema,
  updateUserScoresSchema,
  winningIdSchema,
} from "./admin.validators.js";

const router = Router();
const adminRepository = new AdminRepository();
const analyticsService = new AnalyticsService(adminRepository);
const drawRepository = new DrawRepository();
const drawService = new DrawService(drawRepository);
const winningRepository = new WinningRepository();
const winningService = new WinningService(winningRepository);
const scoreRepository = new ScoreRepository();
const scoreService = new ScoreService(scoreRepository);
const charityRepository = new CharityRepository();
const charityService = new CharityService(charityRepository);
const adminService = new AdminService(
  adminRepository,
  analyticsService,
  drawService,
  winningService,
  scoreService,
  charityService,
);
const adminController = new AdminController(adminService);

router.use(verifyJWT, adminOnly);

// Analytics
router.get("/dashboard", adminController.dashboard);
router.get("/analytics", adminController.analytics);

// Users
router.get(
  "/users",
  validateRequest(paginationSchema),
  adminController.listUsers,
);
router.put(
  "/user/:id",
  validateRequest(updateUserSchema),
  adminController.updateUserProfile,
);
router.put(
  "/user/:id/scores",
  validateRequest(updateUserScoresSchema),
  adminController.updateUserScores,
);
router.put(
  "/user/:id/block",
  validateRequest(blockUserSchema),
  adminController.blockUser,
);
router.put(
  "/user/:id/role",
  validateRequest(roleSchema),
  adminController.changeRole,
);

// Subscriptions
router.get(
  "/subscriptions",
  validateRequest(paginationSchema),
  adminController.listSubscriptions,
);
router.put(
  "/subscription/:id/status",
  validateRequest(subscriptionStatusSchema),
  adminController.updateSubscriptionStatus,
);

// Draws
router.get(
  "/draws",
  validateRequest(paginationSchema),
  adminController.listDraws,
);
router.get("/draw/config", adminController.getDrawConfig);
router.put(
  "/draw/config",
  validateRequest(drawConfigSchema),
  adminController.updateDrawConfig,
);
router.post(
  "/draws/create",
  validateRequest(drawActionSchema),
  adminController.createDraw,
);
router.post(
  "/draws/simulate",
  validateRequest(drawActionSchema),
  adminController.simulateDraw,
);
router.post("/draws/run", adminController.runDraw);
router.post("/draw/publish", adminController.publishDraw);

// Charities
router.get(
  "/charity",
  validateRequest(paginationSchema),
  adminController.listCharities,
);
router.post(
  "/charity",
  validateRequest(charitySchema),
  adminController.createCharity,
);
router.put(
  "/charity/:id",
  validateRequest(charityUpdateSchema),
  adminController.updateCharity,
);
router.delete("/charity/:id", adminController.deleteCharity);

// Winnings
router.get(
  "/winnings",
  validateRequest(paginationSchema),
  adminController.listWinnings,
);
router.get(
  "/winnings/draw/:drawId/pool",
  validateRequest(drawIdSchema),
  adminController.calculatePrizePool,
);
router.post(
  "/winnings/draw/:drawId/distribute",
  validateRequest(drawIdSchema),
  adminController.distributePrizes,
);
router.put(
  "/winning/:id/verify",
  validateRequest(winningIdSchema),
  adminController.verifyWinning,
);
router.put(
  "/winning/:id/reject",
  validateRequest(winningIdSchema),
  adminController.rejectWinning,
); // NEW
router.put(
  "/winning/:id/pay",
  validateRequest(winningIdSchema),
  adminController.markWinningPaid,
);

export default router;
