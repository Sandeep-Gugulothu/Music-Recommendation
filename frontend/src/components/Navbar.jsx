import React, { useState, useEffect, useRef } from 'react';
import { Search, Music2, Sliders, Sparkles, ListMusic, Heart, User, LogOut, Disc3, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Navbar = ({ activeTab, setActiveTab, onSelectTrack }) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const searchTimeout = useRef(null);

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      searchTimeout.current = setTimeout(async () => {
        try {
          const results = await api.searchTracks(searchQuery, 8);
          setSuggestions(results);
          setDropdownOpen(true);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      }, 250);
    } else {
      setSuggestions([]);
      setDropdownOpen(false);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchQuery]);

  // Click outside listener for search dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = (track) => {
    setDropdownOpen(false);
    setSearchQuery('');
    if (onSelectTrack) {
      onSelectTrack(track);
    }
  };

  const navItems = [
    { id: 'explore', label: 'Explore', icon: Music2 },
    { id: 'recommend', label: 'Tune Engine', icon: Disc3 },
    { id: 'vibe', label: 'Vibe Lab', icon: Sliders },
    { id: 'foryou', label: 'For You', icon: Sparkles },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'liked', label: 'Liked', icon: Heart },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('explore')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-spotify-green to-emerald-400 flex items-center justify-center shadow-lg shadow-spotify-green/20 group-hover:scale-105 transition-transform">
            <Music2 className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <span className="text-base sm:text-lg font-extrabold tracking-tight text-white">
              Music <span className="text-spotify-green">Recommendation</span>
            </span>
          </div>
        </div>

        {/* Global Search Bar with Autocomplete */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search 10,000+ tracks, artists, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => suggestions.length > 0 && setDropdownOpen(true)}
              className="w-full pl-10 pr-10 py-2 rounded-xl text-xs sm:text-sm glass-input text-slate-100 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {dropdownOpen && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 left-0 w-full glass-panel rounded-2xl shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto border border-white/10 divide-y divide-white/5">
              {suggestions.map((track) => (
                <div
                  key={track.track_uri}
                  onClick={() => handleSelectSuggestion(track)}
                  className="p-2.5 flex items-center gap-3 hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <img
                    src={track.album_image_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100'}
                    alt={track.track_name}
                    className="w-10 h-10 rounded-lg object-cover shadow border border-white/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-100 truncate">
                      {track.track_name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {track.artist_name}
                    </p>
                  </div>
                  {track.genres && track.genres[0] && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-dark-600 text-slate-300 shrink-0">
                      {track.genres[0]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-spotify-green text-black font-semibold shadow-lg shadow-spotify-green/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* User Auth controls */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl glass-card hover:bg-white/10 transition-colors"
              >
                <img
                  src={user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                  alt={user.email}
                  className="w-6 h-6 rounded-full bg-dark-600 border border-white/10"
                />
                <span className="text-xs font-medium text-slate-200 hidden sm:inline truncate max-w-[100px]">
                  {user.username || user.email.split('@')[0]}
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 glass-panel rounded-2xl shadow-xl py-2 z-50 border border-white/10">
                  <div className="px-4 py-2 border-b border-white/10 text-xs">
                    <p className="font-semibold text-slate-100 truncate">{user.full_name || user.username}</p>
                    <p className="text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('foryou');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-white/10 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-spotify-green" />
                    My Taste Profile
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 transition-all"
              >
                Login
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-black hover:bg-slate-200 transition-all shadow-md"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
