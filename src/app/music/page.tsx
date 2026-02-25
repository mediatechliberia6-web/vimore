
"use client";

import { MainNav } from "@/components/layout/main-nav";
import { Header } from "@/components/layout/header";
import { MusicGrid } from "@/components/music/music-grid";
import { MusicPlayer } from "@/components/music/music-player";
import { MusicNav } from "@/components/music/music-nav";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";

const MOCK_SONGS = [
  { id: 1, title: "Essence", artist: "Wizkid ft. Tems", cover: "https://picsum.photos/seed/song1/600/600", duration: 240, streams: "124M" },
  { id: 2, title: "Last Last", artist: "Burna Boy", cover: "https://picsum.photos/seed/song2/600/600", duration: 172, streams: "98M" },
  { id: 3, title: "Unavailable", artist: "Davido", cover: "https://picsum.photos/seed/song3/600/600", duration: 185, streams: "75M" },
  { id: 4, title: "Calm Down", artist: "Rema", cover: "https://picsum.photos/seed/song4/600/600", duration: 219, streams: "320M" },
  { id: 5, title: "Soweto", artist: "Victony", cover: "https://picsum.photos/seed/song5/600/600", duration: 164, streams: "45M" },
];

const MOCK_ALBUMS = [
  { id: 'a1', title: "Timeless", artist: "Davido", cover: "https://picsum.photos/seed/album1/400/400", year: "2023", tracks: 17 },
  { id: 'a2', title: "More Love, Less Ego", artist: "Wizkid", cover: "https://picsum.photos/seed/album2/400/400", year: "2022", tracks: 13 },
  { id: 'a3', title: "Love, Damini", artist: "Burna Boy", cover: "https://picsum.photos/seed/album3/400/400", year: "2022", tracks: 19 },
  { id: 'a4', title: "Rave & Roses", artist: "Rema", cover: "https://picsum.photos/seed/album4/400/400", year: "2023", tracks: 16 },
];

const MOCK_PLAYLISTS = [
  { id: 'p1', title: "AFRO-FUSION", cover: "https://picsum.photos/seed/play1/800/450" },
  { id: 'p2', title: "MIDNIGHT LO-FI", cover: "https://picsum.photos/seed/play2/800/450" },
  { id: 'p3', title: "URBAN ENERGY", cover: "https://picsum.photos/seed/play3/800/450" },
];

const MOCK_ARTISTS = [
  { id: 'ar1', name: "Ayra Starr", role: "Vocalist", avatar: "https://picsum.photos/seed/art1/200/200", isLive: true },
  { id: 'ar2', name: "Asake", role: "Singer", avatar: "https://picsum.photos/seed/art2/200/200" },
  { id: 'ar3', name: "Tems", role: "Producer", avatar: "https://picsum.photos/seed/art3/200/200" },
  { id: 'ar4', name: "Olamide", role: "Rapper", avatar: "https://picsum.photos/seed/art4/200/200" },
];

export default function MusicPage() {
  const { isExpanded } = useMusic();

  return (
    <div className={cn(
      "min-h-screen bg-[#F0F2F5] dark:bg-background transition-colors duration-300",
      isExpanded && "h-screen overflow-hidden"
    )}>
      <Header />
      
      {/* Immersive Background Glows */}
      <div className="fixed top-0 left-1/4 w-[60%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block sticky top-[61px] h-[calc(100vh-61px)] border-r border-border/50">
          <MainNav />
        </aside>

        <main className="flex flex-col pb-48 relative">
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

      <MusicPlayer />
      <MusicNav />
    </div>
  );
}
