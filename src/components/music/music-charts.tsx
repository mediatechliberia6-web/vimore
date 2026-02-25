
"use client";

import { useState } from "react";
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
  BarChart2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMusic, Track } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const CHART_CATEGORIES = [
  { id: "global", label: "Top 50 Global", icon: Globe },
  { id: "rising", label: "Rising Stars", icon: Star },
  { id: "viral", label: "Viral Hubs", icon: Flame },
  { id: "regional", label: "Top in Lagos", icon: MapPin },
];

const MOCK_CHART_DATA = [
  { rank: 1, title: "Essence", artist: "Wizkid ft. Tems", artistUsername: "arivera", cover: "https://picsum.photos/seed/song1/200/200", trend: "up", gain: "+12.5%", peak: 1, trendData: [40, 45, 42, 50, 55, 58, 65] },
  { rank: 2, title: "Last Last", artist: "Burna Boy", artistUsername: "schen_dev", cover: "https://picsum.photos/seed/song2/200/200", trend: "down", gain: "-2.1%", peak: 1, trendData: [60, 58, 55, 52, 50, 48, 45] },
  { rank: 3, title: "Unavailable", artist: "Davido", artistUsername: "mstone", cover: "https://picsum.photos/seed/song3/200/200", trend: "new", gain: "New", peak: 3, trendData: [0, 10, 25, 30, 45, 55, 60] },
  { rank: 4, title: "Calm Down", artist: "Rema", artistUsername: "techex", cover: "https://picsum.photos/seed/song4/200/200", trend: "up", gain: "+8.4%", peak: 2, trendData: [30, 32, 35, 38, 40, 42, 45] },
  { rank: 5, title: "Soweto", artist: "Victony", artistUsername: "jmoore", cover: "https://picsum.photos/seed/song5/200/200", trend: "down", gain: "-0.5%", peak: 4, trendData: [50, 49, 48, 47, 46, 45, 44] },
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
  const { setTrack, currentTrack } = useMusic();

  const topSong = MOCK_CHART_DATA[0];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. The #1 Spotlight */}
      <div className="relative w-full aspect-[21/9] min-h-[300px] rounded-[3rem] overflow-hidden group shadow-2xl">
        <Image 
          src={topSong.cover} 
          alt={topSong.title} 
          fill 
          className="object-cover brightness-50 group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-between px-12">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3">
              <Badge className="bg-primary hover:bg-primary text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                Global Number One
              </Badge>
              <span className="text-green-400 text-xs font-black italic uppercase tracking-widest flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> {topSong.gain} Stream Gain
              </span>
            </div>
            
            <div>
              <h1 className="text-6xl sm:text-8xl font-black italic uppercase tracking-tighter leading-none opacity-10 absolute -top-4 -left-4 pointer-events-none">01</h1>
              <h2 className="text-5xl sm:text-7xl font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-2xl">
                {topSong.title}
              </h2>
              <Link href={`/profile/${topSong.artistUsername}`} className="inline-block mt-2">
                <p className="text-2xl text-primary font-bold hover:underline underline-offset-4">{topSong.artist}</p>
              </Link>
            </div>

            <Button 
              size="lg" 
              className="rounded-full bg-white text-black font-black px-10 h-14 hover:scale-105 transition-transform gap-2"
              onClick={() => setTrack(topSong as any)}
            >
              <Play className="h-6 w-6 fill-current" /> PLAY NOW
            </Button>
          </div>

          <div className="hidden lg:block relative w-64 h-64 rounded-[2rem] overflow-hidden shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-700">
            <Image src={topSong.cover} alt="Art" fill className="object-cover" />
          </div>
        </div>
      </div>

      {/* 2. Chart Navigation */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
        {CHART_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-full text-sm font-black italic uppercase tracking-widest transition-all shrink-0 border",
              activeCategory === cat.id 
                ? "bg-primary border-primary text-white shadow-lg shadow-primary/25 scale-105" 
                : "bg-white/50 dark:bg-card/50 border-border hover:bg-secondary/50 text-muted-foreground"
            )}
          >
            <cat.icon className="h-4 w-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. The Ranking List */}
      <div className="bg-white/30 dark:bg-card/30 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-xl">
        <div className="grid grid-cols-[60px_1fr_120px_100px_60px] gap-4 px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] border-b border-white/5">
          <span className="text-center"># RANK</span>
          <span>TRACK / ARTIST</span>
          <span className="text-center">TREND (7D)</span>
          <span className="text-center">PEAK</span>
          <span className="text-center">STATS</span>
        </div>

        <div className="divide-y divide-white/5">
          {MOCK_CHART_DATA.map((item) => {
            const isCurrent = currentTrack?.title === item.title;
            const trendColor = item.trend === "up" ? "#4ADE80" : item.trend === "down" ? "#FB7185" : "#6E96FF";

            return (
              <div 
                key={item.rank} 
                className={cn(
                  "grid grid-cols-[60px_1fr_120px_100px_60px] items-center gap-4 px-8 py-5 group hover:bg-white/5 transition-colors cursor-pointer",
                  isCurrent && "bg-primary/5"
                )}
                onClick={() => setTrack(item as any)}
              >
                {/* Rank & Movement */}
                <div className="flex flex-col items-center gap-1">
                  <span className={cn(
                    "text-xl font-black italic italic tracking-tighter",
                    item.rank === 1 ? "text-primary scale-125" : "text-foreground"
                  )}>
                    {item.rank.toString().padStart(2, '0')}
                  </span>
                  {item.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {item.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                  {item.trend === "new" && <CircleDot className="h-3 w-3 text-blue-500" />}
                </div>

                {/* Track Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative h-14 w-14 rounded-xl overflow-hidden shadow-lg shrink-0">
                    <Image src={item.cover} alt={item.title} fill className="object-cover" />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-6 w-6 text-white fill-current" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={cn(
                      "font-black italic uppercase tracking-tight truncate",
                      isCurrent ? "text-primary" : "text-foreground"
                    )}>
                      {item.title}
                    </span>
                    <Link 
                      href={`/profile/${item.artistUsername}`} 
                      className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {item.artist}
                    </Link>
                  </div>
                </div>

                {/* Trend Graph */}
                <div className="flex justify-center">
                  <Sparkline data={item.trendData} color={trendColor} />
                </div>

                {/* Peak Stats */}
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Peak Position</span>
                  <Badge variant="outline" className="font-black border-white/10 rounded-lg bg-white/5">#{item.peak}</Badge>
                </div>

                {/* Interaction */}
                <div className="flex justify-center">
                  <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                    <BarChart2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Insight Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        <div className="bg-gradient-to-br from-indigo-600 to-primary rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Weekly Insight</h3>
            <p className="text-white/80 text-sm font-medium max-w-sm">
              Afrobeats is dominating the global charts this week, with a 24% increase in listener retention across the ViMore ecosystem.
            </p>
            <Button className="mt-4 bg-white text-primary font-black rounded-xl px-6 h-11">View Full Report</Button>
          </div>
          <Star className="absolute -right-8 -bottom-8 h-48 w-48 opacity-10" />
        </div>

        <div className="bg-white/50 dark:bg-card/50 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Your Chart Prediction</h3>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Predict the next #1 and win tokens</p>
          </div>
          <Button variant="outline" className="rounded-full border-primary text-primary font-black px-8">Predict</Button>
        </div>
      </div>

    </div>
  );
}
