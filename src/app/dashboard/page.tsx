
"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Users, 
  FileText, 
  DollarSign, 
  BarChart3,
  Sparkles,
  Zap,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const CATEGORIES = [
  { id: "analytics", label: "Analytics" },
  { id: "content", label: "Content" },
  { id: "community", label: "Community" },
  { id: "monetization", label: "Monetization" },
];

export default function ProfessionalDashboard() {
  const { currentUser, triggerHaptic } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const [activeCategory, setActiveCategory] = useState("analytics");
  const [activeRange, setActiveRange] = useState("28 days");

  const isPlayerActive = currentTrack && !isExpanded;

  const handleCategorySelect = (id: string) => {
    triggerHaptic(5);
    setActiveCategory(id);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#050505] transition-colors duration-300">
      {/* 1. Header Protocol */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/80 active:scale-90 transition-all">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-lg font-black italic uppercase tracking-tighter text-foreground">Professional dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50 dark:bg-white/5">
            <Search className="h-5 w-5" />
          </Button>
          <div className="relative group">
            <Avatar className="h-9 w-9 border-2 border-primary/10">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-card p-0.5 rounded-full border border-border shadow-sm">
              <CheckCircle2 className="h-3 w-3 text-green-500 fill-current" />
            </div>
          </div>
        </div>
      </header>

      <main className={cn(
        "max-w-2xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500",
        isPlayerActive ? "pt-[80px]" : "pt-4"
      )}>
        
        {/* 2. Category Rail */}
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all border",
                  activeCategory === cat.id 
                    ? "bg-secondary border-transparent text-foreground shadow-sm" 
                    : "bg-transparent border-border text-muted-foreground hover:bg-secondary/40"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="opacity-0" />
        </ScrollArea>

        {/* 3. User Identity Pulse */}
        <section className="flex items-center justify-between group">
          <Link href="/profile" className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-4 border-primary/5 ring-2 ring-primary/10">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 bg-green-500 h-6 w-6 rounded-full border-4 border-white dark:border-[#050505] flex items-center justify-center">
                <CheckCircle2 className="h-3 w-3 text-white fill-current" />
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xl font-black italic uppercase tracking-tighter">{currentUser.name}</h2>
                <ChevronRight className="h-5 w-5 text-muted-foreground opacity-40" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground">Weekly progress</span>
                <span className="text-xs font-black text-foreground">0%</span>
                <div className="h-3 w-3 rounded-full border-2 border-primary/20" />
              </div>
            </div>
          </Link>
        </section>

        {/* 4. Verification CTA Card */}
        <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 flex items-center justify-between shadow-sm transition-all hover:shadow-md cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
              <CheckCircle2 className="h-7 w-7 fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground leading-snug">Get a verified badge and more benefits with ViMore Verified</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-40 ml-2" />
        </div>

        {/* 5. Analytics Hub */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Analytics</h3>
            <ChevronRight className="h-5 w-5 text-muted-foreground opacity-40" />
          </div>

          {/* Range Selector */}
          <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-hide px-1">
            {["28 days", "7 days", "Today"].map((range) => (
              <button 
                key={range}
                onClick={() => { triggerHaptic(5); setActiveRange(range); }}
                className={cn(
                  "text-sm font-bold transition-all relative pb-2",
                  activeRange === range ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range}
                {activeRange === range && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in zoom-in duration-300" />
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Views", value: "2,124", delta: "-79%", color: "text-red-500", icon: TrendingDown },
              { label: "Approximate earnings", value: "$0.00", delta: "--", color: "text-muted-foreground", icon: DollarSign },
              { label: "Engagement", value: "764", delta: "-77%", color: "text-red-500", icon: TrendingDown },
              { label: "Net followers", value: "-18", delta: "-238%", color: "text-red-500", icon: TrendingDown },
            ].map((metric, i) => (
              <div key={i} className="bg-white dark:bg-card border border-border rounded-2xl p-5 space-y-3 shadow-sm">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{metric.label}</span>
                <div className="space-y-1">
                  <p className="text-2xl font-black tabular-nums">{metric.value}</p>
                  <div className={cn("flex items-center gap-1 text-[11px] font-black uppercase", metric.color)}>
                    <metric.icon className="h-3 w-3" /> {metric.delta}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Content Insights */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Content</h3>
            <ChevronRight className="h-5 w-5 text-muted-foreground opacity-40" />
          </div>
          
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Latest post</span>
            <div className="bg-white dark:bg-card border border-border rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex-1 space-y-4">
                <p className="text-sm font-bold leading-relaxed line-clamp-2 italic">"Time for Friday favourites! Share the vibes with your circle node..."</p>
                <div className="h-px bg-border" />
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Views</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black tabular-nums">4</span>
                    <span className="text-[10px] font-black text-red-500 uppercase flex items-center gap-0.5">
                      <TrendingDown className="h-2.5 w-2.5" /> -98%
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-20 w-20 rounded-xl bg-secondary/30 flex items-center justify-center shrink-0">
                <Plus className="h-6 w-6 text-muted-foreground/40" />
              </div>
            </div>
          </div>
        </section>

        {/* 7. System Meta Nodes */}
        <footer className="pt-10 pb-20 space-y-6">
          <div className="bg-secondary/10 rounded-2xl p-4 flex gap-4">
            <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[10px] font-medium text-muted-foreground leading-relaxed uppercase tracking-tighter">
              All data pulses are updated every 24 hours. Percentages represent changes compared to the previous high-velocity period.
            </p>
          </div>
          <p className="text-center text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">
            ViMore Node v1.5.0-HighVelocity • Pro Insights Active
          </p>
        </footer>

      </main>
    </div>
  );
}
