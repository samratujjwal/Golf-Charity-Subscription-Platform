import { Router } from "express";
import { authorizeRoles, verifyJWT } from "../../middleware/auth.middleware.js";
import { CharityController } from "./charity.controller.js";
import { CharityRepository } from "./charity.repository.js";
import { CharityService } from "./charity.service.js";

const router = Router();
const charityRepository = new CharityRepository();
const charityService = new CharityService(charityRepository);
const charityController = new CharityController(charityService);

// Public routes
router.get("/", charityController.getAll);
router.get("/:id", charityController.getById);

// Authenticated user routes
router.post("/select", verifyJWT, charityController.select);
router.patch("/percentage", verifyJWT, charityController.updatePercentage); // NEW
router.post("/donate", verifyJWT, charityController.donate); // NEW
router.get("/donations/me", verifyJWT, charityController.myDonations); // NEW

// Admin routes
router.post("/", verifyJWT, authorizeRoles("admin"), charityController.create);
router.put(
  "/:id",
  verifyJWT,
  authorizeRoles("admin"),
  charityController.update,
);
router.delete(
  "/:id",
  verifyJWT,
  authorizeRoles("admin"),
  charityController.remove,
);

export default router;
