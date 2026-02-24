"use client";

import { MusicHeader } from "@/components/music/music-header";
import { GenreScroller } from "@/components/music/genre-scroller";
import { MusicGrid } from "@/components/music/music-grid";
import { MainNav } from "@/components/layout/main-nav";
import { MusicPlayer } from "@/components/music/music-player";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Mic2 } from "lucide-react";
import { useMusic } from "@/context/MusicContext";

export default function MusicPage() {
  const { isExpanded } = useMusic();

  return (
    <div className={cn(
      "min-h-screen bg-[#050505] text-zinc-100 font-body selection:bg-orange-500/30 overflow-x-hidden",
      isExpanded && "h-screen overflow-hidden"
    )}>
      {/* Dynamic Background Glow */}
      <div className="fixed top-0 left-1/4 w-[50%] h-[30%] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-screen">
        {/* Left Sidebar - Hidden on mobile, fixed on desktop */}
        <aside className="hidden lg:block border-r border-white/5 sticky top-0 h-screen overflow-y-auto bg-black/20 backdrop-blur-xl">
          <MainNav />
        </aside>

        {/* Main Music Content */}
        <main className="flex flex-col pb-40">
          {/* Top Sticky Header */}
          <MusicHeader />

          <div className="px-4 sm:px-8 py-6 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Genre Navigation */}
            <section>
              <GenreScroller />
            </section>

            {/* AI Daily Mixes */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-500 rounded-lg shadow-lg shadow-orange-500/20">
                    <Sparkles className="h-4 w-4 text-black" />
                  </div>
                  <h2 className="text-xl font-black italic uppercase tracking-tighter font-headline">AI Daily Mixes</h2>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Powered by Groq</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="aspect-square relative rounded-2xl overflow-hidden mb-3 border border-white/5 bg-zinc-900 shadow-xl transition-all group-hover:scale-[1.02] group-hover:border-orange-500/30">
                      <img 
                        src={`https://picsum.photos/seed/mix${i}/400/400`} 
                        alt="Daily Mix" 
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        data-ai-hint="abstract music"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-xs font-black italic uppercase text-orange-400">Mix {i}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Trending Now */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter font-headline">Trending Now</h2>
                </div>
                <Button variant="link" className="text-orange-500 font-bold p-0">View All</Button>
              </div>
              <MusicGrid type="trending" />
            </section>

            {/* Discovery Radar */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <Mic2 className="h-5 w-5 text-orange-500" />
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter font-headline">Discovery Radar</h2>
                </div>
                <Button variant="link" className="text-orange-500 font-bold p-0">View All</Button>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide px-1">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="min-w-[140px] flex flex-col items-center gap-3 group cursor-pointer">
                    <div className="relative h-32 w-32">
                      <img 
                        src={`https://picsum.photos/seed/artist${i}/200/200`} 
                        alt="Artist" 
                        className="h-full w-full object-cover rounded-full border-4 border-white/5 group-hover:border-orange-500/50 transition-all shadow-xl"
                        data-ai-hint="artist portrait"
                      />
                      <div className="absolute inset-0 rounded-full bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="font-bold text-sm text-center group-hover:text-orange-400 transition-colors">Artist Name</p>
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

import { cn } from "@/lib/utils";
