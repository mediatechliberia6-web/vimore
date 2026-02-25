
"use client";

import { MusicHeader } from "@/components/music/music-header";
import { GenreScroller } from "@/components/music/genre-scroller";
import { MainNav } from "@/components/layout/main-nav";
import { MusicPlayer } from "@/components/music/music-player";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TrendingUp, Mic2, Star, Disc, ListMusic, Sparkles, ChevronRight } from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import { MusicGrid } from "@/components/music/music-grid";
import Image from "next/image";

const MOCK_ALBUMS = [
  { id: 'a1', title: "Timeless", artist: "Davido", cover: "https://picsum.photos/seed/album1/400/400" },
  { id: 'a2', title: "More Love, Less Ego", artist: "Wizkid", cover: "https://picsum.photos/seed/album2/400/400" },
  { id: 'a3', title: "Love, Damini", artist: "Burna Boy", cover: "https://picsum.photos/seed/album3/400/400" },
  { id: 'a4', title: "Rave & Roses", artist: "Rema", cover: "https://picsum.photos/seed/album4/400/400" },
  { id: 'a5', title: "Boy Alone", artist: "Omah Lay", cover: "https://picsum.photos/seed/album5/400/400" },
];

const MOCK_ARTISTS = [
  { id: 'ar1', name: "Ayra Starr", role: "Vocalist", avatar: "https://picsum.photos/seed/art1/200/200" },
  { id: 'ar2', name: "Asake", role: "Singer", avatar: "https://picsum.photos/seed/art2/200/200" },
  { id: 'ar3', name: "Tems", role: "Producer", avatar: "https://picsum.photos/seed/art3/200/200" },
  { id: 'ar4', name: "Olamide", role: "Rapper", avatar: "https://picsum.photos/seed/art4/200/200" },
  { id: 'ar5', name: "Fireboy DML", role: "Artist", avatar: "https://picsum.photos/seed/art5/200/200" },
];

const MOCK_PLAYLISTS = [
  { id: 'p1', title: "Afro-Fusion", count: "50 songs", cover: "https://picsum.photos/seed/play1/400/400" },
  { id: 'p2', title: "Midnight Lo-Fi", count: "32 songs", cover: "https://picsum.photos/seed/play2/400/400" },
  { id: 'p3', title: "Workout Energy", count: "25 songs", cover: "https://picsum.photos/seed/play3/400/400" },
  { id: 'p4', title: "Sunday Soul", count: "40 songs", cover: "https://picsum.photos/seed/play4/400/400" },
];

export default function MusicPage() {
  const { isExpanded } = useMusic();

  const MusicSection = ({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) => (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-2xl">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          </div>
        </div>
        <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-full group">
          See All <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
      <ScrollArea className="w-full whitespace-nowrap -mx-2">
        <div className="flex gap-6 pb-6 px-2">
          {children}
        </div>
        <ScrollBar orientation="horizontal" className="opacity-0" />
      </ScrollArea>
    </section>
  );

  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground transition-colors duration-300",
      isExpanded && "h-screen overflow-hidden"
    )}>
      {/* Dynamic Background Gradients */}
      <div className="fixed top-0 left-1/4 w-[60%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-screen">
        {/* Left Sidebar */}
        <aside className="hidden lg:block border-r border-border/50 sticky top-0 h-screen overflow-y-auto bg-card/30 backdrop-blur-xl">
          <MainNav />
        </aside>

        {/* Main Content */}
        <main className="flex flex-col pb-40 relative">
          <MusicHeader />

          <div className="px-6 sm:px-10 py-8 space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {/* Genre Scroller */}
            <section>
              <GenreScroller />
            </section>

            {/* 1. Trending Now (Featured Large) */}
            <MusicSection title="Trending Now" icon={TrendingUp}>
              <MusicGrid type="trending" isRow />
            </MusicSection>

            {/* 2. Trending Songs */}
            <MusicSection title="Trending Songs" icon={Star}>
              <MusicGrid type="charts" isRow />
            </MusicSection>

            {/* 3. Trending Albums */}
            <MusicSection title="Trending Albums" icon={Disc}>
              {MOCK_ALBUMS.map((album) => (
                <div key={album.id} className="inline-block w-[200px] group cursor-pointer">
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-primary/20">
                    <Image src={album.cover} alt={album.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    {/* Vinyl Stack Effect */}
                    <div className="absolute -right-1 top-2 bottom-2 w-1 bg-black/40 rounded-r-full" />
                  </div>
                  <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{album.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{album.artist}</p>
                </div>
              ))}
            </MusicSection>

            {/* 4. New Releases */}
            <MusicSection title="New Releases" icon={Sparkles}>
              <MusicGrid type="charts" isRow />
            </MusicSection>

            {/* 5. Trending Artists (Circular) */}
            <MusicSection title="Trending Artists" icon={Mic2}>
              {MOCK_ARTISTS.map((artist) => (
                <div key={artist.id} className="inline-block w-[160px] text-center space-y-3 group cursor-pointer">
                  <div className="relative mx-auto h-32 w-32">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative h-full w-full rounded-full overflow-hidden border-4 border-background group-hover:border-primary transition-all duration-500">
                      <Image src={artist.avatar} alt={artist.name} fill className="object-cover" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm group-hover:text-primary transition-colors">{artist.name}</h3>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{artist.role}</p>
                    <Button variant="ghost" size="sm" className="mt-2 h-7 rounded-full text-[10px] font-bold border border-primary/20 hover:bg-primary hover:text-white transition-all">
                      Follow
                    </Button>
                  </div>
                </div>
              ))}
            </MusicSection>

            {/* 6. Trending Playlists */}
            <MusicSection title="Trending Playlists" icon={ListMusic}>
              {MOCK_PLAYLISTS.map((playlist) => (
                <div key={playlist.id} className="inline-block w-[240px] group cursor-pointer">
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 shadow-lg group-hover:shadow-xl transition-all">
                    <Image src={playlist.cover} alt={playlist.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <p className="text-white font-bold text-lg leading-tight">{playlist.title}</p>
                      <p className="text-white/70 text-[10px] font-medium uppercase tracking-widest">{playlist.count}</p>
                    </div>
                  </div>
                </div>
              ))}
            </MusicSection>

          </div>
        </main>
      </div>

      {/* Global Music Player */}
      <MusicPlayer />
    </div>
  );
}
