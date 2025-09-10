import React, { useState, useEffect } from 'react';
import { ListMusic, Plus, Trash2, Download, Play, Disc, Sparkles, X, ChevronRight, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { usePlayer } from '../context/PlayerContext';
import TrackCard from '../components/TrackCard';

const PlaylistsPage = ({ onSelectSeed, onAddToPlaylist }) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { playTrack } = usePlayer();
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Generator states
  const [seedInput, setSeedInput] = useState('');
  const [seedUris, setSeedUris] = useState([]);
  const [generatorLength, setGeneratorLength] = useState(20);
  const [moodBoost, setMoodBoost] = useState('happy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTracks, setGeneratedTracks] = useState([]);

  const loadPlaylists = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const data = await api.getPlaylists();
      setPlaylists(data);
      if (data.length > 0 && !selectedPlaylist) {
        setSelectedPlaylist(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadPlaylists();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const newPl = await api.createPlaylist(title.trim(), description.trim());
      setPlaylists([newPl, ...playlists]);
      setSelectedPlaylist(newPl);
      setTitle('');
      setDescription('');
      setShowCreateModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await api.deletePlaylist(playlistId);
      const remaining = playlists.filter((p) => p.id !== playlistId);
      setPlaylists(remaining);
      setSelectedPlaylist(remaining[0] || null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveTrack = async (playlistId, trackUri) => {
    try {
      await api.removeTrackFromPlaylist(playlistId, trackUri);
      // Reload current playlist
      const updated = await api.getPlaylist(playlistId);
      setSelectedPlaylist(updated);
      setPlaylists(playlists.map((p) => (p.id === playlistId ? updated : p)));
    } catch (e) {
      console.error(e);
    }
  };

  // Generator logic
  const handleAddSeed = async () => {
    if (!seedInput.trim()) return;
    try {
      const results = await api.searchTracks(seedInput, 1);
      if (results.length > 0) {
        const found = results[0];
        if (!seedUris.some((s) => s.track_uri === found.track_uri)) {
          setSeedUris([...seedUris, found]);
        }
      }
      setSeedInput('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleGeneratePlaylist = async () => {
    if (seedUris.length === 0) return;
    setIsGenerating(true);
    try {
      const uris = seedUris.map((s) => s.track_uri);
      const tracks = await api.generatePlaylistFromSeeds(uris, generatorLength, moodBoost);
      setGeneratedTracks(tracks);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveGeneratedAsPlaylist = async () => {
    if (generatedTracks.length === 0) return;
    try {
      const newPl = await api.createPlaylist(
        `AI Mix: ${seedUris[0]?.track_name || 'Curated Flow'}`,
        `Generated with ${moodBoost} mood boost`,
        '',
        generatedTracks.map((t) => t.track_uri)
      );
      setPlaylists([newPl, ...playlists]);
      setSelectedPlaylist(newPl);
      setShowGeneratorModal(false);
      setGeneratedTracks([]);
      setSeedUris([]);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto my-16 text-center glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 shadow-2xl">
        <ListMusic className="w-16 h-16 text-spotify-green mx-auto mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-white mb-2">Custom Playlist Studio</h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">
          Create unlimited custom playlists, organize tracks from recommendations, export M3U files, and use our Multi-Seed AI Generator to create curated flows.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-8 py-3 rounded-2xl bg-spotify-green hover:bg-spotify-hover text-black font-bold text-sm shadow-xl shadow-spotify-green/30 hover:scale-105 transition-all"
        >
          Sign In to Open Playlists
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-28">
      {/* Top Header & Actions */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-spotify-green mb-1 uppercase tracking-wider">
            <ListMusic className="w-4 h-4" /> Playlist Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            My Playlists & AI Mixes
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGeneratorModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600/30 to-cyan-600/30 hover:from-purple-600/40 hover:to-cyan-600/40 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center gap-2 transition-all shadow"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI Playlist Generator
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-spotify-green hover:bg-spotify-hover text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-spotify-green/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Playlist
          </button>
        </div>
      </div>

      {/* Main Layout: Sidebar Playlists + Selected Playlist Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Playlists Sidebar */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-5 border border-white/10 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Your Playlists ({playlists.length})
          </h3>

          {playlists.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No playlists yet. Create one or generate an AI mix!
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
              {playlists.map((pl) => {
                const isSelected = selectedPlaylist?.id === pl.id;
                return (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlaylist(pl)}
                    className={`p-3 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-spotify-green/15 border border-spotify-green/30 text-white shadow'
                        : 'glass-card text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center text-spotify-green shrink-0">
                        <ListMusic className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold truncate">{pl.title}</h4>
                        <p className="text-[10px] text-slate-400">{pl.tracks?.length || 0} tracks</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-slate-500 ${isSelected ? 'text-spotify-green' : ''}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Playlist Content View */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10">
          {selectedPlaylist ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedPlaylist.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedPlaylist.description || 'Custom playlist'} • {selectedPlaylist.tracks?.length || 0} songs
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={api.getExportM3uUrl(selectedPlaylist.id)}
                    download
                    className="px-3.5 py-2 rounded-xl glass-card hover:bg-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
                    title="Export as standard M3U playlist file"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" /> Export M3U
                  </a>
                  <button
                    onClick={() => handleDeletePlaylist(selectedPlaylist.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tracks list */}
              {selectedPlaylist.tracks && selectedPlaylist.tracks.length > 0 ? (
                <div className="divide-y divide-white/5">
                  {selectedPlaylist.tracks.map((track, idx) => (
                    <div
                      key={track.id || idx}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-white/5 rounded-xl px-2.5 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-slate-500 w-5 text-center">
                          {idx + 1}
                        </span>
                        <img
                          src={track.album_image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                          alt={track.track_name}
                          className="w-10 h-10 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-100 truncate">{track.track_name}</h4>
                          <p className="text-[11px] text-slate-400 truncate">{track.artist_name}</p>
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
                          onClick={() => handleRemoveTrack(selectedPlaylist.id, track.track_uri)}
                          className="p-2 rounded-full text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                          title="Remove from playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400">
                  This playlist is empty. Browse Explore or Recommendations to add tracks!
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400">
              Select or create a playlist on the left to view tracks.
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel rounded-3xl p-6 max-w-md w-full border border-white/10 relative shadow-2xl">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Create New Playlist</h3>
            <form onSubmit={handleCreatePlaylist} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="My Cosmic Mix..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="A sonic journey through acoustic frequencies..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs text-white"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-spotify-green text-black font-bold text-xs"
              >
                Create Playlist
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Playlist Generator Modal */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-white/10 relative shadow-2xl my-8">
            <button
              onClick={() => setShowGeneratorModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Multi-Seed Engine
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Seed Playlist Generator</h3>
            <p className="text-xs text-slate-400 mb-6">
              Add 1–3 seed songs to anchor the vibe, select a mood booster, and the system will curate a seamless multi-track playlist progression.
            </p>

            {/* Seed Search & Add */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search song to add as seed (e.g. Coldplay, Drake)..."
                  value={seedInput}
                  onChange={(e) => setSeedInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSeed()}
                  className="flex-1 px-4 py-2.5 rounded-xl glass-input text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={handleAddSeed}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs shrink-0"
                >
                  Add Seed
                </button>
              </div>

              {/* Added Seeds */}
              <div className="flex flex-wrap gap-2">
                {seedUris.map((s) => (
                  <span
                    key={s.track_uri}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-500/40 text-xs font-medium"
                  >
                    {s.track_name} - {s.artist_name}
                    <button
                      onClick={() => setSeedUris(seedUris.filter((x) => x.track_uri !== s.track_uri))}
                      className="hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Mood Booster */}
              <div className="grid grid-cols-3 gap-3">
                {['happy', 'chill', 'party'].map((boost) => (
                  <button
                    key={boost}
                    type="button"
                    onClick={() => setMoodBoost(boost)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all ${
                      moodBoost === boost
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'glass-card text-slate-300 hover:text-white'
                    }`}
                  >
                    ✨ {boost} Boost
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={isGenerating || seedUris.length === 0}
                onClick={handleGeneratePlaylist}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-extrabold text-sm shadow-xl hover:scale-102 transition-all flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generating Flow...
                  </>
                ) : (
                  'Generate Curated Playlist'
                )}
              </button>

              {/* Generated Result Preview */}
              {generatedTracks.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">
                      Generated Flow ({generatedTracks.length} Songs)
                    </h4>
                    <button
                      type="button"
                      onClick={handleSaveGeneratedAsPlaylist}
                      className="px-4 py-1.5 rounded-xl bg-spotify-green text-black font-bold text-xs"
                    >
                      Save to My Playlists
                    </button>
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-white/5">
                    {generatedTracks.map((t, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between text-xs">
                        <div className="truncate">
                          <span className="font-semibold text-slate-200">{t.track_name}</span>
                          <span className="text-slate-400 ml-2">— {t.artist_name}</span>
                        </div>
                        <span className="text-[10px] text-spotify-green font-mono">
                          {t.match_score}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistsPage;
