import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

// ── CONFIG ──────────────────────────────────────────────────────
// Change this IP to your Mac Mini's local IP address
export const SERVER_URL = 'http://192.168.1.100:3000';

// ── API CLIENT ──────────────────────────────────────────────────
async function getToken() {
  return await AsyncStorage.getItem('token');
}

async function apiFetch(path, options = {}) {
  const token = await getToken();
  const url = `${SERVER_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login: (username, password) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  register: (username, password) =>
    apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) }),

  getSongs: () => apiFetch('/api/songs'),

  searchSongs: (q) => apiFetch(`/api/songs/search?q=${encodeURIComponent(q)}`),

  uploadSong: async (fileUri, metadata, onProgress) => {
    const token = await getToken();
    const formData = new FormData();
    const filename = fileUri.split('/').pop();
    const ext = filename.split('.').pop();
    formData.append('audio', { uri: fileUri, name: filename, type: `audio/${ext}` });
    formData.append('title', metadata.title || filename.replace(`.${ext}`, ''));
    formData.append('artist', metadata.artist || 'Unknown');
    formData.append('album', metadata.album || 'Unknown');

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total);
      };
      xhr.onload = () => {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch { reject(new Error('Upload failed')); }
      };
      xhr.onerror = () => reject(new Error('Network error'));
      xhr.open('POST', `${SERVER_URL}/api/songs/upload`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  },

  deleteSong: (id) => apiFetch(`/api/songs/${id}`, { method: 'DELETE' }),

  getStreamUrl: async (songId) => {
    const token = await getToken();
    return `${SERVER_URL}/api/stream/${songId}?token=${token}`;
  },

  getPlaylists: () => apiFetch('/api/playlists'),

  createPlaylist: (name, is_public = false) =>
    apiFetch('/api/playlists', { method: 'POST', body: JSON.stringify({ name, is_public }) }),

  getPlaylistSongs: (id) => apiFetch(`/api/playlists/${id}/songs`),

  addToPlaylist: (playlistId, songId) =>
    apiFetch(`/api/playlists/${playlistId}/songs`, { method: 'POST', body: JSON.stringify({ song_id: songId }) }),

  removeFromPlaylist: (playlistId, songId) =>
    apiFetch(`/api/playlists/${playlistId}/songs/${songId}`, { method: 'DELETE' }),

  deletePlaylist: (id) => apiFetch(`/api/playlists/${id}`, { method: 'DELETE' }),
};

// ── AUTH STORE ──────────────────────────────────────────────────
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,

  init: async () => {
    const token = await AsyncStorage.getItem('token');
    const userStr = await AsyncStorage.getItem('user');
    if (token && userStr) {
      set({ token, user: JSON.parse(userStr), isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  login: async (username, password) => {
    const data = await api.login(username, password);
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
  },

  register: async (username, password) => {
    const data = await api.register(username, password);
    await AsyncStorage.setItem('token', data.token);
    await AsyncStorage.setItem('user', JSON.stringify(data.user));
    set({ token: data.token, user: data.user });
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    set({ user: null, token: null });
  },
}));
