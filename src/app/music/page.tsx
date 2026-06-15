"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { loadCache, OFFLINE_KEYS } from "@/lib/offline-cache";
import { MainNav } from "@/components/layout/main-nav";
import { Header } from "@/components/layout/header";
import { MusicGrid } from "@/components/music/music-grid";
import { MusicNav } from "@/components/music/music-nav";
import { MusicCharts } from "@/components/music/music-charts";
import { MusicUpload } from "@/components/music/music-upload";
import { CreatePlaylistModal } from "@/components/music/create-playlist-modal";
import { NativeAdNode } from "@/components/ad/native-ad-node";
import { useMusic, Album, Track, Playlist } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { useTranslation } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Search, X, Heart, ListMusic, Plus, Music, Disc3,
  Download, Trash2, MoreVertical, Zap, WifiOff, TrendingUp, Play,
  Headphones, Flame, Star
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

function formatStreamCount(n: number | string): string {
  const num = typeof n === "string" ? parseInt(n, 10) : n;
  if (isNaN(num)) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

function MusicSkeleton() {
  return (
    <div className="space-y-8 animate-pulse px-4 sm:px-10 py-6">
      <div className="w-full aspect-video sm:h-72 rounded-3xl bg-muted/40" />
      <div className="space-y-3">
        <div className="h-5 w-40 bg-muted/40 rounded-full" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="shrink-0 space-y-2">
              <div className="h-40 w-36 rounded-2xl bg-muted/40" />
              <div className="h-3 w-28 bg-muted/40 rounded-full" />
              <div className="h-2.5 w-20 bg-muted/30 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-5 w-52 bg-muted/40 rounded-full" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shrink-0 space-y-2">
              <div className="h-44 w-40 rounded-2xl bg-muted/40" />
              <div className="h-3 w-32 bg-muted/40 rounded-full" />
              <div className="h-2.5 w-24 bg-muted/30 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LibrarySkeleton() {
  return (
    <div className="animate-pulse space-y-5 px-4 py-4">
      <div className="flex gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-9 w-24 rounded-full bg-muted/40" />)}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square rounded-2xl bg-muted/40" />
            <div className="h-3 w-3/4 bg-muted/40 rounded-full" />
            <div className="h-2.5 w-1/2 bg-muted/30 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function MusicPageContent() {
  const searchParams = useSearchParams();
  const {
    globalSongs, globalAlbums, globalPlaylists, forYouSongs,
    currentTrack, isExpanded, selectedAlbum, selectedPlaylist,
    likedTracks, userPlaylists, userSongs, userAlbums,
    openCreatePlaylist, downloadedSongIds, deleteUserTrack, deleteUserAlbum, triggerHaptic,
    setTrack
  } = useMusic();
  const { settings, isOffline } = usePosts();
  const { t } = useTranslation();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("discover");
  const [libraryTab, setLibraryTab] = useState("playlists");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteItem, setDeleteItem] = useState<{ id: string | number; type: "track" | "album" } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const recentlyPlayedTracks = useMemo<Track[]>(() => loadCache<Track>(OFFLINE_KEYS.MUSIC_PLAYED), []);
  const isPlayerActive = currentTrack && !isExpanded;

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["discover", "chart", "upload", "library"].includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    const t = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!deleteItem) document.body.style.pointerEvents = "auto";
    return () => { document.body.style.pointerEvents = "auto"; };
  }, [deleteItem]);

  const filteredSongs = useMemo(() => {
    if (!searchQuery) return globalSongs;
    const q = searchQuery.toLowerCase();
    return globalSongs.filter(s =>
      (s.title || "").toLowerCase().includes(q) || (s.artist || "").toLowerCase().includes(q)
    );
  }, [searchQuery, globalSongs]);

  const heroTrack = useMemo(() => {
    if (filteredSongs.length === 0) return null;
    if (searchQuery) return filteredSongs[0];
    return [...filteredSongs].sort((a, b) => parseInt(b.streams || "0", 10) - parseInt(a.streams || "0", 10))[0];
  }, [filteredSongs, searchQuery]);

  const musicPageSeed = useRef(Math.floor(Math.random() * 0x7fffffff));
  const trendingBoosted = useMemo(() => {
    const boosted = globalSongs.filter(s => s.isBoosted);
    const result = [...boosted];
    let s = musicPageSeed.current;
    for (let i = result.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      const j = Math.abs(s) % (i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalSongs.length]);

  const filteredAlbums = useMemo(() => {
    if (!searchQuery) return globalAlbums;
    const q = searchQuery.toLowerCase();
    return globalAlbums.filter(a => (a.title || "").toLowerCase().includes(q) || (a.artist || "").toLowerCase().includes(q));
  }, [searchQuery, globalAlbums]);

  const filteredPlaylists = useMemo(() => {
    if (!searchQuery) return globalPlaylists;
    const q = searchQuery.toLowerCase();
    return globalPlaylists.filter(p => (p.title || "").toLowerCase().includes(q) || (p.creator || "").toLowerCase().includes(q));
  }, [searchQuery, globalPlaylists]);

  const filteredArtists = useMemo(() => {
    const artistsFromSongs = globalSongs.map(s => ({
      id: s.artistUsername || s.artist, name: s.artist,
      username: s.artistUsername || "vimore", role: "Vocalist",
      avatar: s.cover, isLive: false,
    }));
    const unique = Array.from(new Map(artistsFromSongs.map(item => [item.id, item])).values());
    if (!searchQuery) return unique;
    const q = searchQuery.toLowerCase();
    return unique.filter(a => (a.name || "").toLowerCase().includes(q) || (a.username || "").toLowerCase().includes(q));
  }, [searchQuery, globalSongs]);

  const hasResults = filteredSongs.length > 0 || filteredAlbums.length > 0 || filteredPlaylists.length > 0 || filteredArtists.length > 0;

  const downloadedTracks = useMemo(() => {
    const allKnownTracks = [...globalSongs, ...userSongs, ...likedTracks];
    const uniqueMap = new Map();
    allKnownTracks.forEach(t => { if (downloadedSongIds.has(t.id)) uniqueMap.set(t.id, t); });
    return Array.from(uniqueMap.values());
  }, [downloadedSongIds, userSongs, likedTracks, globalSongs]);

  const confirmDelete = () => {
    if (!deleteItem) return;
    triggerHaptic(50);
    const item = { ...deleteItem };
    document.body.style.pointerEvents = "auto";
    setDeleteItem(null);
    if (item.type === "track") {
      deleteUserTrack(item.id);
      toast({ title: "Track Withdrawn", description: "Your single has been removed from the network." });
    } else {
      deleteUserAlbum(item.id);
      toast({ title: "Album Purged", description: "The project has been removed from your discography." });
    }
  };

  const STAT_PILLS = [
    { icon: Headphones, label: `${globalSongs.length} Tracks`, color: "text-primary" },
    { icon: Disc3, label: `${globalAlbums.length} Albums`, color: "text-violet-500" },
    { icon: ListMusic, label: `${globalPlaylists.length} Playlists`, color: "text-pink-500" },
  ];

  return (
    <div className={cn(
      "min-h-screen bg-[#F0F2F5] dark:bg-background transition-colors duration-300",
      (isExpanded || selectedAlbum || selectedPlaylist) && "h-screen overflow-hidden"
    )}>
      <Header />

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className={cn(
          "hidden lg:block sticky border-r border-border/50 transition-all duration-300",
          isPlayerActive ? "top-[125px] h-[calc(100vh-125px)]" : "top-[61px] h-[calc(100vh-61px)]"
        )}>
          <MainNav />
        </aside>

        <main className={cn("flex flex-col pb-56 relative transition-all duration-300", isPlayerActive ? "pt-[64px]" : "pt-0")}>

          {/* Offline banner */}
          {isOffline && (
            <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-2">
              <WifiOff className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Offline — showing saved music</span>
            </div>
          )}

          {/* Sticky header with search */}
          <div className={cn(
            "sticky z-30 bg-[#F0F2F5]/90 dark:bg-background/90 backdrop-blur-xl border-b border-border/30 px-4 sm:px-6 py-3 flex items-center gap-3 transition-all duration-300",
            isPlayerActive ? "top-[125px]" : "top-[61px]"
          )}>
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 shrink-0">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search songs, artists, albums…"
                className="pl-9 pr-9 h-9 rounded-xl bg-white/70 dark:bg-card/60 border-transparent focus-visible:border-primary/30 text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setSearchQuery("")}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tab content */}
          <div className="px-4 sm:px-6 py-5">

            {/* ── DISCOVER ─────────────────────────────── */}
            {activeTab === "discover" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Offline recently played */}
                {isOffline && recentlyPlayedTracks.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <WifiOff className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Recently Played</span>
                    </div>
                    <MusicGrid type="song" title="" items={recentlyPlayedTracks} />
                  </div>
                )}

                {!isLoaded ? (
                  <MusicSkeleton />
                ) : !hasResults ? (
                  /* Empty state */
                  <div className="py-24 flex flex-col items-center gap-5 bg-white/50 dark:bg-card/30 rounded-3xl border border-dashed border-border">
                    <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                      <Music className="h-9 w-9 text-primary/40" />
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter">Nothing Found</h3>
                      <p className="text-muted-foreground text-sm">No tracks match your search.</p>
                    </div>
                    <Button variant="outline" className="rounded-full px-8 border-primary text-primary font-bold" onClick={() => setSearchQuery("")}>
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Hero banner */}
                    {!searchQuery && heroTrack && (
                      <div
                        className="relative w-full rounded-[1.75rem] overflow-hidden cursor-pointer group"
                        style={{ aspectRatio: "16/9", maxHeight: "320px" }}
                        onClick={() => setTrack(heroTrack)}
                      >
                        <img src={heroTrack.cover} alt={heroTrack.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        {/* Stats ribbon */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Flame className="h-2.5 w-2.5 fill-current animate-pulse" /> #1 Trending
                          </span>
                          <span className="bg-black/40 backdrop-blur-md text-white/80 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Zap className="h-2.5 w-2.5 text-yellow-400" />
                            {formatStreamCount(heroTrack.streams)} plays
                          </span>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 space-y-2">
                          <h2 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter text-white leading-none line-clamp-2 drop-shadow-lg">
                            {heroTrack.title}
                          </h2>
                          <p className="text-sm font-bold text-white/70">{heroTrack.artist}</p>
                          <Button
                            size="sm"
                            className="rounded-full bg-white text-black font-black gap-1.5 hover:scale-105 transition-transform px-5 h-9 text-xs"
                            onClick={e => { e.stopPropagation(); setTrack(heroTrack); }}
                          >
                            <Play className="h-3.5 w-3.5 fill-current" /> Play Now
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Stats pills */}
                    {!searchQuery && (
                      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                        {STAT_PILLS.map(p => (
                          <div key={p.label} className="flex items-center gap-1.5 bg-white/70 dark:bg-card/60 border border-border/40 rounded-full px-3 py-1.5 shrink-0">
                            <p.icon className={cn("h-3.5 w-3.5", p.color)} />
                            <span className="text-[11px] font-bold text-muted-foreground">{p.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Trending boosted */}
                    {!searchQuery && trendingBoosted.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between px-1">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            <span className="text-sm font-black uppercase tracking-widest">Trending</span>
                            <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Zap className="h-2.5 w-2.5 fill-current" /> Boosted
                            </span>
                          </div>
                        </div>
                        <MusicGrid type="song" title="" items={trendingBoosted} />
                      </div>
                    )}

                    <NativeAdNode type="standard" id="discover-hero-sep" />

                    {forYouSongs.length > 0 && (
                      <>
                        <MusicGrid type="song" title="For You" items={forYouSongs.slice(0, 10)} />
                        <NativeAdNode type="standard" id="discover-foryou-sep" />
                      </>
                    )}

                    {filteredSongs.length > 0 && (
                      <>
                        <MusicGrid type="song" title={searchQuery ? "Songs" : t("music_trending_songs")} items={filteredSongs} />
                        <NativeAdNode type="standard" id="discover-trending-sep" />
                      </>
                    )}

                    {globalSongs.length > 0 && !searchQuery && (
                      <>
                        <MusicGrid type="song" title={t("music_new_releases")} items={[...globalSongs].reverse()} />
                        <NativeAdNode type="standard" id="discover-new-sep" />
                      </>
                    )}

                    {filteredAlbums.length > 0 && (
                      <>
                        <MusicGrid type="album" title={searchQuery ? "Albums" : t("music_trending_albums")} items={filteredAlbums} />
                        <NativeAdNode type="standard" id="discover-albums-sep" />
                      </>
                    )}

                    {filteredPlaylists.length > 0 && (
                      <>
                        <MusicGrid type="playlist" title={searchQuery ? "Playlists" : t("music_top_playlists")} items={filteredPlaylists} />
                        <NativeAdNode type="standard" id="discover-playlists-sep" />
                      </>
                    )}

                    {filteredArtists.length > 0 && (
                      <>
                        <MusicGrid type="artist" title={searchQuery ? "Artists" : t("music_trending_artists")} items={filteredArtists} />
                        <NativeAdNode type="standard" id="discover-artists-sep" />
                      </>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── CHARTS ─────────────────────────────── */}
            {activeTab === "chart" && <MusicCharts />}

            {/* ── UPLOAD ─────────────────────────────── */}
            {activeTab === "upload" && (
              <MusicUpload onCancel={() => setActiveTab("discover")} />
            )}

            {/* ── LIBRARY ─────────────────────────────── */}
            {activeTab === "library" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Library header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter">{t("music_my_library")}</h2>
                  {libraryTab === "playlists" && (
                    <Button
                      size="sm"
                      className="rounded-full bg-primary text-white font-bold gap-1.5 h-9 px-4 text-xs shadow-md shadow-primary/20"
                      onClick={() => openCreatePlaylist()}
                    >
                      <Plus className="h-4 w-4" /> New Playlist
                    </Button>
                  )}
                </div>

                {/* Library sub-tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {[
                    { id: "playlists", label: t("music_playlists"), icon: ListMusic, count: userPlaylists.length },
                    { id: "songs", label: t("music_my_songs"), icon: Music, count: userSongs.length },
                    { id: "albums", label: t("music_my_albums"), icon: Disc3, count: userAlbums.length },
                    { id: "downloaded", label: "Saved", icon: Download, count: downloadedTracks.length },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setLibraryTab(tab.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all border",
                        libraryTab === tab.id
                          ? "bg-primary text-white border-primary shadow-md shadow-primary/20"
                          : "bg-white/70 dark:bg-card/60 border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <tab.icon className="h-3.5 w-3.5" />
                      {tab.label}
                      <span className={cn("text-[10px] font-black", libraryTab === tab.id ? "opacity-70" : "opacity-40")}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                <NativeAdNode type="standard" id="library-header-sep" />

                {/* Playlists */}
                {libraryTab === "playlists" && (
                  userPlaylists.length === 0 ? (
                    <LibraryEmptyState
                      icon={<ListMusic className="h-10 w-10 text-primary/30" />}
                      title="No Playlists Yet"
                      desc="Create your first playlist to curate your perfect vibe."
                      action={<Button className="rounded-full bg-primary text-white font-bold px-8 h-10 shadow-md shadow-primary/20" onClick={() => openCreatePlaylist()}>Create Playlist</Button>}
                    />
                  ) : <MusicGrid type="playlist" items={userPlaylists} />
                )}

                {/* My Songs */}
                {libraryTab === "songs" && (
                  userSongs.length === 0 ? (
                    <LibraryEmptyState
                      icon={<Zap className="h-10 w-10 text-primary/30" />}
                      title="Your Catalog is Empty"
                      desc="Upload your first track to start building your discography."
                      action={<Button className="rounded-full bg-primary text-white font-bold px-8 h-10 shadow-md shadow-primary/20" onClick={() => setActiveTab("upload")}>Upload Track</Button>}
                    />
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {userSongs.map(song => (
                        <div key={song.id} className="relative group">
                          <MusicGrid type="song" items={[song]} />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-black/50 text-white hover:bg-black/70">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl">
                                <DropdownMenuItem className="text-destructive gap-2 font-bold" onSelect={() => setDeleteItem({ id: song.id, type: "track" })}>
                                  <Trash2 className="h-4 w-4" /> Withdraw Track
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* My Albums */}
                {libraryTab === "albums" && (
                  userAlbums.length === 0 ? (
                    <LibraryEmptyState
                      icon={<Disc3 className="h-10 w-10 text-primary/30" />}
                      title="No Albums Yet"
                      desc="Curate your first album project in the studio."
                      action={<Button className="rounded-full bg-primary text-white font-bold px-8 h-10 shadow-md shadow-primary/20" onClick={() => setActiveTab("upload")}>Create Album</Button>}
                    />
                  ) : (
                    <div>
                      {userAlbums.map(album => (
                        <div key={album.id} className="relative group">
                          <MusicGrid type="album" items={[album]} />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-black/50 text-white hover:bg-black/70">
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl">
                                <DropdownMenuItem className="text-destructive gap-2 font-bold" onSelect={() => setDeleteItem({ id: album.id, type: "album" })}>
                                  <Trash2 className="h-4 w-4" /> Delete Album
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* Downloaded */}
                {libraryTab === "downloaded" && (
                  downloadedTracks.length === 0 ? (
                    <LibraryEmptyState
                      icon={<Download className="h-10 w-10 text-green-400/60" />}
                      title="Nothing Saved Yet"
                      desc="Save tracks to listen even when you're offline."
                      action={<Button variant="outline" className="rounded-full border-green-500 text-green-600 font-bold px-8 h-10" onClick={() => setActiveTab("discover")}>Browse Music</Button>}
                    />
                  ) : <MusicGrid type="song" items={downloadedTracks} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <MusicNav activeTab={activeTab} onTabChange={setActiveTab} />
      <CreatePlaylistModal />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={open => !open && setDeleteItem(null)}>
        <AlertDialogContent className="rounded-3xl bg-white/95 dark:bg-card/95 backdrop-blur-2xl border-destructive/10 shadow-2xl max-w-sm mx-4">
          <AlertDialogHeader>
            <div className="mx-auto h-14 w-14 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-3">
              <Trash2 className="h-7 w-7" />
            </div>
            <AlertDialogTitle className="font-black italic uppercase tracking-tighter text-2xl text-center">Delete Content?</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm leading-relaxed">
              This will permanently remove this {deleteItem?.type === "track" ? "track" : "album"} from ViMore. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 pt-4">
            <AlertDialogAction onClick={confirmDelete} className="rounded-2xl h-12 font-black uppercase tracking-widest text-[11px] bg-destructive hover:bg-destructive/90 text-white shadow-xl shadow-destructive/20">
              Delete
            </AlertDialogAction>
            <AlertDialogCancel className="rounded-2xl h-12 font-black uppercase tracking-widest text-[11px] bg-secondary/50 border-none hover:bg-secondary">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function LibraryEmptyState({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc: string; action: React.ReactNode }) {
  return (
    <div className="py-20 flex flex-col items-center gap-4 bg-white/50 dark:bg-card/30 rounded-3xl border border-dashed border-border">
      <div className="h-20 w-20 rounded-3xl bg-muted/40 flex items-center justify-center">{icon}</div>
      <div className="text-center space-y-1 px-8">
        <h3 className="text-lg font-black italic uppercase tracking-tighter">{title}</h3>
        <p className="text-muted-foreground text-sm">{desc}</p>
      </div>
      {action}
    </div>
  );
}

export default function MusicPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F0F2F5] dark:bg-background flex flex-col">
        <div className="h-16 bg-white/80 dark:bg-card/80 border-b border-border/30" />
        <MusicSkeleton />
      </div>
    }>
      <MusicPageContent />
    </Suspense>
  );
}
