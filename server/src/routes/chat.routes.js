import { Router } from "express";
import {
  createChat,
  getChat,
  getUserChats,
  sendMessage,
} from "../controllers/chat.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// All chat routes require authentication
router.use(authenticateToken);

router.post("/", createChat);
router.get("/", getUserChats);
router.get("/:chatId", getChat);
router.post("/:chatId/messages", sendMessage);

export default router;

