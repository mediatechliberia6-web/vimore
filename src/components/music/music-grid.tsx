"use client";

import { Play, Pause, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusic, Track } from "@/context/MusicContext";
import Image from "next/image";

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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
      {MOCK_SONGS.map((song) => {
        const isCurrent = currentTrack?.id === song.id;
        
        return (
          <div key={song.id} className="group relative flex flex-col gap-3">
            {/* Cover Art */}
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-zinc-900 group-hover:scale-[1.03] transition-all duration-500">
              <Image 
                src={song.cover} 
                alt={song.title} 
                fill
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
              
              {/* Overlay Actions */}
              <div className={cn(
                "absolute inset-0 bg-black/40 transition-opacity flex items-center justify-center gap-3",
                isCurrent ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                <Button 
                  size="icon" 
                  className="h-12 w-12 rounded-full bg-orange-500 hover:bg-orange-400 text-black shadow-xl shadow-orange-500/20 scale-90 group-hover:scale-100 transition-all duration-300"
                  onClick={() => isCurrent ? togglePlay() : setTrack(song)}
                >
                  {isCurrent && isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
                </Button>
              </div>

              {/* Stream Count Badge */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-[9px] font-black italic text-zinc-300">{song.streams}</span>
              </div>

              {/* Active Indicator */}
              {isCurrent && isPlaying && (
                <div className="absolute bottom-2 right-2 flex gap-0.5 items-end h-4">
                  {[1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className="w-0.5 bg-orange-500 rounded-full animate-bounce h-full" 
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Song Info */}
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className={cn(
                  "font-bold text-sm truncate transition-colors leading-tight",
                  isCurrent ? "text-orange-500" : "group-hover:text-orange-400"
                )}>
                  {song.title}
                </h3>
                <button className="text-zinc-600 hover:text-white transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium truncate">{song.artist}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { cn } from "@/lib/utils";
