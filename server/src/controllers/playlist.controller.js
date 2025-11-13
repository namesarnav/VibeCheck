import playlistService from "../services/playlist.service.js";

export const createPlaylist = async (req, res) => {
  try {
    const { title, description, tracks } = req.body;
    const userId = req.user.userId;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const playlist = await playlistService.createPlaylist({
      title,
      description,
      tracks: tracks || [],
      createdBy: userId,
    });

    res.status(201).json({ message: "Playlist created", playlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const playlist = await playlistService.getPlaylistById(playlistId);
    res.json({ playlist });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getUserPlaylists = async (req, res) => {
  try {
    const userId = req.user.userId;
    const playlists = await playlistService.getUserPlaylists(userId);
    res.json({ playlists });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const updateData = req.body;
    const userId = req.user.userId;

    // Don't allow changing createdBy
    delete updateData.createdBy;
    delete updateData.playlistID;

    const playlist = await playlistService.updatePlaylist(playlistId, updateData, userId);
    res.json({ message: "Playlist updated", playlist });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const userId = req.user.userId;

    await playlistService.deletePlaylist(playlistId, userId);
    res.json({ message: "Playlist deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const addTracks = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { trackIds } = req.body;
    const userId = req.user.userId;

    if (!trackIds || !Array.isArray(trackIds)) {
      return res.status(400).json({ error: "trackIds array is required" });
    }

    const playlist = await playlistService.addTracksToPlaylist(playlistId, trackIds, userId);
    res.json({ message: "Tracks added", playlist });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const removeTracks = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { trackIds } = req.body;
    const userId = req.user.userId;

    if (!trackIds || !Array.isArray(trackIds)) {
      return res.status(400).json({ error: "trackIds array is required" });
    }

    const playlist = await playlistService.removeTracksFromPlaylist(playlistId, trackIds, userId);
    res.json({ message: "Tracks removed", playlist });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const publishToSpotify = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { spotifyAccessToken } = req.body;
    const userId = req.user.userId;

    if (!spotifyAccessToken) {
      return res.status(400).json({ error: "Spotify access token is required" });
    }

    const result = await playlistService.publishToSpotify(playlistId, userId, spotifyAccessToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

