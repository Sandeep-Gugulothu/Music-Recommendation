import React, { useState, useEffect } from 'react';
import { Disc, Sparkles, Cpu, Layers, Music, Sliders, ExternalLink, RefreshCw, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import TrackCard from '../components/TrackCard';
import AudioRadarChart from '../components/AudioRadarChart';
import { usePlayer } from '../context/PlayerContext';

const RecommendationPage = ({ seedTrack, onSelectSeed, onAddToPlaylist }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [activeAlgorithm, setActiveAlgorithm] = useState('hybrid');
  const [topN, setTopN] = useState(12);
  const [selectedCompareTrack, setSelectedCompareTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { playTrack } = usePlayer();

  const algorithms = [
    { id: 'hybrid', label: 'Hybrid AI', desc: 'Audio DNA (65%) + Genre/Artist NLP (35%)', icon: Sparkles },
    { id: 'audio_dna', label: 'Audio DNA Space', desc: '9-dimensional acoustic vector cosine', icon: Cpu },
    { id: 'cluster_cosine', label: 'Cluster Cosine', desc: 'Intra-cluster fast matching', icon: Layers },
    { id: 'artist_genre', label: 'Artist & Genre', desc: 'Semantic genre/artist match', icon: Music },
  ];

  useEffect(() => {
    if (seedTrack) {
      fetchRecommendations();
    }
  }, [seedTrack, activeAlgorithm, topN]);

  const fetchRecommendations = async () => {
    if (!seedTrack) return;
    setIsLoading(true);
    setError(null);
    try {
      const identifier = seedTrack.spotify_id || seedTrack.track_uri || seedTrack.track_name;
      const data = await api.getTrackRecommendations(identifier, topN, activeAlgorithm);
      setRecommendations(data.recommendations || []);
      if (data.recommendations && data.recommendations.length > 0) {
        setSelectedCompareTrack(data.recommendations[0]);
      } else {
        setSelectedCompareTrack(null);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!seedTrack) {
    return (
      <div className="text-center py-20 glass-panel rounded-3xl p-8 border border-white/10 max-w-xl mx-auto my-12">
        <Disc className="w-16 h-16 text-spotify-green mx-auto mb-4 animate-spin-slow" />
        <h3 className="text-2xl font-bold text-white mb-2">No Seed Track Selected</h3>
        <p className="text-sm text-slate-400 mb-6">
          Search for a song or choose any track from the Explore page to launch the Recommendation Engine.
        </p>
      </div>
    );
  }

  const spotifyId = seedTrack.spotify_id || seedTrack.track_uri?.split(':').pop();

  return (
    <div className="space-y-8 pb-28">
      {/* Top Header & Algorithm Selector */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-spotify-green mb-1 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" /> Recommendation Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Tuned to "{seedTrack.track_name}"
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing acoustic resonances, tempo harmony, and genre semantic topology
          </p>
        </div>

        {/* Algorithm Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-dark-800/80 p-1.5 rounded-2xl border border-white/10">
          {algorithms.map((algo) => {
            const Icon = algo.icon;
            const isActive = activeAlgorithm === algo.id;
            return (
              <button
                key={algo.id}
                onClick={() => setActiveAlgorithm(algo.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-spotify-green text-black shadow-lg shadow-spotify-green/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
                title={algo.desc}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{algo.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Seed Song + Audio DNA Radar Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Seed Song Card */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-spotify-green/10 blur-3xl pointer-events-none" />

          <div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-spotify-green text-black uppercase tracking-wider mb-4 inline-block">
              Active Seed Track
            </span>

            <div className="flex items-center gap-5 mt-2">
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <div className="absolute w-28 h-28 rounded-full vinyl-disc animate-spin-slow -right-2 top-0" />
                <img
                  src={seedTrack.album_image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200'}
                  alt={seedTrack.track_name}
                  className="w-24 h-24 rounded-2xl object-cover z-10 border border-white/10 shadow-lg"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-white truncate" title={seedTrack.track_name}>
                  {seedTrack.track_name}
                </h3>
                <p className="text-sm font-medium text-slate-300 truncate mt-0.5">
                  {seedTrack.artist_name}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {seedTrack.album_name} ({seedTrack.release_year})
                </p>

                <div className="flex flex-wrap gap-1 mt-2">
                  {seedTrack.genres?.slice(0, 3).map((g, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-dark-600 text-slate-300">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Audio Features Snapshot */}
          <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-white/10 text-center">
            <div className="glass-card rounded-xl p-2">
              <p className="text-[10px] text-slate-400">Tempo</p>
              <p className="text-xs font-bold text-spotify-green font-mono">
                {Math.round(seedTrack.audio_features?.tempo || 120)} BPM
              </p>
            </div>
            <div className="glass-card rounded-xl p-2">
              <p className="text-[10px] text-slate-400">Energy</p>
              <p className="text-xs font-bold text-cyan-400 font-mono">
                {Math.round((seedTrack.audio_features?.energy || 0) * 100)}%
              </p>
            </div>
            <div className="glass-card rounded-xl p-2">
              <p className="text-[10px] text-slate-400">Danceability</p>
              <p className="text-xs font-bold text-purple-400 font-mono">
                {Math.round((seedTrack.audio_features?.danceability || 0) * 100)}%
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            {seedTrack.preview_url && (
              <button
                onClick={() => playTrack(seedTrack)}
                className="flex-1 py-2 rounded-xl bg-spotify-green text-black font-bold text-xs hover:bg-spotify-hover transition-colors flex items-center justify-center gap-1.5"
              >
                Play Preview
              </button>
            )}
            <a
              href={`https://open.spotify.com/track/${spotifyId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl glass-card hover:bg-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Spotify
            </a>
          </div>
        </div>

        {/* Audio DNA Radar Visualizer */}
        <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Audio DNA Visualizer
              </h3>
              <p className="text-[11px] text-slate-400">
                Direct acoustic radar comparison between Seed Song and Recommended Track
              </p>
            </div>

            {selectedCompareTrack && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Comparing: {selectedCompareTrack.track_name.substring(0, 16)}...
              </span>
            )}
          </div>

          <AudioRadarChart seedTrack={seedTrack} compareTrack={selectedCompareTrack} />
        </div>
      </div>

      {/* Recommendations Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-spotify-green" />
              Generated Recommendations ({recommendations.length})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hover over or click any track to inspect its Audio DNA overlay in the radar above
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value))}
              className="px-3 py-1.5 rounded-xl glass-input text-xs text-slate-200"
            >
              <option value="6">6 Tracks</option>
              <option value="12">12 Tracks</option>
              <option value="18">18 Tracks</option>
              <option value="24">24 Tracks</option>
            </select>

            <button
              onClick={fetchRecommendations}
              className="p-2 rounded-xl glass-card text-slate-400 hover:text-white"
              title="Refresh recommendations"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 mb-6">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: topN }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 h-64 animate-pulse bg-dark-700/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendations.map((track) => (
              <div
                key={track.track_uri}
                onMouseEnter={() => setSelectedCompareTrack(track)}
              >
                <TrackCard
                  track={track}
                  isSelected={selectedCompareTrack?.track_uri === track.track_uri}
                  onSelectSeed={onSelectSeed}
                  onAddToPlaylist={onAddToPlaylist}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationPage;
