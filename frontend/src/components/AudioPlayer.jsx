import React from 'react';
import { Play, Pause, Volume2, VolumeX, Heart, ExternalLink, Music } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useLikes } from '../context/LikeContext';

const AudioPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
  } = usePlayer();

  const { isLiked, toggleLike } = useLikes();

  if (!currentTrack) return null;

  const liked = isLiked(currentTrack.track_uri);
  const spotifyId = currentTrack.spotify_id || currentTrack.track_uri?.split(':').pop();

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeekChange = (e) => {
    seek(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 glass-panel border-t border-white/10 px-4 sm:px-6 py-3 shadow-2xl backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
        {/* Track Metadata */}
        <div className="flex items-center gap-3 w-full sm:w-1/4 min-w-0">
          <div className="relative shrink-0">
            <img
              src={
                currentTrack.album_image_url ||
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'
              }
              alt={currentTrack.track_name}
              className={`w-12 h-12 rounded-xl object-cover border border-white/10 shadow-md ${
                isPlaying ? 'animate-pulse' : ''
              }`}
            />
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-spotify-green animate-ping" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xs sm:text-sm font-semibold text-slate-100 truncate" title={currentTrack.track_name}>
              {currentTrack.track_name}
            </h4>
            <p className="text-[11px] text-slate-400 truncate" title={currentTrack.artist_name}>
              {currentTrack.artist_name}
            </p>
          </div>

          <button
            onClick={() => toggleLike(currentTrack)}
            className={`p-1.5 rounded-full transition-colors shrink-0 ${
              liked ? 'text-pink-500 hover:text-pink-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-pink-500' : ''}`} />
          </button>
        </div>

        {/* Center: Playback Controls & Progress Scrubber */}
        <div className="flex flex-col items-center gap-1.5 w-full sm:w-2/4">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-spotify-green hover:bg-spotify-hover text-black flex items-center justify-center shadow-lg shadow-spotify-green/25 hover:scale-105 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          </div>

          <div className="w-full flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 30}
              step="0.1"
              value={currentTime}
              onChange={handleSeekChange}
              className="flex-1 cursor-pointer accent-spotify-green"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & External Links */}
        <div className="flex items-center justify-end gap-3 w-full sm:w-1/4">
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-slate-200"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 cursor-pointer"
            />
          </div>

          <a
            href={`https://open.spotify.com/track/${spotifyId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#1db954]/15 text-spotify-green border border-spotify-green/30 hover:bg-spotify-green hover:text-black transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Spotify</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
