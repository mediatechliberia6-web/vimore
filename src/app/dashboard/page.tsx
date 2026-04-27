"use client";

import { useState, useMemo, useEffect } from "react";
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
  Activity,
  Pin,
  Archive,
  Trash2,
  Share2,
  MessageCircle,
  ThumbsUp,
  Heart,
  Radio,
  Copy,
  UserPlus,
  Shield,
  Monitor,
  Settings2,
  Lock,
  ExternalLink,
  Check,
  Gem,
  Coins,
  ShieldAlert,
  UserCheck,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePosts, Post } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn, parseFollowerCount } from "@/lib/utils";
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
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Label
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  Tooltip as UITooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { NativeAdNode } from "@/components/ad/native-ad-node";
import AdminLoading from "@/app/admin/loading";
import { databases, Query, COL, DATABASE_ID } from "@/lib/appwrite";

const CATEGORIES = [
  { id: "analytics", label: "Analytics" },
  { id: "content", label: "Content" },
  { id: "community", label: "Community" },
  { id: "monetization", label: "Economy" },
  { id: "management", label: "Management" },
];

export default function ProfessionalDashboard() {
  const { currentUser, posts, triggerHaptic, activeSubscriptions, settings, isLoading } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("analytics");
  const [activeRange, setActiveRange] = useState<"7D" | "28D">("7D");
  const [chartData7D, setChartData7D] = useState<any[]>([]);
  const [chartData28D, setChartData28D] = useState<any[]>([]);

  useEffect(() => {
    if (!currentUser) return;
    const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const followerCount = typeof currentUser.followers === 'number' ? currentUser.followers : parseInt(String(currentUser.followers || '0'), 10) || 0;

    const build7D = async () => {
      try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        const res = await databases.listDocuments(DATABASE_ID, COL.POSTS, [
          Query.equal('user_id', currentUser.$id),
          Query.greaterThan('$createdAt', sevenDaysAgo),
          Query.limit(100),
        ]);
        const today = new Date();
        const data = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today);
          d.setDate(today.getDate() - (6 - i));
          const dateStr = d.toISOString().split('T')[0];
          const dayPosts = res.documents.filter((doc: any) => doc.$createdAt?.startsWith(dateStr));
          const engagement = dayPosts.reduce((acc: number, doc: any) => acc + (doc.likes_count || 0) + (doc.comments_count || 0) + (doc.shares_count || 0), 0);
          return { date: DAY_LABELS[d.getDay()], followers: followerCount, engagement, revenue: Math.round(engagement * (settings.goldRate || 0.01) * 10 * 100) / 100 };
        });
        setChartData7D(data);
      } catch { setChartData7D([]); }
    };

    const build28D = async () => {
      try {
        const twentyEightDaysAgo = new Date(Date.now() - 28 * 86400000).toISOString();
        const res = await databases.listDocuments(DATABASE_ID, COL.POSTS, [
          Query.equal('user_id', currentUser.$id),
          Query.greaterThan('$createdAt', twentyEightDaysAgo),
          Query.limit(200),
        ]);
        const data = Array.from({ length: 4 }, (_, i) => {
          const start = new Date(Date.now() - (4 - i) * 7 * 86400000);
          const end = new Date(Date.now() - (3 - i) * 7 * 86400000);
          const weekPosts = res.documents.filter((doc: any) => {
            const t = new Date(doc.$createdAt).getTime();
            return t >= start.getTime() && t < end.getTime();
          });
          const engagement = weekPosts.reduce((acc: number, doc: any) => acc + (doc.likes_count || 0) + (doc.comments_count || 0) + (doc.shares_count || 0), 0);
          return { date: `W${i + 1}`, followers: followerCount, engagement, revenue: Math.round(engagement * (settings.goldRate || 0.01) * 10 * 100) / 100 };
        });
        setChartData28D(data);
      } catch { setChartData28D([]); }
    };

    build7D();
    build28D();
  }, [currentUser, settings.goldRate]);

  if (isLoading || !currentUser) {
    return <AdminLoading />;
  }

  const isPlayerActive = currentTrack && !isExpanded;

  const userPosts = useMemo(() => {
    return posts.filter(p => p.user.username === currentUser?.username);
  }, [posts, currentUser?.username]);

  const totalVibes = useMemo(() => {
    return userPosts.reduce((acc, p) => acc + (p.likes || 0) + (p.comments || 0) + (p.shares || 0), 0);
  }, [userPosts]);

  const projectedRevenue = useMemo(() => {
    const subsCount = activeSubscriptions.size;
    const baseRevenue = subsCount * 20 * settings.diamondRate;
    return baseRevenue * settings.ldMultiplier;
  }, [activeSubscriptions.size, settings.diamondRate, settings.ldMultiplier]);

  const handleCategorySelect = (id: string) => { 
    triggerHaptic(5); 
    setActiveCategory(id); 
  };

  const chartData = useMemo(() => activeRange === "7D" ? chartData7D : chartData28D, [activeRange, chartData7D, chartData28D]);

  return (
    <div className="min-h-screen bg-[#F2ECF7] dark:bg-[#020202] text-foreground flex flex-col transition-colors duration-500 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full animate-pulse delay-700" />
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
          {!currentUser?.isVerified && (
            <Link href="/verification">
              <Button size="sm" className="h-8 rounded-xl bg-primary text-white font-black italic uppercase tracking-widest text-[9px] gap-2 shadow-lg shadow-primary/20 animate-pulse">
                <ShieldCheck className="h-3 w-3" /> Get Verified
              </Button>
            </Link>
          )}
          <Link href="/profile">
            <Avatar className="h-9 w-9 border-2 border-primary/20 shadow-lg">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      <main className={cn("max-w-4xl mx-auto w-full p-4 sm:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700", isPlayerActive ? "pt-[80px]" : "pt-4")}>
        
        <section className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-primary/10 shadow-2xl ring-4 ring-primary/5">
                    <AvatarImage src={currentUser?.avatar} />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  {currentUser?.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-primary h-7 w-7 rounded-full border-4 border-white dark:border-[#0A0A0A] flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="h-3.5 w-3.5 text-white fill-current" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{currentUser?.name}</h2>
                    {currentUser?.isVerified && <CheckCircle2 className="h-5 w-5 text-primary fill-primary text-white" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black h-5 uppercase tracking-widest px-3">
                      {currentUser?.isVerified ? 'Verified Creator' : 'Pulse Creator'}
                    </Badge>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">@{currentUser?.username}</span>
                  </div>
                </div>
              </div>
              
              {!currentUser?.isVerified ? (
                <Link href="/verification">
                  <div className="bg-primary/5 hover:bg-primary/10 border border-primary/20 p-4 rounded-3xl flex items-center gap-4 transition-all group/v">
                    <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white group-hover/v:scale-110 transition-transform">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest">Action Required</span>
                      <span className="text-sm font-bold italic uppercase tracking-tight">Sync Signature</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-4xl font-black italic text-primary leading-none">Optimal</span>
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">Network Status</span>
                </div>
              )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-primary/5 grid grid-cols-3 gap-4">
              <div className="text-center space-y-1">
                <p className="text-xl font-black italic tracking-tighter">{userPosts.length}</p>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Digital Nodes</p>
              </div>
              <div className="text-center space-y-1 border-x border-primary/5">
                <p className="text-xl font-black italic tracking-tighter">{totalVibes.toLocaleString()}</p>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Total Vibes</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-xl font-black italic tracking-tighter">{(parseFollowerCount(currentUser?.followers) || 0).toLocaleString()}</p>
                <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Spatial Pulse</p>
              </div>
            </div>
          </div>
        </section>

        <NativeAdNode type="banner-468" id="dash-top-pulse" />

        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3 pb-4">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => handleCategorySelect(cat.id)} 
                className={cn(
                  "px-8 py-3 rounded-2xl text-xs font-black italic uppercase tracking-[0.2em] transition-all border shadow-lg", 
                  activeCategory === cat.id ? "bg-primary border-primary text-white shadow-primary/20 scale-105" : "bg-white/40 dark:bg-white/5 border-white/20 text-muted-foreground hover:bg-white/60"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="opacity-0" />
        </ScrollArea>

        {activeCategory === 'analytics' && (
          <section className="space-y-6 animate-in fade-in duration-500">
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
                      activeRange === range ? "bg-white dark:bg-card text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Network Growth</span>
                    <p className="text-2xl font-black italic tracking-tighter">{currentUser?.followers || 0} Followers</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="h-[200px] w-full">
                  <ChartContainer config={{ followers: { label: "Followers", color: "hsl(var(--primary))" } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'rgba(153, 64, 229, 0.5)', fontSize: 10, fontWeight: 'bold' }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="followers" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorFollowers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
              
              <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Engagement Pulse</span>
                    <p className="text-2xl font-black italic tracking-tighter">{totalVibes.toLocaleString()} Interactions</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>
                <div className="h-[200px] w-full">
                  <ChartContainer config={{ engagement: { label: "Interactions", color: "hsl(var(--accent))" } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'rgba(110, 150, 255, 0.5)', fontSize: 10, fontWeight: 'bold' }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="engagement" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} barSize={activeRange === '7D' ? 30 : 60} />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </div>
          </section>
        )}

        <NativeAdNode type="banner-468" id="dash-mid-pulse" />

        {activeCategory === 'monetization' && (
          <section className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Coins className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Economy Intelligence</h3>
              </div>
              <Badge variant="outline" className="border-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest">90/10 SPLIT ACTIVE</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Projected Monthly Revenue</span>
                    <p className="text-2xl font-black italic tracking-tighter">L$ {projectedRevenue.toLocaleString()}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="h-[200px] w-full">
                  <ChartContainer config={{ revenue: { label: "Revenue", color: "hsl(var(--primary))" } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <XAxis dataKey="date" hide />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.1} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Premium Subscribers</span>
                    <p className="text-2xl font-black italic tracking-tighter">{activeSubscriptions.size} VIP Nodes</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                    <span className="text-2xl font-black italic text-cyan-500"><Gem className="h-5 w-5" /></span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/20 rounded-2xl border border-white/5">
                    <span className="text-[8px] font-black text-muted-foreground uppercase block mb-1">Retention</span>
                    <p className="text-lg font-black italic text-cyan-500">94%</p>
                  </div>
                  <div className="p-4 bg-secondary/20 rounded-2xl border border-white/5">
                    <span className="text-[8px] font-black text-muted-foreground uppercase block mb-1">Growth</span>
                    <p className="text-lg font-black italic text-cyan-500">+12%</p>
                  </div>
                </div>
                <Link href="/earnings">
                  <Button className="w-full h-12 rounded-2xl bg-cyan-600 text-white font-black italic uppercase tracking-widest text-[10px]">
                    Manage Revenue Vault
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        <footer className="pt-10 pb-24 space-y-8">
          <NativeAdNode type="banner-468" id="dash-bottom-pulse" />
          <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10 flex gap-5 items-start">
            <div className="bg-primary/10 p-3 rounded-2xl shrink-0">
              <Info className="h-5 w-5 text-primary" />
            </div>
            <p className="text-[11px] font-medium text-muted-foreground leading-relaxed uppercase tracking-tighter">
              All data pulses are synchronized every 24 hours across the ViMore network. Performance heuristic weights: Like(1), Comment(2), Share(3).
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 opacity-40">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <p className="text-center text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">ViMore Command Hub v1.5.0 • MTL Core Active</p>
          </div>
        </footer>
      </main>
    </div>
  );
}