'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useRef, useMemo } from 'react';
import { saveFileToDevice } from '@/lib/utils';
import { databases, APPWRITE_DATABASE_ID, SONGS_COLLECTION_ID, ALBUMS_COLLECTION_ID, PLAYLISTS_COLLECTION_ID, Query, ID } from '@/lib/appwrite';

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
  const isInitialMount = useRef(true);

  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(intensity);
    }
  }, []);

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
        if (Math.floor(p) % 5 === 0) {
          localStorage.setItem('vimore_sonic_position', audio.currentTime.toString());
        }
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
    if (typeof window === 'undefined') return;
    
    const loadSonicVault = async () => {
      const savedTrack = localStorage.getItem('vimore_last_track');
      const savedPosition = localStorage.getItem('vimore_sonic_position');
      
      if (savedTrack) {
        try {
          const track = JSON.parse(savedTrack) as Track;
          setCurrentTrackState(track);
          if (audioRef.current) {
            audioRef.current.src = track.audioUrl || "";
            if (savedPosition) {
              audioRef.current.currentTime = parseFloat(savedPosition);
            }
          }
        } catch (e) {
          console.warn("Sonic archival node corrupted.");
        }
      }
    };

    if (isInitialMount.current) {
      loadSonicVault();
      isInitialMount.current = false;
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
        
        // AUTO-EXPIRY LOGIC for Songs
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
    const song = globalSongs.find(s => s.id === songId);
    if (!song) return;

    try {
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
    } catch (e) {}
  }, [globalSongs]);

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
      // Log stream handshake
      recordSongStream(currentTrack.id);
    } else {
      audioRef.current.pause();
    }
  }, [currentTrack, isPlaying, recordSongStream]);

  const forYouSongs = useMemo(() => {
    const boosted = globalSongs.filter(s => s.isBoosted);
    const regular = globalSongs.filter(s => !s.isBoosted);
    const result: Track[] = [];
    
    let bIdx = 0;
    let rIdx = 0;
    while(rIdx < regular.length || bIdx < boosted.length) {
      for(let i=0; i<2 && rIdx < regular.length; i++) {
        result.push(regular[rIdx++]);
      }
      if(bIdx < boosted.length) {
        result.push(boosted[bIdx++]);
      }
    }
    return result;
  }, [globalSongs]);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    triggerHaptic(10);
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    const track = queue[nextIndex];
    setCurrentTrackState(track);
    setProgressState(0);
    setIsPlayingState(true);
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl || "";
      audioRef.current.currentTime = 0;
    }
  }, [queue, currentTrack, triggerHaptic]);

  const setTrack = useCallback((track: Track) => {
    triggerHaptic(15);
    if (!queue.some(t => t.id === track.id)) setQueueState([track, ...queue.filter(t => t.id !== track.id)]);
    setCurrentTrackState(track);
    setIsPlayingState(true);
    setProgressState(0);
    setReactionsState([]);
    setIsExpandedState(true);
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl || "";
      audioRef.current.currentTime = 0;
    }
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
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl || "";
      audioRef.current.currentTime = 0;
    }
  }, [triggerHaptic]);

  const togglePlay = useCallback(() => { 
    triggerHaptic(10); 
    setIsPlayingState(prev => !prev); 
  }, [triggerHaptic]);

  const prevTrack = useCallback(() => {
    if (queue.length === 0) return;
    triggerHaptic(10);
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    const track = queue[prevIndex];
    setCurrentTrackState(track);
    setProgressState(0);
    setIsPlayingState(true);
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl || "";
      audioRef.current.currentTime = 0;
    }
  }, [queue, currentTrack, triggerHaptic]);

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

  const isTrackLiked = useCallback((trackId: string | number) => likedSongIds.has(trackId), [likedSongIds]);
  const isTrackUnliked = useCallback((trackId: string | number) => unlikedSongIds.has(trackId), [unlikedSongIds]);
  const isTrackDownloaded = useCallback((trackId: string | number) => downloadedSongIds.has(trackId), [downloadedSongIds]);
  const isCollectionLiked = useCallback((id: string | number) => likedCollectionIds.has(id), [likedCollectionIds]);

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
        isBoosted: false
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
        totalStreams: "0"
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

  const openCreatePlaylist = useCallback((track?: Track) => { triggerHaptic(10); setTrackForNewPlaylistState(track || null); setIsCreatePlaylistOpenState(true); }, [triggerHaptic]);
  const closeCreatePlaylist = useCallback(() => { setIsCreatePlaylistOpenState(false); setTrackForNewPlaylistState(null); }, []);
  
  const confirmCreatePlaylist = useCallback(async (data: { title: string; description: string; isPrivate: boolean; cover?: string }) => {
    triggerHaptic(30);
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, PLAYLISTS_COLLECTION_ID, ID.unique(), {
        title: data.title,
        creator: "John Doe",
        cover: data.cover || trackForNewPlaylist?.cover || "https://picsum.photos/seed/playlist/400/400",
        totalStreams: "0",
        songs: JSON.stringify(trackForNewPlaylist ? [trackForNewPlaylist] : []),
        isPrivate: data.isPrivate,
        description: data.description
      });
      await refreshMusicVault();
      closeCreatePlaylist();
    } catch (e: any) {
      throw new Error(e.message);
    }
  }, [trackForNewPlaylist, triggerHaptic, refreshMusicVault, closeCreatePlaylist]);

  const addTrackToPlaylist = useCallback((playlistId: string | number, track: Track) => { 
    triggerHaptic(15); 
    const playlist = globalPlaylists.find(p => p.id === playlistId);
    if (!playlist) return;
    const updatedSongs = [...playlist.songs, track];
    databases.updateDocument(APPWRITE_DATABASE_ID, PLAYLISTS_COLLECTION_ID, playlistId as string, {
      songs: JSON.stringify(updatedSongs)
    }).then(() => refreshMusicVault());
  }, [globalPlaylists, triggerHaptic, refreshMusicVault]);

  const addReaction = useCallback((emoji: string) => {
    triggerHaptic(5);
    const id = Date.now();
    const newReaction = { id, emoji, x: Math.random() * 80 + 10 };
    setReactionsState((prev) => [...prev, newReaction]);
    setTimeout(() => setReactionsState((prev) => prev.filter((r) => r.id !== id)), 2500);
  }, [triggerHaptic]);

  const addComment = useCallback((text: string) => {
    if (!currentTrack || !text.trim()) return;
    triggerHaptic(10);
    const newComment: Comment = { id: Date.now(), user: "John Doe", avatar: "https://picsum.photos/seed/me/100/100", text, time: "Just now" };
    setCurrentTrackState({ ...currentTrack, comments: [newComment, ...(currentTrack.comments || [])] });
  }, [currentTrack, triggerHaptic]);

  const clearPlayer = useCallback(() => { 
    triggerHaptic(5); 
    setIsPlayingState(false); 
    setCurrentTrackState(null); 
    setIsExpandedState(false); 
    setProgressState(0); 
    localStorage.removeItem('vimore_last_track');
    localStorage.removeItem('vimore_sonic_position');
  }, [triggerHaptic]);

  const openCaptureStudio = useCallback((track?: Track) => { triggerHaptic(25); setCaptureTrackState(track || null); setIsCaptureStudioOpenState(true); }, [triggerHaptic]);
  const closeCaptureStudio = useCallback(() => { triggerHaptic(10); setIsCaptureStudioOpenState(false); setCaptureTrackState(null); }, [triggerHaptic]);

  const setIsExpanded = useCallback((expanded: boolean) => setIsExpandedState(expanded), []);
  const setSelectedAlbum = useCallback((album: Album | null) => setSelectedAlbumState(album), []);
  const setSelectedPlaylist = useCallback((playlist: Playlist | null) => setSelectedPlaylistState(playlist), []);
  const setProgress = useCallback((progress: number) => {
    setProgressState(progress);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (progress / 100) * audioRef.current.duration;
    }
  }, []);
  const setVolume = useCallback((volume: number) => {
    setVolumeState(volume);
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, []);
  const setCaptureTrack = useCallback((track: Track | null) => setCaptureTrackState(track), []);

  const likedTracks = useMemo(() => {
    return globalSongs.filter(s => likedSongIds.has(s.id));
  }, [globalSongs, likedSongIds]);

  const userPlaylists = useMemo(() => globalPlaylists.filter(p => p.creator === "John Doe"), [globalPlaylists]);
  const userSongs = useMemo(() => globalSongs.filter(s => s.artistUsername === "johndoe_creative"), [globalSongs]);
  const userAlbums = useMemo(() => globalAlbums.filter(a => a.artistUsername === "johndoe_creative"), [globalAlbums]);

  const contextValue = useMemo(() => ({
    currentTrack, queue, globalSongs, globalAlbums, globalPlaylists, forYouSongs, isPlaying, isExpanded, selectedAlbum, selectedPlaylist, progress, volume, reactions, 
    likedSongIds, unlikedSongIds, downloadedSongIds, likedCollectionIds, likedTracks, userPlaylists, userSongs, userAlbums, trackStats,
    isAdPortalOpen, adDuration, adUrl: AD_URL, triggerDownloadWithAd, onAdComplete,
    isCreatePlaylistOpen, trackForNewPlaylist,
    isCaptureStudioOpen, captureTrack, openCaptureStudio, closeCaptureStudio, setCaptureTrack,
    setTrack, togglePlay, nextTrack, prevTrack, setIsExpanded, setSelectedAlbum, setSelectedPlaylist, setProgress, setVolume, addReaction, addComment, clearPlayer, 
    toggleLike, toggleUnlike, toggleCollectionLike, simulateDownload, isTrackLiked, isTrackUnliked, isTrackDownloaded, isCollectionLiked,
    playCollection, addToQueue, publishTrack, publishAlbum, deleteUserTrack, deleteUserAlbum, boostTrack,
    openCreatePlaylist, closeCreatePlaylist, confirmCreatePlaylist, addTrackToPlaylist, triggerHaptic, refreshMusicVault, recordSongStream
  }), [currentTrack, queue, globalSongs, globalAlbums, globalPlaylists, forYouSongs, isPlaying, isExpanded, selectedAlbum, selectedPlaylist, progress, volume, reactions, likedSongIds, unlikedSongIds, downloadedSongIds, likedCollectionIds, likedTracks, userPlaylists, userSongs, userAlbums, trackStats, isAdPortalOpen, adDuration, isCreatePlaylistOpen, trackForNewPlaylist, isCaptureStudioOpen, captureTrack, triggerHaptic, setTrack, togglePlay, nextTrack, prevTrack, setIsExpanded, setSelectedAlbum, setSelectedPlaylist, setProgress, setVolume, addReaction, addComment, clearPlayer, toggleLike, toggleUnlike, toggleCollectionLike, simulateDownload, isTrackLiked, isTrackUnliked, isTrackDownloaded, isCollectionLiked, playCollection, addToQueue, publishTrack, publishAlbum, deleteUserTrack, deleteUserAlbum, boostTrack, openCreatePlaylist, closeCreatePlaylist, confirmCreatePlaylist, addTrackToPlaylist, refreshMusicVault, recordSongStream]);

  return (
    <MusicContext.Provider value={contextValue}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) throw new Error('useMusic must be used within a MusicProvider');
  return context;
}
