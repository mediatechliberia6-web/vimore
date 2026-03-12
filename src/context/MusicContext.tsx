
'use client';

/**
 * @fileOverview ViMore Sonic Context Node (Prototype Edition)
 * Manages playback using local mock data without Appwrite dependency.
 */

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef, useMemo } from 'react';
import { saveFileToDevice } from '@/lib/utils';

export interface Track {
  id: string | number;
  title: string;
  artist: string;
  artistUsername?: string;
  artistFollowers?: string | number;
  cover: string;
  audioUrl?: string; 
  duration: number; 
  streams?: string;
  likes?: number;
  unlikes?: number;
  isBoosted?: boolean;
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
  creator: string; 
  cover: string;
  totalStreams: string;
  songs: Track[];
  description?: string;
  isPrivate?: boolean;
}

export interface MusicReaction {
  id: number;
  emoji: string;
  x: number;
}

interface MusicContextType {
  currentTrack: Track | null;
  queue: Track[];
  globalSongs: Track[];
  globalAlbums: Album[];
  globalPlaylists: Playlist[];
  forYouSongs: Track[];
  isPlaying: boolean;
  isExpanded: boolean;
  selectedAlbum: Album | null;
  selectedPlaylist: Playlist | null;
  progress: number;
  volume: number;
  reactions: MusicReaction[];
  likedSongIds: Set<string | number>;
  unlikedSongIds: Set<string | number>;
  downloadedSongIds: Set<string | number>;
  likedCollectionIds: Set<string | number>; 
  likedTracks: Track[];
  userPlaylists: Playlist[];
  userSongs: Track[];
  userAlbums: Album[];
  isCreatePlaylistOpen: boolean;
  trackForNewPlaylist: Track | null;
  trackStats: Record<string | number, { likes: number; unlikes: number }>;
  isAdPortalOpen: boolean;
  adDuration: number;
  adUrl: string;
  triggerDownloadWithAd: (type: 'single' | 'album' | 'reel', task: () => Promise<void>) => void;
  onAdComplete: () => void;
  isCaptureStudioOpen: boolean;
  captureTrack: Track | null;
  openCaptureStudio: (track?: Track) => void;
  closeCaptureStudio: () => void;
  setCaptureTrack: (track: Track | null) => void;
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
  clearPlayer: () => void;
  toggleLike: (track: Track) => void;
  toggleUnlike: (track: Track) => void;
  toggleCollectionLike: (id: string | number) => void;
  simulateDownload: (track: Track) => Promise<void>;
  isTrackLiked: (trackId: string | number) => boolean;
  isTrackUnliked: (trackId: string | number) => boolean;
  isTrackDownloaded: (trackId: string | number) => boolean;
  isCollectionLiked: (id: string | number) => boolean;
  playCollection: (tracks: Track[], startIndex?: number) => void;
  addToQueue: (track: Track) => void;
  publishTrack: (track: any) => Promise<void>;
  publishAlbum: (album: Album) => Promise<void>;
  deleteUserTrack: (trackId: string | number) => void;
  deleteUserAlbum: (albumId: string | number) => void;
  openCreatePlaylist: (firstTrack?: Track) => void;
  closeCreatePlaylist: () => void;
  confirmCreatePlaylist: (data: { title: string; description: string; isPrivate: boolean; cover?: string }) => Promise<void>;
  addTrackToPlaylist: (playlistId: string | number, track: Track) => void;
  triggerHaptic: (intensity?: number) => void;
  refreshMusicVault: () => Promise<void>;
  recordSongStream: (songId: string | number) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const MOCK_SONGS: Track[] = [
  { id: 's1', title: "Midnight Pulse", artist: "Alex Rivera", artistUsername: "arivera", cover: "https://picsum.photos/seed/s1/600/600", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", duration: 180, streams: "14.2k", likes: 1204, unlikes: 2 },
  { id: 's2', title: "Cyber Horizon", artist: "Sarah Chen", artistUsername: "schen_dev", cover: "https://picsum.photos/seed/s2/600/600", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", duration: 210, streams: "8.5k", likes: 845, unlikes: 0 },
  { id: 's3', title: "Spatial Echo", artist: "Marcus Stone", artistUsername: "mstone", cover: "https://picsum.photos/seed/s3/600/600", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", duration: 195, streams: "4.1k", likes: 320, unlikes: 5 },
  { id: 's4', title: "Binary Vibe", artist: "Elena Gilbert", artistUsername: "elena_g", cover: "https://picsum.photos/seed/s4/600/600", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", duration: 165, streams: "2.8k", likes: 150, unlikes: 1 }
];

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrackState] = useState<Track | null>(null);
  const [globalSongs, setGlobalSongsState] = useState<Track[]>(MOCK_SONGS);
  const [globalAlbums, setGlobalAlbumsState] = useState<Album[]>([]);
  const [globalPlaylists, setGlobalPlaylistsState] = useState<Playlist[]>([]);
  const [queue, setQueueState] = useState<Track[]>(MOCK_SONGS);
  const [isPlaying, setIsPlayingState] = useState(false);
  const [isExpanded, setIsExpandedState] = useState(false);
  const [selectedAlbum, setSelectedAlbumState] = useState<Album | null>(null);
  const [selectedPlaylist, setSelectedPlaylistState] = useState<Playlist | null>(null);
  const [progress, setProgressState] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [reactions, setReactionsState] = useState<MusicReaction[]>([]);
  const [isAdPortalOpen, setIsAdPortalOpenState] = useState(false);
  const [adDuration] = useState(30);
  const [pendingDownloadTask, setPendingDownloadTask] = useState<(() => Promise<void>) | null>(null);
  const [isCaptureStudioOpen, setIsCaptureStudioOpenState] = useState(false);
  const [captureTrack, setCaptureTrackState] = useState<Track | null>(null);
  const [likedSongIds, setLikedSongIdsState] = useState<Set<string | number>>(new Set());
  const [unlikedSongIds, setUnlikedSongIdsState] = useState<Set<string | number>>(new Set());
  const [downloadedSongIds, setDownloadedSongIdsState] = useState<Set<string | number>>(new Set());
  const [likedCollectionIds, setLikedCollectionIdsState] = useState<Set<string | number>>(new Set());
  const [trackStats, setTrackStatsState] = useState<Record<string | number, { likes: number; unlikes: number }>>({});
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpenState] = useState(false);
  const [trackForNewPlaylist, setTrackForNewPlaylistState] = useState<Track | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(intensity);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume / 100;
    }
    const audio = audioRef.current;
    const handleTimeUpdate = () => setProgressState(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    const handleEnded = () => nextTrack();
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack?.audioUrl) return;
    if (audioRef.current.src !== currentTrack.audioUrl) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
    }
    if (isPlaying) audioRef.current.play().catch(() => {});
    else audioRef.current.pause();
  }, [currentTrack, isPlaying]);

  const nextTrack = useCallback(() => {
    const idx = queue.findIndex(t => t.id === currentTrack?.id);
    const nextIdx = (idx + 1) % queue.length;
    setCurrentTrackState(queue[nextIdx]);
    setIsPlayingState(true);
  }, [queue, currentTrack]);

  const prevTrack = useCallback(() => {
    const idx = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIdx = (idx - 1 + queue.length) % queue.length;
    setCurrentTrackState(queue[prevIdx]);
    setIsPlayingState(true);
  }, [queue, currentTrack]);

  const value = {
    currentTrack, queue, globalSongs, globalAlbums, globalPlaylists,
    forYouSongs: MOCK_SONGS, 
    isPlaying, isExpanded, selectedAlbum, selectedPlaylist, progress, volume, reactions,
    likedSongIds, unlikedSongIds, downloadedSongIds, likedCollectionIds,
    likedTracks: MOCK_SONGS.filter(s => likedSongIds.has(s.id)),
    userPlaylists: [], userSongs: [], userAlbums: [],
    isCreatePlaylistOpen, trackForNewPlaylist, trackStats,
    isAdPortalOpen, adDuration, adUrl: "https://www.effectivegatecpm.com/kry1iawb",
    triggerDownloadWithAd: (type: any, task: any) => { setIsAdPortalOpenState(true); setPendingDownloadTask(() => task); },
    onAdComplete: () => { setIsAdPortalOpenState(false); if(pendingDownloadTask) pendingDownloadTask(); setPendingDownloadTask(null); },
    isCaptureStudioOpen, captureTrack,
    openCaptureStudio: (t?: Track) => { setCaptureTrackState(t || null); setIsCaptureStudioOpenState(true); },
    closeCaptureStudio: () => setIsCaptureStudioOpenState(false),
    setCaptureTrack: setCaptureTrackState,
    setTrack: (t: Track) => { setCurrentTrackState(t); setIsPlayingState(true); setIsExpandedState(true); },
    togglePlay: () => setIsPlayingState(prev => !prev),
    nextTrack, prevTrack, 
    setIsExpanded: setIsExpandedState, 
    setSelectedAlbum: setSelectedAlbumState, 
    setSelectedPlaylist: setSelectedPlaylistState, 
    setProgress: (p: number) => { setProgressState(p); if(audioRef.current) audioRef.current.currentTime = (p/100) * audioRef.current.duration; },
    setVolume: (v: number) => { setVolumeState(v); if(audioRef.current) audioRef.current.volume = v/100; },
    addReaction: (emoji: string) => {
      const id = Date.now();
      setReactionsState(prev => [...prev, { id, emoji, x: Math.random() * 80 + 10 }]);
      setTimeout(() => setReactionsState(prev => prev.filter(r => r.id !== id)), 2000);
    },
    clearPlayer: () => { setIsPlayingState(false); setCurrentTrackState(null); },
    toggleLike: (t: Track) => setLikedSongIdsState(prev => { const n = new Set(prev); if(n.has(t.id)) n.delete(t.id); else n.add(t.id); return n; }),
    toggleUnlike: (t: Track) => setUnlikedSongIdsState(prev => { const n = new Set(prev); if(n.has(t.id)) n.delete(t.id); else n.add(t.id); return n; }),
    toggleCollectionLike: (id: any) => setLikedCollectionIdsState(prev => { const n = new Set(prev); if(n.has(id)) n.delete(id); else n.add(id); return n; }),
    simulateDownload: async (t: Track) => { setDownloadedSongIdsState(prev => new Set(prev).add(t.id)); },
    isTrackLiked: (id: any) => likedSongIds.has(id),
    isTrackUnliked: (id: any) => unlikedSongIds.has(id),
    isTrackDownloaded: (id: any) => downloadedSongIds.has(id),
    isCollectionLiked: (id: any) => likedCollectionIds.has(id),
    playCollection: (ts: Track[]) => { setQueueState(ts); setCurrentTrackState(ts[0]); setIsPlayingState(true); setIsExpandedState(true); },
    addToQueue: (t: Track) => setQueueState(prev => [...prev, t]),
    publishTrack: async () => {}, publishAlbum: async () => {}, deleteUserTrack: () => {}, deleteUserAlbum: () => {},
    openCreatePlaylist: (t?: Track) => { setTrackForNewPlaylistState(t || null); setIsCreatePlaylistOpenState(true); },
    closeCreatePlaylist: () => setIsCreatePlaylistOpenState(false),
    confirmCreatePlaylist: async () => { setIsCreatePlaylistOpenState(false); },
    addTrackToPlaylist: () => {}, triggerHaptic, refreshMusicVault: async () => {}, recordSongStream: async () => {}
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within a MusicProvider');
  return context;
}
