import { Router } from "express";
import {
  createPlaylist,
  getPlaylist,
  getUserPlaylists,
  updatePlaylist,
  deletePlaylist,
  addTracks,
  removeTracks,
  publishToSpotify,
} from "../controllers/playlist.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// All playlist routes require authentication
router.use(authenticateToken);

router.post("/", createPlaylist);
router.get("/", getUserPlaylists);
router.get("/:playlistId", getPlaylist);
router.put("/:playlistId", updatePlaylist);
router.delete("/:playlistId", deletePlaylist);
router.post("/:playlistId/tracks", addTracks);
router.delete("/:playlistId/tracks", removeTracks);
router.post("/:playlistId/publish", publishToSpotify);

export default router;

