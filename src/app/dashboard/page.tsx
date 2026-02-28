
"use client";

import { useState, useMemo } from "react";
import { 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Users, 
  BarChart3,
  Sparkles,
  Zap,
  Info,
  Layers,
  Rocket,
  ShieldCheck,
  Globe,
  LayoutDashboard,
  Clock,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  ResponsiveContainer, 
  XAxis, 
  YAxis,
  Tooltip
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";

const CATEGORIES = [
  { id: "analytics", label: "Analytics" },
  { id: "content", label: "Content" },
  { id: "community", label: "Community" },
  { id: "monetization", label: "Monetization" },
];

const GROWTH_DATA_7D = [
  { date: "Mon", followers: 8200, engagement: 400 },
  { date: "Tue", followers: 8250, engagement: 600 },
  { date: "Wed", followers: 8310, engagement: 550 },
  { date: "Thu", followers: 8340, engagement: 800 },
  { date: "Fri", followers: 8390, engagement: 700 },
  { date: "Sat", followers: 8420, engagement: 950 },
  { date: "Sun", followers: 8450, engagement: 1100 },
];

const GROWTH_DATA_28D = [
  { date: "W1", followers: 7800, engagement: 2400 },
  { date: "W2", followers: 8000, engagement: 3100 },
  { date: "W3", followers: 8250, engagement: 2800 },
  { date: "W4", followers: 8450, engagement: 4200 },
];

export default function ProfessionalDashboard() {
  const { currentUser, triggerHaptic } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const [activeCategory, setActiveCategory] = useState("analytics");
  const [activeRange, setActiveRange] = useState<"7D" | "28D">("7D");

  const isPlayerActive = currentTrack && !isExpanded;

  const handleCategorySelect = (id: string) => {
    triggerHaptic(5);
    setActiveCategory(id);
  };

  const chartData = useMemo(() => {
    return activeRange === "7D" ? GROWTH_DATA_7D : GROWTH_DATA_28D;
  }, [activeRange]);

  const verificationStatus = useMemo(() => {
    if (!currentUser.isVerified) {
      return { 
        label: "Temporal Handshake", 
        desc: "Materialize your verified status today",
        badge: null,
        color: "from-primary to-indigo-700"
      };
    }
    
    const expiry = currentUser.verificationExpiry ? new Date(currentUser.verificationExpiry) : null;
    const daysLeft = expiry ? Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
    
    return {
      label: "Signature Active",
      desc: `Signature synced for ${daysLeft} more days`,
      badge: <Badge className="bg-white/20 text-white border-none text-[8px] font-black uppercase">TEMPORAL PULSE: {daysLeft}D</Badge>,
      color: "from-purple-600 to-primary"
    };
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-[#F2ECF7] dark:bg-[#020202] text-foreground flex flex-col transition-colors duration-500 overflow-x-hidden">
      {/* Aurora Ambient Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <header className="sticky top-0 z-50 bg-white/60 dark:bg-card/60 backdrop-blur-xl border-b border-primary/5 h-16 px-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 text-primary active:scale-90 transition-all">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-none">Command Hub</h1>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Creator Intelligence</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/40 text-muted-foreground">
            <Search className="h-5 w-5" />
          </Button>
          <Link href="/profile">
            <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-lg">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      <main className={cn(
        "max-w-4xl mx-auto w-full p-4 sm:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700",
        isPlayerActive ? "pt-[80px]" : "pt-4"
      )}>
        
        <section className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-primary/10 shadow-2xl ring-4 ring-primary/5">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  {currentUser.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-primary h-7 w-7 rounded-full border-4 border-white dark:border-[#0A0A0A] flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white fill-current" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{currentUser.name}</h2>
                    {currentUser.isVerified && <CheckCircle2 className="h-5 w-5 text-primary fill-primary text-white" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black h-5 uppercase tracking-widest px-3">Pro Creator</Badge>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">@{currentUser.username}</span>
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-4xl font-black italic text-primary leading-none">12%</span>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Growth Pulse</span>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-primary/5 grid grid-cols-3 gap-4">
              <div className="text-center space-y-1">
                <p className="text-xl font-black italic tracking-tighter">1.2K</p>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Digital Nodes</p>
              </div>
              <div className="text-center space-y-1 border-x border-primary/5">
                <p className="text-xl font-black italic tracking-tighter">142</p>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Total Vibes</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xl font-black italic tracking-tighter">{(currentUser.starBalance || 0).toLocaleString()}</p>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Star Balance</p>
              </div>
            </div>
          </div>
        </section>

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={cn(
                  "px-8 py-3 rounded-2xl text-xs font-black italic uppercase tracking-[0.2em] transition-all border shadow-lg",
                  activeCategory === cat.id 
                    ? "bg-primary border-primary text-white shadow-primary/20 scale-105" 
                    : "bg-white/40 dark:bg-white/5 border-white/20 text-muted-foreground hover:bg-white/60"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="opacity-0" />
        </ScrollArea>

        {/* Analytics Intelligence Phase 1 */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Analytics Intelligence</h3>
            </div>
            
            <div className="flex items-center gap-1 bg-secondary/40 p-1 rounded-xl">
              {["7D", "28D"].map((range) => (
                <button 
                  key={range}
                  onClick={() => { triggerHaptic(5); setActiveRange(range as any); }}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    activeRange === range 
                      ? "bg-white dark:bg-card text-primary shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Network Growth Chart */}
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Network Growth</span>
                  <p className="text-2xl font-black italic tracking-tighter">+{activeRange === '7D' ? '250' : '650'} Followers</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              
              <div className="h-[200px] w-full">
                <ChartContainer config={{ 
                  followers: { label: "Followers", color: "hsl(var(--primary))" } 
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(153, 64, 229, 0.5)', fontSize: 10, fontWeight: 'bold' }} 
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="followers" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorFollowers)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            {/* Engagement Pulse Chart */}
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Engagement Pulse</span>
                  <p className="text-2xl font-black italic tracking-tighter">{activeRange === '7D' ? '4.2K' : '15.8K'} Interactions</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              
              <div className="h-[200px] w-full">
                <ChartContainer config={{ 
                  engagement: { label: "Interactions", color: "hsl(var(--accent))" } 
                }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: 'rgba(110, 150, 255, 0.5)', fontSize: 10, fontWeight: 'bold' }} 
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar 
                        dataKey="engagement" 
                        fill="hsl(var(--accent))" 
                        radius={[6, 6, 0, 0]} 
                        barSize={activeRange === '7D' ? 30 : 60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Handshake Protocol Card */}
        <Link href="/verification" className="relative group cursor-pointer block">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 to-accent/40 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className={cn(
            "relative bg-gradient-to-br rounded-[2rem] p-6 flex items-center justify-between border border-white/10 shadow-2xl transition-all hover:translate-y-[-2px] active:scale-[0.98]",
            verificationStatus.color
          )}>
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                {currentUser.isVerified ? <ShieldCheck className="h-8 w-8 fill-current" /> : <Zap className="h-8 w-8" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-lg font-black italic uppercase tracking-tight text-white leading-none">{verificationStatus.label}</p>
                  {verificationStatus.badge}
                </div>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{verificationStatus.desc}</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-white/40" />
          </div>
        </Link>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Quick Performance</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Network Reach", value: "2,124", delta: "-79%", color: "text-red-500", icon: TrendingDown, bg: "from-red-500/5" },
              { label: "Approx. Revenue", value: "L$ 0", delta: "--", color: "text-muted-foreground", icon: Zap, bg: "from-amber-500/5" },
              { label: "Community Pulse", value: "764", delta: "-77%", color: "text-red-500", icon: TrendingDown, bg: "from-blue-500/5" },
              { label: "New Handshakes", value: "-18", delta: "-238%", color: "text-red-500", icon: TrendingDown, bg: "from-primary/5" },
            ].map((metric, i) => (
              <div key={i} className={cn(
                "relative bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.25rem] p-6 shadow-xl space-y-4 overflow-hidden group hover:border-primary/20 transition-all",
                "bg-gradient-to-br to-transparent"
              )}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{metric.label}</span>
                  <p className="text-3xl font-black tabular-nums italic tracking-tighter">{metric.value}</p>
                </div>
                <div className={cn("flex items-center gap-1.5 text-[10px] font-black uppercase", metric.color)}>
                  <metric.icon className="h-3 w-3" /> {metric.delta}
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-100 transition-opacity">
                  <metric.icon className="h-24 w-24 rotate-12" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">Content Hub</h3>
            </div>
            <Button variant="link" className="text-[10px] font-black text-primary uppercase tracking-widest p-0 h-auto">Browse All</Button>
          </div>
          
          <div className="group relative">
            <div className="absolute -inset-1 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-6 flex items-start gap-6 shadow-xl hover:bg-white/60 transition-all cursor-pointer">
              <div className="flex-1 space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Latest Vibe</span>
                  <p className="text-sm font-bold leading-relaxed line-clamp-2 italic text-foreground/80">"Time for Friday favourites! Share the vibes with your circle node..."</p>
                </div>
                
                <div className="flex items-center gap-8 pt-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Views</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-black tabular-nums">4</span>
                      <span className="text-[9px] font-black text-red-500 uppercase flex items-center gap-0.5">
                        <TrendingDown className="h-2.5 w-2.5" /> -98%
                      </span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Retention</span>
                    <p className="text-xl font-black tabular-nums text-foreground/40">--</p>
                  </div>
                </div>
              </div>
              <div className="h-24 w-24 rounded-3xl bg-secondary/40 flex items-center justify-center shrink-0 border border-white/20 shadow-inner group-hover:scale-105 transition-transform">
                <Plus className="h-8 w-8 text-muted-foreground/40" />
              </div>
            </div>
          </div>
        </section>

        <footer className="pt-10 pb-24 space-y-8">
          <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10 flex gap-5 items-start">
            <div className="bg-primary/10 p-3 rounded-2xl shrink-0">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <p className="text-[11px] font-medium text-muted-foreground leading-relaxed uppercase tracking-tighter">
              All data pulses are synchronized every 24 hours across the ViMore network. Percentages represent volatility compared to the previous high-velocity window.
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 opacity-40">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <p className="text-center text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">
              ViMore Node v1.5.0-HighVelocity • Command Core Active
            </p>
          </div>
        </footer>

      </main>
    </div>
  );
}
