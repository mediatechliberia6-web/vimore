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
  likes?: number;
  unlikes?: number;
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
  likedCollectionIds: Set<string | number>; // For Playlists/Albums
  likedTracks: Track[];
  userPlaylists: Playlist[];
  userSongs: Track[];
  userAlbums: Album[];
  isCreatePlaylistOpen: boolean;
  trackForNewPlaylist: Track | null;
  trackStats: Record<string | number, { likes: number; unlikes: number }>;
  
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
  
  // Publishing & Management
  publishTrack: (track: Track) => void;
  publishAlbum: (album: Album) => void;
  openCreatePlaylist: (firstTrack?: Track) => void;
  closeCreatePlaylist: () => void;
  confirmCreatePlaylist: (data: { title: string; description: string; isPrivate: boolean; cover?: string }) => void;
  addTrackToPlaylist: (playlistId: string | number, track: Track) => void;
  
  triggerHaptic: (intensity?: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

const MOCK_COMMENTS: Comment[] = [
  { id: 1, user: "Alex Rivera", avatar: "https://picsum.photos/seed/1/100/100", text: "This beat is absolutely insane! 🚀", time: "2m ago" },
  { id: 2, user: "Sarah Chen", avatar: "https://picsum.photos/seed/2/100/100", text: "The transition at 1:45... literal chills.", time: "15m ago" },
  { id: 3, user: "Marcus Stone", avatar: "https://picsum.photos/seed/3/100/100", text: "Lagos vibes in full effect. 🔥", time: "1h ago" },
];

const MOCK_SONGS: Track[] = [
  { id: 1, title: "Essence", artist: "Wizkid ft. Tems", artistUsername: "arivera", cover: "https://picsum.photos/seed/song1/600/600", duration: 240, streams: "124M", likes: 12400, unlikes: 42, comments: MOCK_COMMENTS },
  { id: 2, title: "Last Last", artist: "Burna Boy", artistUsername: "schen_dev", cover: "https://picsum.photos/seed/song2/600/600", duration: 172, streams: "98M", likes: 8900, unlikes: 12, comments: MOCK_COMMENTS.slice(0, 2) },
  { id: 3, title: "Unavailable", artist: "Davido", artistUsername: "mstone", cover: "https://picsum.photos/seed/song3/600/600", duration: 185, streams: "75M", likes: 15600, unlikes: 88, comments: MOCK_COMMENTS.slice(1) },
  { id: 4, title: "Calm Down", artist: "Rema", artistUsername: "arivera", cover: "https://picsum.photos/seed/song4/600/600", duration: 219, streams: "320M", likes: 42000, unlikes: 156, comments: MOCK_COMMENTS },
  { id: 5, title: "Soweto", artist: "Victony", artistUsername: "techex", cover: "https://picsum.photos/seed/song5/600/600", duration: 164, streams: "45M", likes: 3200, unlikes: 5, comments: MOCK_COMMENTS.slice(0, 1) },
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
  
  // State for IDs
  const [likedSongIds, setLikedSongIds] = useState<Set<string | number>>(new Set());
  const [unlikedSongIds, setUnlikedSongIds] = useState<Set<string | number>>(new Set());
  const [downloadedSongIds, setDownloadedSongIds] = useState<Set<string | number>>(new Set());
  const [likedCollectionIds, setLikedCollectionIds] = useState<Set<string | number>>(new Set());
  
  const [likedTracks, setLikedTracks] = useState<Track[]>([]);
  const [userPlaylists, setUserPlaylists] = useState<Playlist[]>([]);
  const [userSongs, setUserSongs] = useState<Track[]>([]);
  const [userAlbums, setUserAlbums] = useState<Album[]>([]);
  
  // CENTRAL METRICS REGISTRY
  const [trackStats, setTrackStats] = useState<Record<string | number, { likes: number; unlikes: number }>>({});
  
  // Creation States
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [trackForNewPlaylist, setTrackForNewPlaylist] = useState<Track | null>(null);

  // Haptic utility
  const triggerHaptic = (intensity: number = 10) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(intensity);
    }
  };

  // Initialize stats and Load from LocalStorage
  useEffect(() => {
    const initialStats: Record<string | number, { likes: number; unlikes: number }> = {};
    MOCK_SONGS.forEach(s => {
      initialStats[s.id] = { likes: s.likes || 0, unlikes: s.unlikes || 0 };
    });

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
      } catch (e) { console.error("Failed to load likes", e); }
    }

    if (savedUnlikes) {
      try {
        setUnlikedSongIds(new Set(JSON.parse(savedUnlikes)));
      } catch (e) { console.error("Failed to load unlikes", e); }
    }

    if (savedDownloads) {
      try {
        setDownloadedSongIds(new Set(JSON.parse(savedDownloads)));
      } catch (e) { console.error("Failed to load downloads", e); }
    }

    if (savedCollLikes) {
      try {
        setLikedCollectionIds(new Set(JSON.parse(savedCollLikes)));
      } catch (e) { console.error("Failed to load collection likes", e); }
    }
    
    if (savedPlaylists) {
      try {
        setUserPlaylists(JSON.parse(savedPlaylists));
      } catch (e) { console.error("Failed to load playlists", e); }
    }

    if (savedUserSongs) {
      try {
        setUserSongs(JSON.parse(savedUserSongs));
      } catch (e) { console.error("Failed to load user songs", e); }
    }

    if (savedUserAlbums) {
      try {
        setUserAlbums(JSON.parse(savedUserAlbums));
      } catch (e) { console.error("Failed to load user albums", e); }
    }

    if (savedStats) {
      try {
        setTrackStats({ ...initialStats, ...JSON.parse(savedStats) });
      } catch (e) { setTrackStats(initialStats); }
    } else {
      setTrackStats(initialStats);
    }
  }, []);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('vimore_liked_tracks', JSON.stringify(likedTracks));
  }, [likedTracks]);

  useEffect(() => {
    localStorage.setItem('vimore_unliked_ids', JSON.stringify(Array.from(unlikedSongIds)));
  }, [unlikedSongIds]);

  useEffect(() => {
    localStorage.setItem('vimore_downloaded_ids', JSON.stringify(Array.from(downloadedSongIds)));
  }, [downloadedSongIds]);

  useEffect(() => {
    localStorage.setItem('vimore_liked_collections', JSON.stringify(Array.from(likedCollectionIds)));
  }, [likedCollectionIds]);

  useEffect(() => {
    localStorage.setItem('vimore_user_playlists', JSON.stringify(userPlaylists));
  }, [userPlaylists]);

  useEffect(() => {
    localStorage.setItem('vimore_user_songs', JSON.stringify(userSongs));
  }, [userSongs]);

  useEffect(() => {
    localStorage.setItem('vimore_user_albums', JSON.stringify(userAlbums));
  }, [userAlbums]);

  useEffect(() => {
    localStorage.setItem('vimore_track_stats', JSON.stringify(trackStats));
  }, [trackStats]);

  // Audio Progress Tick
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

  // Handle End of Track
  useEffect(() => {
    if (progress >= 100 && isPlaying) {
      nextTrack();
    }
  }, [progress]);

  const setTrack = (track: Track) => {
    triggerHaptic(15);
    if (!queue.some(t => t.id === track.id)) {
      setQueue([track, ...queue.filter(t => t.id !== track.id)]);
    }
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    setReactions([]);
    setIsExpanded(true); 
  };

  const addToQueue = (track: Track) => {
    triggerHaptic(5);
    if (!queue.some(t => t.id === track.id)) {
      setQueue(prev => [...prev, track]);
    }
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

  const nextTrack = () => {
    if (queue.length === 0) return;
    triggerHaptic(10);
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    const next = queue[nextIndex];
    setCurrentTrack(next);
    setProgress(0);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    if (queue.length === 0) return;
    triggerHaptic(10);
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    const prev = queue[prevIndex];
    setCurrentTrack(prev);
    setProgress(0);
    setIsPlaying(true);
  };

  const toggleLike = (track: Track) => {
    const trackId = track.id;
    const isCurrentlyLiked = likedSongIds.has(trackId);
    const isCurrentlyUnliked = unlikedSongIds.has(trackId);
    
    triggerHaptic(isCurrentlyLiked ? 5 : 25);

    if (isCurrentlyLiked) {
      setLikedSongIds(prev => {
        const next = new Set(prev);
        next.delete(trackId);
        return next;
      });
      setLikedTracks(prev => prev.filter(t => t.id !== trackId));
      setTrackStats(prev => ({
        ...prev,
        [trackId]: { 
          ...prev[trackId], 
          likes: Math.max(0, (prev[trackId]?.likes || 0) - 1) 
        }
      }));
    } else {
      setLikedSongIds(prev => {
        const next = new Set(prev);
        next.add(trackId);
        return next;
      });
      setLikedTracks(prev => [track, ...prev]);
      setTrackStats(prev => {
        const current = prev[trackId] || { likes: 0, unlikes: 0 };
        return {
          ...prev,
          [trackId]: {
            ...current,
            likes: current.likes + 1,
            unlikes: isCurrentlyUnliked ? Math.max(0, current.unlikes - 1) : current.unlikes
          }
        };
      });
      if (isCurrentlyUnliked) {
        setUnlikedSongIds(prev => {
          const next = new Set(prev);
          next.delete(trackId);
          return next;
        });
      }
    }
  };

  const toggleUnlike = (track: Track) => {
    const trackId = track.id;
    const isCurrentlyUnliked = unlikedSongIds.has(trackId);
    const isCurrentlyLiked = likedSongIds.has(trackId);
    
    triggerHaptic(isCurrentlyUnliked ? 5 : 15);

    if (isCurrentlyUnliked) {
      setUnlikedSongIds(prev => {
        const next = new Set(prev);
        next.delete(trackId);
        return next;
      });
      setTrackStats(prev => ({
        ...prev,
        [trackId]: { 
          ...prev[trackId], 
          unlikes: Math.max(0, (prev[trackId]?.unlikes || 0) - 1) 
        }
      }));
    } else {
      setUnlikedSongIds(prev => {
        const next = new Set(prev);
        next.add(trackId);
        return next;
      });
      setTrackStats(prev => {
        const current = prev[trackId] || { likes: 0, unlikes: 0 };
        return {
          ...prev,
          [trackId]: {
            ...current,
            unlikes: current.unlikes + 1,
            likes: isCurrentlyLiked ? Math.max(0, current.likes - 1) : current.likes
          }
        };
      });
      if (isCurrentlyLiked) {
        setLikedSongIds(prev => {
          const next = new Set(prev);
          next.delete(trackId);
          return next;
        });
        setLikedTracks(prev => prev.filter(t => t.id !== trackId));
      }
    }
  };

  const toggleCollectionLike = (id: string | number) => {
    triggerHaptic(20);
    setLikedCollectionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const simulateDownload = async (track: Track) => {
    if (downloadedSongIds.has(track.id)) return;
    triggerHaptic(10);
    setDownloadedSongIds(prev => {
      const next = new Set(prev);
      next.add(track.id);
      return next;
    });
  };

  const isTrackLiked = (trackId: string | number) => likedSongIds.has(trackId);
  const isTrackUnliked = (trackId: string | number) => unlikedSongIds.has(trackId);
  const isTrackDownloaded = (trackId: string | number) => downloadedSongIds.has(trackId);
  const isCollectionLiked = (id: string | number) => likedCollectionIds.has(id);

  // Publishing Methods
  const publishTrack = (track: Track) => {
    setUserSongs(prev => [track, ...prev]);
    setTrackStats(prev => ({ ...prev, [track.id]: { likes: 0, unlikes: 0 } }));
  };

  const publishAlbum = (album: Album) => {
    setUserAlbums(prev => [album, ...prev]);
    const newStats = { ...trackStats };
    album.songs.forEach(s => {
      newStats[s.id] = { likes: 0, unlikes: 0 };
    });
    setTrackStats(newStats);
  };

  // Playlist Methods
  const openCreatePlaylist = (track?: Track) => {
    triggerHaptic(10);
    setTrackForNewPlaylist(track || null);
    setIsCreatePlaylistOpen(true);
  };

  const closeCreatePlaylist = () => {
    setIsCreatePlaylistOpen(false);
    setTrackForNewPlaylist(null);
  };

  const confirmCreatePlaylist = (data: { title: string; description: string; isPrivate: boolean; cover?: string }) => {
    triggerHaptic(30);
    const newPlaylist: Playlist = {
      id: Date.now(),
      title: data.title,
      description: data.description,
      isPrivate: data.isPrivate,
      creator: "John Doe",
      cover: data.cover || trackForNewPlaylist?.cover || "https://picsum.photos/seed/playlist/400/400",
      totalStreams: "0",
      songs: trackForNewPlaylist ? [trackForNewPlaylist] : []
    };
    setUserPlaylists(prev => [newPlaylist, ...prev]);
    closeCreatePlaylist();
  };

  const addTrackToPlaylist = (playlistId: string | number, track: Track) => {
    triggerHaptic(15);
    setUserPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        if (p.songs.some(s => s.id === track.id)) return p;
        return { ...p, songs: [...p.songs, track] };
      }
      return p;
    }));
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
    triggerHaptic(5);
    setIsPlaying(false);
    setCurrentTrack(null);
    setIsExpanded(false);
    setProgress(0);
  };

  return (
    <MusicContext.Provider value={{
      currentTrack, queue, isPlaying, isExpanded, selectedAlbum, selectedPlaylist, progress, volume, reactions, 
      likedSongIds, unlikedSongIds, downloadedSongIds, likedCollectionIds, likedTracks, userPlaylists, userSongs, userAlbums, trackStats,
      isCreatePlaylistOpen, trackForNewPlaylist,
      setTrack, togglePlay, nextTrack, prevTrack, setIsExpanded, setSelectedAlbum, setSelectedPlaylist, setProgress, setVolume, addReaction, addComment, clearPlayer, 
      toggleLike, toggleUnlike, toggleCollectionLike, simulateDownload, isTrackLiked, isTrackUnliked, isTrackDownloaded, isCollectionLiked,
      playCollection, addToQueue, publishTrack, publishAlbum,
      openCreatePlaylist, closeCreatePlaylist, confirmCreatePlaylist, addTrackToPlaylist, triggerHaptic
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
