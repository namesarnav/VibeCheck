import { Router } from "express";
import {
  getUserProfile,
  updateUserProfile,
  getCurrentUser,
} from "../controllers/user.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

router.get("/me", getCurrentUser);
router.get("/:userId", getUserProfile);
router.put("/:userId", updateUserProfile);

export default router;
