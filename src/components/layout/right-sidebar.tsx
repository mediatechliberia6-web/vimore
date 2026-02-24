
"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const suggestions = [
  { name: "Tech Insider", username: "tech_hub", avatar: "https://picsum.photos/seed/10/100/100" },
  { name: "Design Daily", username: "daily_design", avatar: "https://picsum.photos/seed/11/100/100" },
  { name: "Future Lab", username: "future_lab", avatar: "https://picsum.photos/seed/12/100/100" },
];

const trends = [
  { tag: "CreativeConnections", posts: "12.5k" },
  { tag: "ViMoreCommunity", posts: "8.2k" },
  { tag: "AISummary", posts: "4.1k" },
  { tag: "ModernTech", posts: "2.8k" },
];

export function RightSidebar() {
  return (
    <div className="hidden lg:flex flex-col gap-6 py-6 h-full sticky top-0">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          placeholder="Search ViMore" 
          className="pl-10 rounded-full bg-white/50 border-primary/10 focus-visible:ring-primary h-11" 
        />
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 border border-primary/10 space-y-4">
        <h3 className="font-headline font-bold text-lg">Who to follow</h3>
        <div className="space-y-4">
          {suggestions.map((user) => (
            <div key={user.username} className="flex items-center justify-between group">
              <Link href={`/profile/${user.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 min-w-0">
                <Avatar className="h-10 w-10 border border-primary/5 transition-transform group-hover:scale-105">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm leading-none truncate group-hover:underline">{user.name}</span>
                  <span className="text-xs text-muted-foreground truncate">@{user.username}</span>
                </div>
              </Link>
              <Button size="sm" variant="outline" className="rounded-full h-8 px-4 border-accent text-accent hover:bg-accent hover:text-white transition-all">
                Follow
              </Button>
            </div>
          ))}
        </div>
        <button className="text-sm font-semibold text-primary hover:underline">Show more</button>
      </div>

      <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-5 border border-primary/10 space-y-4">
        <h3 className="font-headline font-bold text-lg">Trending for you</h3>
        <div className="space-y-4">
          {trends.map((trend) => (
            <div key={trend.tag} className="flex flex-col hover:bg-primary/5 p-2 -m-2 rounded-lg cursor-pointer transition-colors">
              <span className="text-xs text-muted-foreground font-medium">Trending</span>
              <span className="font-bold text-sm text-primary">#{trend.tag}</span>
              <span className="text-[10px] text-muted-foreground">{trend.posts} posts</span>
            </div>
          ))}
        </div>
        <button className="text-sm font-semibold text-primary hover:underline">Show more</button>
      </div>
    </div>
  );
}
