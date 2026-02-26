"use client";

import { useState, useMemo } from "react";
import { MainNav } from "@/components/layout/main-nav";
import { Header } from "@/components/layout/header";
import { MusicGrid } from "@/components/music/music-grid";
import { MusicNav } from "@/components/music/music-nav";
import { MusicCharts } from "@/components/music/music-charts";
import { MusicUpload } from "@/components/music/music-upload";
import { CreatePlaylistModal } from "@/components/music/create-playlist-modal";
import { useMusic, Album, Track, Playlist } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, X, Heart, ListMusic, Plus, Music, Disc3, Download, Trash2, MoreVertical } from "lucide-react";
import Link from "next/link";
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

const MOCK_SONGS: Track[] = [
  { id: 1, title: "Essence", artist: "Wizkid ft. Tems", artistUsername: "arivera", cover: "https://picsum.photos/seed/song1/600/600", duration: 240, streams: "124M" },
  { id: 2, title: "Last Last", artist: "Burna Boy", artistUsername: "schen_dev", cover: "https://picsum.photos/seed/song2/600/600", duration: 172, streams: "98M" },
  { id: 3, title: "Unavailable", artist: "Davido", artistUsername: "mstone", cover: "https://picsum.photos/seed/song3/600/600", duration: 185, streams: "75M" },
  { id: 4, title: "Calm Down", artist: "Rema", artistUsername: "arivera", cover: "https://picsum.photos/seed/song4/600/600", duration: 219, streams: "320M" },
  { id: 5, title: "Soweto", artist: "Victony", artistUsername: "techex", cover: "https://picsum.photos/seed/song5/600/600", duration: 164, streams: "45M" },
];

const MOCK_ALBUMS: Album[] = [
  { 
    id: 'a1', 
    title: "Timeless", 
    artist: "Davido", 
    artistUsername: "mstone",
    cover: "https://picsum.photos/seed/album1/400/400", 
    year: "2023", 
    tracks: 17,
    totalStreams: "850M",
    songs: MOCK_SONGS
  },
  { 
    id: 'a2', 
    title: "More Love, Less Ego", 
    artist: "Wizkid", 
    artistUsername: "arivera",
    cover: "https://picsum.photos/seed/album2/400/400", 
    year: "2022", 
    tracks: 13,
    totalStreams: "620M",
    songs: MOCK_SONGS.slice(0, 3)
  },
];

const MOCK_PLAYLISTS: Playlist[] = [
  { 
    id: 'p1', 
    title: "AFRO-FUSION", 
    creator: "arivera",
    cover: "https://picsum.photos/seed/play1/800/450",
    totalStreams: "1.2M",
    songs: MOCK_SONGS
  },
  { 
    id: 'p2', 
    title: "MIDNIGHT LO-FI", 
    creator: "schen_dev",
    cover: "https://picsum.photos/seed/play2/800/450",
    totalStreams: "850k",
    songs: MOCK_SONGS.slice(2)
  },
];

const MOCK_ARTISTS = [
  { id: 'ar1', name: "Ayra Starr", username: "arivera", role: "Vocalist", avatar: "https://picsum.photos/seed/art1/200/200", isLive: true },
  { id: 'ar2', name: "Asake", username: "schen_dev", role: "Singer", avatar: "https://picsum.photos/seed/art2/200/200" },
  { id: 'ar3', name: "Tems", username: "arivera", role: "Producer", avatar: "https://picsum.photos/seed/art3/200/200" },
  { id: 'ar4', name: "Olamide", username: "mstone", role: "Rapper", avatar: "https://picsum.photos/seed/art4/200/200" },
];

export default function MusicPage() {
  const { currentTrack, isExpanded, selectedAlbum, selectedPlaylist, likedTracks, userPlaylists, userSongs, userAlbums, openCreatePlaylist, downloadedSongIds, queue, deleteUserTrack, deleteUserAlbum, triggerHaptic } = useMusic();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("discover");
  const [libraryTab, setLibraryTab] = useState("playlists");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteItem, setDeleteItem] = useState<{ id: string | number, type: 'track' | 'album' } | null>(null);
  
  const isPlayerActive = currentTrack && !isExpanded;

  const filteredSongs = useMemo(() => {
    if (!searchQuery) return MOCK_SONGS;
    return MOCK_SONGS.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredAlbums = useMemo(() => {
    if (!searchQuery) return MOCK_ALBUMS;
    return MOCK_ALBUMS.filter(a => 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredPlaylists = useMemo(() => {
    if (!searchQuery) return MOCK_PLAYLISTS;
    return MOCK_PLAYLISTS.filter(p => 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.creator.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredArtists = useMemo(() => {
    if (!searchQuery) return MOCK_ARTISTS;
    return MOCK_ARTISTS.filter(a => 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const hasResults = filteredSongs.length > 0 || filteredAlbums.length > 0 || filteredPlaylists.length > 0 || filteredArtists.length > 0;

  // Find all tracks that are marked as downloaded
  const downloadedTracks = useMemo(() => {
    const allKnownTracks = [...MOCK_SONGS, ...userSongs, ...likedTracks];
    const uniqueTracksMap = new Map();
    allKnownTracks.forEach(t => {
      if (downloadedSongIds.has(t.id)) uniqueTracksMap.set(t.id, t);
    });
    return Array.from(uniqueTracksMap.values());
  }, [downloadedSongIds, userSongs, likedTracks]);

  const confirmDelete = () => {
    if (!deleteItem) return;
    triggerHaptic(50);
    if (deleteItem.type === 'track') {
      deleteUserTrack(deleteItem.id);
      toast({ title: "Track Withdrawn", description: "Your single has been removed from the network." });
    } else {
      deleteUserAlbum(deleteItem.id);
      toast({ title: "Album Purged", description: "The project has been removed from your discography." });
    }
    setDeleteItem(null);
  };

  return (
    <div className={cn(
      "min-h-screen bg-[#F0F2F5] dark:bg-background transition-colors duration-300",
      (isExpanded || selectedAlbum || selectedPlaylist) && "h-screen overflow-hidden"
    )}>
      <Header />
      
      <div className="fixed top-0 left-1/4 w-[60%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className={cn(
          "hidden lg:block sticky border-r border-border/50 transition-all duration-300",
          isPlayerActive ? "top-[125px] h-[calc(100vh-125px)]" : "top-[61px] h-[calc(100vh-61px)]"
        )}>
          <MainNav />
        </aside>

        <main className={cn(
          "flex flex-col pb-48 relative transition-all duration-300",
          isPlayerActive ? "pt-[64px]" : "pt-0"
        )}>
          <div className={cn(
            "sticky z-30 bg-[#F0F2F5]/80 dark:bg-background/80 backdrop-blur-md px-4 sm:px-10 py-4 flex items-center justify-between border-b border-border/50 transition-all duration-300",
            isPlayerActive ? "top-[125px]" : "top-[61px]"
          )}>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 transition-colors h-9 w-9 sm:h-10 sm:w-10">
                  <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </Link>
              <h1 className="text-lg sm:text-2xl font-black italic uppercase tracking-tighter hidden xs:block">Music Hub</h1>
            </div>

            <div className="relative group flex-1 max-w-md ml-2 sm:ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search songs, albums, artists..." 
                className="pl-10 pr-10 h-10 bg-white/50 dark:bg-card/50 border-primary/10 rounded-xl focus-visible:ring-primary/20 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="px-4 sm:px-10 py-6 sm:py-10">
            {activeTab === "discover" && (
              <div className="space-y-10 sm:space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {!hasResults ? (
                  <div className="py-20 text-center space-y-4">
                    <div className="h-20 w-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto">
                      <Search className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter">No results for "{searchQuery}"</h3>
                      <p className="text-muted-foreground text-sm">Try searching for a different artist or genre</p>
                    </div>
                    <Button variant="outline" className="rounded-full border-primary text-primary font-black uppercase tracking-widest text-[10px]" onClick={() => setSearchQuery("")}>Clear Search</Button>
                  </div>
                ) : (
                  <>
                    {!searchQuery && <MusicGrid type="hero" items={[MOCK_SONGS[0]]} />}
                    {filteredSongs.length > 0 && <MusicGrid type="song" title={searchQuery ? "Matching Songs" : "Trending Songs"} items={filteredSongs} />}
                    {filteredAlbums.length > 0 && <MusicGrid type="album" title={searchQuery ? "Matching Albums" : "Trending Albums"} items={filteredAlbums} />}
                    {!searchQuery && <MusicGrid type="song" title="New Releases" items={[...MOCK_SONGS].reverse()} />}
                    {filteredPlaylists.length > 0 && <MusicGrid type="playlist" title={searchQuery ? "Matching Playlists" : "Top Playlists"} items={filteredPlaylists} />}
                    {filteredArtists.length > 0 && <MusicGrid type="artist" title={searchQuery ? "Matching Artists" : "Trending Artists"} items={filteredArtists} />}
                  </>
                )}
              </div>
            )}
            
            {activeTab === "chart" && <MusicCharts />}
            
            {activeTab === "upload" && (
              <MusicUpload onCancel={() => setActiveTab("discover")} />
            )}

            {activeTab === "library" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">My Library</h2>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                      {[
                        { id: "playlists", label: "Playlists", count: userPlaylists.length },
                        { id: "songs", label: "My Songs", count: userSongs.length },
                        { id: "albums", label: "My Albums", count: userAlbums.length },
                        { id: "downloaded", label: "Music Notes", count: downloadedTracks.length }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setLibraryTab(tab.id)}
                          className={cn(
                            "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border",
                            libraryTab === tab.id 
                              ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                              : "bg-white/5 dark:bg-card/50 border-border text-muted-foreground hover:border-primary/30"
                          )}
                        >
                          {tab.label} <span className="ml-1 opacity-50">({tab.count})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  {libraryTab === "playlists" && (
                    <div className="space-y-8">
                      <div className="flex items-center justify-between border-b border-border/50 pb-4">
                        <div className="flex items-center gap-2">
                          <ListMusic className="h-5 w-5 text-primary" />
                          <h3 className="font-bold text-sm uppercase tracking-widest">My Created Vibes</h3>
                        </div>
                        <Button 
                          className="rounded-full bg-primary text-white font-bold gap-2 text-xs h-9 px-5" 
                          onClick={() => openCreatePlaylist()}
                        >
                          <Plus className="h-4 w-4" /> Create Playlist
                        </Button>
                      </div>

                      {userPlaylists.length === 0 ? (
                        <div className="py-20 text-center space-y-6 bg-white/30 dark:bg-card/30 backdrop-blur-xl rounded-[2rem] border border-border/50">
                          <ListMusic className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold">No playlists yet</h3>
                            <p className="text-muted-foreground text-sm">Start curating your unique sonic signature.</p>
                          </div>
                          <Button variant="outline" className="rounded-full border-primary text-primary" onClick={() => openCreatePlaylist()}>Create First Playlist</Button>
                        </div>
                      ) : (
                        <MusicGrid type="playlist" items={userPlaylists} />
                      )}
                    </div>
                  )}

                  {libraryTab === "songs" && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-2 border-b border-border/50 pb-4">
                        <Music className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-sm uppercase tracking-widest">Published Tracks</h3>
                      </div>
                      {userSongs.length === 0 ? (
                        <div className="py-20 text-center space-y-6 bg-white/30 dark:bg-card/30 backdrop-blur-xl rounded-[2rem] border border-border/50">
                          <Music className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold">Your Catalog is Empty</h3>
                            <p className="text-muted-foreground text-sm">Upload your first single in the Studio.</p>
                          </div>
                          <Button variant="outline" className="rounded-full border-primary text-primary" onClick={() => setActiveTab("upload")}>Go to Studio</Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {userSongs.map(song => (
                            <div key={song.id} className="group relative">
                              <MusicGrid type="song" items={[song]} />
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/40 text-white"><MoreVertical className="h-4 w-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="text-destructive gap-2" onClick={() => setDeleteItem({ id: song.id, type: 'track' })}>
                                      <Trash2 className="h-4 w-4" /> Withdraw Track
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {libraryTab === "albums" && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-2 border-b border-border/50 pb-4">
                        <Disc3 className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-sm uppercase tracking-widest">Discography</h3>
                      </div>
                      {userAlbums.length === 0 ? (
                        <div className="py-20 text-center space-y-6 bg-white/30 dark:bg-card/30 backdrop-blur-xl rounded-[2rem] border border-border/50">
                          <Disc3 className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold">No Projects Published</h3>
                            <p className="text-muted-foreground text-sm">Curate and publish full albums to showcase your range.</p>
                          </div>
                          <Button variant="outline" className="rounded-full border-primary text-primary" onClick={() => setActiveTab("upload")}>Open Studio</Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {userAlbums.map(album => (
                            <div key={album.id} className="group relative">
                              <MusicGrid type="album" items={[album]} />
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/40 text-white"><MoreVertical className="h-4 w-4" /></Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="text-destructive gap-2" onClick={() => setDeleteItem({ id: album.id, type: 'album' })}>
                                      <Trash2 className="h-4 w-4" /> Purge Album
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {libraryTab === "downloaded" && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-2 border-b border-border/50 pb-4">
                        <Download className="h-5 w-5 text-green-500" />
                        <h3 className="font-bold text-sm uppercase tracking-widest">Music Notes</h3>
                      </div>
                      {downloadedTracks.length === 0 ? (
                        <div className="py-20 text-center space-y-6 bg-white/30 dark:bg-card/30 backdrop-blur-xl rounded-[2rem] border border-border/50">
                          <Download className="h-12 w-12 mx-auto text-muted-foreground opacity-20" />
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold">Your Music Notes are empty</h3>
                            <p className="text-muted-foreground text-sm">Note tracks to listen even when you're off-grid.</p>
                          </div>
                          <Button variant="outline" className="rounded-full border-primary text-primary" onClick={() => setActiveTab("discover")}>Discover Music</Button>
                        </div>
                      ) : (
                        <MusicGrid type="song" items={downloadedTracks} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <MusicNav activeTab={activeTab} onTabChange={setActiveTab} />
      <CreatePlaylistModal />

      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent className="rounded-[2.5rem] sm:max-w-[400px]">
          <AlertDialogHeader>
            <div className="mx-auto h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-4">
              <Trash2 className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="font-black italic uppercase tracking-tighter text-3xl text-center">Purge Content?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium leading-relaxed text-center px-4">
              This will permanently remove your signature from the ViMore music network.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6">
            <AlertDialogCancel className="rounded-xl h-12 font-bold bg-secondary/50 border-none">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="rounded-xl h-12 font-black italic uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20"
            >
              Confirm Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
