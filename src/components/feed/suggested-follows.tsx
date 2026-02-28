"use client";

import { useMemo } from "react";
import { Users, UserPlus, ChevronRight, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function SuggestedFollows() {
  const { connections, isFollowing, toggleFollowUser } = usePosts();
  const { triggerHaptic } = useMusic();

  const suggestions = useMemo(() => {
    return connections.filter(c => !isFollowing(c.username)).slice(0, 8);
  }, [connections, isFollowing]);

  if (suggestions.length === 0) return null;

  return (
    <div className="w-full bg-white dark:bg-card rounded-[2rem] border border-primary/5 py-6 space-y-4 shadow-sm mb-4">
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Users className="h-4 w-4" />
          </div>
          <h3 className="font-black italic uppercase tracking-widest text-sm">People You May Know</h3>
        </div>
        <Button variant="ghost" className="text-primary font-black uppercase text-[10px] tracking-widest h-8 px-3 rounded-full hover:bg-primary/5">
          See All
        </Button>
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-4 px-6 pb-4">
          {suggestions.map((person) => (
            <div 
              key={person.username} 
              className="relative w-40 bg-secondary/20 rounded-[2rem] p-5 flex flex-col items-center text-center gap-3 group border border-transparent hover:border-primary/20 transition-all"
            >
              <Link href={`/profile/${person.username}`} className="relative group/avatar">
                <div className="absolute -inset-1 bg-primary/20 blur-md rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                <Avatar className="h-20 w-20 border-4 border-white dark:border-card shadow-lg transition-transform group-hover/avatar:scale-105">
                  <AvatarImage src={person.avatar} />
                  <AvatarFallback>{person.name[0]}</AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex flex-col gap-0.5 min-w-0 w-full">
                <span className="font-bold text-sm truncate">{person.name}</span>
                <span className="text-[10px] font-black text-primary/60 uppercase tracking-tighter truncate">{person.category}</span>
              </div>

              {person.followsYou && (
                <Badge className="bg-primary text-white text-[8px] font-black uppercase border-none px-2 h-4">Mutual Pulse</Badge>
              )}

              <Button 
                size="sm" 
                className="w-full rounded-xl bg-white dark:bg-card text-foreground hover:bg-primary hover:text-white font-black italic uppercase tracking-widest text-[9px] shadow-sm transition-all active:scale-95"
                onClick={() => { triggerHaptic(15); toggleFollowUser(person.username); }}
              >
                Follow
              </Button>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="opacity-0" />
      </ScrollArea>
    </div>
  );
}
