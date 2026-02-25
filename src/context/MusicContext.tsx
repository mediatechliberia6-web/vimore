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
  cover: string;
  duration: number; // in seconds
  streams?: string;
  comments?: Comment[];
}

export interface Album {
  id: string | number;
  title: string;
  artist: string;
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
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const MOCK_COMMENTS: Comment[] = [
  { id: 1, user: "Alex Rivera", avatar: "https://picsum.photos/seed/1/100/100", text: "This beat is absolutely insane! 🚀", time: "2m ago" },
  { id: 2, user: "Sarah Chen", avatar: "https://picsum.photos/seed/2/100/100", text: "The transition at 1:45... literal chills.", time: "15m ago" },
  { id: 3, user: "Marcus Stone", avatar: "https://picsum.photos/seed/3/100/100", text: "Lagos vibes in full effect. 🔥", time: "1h ago" },
];

const MOCK_SONGS: Track[] = [
  { id: 1, title: "Essence", artist: "Wizkid ft. Tems", cover: "https://picsum.photos/seed/song1/600/600", duration: 240, streams: "124M", comments: MOCK_COMMENTS },
  { id: 2, title: "Last Last", artist: "Burna Boy", cover: "https://picsum.photos/seed/song2/600/600", duration: 172, streams: "98M", comments: MOCK_COMMENTS.slice(0, 2) },
  { id: 3, title: "Unavailable", artist: "Davido", cover: "https://picsum.photos/seed/song3/600/600", duration: 185, streams: "75M", comments: MOCK_COMMENTS.slice(1) },
  { id: 4, title: "Calm Down", artist: "Rema", cover: "https://picsum.photos/seed/song4/600/600", duration: 219, streams: "320M", comments: MOCK_COMMENTS },
  { id: 5, title: "Soweto", artist: "Victony", cover: "https://picsum.photos/seed/song5/600/600", duration: 164, streams: "45M", comments: MOCK_COMMENTS.slice(0, 1) },
];

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue] = useState<Track[]>(MOCK_SONGS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [reactions, setReactions] = useState<MusicReaction[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            nextTrack();
            return 0;
          }
          return prev + 0.1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  const setTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    setReactions([]);
    setIsExpanded(true); // Open full-screen player immediately on track selection
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    setTrack(queue[nextIndex]);
  };

  const prevTrack = () => {
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    setTrack(queue[prevIndex]);
  };

  const addReaction = (emoji: string) => {
    const id = Date.now();
    const newReaction = { id, emoji, x: Math.random() * 80 + 10 };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== id)), 2000);
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
      currentTrack, queue, isPlaying, isExpanded, selectedAlbum, selectedPlaylist, progress, volume, reactions,
      setTrack, togglePlay, nextTrack, prevTrack, setIsExpanded, setSelectedAlbum, setSelectedPlaylist, setProgress, setVolume, addReaction, addComment, clearPlayer
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
