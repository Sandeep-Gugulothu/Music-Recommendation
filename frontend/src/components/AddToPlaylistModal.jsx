import React, { useState, useEffect } from 'react';
import { X, Plus, ListMusic, Check, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AddToPlaylistModal = ({ track, isOpen, onClose }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState(new Set());
  const [newTitle, setNewTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadPlaylists();
    }
  }, [isOpen, isAuthenticated]);

  const loadPlaylists = async () => {
    setIsLoading(true);
    try {
      const data = await api.getPlaylists();
      setPlaylists(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !track) return null;

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="glass-panel rounded-3xl p-6 max-w-sm w-full text-center border border-white/10">
          <ListMusic className="w-12 h-12 text-spotify-green mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Sign in Required</h3>
          <p className="text-xs text-slate-400 mb-4">
            You need to be logged in to create and save tracks to custom playlists.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-xl glass-card text-xs font-semibold text-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                openAuthModal('login');
              }}
              className="flex-1 py-2 rounded-xl bg-spotify-green text-black text-xs font-bold"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToPlaylist = async (playlistId) => {
    setAddingId(playlistId);
    try {
      await api.addTrackToPlaylist(playlistId, track);
      setAddedIds((prev) => new Set(prev).add(playlistId));
    } catch (e) {
      console.error(e);
    } finally {
      setAddingId(null);
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    try {
      const newPl = await api.createPlaylist(newTitle.trim(), 'Custom Playlist', '', [track.track_uri]);
      setPlaylists((prev) => [newPl, ...prev]);
      setAddedIds((prev) => new Set(prev).add(newPl.id));
      setNewTitle('');
      setShowCreateForm(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md glass-panel rounded-3xl p-6 shadow-2xl border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <img
            src={track.album_image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
            alt={track.track_name}
            className="w-12 h-12 rounded-xl object-cover border border-white/10"
          />
          <div className="min-w-0">
            <p className="text-xs text-slate-400">Add track to playlist:</p>
            <h4 className="text-sm font-bold text-white truncate">{track.track_name}</h4>
            <p className="text-xs text-slate-300 truncate">{track.artist_name}</p>
          </div>
        </div>

        <div className="mb-4">
          {showCreateForm ? (
            <form onSubmit={handleCreateAndAdd} className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Playlist name..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl glass-input text-xs text-white placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={isCreating || !newTitle.trim()}
                className="px-3 py-2 rounded-xl bg-spotify-green text-black font-bold text-xs flex items-center gap-1 shrink-0"
              >
                {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-2 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-spotify-green/50 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4 text-spotify-green" />
              Create New Playlist
            </button>
          )}
        </div>

        {/* Playlists list */}
        <div className="max-h-60 overflow-y-auto divide-y divide-white/5 pr-1">
          {isLoading ? (
            <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-spotify-green" />
              Loading your playlists...
            </div>
          ) : playlists.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No playlists found. Create your first playlist above!
            </div>
          ) : (
            playlists.map((pl) => {
              const isAdded = addedIds.has(pl.id);
              const isAddingThis = addingId === pl.id;

              return (
                <div
                  key={pl.id}
                  className="py-2.5 flex items-center justify-between gap-3 hover:bg-white/5 rounded-xl px-2 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-dark-600 flex items-center justify-center text-slate-300 shrink-0">
                      <ListMusic className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">{pl.title}</p>
                      <p className="text-[10px] text-slate-400">{pl.tracks?.length || 0} songs</p>
                    </div>
                  </div>

                  <button
                    disabled={isAdded || isAddingThis}
                    onClick={() => handleAddToPlaylist(pl.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                      isAdded
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/10 hover:bg-spotify-green hover:text-black text-slate-200'
                    }`}
                  >
                    {isAddingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added
                      </>
                    ) : (
                      'Add'
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToPlaylistModal;
