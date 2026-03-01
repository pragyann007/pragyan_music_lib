import React, { createContext, useContext, useReducer, useRef, useEffect, ReactNode } from 'react';
import { Track, PlayerState } from '../types';

type Action =
  | { type: 'SET_TRACK'; track: Track; queue?: Track[] }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'SET_VOLUME'; volume: number }
  | { type: 'SET_PROGRESS'; progress: number }
  | { type: 'SET_DURATION'; duration: number }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'SET_REPEAT' }
  | { type: 'NEXT_TRACK' }
  | { type: 'PREV_TRACK' }
  | { type: 'SET_QUEUE'; queue: Track[] }
  | { type: 'ADD_TO_QUEUE'; track: Track };

const initialState: PlayerState = {
  currentTrack: null,
  isPlaying: false,
  volume: 0.8,
  progress: 0,
  duration: 0,
  shuffle: false,
  repeat: 'none',
  queue: [],
  currentIndex: 0,
};

function getNextIndex(state: PlayerState): number {
  if (state.shuffle) {
    return Math.floor(Math.random() * state.queue.length);
  }
  return (state.currentIndex + 1) % state.queue.length;
}

function getPrevIndex(state: PlayerState): number {
  if (state.shuffle) return Math.floor(Math.random() * state.queue.length);
  return (state.currentIndex - 1 + state.queue.length) % state.queue.length;
}

function reducer(state: PlayerState, action: Action): PlayerState {
  switch (action.type) {
    case 'SET_TRACK': {
      const queue = action.queue ?? state.queue;
      const idx = queue.findIndex(t => t.id === action.track.id);
      return { ...state, currentTrack: action.track, isPlaying: true, progress: 0, queue, currentIndex: idx >= 0 ? idx : 0 };
    }
    case 'TOGGLE_PLAY': return { ...state, isPlaying: !state.isPlaying };
    case 'SET_VOLUME': return { ...state, volume: action.volume };
    case 'SET_PROGRESS': return { ...state, progress: action.progress };
    case 'SET_DURATION': return { ...state, duration: action.duration };
    case 'TOGGLE_SHUFFLE': return { ...state, shuffle: !state.shuffle };
    case 'SET_REPEAT': {
      const order: PlayerState['repeat'][] = ['none', 'all', 'one'];
      const next = order[(order.indexOf(state.repeat) + 1) % 3];
      return { ...state, repeat: next };
    }
    case 'NEXT_TRACK': {
      if (!state.queue.length) return state;
      const idx = getNextIndex(state);
      return { ...state, currentIndex: idx, currentTrack: state.queue[idx], isPlaying: true, progress: 0 };
    }
    case 'PREV_TRACK': {
      if (!state.queue.length) return state;
      if (state.progress > 3) return { ...state, progress: 0 };
      const idx = getPrevIndex(state);
      return { ...state, currentIndex: idx, currentTrack: state.queue[idx], isPlaying: true, progress: 0 };
    }
    case 'SET_QUEUE': return { ...state, queue: action.queue };
    case 'ADD_TO_QUEUE': return { ...state, queue: [...state.queue, action.track] };
    default: return state;
  }
}

interface PlayerContextType {
  state: PlayerState;
  dispatch: React.Dispatch<Action>;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (state.currentTrack) {
      if (audio.src !== state.currentTrack.url) {
        audio.src = state.currentTrack.url;
        audio.load();
      }
      if (state.isPlaying) audio.play().catch(console.error);
      else audio.pause();
    }
  }, [state.currentTrack, state.isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = state.volume;
  }, [state.volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => dispatch({ type: 'SET_PROGRESS', progress: audio.currentTime });
    const onDuration = () => dispatch({ type: 'SET_DURATION', duration: audio.duration });
    const onEnded = () => {
      if (state.repeat === 'one') {
        audio.currentTime = 0;
        audio.play();
      } else if (state.repeat === 'all' || state.currentIndex < state.queue.length - 1) {
        dispatch({ type: 'NEXT_TRACK' });
      }
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [state.repeat, state.currentIndex, state.queue.length]);

  return (
    <PlayerContext.Provider value={{ state, dispatch, audioRef }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}