import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Track, Playlist } from '../types';
import { usePlayer } from '../store/PlayerContext';
import TrackCard from './TrackCard';

interface PlaylistsProps {
  tracks: Track[];
}

const PLAYLIST_GRADIENTS = [
  'from-purple-600 to-pink-500',
  'from-blue-600 to-cyan-400',
  'from-emerald-500 to-teal-400',
  'from-orange-500 to-red-500',
  'from-indigo-600 to-purple-400',
];

export default function Playlists({ tracks }: PlaylistsProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const { dispatch } = usePlayer();

  const createPlaylist = () => {
    if (!newName.trim()) return;
    const playlist: Playlist = {
      id: Date.now().toString(),
      name: newName.trim(),
      tracks: [],
      createdAt: new Date().toISOString(),
    };
    setPlaylists(prev => [playlist, ...prev]);
    setNewName('');
    setCreating(false);
    setSelectedPlaylist(playlist);
  };

  const addToPlaylist = (track: Track) => {
    if (!selectedPlaylist) return;
    setPlaylists(prev => prev.map(p =>
      p.id === selectedPlaylist.id && !p.tracks.find(t => t.id === track.id)
        ? { ...p, tracks: [...p.tracks, track] }
        : p
    ));
    setSelectedPlaylist(prev => prev ? { ...prev, tracks: prev.tracks.find(t => t.id === track.id) ? prev.tracks : [...prev.tracks, track] } : prev);
  };

  const removeFromPlaylist = (trackId: string) => {
    if (!selectedPlaylist) return;
    setPlaylists(prev => prev.map(p =>
      p.id === selectedPlaylist.id ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) } : p
    ));
    setSelectedPlaylist(prev => prev ? { ...prev, tracks: prev.tracks.filter(t => t.id !== trackId) } : prev);
  };

  const playPlaylist = (playlist: Playlist) => {
    if (playlist.tracks.length) dispatch({ type: 'SET_TRACK', track: playlist.tracks[0], queue: playlist.tracks });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold"
            style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(90deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Playlists
          </h1>
          <p className="text-gray-500 text-sm">{playlists.length} playlists created</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => setCreating(true)}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', boxShadow: '0 0 15px rgba(168,85,247,0.3)' }}
        >
          + New Playlist
        </motion.button>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setCreating(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              className="rounded-2xl p-6 w-80"
              style={{ background: 'rgba(20,20,35,0.95)', border: '1px solid rgba(168,85,247,0.3)', backdropFilter: 'blur(20px)' }}
            >
              <h3 className="text-white font-bold text-lg mb-4">New Playlist</h3>
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createPlaylist()}
                placeholder="Playlist name..."
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none mb-4"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
              />
              <div className="flex gap-3">
                <button onClick={() => setCreating(false)} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400"
                  style={{ background: 'rgba(255,255,255,0.06)' }}>Cancel</button>
                <button onClick={createPlaylist} className="flex-1 py-2.5 rounded-xl text-sm text-white font-semibold"
                  style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>Create</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Layout */}
      <div className="flex gap-6">
        {/* Playlist grid */}
        <div className="flex-1">
          {playlists.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 opacity-40">
              <div className="text-5xl mb-4">≡</div>
              <p className="text-gray-500">No playlists yet. Create one!</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {playlists.map((playlist, i) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => setSelectedPlaylist(playlist)}
                  className="rounded-2xl p-4 cursor-pointer"
                  style={{
                    background: selectedPlaylist?.id === playlist.id ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)',
                    border: selectedPlaylist?.id === playlist.id ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${PLAYLIST_GRADIENTS[i % PLAYLIST_GRADIENTS.length]} mb-3 flex items-center justify-center`}>
                    <span className="text-3xl opacity-60">≡</span>
                  </div>
                  <p className="text-sm font-semibold text-white truncate">{playlist.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{playlist.tracks.length} tracks</p>
                  {playlist.tracks.length > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={e => { e.stopPropagation(); playPlaylist(playlist); }}
                      className="mt-2 text-xs px-2 py-1 rounded-lg"
                      style={{ background: 'rgba(168,85,247,0.2)', color: '#a855f7' }}
                    >
                      ▶ Play
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Selected playlist detail */}
        <AnimatePresence>
          {selectedPlaylist && (
            <motion.div
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              className="w-80 flex-shrink-0 rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', maxHeight: '70vh', overflowY: 'auto' }}
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0"
                style={{ background: 'rgba(10,10,18,0.8)', backdropFilter: 'blur(10px)' }}>
                <div>
                  <p className="text-white font-semibold">{selectedPlaylist.name}</p>
                  <p className="text-xs text-gray-500">{selectedPlaylist.tracks.length} tracks</p>
                </div>
                <button onClick={() => setAdding(!adding)}
                  className="text-xs px-2 py-1 rounded-lg"
                  style={{ background: adding ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.08)', color: adding ? '#a855f7' : '#9ca3af' }}>
                  {adding ? 'Done' : '+ Add'}
                </button>
              </div>

              {adding ? (
                <div>
                  <p className="text-xs text-gray-600 px-4 py-2 uppercase tracking-wider">Select tracks to add</p>
                  {tracks.map((track, i) => {
                    const inPlaylist = selectedPlaylist.tracks.find(t => t.id === track.id);
                    return (
                      <div key={track.id} onClick={() => addToPlaylist(track)}
                        className="flex items-center gap-2 px-4 py-2.5 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: inPlaylist ? '#a855f7' : 'rgba(255,255,255,0.15)' }} />
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{track.title}</p>
                          <p className="text-xs text-gray-600">{track.artist}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : selectedPlaylist.tracks.length === 0 ? (
                <div className="p-6 text-center text-gray-600 text-sm">
                  <p>No tracks yet.</p>
                  <button onClick={() => setAdding(true)} className="text-purple-400 mt-1 text-xs">Add some →</button>
                </div>
              ) : (
                selectedPlaylist.tracks.map((track, i) => (
                  <div key={track.id} className="relative group">
                    <TrackCard track={track} index={i} queue={selectedPlaylist.tracks} compact />
                    <button
                      onClick={() => removeFromPlaylist(track.id)}
                      className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >✕</button>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}