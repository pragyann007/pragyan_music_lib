import { useState, useCallback } from 'react';
import { Track } from '../types';

const API_BASE = 'http://localhost:8080/api/audio';

export function useAudioAPI() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: Track[] = await res.json();
      setTracks(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch tracks');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadTrack = useCallback(async (file: File): Promise<Track | null> => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      const res = await fetch(API_BASE, { method: 'POST', body: formData });
      const data = await res.json();
      const track: Track = {
        id: data.public_id,
        title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        artist: 'Unknown Artist',
        url: data.url,
        public_id: data.public_id,
        uploadedAt: new Date().toISOString(),
      };
      setTracks(prev => [track, ...prev]);
      return track;
    } catch (e: any) {
      setError(e.message || 'Upload failed');
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  return { tracks, setTracks, loading, uploading, error, fetchTracks, uploadTrack };
}