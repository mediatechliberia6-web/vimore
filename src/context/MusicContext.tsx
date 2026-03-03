
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef } from 'react';
import { saveFileToDevice } from '@/lib/utils';
import { databases, APPWRITE_BUCKET_ID, APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, ALBUMS_COLLECTION_ID, PLAYLISTS_COLLECTION_ID, Query, ID, storage } from '@/lib/appwrite';

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
  audioUrl?: string; 
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
  publishTrack: (track: any) => Promise<void>;
  publishAlbum: (album: Album) => Promise<void>;
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

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current && typeof window !== 'undefined') {
      audioRef.current = new Audio();
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

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
        audioUrl: d.audioUrl,
        duration: d.duration || 180,
        streams: d.streams || "0",
        likes: d.likes || 0,
        unlikes: d.unlikes || 0,
        artistUsername: d.artistUsername,
        artistFollowers: d.artistFollowers,
        isBoosted: d.isBoosted,
        boostTargetViews: d.boostTargetViews,
        boostCurrentViews: d.boostCurrentViews
      } as Track));

      const albums = albumDocs.documents.map(d => ({
        id: d.$id,
        title: d.title,
        artist: d.artist,
        cover: d.cover,
        year: d.year || "2024",
        tracks: d.tracks || 0,
        totalStreams: d.totalStreams || "0",
        songs: [] 
      } as Album));

      const playlists = playlistDocs.documents.map(d => ({
        id: d.$id,
        title: d.title,
        creator: d.creator,
        cover: d.cover,
        totalStreams: d.totalStreams || "0",
        songs: d.songs ? JSON.parse(d.songs) : [],
        description: d.description,
        isPrivate: d.isPrivate
      } as Playlist));

      setGlobalSongs(songs);
      setGlobalAlbums(albums);
      setGlobalPlaylists(playlists);
      
      const statsMap: Record<string | number, { likes: number; unlikes: number }> = {};
      songs.forEach(s => { statsMap[s.id] = { likes: s.likes || 0, unlikes: s.unlikes || 0 }; });
      setTrackStats(statsMap);

      if (queue.length === 0) setQueue(songs);
    } catch (e) {
      console.error("Music vault handshake failed:", e);
    }
  }, [queue.length]);

  useEffect(() => {
    refreshMusicVault();
  }, [refreshMusicVault]);

  useEffect(() => {
    if (!audioRef.current || !currentTrack?.audioUrl) return;
    if (audioRef.current.src !== currentTrack.audioUrl) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
    }
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Sonic engine stall:", e));
    } else {
      audioRef.current.pause();
    }
  }, [currentTrack, isPlaying]);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    triggerHaptic(10);
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    setCurrentTrack(queue[nextIndex]);
    setProgress(0);
    setIsPlaying(true);
  }, [queue, currentTrack, triggerHaptic]);

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

  const togglePlay = () => { 
    triggerHaptic(10); 
    setIsPlaying(!isPlaying); 
  };

  const prevTrack = () => {
    if (queue.length === 0) return;
    triggerHaptic(10);
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    setCurrentTrack(queue[prevIndex]);
    setProgress(0);
    setIsPlaying(true);
  };

  const toggleLike = async (track: Track) => {
    const trackId = track.id;
    const isCurrentlyLiked = likedSongIds.has(trackId);
    triggerHaptic(15);
    try {
      const newLikes = isCurrentlyLiked ? Math.max(0, (track.likes || 0) - 1) : (track.likes || 0) + 1;
      await databases.updateDocument(APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, trackId as string, { likes: newLikes });
      setLikedSongIds(prev => { const n = new Set(prev); if (n.has(trackId)) n.delete(trackId); else n.add(trackId); return n; });
      await refreshMusicVault();
    } catch (e) {}
  };

  const toggleUnlike = async (track: Track) => {
    const trackId = track.id;
    const isCurrentlyUnliked = unlikedSongIds.has(trackId);
    triggerHaptic(10);
    try {
      const newUnlikes = isCurrentlyUnliked ? Math.max(0, (track.unlikes || 0) - 1) : (track.unlikes || 0) + 1;
      await databases.updateDocument(APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, trackId as string, { unlikes: newUnlikes });
      setUnlikedSongIds(prev => { const n = new Set(prev); if (n.has(trackId)) n.delete(trackId); else n.add(trackId); return n; });
      await refreshMusicVault();
    } catch (e) {}
  };

  const toggleCollectionLike = (id: string | number) => {
    triggerHaptic(20);
    setLikedCollectionIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const simulateDownload = async (track: Track) => {
    if (downloadedSongIds.has(track.id)) return;
    triggerHaptic(10);
    if (track.audioUrl) {
      await saveFileToDevice(track.audioUrl, `vimore_sonic_${track.id}.mp3`);
      setDownloadedSongIds(prev => { const n = new Set(prev); n.add(track.id); return n; });
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

  const publishTrack = async (newTrack: any) => {
    const docData = {
      title: newTrack.title,
      artist: newTrack.artist,
      artistUsername: newTrack.artistUsername,
      cover: newTrack.cover,
      audioUrl: newTrack.audioUrl,
      duration: newTrack.duration,
      streams: "0",
      likes: 0,
      unlikes: 0,
      artistFollowers: String(newTrack.artistFollowers || 0)
    };
    await databases.createDocument(APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, ID.unique(), docData);
    await refreshMusicVault();
  };

  const publishAlbum = async (albumData: Album) => {
    const docData = {
      title: albumData.title,
      artist: albumData.artist,
      artistUsername: albumData.artistUsername,
      cover: albumData.cover,
      year: albumData.year,
      tracks: albumData.tracks,
      totalStreams: "0"
    };
    await databases.createDocument(APPWRITE_DATABASE_ID, ALBUMS_COLLECTION_ID, ID.unique(), docData);
    await refreshMusicVault();
  };

  const deleteUserTrack = (trackId: string | number) => { 
    databases.deleteDocument(APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, trackId as string).then(() => {
      refreshMusicVault();
    });
  };

  const deleteUserAlbum = (albumId: string | number) => { 
    databases.deleteDocument(APPWRITE_DATABASE_ID, ALBUMS_COLLECTION_ID, albumId as string).then(() => {
      refreshMusicVault();
    });
  };

  const boostTrack = (trackId: string | number, targetViews: number, durationDays: number) => {
    databases.updateDocument(APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, trackId as string, {
      isBoosted: true,
      boostTargetViews: targetViews,
      boostCurrentViews: 0,
      boostExpiry: Date.now() + (durationDays * 24 * 60 * 60 * 1000)
    }).then(() => refreshMusicVault());
  };

  const openCreatePlaylist = (track?: Track) => { triggerHaptic(10); setTrackForNewPlaylist(track || null); setIsCreatePlaylistOpen(true); };
  const closeCreatePlaylist = () => { setIsCreatePlaylistOpen(false); setTrackForNewPlaylist(null); };
  const confirmCreatePlaylist = (data: { title: string; description: string; isPrivate: boolean; cover?: string }) => {
    triggerHaptic(30);
    databases.createDocument(APPWRITE_DATABASE_ID, PLAYLISTS_COLLECTION_ID, ID.unique(), {
      title: data.title,
      creator: "John Doe",
      cover: data.cover || trackForNewPlaylist?.cover || "https://picsum.photos/seed/playlist/400/400",
      totalStreams: "0",
      songs: JSON.stringify(trackForNewPlaylist ? [trackForNewPlaylist] : []),
      isPrivate: data.isPrivate,
      description: data.description
    }).then(() => {
      refreshMusicVault();
      closeCreatePlaylist();
    });
  };

  const addTrackToPlaylist = (playlistId: string | number, track: Track) => { 
    triggerHaptic(15); 
    const playlist = globalPlaylists.find(p => p.id === playlistId);
    if (!playlist) return;
    const updatedSongs = [...playlist.songs, track];
    databases.updateDocument(APPWRITE_DATABASE_ID, PLAYLISTS_COLLECTION_ID, playlistId as string, {
      songs: JSON.stringify(updatedSongs)
    }).then(() => refreshMusicVault());
  };

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
