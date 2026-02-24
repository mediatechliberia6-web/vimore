
"use client";

import { Play, Heart, MoreVertical, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_SONGS = [
  { id: 1, title: "Essence", artist: "Wizkid ft. Tems", cover: "https://picsum.photos/seed/song1/400/400", streams: "124M" },
  { id: 2, title: "Last Last", artist: "Burna Boy", cover: "https://picsum.photos/seed/song2/400/400", streams: "98M" },
  { id: 3, title: "Unavailable", artist: "Davido", cover: "https://picsum.photos/seed/song3/400/400", streams: "75M" },
  { id: 4, title: "Calm Down", artist: "Rema", cover: "https://picsum.photos/seed/song4/400/400", streams: "320M" },
  { id: 5, title: "Soweto", artist: "Victony", cover: "https://picsum.photos/seed/song5/400/400", streams: "45M" },
  { id: 6, title: "Rush", artist: "Ayra Starr", cover: "https://picsum.photos/seed/song6/400/400", streams: "110M" },
];

export function MusicGrid({ type }: { type: "trending" | "charts" }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
      {MOCK_SONGS.map((song) => (
        <div key={song.id} className="group relative flex flex-col gap-3">
          {/* Cover Art */}
          <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/5 shadow-2xl bg-zinc-900 group-hover:scale-[1.03] transition-all duration-500">
            <img 
              src={song.cover} 
              alt={song.title} 
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              data-ai-hint="album cover"
            />
            
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <Button size="icon" className="h-12 w-12 rounded-full bg-orange-500 hover:bg-orange-400 text-black shadow-xl shadow-orange-500/20 scale-90 group-hover:scale-100 transition-all duration-300">
                <Play className="h-6 w-6 fill-current" />
              </Button>
            </div>

            {/* Stream Count Badge */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[9px] font-black italic text-zinc-300">{song.streams}</span>
            </div>
          </div>

          {/* Song Info */}
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-sm truncate group-hover:text-orange-400 transition-colors leading-tight">
                {song.title}
              </h3>
              <button className="text-zinc-600 hover:text-white transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium truncate">{song.artist}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
