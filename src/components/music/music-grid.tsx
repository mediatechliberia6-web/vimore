
"use client";

import { Play, Pause, MoreVertical, Heart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusic, Track } from "@/context/MusicContext";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useState } from "react";

const MOCK_SONGS: Track[] = [
  { id: 1, title: "Essence", artist: "Wizkid ft. Tems", cover: "https://picsum.photos/seed/song1/400/400", streams: "124M", duration: 240 },
  { id: 2, title: "Last Last", artist: "Burna Boy", cover: "https://picsum.photos/seed/song2/400/400", streams: "98M", duration: 172 },
  { id: 3, title: "Unavailable", artist: "Davido", cover: "https://picsum.photos/seed/song3/400/400", streams: "75M", duration: 185 },
  { id: 4, title: "Calm Down", artist: "Rema", cover: "https://picsum.photos/seed/song4/400/400", streams: "320M", duration: 219 },
  { id: 5, title: "Soweto", artist: "Victony", cover: "https://picsum.photos/seed/song5/400/400", streams: "45M", duration: 164 },
  { id: 6, title: "Rush", artist: "Ayra Starr", cover: "https://picsum.photos/seed/song6/400/400", streams: "110M", duration: 188 },
];

export function MusicGrid({ type, isRow }: { type: "trending" | "charts", isRow?: boolean }) {
  const { currentTrack, isPlaying, setTrack, togglePlay } = useMusic();
  const [likedSongs, setLikedSongs] = useState<Set<number | string>>(new Set());

  const toggleLike = (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation();
    const newLiked = new Set(likedSongs);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedSongs(newLiked);
  };

  const gridClasses = isRow 
    ? "flex flex-nowrap" 
    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";

  return (
    <div className={cn(gridClasses, "gap-6 sm:gap-8")}>
      {MOCK_SONGS.map((song) => {
        const isCurrent = currentTrack?.id === song.id;
        const isLiked = likedSongs.has(song.id);
        
        return (
          <div 
            key={song.id} 
            className={cn(
              "group relative flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-500",
              isRow && "min-w-[180px] sm:min-w-[220px]"
            )}
          >
            {/* Cover Art Wrapper */}
            <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-card shadow-lg ring-1 ring-primary/5 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/20 group-hover:-translate-y-1">
              <Image 
                src={song.cover} 
                alt={song.title} 
                fill
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              
              {/* Intelligent Glass Overlay */}
              <div className={cn(
                "absolute inset-0 bg-black/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center",
                isCurrent && "opacity-100 bg-primary/20 backdrop-blur-[2px]"
              )}>
                <Button 
                  size="icon" 
                  className={cn(
                    "h-14 w-14 rounded-full shadow-2xl scale-90 group-hover:scale-100 transition-all duration-300",
                    isCurrent 
                      ? "bg-white text-primary" 
                      : "bg-primary text-white hover:bg-white hover:text-primary"
                  )}
                  onClick={() => isCurrent ? togglePlay() : setTrack(song)}
                >
                  {isCurrent && isPlaying ? (
                    <Pause className="h-7 w-7 fill-current" />
                  ) : (
                    <Play className="h-7 w-7 fill-current ml-1" />
                  )}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                <button 
                  onClick={(e) => toggleLike(e, song.id)}
                  className={cn(
                    "p-2 rounded-full backdrop-blur-md transition-all active:scale-90",
                    isLiked 
                      ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                      : "bg-black/20 text-white hover:bg-black/40"
                  )}
                >
                  <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                </button>
                <button className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-all">
                   <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              {/* Status Indicators */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                {isCurrent && isPlaying && (
                  <div className="flex gap-0.5 items-end h-4 px-2 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                    {[1, 2, 3].map(i => (
                      <div 
                        key={i} 
                        className="w-0.5 bg-white rounded-full animate-bounce h-full" 
                        style={{ 
                          height: `${40 + i * 20}%`,
                          animationDelay: `${i * 0.15}s`,
                          animationDuration: '0.6s'
                        }} 
                      />
                    ))}
                  </div>
                )}
                {type === "trending" && (
                  <div className="bg-primary/80 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-tighter px-2 py-1 rounded-full border border-white/20 shadow-lg">
                    Trending
                  </div>
                )}
              </div>
            </div>

            {/* Song Info */}
            <div className="space-y-1.5 px-1">
              <div className="flex flex-col">
                <h3 className={cn(
                  "font-black text-[15px] tracking-tight truncate transition-colors",
                  isCurrent ? "text-primary" : "text-foreground group-hover:text-primary"
                )}>
                  {song.title}
                </h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">
                  {song.artist}
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-primary/5">
                <div className="flex items-center gap-1.5">
                   <TrendingUp className="h-3 w-3 text-primary opacity-40" />
                   <span className="text-[10px] font-black text-muted-foreground/60">{song.streams}</span>
                </div>
                <span className="text-[9px] font-bold text-muted-foreground/40 bg-secondary/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
