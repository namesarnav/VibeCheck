import chatService from "../services/chat.service.js";

export const createChat = async (req, res) => {
  try {
    const userId = req.user.userId;
    const chat = await chatService.createChat(userId);
    res.status(201).json({ message: "Chat created", chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await chatService.getChatById(chatId);

    // Verify user is a participant
    if (!chat.participants.includes(req.user.userId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ chat });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const chats = await chatService.getUserChats(userId);
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;
    const spotifyAccessToken = req.body.spotifyAccessToken || null; // Optional Spotify token

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const result = await chatService.processUserMessage(
      chatId,
      userId,
      message,
      spotifyAccessToken
    );

    res.json({
      message: "Message processed",
      response: result.response,
      analysis: result.analysis,
      playlist: result.playlist,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

