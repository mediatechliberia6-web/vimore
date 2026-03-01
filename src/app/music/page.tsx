
"use client";

import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
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
import { ArrowLeft, Search, X, Heart, ListMusic, Plus, Music, Disc3, Download, Trash2, MoreVertical, Zap } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

function MusicPageContent() {
  const searchParams = useSearchParams();
  const { globalSongs, globalAlbums, globalPlaylists, currentTrack, isExpanded, selectedAlbum, selectedPlaylist, likedTracks, userPlaylists, userSongs, userAlbums, openCreatePlaylist, downloadedSongIds, deleteUserTrack, deleteUserAlbum, triggerHaptic } = useMusic();
  const { connections } = usePosts();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("discover");
  const [libraryTab, setLibraryTab] = useState("playlists");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteItem, setDeleteItem] = useState<{ id: string | number, type: 'track' | 'album' } | null>(null);
  
  const [timeSpent, setTimeSpent] = useState(0);
  const [hasHadFirstAd, setHasHadFirstAd] = useState(false);
  
  const isPlayerActive = currentTrack && !isExpanded;

  const materializePopunder = useCallback(() => {
    if (typeof window === 'undefined') return;
    triggerHaptic(20);
    const script = document.createElement('script');
    script.src = "https://pl28803340.effectivegatecpm.com/ea/33/17/ea33174cb87fd4e73ca39402fe522836.js";
    script.async = true;
    document.body.appendChild(script);
    toast({ title: "Network Pulse Active", description: "Community vibes are synchronizing in the background." });
    setHasHadFirstAd(true);
    setTimeout(() => { if (document.body.contains(script)) document.body.removeChild(script); }, 30000);
  }, [triggerHaptic, toast]);

  useEffect(() => {
    const pulseTimer = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
    return () => clearInterval(pulseTimer);
  }, []);

  useEffect(() => {
    const currentThreshold = hasHadFirstAd ? 300 : 60; 
    if (timeSpent >= currentThreshold) {
      materializePopunder();
      setTimeSpent(0);
    }
  }, [timeSpent, hasHadFirstAd, materializePopunder]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ["discover", "chart", "upload", "library"].includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    if (!deleteItem) document.body.style.pointerEvents = 'auto';
    return () => { document.body.style.pointerEvents = 'auto'; };
  }, [deleteItem]);

  const filteredSongs = useMemo(() => {
    if (!searchQuery) return globalSongs;
    return globalSongs.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase()) || s.artist.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, globalSongs]);

  const filteredAlbums = useMemo(() => {
    if (!searchQuery) return globalAlbums;
    return globalAlbums.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.artist.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, globalAlbums]);

  const filteredPlaylists = useMemo(() => {
    if (!searchQuery) return globalPlaylists;
    return globalPlaylists.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.creator.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, globalPlaylists]);

  const filteredArtists = useMemo(() => {
    const artistsFromSongs = globalSongs.map(s => ({
      id: s.artistUsername || s.artist,
      name: s.artist,
      username: s.artistUsername || "vimore",
      role: "Vocalist",
      avatar: s.cover,
      isLive: false
    }));
    const uniqueArtists = Array.from(new Map(artistsFromSongs.map(item => [item.id, item])).values());
    if (!searchQuery) return uniqueArtists;
    return uniqueArtists.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.username.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, globalSongs]);

  const hasResults = filteredSongs.length > 0 || filteredAlbums.length > 0 || filteredPlaylists.length > 0 || filteredArtists.length > 0;

  const downloadedTracks = useMemo(() => {
    const allKnownTracks = [...globalSongs, ...userSongs, ...likedTracks];
    const uniqueTracksMap = new Map();
    allKnownTracks.forEach(t => { if (downloadedSongIds.has(t.id)) uniqueTracksMap.set(t.id, t); });
    return Array.from(uniqueTracksMap.values());
  }, [downloadedSongIds, userSongs, likedTracks, globalSongs]);

  const confirmDelete = () => {
    if (!deleteItem) return;
    triggerHaptic(50);
    const itemToDelete = { ...deleteItem };
    document.body.style.pointerEvents = 'auto';
    setDeleteItem(null);
    if (itemToDelete.type === 'track') {
      deleteUserTrack(itemToDelete.id);
      toast({ title: "Track Withdrawn", description: "Your single has been removed from the network." });
    } else {
      deleteUserAlbum(itemToDelete.id);
      toast({ title: "Album Purged", description: "The project has been removed from your discography." });
    }
  };

  return (
    <div className={cn("min-h-screen bg-[#F0F2F5] dark:bg-background transition-colors duration-300", (isExpanded || selectedAlbum || selectedPlaylist) && "h-screen overflow-hidden")}>
      <Header />
      <div className="fixed top-0 left-1/4 w-[60%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className={cn("hidden lg:block sticky border-r border-border/50 transition-all duration-300", isPlayerActive ? "top-[125px] h-[calc(100vh-125px)]" : "top-[61px] h-[calc(100vh-61px)]")}><MainNav /></aside>
        <main className={cn("flex flex-col pb-48 relative transition-all duration-300", isPlayerActive ? "pt-[64px]" : "pt-0")}>
          <div className={cn("sticky z-30 bg-[#F0F2F5]/80 dark:bg-background/80 backdrop-blur-md px-4 sm:px-10 py-4 flex items-center justify-between border-b border-border/50 transition-all duration-300", isPlayerActive ? "top-[125px]" : "top-[61px]")}>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0"><Link href="/"><Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 h-9 w-9 sm:h-10 sm:w-10"><ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" /></Button></Link><h1 className="text-lg sm:text-2xl font-black italic uppercase tracking-tighter hidden xs:block">{t('music_title')}</h1></div>
            <div className="relative group flex-1 max-w-md ml-2 sm:ml-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary" /><Input placeholder={t('music_search')} className="pl-10 pr-10 h-10 bg-white/50 dark:bg-card/50 border-primary/10 rounded-xl text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />{searchQuery && <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="h-4 w-4" /></button>}</div>
          </div>
          <div className="px-4 sm:px-10 py-6 sm:py-10">
            {activeTab === "discover" && (
              <div className="space-y-10 sm:space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {!hasResults ? (
                  <div className="py-20 text-center space-y-6 bg-white/40 dark:bg-card/40 rounded-[2.5rem] border border-dashed border-primary/10 animate-in zoom-in duration-500">
                    <div className="h-20 w-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto">
                      <Music className="h-10 w-10 text-muted-foreground opacity-20" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter">Sonic Vault Silent</h3>
                      <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">No tracks matched your query node. Explore new frequencies.</p>
                    </div>
                    <Button variant="outline" className="rounded-full border-primary text-primary font-black uppercase text-[10px] h-10 px-8" onClick={() => setSearchQuery("")}>Reset Discovery</Button>
                  </div>
                ) : (
                  <>
                    {!searchQuery && filteredSongs.length > 0 && <MusicGrid type="hero" items={[filteredSongs[0]]} />}
                    {!searchQuery && <NativeAdNode type="standard" /> }
                    {filteredSongs.length > 0 && <MusicGrid type="song" title={searchQuery ? t('ui_all') : t('music_trending_songs')} items={filteredSongs} />}
                    {!searchQuery && <NativeAdNode type="standard" /> }
                    {filteredAlbums.length > 0 && <MusicGrid type="album" title={searchQuery ? t('music_my_albums') : t('music_trending_albums')} items={filteredAlbums} />}
                    {!searchQuery && <NativeAdNode type="standard" /> }
                    {filteredPlaylists.length > 0 && <MusicGrid type="playlist" title={searchQuery ? t('music_playlists') : t('music_top_playlists')} items={filteredPlaylists} />}
                    {!searchQuery && <NativeAdNode type="standard" /> }
                    {filteredArtists.length > 0 && <MusicGrid type="artist" title={searchQuery ? t('ui_all') : t('music_trending_artists')} items={filteredArtists} />}
                  </>
                )}
              </div>
            )}
            {activeTab === "chart" && <MusicCharts />}
            {activeTab === "upload" && <MusicUpload onCancel={() => setActiveTab("discover")} />}
            {activeTab === "library" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">{t('music_my_library')}</h2>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                      {[
                        { id: "playlists", label: t('music_playlists'), count: userPlaylists.length },
                        { id: "songs", label: t('music_my_songs'), count: userSongs.length },
                        { id: "albums", label: t('music_my_albums'), count: userAlbums.length },
                        { id: "downloaded", label: t('music_notes'), count: downloadedTracks.length }
                      ].map((tab) => (
                        <button key={tab.id} onClick={() => setLibraryTab(tab.id)} className={cn("px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border", libraryTab === tab.id ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 dark:bg-card/50 border-border text-muted-foreground")}>
                          {tab.label} <span className="ml-1 opacity-50">({tab.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <NativeAdNode type="standard" />
                </div>
                <div className="pt-4">
                  {libraryTab === "playlists" && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between border-b border-border/50 pb-4"><div className="flex items-center gap-2"><ListMusic className="h-5 w-5 text-primary" /><h3 className="font-bold text-sm uppercase tracking-widest">My Created Vibes</h3></div><Button className="rounded-full bg-primary text-white font-bold gap-2 text-xs h-9 px-5" onClick={() => openCreatePlaylist()}><Plus className="h-4 w-4" /> {t('music_create_playlist')}</Button></div>
                      {userPlaylists.length === 0 ? (
                        <div className="py-20 text-center space-y-6 bg-white/30 dark:bg-card/30 backdrop-blur-xl rounded-[2.5rem] border border-border/50 shadow-sm animate-in zoom-in">
                          <ListMusic className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                          <div className="space-y-1">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">No Playlists Materialized</h3>
                            <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest">Start curating your unique sonic signature.</p>
                          </div>
                          <Button className="rounded-full bg-primary text-white font-black italic uppercase tracking-widest h-10 px-8 shadow-lg shadow-primary/20" onClick={() => openCreatePlaylist()}>Create First Vibe</Button>
                        </div>
                      ) : <MusicGrid type="playlist" items={userPlaylists} />}
                    </div>
                  )}
                  {libraryTab === "songs" && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-2 border-b border-border/50 pb-4"><Music className="h-5 w-5 text-primary" /><h3 className="font-bold text-sm uppercase tracking-widest">Published Tracks</h3></div>
                      {userSongs.length === 0 ? (
                        <div className="py-20 text-center space-y-6 bg-white/30 dark:bg-card/30 backdrop-blur-xl rounded-[2.5rem] border border-border/50 shadow-sm animate-in zoom-in">
                          <Zap className="h-12 w-12 mx-auto text-primary opacity-20" />
                          <div className="space-y-1">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Your Catalog is Empty</h3>
                            <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest">Launch your first single in the high-velocity studio.</p>
                          </div>
                          <Button className="rounded-full bg-primary text-white font-black italic uppercase tracking-widest h-10 px-8 shadow-lg shadow-primary/20" onClick={() => setActiveTab("upload")}>Enter Studio</Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {userSongs.map(song => (
                            <div key={song.id} className="group relative">
                              <MusicGrid type="song" items={[song]} />
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/40 text-white"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem className="text-destructive gap-2 font-bold" onSelect={() => setDeleteItem({ id: song.id, type: 'track' })}><Trash2 className="h-4 w-4" /> Withdraw Track</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {libraryTab === "downloaded" && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-2 border-b border-border/50 pb-4"><Download className="h-5 w-5 text-green-500" /><h3 className="font-bold text-sm uppercase tracking-widest">{t('music_notes')}</h3></div>
                      {downloadedTracks.length === 0 ? (
                        <div className="py-20 text-center space-y-6 bg-white/30 dark:bg-card/30 backdrop-blur-xl rounded-[2.5rem] border border-border/50 shadow-sm animate-in zoom-in">
                          <div className="h-16 w-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto text-green-500">
                            <Download className="h-8 w-8" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-black italic uppercase tracking-tighter">Notes Vault Empty</h3>
                            <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest">Archive tracks to listen even when you're off-grid.</p>
                          </div>
                          <Button variant="outline" className="rounded-full border-green-500 text-green-500 font-black italic uppercase tracking-widest h-10 px-8" onClick={() => setActiveTab("discover")}>Archive Tracks</Button>
                        </div>
                      ) : <MusicGrid type="song" items={downloadedTracks} />}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <MusicNav activeTab={activeTab} onTabChange={setActiveTab} /><CreatePlaylistModal />
      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}><AlertDialogContent className="rounded-[2.5rem] sm:max-w-[400px] bg-white/95 dark:bg-[#050505]/95 backdrop-blur-3xl border-destructive/10 shadow-2xl"><AlertDialogHeader><div className="mx-auto h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-4"><Trash2 className="h-8 w-8" /></div><AlertDialogTitle className="font-black italic uppercase tracking-tighter text-3xl text-center">Purge Content?</AlertDialogTitle><AlertDialogDescription className="text-base font-medium leading-relaxed text-center px-4">This will permanently remove your signature from the ViMore music network. All local notes will be severed.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6 px-4 pb-2"><AlertDialogCancel className="rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] bg-secondary/50 border-none hover:bg-secondary transition-all">Abort</AlertDialogCancel><AlertDialogAction onClick={confirmDelete} className="rounded-2xl h-14 font-black italic uppercase tracking-widest text-[10px] bg-destructive hover:bg-destructive/90 text-white shadow-xl shadow-destructive/20 transition-all active:scale-95">Confirm Purge</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}

export default function MusicPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F0F2F5] dark:bg-background flex items-center justify-center"><Music className="h-10 w-10 text-primary animate-spin" /></div>}>
      <MusicPageContent />
    </Suspense>
  );
}
