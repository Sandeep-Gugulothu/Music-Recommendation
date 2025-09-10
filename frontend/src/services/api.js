import { API_BASE_URL } from '../config';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('music_rec_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('music_rec_token', token);
    } else {
      localStorage.removeItem('music_rec_token');
    }
  }

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMsg = Array.isArray(errorData.detail)
            ? errorData.detail.map((e) => e.msg).join(', ')
            : errorData.detail;
        }
      } catch (e) {
        // use default error message
      }
      throw new Error(errorMsg);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  }

  // --- Auth ---
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async signup(email, password, username, fullName) {
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        username,
        full_name: fullName,
      }),
    });
    if (data.access_token) {
      this.setToken(data.access_token);
    }
    return data;
  }

  async getMe() {
    return await this.request('/auth/me');
  }

  async getTasteProfile() {
    return await this.request('/auth/taste-profile');
  }

  // --- Tracks ---
  async searchTracks(query, limit = 15) {
    if (!query || !query.trim()) return [];
    return await this.request(`/tracks/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async getTrackById(identifier) {
    return await this.request(`/tracks/${encodeURIComponent(identifier)}`);
  }

  async getAllGenres(limit = 40) {
    return await this.request(`/tracks/genres/all?limit=${limit}`);
  }

  async getTrendingTracks(genre = null, limit = 16) {
    const url = genre
      ? `/tracks/popular/trending?genre=${encodeURIComponent(genre)}&limit=${limit}`
      : `/tracks/popular/trending?limit=${limit}`;
    return await this.request(url);
  }

  // --- Recommendations ---
  async getTrackRecommendations(identifier, topN = 10, algorithm = 'hybrid') {
    return await this.request(
      `/recommendations/track/${encodeURIComponent(identifier)}?top_n=${topN}&algorithm=${algorithm}`
    );
  }

  async getVibeRecommendations(vibeParams) {
    return await this.request('/recommendations/vibe', {
      method: 'POST',
      body: JSON.stringify(vibeParams),
    });
  }

  async getForYouRecommendations(topN = 15) {
    return await this.request(`/recommendations/for-you?top_n=${topN}`);
  }

  async generatePlaylistFromSeeds(seedUris, targetLength = 20, moodBoost = null) {
    return await this.request('/recommendations/playlist-generator', {
      method: 'POST',
      body: JSON.stringify({
        seed_uris: seedUris,
        target_length: targetLength,
        mood_boost: moodBoost,
      }),
    });
  }

  // --- Likes ---
  async toggleLike(track) {
    return await this.request('/likes/toggle', {
      method: 'POST',
      body: JSON.stringify({
        track_uri: track.track_uri,
        track_name: track.track_name,
        artist_name: track.artist_name,
        album_image_url: track.album_image_url,
        preview_url: track.preview_url,
      }),
    });
  }

  async getLikedTracks() {
    return await this.request('/likes/');
  }

  async checkTrackLiked(trackUri) {
    return await this.request(`/likes/check/${encodeURIComponent(trackUri)}`);
  }

  // --- Playlists ---
  async getPlaylists() {
    return await this.request('/playlists/');
  }

  async createPlaylist(title, description = '', coverImageUrl = '', trackUris = []) {
    return await this.request('/playlists/', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        cover_image_url: coverImageUrl,
        track_uris: trackUris,
      }),
    });
  }

  async getPlaylist(playlistId) {
    return await this.request(`/playlists/${playlistId}`);
  }

  async deletePlaylist(playlistId) {
    return await this.request(`/playlists/${playlistId}`, {
      method: 'DELETE',
    });
  }

  async addTrackToPlaylist(playlistId, track) {
    return await this.request(`/playlists/${playlistId}/tracks`, {
      method: 'POST',
      body: JSON.stringify({
        track_uri: track.track_uri,
        track_name: track.track_name,
        artist_name: track.artist_name,
        album_image_url: track.album_image_url,
        preview_url: track.preview_url,
        duration_ms: track.duration_ms || 0,
      }),
    });
  }

  async removeTrackFromPlaylist(playlistId, trackUri) {
    return await this.request(`/playlists/${playlistId}/tracks/${encodeURIComponent(trackUri)}`, {
      method: 'DELETE',
    });
  }

  getExportM3uUrl(playlistId) {
    return `${API_BASE_URL}/playlists/${playlistId}/export`;
  }

  // --- Health ---
  async getHealth() {
    return await this.request('/health');
  }
}

export const api = new ApiService();
