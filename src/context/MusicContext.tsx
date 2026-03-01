
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { saveFileToDevice } from '@/lib/utils';
import { databases, APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, ALBUMS_COLLECTION_ID, PLAYLISTS_COLLECTION_ID, Query } from '@/lib/appwrite';

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
  artistFollowers?: string | number;
  cover: string;
  duration: number; 
  streams?: string;
  likes?: number;
  unlikes?: number;
  comments?: Comment[];
  isBoosted?: boolean;
  boostTargetViews?: number;
  boostCurrentViews?: number;
  boostExpiry?: number;
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
  addComment: (text: string) => void;
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
  publishTrack: (track: Track) => void;
  publishAlbum: (album: Album) => void;
  deleteUserTrack: (trackId: string | number) => void;
  deleteUserAlbum: (albumId: string | number) => void;
  openCreatePlaylist: (firstTrack?: Track) => void;
  closeCreatePlaylist: () => void;
  confirmCreatePlaylist: (data: { title: string; description: string; isPrivate: boolean; cover?: string }) => void;
  addTrackToPlaylist: (playlistId: string | number, track: Track) => void;
  boostTrack: (trackId: string | number, targetViews: number, durationDays: number) => void;
  triggerHaptic: (intensity?: number) => void;
  refreshMusicVault: () => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const AD_URL = "https://www.effectivegatecpm.com/kry1iawb?key=8a705428be9dbe8fbb378f0520fdba4d";

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [globalSongs, setGlobalSongs] = useState<Track[]>([]);
  const [globalAlbums, setGlobalAlbums] = useState<Album[]>([]);
  const [globalPlaylists, setGlobalPlaylists] = useState<Playlist[]>([]);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const [reactions, setReactions] = useState<MusicReaction[]>([]);
  const [isAdPortalOpen, setIsAdPortalOpen] = useState(false);
  const [adDuration, setAdDuration] = useState(30);
  const [pendingDownloadTask, setPendingDownloadTask] = useState<(() => Promise<void>) | null>(null);
  const [isCaptureStudioOpen, setIsCaptureStudioOpen] = useState(false);
  const [captureTrack, setCaptureTrack] = useState<Track | null>(null);
  const [likedSongIds, setLikedSongIds] = useState<Set<string | number>>(new Set());
  const [unlikedSongIds, setUnlikedSongIds] = useState<Set<string | number>>(new Set());
  const [downloadedSongIds, setDownloadedSongIds] = useState<Set<string | number>>(new Set());
  const [likedCollectionIds, setLikedCollectionIds] = useState<Set<string | number>>(new Set());
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [userSongs, setUserSongs] = useState<Track[]>([]);
  const [userAlbums, setUserAlbums] = useState<Album[]>([]);
  const [trackStats, setTrackStats] = useState<Record<string | number, { likes: number; unlikes: number }>>({});
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [trackForNewPlaylist, setTrackForNewPlaylist] = useState<Track | null>(null);

  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(intensity);
    }
  }, []);

  const refreshMusicVault = useCallback(async () => {
    try {
      const [songDocs, albumDocs, playlistDocs] = await Promise.all([
        databases.listDocuments(APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, [Query.limit(100)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, ALBUMS_COLLECTION_ID, [Query.limit(50)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, PLAYLISTS_COLLECTION_ID, [Query.limit(50)])
      ]);

      const songs = songDocs.documents.map(d => ({
        id: d.$id,
        title: d.title,
        artist: d.artist,
        cover: d.cover,
        duration: d.duration || 180,
        streams: d.streams || "0",
        likes: d.likes || 0,
        unlikes: d.unlikes || 0,
        artistUsername: d.artistUsername,
        artistFollowers: d.artistFollowers
      } as Track));

      const albums = albumDocs.documents.map(d => ({
        id: d.$id,
        title: d.title,
        artist: d.artist,
        cover: d.cover,
        year: d.year || "2024",
        tracks: d.tracks || 0,
        totalStreams: d.totalStreams || "0",
        songs: [] // To be populated if needed
      } as Album));

      const playlists = playlistDocs.documents.map(d => ({
        id: d.$id,
        title: d.title,
        creator: d.creator,
        cover: d.cover,
        totalStreams: d.totalStreams || "0",
        songs: d.songs ? JSON.parse(d.songs) : []
      } as Playlist));

      setGlobalSongs(songs);
      setGlobalAlbums(albums);
      setGlobalPlaylists(playlists);
      if (queue.length === 0) setQueue(songs);
    } catch (e) {
      console.error("Music vault handshake failed:", e);
    }
  }, [queue.length]);

  useEffect(() => {
    refreshMusicVault();
    const savedLikes = localStorage.getItem('vimore_liked_tracks');
    const savedUnlikes = localStorage.getItem('vimore_unliked_ids');
    const savedDownloads = localStorage.getItem('vimore_downloaded_ids');
    const savedCollLikes = localStorage.getItem('vimore_liked_collections');
    const savedPlaylists = localStorage.getItem('vimore_user_playlists');
    const savedUserSongs = localStorage.getItem('vimore_user_songs');
    const savedUserAlbums = localStorage.getItem('vimore_user_albums');
    const savedStats = localStorage.getItem('vimore_track_stats');
    
    if (savedLikes) {
      try {
        const parsedLikes = JSON.parse(savedLikes) as Track[];
        setLikedTracks(parsedLikes);
        setLikedSongIds(new Set(parsedLikes.map(t => t.id)));
      } catch (e) {}
    }
    if (savedUnlikes) try { setUnlikedSongIds(new Set(JSON.parse(savedUnlikes))); } catch (e) {}
    if (savedDownloads) try { setDownloadedSongIds(new Set(JSON.parse(savedDownloads))); } catch (e) {}
    if (savedCollLikes) try { setLikedCollectionIds(new Set(JSON.parse(savedCollLikes))); } catch (e) {}
    if (savedPlaylists) try { setUserPlaylists(JSON.parse(savedPlaylists)); } catch (e) {}
    if (savedUserSongs) try { setUserSongs(JSON.parse(savedUserSongs)); } catch (e) {}
    if (savedUserAlbums) try { setUserAlbums(JSON.parse(savedUserAlbums)); } catch (e) {}
    if (savedStats) try { setTrackStats(JSON.parse(savedStats)); } catch (e) {}
  }, [refreshMusicVault]);

  useEffect(() => { localStorage.setItem('vimore_liked_tracks', JSON.stringify(likedTracks)); }, [likedTracks]);
  useEffect(() => { localStorage.setItem('vimore_unliked_ids', JSON.stringify(Array.from(unlikedSongIds))); }, [unlikedSongIds]);
  useEffect(() => { localStorage.setItem('vimore_downloaded_ids', JSON.stringify(Array.from(downloadedSongIds))); }, [downloadedSongIds]);
  useEffect(() => { localStorage.setItem('vimore_liked_collections', JSON.stringify(Array.from(likedCollectionIds))); }, [likedCollectionIds]);
  useEffect(() => { localStorage.setItem('vimore_user_playlists', JSON.stringify(userPlaylists)); }, [userPlaylists]);
  useEffect(() => { localStorage.setItem('vimore_user_songs', JSON.stringify(userSongs)); }, [userSongs]);
  useEffect(() => { localStorage.setItem('vimore_user_albums', JSON.stringify(userAlbums)); }, [userAlbums]);
  useEffect(() => { localStorage.setItem('vimore_track_stats', JSON.stringify(trackStats)); }, [trackStats]);

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

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    triggerHaptic(10);
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    setCurrentTrack(queue[nextIndex]);
    setProgress(0);
    setIsPlaying(true);
  }, [queue, currentTrack, triggerHaptic]);

  useEffect(() => {
    if (progress >= 100 && isPlaying) nextTrack();
  }, [progress, isPlaying, nextTrack]);

  const setTrack = (track: Track) => {
    triggerHaptic(15);
    if (!queue.some(t => t.id === track.id)) setQueue([track, ...queue.filter(t => t.id !== track.id)]);
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    setReactions([]);
    setIsExpanded(true); 
  };

  const addToQueue = (track: Track) => {
    triggerHaptic(5);
    if (!queue.some(t => t.id === track.id)) setQueue(prev => [...prev, track]);
  };

  const playCollection = (tracks: Track[], startIndex: number = 0) => {
    triggerHaptic(20);
    if (tracks.length === 0) return;
    setQueue(tracks);
    const track = tracks[startIndex];
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    setReactions([]);
    setIsExpanded(true);
  };

  const togglePlay = () => { triggerHaptic(10); setIsPlaying(!isPlaying); };

  const prevTrack = () => {
    if (queue.length === 0) return;
    triggerHaptic(10);
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    setCurrentTrack(queue[prevIndex]);
    setProgress(0);
    setIsPlaying(true);
  };

  const toggleLike = (track: Track) => {
    const trackId = track.id;
    const isCurrentlyLiked = likedSongIds.has(trackId);
    const isCurrentlyUnliked = unlikedSongIds.has(trackId);
    triggerHaptic(isCurrentlyLiked ? 5 : 25);
    if (isCurrentlyLiked) {
      setLikedSongIds(prev => { const n = new Set(prev); n.delete(trackId); return n; });
      setLikedTracks(prev => prev.filter(t => t.id !== trackId));
      setTrackStats(prev => ({ ...prev, [trackId]: { ...prev[trackId], likes: Math.max(0, (prev[trackId]?.likes || 0) - 1) } }));
    } else {
      setLikedSongIds(prev => { const n = new Set(prev); n.add(trackId); return n; });
      setLikedTracks(prev => [track, ...prev]);
      setTrackStats(prev => {
        const current = prev[trackId] || { likes: 0, unlikes: 0 };
        return { ...prev, [trackId]: { ...current, likes: current.likes + 1, unlikes: isCurrentlyUnliked ? Math.max(0, current.unlikes - 1) : current.unlikes } };
      });
      if (isCurrentlyUnliked) setUnlikedSongIds(prev => { const n = new Set(prev); n.delete(trackId); return n; });
    }
  };

  const toggleUnlike = (track: Track) => {
    const trackId = track.id;
    const isCurrentlyUnliked = unlikedSongIds.has(trackId);
    const isCurrentlyLiked = likedSongIds.has(trackId);
    triggerHaptic(isCurrentlyUnliked ? 5 : 15);
    if (isCurrentlyUnliked) {
      setUnlikedSongIds(prev => { const n = new Set(prev); n.delete(trackId); return n; });
      setTrackStats(prev => ({ ...prev, [trackId]: { ...prev[trackId], unlikes: Math.max(0, (prev[trackId]?.unlikes || 0) - 1) } }));
    } else {
      setUnlikedSongIds(prev => { const n = new Set(prev); n.add(trackId); return n; });
      setTrackStats(prev => {
        const current = prev[trackId] || { likes: 0, unlikes: 0 };
        return { ...prev, [trackId]: { ...current, unlikes: current.unlikes + 1, likes: isCurrentlyLiked ? Math.max(0, current.likes - 1) : current.likes } };
      });
      if (isCurrentlyLiked) {
        setLikedSongIds(prev => { const n = new Set(prev); n.delete(trackId); return n; });
        setLikedTracks(prev => prev.filter(t => t.id !== trackId));
      }
    }
  };

  const toggleCollectionLike = (id: string | number) => {
    triggerHaptic(20);
    setLikedCollectionIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const simulateDownload = async (track: Track) => {
    if (downloadedSongIds.has(track.id)) return;
    triggerHaptic(10);
    try {
      await saveFileToDevice('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', `vimore_sonic_${track.id}.mp3`);
      setDownloadedSongIds(prev => { const n = new Set(prev); n.add(track.id); return n; });
    } catch (e) {
      console.error("Binary Archival Failed:", e);
    }
  };

  const triggerDownloadWithAd = (type: 'single' | 'album' | 'reel', task: () => Promise<void>) => {
    triggerHaptic(15);
    setAdDuration(30); 
    setPendingDownloadTask(() => task);
    setIsAdPortalOpen(true);
  };

  const onAdComplete = useCallback(() => {
    setIsAdPortalOpen(false);
    if (pendingDownloadTask) {
      pendingDownloadTask().catch(console.error);
      setPendingDownloadTask(null);
    }
  }, [pendingDownloadTask]);

  const isTrackLiked = (trackId: string | number) => likedSongIds.has(trackId);
  const isTrackUnliked = (trackId: string | number) => unlikedSongIds.has(trackId);
  const isTrackDownloaded = (trackId: string | number) => downloadedSongIds.has(trackId);
  const isCollectionLiked = (id: string | number) => likedCollectionIds.has(id);

  const publishTrack = (track: Track) => { setUserSongs(prev => [track, ...prev]); setTrackStats(prev => ({ ...prev, [track.id]: { likes: 0, unlikes: 0 } })); };
  const publishAlbum = (album: Album) => {
    setUserAlbums(prev => [album, ...prev]);
    const newStats = { ...trackStats };
    album.songs.forEach(s => { newStats[s.id] = { likes: 0, unlikes: 0 }; });
    setTrackStats(newStats);
  };

  const deleteUserTrack = (trackId: string | number) => { setUserSongs(prev => prev.filter(t => t.id !== trackId)); setTrackStats(prev => { const next = { ...prev }; delete next[trackId]; return next; }); };
  const deleteUserAlbum = (albumId: string | number) => { setUserAlbums(prev => prev.filter(a => a.id !== albumId)); };

  const boostTrack = (trackId: string | number, targetViews: number, durationDays: number) => {
    setUserSongs(prev => prev.map(t => {
      if (t.id === trackId) {
        return {
          ...t,
          isBoosted: true,
          boostTargetViews: targetViews,
          boostCurrentViews: 0,
          boostExpiry: Date.now() + (durationDays * 24 * 60 * 60 * 1000)
        };
      }
      return t;
    }));
  };

  const openCreatePlaylist = (track?: Track) => { triggerHaptic(10); setTrackForNewPlaylist(track || null); setIsCreatePlaylistOpen(true); };
  const closeCreatePlaylist = () => { setIsCreatePlaylistOpen(false); setTrackForNewPlaylist(null); };
  const confirmCreatePlaylist = (data: { title: string; description: string; isPrivate: boolean; cover?: string }) => {
    triggerHaptic(30);
    const newPlaylist: Playlist = { id: Date.now(), title: data.title, description: data.description, isPrivate: data.isPrivate, creator: "John Doe", cover: data.cover || trackForNewPlaylist?.cover || "https://picsum.photos/seed/playlist/400/400", totalStreams: "0", songs: trackForNewPlaylist ? [trackForNewPlaylist] : [] };
    setUserPlaylists(prev => [newPlaylist, ...prev]);
    closeCreatePlaylist();
  };

  const addTrackToPlaylist = (playlistId: string | number, track: Track) => { triggerHaptic(15); setUserPlaylists(prev => prev.map(p => { if (p.id === playlistId) { if (p.songs.some(s => s.id === track.id)) return p; return { ...p, songs: [...p.songs, track] }; } return p; })); };

  const addReaction = (emoji: string) => {
    triggerHaptic(5);
    const id = Date.now();
    const newReaction = { id, emoji, x: Math.random() * 80 + 10 };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(() => setReactions((prev) => prev.filter((r) => r.id !== id)), 2500);
  };

  const addComment = (text: string) => {
    if (!currentTrack || !text.trim()) return;
    triggerHaptic(10);
    const newComment: Comment = { id: Date.now(), user: "John Doe", avatar: "https://picsum.photos/seed/me/100/100", text, time: "Just now" };
    setCurrentTrack({ ...currentTrack, comments: [newComment, ...(currentTrack.comments || [])] });
  };

  const clearPlayer = () => { triggerHaptic(5); setIsPlaying(false); setCurrentTrack(null); setIsExpanded(false); setProgress(0); };
  const openCaptureStudio = (track?: Track) => { triggerHaptic(25); setCaptureTrack(track || null); setIsCaptureStudioOpen(true); };
  const closeCaptureStudio = () => { triggerHaptic(10); setIsCaptureStudioOpen(false); setCaptureTrack(null); };

  return (
    <MusicContext.Provider value={{
      currentTrack, queue, globalSongs, globalAlbums, globalPlaylists, isPlaying, isExpanded, selectedAlbum, selectedPlaylist, progress, volume, reactions, 
      likedSongIds, unlikedSongIds, downloadedSongIds, likedCollectionIds, likedTracks, userPlaylists, userSongs, userAlbums, trackStats,
      isAdPortalOpen, adDuration, adUrl: AD_URL, triggerDownloadWithAd, onAdComplete,
      isCreatePlaylistOpen, trackForNewPlaylist,
      isCaptureStudioOpen, captureTrack, openCaptureStudio, closeCaptureStudio, setCaptureTrack,
      setTrack, togglePlay, nextTrack, prevTrack, setIsExpanded, setSelectedAlbum, setSelectedPlaylist, setProgress, setVolume, addReaction, addComment, clearPlayer, 
      toggleLike, toggleUnlike, toggleCollectionLike, simulateDownload, isTrackLiked, isTrackUnliked, isTrackDownloaded, isCollectionLiked,
      playCollection, addToQueue, publishTrack, publishAlbum, deleteUserTrack, deleteUserAlbum, boostTrack,
      openCreatePlaylist, closeCreatePlaylist, confirmCreatePlaylist, addTrackToPlaylist, triggerHaptic, refreshMusicVault
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
