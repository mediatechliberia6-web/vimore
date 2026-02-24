
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const GENRES = [
  "All Vibes",
  "Afrobeats",
  "Amapiano",
  "Hip-Hop",
  "Trap",
  "R&B",
  "Dancehall",
  "Gospel",
  "Lo-Fi",
  "Jazz",
  "Alternative",
  "Podcasts"
];

export function GenreScroller() {
  const [activeGenre, setActiveGenre] = useState("All Vibes");

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-3 pb-2">
        {GENRES.map((genre) => (
          <button
            key={genre}
            onClick={() => setActiveGenre(genre)}
            className={cn(
              "px-6 py-2.5 rounded-2xl text-xs font-black italic uppercase tracking-widest transition-all",
              activeGenre === genre 
                ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20 scale-105" 
                : "bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
            )}
          >
            {genre}
          </button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="opacity-0" />
    </ScrollArea>
  );
}
