import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayer } from '../store/PlayerContext';

function formatTime(secs: number) {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const GRADIENTS = [
  '#a855f7, #ec4899',
  '#3b82f6, #06b6d4',
  '#10b981, #14b8a6',
  '#f97316, #f43f5e',
  '#6366f1, #8b5cf6',
];

export default function PlayerBar() {
  const { state, dispatch, audioRef } = usePlayer();
  const progressRef = useRef<HTMLDivElement>(null);

  const progress = state.duration ? (state.progress / state.duration) * 100 : 0;
  const gradientIdx = state.currentTrack
    ? Math.abs(state.currentTrack.id.charCodeAt(0)) % GRADIENTS.length
    : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !state.duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const time = pct * state.duration;
    if (audioRef.current) audioRef.current.currentTime = time;
    dispatch({ type: 'SET_PROGRESS', progress: time });
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(8, 8, 16, 0.85)',
        backdropFilter: 'blur(30px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Playback glow behind progress */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <motion.div
          className="h-full"
          style={{ background: `linear-gradient(90deg, ${GRADIENTS[gradientIdx]})` }}
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'linear', duration: 0.1 }}
        />
      </div>

      {/* Progress bar */}
      <div
        ref={progressRef}
        onClick={handleProgressClick}
        className="absolute top-0 left-0 right-0 h-1 cursor-pointer group"
      >
        <div className="w-full h-full bg-white/10">
          <motion.div
            className="h-full relative"
            style={{ background: `linear-gradient(90deg, ${GRADIENTS[gradientIdx]})`, width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
          </motion.div>
        </div>
      </div>

      <div className="flex items-center gap-4 px-6 h-20">
        {/* Track Info */}
        <div className="flex items-center gap-3 w-64 min-w-0">
          <AnimatePresence mode="wait">
            {state.currentTrack && (
              <motion.div
                key={state.currentTrack.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${GRADIENTS[gradientIdx]})` }}
              >
                <motion.div
                  animate={state.isPlaying ? { rotate: 360 } : {}}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 rounded-full bg-black/40"
                />
              </motion.div>
            )}
          </AnimatePresence>
          {state.currentTrack ? (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{state.currentTrack.title}</p>
              <p className="text-xs text-gray-500 truncate">{state.currentTrack.artist}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No track selected</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 flex items-center justify-center gap-4">
          {/* Shuffle */}
          <ControlBtn
            onClick={() => dispatch({ type: 'TOGGLE_SHUFFLE' })}
            active={state.shuffle}
            title="Shuffle"
          >
            <ShuffleIcon />
          </ControlBtn>

          {/* Prev */}
          <ControlBtn onClick={() => dispatch({ type: 'PREV_TRACK' })} title="Previous">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </ControlBtn>

          {/* Play/Pause */}
          <motion.button
            onClick={() => dispatch({ type: 'TOGGLE_PLAY' })}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${GRADIENTS[gradientIdx]})`, boxShadow: `0 0 20px rgba(168,85,247,0.4)` }}
          >
            <AnimatePresence mode="wait">
              {state.isPlaying ? (
                <motion.span key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  ❚❚
                </motion.span>
              ) : (
                <motion.span key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="ml-1">
                  ▶
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Next */}
          <ControlBtn onClick={() => dispatch({ type: 'NEXT_TRACK' })} title="Next">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zm2.5-6 8.5 6V6z" />
              <path d="M16 6h2v12h-2z" />
            </svg>
          </ControlBtn>

          {/* Repeat */}
          <ControlBtn
            onClick={() => dispatch({ type: 'SET_REPEAT' })}
            active={state.repeat !== 'none'}
            title={`Repeat: ${state.repeat}`}
          >
            {state.repeat === 'one' ? <RepeatOneIcon /> : <RepeatIcon />}
          </ControlBtn>
        </div>

        {/* Time + Volume */}
        <div className="w-64 flex items-center gap-3 justify-end">
          <span className="text-xs text-gray-500 tabular-nums">
            {formatTime(state.progress)} / {formatTime(state.duration)}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">🔊</span>
            <div className="w-24 relative h-1 bg-white/10 rounded-full cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              dispatch({ type: 'SET_VOLUME', volume: Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) });
            }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${GRADIENTS[gradientIdx]})`,
                  width: `${state.volume * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ControlBtn({ onClick, active = false, children, title }: { onClick: () => void; active?: boolean; children: React.ReactNode; title?: string }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
      style={{ color: active ? '#a855f7' : 'rgba(255,255,255,0.5)' }}
    >
      {children}
    </motion.button>
  );
}

function ShuffleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  );
}
function RepeatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}
function RepeatOneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      <text x="11" y="14" fontSize="7" fill="currentColor" stroke="none">1</text>
    </svg>
  );
}