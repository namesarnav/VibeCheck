import { Router } from "express";
import {
  register,
  login,
  getSpotifyAuthUrl,
  spotifyCallback,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/spotify/auth-url", getSpotifyAuthUrl);
router.get("/spotify/callback", spotifyCallback);
router.get("/me", authenticateToken, getCurrentUser);

export default router;

