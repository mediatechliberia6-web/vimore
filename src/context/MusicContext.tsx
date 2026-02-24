"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Track {
  id: string | number;
  title: string;
  artist: string;
  cover: string;
  duration: number; // in seconds
  streams?: string;
}

export interface Listener {
  name: string;
  avatar: string;
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
  isSpatial: boolean;
  isSmartShuffle: boolean;
  progress: number;
  volume: number;
  listeners: Listener[];
  reactions: MusicReaction[];
  setTrack: (track: Track) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setIsExpanded: (expanded: boolean) => void;
  setIsSpatial: (spatial: boolean) => void;
  setIsSmartShuffle: (shuffle: boolean) => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  addReaction: (emoji: string) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const MOCK_TRACKS: Track[] = [
  { id: 1, title: "Essence", artist: "Wizkid ft. Tems", cover: "https://picsum.photos/seed/song1/600/600", duration: 240, streams: "124M" },
  { id: 2, title: "Last Last", artist: "Burna Boy", cover: "https://picsum.photos/seed/song2/600/600", duration: 172, streams: "98M" },
  { id: 3, title: "Unavailable", artist: "Davido", cover: "https://picsum.photos/seed/song3/600/600", duration: 185, streams: "75M" },
  { id: 4, title: "Calm Down", artist: "Rema", cover: "https://picsum.photos/seed/song4/600/600", duration: 219, streams: "320M" },
  { id: 5, title: "Soweto", artist: "Victony", cover: "https://picsum.photos/seed/song5/600/600", duration: 164, streams: "45M" },
];

const MOCK_LISTENERS: Listener[] = [
  { name: "Alex", avatar: "https://picsum.photos/seed/1/100/100" },
  { name: "Sarah", avatar: "https://picsum.photos/seed/2/100/100" },
  { name: "Marcus", avatar: "https://picsum.photos/seed/3/100/100" },
];

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(MOCK_TRACKS[0]);
  const [queue, setQueue] = useState<Track[]>(MOCK_TRACKS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpatial, setIsSpatial] = useState(false);
  const [isSmartShuffle, setIsSmartShuffle] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [reactions, setReactions] = useState<MusicReaction[]>([]);
  const [listeners] = useState<Listener[]>(MOCK_LISTENERS);

  // Auto-progress simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
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
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = () => {
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    let nextIndex;
    
    if (isSmartShuffle) {
      // Logic for Smart Shuffle: avoid playing the same track twice if possible
      nextIndex = Math.floor(Math.random() * queue.length);
      if (nextIndex === currentIndex) nextIndex = (nextIndex + 1) % queue.length;
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
    }
    
    setTrack(queue[nextIndex]);
  };

  const prevTrack = () => {
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    setTrack(queue[prevIndex]);
  };

  const addReaction = (emoji: string) => {
    const id = Date.now();
    const newReaction = {
      id,
      emoji,
      x: Math.random() * 80 + 10,
    };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2000);
  };

  return (
    <MusicContext.Provider value={{
      currentTrack,
      queue,
      isPlaying,
      isExpanded,
      isSpatial,
      isSmartShuffle,
      progress,
      volume,
      listeners,
      reactions,
      setTrack,
      togglePlay,
      nextTrack,
      prevTrack,
      setIsExpanded,
      setIsSpatial,
      setIsSmartShuffle,
      setProgress,
      setVolume,
      addReaction
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
