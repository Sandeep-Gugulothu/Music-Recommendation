import React from 'react';
import { Heart, Play, Sparkles, Trash2, ExternalLink } from 'lucide-react';
import { useLikes } from '../context/LikeContext';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';

const LikedSongsPage = ({ onSelectSeed, setActiveTab }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { likedTracks, toggleLike, isLoading } = useLikes();
  const { playTrack } = usePlayer();

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl">
        <Heart className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-white mb-2">Your Liked Songs</h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Sign in to save tracks to your library and power your personalized AI recommendations.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-8 py-3 rounded-2xl bg-spotify-green hover:bg-spotify-hover text-black font-bold text-sm shadow-xl shadow-spotify-green/30 hover:scale-105 transition-all"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-28">
      {/* Header Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-white/10 shadow-xl overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-pink-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-pink-500/20 shrink-0">
            <Heart className="w-10 h-10 fill-white" />
          </div>
          <div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 uppercase tracking-wider">
              Collection
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              Liked Songs
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {likedTracks.length} saved songs shaping your AI taste profile
            </p>
          </div>
        </div>

        {likedTracks.length > 0 && (
          <button
            onClick={() => setActiveTab('foryou')}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-purple-500/20 hover:scale-105 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Generate Taste Centroid Mix
          </button>
        )}
      </div>

      {/* Liked Tracks Table */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10">
        {isLoading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Loading liked songs...
          </div>
        ) : likedTracks.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            You haven't liked any songs yet. Click the heart icon on any song to add it!
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {likedTracks.map((track, idx) => {
              const spotifyId = track.track_uri?.split(':').pop();
              return (
                <div
                  key={track.id || track.track_uri}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-white/5 rounded-2xl px-3 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-slate-500 w-5 text-center">
                      {idx + 1}
                    </span>
                    <img
                      src={track.album_image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                      alt={track.track_name}
                      className="w-11 h-11 rounded-xl object-cover border border-white/10 shadow shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                        {track.track_name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {track.artist_name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {track.preview_url && (
                      <button
                        onClick={() => playTrack(track)}
                        className="p-2 rounded-full glass-card hover:bg-spotify-green hover:text-black text-slate-200 transition-colors"
                        title="Play Preview"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>
                    )}
                    <button
                      onClick={() => onSelectSeed(track)}
                      className="px-3 py-1.5 rounded-xl glass-card text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-white/10 transition-colors hidden sm:inline-block"
                    >
                      Tune
                    </button>
                    <a
                      href={`https://open.spotify.com/track/${spotifyId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-spotify-green transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => toggleLike(track)}
                      className="p-2 text-pink-500 hover:text-red-400 transition-colors"
                      title="Remove from Liked"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedSongsPage;
