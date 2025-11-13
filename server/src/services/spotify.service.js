import SpotifyWebApi from "spotify-web-api-node";
import { loadEnv } from "../utils/env.js";

loadEnv();

class SpotifyService {
  constructor() {
    this.spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI || "http://localhost:3000/api/auth/spotify/callback",
    });
  }

  // Set access token for authenticated user
  setAccessToken(accessToken) {
    this.spotifyApi.setAccessToken(accessToken);
  }

  // Get authorization URL for OAuth flow
  getAuthorizeURL(scopes = ["playlist-modify-public", "playlist-modify-private", "user-read-private"]) {
    return this.spotifyApi.createAuthorizeURL(scopes, "state");
  }

  // Exchange authorization code for access token
  async authorizeCode(code) {
    try {
      const data = await this.spotifyApi.authorizationCodeGrant(code);
      return {
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      };
    } catch (error) {
      throw new Error(`Spotify authorization failed: ${error.message}`);
    }
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    try {
      this.spotifyApi.setRefreshToken(refreshToken);
      const data = await this.spotifyApi.refreshAccessToken();
      return {
        accessToken: data.body.access_token,
        expiresIn: data.body.expires_in,
      };
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  // Search for tracks based on mood/query
  async searchTracks(query, limit = 20) {
    try {
      const data = await this.spotifyApi.searchTracks(query, { limit });
      return data.body.tracks.items.map((track) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist) => artist.name),
        album: track.album.name,
        previewUrl: track.preview_url,
        externalUrl: track.external_urls.spotify,
        image: track.album.images[0]?.url,
        duration: track.duration_ms,
      }));
    } catch (error) {
      throw new Error(`Track search failed: ${error.message}`);
    }
  }

  // Get recommendations based on seed tracks/artists/genres
  async getRecommendations(options = {}) {
    try {
      const {
        seedTracks = [],
        seedArtists = [],
        seedGenres = [],
        limit = 20,
        targetValence,
        targetEnergy,
        targetDanceability,
      } = options;

      const params = {
        limit,
        ...(seedTracks.length > 0 && { seed_tracks: seedTracks.slice(0, 5).join(",") }),
        ...(seedArtists.length > 0 && { seed_artists: seedArtists.slice(0, 5).join(",") }),
        ...(seedGenres.length > 0 && { seed_genres: seedGenres.slice(0, 5).join(",") }),
        ...(targetValence !== undefined && { target_valence: targetValence }),
        ...(targetEnergy !== undefined && { target_energy: targetEnergy }),
        ...(targetDanceability !== undefined && { target_danceability: targetDanceability }),
      };

      const data = await this.spotifyApi.getRecommendations(params);
      return data.body.tracks.map((track) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist) => artist.name),
        album: track.album.name,
        previewUrl: track.preview_url,
        externalUrl: track.external_urls.spotify,
        image: track.album.images[0]?.url,
        duration: track.duration_ms,
      }));
    } catch (error) {
      throw new Error(`Recommendations failed: ${error.message}`);
    }
  }

  // Create a playlist on Spotify
  async createPlaylist(userId, name, description = "", isPublic = true) {
    try {
      const data = await this.spotifyApi.createPlaylist(userId, {
        name,
        description,
        public: isPublic,
      });
      return {
        id: data.body.id,
        name: data.body.name,
        description: data.body.description,
        externalUrl: data.body.external_urls.spotify,
        tracks: data.body.tracks,
      };
    } catch (error) {
      throw new Error(`Playlist creation failed: ${error.message}`);
    }
  }

  // Add tracks to a playlist
  async addTracksToPlaylist(playlistId, trackUris) {
    try {
      // Spotify API allows max 100 tracks per request
      const chunks = [];
      for (let i = 0; i < trackUris.length; i += 100) {
        chunks.push(trackUris.slice(i, i + 100));
      }

      const results = [];
      for (const chunk of chunks) {
        const data = await this.spotifyApi.addTracksToPlaylist(playlistId, chunk);
        results.push(data.body);
      }

      return results;
    } catch (error) {
      throw new Error(`Add tracks failed: ${error.message}`);
    }
  }

  // Get user's Spotify profile
  async getUserProfile() {
    try {
      const data = await this.spotifyApi.getMe();
      return {
        id: data.body.id,
        displayName: data.body.display_name,
        email: data.body.email,
        followers: data.body.followers?.total,
        images: data.body.images,
      };
    } catch (error) {
      throw new Error(`Get user profile failed: ${error.message}`);
    }
  }
}

export default new SpotifyService();

