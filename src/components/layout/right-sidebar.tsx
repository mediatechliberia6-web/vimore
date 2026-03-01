
"use client";

import Link from "next/link";
import { Search, TrendingUp, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePosts } from "@/context/PostContext";
import { useMemo } from "react";

export function RightSidebar() {
  const { currentUser, connections, isFollowing, toggleFollowUser, setSearchOpen } = usePosts();

  const suggestions = useMemo(() => {
    return connections
      .filter(c => !isFollowing(c.username) && c.username !== currentUser.username)
      .slice(0, 3);
  }, [connections, isFollowing, currentUser.username]);

  const trends = [
    { tag: "BuildingInPublic", posts: "12.5k" },
    { tag: "ViMoreCommunity", posts: "8.2k" },
    { tag: "SpatialHandshake", posts: "4.1k" },
    { tag: "HighVelocity", posts: "2.8k" },
  ];

  return (
    <div className="flex flex-col gap-6 py-6 h-full">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search ViMore" 
          className="pl-10 rounded-full bg-white/50 border-primary/10 focus-visible:ring-primary h-11 cursor-pointer" 
          readOnly
          onClick={() => setSearchOpen(true)}
        />
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 border border-primary/10 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h3 className="font-headline font-bold text-lg italic uppercase tracking-tight">Discovery Nodes</h3>
        </div>
        <div className="space-y-4">
          {suggestions.length > 0 ? suggestions.map((user) => (
            <div key={user.username} className="flex items-center justify-between group">
              <Link href={`/profile/${user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0">
                <Avatar className="h-10 w-10 border border-primary/5 transition-transform group-hover:scale-105">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm leading-none truncate group-hover:underline">{user.name}</span>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter truncate">@{user.username}</span>
                </div>
              </Link>
              <Button 
                size="sm" 
                variant="outline" 
                className="rounded-full h-8 px-4 border-primary text-primary hover:bg-primary hover:text-white transition-all font-black text-[9px] uppercase tracking-widest"
                onClick={() => toggleFollowUser(user.username)}
              >
                Connect
              </Button>
            </div>
          )) : (
            <div className="py-4 text-center text-[10px] font-black uppercase text-muted-foreground/40">
              Vault clusters synced
            </div>
          )}
        </div>
        <Link href="/friends?tab=suggestions" className="block w-full">
          <Button variant="ghost" className="w-full text-xs font-black uppercase text-primary hover:bg-primary/5">Show more</Button>
        </Link>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 border border-primary/10 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-headline font-bold text-lg italic uppercase tracking-tight">Trending Now</h3>
        </div>
        <div className="space-y-4">
          {trends.map((trend) => (
            <div key={trend.tag} className="flex flex-col hover:bg-primary/5 p-2 -m-2 rounded-lg cursor-pointer transition-colors group">
              <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">Pulse Node</span>
              <span className="font-black italic uppercase text-sm text-primary group-hover:translate-x-1 transition-transform">#{trend.tag}</span>
              <span className="text-[9px] text-muted-foreground/60 font-black uppercase">{trend.posts} vibes materialized</span>
            </div>
          ))}
        </div>
        <button className="w-full text-xs font-black uppercase text-primary hover:bg-primary/5 py-2">Show full pulse</button>
      </div>
    </div>
  );
}
