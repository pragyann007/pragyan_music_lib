export interface Track {
    id: string;
    title: string;
    artist: string;
    url: string;
    public_id: string;
    duration?: number;
    cover?: string;
    uploadedAt?: string;
  }
  
  export interface PlayerState {
    currentTrack: Track | null;
    isPlaying: boolean;
    volume: number;
    progress: number;
    duration: number;
    shuffle: boolean;
    repeat: 'none' | 'one' | 'all';
    queue: Track[];
    currentIndex: number;
  }
  
  export interface Playlist {
    id: string;
    name: string;
    tracks: Track[];
    cover?: string;
    createdAt: string;
  }