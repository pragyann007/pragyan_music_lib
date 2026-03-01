import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Track } from '../types';
import TrackCard from './TrackCard';
import { usePlayer } from '../store/PlayerContext';

interface HomeProps {
  tracks: Track[];
  loading: boolean;
  onNavigate: (view: string) => void;
}

export default function Home({ tracks, loading, onNavigate }: HomeProps) {
  const { state, dispatch } = usePlayer();
  const recent = tracks.slice(0, 5);
  const featured = tracks.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl p-8 mb-10 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.15), rgba(59,130,246,0.1))',
          border: '1px solid rgba(168,85,247,0.2)',
        }}
      >
        {/* BG glow */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, #a855f7, transparent 70%)' }} />
        <div className="absolute bottom-0 left-20 w-40 h-40 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent 70%)' }} />

        <div className="relative z-10">
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-xs uppercase tracking-widest text-purple-400 mb-2 font-medium"
          >
            Welcome Back
          </motion.p>
          <h1 className="text-4xl font-black text-white mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Your Music,<br />
            <span style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Perfectly Personal
            </span>
          </h1>
          <p className="text-gray-400 text-sm mb-6 max-w-md">
            {tracks.length} tracks in your private library. Stream from anywhere, anytime.
          </p>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => { if (tracks.length) dispatch({ type: 'SET_TRACK', track: tracks[0], queue: tracks }); }}
              className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', boxShadow: '0 4px 15px rgba(168,85,247,0.4)' }}
            >
              ▶ Play All
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('upload')}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white' }}
            >
              ↑ Upload
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        {[
          { label: 'Total Tracks', value: tracks.length, icon: '♪' },
          { label: 'Hours of Music', value: tracks.reduce((a, t) => a + (t.duration || 0), 0) > 0
              ? Math.round(tracks.reduce((a, t) => a + (t.duration || 0), 0) / 3600) + 'h'
              : '--', icon: '⏱' },
          { label: 'Now Playing', value: state.currentTrack ? '1' : '0', icon: '🎵' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-4 text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recently Added */}
      {recent.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Recently Added</h2>
            <button onClick={() => onNavigate('library')} className="text-xs text-purple-400 hover:text-purple-300">See all →</button>
          </div>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <motion.div key={i} animate={{ opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                  className="h-14 border-b border-white/5" />
              ))
            ) : recent.map((track, i) => (
              <TrackCard key={track.id} track={track} index={i} queue={tracks} compact />
            ))}
          </div>
        </section>
      )}

      {/* Featured Grid */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Your Collection</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((track, i) => (
              <TrackCard key={track.id} track={track} index={i} queue={tracks} />
            ))}
          </div>
        </section>
      )}

      {!loading && tracks.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="text-6xl mb-6 opacity-20">♫</div>
          <h3 className="text-xl font-bold text-white mb-2">Your library is empty</h3>
          <p className="text-gray-500 text-sm mb-6">Start by uploading your favorite tracks</p>
          <motion.button whileHover={{ scale: 1.03 }} onClick={() => onNavigate('upload')}
            className="px-6 py-3 rounded-xl font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}>
            ↑ Upload Music
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}