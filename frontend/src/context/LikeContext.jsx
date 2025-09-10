import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export const LikeContext = createContext();

export const LikeProvider = ({ children }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [likedUris, setLikedUris] = useState(new Set());
  const [likedTracks, setLikedTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLikes = async () => {
    if (!isAuthenticated) {
      setLikedUris(new Set());
      setLikedTracks([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await api.getLikedTracks();
      setLikedTracks(data);
      setLikedUris(new Set(data.map((t) => t.track_uri)));
    } catch (e) {
      console.error('Failed to fetch liked tracks:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLikes();
  }, [isAuthenticated]);

  const toggleLike = async (track) => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return false;
    }

    const isCurrentlyLiked = likedUris.has(track.track_uri);
    const newLikedUris = new Set(likedUris);

    // Optimistic UI update
    if (isCurrentlyLiked) {
      newLikedUris.delete(track.track_uri);
      setLikedTracks((prev) => prev.filter((t) => t.track_uri !== track.track_uri));
    } else {
      newLikedUris.add(track.track_uri);
      setLikedTracks((prev) => [track, ...prev]);
    }
    setLikedUris(newLikedUris);

    try {
      const res = await api.toggleLike(track);
      return res.is_liked;
    } catch (e) {
      console.error('Error toggling like:', e);
      // Revert on error
      fetchLikes();
      return isCurrentlyLiked;
    }
  };

  const isLiked = (trackUri) => likedUris.has(trackUri);

  return (
    <LikeContext.Provider
      value={{
        likedUris,
        likedTracks,
        isLoading,
        toggleLike,
        isLiked,
        refreshLikes: fetchLikes,
      }}
    >
      {children}
    </LikeContext.Provider>
  );
};

export const useLikes = () => useContext(LikeContext);
