import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Track } from '../types';
import { usePlayer } from '../store/PlayerContext';

interface TrackCardProps {
  track: Track;
  index: number;
  queue: Track[];
  compact?: boolean;
}

function formatDuration(secs?: number) {
  if (!secs) return '--:--';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const GRADIENTS = [
  'from-purple-600 to-pink-500',
  'from-blue-600 to-cyan-400',
  'from-emerald-600 to-teal-400',
  'from-orange-500 to-rose-500',
  'from-indigo-600 to-violet-400',
  'from-fuchsia-600 to-pink-400',
];

export default function TrackCard({ track, index, queue, compact = false }: TrackCardProps) {
  const { state, dispatch } = usePlayer();
  const isActive = state.currentTrack?.id === track.id;
  const isPlaying = isActive && state.isPlaying;
  const [hovered, setHovered] = useState(false);
  const gradient = GRADIENTS[index % GRADIENTS.length];

  const handlePlay = () => {
    if (isActive) {
      dispatch({ type: 'TOGGLE_PLAY' });
    } else {
      dispatch({ type: 'SET_TRACK', track, queue });
    }
  };

  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={handlePlay}
        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all"
        style={{
          background: isActive
            ? 'linear-gradient(90deg, rgba(168,85,247,0.2), rgba(236,72,153,0.1))'
            : hovered
            ? 'rgba(255,255,255,0.05)'
            : 'transparent',
          border: isActive ? '1px solid rgba(168,85,247,0.25)' : '1px solid transparent',
        }}
      >
        <div className="relative flex-shrink-0">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <AnimatedBars active={isPlaying} small />
            {!isPlaying && (
              <span className="text-white text-sm absolute">
                {hovered ? '▶' : (index + 1).toString().padStart(2, '0')}
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{track.title}</p>
          <p className="text-xs text-gray-500 truncate">{track.artist}</p>
        </div>
        <span className="text-xs text-gray-600 flex-shrink-0">{formatDuration(track.duration)}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={handlePlay}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      className="relative cursor-pointer rounded-2xl overflow-hidden group"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: isActive ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(10px)',
        boxShadow: isActive ? '0 0 30px rgba(168,85,247,0.2), 0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {/* Glow effect when active */}
      {isActive && (
        <motion.div
          className="absolute inset-0 opacity-20"
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)' }}
        />
      )}

      <div className="p-4">
        {/* Cover art */}
        <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${gradient} mb-3 flex items-center justify-center relative overflow-hidden`}>
          <motion.div
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="w-20 h-20 rounded-full bg-black/30 flex items-center justify-center"
          >
            <div className="w-6 h-6 rounded-full bg-black/50" />
          </motion.div>
          {isPlaying && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <AnimatedBars active={true} />
            </div>
          )}
          {/* Play overlay */}
          <AnimatePresence>
            {hovered && !isPlaying && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 bg-black/40 flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl">
                  ▶
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className="text-sm font-semibold text-white truncate">{track.title}</p>
        <p className="text-xs text-gray-500 truncate mt-0.5">{track.artist}</p>
        {track.duration && (
          <p className="text-xs text-gray-600 mt-1">{formatDuration(track.duration)}</p>
        )}
      </div>
    </motion.div>
  );
}

function AnimatedBars({ active, small = false }: { active: boolean; small?: boolean }) {
  const h = small ? [8, 12, 8, 10] : [12, 20, 16, 14];
  return (
    <div className={`flex items-end gap-0.5 ${small ? 'h-3' : 'h-5'}`}>
      {h.map((height, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full bg-white"
          animate={active ? { height: [height * 0.5, height, height * 0.3, height * 0.8] } : { height: height * 0.3 }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
          style={{ height: height * 0.5 }}
        />
      ))}
    </div>
  );
}