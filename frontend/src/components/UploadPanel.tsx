import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Track } from '../types';

interface UploadProps {
  onUploaded: (track: Track) => void;
  uploading: boolean;
  uploadTrack: (file: File) => Promise<Track | null>;
}

export default function UploadPanel({ onUploaded, uploading, uploadTrack }: UploadProps) {
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState<File[]>([]);
  const [progress, setProgress] = useState<Record<string, 'pending' | 'uploading' | 'done' | 'error'>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const audioFiles = Array.from(files).filter(f => f.type.startsWith('audio/'));
    setQueue(prev => [...prev, ...audioFiles]);
    audioFiles.forEach(f => setProgress(prev => ({ ...prev, [f.name]: 'pending' })));
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const startUpload = async () => {
    for (const file of queue) {
      if (progress[file.name] === 'done') continue;
      setProgress(prev => ({ ...prev, [file.name]: 'uploading' }));
      const result = await uploadTrack(file);
      if (result) {
        setProgress(prev => ({ ...prev, [file.name]: 'done' }));
        onUploaded(result);
      } else {
        setProgress(prev => ({ ...prev, [file.name]: 'error' }));
      }
    }
  };

  const removeFile = (name: string) => {
    setQueue(prev => prev.filter(f => f.name !== name));
    setProgress(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-2"
        style={{ fontFamily: "'Space Grotesk', sans-serif", background: 'linear-gradient(90deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
      >
        Upload Music
      </motion.h1>
      <p className="text-gray-500 mb-8 text-sm">Add your audio files to your personal library</p>

      {/* Drop Zone */}
      <motion.div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        animate={{
          borderColor: dragging ? 'rgba(168,85,247,0.8)' : 'rgba(255,255,255,0.1)',
          background: dragging ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.03)',
        }}
        whileHover={{ borderColor: 'rgba(168,85,247,0.4)' }}
        className="border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all mb-6"
        style={{ backdropFilter: 'blur(10px)' }}
      >
        <input ref={inputRef} type="file" multiple accept="audio/*" className="hidden" onChange={e => e.target.files && handleFiles(e.target.files)} />
        <motion.div
          animate={dragging ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="text-5xl mb-4"
        >
          ♪
        </motion.div>
        <p className="text-white font-semibold mb-1">Drop audio files here</p>
        <p className="text-gray-500 text-sm">or click to browse · MP3, WAV, FLAC · Max 20MB</p>
      </motion.div>

      {/* File Queue */}
      <AnimatePresence>
        {queue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl overflow-hidden mb-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {queue.map((file, i) => {
              const status = progress[file.name] || 'pending';
              return (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-none"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                    style={{ background: 'rgba(168,85,247,0.2)' }}>
                    ♫
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{file.name}</p>
                    <p className="text-xs text-gray-600">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <StatusBadge status={status} />
                  {status === 'pending' && (
                    <button onClick={() => removeFile(file.name)} className="text-gray-600 hover:text-red-400 transition-colors ml-1 text-sm">✕</button>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {queue.length > 0 && (
        <motion.button
          onClick={startUpload}
          disabled={uploading || queue.every(f => progress[f.name] === 'done')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3.5 rounded-xl font-semibold text-white transition-all"
          style={{
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            boxShadow: '0 4px 20px rgba(168,85,247,0.3)',
            opacity: uploading ? 0.7 : 1,
          }}
        >
          {uploading ? 'Uploading...' : `Upload ${queue.filter(f => progress[f.name] !== 'done').length} file(s)`}
        </motion.button>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map = {
    pending: { label: 'Pending', color: '#6b7280' },
    uploading: { label: 'Uploading...', color: '#a855f7' },
    done: { label: '✓ Done', color: '#10b981' },
    error: { label: '✕ Error', color: '#ef4444' },
  };
  const s = map[status as keyof typeof map] || map.pending;
  return (
    <motion.span
      animate={status === 'uploading' ? { opacity: [1, 0.5, 1] } : {}}
      transition={{ duration: 1, repeat: Infinity }}
      className="text-xs font-medium"
      style={{ color: s.color }}
    >
      {s.label}
    </motion.span>
  );
}