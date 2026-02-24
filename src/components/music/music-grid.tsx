
"use client";

import { Play, Pause, MoreVertical, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusic, Track } from "@/context/MusicContext";
import Image from "next/image";
import { cn } from "@/lib/utils";

const MOCK_SONGS: Track[] = [
  { id: 1, title: "Essence", artist: "Wizkid ft. Tems", cover: "https://picsum.photos/seed/song1/400/400", streams: "124M", duration: 240 },
  { id: 2, title: "Last Last", artist: "Burna Boy", cover: "https://picsum.photos/seed/song2/400/400", streams: "98M", duration: 172 },
  { id: 3, title: "Unavailable", artist: "Davido", cover: "https://picsum.photos/seed/song3/400/400", streams: "75M", duration: 185 },
  { id: 4, title: "Calm Down", artist: "Rema", cover: "https://picsum.photos/seed/song4/400/400", streams: "320M", duration: 219 },
  { id: 5, title: "Soweto", artist: "Victony", cover: "https://picsum.photos/seed/song5/400/400", streams: "45M", duration: 164 },
  { id: 6, title: "Rush", artist: "Ayra Starr", cover: "https://picsum.photos/seed/song6/400/400", streams: "110M", duration: 188 },
];

export function MusicGrid({ type }: { type: "trending" | "charts" }) {
  const { currentTrack, isPlaying, setTrack, togglePlay } = useMusic();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
      {MOCK_SONGS.map((song) => {
        const isCurrent = currentTrack?.id === song.id;
        
        return (
          <div key={song.id} className="group relative flex flex-col gap-4">
            {/* Cover Art */}
            <div className="relative aspect-square rounded-[2rem] overflow-hidden border border-border shadow-md bg-card group-hover:scale-[1.03] transition-all duration-500 group-hover:shadow-xl group-hover:shadow-primary/10">
              <Image 
                src={song.cover} 
                alt={song.title} 
                fill
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay Actions */}
              <div className={cn(
                "absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity flex items-center justify-center",
                isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                <Button 
                  size="icon" 
                  className="h-14 w-14 rounded-full bg-white text-primary hover:bg-primary hover:text-white shadow-2xl scale-90 group-hover:scale-100 transition-all duration-500"
                  onClick={() => isCurrent ? togglePlay() : setTrack(song)}
                >
                  {isCurrent && isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="h-7 w-7 fill-current ml-1" />}
                </Button>
              </div>

              {/* Like Button */}
              <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/40">
                 <Heart className="h-4 w-4 text-white" />
              </button>

              {/* Active Animation */}
              {isCurrent && isPlaying && (
                <div className="absolute bottom-4 right-4 flex gap-0.5 items-end h-5">
                  {[1, 2, 3, 4].map(i => (
                    <div 
                      key={i} 
                      className="w-1 bg-white rounded-full animate-bounce h-full" 
                      style={{ 
                        height: `${Math.random() * 60 + 40}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.6s'
                      }} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Song Info */}
            <div className="space-y-1.5 px-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className={cn(
                  "font-bold text-sm truncate transition-colors leading-tight",
                  isCurrent ? "text-primary" : "group-hover:text-primary"
                )}>
                  {song.title}
                </h3>
                <button className="text-muted-foreground hover:text-primary transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium truncate">{song.artist}</p>
                <span className="text-[10px] font-bold text-muted-foreground/60">{song.streams}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
