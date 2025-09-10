import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { PlayerProvider } from './context/PlayerContext';
import { LikeProvider } from './context/LikeContext';

import Navbar from './components/Navbar';
import AudioPlayer from './components/AudioPlayer';
import AuthModal from './components/AuthModal';
import AddToPlaylistModal from './components/AddToPlaylistModal';

import ExplorePage from './pages/ExplorePage';
import RecommendationPage from './pages/RecommendationPage';
import VibeLabPage from './pages/VibeLabPage';
import ForYouPage from './pages/ForYouPage';
import PlaylistsPage from './pages/PlaylistsPage';
import LikedSongsPage from './pages/LikedSongsPage';

function AppContent() {
  const [activeTab, setActiveTab] = useState('explore');
  const [seedTrack, setSeedTrack] = useState(null);
  const [playlistModalTrack, setPlaylistModalTrack] = useState(null);

  const handleSelectSeed = (track) => {
    if (track) {
      setSeedTrack(track);
      setActiveTab('recommend');
    } else {
      setActiveTab('vibe');
    }
  };

  const handleAddToPlaylist = (track) => {
    setPlaylistModalTrack(track);
  };

  return (
    <div className="min-h-screen flex flex-col bg-dark-900 text-slate-100">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectTrack={handleSelectSeed}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {activeTab === 'explore' && (
          <ExplorePage
            onSelectSeed={handleSelectSeed}
            onAddToPlaylist={handleAddToPlaylist}
          />
        )}
        {activeTab === 'recommend' && (
          <RecommendationPage
            seedTrack={seedTrack}
            onSelectSeed={handleSelectSeed}
            onAddToPlaylist={handleAddToPlaylist}
          />
        )}
        {activeTab === 'vibe' && (
          <VibeLabPage
            onSelectSeed={handleSelectSeed}
            onAddToPlaylist={handleAddToPlaylist}
          />
        )}
        {activeTab === 'foryou' && (
          <ForYouPage
            onSelectSeed={handleSelectSeed}
            onAddToPlaylist={handleAddToPlaylist}
          />
        )}
        {activeTab === 'playlists' && (
          <PlaylistsPage
            onSelectSeed={handleSelectSeed}
            onAddToPlaylist={handleAddToPlaylist}
          />
        )}
        {activeTab === 'liked' && (
          <LikedSongsPage
            onSelectSeed={handleSelectSeed}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Global Persistent Audio Player */}
      <AudioPlayer />

      {/* Auth Modal */}
      <AuthModal />

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        track={playlistModalTrack}
        isOpen={!!playlistModalTrack}
        onClose={() => setPlaylistModalTrack(null)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <LikeProvider>
          <AppContent />
        </LikeProvider>
      </PlayerProvider>
    </AuthProvider>
  );
}

export default App;
