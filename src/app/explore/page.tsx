"use client";

import { MainNav } from "@/components/layout/main-nav";
import { Header } from "@/components/layout/header";
import { SubHeader } from "@/components/layout/sub-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useMusic } from "@/context/MusicContext";
import { 
  Search, 
  TrendingUp, 
  Video, 
  PlusSquare, 
  Users, 
  Bookmark, 
  Calendar,
  ChevronRight,
  Flame,
  Star,
  Zap,
  Radio,
  GalleryVerticalEnd
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const trendingCreators = [
  { name: "Alex Rivera", username: "arivera", avatar: "https://picsum.photos/seed/1/100/100", role: "Designer" },
  { name: "Sarah Chen", username: "schen_dev", avatar: "https://picsum.photos/seed/2/100/100", role: "Developer" },
  { name: "Marcus Stone", username: "mstone", avatar: "https://picsum.photos/seed/3/100/100", role: "Photographer" },
  { name: "Elena Gilbert", username: "elena_g", avatar: "https://picsum.photos/seed/4/100/100", role: "Creator" },
];

const hubs = [
  { name: "Designers Lounge", members: "12k", icon: "🎨" },
  { name: "Tech Pioneers", members: "8.5k", icon: "💻" },
  { name: "Creative Writing", members: "4.2k", icon: "✍️" },
];

export default function ExplorePage() {
  const { currentTrack, isExpanded } = useMusic();
  const isPlayerActive = currentTrack && !isExpanded;

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808] transition-colors duration-300">
      <Header />
      <SubHeader />

      <div className={cn(
        "max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 px-4 transition-all duration-300",
        isPlayerActive ? "pt-[140px]" : "pt-6"
      )}>
        {/* Left Navigation */}
        <aside className={cn(
          "hidden lg:block sticky h-[calc(100vh-132px)] transition-all duration-300",
          isPlayerActive ? "top-[196px]" : "top-[132px]"
        )}>
          <MainNav />
        </aside>

        {/* Explore Hub */}
        <main className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Top Search Bar (Mobile/Explore specific) */}
          <div className="relative group max-w-2xl mx-auto w-full lg:hidden">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search for creators, series, or tags..." 
              className="pl-12 h-14 rounded-2xl bg-white dark:bg-card border-none shadow-sm focus-visible:ring-2 ring-primary/20 text-lg"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-none md:grid-rows-4 gap-4 min-h-[800px]">
            
            {/* 1. Hero Spotlight (Large Tile) */}
            <div className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden group shadow-xl bg-primary/10">
              <Image 
                src="https://picsum.photos/seed/explore-hero/800/800" 
                alt="Featured Series" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute top-6 left-6">
                <Badge className="bg-primary hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border-none shadow-lg">
                  Series of the Week
                </Badge>
              </div>
              <div className="absolute bottom-8 left-8 right-8 space-y-2">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none drop-shadow-md">
                  Urban Explorers: SF Edition
                </h2>
                <p className="text-white/80 text-sm font-medium line-clamp-2 max-w-md">
                  Join Marcus Stone as he explores the hidden rooftop gardens of San Francisco in this 5-part series.
                </p>
                <Link href="/">
                  <Button className="mt-4 rounded-xl gap-2 bg-white text-black hover:bg-zinc-200 font-bold px-6">
                    Watch Now <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* 2. Go Live Tile (Medium) */}
            <div className="md:col-span-1 md:row-span-1 bg-gradient-to-br from-destructive to-orange-600 rounded-3xl p-6 flex flex-col justify-between text-white shadow-xl group cursor-pointer hover:shadow-destructive/20 transition-all">
              <div className="flex justify-between items-start">
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                  <Radio className="h-6 w-6 animate-pulse" />
                </div>
                <Badge variant="secondary" className="bg-white/20 border-none text-[10px] font-bold">LIVE NOW</Badge>
              </div>
              <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Go Live</h3>
                <p className="text-white/70 text-xs font-medium">Broadcast to your fans instantly</p>
              </div>
            </div>

            {/* 3. Trending Tags (Medium) */}
            <div className="md:col-span-1 md:row-span-2 bg-white dark:bg-card border border-primary/10 rounded-3xl p-6 flex flex-col shadow-lg backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-6">
                <Flame className="h-5 w-5 text-orange-500" />
                <h3 className="font-black italic uppercase tracking-tighter text-lg">Trending</h3>
              </div>
              <div className="flex-1 flex flex-col gap-4">
                {["#DesignSF", "#ViMoreVibes", "#BuildingInPublic", "#CreativeCoding"].map((tag) => (
                  <div key={tag} className="flex items-center justify-between group cursor-pointer">
                    <span className="font-bold text-sm text-muted-foreground group-hover:text-primary transition-colors">{tag}</span>
                    <TrendingUp className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-primary font-bold text-xs uppercase tracking-widest">See all tags</Button>
            </div>

            {/* 4. Creator Spotlight (Wide) */}
            <div className="md:col-span-1 md:row-span-1 bg-white dark:bg-card border border-primary/10 rounded-3xl p-6 flex items-center justify-between shadow-lg group hover:bg-primary/5 transition-colors cursor-pointer">
               <div className="space-y-1">
                 <div className="flex items-center gap-2">
                   <Star className="h-4 w-4 text-yellow-500 fill-current" />
                   <h3 className="font-black italic uppercase tracking-tighter">Rising Stars</h3>
                 </div>
                 <p className="text-xs text-muted-foreground font-medium">Creators blowing up this week</p>
               </div>
               <div className="flex -space-x-3">
                 {trendingCreators.slice(0, 3).map((c, i) => (
                   <Avatar key={i} className="h-10 w-10 border-4 border-white dark:border-card">
                     <AvatarImage src={c.avatar} />
                     <AvatarFallback>{c.name[0]}</AvatarFallback>
                   </Avatar>
                 ))}
               </div>
            </div>

            {/* 5. Create Series Tile (Medium) */}
            <div className="md:col-span-2 md:row-span-1 bg-gradient-to-br from-primary to-accent rounded-3xl p-8 flex items-center justify-between text-white shadow-xl group cursor-pointer relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-2xl font-black italic uppercase tracking-tighter">Start a Series</h3>
                 <p className="text-white/80 text-sm font-medium mt-1">Curate your best content into chapters</p>
                 <Button className="mt-4 bg-white text-primary hover:bg-zinc-100 font-bold rounded-xl h-11 px-6">
                   Get Started
                 </Button>
               </div>
               <div className="relative z-10 bg-white/20 backdrop-blur-md p-6 rounded-3xl">
                 <GalleryVerticalEnd className="h-12 w-12" />
               </div>
               <div className="absolute -right-4 -bottom-4 opacity-10">
                 <Zap className="h-40 w-40" />
               </div>
            </div>

            {/* 6. Communities Hub (Large) */}
            <div className="md:col-span-2 md:row-span-1 bg-white dark:bg-card border border-primary/10 rounded-3xl p-6 shadow-lg flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-black italic uppercase tracking-tighter text-lg">Active Hubs</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-primary font-bold text-xs uppercase">Join more</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                {hubs.map((hub) => (
                  <div key={hub.name} className="p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group flex flex-col items-center text-center gap-2">
                    <span className="text-2xl transition-transform group-hover:scale-125 duration-300">{hub.icon}</span>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold truncate max-w-[100px]">{hub.name}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{hub.members} members</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Recommended Horizontal Scroll */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-black italic uppercase tracking-tighter text-xl">People You Should Know</h3>
              <Button variant="ghost" size="sm" className="text-primary font-bold text-xs uppercase tracking-widest">See all</Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-2">
              {trendingCreators.map((creator) => (
                <div key={creator.username} className="min-w-[180px] bg-white dark:bg-card p-6 rounded-3xl border border-primary/5 shadow-sm flex flex-col items-center text-center gap-4 hover:shadow-md transition-shadow group">
                  <Link href={`/profile/${creator.username}`}>
                    <Avatar className="h-16 w-16 border-2 border-primary/10 transition-transform group-hover:scale-110">
                      <AvatarImage src={creator.avatar} />
                      <AvatarFallback>{creator.name[0]}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="space-y-1">
                    <Link href={`/profile/${creator.username}`} className="font-bold text-sm block hover:underline">{creator.name}</Link>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{creator.role}</p>
                  </div>
                  <Button size="sm" className="w-full rounded-xl font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
