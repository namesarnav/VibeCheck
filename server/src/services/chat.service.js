import Chat from "../models/chat.model.js";
import { v4 as uuidv4 } from "uuid";
import llmService from "./llm.service.js";
import spotifyService from "./spotify.service.js";
import playlistService from "./playlist.service.js";

class ChatService {
  async createChat(userId) {
    try {
      const chat = new Chat({
        participants: [userId],
        messages: [],
        chatID: uuidv4(),
      });

      await chat.save();
      return chat;
    } catch (error) {
      throw error;
    }
  }

  async getChatById(chatId) {
    try {
      const chat = await Chat.findOne({ chatID: chatId });
      if (!chat) {
        throw new Error("Chat not found");
      }
      return chat;
    } catch (error) {
      throw error;
    }
  }

  async getUserChats(userId) {
    try {
      const chats = await Chat.find({ participants: userId }).sort({ updatedAt: -1 });
      return chats;
    } catch (error) {
      throw error;
    }
  }

  async addMessage(chatId, senderId, content) {
    try {
      const chat = await Chat.findOne({ chatID: chatId });
      if (!chat) {
        throw new Error("Chat not found");
      }

      const message = {
        sender: senderId,
        content,
        timestamp: new Date(),
      };

      chat.messages.push(message);
      chat.updatedAt = new Date();
      await chat.save();

      return message;
    } catch (error) {
      throw error;
    }
  }

  async processUserMessage(chatId, userId, userMessage, spotifyAccessToken = null) {
    try {
    // Add user message to chat
      await this.addMessage(chatId, userId, userMessage);

      // Get chat history for context
      const chat = await this.getChatById(chatId);
      const conversationHistory = chat.messages.slice(-10).map((msg) => ({
        role: msg.sender === userId ? "user" : "assistant",
        content: msg.content,
      }));

      // Analyze mood and generate search queries using LLM
      const analysis = await llmService.analyzeMoodAndGenerateQueries(
        userMessage,
        conversationHistory
      );

      let response = analysis.response;
      let playlist = null;

      // If LLM suggests creating a playlist and we have Spotify access
      if (analysis.searchQueries && analysis.searchQueries.length > 0 && spotifyAccessToken) {
        try {
          spotifyService.setAccessToken(spotifyAccessToken);

          // Search for tracks using the generated queries
          const allTracks = [];
          const playlistSize = analysis.suggestedSize || 20;

          for (const query of analysis.searchQueries.slice(0, 3)) {
            const tracks = await spotifyService.searchTracks(query, Math.ceil(playlistSize / 3));
            allTracks.push(...tracks);
          }

          // Remove duplicates and limit to requested size
          const uniqueTracks = Array.from(
            new Map(allTracks.map((track) => [track.id, track])).values()
          ).slice(0, playlistSize);

          // If we have some tracks, try to get recommendations
          if (uniqueTracks.length > 0 && uniqueTracks.length < playlistSize) {
            const seedTracks = uniqueTracks.slice(0, 5).map((t) => t.id);
            const recommendations = await spotifyService.getRecommendations({
              seedTracks,
              limit: playlistSize - uniqueTracks.length,
            });
            uniqueTracks.push(...recommendations);
          }

          if (uniqueTracks.length > 0) {
            // Create playlist in database
            playlist = await playlistService.createPlaylist({
              title: `VibeCheck - ${analysis.mood || "Mood Playlist"}`,
              description: `Generated based on: ${userMessage}`,
              tracks: uniqueTracks.map((t) => t.id),
              createdBy: userId,
            });

            // Generate response about the playlist
            response = await llmService.generatePlaylistResponse(
              { tracks: uniqueTracks, ...playlist },
              userMessage,
              conversationHistory
            );
          }
        } catch (spotifyError) {
          console.error("Spotify integration error:", spotifyError);
          // Continue without Spotify integration
        }
      }

      // Add assistant response to chat
      await this.addMessage(chatId, "assistant", response);

      return {
        response,
        analysis,
        playlist: playlist
          ? {
              playlistID: playlist.playlistID,
              title: playlist.title,
              trackCount: playlist.tracks.length,
            }
          : null,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new ChatService();

