'use client';

/**
 * @fileOverview ViMore Sonic Context Node
 * Manages music playback, discovery, and studio publishing.
 * Synchronized with self-hosted Appwrite infrastructure.
 */

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef, useMemo } from 'react';
import { saveFileToDevice } from '@/lib/utils';
import client, { 
  databases, 
  APPWRITE_DATABASE_ID, 
  SONGS_COLLECTION_ID, 
  ALBUMS_COLLECTION_ID, 
  PLAYLISTS_COLLECTION_ID, 
  Query, 
  ID,
  BUCKET_MUSIC,
  BUCKET_IMAGES
} from '@/lib/appwrite';

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
  comments?: number; 
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
  boostTrack: (trackId: string | number, targetViews: number, durationDays: number) => void;
  triggerHaptic: (intensity?: number) => void;
  refreshMusicVault: () => Promise<void>;
  recordSongStream: (songId: string | number) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const AD_URL = "https://www.effectivegatecpm.com/kry1iawb?key=8a705428be9dbe8fbb378f0520fdba4d";

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrackState] = useState<Track | null>(null);
  const [globalSongs, setGlobalSongsState] = useState<Track[]>([]);
  const [globalAlbums, setGlobalAlbumsState] = useState<Album[]>([]);
  const [globalPlaylists, setGlobalPlaylistsState] = useState<Playlist[]>([]);
  const [queue, setQueueState] = useState<Track[]>([]);
  const [isPlaying, setIsPlayingState] = useState(false);
  const [isExpanded, setIsExpandedState] = useState(false);
  const [selectedAlbum, setSelectedAlbumState] = useState<Album | null>(null);
  const [selectedPlaylist, setSelectedPlaylistState] = useState<Playlist | null>(null);
  const [progress, setProgressState] = useState(0);
  const [volume, setVolumeState] = useState(80);
  const [reactions, setReactionsState] = useState<MusicReaction[]>([]);
  const [isAdPortalOpen, setIsAdPortalOpenState] = useState(false);
  const [adDuration, setAdDurationState] = useState(30);
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

  const refreshMusicVault = useCallback(async () => {
    try {
      const [songDocs, albumDocs, playlistDocs] = await Promise.all([
        databases.listDocuments(APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, [Query.limit(100)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, ALBUMS_COLLECTION_ID, [Query.limit(50)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, PLAYLISTS_COLLECTION_ID, [Query.limit(50)])
      ]);

      const now = Date.now();

      const songs = songDocs.documents.map(d => {
        let isBoosted = d.isBoosted || false;
        
        if (isBoosted) {
          const hasExpired = d.boostExpiry && d.boostExpiry < now;
          const hasReachedLimit = d.boostCurrentViews >= (d.boostTargetViews || 1);
          
          if (hasExpired || hasReachedLimit) {
            isBoosted = false;
            databases.updateDocument(APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, d.$id, { isBoosted: false });
          }
        }

        return {
          id: d.$id,
          title: d.title,
          artist: d.artist,
          cover: d.cover,
          audioUrl: d.audioUrl,
          duration: d.duration || 180,
          streams: d.streams || "0",
          likes: d.likes || 0,
          unlikes: d.unlikes || 0,
          comments: d.comments || 0,
          artistUsername: d.artistUsername,
          artistFollowers: d.artistFollowers,
          isBoosted,
          boostTargetViews: d.boostTargetViews,
          boostCurrentViews: d.boostCurrentViews,
          boostExpiry: d.boostExpiry
        } as Track;
      }).sort((a, b) => (b.isBoosted ? 1 : 0) - (a.isBoosted ? 1 : 0));

      const albums = albumDocs.documents.map(d => ({
        id: d.$id,
        title: d.title,
        artist: d.artist,
        cover: d.cover,
        year: d.year || "2024",
        tracks: d.tracks || 0,
        totalStreams: d.totalStreams || "0",
        songs: d.songs ? JSON.parse(d.songs) : [] 
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

      setGlobalSongsState(songs);
      setGlobalAlbumsState(albums);
      setGlobalPlaylistsState(playlists);
      
      const statsMap: Record<string | number, { likes: number; unlikes: number }> = {};
      songs.forEach(s => { statsMap[s.id] = { likes: s.likes || 0, unlikes: s.unlikes || 0 }; });
      setTrackStatsState(statsMap);

      if (queue.length === 0) setQueueState(songs);
    } catch (e) {
      console.error("Music vault handshake failed:", e);
    }
  }, [queue.length]);

  const recordSongStream = useCallback(async (songId: string | number) => {
    try {
      const song = globalSongs.find(s => s.id === songId);
      if (!song) return;

      const currentStreams = parseInt(String(song.streams).replace(/,/g, '')) || 0;
      const newStreams = currentStreams + 1;
      const updates: any = { streams: newStreams.toString() };

      if (song.isBoosted) {
        const newBoostViews = (song.boostCurrentViews || 0) + 1;
        updates.boostCurrentViews = newBoostViews;
        if (newBoostViews >= (song.boostTargetViews || 1)) {
          updates.isBoosted = false;
        }
      }

      await databases.updateDocument(APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, songId as string, updates);
      
      setGlobalSongsState(prev => prev.map(s => s.id === songId ? { 
        ...s, 
        streams: newStreams.toString(),
        boostCurrentViews: updates.boostCurrentViews || s.boostCurrentViews,
        isBoosted: updates.isBoosted !== undefined ? updates.isBoosted : s.isBoosted
      } : s));
    } catch (e) {
      console.warn("Stream pulse rejected by vault.");
    }
  }, [globalSongs]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!audioRef.current) {
      try {
        audioRef.current = new Audio();
        audioRef.current.volume = volume / 100;
      } catch (e) {
        console.warn("Sonic engine initialization deferred.");
      }
    }

    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        const p = (audio.currentTime / audio.duration) * 100;
        setProgressState(p);
      }
    };

    const handleEnded = () => {
      nextTrack();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [volume]);

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
      recordSongStream(currentTrack.id);
    } else {
      audioRef.current.pause();
    }
  }, [currentTrack, isPlaying, recordSongStream]);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    triggerHaptic(10);
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    const track = queue[nextIndex];
    setCurrentTrackState(track);
    setProgressState(0);
    setIsPlayingState(true);
  }, [queue, currentTrack, triggerHaptic]);

  const prevTrack = useCallback(() => {
    if (queue.length === 0) return;
    triggerHaptic(10);
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    const track = queue[prevIndex];
    setCurrentTrackState(track);
    setProgressState(0);
    setIsPlayingState(true);
  }, [queue, currentTrack, triggerHaptic]);

  const setTrack = useCallback((track: Track) => {
    triggerHaptic(15);
    if (!queue.some(t => t.id === track.id)) setQueueState([track, ...queue.filter(t => t.id !== track.id)]);
    setCurrentTrackState(track);
    setIsPlayingState(true);
    setProgressState(0);
    setReactionsState([]);
    setIsExpandedState(true);
  }, [queue, triggerHaptic]);

  const addToQueue = useCallback((track: Track) => {
    triggerHaptic(5);
    if (!queue.some(t => t.id === track.id)) setQueueState(prev => [...prev, track]);
  }, [queue, triggerHaptic]);

  const playCollection = useCallback((tracks: Track[], startIndex: number = 0) => {
    triggerHaptic(20);
    if (tracks.length === 0) return;
    setQueueState(tracks);
    const track = tracks[startIndex];
    setCurrentTrackState(track);
    setIsPlayingState(true);
    setProgressState(0);
    setReactionsState([]);
    setIsExpandedState(true);
  }, [triggerHaptic]);

  const togglePlay = useCallback(() => { 
    triggerHaptic(10); 
    setIsPlayingState(prev => !prev); 
  }, [triggerHaptic]);

  const toggleLike = useCallback(async (track: Track) => {
    const trackId = track.id;
    const isCurrentlyLiked = likedSongIds.has(trackId);
    triggerHaptic(15);
    try {
      const newLikes = isCurrentlyLiked ? Math.max(0, (track.likes || 0) - 1) : (track.likes || 0) + 1;
      await databases.updateDocument(APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, trackId as string, { likes: newLikes });
      setLikedSongIdsState(prev => { const n = new Set(prev); if (n.has(trackId)) n.delete(trackId); else n.add(trackId); return n; });
      await refreshMusicVault();
    } catch (e) {}
  }, [likedSongIds, triggerHaptic, refreshMusicVault]);

  const toggleUnlike = useCallback(async (track: Track) => {
    const trackId = track.id;
    const isCurrentlyUnliked = unlikedSongIds.has(trackId);
    triggerHaptic(10);
    try {
      const newUnlikes = isCurrentlyUnliked ? Math.max(0, (track.unlikes || 0) - 1) : (track.unlikes || 0) + 1;
      await databases.updateDocument(APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, trackId as string, { unlikes: newUnlikes });
      setUnlikedSongIdsState(prev => { const n = new Set(prev); if (n.has(trackId)) n.delete(trackId); else n.add(trackId); return n; });
      await refreshMusicVault();
    } catch (e) {}
  }, [unlikedSongIds, triggerHaptic, refreshMusicVault]);

  const toggleCollectionLike = useCallback((id: string | number) => {
    triggerHaptic(20);
    setLikedCollectionIdsState(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }, [triggerHaptic]);

  const simulateDownload = useCallback(async (track: Track) => {
    if (downloadedSongIds.has(track.id)) return;
    triggerHaptic(10);
    if (track.audioUrl) {
      const success = await saveFileToDevice(track.audioUrl, `${track.artist} - ${track.title}.mp3`);
      if (success) {
        setDownloadedSongIdsState(prev => { const n = new Set(prev); n.add(track.id); return n; });
      }
    }
  }, [downloadedSongIds, triggerHaptic]);

  const triggerDownloadWithAd = useCallback((type: 'single' | 'album' | 'reel', task: () => Promise<void>) => {
    triggerHaptic(15);
    setAdDurationState(30); 
    setPendingDownloadTask(() => task);
    setIsAdPortalOpenState(true);
  }, [triggerHaptic]);

  const onAdComplete = useCallback(() => {
    setIsAdPortalOpenState(false);
    if (pendingDownloadTask) {
      pendingDownloadTask().catch(console.error);
      setPendingDownloadTask(null);
    }
  }, [pendingDownloadTask]);

  const publishTrack = useCallback(async (newTrack: any) => {
    try {
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
        comments: 0,
        isBoosted: false,
        artistFollowers: newTrack.artistFollowers || 0
      };
      await databases.createDocument(APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, ID.unique(), docData);
      await refreshMusicVault();
    } catch (e: any) {
      throw new Error(e.message);
    }
  }, [refreshMusicVault]);

  const publishAlbum = useCallback(async (albumData: Album) => {
    try {
      const docData = {
        title: albumData.title,
        artist: albumData.artist,
        artistUsername: albumData.artistUsername,
        cover: albumData.cover,
        year: albumData.year,
        tracks: albumData.tracks,
        totalStreams: "0",
        songs: JSON.stringify(albumData.songs)
      };
      await databases.createDocument(APPWRITE_DATABASE_ID, ALBUMS_COLLECTION_ID, ID.unique(), docData);
      await refreshMusicVault();
    } catch (e: any) {
      throw new Error(e.message);
    }
  }, [refreshMusicVault]);

  const deleteUserTrack = useCallback((trackId: string | number) => { 
    databases.deleteDocument(APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, trackId as string).then(() => {
      refreshMusicVault();
    });
  }, [refreshMusicVault]);

  const deleteUserAlbum = useCallback((albumId: string | number) => { 
    databases.deleteDocument(APPWRITE_DATABASE_ID, ALBUMS_COLLECTION_ID, albumId as string).then(() => {
      refreshMusicVault();
    });
  }, [refreshMusicVault]);

  const boostTrack = useCallback((trackId: string | number, targetViews: number, durationDays: number) => {
    databases.updateDocument(APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, trackId as string, {
      isBoosted: true,
      boostTargetViews: targetViews,
      boostCurrentViews: 0,
      boostExpiry: Date.now() + (durationDays * 24 * 60 * 60 * 1000)
    }).then(() => refreshMusicVault());
  }, [refreshMusicVault]);

  const confirmCreatePlaylist = useCallback(async (data: { title: string; description: string; isPrivate: boolean; cover?: string }) => {
    triggerHaptic(30);
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, PLAYLISTS_COLLECTION_ID, ID.unique(), {
        title: data.title,
        creator: "Guest",
        cover: data.cover || trackForNewPlaylist?.cover || "https://picsum.photos/seed/playlist/400/400",
        totalStreams: "0",
        songs: JSON.stringify(trackForNewPlaylist ? [trackForNewPlaylist] : []),
        isPrivate: data.isPrivate,
        description: data.description
      });
      await refreshMusicVault();
      setIsCreatePlaylistOpenState(false);
      setTrackForNewPlaylistState(null);
    } catch (e: any) {
      throw new Error(e.message);
    }
  }, [trackForNewPlaylist, triggerHaptic, refreshMusicVault]);

  const addTrackToPlaylist = useCallback((playlistId: string | number, track: Track) => { 
    triggerHaptic(15); 
    const playlist = globalPlaylists.find(p => p.id === playlistId);
    if (!playlist) return;
    const updatedSongs = [...playlist.songs, track];
    databases.updateDocument(APPWRITE_DATABASE_ID, PLAYLISTS_COLLECTION_ID, playlistId as string, {
      songs: JSON.stringify(updatedSongs)
    }).then(() => refreshMusicVault());
  }, [globalPlaylists, triggerHaptic, refreshMusicVault]);

  const isTrackLiked = useCallback((trackId: string | number) => likedSongIds.has(trackId), [likedSongIds]);
  const isTrackUnliked = useCallback((trackId: string | number) => unlikedSongIds.has(trackId), [unlikedSongIds]);
  const isTrackDownloaded = useCallback((trackId: string | number) => downloadedSongIds.has(trackId), [downloadedSongIds]);
  const isCollectionLiked = useCallback((id: string | number) => likedCollectionIds.has(id), [likedCollectionIds]);

  const value = {
    currentTrack, queue, globalSongs, globalAlbums, globalPlaylists,
    forYouSongs: globalSongs.slice(0, 10), 
    isPlaying, isExpanded, selectedAlbum, selectedPlaylist, progress, volume, reactions,
    likedSongIds, unlikedSongIds, downloadedSongIds, likedCollectionIds,
    likedTracks: globalSongs.filter(s => likedSongIds.has(s.id)),
    userPlaylists: globalPlaylists.filter(p => p.creator === "Guest"),
    userSongs: globalSongs.filter(s => s.artistUsername === "guest_node"),
    userAlbums: globalAlbums.filter(a => a.artistUsername === "guest_node"),
    isCreatePlaylistOpen, trackForNewPlaylist, trackStats,
    isAdPortalOpen, adDuration, adUrl: AD_URL,
    triggerDownloadWithAd, onAdComplete,
    isCaptureStudioOpen, captureTrack,
    openCaptureStudio: (track?: Track) => { triggerHaptic(25); setCaptureTrackState(track || null); setIsCaptureStudioOpenState(true); },
    closeCaptureStudio: () => { triggerHaptic(10); setIsCaptureStudioOpenState(false); setCaptureTrackState(null); },
    setCaptureTrack: setCaptureTrackState,
    setTrack, togglePlay, nextTrack, prevTrack, 
    setIsExpanded: setIsExpandedState, 
    setSelectedAlbum: setSelectedAlbumState, 
    setSelectedPlaylist: setSelectedPlaylistState, 
    setProgress: (p: number) => { setProgressState(p); if(audioRef.current) audioRef.current.currentTime = (p/100) * audioRef.current.duration; },
    setVolume: (v: number) => { setVolumeState(v); if(audioRef.current) audioRef.current.volume = v/100; },
    addReaction: (emoji: string) => {
      triggerHaptic(5);
      const id = Date.now();
      const newReaction = { id, emoji, x: Math.random() * 80 + 10 };
      setReactionsState((prev) => [...prev, newReaction]);
      setTimeout(() => setReactionsState((prev) => prev.filter((r) => r.id !== id)), 2500);
    },
    clearPlayer: () => { setIsPlayingState(false); setCurrentTrackState(null); setIsExpandedState(false); },
    toggleLike, toggleUnlike, toggleCollectionLike, simulateDownload, isTrackLiked, isTrackUnliked, isTrackDownloaded, isCollectionLiked,
    playCollection, addToQueue, publishTrack, publishAlbum, deleteUserTrack, deleteUserAlbum, boostTrack,
    openCreatePlaylist: (t?: Track) => { setTrackForNewPlaylistState(t || null); setIsCreatePlaylistOpenState(true); },
    closeCreatePlaylist: () => { setIsCreatePlaylistOpenState(false); setTrackForNewPlaylistState(null); },
    confirmCreatePlaylist, addTrackToPlaylist, triggerHaptic, refreshMusicVault, recordSongStream
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within a MusicProvider');
  return context;
}
