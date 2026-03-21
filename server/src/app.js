import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middleware/error.middleware.js";
import { requestLogger } from "./middleware/logger.middleware.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import charityRoutes from "./modules/charity/charity.routes.js";
import monthlyDrawRoutes from "./modules/draw/draw.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";
import scoreRoutes from "./modules/score/score.routes.js";
import stripeSubscriptionRoutes, {
  subscriptionWebhookHandler,
} from "./modules/subscription/subscription.routes.js";
import subscriptionRoutes from "./modules/subscriptions/subscription.routes.js";
import winningRoutes from "./modules/winnings/winning.routes.js";
import { ApiResponse } from "./utils/ApiResponse.js";

dotenv.config({ path: "../.env" });

const app = express();
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = clientUrl
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 300 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: ApiResponse.failure("Too many requests, please try again later."),
});

app.set("trust proxy", 1);
app.use(requestLogger);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(apiLimiter);
app.use(cookieParser());
app.post(
  "/api/v1/subscription/webhook",
  express.raw({ type: "application/json" }),
  subscriptionWebhookHandler,
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/api/v1/health", async (req, res) => {
  return res.status(200).json(
    ApiResponse.success({
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    }),
  );
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/subscription", stripeSubscriptionRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/score", scoreRoutes);
app.use("/api/v1/charity", charityRoutes);
app.use("/api/v1/draw", monthlyDrawRoutes);
app.use("/api/v1/winnings", winningRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/payments", paymentRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
