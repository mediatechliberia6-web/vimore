
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Comment {
  id: string | number;
  user: string;
  avatar: string;
  text: string;
  time: string;
}

export interface Track {
  id: string | number;
  title: string;
  artist: string;
  artistUsername?: string;
  cover: string;
  duration: number; // in seconds
  streams?: string;
  comments?: Comment[];
}

export interface Album {
  id: string | number;
  title: string;
  artist: string;
  artistUsername?: string;
  cover: string;
  year: string;
  tracks: number;
  totalStreams: string;
  songs: Track[];
}

export interface Playlist {
  id: string | number;
  title: string;
  creator: string; // The username of the creator
  cover: string;
  totalStreams: string;
  songs: Track[];
}

export interface MusicReaction {
  id: number;
  emoji: string;
  x: number;
}

interface MusicContextType {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  isExpanded: boolean;
  selectedAlbum: Album | null;
  selectedPlaylist: Playlist | null;
  progress: number;
  volume: number;
  reactions: MusicReaction[];
  likedSongIds: Set<string | number>;
  
  setTrack: (track: Track) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setIsExpanded: (expanded: boolean) => void;
  setSelectedAlbum: (album: Album | null) => void;
  setSelectedPlaylist: (playlist: Playlist | null) => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  addReaction: (emoji: string) => void;
  addComment: (text: string) => void;
  clearPlayer: () => void;
  toggleLike: (trackId: string | number) => void;
  isTrackLiked: (trackId: string | number) => boolean;
  playCollection: (tracks: Track[], startIndex?: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const MOCK_COMMENTS: Comment[] = [
  { id: 1, user: "Alex Rivera", avatar: "https://picsum.photos/seed/1/100/100", text: "This beat is absolutely insane! 🚀", time: "2m ago" },
  { id: 2, user: "Sarah Chen", avatar: "https://picsum.photos/seed/2/100/100", text: "The transition at 1:45... literal chills.", time: "15m ago" },
  { id: 3, user: "Marcus Stone", avatar: "https://picsum.photos/seed/3/100/100", text: "Lagos vibes in full effect. 🔥", time: "1h ago" },
];

const MOCK_SONGS: Track[] = [
  { id: 1, title: "Essence", artist: "Wizkid ft. Tems", artistUsername: "arivera", cover: "https://picsum.photos/seed/song1/600/600", duration: 240, streams: "124M", comments: MOCK_COMMENTS },
  { id: 2, title: "Last Last", artist: "Burna Boy", artistUsername: "schen_dev", cover: "https://picsum.photos/seed/song2/600/600", duration: 172, streams: "98M", comments: MOCK_COMMENTS.slice(0, 2) },
  { id: 3, title: "Unavailable", artist: "Davido", artistUsername: "mstone", cover: "https://picsum.photos/seed/song3/600/600", duration: 185, streams: "75M", comments: MOCK_COMMENTS.slice(1) },
  { id: 4, title: "Calm Down", artist: "Rema", artistUsername: "arivera", cover: "https://picsum.photos/seed/song4/600/600", duration: 219, streams: "320M", comments: MOCK_COMMENTS },
  { id: 5, title: "Soweto", artist: "Victony", artistUsername: "techex", cover: "https://picsum.photos/seed/song5/600/600", duration: 164, streams: "45M", comments: MOCK_COMMENTS.slice(0, 1) },
];

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>(MOCK_SONGS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [reactions, setReactions] = useState<MusicReaction[]>([]);
  const [likedSongIds, setLikedSongIds] = useState<Set<string | number>>(new Set());

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 100;
          const step = (1 / (currentTrack.duration || 1)) * 100;
          return Math.min(prev + step / 10, 100); 
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  // Handle auto-next
  useEffect(() => {
    if (progress >= 100 && isPlaying) {
      nextTrack();
    }
  }, [progress]);

  const setTrack = (track: Track) => {
    // If selecting a single track from discover, reset queue to mock songs or the current queue
    if (!queue.some(t => t.id === track.id)) {
      setQueue([track, ...queue.filter(t => t.id !== track.id)]);
    }
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    setReactions([]);
    setIsExpanded(true); 
  };

  const playCollection = (tracks: Track[], startIndex: number = 0) => {
    if (tracks.length === 0) return;
    setQueue(tracks);
    const track = tracks[startIndex];
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    setReactions([]);
    setIsExpanded(true);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    const next = queue[nextIndex];
    setCurrentTrack(next);
    setProgress(0);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    const prev = queue[prevIndex];
    setCurrentTrack(prev);
    setProgress(0);
    setIsPlaying(true);
  };

  const toggleLike = (trackId: string | number) => {
    setLikedSongIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  const isTrackLiked = (trackId: string | number) => likedSongIds.has(trackId);

  const addReaction = (emoji: string) => {
    const id = Date.now();
    const newReaction = { id, emoji, x: Math.random() * 80 + 10 };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== id)), 2500);
  };

  const addComment = (text: string) => {
    if (!currentTrack || !text.trim()) return;
    const newComment: Comment = {
      id: Date.now(),
      user: "John Doe",
      avatar: "https://picsum.photos/seed/me/100/100",
      text,
      time: "Just now"
    };
    setCurrentTrack({
      ...currentTrack,
      comments: [newComment, ...(currentTrack.comments || [])]
    });
  };

  const clearPlayer = () => {
    setIsPlaying(false);
    setCurrentTrack(null);
    setIsExpanded(false);
    setProgress(0);
  };

  return (
    <MusicContext.Provider value={{
      currentTrack, queue, isPlaying, isExpanded, selectedAlbum, selectedPlaylist, progress, volume, reactions, likedSongIds,
      setTrack, togglePlay, nextTrack, prevTrack, setIsExpanded, setSelectedAlbum, setSelectedPlaylist, setProgress, setVolume, addReaction, addComment, clearPlayer, toggleLike, isTrackLiked, playCollection
    }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) throw new Error('useMusic must be used within a MusicProvider');
  return context;
}
