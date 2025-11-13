import OpenAI from "openai";
import { loadEnv } from "../utils/env.js";

loadEnv();

class LLMService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Analyze user's mood and generate search queries for Spotify
  async analyzeMoodAndGenerateQueries(userMessage, conversationHistory = []) {
    try {
      const messages = [
        {
          role: "system",
          content: `You are a music recommendation assistant for VibeCheck. Your job is to:
1. Understand the user's mood and feelings from their messages
2. Generate appropriate Spotify search queries based on their mood
3. Suggest playlist sizes (10, 20, 50, or 100 songs)
4. Provide a friendly, conversational response

When analyzing mood, consider:
- Emotional state (happy, sad, energetic, calm, etc.)
- Activity context (workout, study, party, relaxation, etc.)
- Genre preferences if mentioned
- Energy level desired

Generate 3-5 Spotify search queries that would find relevant songs for this mood.
Format your response as JSON with: mood, energyLevel, suggestedSize, searchQueries (array), and response (friendly message).`,
        },
        ...conversationHistory,
        {
          role: "user",
          content: userMessage,
        },
      ];

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages,
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const content = JSON.parse(completion.choices[0].message.content);
      return content;
    } catch (error) {
      throw new Error(`LLM analysis failed: ${error.message}`);
    }
  }

  // Generate conversational response about playlist
  async generatePlaylistResponse(playlist, userMessage = "", conversationHistory = []) {
    try {
      const trackNames = playlist.tracks.slice(0, 10).map((t) => t.name).join(", ");
      const messages = [
        {
          role: "system",
          content: `You are a friendly music assistant. The user has received a playlist with ${playlist.tracks.length} songs. 
Generate a warm, conversational response about the playlist. Mention a few standout tracks if relevant.
Ask if they'd like any changes or if they're ready to add it to Spotify.`,
        },
        ...conversationHistory,
        {
          role: "user",
          content: userMessage || "Here's my playlist",
        },
        {
          role: "assistant",
          content: `I've created a playlist with ${playlist.tracks.length} songs for you! Here are some highlights: ${trackNames}...`,
        },
      ];

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages,
        temperature: 0.8,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      throw new Error(`LLM response generation failed: ${error.message}`);
    }
  }

  // Generate general conversational response
  async generateResponse(userMessage, conversationHistory = []) {
    try {
      const messages = [
        {
          role: "system",
          content: `You are a friendly music recommendation assistant for VibeCheck. Help users express their mood and create personalized playlists. 
Be conversational, empathetic, and guide them to describe how they're feeling.`,
        },
        ...conversationHistory,
        {
          role: "user",
          content: userMessage,
        },
      ];

      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages,
        temperature: 0.8,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      throw new Error(`LLM response failed: ${error.message}`);
    }
  }
}

export default new LLMService();

