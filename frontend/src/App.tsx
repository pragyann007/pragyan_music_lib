import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerProvider } from './store/PlayerContext';
import { useAudioAPI } from './hooks/useAudioAPI';
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import NowPlayingPanel from './components/NowPlayingPanel';
import Library from './components/Library';
import Home from './components/Home';
import UploadPanel from './components/UploadPanel';
import Playlists from './components/Playlists';
import { Track } from './types';

function AppInner() {
  const [view, setView] = useState('home');
  const [showNowPlaying, setShowNowPlaying] = useState(true);
  const { tracks, loading, uploading, fetchTracks, uploadTrack, setTracks } = useAudioAPI();

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const handleUploaded = (track: Track) => {
    setTracks(prev => {
      if (prev.find(t => t.id === track.id)) return prev;
      return [track, ...prev];
    });
  };

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #060612 0%, #0d0d1a 50%, #080614 100%)',
        color: 'white',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent 70%)', filter: 'blur(40px)' }}
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent 70%)', filter: 'blur(50px)' }}
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, 25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          className="absolute top-2/3 left-1/2 w-64 h-64 rounded-full opacity-6"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent 70%)', filter: 'blur(40px)' }}
        />
      </div>

      {/* Sidebar */}
      <Sidebar activeView={view} onViewChange={setView} />

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-24 px-8 py-8 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'home' && (
                <Home tracks={tracks} loading={loading} onNavigate={setView} />
              )}
              {view === 'library' && (
                <Library tracks={tracks} loading={loading} onRefresh={fetchTracks} />
              )}
              {view === 'playlists' && (
                <Playlists tracks={tracks} />
              )}
              {view === 'upload' && (
                <UploadPanel onUploaded={handleUploaded} uploading={uploading} uploadTrack={uploadTrack} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Now Playing Panel */}
        <AnimatePresence>
          {showNowPlaying && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="flex-shrink-0 overflow-hidden pb-24"
              style={{
                background: 'rgba(10,10,20,0.7)',
                backdropFilter: 'blur(24px)',
                borderLeft: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <NowPlayingPanel />
            </motion.aside>
          )}
        </AnimatePresence>
      </main>

      {/* Toggle now playing */}
      <motion.button
        onClick={() => setShowNowPlaying(!showNowPlaying)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed top-4 right-4 z-40 w-9 h-9 rounded-full flex items-center justify-center text-sm"
        style={{
          background: 'rgba(168,85,247,0.2)',
          border: '1px solid rgba(168,85,247,0.3)',
          color: '#a855f7',
        }}
        title={showNowPlaying ? 'Hide Now Playing' : 'Show Now Playing'}
      >
        {showNowPlaying ? '≫' : '♫'}
      </motion.button>

      {/* Player Bar */}
      <PlayerBar />
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <AppInner />
    </PlayerProvider>
  );
}