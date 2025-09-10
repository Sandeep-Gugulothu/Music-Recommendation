import React, { useState } from 'react';
import { Play, Pause, Heart, Plus, ExternalLink, Disc, Sparkles } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useLikes } from '../context/LikeContext';

const TrackCard = ({ track, onSelectSeed, onAddToPlaylist, isSeed = false, isSelected = false }) => {
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const { isLiked, toggleLike } = useLikes();
  const [showEmbed, setShowEmbed] = useState(false);

  if (!track) return null;

  const isCurrentPlaying = currentTrack?.track_uri === track.track_uri && isPlaying;
  const liked = isLiked(track.track_uri);
  const spotifyId = track.spotify_id || track.track_uri?.split(':').pop();

  const handlePlayToggle = (e) => {
    e.stopPropagation();
    playTrack(track);
  };

  const handleLikeToggle = (e) => {
    e.stopPropagation();
    toggleLike(track);
  };

  const handleAddToPlaylistClick = (e) => {
    e.stopPropagation();
    if (onAddToPlaylist) {
      onAddToPlaylist(track);
    }
  };

  const handleSeedClick = (e) => {
    e.stopPropagation();
    if (onSelectSeed) {
      onSelectSeed(track);
    }
  };

  return (
    <div
      onClick={() => onSelectSeed && !isSeed && onSelectSeed(track)}
      className={`glass-card rounded-2xl p-4 flex flex-col justify-between relative group cursor-pointer overflow-hidden transition-all duration-300 ${
        isSelected
          ? 'ring-2 ring-cyan-400 bg-dark-700/90 shadow-lg shadow-cyan-500/10'
          : isSeed
          ? 'ring-2 ring-spotify-green bg-dark-700/90 shadow-lg shadow-spotify-green/15'
          : ''
      }`}
    >
      {/* Top badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {track.match_score ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-3 h-3" />
            {track.match_score}% Match
          </span>
        ) : isSeed ? (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-spotify-green text-black uppercase tracking-wider">
            Seed Song
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-400">
            {track.release_year || ''}
          </span>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={handleLikeToggle}
            className={`p-1.5 rounded-full transition-colors ${
              liked
                ? 'text-pink-500 hover:text-pink-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title={liked ? 'Remove from Liked' : 'Save to Liked'}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-pink-500' : ''}`} />
          </button>
          {onAddToPlaylist && (
            <button
              onClick={handleAddToPlaylistClick}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 transition-colors"
              title="Add to Playlist"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Album Art / Vinyl Presentation */}
      <div className="relative mb-3 flex items-center justify-center">
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center">
          {/* Vinyl disc peeking out when playing or hovering */}
          <div
            className={`absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full vinyl-disc transition-transform duration-500 -right-2 top-1 ${
              isCurrentPlaying ? 'animate-spin-slow' : 'group-hover:translate-x-2'
            }`}
          />
          {/* Album Cover Thumbnail */}
          <img
            src={track.album_image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'}
            alt={track.track_name}
            className="w-32 h-32 sm:w-36 sm:h-36 rounded-xl object-cover z-10 shadow-md border border-white/10"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300';
            }}
          />

          {/* Quick Play Overlay Button */}
          {track.preview_url && (
            <button
              onClick={handlePlayToggle}
              className={`absolute z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 ${
                isCurrentPlaying
                  ? 'bg-spotify-green text-black scale-100 opacity-100'
                  : 'bg-black/75 hover:bg-spotify-green hover:text-black text-white scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100'
              }`}
              title={isCurrentPlaying ? 'Pause Preview' : 'Play 30s Preview'}
            >
              {isCurrentPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Track Info */}
      <div className="mb-3">
        <h4 className="font-semibold text-slate-100 text-sm truncate" title={track.track_name}>
          {track.track_name}
        </h4>
        <p className="text-xs text-slate-400 truncate mt-0.5" title={track.artist_name}>
          {track.artist_name}
        </p>
        {track.genres && track.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5 overflow-hidden max-h-5">
            {track.genres.slice(0, 2).map((genre, idx) => (
              <span
                key={idx}
                className="text-[10px] px-1.5 py-0.5 rounded bg-dark-600/80 text-slate-300 truncate max-w-[120px]"
              >
                {genre}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {onSelectSeed && !isSeed && (
            <button
              onClick={handleSeedClick}
              className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <Disc className="w-3.5 h-3.5" />
              Tune from this
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowEmbed(!showEmbed);
            }}
            className="text-[10px] text-slate-400 hover:text-slate-200"
            title="Toggle Spotify mini player"
          >
            {showEmbed ? 'Hide Embed' : 'Embed'}
          </button>
          <a
            href={`https://open.spotify.com/track/${spotifyId}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-slate-400 hover:text-spotify-green transition-colors"
            title="Open in Spotify"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Spotify Iframe Embed (Collapsible) */}
      {showEmbed && (
        <div className="mt-3 pt-2 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
          <iframe
            src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-lg shadow"
            title="Spotify Embed"
          />
        </div>
      )}
    </div>
  );
};

export default TrackCard;
