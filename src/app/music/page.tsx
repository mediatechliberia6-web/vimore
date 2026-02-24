
"use client";

import { MusicHeader } from "@/components/music/music-header";
import { GenreScroller } from "@/components/music/genre-scroller";
import { MusicGrid } from "@/components/music/music-grid";
import { MainNav } from "@/components/layout/main-nav";
import { MusicPlayer } from "@/components/music/music-player";
import { Button } from "@/components/ui/button";
import { TrendingUp, Mic2, Star } from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";

export default function MusicPage() {
  const { isExpanded } = useMusic();

  return (
    <div className={cn(
      "min-h-screen bg-background text-foreground transition-colors duration-300",
      isExpanded && "h-screen overflow-hidden"
    )}>
      {/* Dynamic Background Gradients */}
      <div className="fixed top-0 left-1/4 w-[60%] h-[40%] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse" />
      <div className="fixed bottom-0 right-1/4 w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-screen">
        {/* Left Sidebar */}
        <aside className="hidden lg:block border-r border-border/50 sticky top-0 h-screen overflow-y-auto bg-card/30 backdrop-blur-xl">
          <MainNav />
        </aside>

        {/* Main Content */}
        <main className="flex flex-col pb-40 relative">
          <MusicHeader />

          <div className="px-6 sm:px-10 py-8 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            
            {/* Genre Scroller */}
            <section>
              <GenreScroller />
            </section>

            {/* Trending Now */}
            <section className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-2xl">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Trending Now</h2>
                    <p className="text-xs text-muted-foreground font-medium">Most played tracks this week</p>
                  </div>
                </div>
                <Button variant="ghost" className="text-primary font-bold hover:bg-primary/5 rounded-full">See All</Button>
              </div>
              <MusicGrid type="trending" />
            </section>

            {/* Discovery Radar */}
            <section className="bg-card/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-border/50 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-2xl">
                    <Mic2 className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Discovery Radar</h2>
                    <p className="text-xs text-muted-foreground font-medium">Rising creators you should follow</p>
                  </div>
                </div>
                <Button variant="outline" className="rounded-full border-primary/20 text-primary hover:bg-primary/10">Browse All</Button>
              </div>
              
              <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-hide">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="min-w-[160px] flex flex-col items-center gap-4 group cursor-pointer">
                    <div className="relative h-32 w-32">
                      <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <img 
                        src={`https://picsum.photos/seed/artist${i + 15}/200/200`} 
                        alt="Artist" 
                        className="relative h-full w-full object-cover rounded-full border-4 border-background group-hover:border-primary transition-all duration-500 shadow-2xl"
                      />
                      <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-background shadow-lg scale-0 group-hover:scale-100 transition-transform">
                        <Star className="h-3 w-3 fill-current" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm group-hover:text-primary transition-colors">Rising Creator {i}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Afrobeats</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </main>
      </div>

      {/* Global Music Player */}
      <MusicPlayer />
    </div>
  );
}
