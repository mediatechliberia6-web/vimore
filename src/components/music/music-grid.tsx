
"use client";

import { Play, Pause, MoreVertical, Heart, TrendingUp, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusic, Track } from "@/context/MusicContext";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MusicGridProps {
  type: "song" | "album" | "playlist" | "artist" | "hero";
  title?: string;
  items: any[];
}

export function MusicGrid({ type, items, title }: MusicGridProps) {
  const { currentTrack, isPlaying, setTrack, togglePlay } = useMusic();

  const renderCard = (item: any) => {
    const isCurrent = currentTrack?.id === item.id;
    
    if (type === "hero") {
      return (
        <div key={item.id} className="relative w-full max-w-4xl h-[400px] rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl ring-1 ring-white/10">
          <Image src={item.cover} alt={item.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest animate-pulse">#1 Trending Now</span>
            </div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg">{item.title}</h1>
            <p className="text-xl text-white/70 font-bold">{item.artist}</p>
            <Button 
              size="lg" 
              className="rounded-full bg-white text-primary font-black px-10 h-14 hover:scale-105 transition-transform"
              onClick={() => isCurrent ? togglePlay() : setTrack(item)}
            >
              {isCurrent && isPlaying ? <Pause className="mr-2 h-6 w-6 fill-current" /> : <Play className="mr-2 h-6 w-6 fill-current" />}
              {isCurrent && isPlaying ? "PAUSE" : "PLAY NOW"}
            </Button>
          </div>
        </div>
      );
    }

    if (type === "song") {
      return (
        <div key={item.id} className="inline-block w-[220px] group cursor-pointer">
          <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-card shadow-lg ring-1 ring-primary/5 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:-translate-y-2">
            <Image src={item.cover} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            
            {/* Sonic Card Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-black/40 backdrop-blur-md border-t border-white/10">
              <p className="text-xs font-bold text-white truncate">{item.title}</p>
              <p className="text-[10px] text-white/60 font-medium truncate">{item.artist}</p>
            </div>

            <div className={cn(
              "absolute inset-0 bg-primary/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center",
              isCurrent && "opacity-100"
            )}>
              <Button 
                size="icon" 
                className="h-14 w-14 rounded-full bg-primary text-white shadow-2xl transition-transform active:scale-90"
                onClick={() => isCurrent ? togglePlay() : setTrack(item)}
              >
                {isCurrent && isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="h-7 w-7 fill-current ml-1" />}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (type === "album") {
      return (
        <div key={item.id} className="inline-block w-[200px] group cursor-pointer">
          <div className="relative aspect-square mb-4">
            {/* Jewel Case Visual Spine */}
            <div className="absolute -left-2 top-2 bottom-2 w-3 bg-white/20 backdrop-blur-md rounded-l-lg z-10 border-r border-white/30" />
            <div className="relative h-full w-full rounded-[1rem] overflow-hidden shadow-xl ring-1 ring-white/10 group-hover:-translate-y-2 transition-transform duration-500">
              <Image src={item.cover} alt={item.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{item.title}</h3>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
              <span>{item.year}</span>
              <span>•</span>
              <span>{item.tracks} Tracks</span>
            </div>
          </div>
        </div>
      );
    }

    if (type === "playlist") {
      return (
        <div key={item.id} className="inline-block w-[320px] group cursor-pointer">
          <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-xl ring-1 ring-white/10 group-hover:shadow-primary/20 transition-all">
            <Image src={item.cover} alt={item.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white text-center drop-shadow-2xl">{item.title}</h2>
            </div>
          </div>
        </div>
      );
    }

    if (type === "artist") {
      return (
        <div key={item.id} className="inline-block w-[160px] text-center space-y-3 group cursor-pointer">
          <div className="relative mx-auto h-32 w-32">
            <div className={cn(
              "absolute inset-0 bg-primary/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
              item.isLive && "opacity-100 animate-pulse bg-red-500/20"
            )} />
            <div className={cn(
              "relative h-full w-full rounded-full overflow-hidden border-4 border-background transition-all duration-500",
              item.isLive ? "border-red-500" : "group-hover:border-primary"
            )}>
              <Image src={item.avatar} alt={item.name} fill className="object-cover" />
            </div>
            {item.isLive && (
              <span className="absolute -top-1 right-2 bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full ring-2 ring-background">LIVE</span>
            )}
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{item.name}</h3>
            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{item.role}</p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <section className="space-y-6">
      {title && (
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">{title}</h2>
          <Button variant="ghost" className="text-primary font-black text-xs uppercase tracking-widest hover:bg-primary/5 rounded-full">See All</Button>
        </div>
      )}
      <div className={cn(
        "pb-6 px-2",
        type === "hero" ? "flex justify-center" : "flex gap-6 overflow-x-auto scrollbar-hide whitespace-nowrap"
      )}>
        {items.map(renderCard)}
      </div>
    </section>
  );
}
