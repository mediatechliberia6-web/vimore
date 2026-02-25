"use client";

import { Play, Pause, MoreVertical, Heart, TrendingUp, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusic, Track, Album, Playlist } from "@/context/MusicContext";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MusicGridProps {
  type: "song" | "album" | "playlist" | "artist" | "hero";
  title?: string;
  items: any[];
}

export function MusicGrid({ type, items, title }: MusicGridProps) {
  const { currentTrack, isPlaying, setTrack, togglePlay, setSelectedAlbum, setSelectedPlaylist } = useMusic();

  const renderCard = (item: any) => {
    const isCurrent = currentTrack?.id === item.id;
    
    // Hero remains the large spotlight for visual hierarchy
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
            <div className="flex items-center gap-4">
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
        </div>
      );
    }

    // Artist remains circular for visual distinction
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

    const cardWidth = type === "playlist" ? "w-[240px]" : "w-[200px]";
    
    const handleCardClick = () => {
      if (type === "album") {
        setSelectedAlbum(item as Album);
      } else if (type === "playlist") {
        setSelectedPlaylist(item as Playlist);
      }
    };

    return (
      <div 
        key={item.id} 
        className={cn("inline-block group cursor-pointer", cardWidth)}
        onClick={handleCardClick}
      >
        <div className="relative aspect-square mb-4">
          {/* Jewel Case Visual Spine */}
          <div className="absolute -left-2 top-2 bottom-2 w-3 bg-white/20 backdrop-blur-md rounded-l-lg z-10 border-r border-white/30" />
          
          <div className="relative h-full w-full rounded-[1rem] overflow-hidden shadow-xl ring-1 ring-white/10 group-hover:-translate-y-2 transition-transform duration-500">
            <Image src={item.cover} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
            
            {/* Play Overlay (Only for non-album/playlist direct action) */}
            {type !== "album" && type !== "playlist" && (
              <div className={cn(
                "absolute inset-0 bg-primary/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center",
                isCurrent && "opacity-100"
              )}>
                <Button 
                  size="icon" 
                  className="h-12 w-12 rounded-full bg-primary text-white shadow-2xl transition-transform active:scale-90"
                  onClick={(e) => {
                    e.stopPropagation();
                    isCurrent ? togglePlay() : setTrack(item);
                  }}
                >
                  {isCurrent && isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-1" />}
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-1">
          <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{item.title}</h3>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
            {type === "song" && (
              <>
                <span>{item.artist}</span>
                <span>•</span>
                <span>{item.streams}</span>
              </>
            )}
            {type === "album" && (
              <>
                <span>{item.artist}</span>
                <span>•</span>
                <span>{item.tracks} Tracks</span>
              </>
            )}
            {type === "playlist" && (
              <>
                <span>By @{item.creator || 'vimore'}</span>
                <span>•</span>
                <span>{item.totalStreams || '0'} Plays</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
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
        type === "hero" ? "flex justify-center" : "flex gap-8 overflow-x-auto scrollbar-hide whitespace-nowrap"
      )}>
        {items.map(renderCard)}
      </div>
    </section>
  );
}
