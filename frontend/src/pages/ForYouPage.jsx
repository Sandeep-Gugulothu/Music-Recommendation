import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, RefreshCw, Disc3, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import TrackCard from '../components/TrackCard';
import AudioRadarChart from '../components/AudioRadarChart';

const ForYouPage = ({ onSelectSeed, onAddToPlaylist }) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [tasteData, setTasteData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTasteProfile = async () => {
    setIsLoading(true);
    try {
      const data = await api.getForYouRecommendations(18);
      setRecommendations(data.recommendations || []);
      setTasteData(data.user_taste_profile || null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasteProfile();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl">
        <Sparkles className="w-16 h-16 text-spotify-green mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-white mb-2">Personalized "For You" Feed</h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Sign in and like your favorite tracks to generate personalized recommendations based on your listening history.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-8 py-3 rounded-2xl bg-spotify-green hover:bg-spotify-hover text-black font-bold text-sm shadow-xl shadow-spotify-green/30 hover:scale-105 transition-all"
        >
          Sign In to Unlock Taste Profile
        </button>
      </div>
    );
  }

  const syntheticSeedForRadar = tasteData
    ? {
        track_name: `${user.username || 'Your'}'s Taste Centroid`,
        audio_dna: tasteData.audio_dna,
      }
    : null;

  return (
    <div className="space-y-8 pb-28">
      {/* Header */}
      <div className="border-b border-white/10 pb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-spotify-green mb-1 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Personalized AI Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Made For You, {user.full_name || user.username || 'Explorer'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centroid algorithm matching your listening taste profile across 10,000+ songs
          </p>
        </div>

        <button
          onClick={loadTasteProfile}
          className="p-2.5 rounded-xl glass-card text-slate-300 hover:text-white"
          title="Refresh taste feed"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* User Taste Radar Profile */}
      {tasteData && tasteData.audio_dna && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-wider mb-4 inline-block">
                Acoustic Profile Analysis
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Your Sound Persona
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Calculated from your {tasteData.total_liked_tracks} liked songs.
              </p>

              {tasteData.top_genres && tasteData.top_genres.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Top Genre Affinities
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {tasteData.top_genres.map((g, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-xl bg-dark-600 border border-white/5 text-slate-200"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 text-xs text-slate-400">
              💡 Like more songs across different genres to evolve and sharpen your taste centroid in real time.
            </div>
          </div>

          <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Your Sonic DNA Radar Centroid
            </h3>
            <AudioRadarChart seedTrack={syntheticSeedForRadar} />
          </div>
        </div>
      )}

      {/* Recommendations Feed */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Disc3 className="w-5 h-5 text-spotify-green" />
            Recommended Gems For You ({recommendations.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 h-64 animate-pulse bg-dark-700/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendations.map((track) => (
              <TrackCard
                key={track.track_uri}
                track={track}
                onSelectSeed={onSelectSeed}
                onAddToPlaylist={onAddToPlaylist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForYouPage;
