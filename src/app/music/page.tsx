"use client";

import { useState, useMemo } from "react";
import { MainNav } from "@/components/layout/main-nav";
import { Header } from "@/components/layout/header";
import { MusicGrid } from "@/components/music/music-grid";
import { MusicNav } from "@/components/music/music-nav";
import { MusicCharts } from "@/components/music/music-charts";
import { MusicUpload } from "@/components/music/music-upload";
import { useMusic, Album, Track, Playlist } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, X } from "lucide-react";
import Link from "next/link";

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
    songs: [
      { id: 's31', title: "Unavailable", artist: "Davido", artistUsername: "mstone", cover: "https://picsum.photos/seed/album1/400/400", duration: 185 },
      { id: 's32', title: "Feel", artist: "Davido", artistUsername: "mstone", cover: "https://picsum.photos/seed/album1/400/400", duration: 195 },
      { id: 's33', title: "Away", artist: "Davido", artistUsername: "mstone", cover: "https://picsum.photos/seed/album1/400/400", duration: 178 },
      { id: 's34', title: "Precision", artist: "Davido", artistUsername: "mstone", cover: "https://picsum.photos/seed/album1/400/400", duration: 162 },
      { id: 's35', title: "Kante", artist: "Davido ft. Fave", artistUsername: "mstone", cover: "https://picsum.photos/seed/album1/400/400", duration: 205 },
    ]
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
    songs: [
      { id: 's21', title: "Money & Love", artist: "Wizkid", artistUsername: "arivera", cover: "https://picsum.photos/seed/album2/400/400", duration: 210 },
      { id: 's22', title: "Balance", artist: "Wizkid", artistUsername: "arivera", cover: "https://picsum.photos/seed/album2/400/400", duration: 185 },
      { id: 's23', title: "Bad To Me", artist: "Wizkid", artistUsername: "arivera", cover: "https://picsum.photos/seed/album2/400/400", duration: 192 },
    ]
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
  const { currentTrack, isExpanded, selectedAlbum, selectedPlaylist } = useMusic();
  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  
  const isPlayerActive = currentTrack && !isExpanded;

  // Real-time Search Logic (Phase 3)
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

          <div className="px-4 sm:px-10 py-6 sm:py-10 space-y-10 sm:space-y-16">
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
          </div>
        </main>
      </div>

      <MusicNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
