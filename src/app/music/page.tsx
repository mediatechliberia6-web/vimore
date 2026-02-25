"use client";

import { MainNav } from "@/components/layout/main-nav";
import { Header } from "@/components/layout/header";
import { MusicGrid } from "@/components/music/music-grid";
import { MusicNav } from "@/components/music/music-nav";
import { useMusic, Album, Track, Playlist } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

const MOCK_SONGS: Track[] = [
  { id: 1, title: "Essence", artist: "Wizkid ft. Tems", artistUsername: "arivera", cover: "https://picsum.photos/seed/song1/600/600", duration: 240, streams: "124M" },
  { id: 2, title: "Last Last", artist: "Burna Boy", artistUsername: "schen_dev", cover: "https://picsum.photos/seed/song2/600/600", duration: 172, streams: "98M" },
  { id: 3, title: "Unavailable", artist: "Davido", artistUsername: "mstone", cover: "https://picsum.photos/seed/song3/600/600", duration: 185, streams: "75M" },
  { id: 4, title: "Calm Down", artist: "Rema", artistUsername: "techex", cover: "https://picsum.photos/seed/song4/600/600", duration: 219, streams: "320M" },
  { id: 5, title: "Soweto", artist: "Victony", artistUsername: "jmoore", cover: "https://picsum.photos/seed/song5/600/600", duration: 164, streams: "45M" },
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
  { id: 'ar3', name: "Tems", username: "techex", role: "Producer", avatar: "https://picsum.photos/seed/art3/200/200" },
  { id: 'ar4', name: "Olamide", username: "mstone", role: "Rapper", avatar: "https://picsum.photos/seed/art4/200/200" },
];

export default function MusicPage() {
  const { currentTrack, isExpanded, selectedAlbum, selectedPlaylist } = useMusic();
  const isPlayerActive = currentTrack && !isExpanded;

  return (
    <div className={cn(
      "min-h-screen bg-[#F0F2F5] dark:bg-background transition-colors duration-300",
      (isExpanded || selectedAlbum || selectedPlaylist) && "h-screen overflow-hidden"
    )}>
      <Header />
      
      {/* Immersive Background Glows */}
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
          {/* Sub-header with Back Button and Search */}
          <div className={cn(
            "sticky z-30 bg-[#F0F2F5]/80 dark:bg-background/80 backdrop-blur-md px-6 sm:px-10 py-4 flex items-center justify-between border-b border-border/50 transition-all duration-300",
            isPlayerActive ? "top-[125px]" : "top-[61px]"
          )}>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 transition-colors">
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              </Link>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter hidden xs:block">Music Hub</h1>
            </div>

            {/* Music Discovery Search Bar */}
            <div className="relative group flex-1 max-w-md ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search songs, albums, or artists..." 
                className="pl-10 h-10 bg-white/50 dark:bg-card/50 border-primary/10 rounded-xl focus-visible:ring-primary/20 text-sm"
              />
            </div>
          </div>

          <div className="px-6 sm:px-10 py-10 space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            
            {/* 1. Hero Spotlight */}
            <MusicGrid type="hero" items={[MOCK_SONGS[0]]} />

            {/* 2. Trending Songs */}
            <MusicGrid type="song" title="Trending Songs" items={MOCK_SONGS} />

            {/* 3. Trending Albums */}
            <MusicGrid type="album" title="Trending Albums" items={MOCK_ALBUMS} />

            {/* 4. New Releases */}
            <MusicGrid type="song" title="New Releases" items={[...MOCK_SONGS].reverse()} />

            {/* 5. Top Playlists */}
            <MusicGrid type="playlist" title="Top Playlists" items={MOCK_PLAYLISTS} />

            {/* 6. Trending Artists */}
            <MusicGrid type="artist" title="Trending Artists" items={MOCK_ARTISTS} />

          </div>
        </main>
      </div>

      <MusicNav />
    </div>
  );
}
