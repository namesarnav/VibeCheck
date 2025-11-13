import Playlist from "../models/playlist.model.js";
import { v4 as uuidv4 } from "uuid";
import spotifyService from "./spotify.service.js";

class PlaylistService {
  async createPlaylist(playlistData) {
    try {
      const { title, description, tracks, createdBy } = playlistData;

      const playlist = new Playlist({
        title,
        description: description || "",
        tracks: tracks || [],
        createdBy,
        playlistID: uuidv4(),
      });

      await playlist.save();
      return playlist;
    } catch (error) {
      throw error;
    }
  }

  async getPlaylistById(playlistId) {
    try {
      const playlist = await Playlist.findOne({ playlistID: playlistId });
      if (!playlist) {
        throw new Error("Playlist not found");
      }
      return playlist;
    } catch (error) {
      throw error;
    }
  }

  async getUserPlaylists(userId) {
    try {
      const playlists = await Playlist.find({ createdBy: userId }).sort({ createdAt: -1 });
      return playlists;
    } catch (error) {
      throw error;
    }
  }

  async updatePlaylist(playlistId, updateData, userId) {
    try {
      const playlist = await Playlist.findOne({ playlistID: playlistId });
      if (!playlist) {
        throw new Error("Playlist not found");
      }

      if (playlist.createdBy !== userId) {
        throw new Error("Unauthorized: You can only update your own playlists");
      }

      const updatedPlaylist = await Playlist.findOneAndUpdate(
        { playlistID: playlistId },
        { ...updateData, updatedAt: new Date() },
        { new: true }
      );

      return updatedPlaylist;
    } catch (error) {
      throw error;
    }
  }

  async deletePlaylist(playlistId, userId) {
    try {
      const playlist = await Playlist.findOne({ playlistID: playlistId });
      if (!playlist) {
        throw new Error("Playlist not found");
      }

      if (playlist.createdBy !== userId) {
        throw new Error("Unauthorized: You can only delete your own playlists");
      }

      await Playlist.deleteOne({ playlistID: playlistId });
      return { message: "Playlist deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  async addTracksToPlaylist(playlistId, trackIds, userId) {
    try {
      const playlist = await this.getPlaylistById(playlistId);

      if (playlist.createdBy !== userId) {
        throw new Error("Unauthorized: You can only modify your own playlists");
      }

      // Add new tracks, avoiding duplicates
      const existingTracks = new Set(playlist.tracks);
      const newTracks = trackIds.filter((id) => !existingTracks.has(id));
      playlist.tracks.push(...newTracks);
      playlist.updatedAt = new Date();

      await playlist.save();
      return playlist;
    } catch (error) {
      throw error;
    }
  }

  async removeTracksFromPlaylist(playlistId, trackIds, userId) {
    try {
      const playlist = await this.getPlaylistById(playlistId);

      if (playlist.createdBy !== userId) {
        throw new Error("Unauthorized: You can only modify your own playlists");
      }

      playlist.tracks = playlist.tracks.filter((id) => !trackIds.includes(id));
      playlist.updatedAt = new Date();

      await playlist.save();
      return playlist;
    } catch (error) {
      throw error;
    }
  }

  async publishToSpotify(playlistId, userId, spotifyAccessToken) {
    try {
      const playlist = await this.getPlaylistById(playlistId);

      if (playlist.createdBy !== userId) {
        throw new Error("Unauthorized: You can only publish your own playlists");
      }

      if (!spotifyAccessToken) {
        throw new Error("Spotify access token required");
      }

      spotifyService.setAccessToken(spotifyAccessToken);

      // Get user's Spotify profile
      const spotifyUser = await spotifyService.getUserProfile();

      // Create playlist on Spotify
      const spotifyPlaylist = await spotifyService.createPlaylist(
        spotifyUser.id,
        playlist.title,
        playlist.description
      );

      // Convert track IDs to URIs (format: spotify:track:TRACK_ID)
      const trackUris = playlist.tracks.map((trackId) => `spotify:track:${trackId}`);

      // Add tracks to Spotify playlist
      if (trackUris.length > 0) {
        await spotifyService.addTracksToPlaylist(spotifyPlaylist.id, trackUris);
      }

      return {
        message: "Playlist published to Spotify successfully",
        spotifyPlaylist: {
          id: spotifyPlaylist.id,
          name: spotifyPlaylist.name,
          externalUrl: spotifyPlaylist.externalUrl,
        },
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new PlaylistService();

