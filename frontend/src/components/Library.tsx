import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Track } from '../types';
import TrackCard from './TrackCard';
import { usePlayer } from '../store/PlayerContext';

interface LibraryProps {
  tracks: Track[];
  loading: boolean;
  onRefresh: () => void;
}

type SortKey = 'title' | 'artist' | 'duration' | 'uploadedAt';
type ViewMode = 'grid' | 'list';

export default function Library({ tracks, loading, onRefresh }: LibraryProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('uploadedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const { dispatch } = usePlayer();

  const filtered = useMemo(() => {
    let list = tracks.filter(t =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.artist.toLowerCase().includes(search.toLowerCase())
    );
    list.sort((a, b) => {
      const va = a[sortKey] ?? '';
      const vb = b[sortKey] ?? '';
      return sortDir === 'asc'
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return list;
  }, [tracks, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const playAll = () => {
    if (filtered.length) dispatch({ type: 'SET_TRACK', track: filtered[0], queue: filtered });
  };

  const shuffleAll = () => {
    if (!filtered.length) return;
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    dispatch({ type: 'SET_TRACK', track: shuffled[0], queue: shuffled });
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  };

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-1"
          style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(90deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Your Library
        </h1>
        <p className="text-gray-500 text-sm">{tracks.length} tracks in your collection</p>
      </motion.div>

      {/* Actions Row */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tracks..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* Sort */}
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          className="px-3 py-2.5 rounded-xl text-sm text-white outline-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <option value="title">Title</option>
          <option value="artist">Artist</option>
          <option value="duration">Duration</option>
          <option value="uploadedAt">Date Added</option>
        </select>

        <motion.button
          onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
          whileTap={{ scale: 0.9 }}
          className="px-3 py-2.5 rounded-xl text-sm text-white"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {sortDir === 'asc' ? '↑' : '↓'}
        </motion.button>

        {/* View mode */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          {(['list', 'grid'] as ViewMode[]).map(m => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className="px-3 py-2.5 text-sm transition-all"
              style={{
                background: viewMode === m ? 'rgba(168,85,247,0.3)' : 'rgba(255,255,255,0.06)',
                color: viewMode === m ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            >
              {m === 'list' ? '☰' : '⊞'}
            </button>
          ))}
        </div>

        {/* Play/Shuffle all */}
        <motion.button onClick={playAll} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899)', boxShadow: '0 0 15px rgba(168,85,247,0.3)' }}>
          ▶ Play All
        </motion.button>
        <motion.button onClick={shuffleAll} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-white"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
          ⇄ Shuffle
        </motion.button>
        <motion.button onClick={onRefresh} whileTap={{ scale: 0.9 }}
          className="px-3 py-2.5 rounded-xl text-sm text-gray-500"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          ↺
        </motion.button>
      </div>

      {/* Track List */}
      {loading ? (
        <LoadingSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState search={search} />
      ) : viewMode === 'grid' ? (
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence>
            {filtered.map((track, i) => (
              <TrackCard key={track.id} track={track} index={i} queue={filtered} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          {/* List header */}
          <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs text-gray-600 uppercase tracking-wider border-b border-white/5">
            <div className="col-span-1">#</div>
            <div className="col-span-5 cursor-pointer hover:text-gray-400" onClick={() => handleSort('title')}>
              Title {sortKey === 'title' && (sortDir === 'asc' ? '↑' : '↓')}
            </div>
            <div className="col-span-3 cursor-pointer hover:text-gray-400" onClick={() => handleSort('artist')}>
              Artist {sortKey === 'artist' && (sortDir === 'asc' ? '↑' : '↓')}
            </div>
            <div className="col-span-3 cursor-pointer hover:text-gray-400 text-right" onClick={() => handleSort('duration')}>
              Duration {sortKey === 'duration' && (sortDir === 'asc' ? '↑' : '↓')}
            </div>
          </div>
          <AnimatePresence>
            {filtered.map((track, i) => (
              <TrackCard key={track.id} track={track} index={i} queue={filtered} compact />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          className="h-16 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        />
      ))}
    </div>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
      <div className="text-5xl mb-4 opacity-30">♪</div>
      <p className="text-gray-500">{search ? `No tracks matching "${search}"` : 'Your library is empty. Upload some music!'}</p>
    </motion.div>
  );
}