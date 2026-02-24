"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  isPlaying: boolean;
  isExpanded: boolean;
  isSpatial: boolean;
  progress: number;
  volume: number;
  listeners: Listener[];
  reactions: MusicReaction[];
  setTrack: (track: Track) => void;
  togglePlay: () => void;
  setIsExpanded: (expanded: boolean) => void;
  setIsSpatial: (spatial: boolean) => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
  addReaction: (emoji: string) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const MOCK_INITIAL_TRACK: Track = {
  id: 'initial',
  title: "Essence",
  artist: "Wizkid ft. Tems",
  cover: "https://picsum.photos/seed/song1/600/600",
  duration: 240,
  streams: "124M"
};

const MOCK_LISTENERS: Listener[] = [
  { name: "Alex", avatar: "https://picsum.photos/seed/1/100/100" },
  { name: "Sarah", avatar: "https://picsum.photos/seed/2/100/100" },
  { name: "Marcus", avatar: "https://picsum.photos/seed/3/100/100" },
];

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(MOCK_INITIAL_TRACK);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpatial, setIsSpatial] = useState(false);
  const [progress, setProgress] = useState(35);
  const [volume, setVolume] = useState(80);
  const [reactions, setReactions] = useState<MusicReaction[]>([]);
  const [listeners] = useState<Listener[]>(MOCK_LISTENERS);

  const setTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setReactions([]); // Clear reactions when changing track
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const addReaction = (emoji: string) => {
    const id = Date.now();
    const newReaction = {
      id,
      emoji,
      x: Math.random() * 80 + 10, // 10% to 90%
    };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2000);
  };

  return (
    <MusicContext.Provider value={{
      currentTrack,
      isPlaying,
      isExpanded,
      isSpatial,
      progress,
      volume,
      listeners,
      reactions,
      setTrack,
      togglePlay,
      setIsExpanded,
      setIsSpatial,
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
