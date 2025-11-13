import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
  getSpotifyAuthUrl: () => api.get('/auth/spotify/auth-url'),
};

// Chat API
export const chatAPI = {
  createChat: () => api.post('/chats'),
  getChats: () => api.get('/chats'),
  getChat: (chatId: string) => api.get(`/chats/${chatId}`),
  sendMessage: (chatId: string, message: string, spotifyAccessToken?: string) =>
    api.post(`/chats/${chatId}/messages`, { message, spotifyAccessToken }),
};

// Playlist API
export const playlistAPI = {
  createPlaylist: (data: { title: string; description?: string; tracks?: string[] }) =>
    api.post('/playlists', data),
  getPlaylists: () => api.get('/playlists'),
  getPlaylist: (playlistId: string) => api.get(`/playlists/${playlistId}`),
  updatePlaylist: (playlistId: string, data: any) =>
    api.put(`/playlists/${playlistId}`, data),
  deletePlaylist: (playlistId: string) => api.delete(`/playlists/${playlistId}`),
  addTracks: (playlistId: string, trackIds: string[]) =>
    api.post(`/playlists/${playlistId}/tracks`, { trackIds }),
  removeTracks: (playlistId: string, trackIds: string[]) =>
    api.delete(`/playlists/${playlistId}/tracks`, { data: { trackIds } }),
  publishToSpotify: (playlistId: string, spotifyAccessToken: string) =>
    api.post(`/playlists/${playlistId}/publish`, { spotifyAccessToken }),
};

export default api;

