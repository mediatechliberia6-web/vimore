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

interface MusicContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  isExpanded: boolean;
  isSpatial: boolean;
  progress: number;
  volume: number;
  setTrack: (track: Track) => void;
  togglePlay: () => void;
  setIsExpanded: (expanded: boolean) => void;
  setIsSpatial: (spatial: boolean) => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
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

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(MOCK_INITIAL_TRACK);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpatial, setIsSpatial] = useState(false);
  const [progress, setProgress] = useState(35); // Initial progress percentage
  const [volume, setVolume] = useState(80);

  const setTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <MusicContext.Provider value={{
      currentTrack,
      isPlaying,
      isExpanded,
      isSpatial,
      progress,
      volume,
      setTrack,
      togglePlay,
      setIsExpanded,
      setIsSpatial,
      setProgress,
      setVolume
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
