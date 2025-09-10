import React, { useState, useEffect } from 'react';
import { Sliders, Sparkles, Flame, Coffee, Headphones, Sun, Moon, RefreshCw, Disc } from 'lucide-react';
import { api } from '../services/api';
import TrackCard from '../components/TrackCard';

const VibeLabPage = ({ onSelectSeed, onAddToPlaylist }) => {
  const [danceability, setDanceability] = useState(0.7);
  const [energy, setEnergy] = useState(0.75);
  const [valence, setValence] = useState(0.6);
  const [acousticness, setAcousticness] = useState(0.15);
  const [tempo, setTempo] = useState(125);
  const [popularityMin, setPopularityMin] = useState(0);
  const [genreFilter, setGenreFilter] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const presets = [
    {
      id: 'party',
      name: '🔥 Party Anthem',
      desc: 'High energy, maximum danceability',
      icon: Flame,
      params: { danceability: 0.9, energy: 0.88, valence: 0.8, acousticness: 0.05, tempo: 128 },
    },
    {
      id: 'chill',
      name: '☕ Acoustic Chill',
      desc: 'Organic, mellow, relaxing vibe',
      icon: Coffee,
      params: { danceability: 0.4, energy: 0.25, valence: 0.45, acousticness: 0.85, tempo: 92 },
    },
    {
      id: 'focus',
      name: '🎧 Deep Focus',
      desc: 'Consistent groove and electronic rhythm',
      icon: Headphones,
      params: { danceability: 0.65, energy: 0.6, valence: 0.4, acousticness: 0.1, tempo: 120 },
    },
    {
      id: 'sunshine',
      name: '☀️ Sunshine Mood',
      desc: 'Euphoric valence, upbeat, uplifting',
      icon: Sun,
      params: { danceability: 0.75, energy: 0.82, valence: 0.9, acousticness: 0.2, tempo: 118 },
    },
    {
      id: 'night',
      name: '🌙 Late Night Melancholy',
      desc: 'Moody, reflective, atmospheric',
      icon: Moon,
      params: { danceability: 0.45, energy: 0.35, valence: 0.18, acousticness: 0.65, tempo: 85 },
    },
  ];

  const applyPreset = (preset) => {
    setDanceability(preset.params.danceability);
    setEnergy(preset.params.energy);
    setValence(preset.params.valence);
    setAcousticness(preset.params.acousticness);
    setTempo(preset.params.tempo);
  };

  const handleTune = async () => {
    setIsLoading(true);
    try {
      const data = await api.getVibeRecommendations({
        danceability: parseFloat(danceability),
        energy: parseFloat(energy),
        valence: parseFloat(valence),
        acousticness: parseFloat(acousticness),
        tempo: parseFloat(tempo),
        popularity_min: parseInt(popularityMin),
        genre_filter: genreFilter.trim() || null,
        top_n: 18,
      });
      setRecommendations(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleTune();
  }, []);

  return (
    <div className="space-y-8 pb-28">
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 mb-1 uppercase tracking-wider">
          <Sliders className="w-4 h-4" /> Parametric Audio Engine
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Interactive Vibe & Mood Lab
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Adjust acoustic coordinates in high-dimensional vector space to find songs matching your exact custom vibe.
        </p>
      </div>

      {/* Preset Buttons */}
      <div>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Quick Vibe Presets
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {presets.map((p) => {
            return (
              <button
                key={p.id}
                onClick={() => {
                  applyPreset(p);
                  setTimeout(handleTune, 50);
                }}
                className="glass-card rounded-2xl p-3.5 text-left hover:border-cyan-500/40 transition-all group"
              >
                <p className="text-xs font-bold text-white group-hover:text-cyan-300">
                  {p.name}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                  {p.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Sliders Console */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Energy */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Energy (Intensity)</span>
              <span className="text-cyan-400 font-mono">{Math.round(energy * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={energy}
              onChange={(e) => setEnergy(parseFloat(e.target.value))}
              className="w-full cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Mellow / Ambient</span>
              <span>High Octane</span>
            </div>
          </div>

          {/* Danceability */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Danceability (Rhythm)</span>
              <span className="text-spotify-green font-mono">{Math.round(danceability * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={danceability}
              onChange={(e) => setDanceability(parseFloat(e.target.value))}
              className="w-full cursor-pointer accent-spotify-green"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Subtle Groove</span>
              <span>Dancefloor Banger</span>
            </div>
          </div>

          {/* Valence */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Valence (Mood / Happiness)</span>
              <span className="text-amber-400 font-mono">{Math.round(valence * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={valence}
              onChange={(e) => setValence(parseFloat(e.target.value))}
              className="w-full cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Melancholic / Dark</span>
              <span>Euphoric / Cheerful</span>
            </div>
          </div>

          {/* Acousticness */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Acousticness</span>
              <span className="text-purple-400 font-mono">{Math.round(acousticness * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={acousticness}
              onChange={(e) => setAcousticness(parseFloat(e.target.value))}
              className="w-full cursor-pointer accent-purple-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Synthesized / Electronic</span>
              <span>Unplugged / Acoustic</span>
            </div>
          </div>

          {/* Tempo */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Tempo (BPM)</span>
              <span className="text-pink-400 font-mono">{Math.round(tempo)} BPM</span>
            </div>
            <input
              type="range"
              min="60"
              max="190"
              step="1"
              value={tempo}
              onChange={(e) => setTempo(parseFloat(e.target.value))}
              className="w-full cursor-pointer accent-pink-400"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>60 Slow</span>
              <span>190 Fast Pace</span>
            </div>
          </div>

          {/* Popularity & Genre Filter */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Min Popularity</span>
              <span className="text-slate-200 font-mono">{popularityMin}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={popularityMin}
              onChange={(e) => setPopularityMin(parseInt(e.target.value))}
              className="w-full cursor-pointer accent-slate-300"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Underground / Rare</span>
              <span>Mainstream Hits</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Optional genre filter (e.g. rock, indie, pop)..."
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
            />
          </div>

          <button
            onClick={handleTune}
            disabled={isLoading}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-spotify-green to-cyan-400 hover:from-spotify-hover hover:to-cyan-300 text-black font-extrabold text-sm shadow-xl shadow-cyan-500/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Tune & Search Vibe
          </button>
        </div>
      </div>

      {/* Vibe Results */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            Vibe Matches ({recommendations.length})
          </h2>
          <p className="text-xs text-slate-400">
            Acoustic vector proximity sorted by cosine similarity
          </p>
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

export default VibeLabPage;
