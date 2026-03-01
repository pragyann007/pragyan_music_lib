import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayer } from '../store/PlayerContext';

const GRADIENTS = [
  ['#a855f7', '#ec4899'],
  ['#3b82f6', '#06b6d4'],
  ['#10b981', '#14b8a6'],
  ['#f97316', '#f43f5e'],
  ['#6366f1', '#8b5cf6'],
];

export default function NowPlayingPanel() {
  const { state, dispatch, audioRef } = usePlayer();
  const track = state.currentTrack;

  const gradIdx = track ? Math.abs(track.id.charCodeAt(0)) % GRADIENTS.length : 0;
  const [c1, c2] = GRADIENTS[gradIdx];

  const progress = state.duration ? (state.progress / state.duration) * 100 : 0;

  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-30 select-none">
        <div className="text-6xl mb-4">♪</div>
        <p className="text-sm text-gray-500">Nothing playing</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-8">
      {/* Album art */}
      <AnimatePresence mode="wait">
        <motion.div
          key={track.id}
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative mb-8"
        >
          {/* Outer glow ring */}
          <motion.div
            animate={state.isPlaying ? { scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] } : { scale: 1, opacity: 0.2 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle, ${c1}44, transparent)`, margin: '-20px' }}
          />
          {/* Vinyl disc */}
          <motion.div
            animate={state.isPlaying ? { rotate: 360 } : {}}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="w-52 h-52 rounded-full flex items-center justify-center relative"
            style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 8px 40px ${c1}55` }}
          >
            {/* Vinyl grooves */}
            {[40, 60, 80].map(size => (
              <div key={size} className="absolute rounded-full border border-black/10"
                style={{ width: `${size}%`, height: `${size}%` }} />
            ))}
            <div className="w-14 h-14 rounded-full bg-black/60 flex items-center justify-center z-10">
              <div className="w-3 h-3 rounded-full bg-white/30" />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Track info */}
      <AnimatePresence mode="wait">
        <motion.div
          key={track.id + '-info'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center mb-6 w-full"
        >
          <h2 className="text-xl font-bold text-white truncate">{track.title}</h2>
          <p className="text-gray-500 text-sm mt-1">{track.artist}</p>
        </motion.div>
      </AnimatePresence>

      {/* Progress */}
      <div className="w-full mb-4">
        <div
          className="h-1.5 rounded-full cursor-pointer mb-2 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.1)' }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            if (audioRef.current) audioRef.current.currentTime = pct * state.duration;
            dispatch({ type: 'SET_PROGRESS', progress: pct * state.duration });
          }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${c1}, ${c2})`, width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>{formatTime(state.progress)}</span>
          <span>{formatTime(state.duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => dispatch({ type: 'TOGGLE_SHUFFLE' })}
          className="text-lg" style={{ color: state.shuffle ? c1 : 'rgba(255,255,255,0.3)' }}>⇄</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => dispatch({ type: 'PREV_TRACK' })}
          className="text-2xl text-white/60 hover:text-white transition-colors">⏮</motion.button>
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
          onClick={() => dispatch({ type: 'TOGGLE_PLAY' })}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl"
          style={{ background: `linear-gradient(135deg, ${c1}, ${c2})`, boxShadow: `0 0 25px ${c1}66` }}
        >
          {state.isPlaying ? '❚❚' : '▶'}
        </motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => dispatch({ type: 'NEXT_TRACK' })}
          className="text-2xl text-white/60 hover:text-white transition-colors">⏭</motion.button>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => dispatch({ type: 'SET_REPEAT' })}
          className="text-lg" style={{ color: state.repeat !== 'none' ? c1 : 'rgba(255,255,255,0.3)' }}>
          {state.repeat === 'one' ? '↺¹' : '↻'}
        </motion.button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-3 w-full">
        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>🔈</span>
        <div
          className="flex-1 h-1 rounded-full cursor-pointer overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.1)' }}
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            dispatch({ type: 'SET_VOLUME', volume: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) });
          }}
        >
          <div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${c1}, ${c2})`, width: `${state.volume * 100}%` }} />
        </div>
        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>🔊</span>
      </div>

      {/* Queue preview */}
      {state.queue.length > 1 && (
        <div className="mt-6 w-full">
          <p className="text-xs text-gray-600 uppercase tracking-wider mb-3">Up Next</p>
          <div className="space-y-1">
            {state.queue.slice(state.currentIndex + 1, state.currentIndex + 4).map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1 - i * 0.25, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => dispatch({ type: 'SET_TRACK', track: t })}
                className="flex items-center gap-2 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <span className="text-xs text-gray-600 w-4">{i + 1}</span>
                <div>
                  <p className="text-xs text-white truncate">{t.title}</p>
                  <p className="text-xs text-gray-600">{t.artist}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatTime(secs: number) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}