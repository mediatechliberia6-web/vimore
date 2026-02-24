
"use client";

import { Search, Upload, Crown, Bell, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export function MusicHeader() {
  return (
    <header className="sticky top-0 z-[60] h-20 px-4 sm:px-8 flex items-center justify-between gap-6 bg-black/60 backdrop-blur-xl border-b border-white/5">
      {/* Mobile Search / Back */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <Link href="/menu" className="lg:hidden">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/5">
            <Search className="h-5 w-5 text-zinc-400" />
          </Button>
        </Link>
        <div className="relative group flex-1 hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-orange-500 transition-colors" />
          <Input 
            placeholder="Search songs, artists, podcasts..." 
            className="pl-12 h-12 bg-white/5 border-none rounded-2xl focus-visible:ring-1 ring-orange-500/50 text-sm placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Action Cluster */}
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          className="hidden md:flex items-center gap-2 border-orange-500/20 bg-orange-500/5 text-orange-500 hover:bg-orange-500 hover:text-black font-black italic uppercase tracking-tighter text-xs h-10 px-6 rounded-xl transition-all"
        >
          <Crown className="h-3.5 w-3.5" />
          Get Plus
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-xl bg-white/5 text-zinc-400 hover:text-white"
          title="Upload Music"
        >
          <Upload className="h-5 w-5" />
        </Button>

        <div className="h-8 w-px bg-white/10 mx-1 hidden sm:block" />

        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 sm:flex hidden text-zinc-400">
             <Bell className="h-5 w-5" />
           </Button>
           <Link href="/profile">
             <Avatar className="h-10 w-10 border-2 border-orange-500/20 transition-transform hover:scale-105">
               <AvatarImage src="https://picsum.photos/seed/me/100/100" />
               <AvatarFallback>JD</AvatarFallback>
             </Avatar>
           </Link>
        </div>
      </div>
    </header>
  );
}

MusicHeader.LogoIcon = function LogoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
      <path d="M9 18V5L21 3V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
};
