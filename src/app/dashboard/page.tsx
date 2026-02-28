
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
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { usePosts, Post } from "@/context/PostContext";
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

const CATEGORIES = [
  { id: "analytics", label: "Analytics" },
  { id: "content", label: "Content" },
  { id: "community", label: "Community" },
  { id: "management", label: "Management" },
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

const METADATA_VAULT = [
  { id: "v1", label: "Core Hashtags", content: "#ViMore #BuildingInPublic #CreatorEconomy #HighVelocity" },
  { id: "v2", label: "Shot On Credit", content: "Captured high-fidelity on ViMore Pro-HD Studio node. ⚡️" },
  { id: "v3", label: "Join Link", content: "Sync your signature at vimore.network/join" },
];

export default function ProfessionalDashboard() {
  const { currentUser, posts, togglePinPost, archivePost, deletePost, triggerHaptic, connections, settings, updateSettings } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState("analytics");
  const [activeRange, setActiveRange] = useState<"7D" | "28D">("7D");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isPlayerActive = currentTrack && !isExpanded;

  const userPosts = useMemo(() => {
    return posts.filter(p => p.user.username === currentUser.username);
  }, [posts, currentUser.username]);

  const calculateImpactScore = (post: Post) => {
    return (post.likes || 0) + ((post.comments || 0) * 2) + ((post.shares || 0) * 3);
  };

  const avgScore = useMemo(() => {
    if (userPosts.length === 0) return 0;
    const total = userPosts.reduce((acc, p) => acc + calculateImpactScore(p), 0);
    return total / userPosts.length;
  }, [userPosts]);

  const handleCategorySelect = (id: string) => {
    triggerHaptic(5);
    setActiveCategory(id);
  };

  const handleCopy = (text: string, id: string) => {
    triggerHaptic(10);
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Node Synced", description: "Metadata copied to your clipboard." });
    setTimeout(() => setCopiedId(null), 2000);
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

  const handleAction = (action: 'pin' | 'archive' | 'delete', postId: string) => {
    triggerHaptic(15);
    if (action === 'pin') {
      togglePinPost(postId);
      toast({ title: "Priority Adjusted", description: "Vibe anchor updated on your profile." });
    } else if (action === 'archive') {
      archivePost(postId);
      toast({ title: "Node Migrated", description: "Vibe moved to secure archive cluster." });
    } else if (action === 'delete') {
      if (confirm("Purge this content node permanently?")) {
        deletePost(postId);
        toast({ variant: "destructive", title: "Node Purged", description: "Signature removed from the network." });
      }
    }
  };

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
                <p className="text-xl font-black italic tracking-tighter">{userPosts.length}</p>
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

        {/* Analytics Category View */}
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
                    <p className="text-2xl font-black italic tracking-tighter">{activeRange === '7D' ? '4.2K' : '15.8K'} Interactions</p>
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

        {/* Content Category View */}
        {activeCategory === 'content' && (
          <section className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Layers className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Vibe Performance Hub</h3>
              </div>
              <Badge variant="outline" className="border-accent/20 text-accent text-[9px] font-black uppercase tracking-widest">HEURISTIC SCORING ACTIVE</Badge>
            </div>

            <div className="space-y-4">
              {userPosts.length > 0 ? userPosts.map((post) => {
                const score = calculateImpactScore(post);
                const isHighVelocity = score > avgScore;

                return (
                  <div key={post.id} className="group relative bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl transition-all hover:bg-white/60">
                    <div className="flex items-center gap-6 flex-1 min-w-0">
                      <div className="relative h-20 w-20 rounded-3xl bg-secondary/40 shrink-0 overflow-hidden border border-white/10">
                        {post.image || (post.images && post.images[0]) ? (
                          <Image src={post.image || post.images![0]} alt="Post" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                            <Zap className="h-6 w-6 text-primary/40" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-[8px] font-black uppercase border-none px-2", isHighVelocity ? "bg-green-500 text-white" : "bg-primary/10 text-primary")}>
                            {isHighVelocity ? "High Velocity" : "Stable Pulse"}
                          </Badge>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{post.time} ago</span>
                        </div>
                        <p className="text-sm font-bold leading-relaxed line-clamp-1 italic text-foreground/80">"{post.content}"</p>
                        
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase">
                            <ThumbsUp className="h-3 w-3" /> {post.likes || 0}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase">
                            <MessageCircle className="h-3 w-3" /> {post.comments || 0}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase">
                            <Share2 className="h-3 w-3" /> {post.shares || 0}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-none border-primary/5">
                      <div className="flex flex-col items-end pr-6 border-r border-primary/10">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Impact Score</span>
                        <p className="text-3xl font-black italic tracking-tighter text-primary">{score}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" size="icon" 
                          className={cn("rounded-xl h-10 w-10 transition-all", post.isPinned ? "bg-primary text-white" : "hover:bg-primary/10")}
                          onClick={() => handleAction('pin', post.id)}
                          title="Pin Node"
                        >
                          <Pin className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          className="rounded-xl h-10 w-10 hover:bg-accent/10 hover:text-accent"
                          onClick={() => handleAction('archive', post.id)}
                          title="Archive Node"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" size="icon" 
                          className="rounded-xl h-10 w-10 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleAction('delete', post.id)}
                          title="Purge Node"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="py-20 text-center space-y-6 opacity-40 animate-in zoom-in-95 duration-500">
                  <div className="h-20 w-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-dashed border-primary/20">
                    <Layers className="h-10 w-10 text-primary/40" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter">No Active Nodes</h3>
                    <p className="text-sm font-medium">Your content pulse will appear here after your first launch.</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Community Category View */}
        {activeCategory === 'community' && (
          <section className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Community Connectivity</h3>
              </div>
              <Badge variant="outline" className="border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">NETWORK PULSE ACTIVE</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Audience Niche Breakdown */}
              <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Audience Composition</span>
                    <p className="text-2xl font-black italic tracking-tighter">Niche Breakdown</p>
                  </div>
                  <Globe className="h-5 w-5 text-primary opacity-40" />
                </div>
                
                <div className="h-[250px] w-full">
                  <ChartContainer config={{ 
                    Designers: { label: "Designers", color: "hsl(var(--primary))" },
                    Developers: { label: "Developers", color: "hsl(var(--accent))" },
                    Creators: { label: "Creators", color: "hsl(272 77% 75%)" },
                    Others: { label: "Others", color: "hsl(var(--muted-foreground))" }
                  }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Designers', value: 45, fill: 'var(--color-Designers)' },
                            { name: 'Developers', value: 30, fill: 'var(--color-Developers)' },
                            { name: 'Creators', value: 15, fill: 'var(--color-Creators)' },
                            { name: 'Others', value: 10, fill: 'var(--color-Others)' },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Label
                            content={({ viewBox }) => {
                              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                  <text
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                  >
                                    <tspan
                                      x={viewBox.cx}
                                      y={viewBox.cy}
                                      className="fill-foreground text-2xl font-black italic tracking-tighter"
                                    >
                                      100%
                                    </tspan>
                                    <tspan
                                      x={viewBox.cx}
                                      y={(viewBox.cy || 0) + 24}
                                      className="fill-muted-foreground text-[10px] font-black uppercase tracking-widest"
                                    >
                                      composition
                                    </tspan>
                                  </text>
                                )
                              }
                            }}
                          />
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Designers", value: "45%", color: "bg-primary" },
                    { label: "Developers", value: "30%", color: "bg-accent" },
                    { label: "Creators", value: "15%", color: "bg-purple-300" },
                    { label: "Others", value: "10%", color: "bg-muted-foreground" },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", item.color)} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</span>
                      <span className="text-[10px] font-black ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Audience Nodes */}
              <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Core Nodes</span>
                    <p className="text-2xl font-black italic tracking-tighter">Top Engagers</p>
                  </div>
                  <Heart className="h-5 w-5 text-red-500 animate-pulse" />
                </div>

                <div className="space-y-4">
                  {connections.slice(0, 4).map((fan, i) => (
                    <div key={fan.username} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/20 border border-transparent hover:border-primary/10 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10 border border-primary/10 group-hover:scale-105 transition-transform">
                            <AvatarImage src={fan.avatar} />
                            <AvatarFallback>U</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-lg">
                            {i + 1}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold truncate max-w-[120px]">{fan.name}</span>
                          <span className="text-[9px] font-black text-primary uppercase tracking-widest">@{fan.username}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black italic text-primary">{Math.floor(Math.random() * 50) + 20}</span>
                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">pulses</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full rounded-xl h-10 border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest">
                  View Full Network Breakdown
                </Button>
              </div>
            </div>

            {/* Hourly Engagement Heatmap */}
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Temporal engagement Velocity</span>
                  <p className="text-2xl font-black italic tracking-tighter">Peak Launch Windows</p>
                </div>
                <Clock className="h-5 w-5 text-amber-500" />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-1 sm:gap-2">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const intensity = Math.floor(Math.random() * 4); // Simulate intensity 0-3
                    return (
                      <TooltipProvider key={i}>
                        <UITooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={cn(
                                "aspect-square rounded-[4px] sm:rounded-md transition-all cursor-pointer hover:ring-2 ring-primary/40",
                                intensity === 0 ? "bg-secondary/40" :
                                intensity === 1 ? "bg-primary/20" :
                                intensity === 2 ? "bg-primary/50" : "bg-primary"
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent className="rounded-lg p-2 font-black uppercase text-[8px] tracking-widest">
                            {i}:00 — {intensity === 3 ? 'High' : intensity === 2 ? 'Medium' : 'Low'} Velocity
                          </TooltipContent>
                        </UITooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest px-1">
                  <span>00:00</span>
                  <span>12:00</span>
                  <span>23:00</span>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4">
                <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] font-medium leading-relaxed uppercase tracking-tighter text-muted-foreground">
                  Peak network vibration detected between <span className="text-primary font-black">18:00 - 21:00</span>. Align your launches with this window to maximize spatial reach by <span className="text-primary font-black">34%</span>.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Management/Console Category View */}
        {activeCategory === 'management' && (
          <section className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Settings2 className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Creator Console</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Nodes Operational</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Broadcast Control */}
              <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl space-y-6 relative overflow-hidden group">
                <div className="relative z-10 space-y-6">
                  <div className="space-y-2">
                    <h4 className="text-lg font-black italic uppercase tracking-widest">Broadcast Signal</h4>
                    <p className="text-xs text-muted-foreground font-medium uppercase leading-relaxed">Push update pulses to your entire network cluster simultaneously.</p>
                  </div>
                  <Button 
                    className="w-full h-14 rounded-2xl bg-primary text-white font-black italic uppercase tracking-[0.2em] text-xs shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    onClick={() => { triggerHaptic(20); toast({ title: "Signal Initialized", description: "Select nodes to receive your collective update pulse." }); }}
                  >
                    <Radio className="mr-2 h-4 w-4" /> Launch Broadcast
                  </Button>
                </div>
                <Radio className="absolute -right-4 -bottom-4 h-32 w-32 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
              </div>

              {/* Identity Pulse Toggles */}
              <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl space-y-8">
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Identity Handshakes</h4>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">Ghost Node Mode</p>
                      <p className="text-[9px] text-muted-foreground uppercase font-black">Hide your spatial presence in the hub</p>
                    </div>
                    <Switch 
                      checked={settings.isGhostMode} 
                      onCheckedChange={(val) => { triggerHaptic(5); updateSettings({ isGhostMode: val }); }}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  <div className="h-px bg-primary/5" />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="font-bold text-sm">Auto-Follow Protocol</p>
                      <p className="text-[9px] text-muted-foreground uppercase font-black">Follow nodes that join via your link</p>
                    </div>
                    <Switch 
                      checked={settings.isAutoFollowEnabled} 
                      onCheckedChange={(val) => { triggerHaptic(5); updateSettings({ isAutoFollowEnabled: val }); }}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Vault */}
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                    <Lock className="h-4 w-4" />
                  </div>
                  <h4 className="text-xl font-black italic uppercase tracking-tighter">Metadata Vault</h4>
                </div>
                <Button variant="ghost" size="sm" className="text-[9px] font-black uppercase tracking-widest text-accent">Manage Vault</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {METADATA_VAULT.map((item) => (
                  <div key={item.id} className="p-5 rounded-2xl bg-secondary/20 border border-transparent hover:border-accent/20 transition-all group flex flex-col justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-accent">{item.label}</p>
                      <p className="text-xs font-medium leading-relaxed italic text-foreground/70 truncate">"{item.content}"</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className={cn(
                        "h-10 rounded-xl border-accent/20 text-accent font-black uppercase text-[9px] tracking-widest hover:bg-accent/5",
                        copiedId === item.id && "bg-accent/10 text-accent border-accent"
                      )}
                      onClick={() => handleCopy(item.content, item.id)}
                    >
                      {copiedId === item.id ? <><Check className="mr-1.5 h-3 w-3" /> SYNCED</> : <><Copy className="mr-1.5 h-3 w-3" /> COPY NODE</>}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Collaboration Calibration */}
            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-8 shadow-xl space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h4 className="text-lg font-black italic uppercase tracking-widest">Collaboration Whitelist</h4>
                  <p className="text-xs text-muted-foreground font-medium uppercase">Calibrate who can tag your signature in their vibes.</p>
                </div>
                <Select 
                  value={settings.taggingPrivacy} 
                  onValueChange={(val: any) => { triggerHaptic(5); updateSettings({ taggingPrivacy: val }); }}
                >
                  <SelectTrigger className="h-12 w-full sm:w-[240px] rounded-xl bg-secondary/30 border-none px-4 shadow-inner">
                    <SelectValue placeholder="Who can tag you?" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="everyone" className="font-bold">Everyone (Public Pulse)</SelectItem>
                    <SelectItem value="friends" className="font-bold">Mutual Nodes Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="h-px bg-primary/5" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-start gap-5 group">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold">Spatial reach Optimizer</p>
                    <p className="text-[10px] text-muted-foreground uppercase leading-relaxed font-medium">Auto-calibrated to high-velocity nodes. Increases discoverability by <span className="text-primary font-black">12%</span>.</p>
                  </div>
                </div>
                <div className="p-6 bg-accent/5 rounded-[2rem] border border-accent/10 flex items-start gap-5 group">
                  <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-bold">Encrypted Handshakes</p>
                    <p className="text-[10px] text-muted-foreground uppercase leading-relaxed font-medium">All Direct Signals are shielded by the ViMore Pro-HD Security Cluster.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

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

        {activeCategory === 'analytics' && (
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
        )}

        <footer className="pt-10 pb-24 space-y-8">
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
            <p className="text-center text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">
              ViMore Node v1.5.0-HighVelocity • Command Core Active
            </p>
          </div>
        </footer>

      </main>
    </div>
  );
}
