"use client";

import { useState, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  CircleDot, 
  Play, 
  ChevronRight, 
  Flame,
  Star,
  Globe,
  MapPin,
  BarChart2,
  Music2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NativeAdNode } from "@/components/ad/native-ad-node";
import { useMusic, Track } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const CHART_CATEGORIES = [
  { id: "global", label: "Top Global", icon: Globe },
  { id: "rising", label: "Rising Stars", icon: Star },
  { id: "viral", label: "Viral Hubs", icon: Flame },
];

function Sparkline({ data, color }: { data: number[], color: string }) {
  const chartData = data.map((val, i) => ({ val, index: i }));
  return (
    <div className="h-10 w-24">
      <ChartContainer config={{ val: { label: "Stream Trend", color } }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="val"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${color})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}

export function MusicCharts() {
  const [activeCategory, setActiveCategory] = useState("global");
  const { globalSongs, setTrack, currentTrack, trackStats } = useMusic();

  const rankedSongs = useMemo(() => {
    if (!globalSongs || globalSongs.length === 0) return [];
    return [...globalSongs].sort((a, b) => {
      const aLikes = trackStats[a.id]?.likes || a.likes || 0;
      const bLikes = trackStats[b.id]?.likes || b.likes || 0;
      return bLikes - aLikes;
    }).slice(0, 50);
  }, [globalSongs, trackStats]);

  if (rankedSongs.length === 0) {
    return (
      <div className="py-32 text-center space-y-6 animate-in fade-in duration-700">
        <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-primary/20">
          <Music2 className="h-10 w-10 text-primary/20" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black italic uppercase tracking-tighter">Sonic Vault Silent</h3>
          <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">No tracks have materialized in the network yet.</p>
        </div>
      </div>
    );
  }

  const topSong = rankedSongs[0];

  return (
    <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. The #1 Spotlight */}
      {topSong && (
        <div className="relative w-full aspect-video lg:aspect-[21/9] lg:min-h-[300px] rounded-[2rem] lg:rounded-[3rem] overflow-hidden group shadow-2xl">
          <Image 
            src={topSong.cover} 
            alt={topSong.title} 
            fill 
            className="object-cover brightness-[0.4] lg:brightness-50 group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col lg:flex-row items-center lg:items-center justify-center lg:justify-between px-6 sm:px-12 gap-6">
            <div className="space-y-3 sm:space-y-4 max-w-xl text-center lg:text-left">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
                <Badge className="bg-primary hover:bg-primary text-[8px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                  Global Number One
                </Badge>
                <span className="text-green-400 text-[10px] sm:text-xs font-black italic uppercase tracking-widest flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Peak Pulse Reached
                </span>
              </div>
              
              <div className="relative">
                <h1 className="hidden sm:block text-6xl sm:text-8xl font-black italic uppercase tracking-tighter leading-none opacity-10 absolute -top-4 -left-4 pointer-events-none">01</h1>
                <h2 className="text-3xl sm:text-7xl font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-2xl">
                  {topSong.title}
                </h2>
                <Link href={`/profile/${topSong.artistUsername || 'vimore'}`} className="inline-block mt-1 sm:mt-2">
                  <p className="text-lg sm:text-2xl text-primary font-bold hover:underline underline-offset-4">{topSong.artist}</p>
                </Link>
              </div>

              <Button 
                size="lg" 
                className="rounded-full bg-white text-black font-black px-8 sm:px-10 h-11 sm:h-14 hover:scale-105 transition-transform gap-2 text-xs sm:text-base"
                onClick={() => setTrack(topSong)}
              >
                <Play className="h-4 w-4 sm:h-6 sm:w-6 fill-current" /> PLAY NOW
              </Button>
            </div>

            <div className="hidden lg:block relative w-64 h-64 rounded-[2rem] overflow-hidden shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-700">
              <Image src={topSong.cover} alt="Art" fill className="object-cover" />
            </div>
          </div>
        </div>
      )}

      <NativeAdNode type="standard" />

      {/* 2. Chart Navigation */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
        {CHART_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-[10px] sm:text-sm font-black italic uppercase tracking-widest transition-all shrink-0 border",
              activeCategory === cat.id 
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/25 scale-105" 
                : "bg-white/50 dark:bg-card/50 border-border hover:bg-secondary/50 text-muted-foreground"
            )}
          >
            <cat.icon className="h-3 w-3 sm:h-4 sm:w-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. The Ranking List */}
      <div className="bg-white/30 dark:bg-card/30 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/10 overflow-hidden shadow-xl">
        <div className="grid grid-cols-[40px_1fr_50px] sm:grid-cols-[60px_1fr_120px_100px_60px] gap-2 sm:gap-4 px-4 sm:px-8 py-4 sm:py-6 text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">
          <span className="text-center"># RANK</span>
          <span>TRACK / ARTIST</span>
          <span className="hidden sm:block text-center">TREND (LIVE)</span>
          <span className="text-center">VIBES</span>
          <span className="hidden sm:block text-center">ANALYTICS</span>
        </div>

        <div className="divide-y divide-white/5">
          {rankedSongs.map((item, index) => {
            const rank = index + 1;
            const isCurrent = currentTrack?.id === item.id;
            const likes = trackStats[item.id]?.likes || item.likes || 0;

            return (
              <div 
                key={item.id} 
                className={cn(
                  "grid grid-cols-[40px_1fr_50px] sm:grid-cols-[60px_1fr_120px_100px_60px] items-center gap-2 sm:gap-4 px-4 sm:px-8 py-4 sm:py-5 group hover:bg-white/5 transition-colors cursor-pointer",
                  isCurrent && "bg-primary/5"
                )}
                onClick={() => setTrack(item)}
              >
                <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                  <span className={cn(
                    "text-lg sm:text-xl font-black italic tracking-tighter",
                    rank === 1 ? "text-primary scale-110 sm:scale-125" : "text-foreground"
                  )}>
                    {rank.toString().padStart(2, '0')}
                  </span>
                  {rank < 5 && <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-500" />}
                </div>

                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="relative h-10 w-10 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl overflow-hidden shadow-lg shrink-0">
                    <Image src={item.cover} alt={item.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-4 w-4 sm:h-6 sm:w-6 text-white fill-current" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={cn(
                      "font-black italic uppercase tracking-tight truncate text-xs sm:text-base",
                      isCurrent ? "text-primary" : "text-foreground"
                    )}>
                      {item.title}
                    </span>
                    <Link 
                      href={`/profile/${item.artistUsername || 'vimore'}`} 
                      className="text-[10px] sm:text-xs font-bold text-muted-foreground hover:text-primary transition-colors truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.artist}
                    </Link>
                  </div>
                </div>

                <div className="hidden sm:flex justify-center">
                  <Sparkline data={[20, 25, 30, 45, 50, 65, 80]} color="#9940E5" />
                </div>

                <div className="flex flex-col items-center justify-center gap-0.5 sm:gap-1">
                  <Badge variant="outline" className="text-[9px] sm:text-xs font-black border-white/10 rounded-lg bg-white/5 h-6 px-2">{(likes/1000).toFixed(1)}K</Badge>
                </div>

                <div className="hidden sm:flex justify-center">
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                    <BarChart2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pb-20">
        <div className="bg-gradient-to-br from-indigo-600 to-primary rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter leading-none">Weekly Insight</h3>
            <p className="text-white/80 text-xs sm:text-sm font-medium max-w-sm">
              Community engagement is peaking in the Afrobeats cluster. Materializing high-velocity vibes for top artists.
            </p>
          </div>
          <Star className="absolute -right-8 -bottom-8 h-32 sm:h-48 w-32 sm:w-48 opacity-10" />
        </div>

        <div className="bg-white/50 dark:bg-card/50 backdrop-blur-xl rounded-[1.5rem] sm:rounded-[2.5rem] p-6 sm:p-8 border border-white/10 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter">Vault Stats</h3>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Tracking {globalSongs.length} sonic nodes globally</p>
          </div>
          <Link href="/admin"><Button variant="outline" className="w-full sm:w-auto rounded-full border-primary text-primary font-black px-8 h-10 text-xs">View Command Core</Button></Link>
        </div>
      </div>

    </div>
  );
}
