import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Compass, Play, Disc3, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import TrackCard from '../components/TrackCard';

const ExplorePage = ({ onSelectSeed, onAddToPlaylist }) => {
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [tracksData, genresData] = await Promise.all([
        api.getTrendingTracks(null, 18),
        api.getAllGenres(24),
      ]);
      setTrendingTracks(tracksData);
      setGenres(genresData);
    } catch (e) {
      console.error('Failed to load explore data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenreClick = async (genre) => {
    const nextGenre = selectedGenre === genre ? null : genre;
    setSelectedGenre(nextGenre);
    setIsLoading(true);
    try {
      const tracksData = await api.getTrendingTracks(nextGenre, 18);
      setTrendingTracks(tracksData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-10 pb-28">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-6 sm:p-12 border border-white/10 shadow-2xl">
        {/* Neon Glow Blobs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-spotify-green/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-spotify-green/15 border border-spotify-green/30 text-spotify-green text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen Music Intelligence
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Discover Music Tuned to Your <span className="text-spotify-green">Taste</span>.
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Analyze acoustic features, rhythm, energy, and genres across 10,000+ songs to find recommendations tailored to you.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (trendingTracks.length > 0) {
                  onSelectSeed(trendingTracks[0]);
                }
              }}
              className="px-6 py-3 rounded-2xl bg-spotify-green hover:bg-spotify-hover text-black font-bold text-sm shadow-xl shadow-spotify-green/25 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Disc3 className="w-4 h-4 animate-spin-slow" />
              Tune from Top Track
            </button>
            <button
              onClick={() => onSelectSeed(null)}
              className="px-6 py-3 rounded-2xl glass-card hover:bg-white/10 text-white font-semibold text-sm transition-all border border-white/10 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              Explore All Vibe Tools
            </button>
          </div>
        </div>
      </div>

      {/* Genre Filter Pills Carousel */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-cyan-400" />
            Explore by Genre
          </h2>
          {selectedGenre && (
            <button
              onClick={() => handleGenreClick(selectedGenre)}
              className="text-xs text-spotify-green hover:underline flex items-center gap-1"
            >
              Clear Filter ({selectedGenre})
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {genres.map((g) => {
            const isSelected = selectedGenre === g.genre;
            return (
              <button
                key={g.genre}
                onClick={() => handleGenreClick(g.genre)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 scale-105'
                    : 'glass-card text-slate-300 hover:text-white hover:border-white/20'
                }`}
              >
                {g.genre} <span className="opacity-60 text-[10px]">({g.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trending Tracks Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-spotify-green" />
              {selectedGenre ? `Trending in ${selectedGenre}` : 'Trending Tracks & Classics'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any track to analyze its Audio DNA and generate personalized recommendations
            </p>
          </div>

          <button
            onClick={loadInitialData}
            className="p-2 rounded-xl glass-card text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Refresh tracks"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 h-64 animate-pulse bg-dark-700/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {trendingTracks.map((track) => (
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

export default ExplorePage;
