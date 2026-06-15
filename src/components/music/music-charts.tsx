"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp, Play, Globe, Star, Flame, Music2, Zap, Crown, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NativeAdNode } from "@/components/ad/native-ad-node";
import { useMusic, Track } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

const CHART_CATEGORIES = [
  { id: "global", label: "Global", icon: Globe },
  { id: "rising", label: "Rising", icon: Star },
  { id: "viral", label: "Viral", icon: Flame },
];

function formatCount(n: number | string): string {
  const num = typeof n === "string" ? parseInt(n, 10) : n;
  if (isNaN(num)) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return String(num);
}

export function MusicCharts() {
  const [activeCategory, setActiveCategory] = useState("global");
  const { globalSongs, setTrack, currentTrack, trackStats } = useMusic();

  const rankedSongs = useMemo(() => {
    if (!globalSongs || globalSongs.length === 0) return [];
    return [...globalSongs].sort((a, b) => {
      if (a.isBoosted && !b.isBoosted) return -1;
      if (!a.isBoosted && b.isBoosted) return 1;
      const aLikes = trackStats[a.id]?.likes || a.likes || 0;
      const bLikes = trackStats[b.id]?.likes || b.likes || 0;
      return bLikes - aLikes;
    }).slice(0, 50);
  }, [globalSongs, trackStats]);

  if (rankedSongs.length === 0) {
    return (
      <div className="py-32 text-center space-y-5 animate-in fade-in duration-500">
        <div className="h-20 w-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto border-2 border-dashed border-primary/20">
          <Music2 className="h-10 w-10 text-primary/20" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black italic uppercase tracking-tighter">No Charts Yet</h3>
          <p className="text-muted-foreground text-sm">No tracks have been uploaded yet.</p>
        </div>
      </div>
    );
  }

  const topSong = rankedSongs[0];
  const top3 = rankedSongs.slice(0, 3);
  const rest = rankedSongs.slice(3);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Hero — #1 Track */}
      {topSong && (
        <div
          className="relative w-full rounded-[1.75rem] overflow-hidden cursor-pointer group shadow-2xl"
          style={{ aspectRatio: "16/9", maxHeight: "280px" }}
          onClick={() => setTrack(topSong)}
        >
          <Image src={topSong.cover} alt={topSong.title} fill className="object-cover brightness-[0.45] group-hover:brightness-[0.35] transition-all duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-5 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full gap-1 h-auto">
                <Crown className="h-3 w-3 fill-current" />
                {topSong.isBoosted ? "Promoted #1" : "Global #1"}
              </Badge>
              <span className="text-white/60 text-[10px] font-bold flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-400" />
                {formatCount(topSong.streams || 0)} plays
              </span>
              {topSong.isBoosted && (
                <span className="text-primary text-[10px] font-black flex items-center gap-1">
                  <Zap className="h-3 w-3 fill-current animate-pulse" /> Boosted
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tighter text-white leading-none line-clamp-1 drop-shadow-lg">
              {topSong.title}
            </h2>
            <Link href={`/profile/${topSong.artistUsername || "vimore"}`} onClick={e => e.stopPropagation()}>
              <p className="text-sm font-bold text-white/70 hover:text-primary transition-colors">{topSong.artist}</p>
            </Link>
            <Button
              size="sm"
              className="rounded-full bg-white text-black font-black gap-1.5 hover:scale-105 transition-transform px-5 h-9 text-xs mt-1"
              onClick={e => { e.stopPropagation(); setTrack(topSong); }}
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Play Now
            </Button>
          </div>

          {/* Large rank */}
          <div className="absolute top-4 right-4 text-[80px] font-black italic text-white/10 leading-none select-none">
            01
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CHART_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all shrink-0 border",
              activeCategory === cat.id
                ? "bg-primary border-primary text-white shadow-md shadow-primary/25"
                : "bg-white/70 dark:bg-card/60 border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <cat.icon className="h-3.5 w-3.5" />
            {cat.label}
          </button>
        ))}
        <div className="ml-auto shrink-0 flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
          <BarChart3 className="h-3.5 w-3.5" />
          {globalSongs.length} tracks
        </div>
      </div>

      {/* Top 3 podium */}
      {top3.length >= 2 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* 2nd */}
          <div className="flex flex-col items-center gap-2 pt-4">
            <div
              className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-xl cursor-pointer group"
              onClick={() => setTrack(top3[1])}
            >
              <img src={top3[1].cover} alt={top3[1].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
              <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-zinc-400 flex items-center justify-center text-white text-[11px] font-black shadow">2</div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="h-4 w-4 text-white fill-current ml-0.5" />
                </div>
              </div>
            </div>
            <p className="text-[11px] font-bold text-center line-clamp-1 w-full">{top3[1].title}</p>
            <p className="text-[10px] text-muted-foreground text-center line-clamp-1 w-full">{top3[1].artist}</p>
          </div>
          {/* 1st */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <Crown className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-6 text-yellow-400 fill-yellow-400 drop-shadow-lg z-10" />
            </div>
            <div
              className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl cursor-pointer group ring-2 ring-yellow-400/40"
              onClick={() => setTrack(top3[0])}
            >
              <img src={top3[0].cover} alt={top3[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-yellow-400 flex items-center justify-center text-black text-[11px] font-black shadow">1</div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Play className="h-5 w-5 text-white fill-current ml-0.5" />
                </div>
              </div>
            </div>
            <p className="text-[11px] font-bold text-center line-clamp-1 w-full">{top3[0].title}</p>
            <p className="text-[10px] text-muted-foreground text-center line-clamp-1 w-full">{top3[0].artist}</p>
          </div>
          {/* 3rd */}
          {top3[2] && (
            <div className="flex flex-col items-center gap-2 pt-6">
              <div
                className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
                onClick={() => setTrack(top3[2])}
              >
                <img src={top3[2].cover} alt={top3[2].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors" />
                <div className="absolute top-2 left-2 h-6 w-6 rounded-full bg-amber-700 flex items-center justify-center text-white text-[11px] font-black shadow">3</div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="h-4 w-4 text-white fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <p className="text-[11px] font-bold text-center line-clamp-1 w-full">{top3[2].title}</p>
              <p className="text-[10px] text-muted-foreground text-center line-clamp-1 w-full">{top3[2].artist}</p>
            </div>
          )}
        </div>
      )}

      <NativeAdNode type="standard" id="chart-hero-sep" />

      {/* Full ranked list */}
      <div className="space-y-1 bg-white/60 dark:bg-card/50 backdrop-blur-md rounded-2xl border border-border/40 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="grid grid-cols-[44px_1fr_auto] gap-3 px-4 py-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border/30">
          <span className="text-center">#</span>
          <span>Track</span>
          <span>Plays</span>
        </div>

        {rankedSongs.map((item, index) => {
          const rank = index + 1;
          const isCurrent = currentTrack?.id === item.id;
          const plays = parseInt(item.streams || "0", 10);
          const likes = trackStats[item.id]?.likes || item.likes || 0;

          return (
            <React.Fragment key={item.id}>
              <div
                className={cn(
                  "grid grid-cols-[44px_1fr_auto] items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5",
                  isCurrent && "bg-primary/5 dark:bg-primary/10"
                )}
                onClick={() => setTrack(item)}
              >
                {/* Rank */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className={cn(
                    "text-base font-black italic",
                    rank === 1 ? "text-yellow-500" : rank <= 3 ? "text-primary" : "text-muted-foreground"
                  )}>
                    {rank.toString().padStart(2, "0")}
                  </span>
                  {rank <= 4 && <TrendingUp className="h-2.5 w-2.5 text-green-500" />}
                </div>

                {/* Track info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-11 w-11 rounded-xl overflow-hidden shadow-md shrink-0">
                    <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-primary/10 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-4 w-4 text-white fill-current" />
                    </div>
                    {isCurrent && (
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <div className="flex gap-0.5 items-end h-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-0.5 bg-white rounded-full animate-bounce" style={{ height: `${i * 30 + 20}%`, animationDelay: `${i * 100}ms` }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={cn("text-xs font-bold truncate", isCurrent ? "text-primary" : "text-foreground")}>
                        {item.title}
                      </p>
                      {item.isBoosted && <Zap className="h-3 w-3 text-primary fill-current animate-pulse shrink-0" />}
                    </div>
                    <Link
                      href={`/profile/${item.artistUsername || "vimore"}`}
                      className="text-[10px] text-muted-foreground hover:text-primary transition-colors truncate block"
                      onClick={e => e.stopPropagation()}
                    >
                      {item.artist}
                    </Link>
                  </div>
                </div>

                {/* Plays */}
                <div className="text-right shrink-0 space-y-0.5">
                  <p className="text-[11px] font-black text-foreground">{formatCount(plays)}</p>
                  <p className="text-[9px] text-muted-foreground font-bold">{formatCount(likes)} ♥</p>
                </div>
              </div>

              {rank % 5 === 0 && rank < rankedSongs.length && (
                <NativeAdNode type="standard" id={`chart-rank-${rank}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
        <div className="bg-gradient-to-br from-violet-600 to-primary rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-1.5">
            <h3 className="text-lg font-black italic uppercase tracking-tighter">Weekly Insight</h3>
            <p className="text-white/70 text-xs leading-relaxed">Community engagement is peaking. Stay tuned for the latest trends.</p>
          </div>
          <Star className="absolute -right-5 -bottom-5 h-28 w-28 opacity-10" />
        </div>
        <div className="bg-white/60 dark:bg-card/60 backdrop-blur-md rounded-2xl p-5 border border-border/40 shadow-sm flex flex-col justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-black italic uppercase tracking-tighter">Vault Stats</h3>
            <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest">{globalSongs.length} tracks in the network</p>
          </div>
          <Link href="/admin">
            <Button variant="outline" size="sm" className="rounded-full border-primary text-primary font-bold px-5 h-9 text-xs w-full sm:w-auto">
              View Analytics
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
