
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { 
  ShieldCheck, 
  Zap, 
  Activity, 
  Users, 
  BarChart3, 
  Rocket, 
  Coins, 
  Gem, 
  Star,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  TrendingUp,
  Globe,
  Settings,
  MoreVertical,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  HardDrive,
  Eye,
  Trash2,
  Search,
  CircleDashed,
  UserPlus,
  ShieldAlert,
  Flag,
  Ban,
  MessageCircle,
  Clock,
  ArrowDownCircle,
  ArrowUpCircle,
  ImageIcon,
  X,
  Smartphone,
  Building2,
  Check,
  Send,
  Loader2,
  Sliders,
  FileText,
  Lock,
  Music2,
  Clapperboard,
  LayoutDashboard,
  BrainCircuit,
  EyeOff,
  Cpu,
  Unplug,
  Sparkles,
  Trophy,
  ArrowRight,
  Mic2,
  ListMusic,
  Database,
  Hammer,
  RotateCcw,
  Download,
  Megaphone,
  Palette,
  Video,
  ExternalLink,
  Plus,
  Shield,
  UserCheck,
  UserCheck as UserVerifyIcon,
  UserMinus,
  KeyRound,
  RefreshCcw,
  LayoutGrid,
  Upload,
  Film,
  ArrowLeft,
  MousePointerClick,
  CalendarClock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { usePosts } from "@/context/PostContext";
import { useNotifications } from "@/context/NotificationContext";
import { useMusic } from "@/context/MusicContext";
import { useTranslation } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AdminTab = "pulse" | "economy" | "intelligence" | "velocity" | "identity" | "safety" | "governance" | "campaigns" | "infrastructure" | "resolution" | "logs" | "staff";
type EconomySubTab = "outbound" | "inbound";

export default function AdminDashboard() {
  const { withdrawalHistory, paymentRequests, reports, tickets, processWithdrawal, approvePaymentRequest, rejectPaymentRequest, triggerHaptic, posts, settings, updateSettings, auditLogs, addAuditLog, adStats, intelligenceMetrics, connections, campaigns, currentUser, staff, promoteUser, demoteUser, refreshAdminData, addCampaign, deleteCampaign, toggleCampaignStatus, updateUserIdentity, handleReportAction, handleTicketAction, submitTicket, uploadMedia, isLoading } = usePosts();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const userRole = currentUser?.role || 'USER';
  const isSuper = userRole === 'SUPER';
  const isFinancial = userRole === 'FINANCIAL';
  const isModerator = userRole === 'MODERATOR';
  const isUnauthorized = userRole === 'USER';

  const [activeTab, setActiveTab] = useState<AdminTab>("pulse");
  const [economySubTab, setEconomySubTab] = useState<EconomySubTab>("outbound");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [isAnalyzingVibe, setIsAnalyzingVibe] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const [govSearch, setGovSearch] = useState("");
  const [idSearch, setIdSearch] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const hasLoggedBreach = useRef(false);

  // Campaign Form State
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [campaignSubTab, setCampaignSubTab] = useState<'story' | 'download' | 'music' | 'feed' | 'reel'>('story');
  const [campForm, setCampForm] = useState({
    title: "",
    content: "",
    type: "photo" as "photo" | "video" | "audio",
    actionUrl: "",
    actionLabel: "Learn More",
    placement: "story" as "story" | "download" | "music" | "feed" | "reel",
    endDate: "",
    endTime: "",
  });
  const [campFile, setCampFile] = useState<File | null>(null);
  const [campPreview, setCampPreview] = useState<string | null>(null);
  const campInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isUnauthorized && !hasLoggedBreach.current && currentUser?.username) {
      addAuditLog("UNAUTHORIZED_CORE_ACCESS_ATTEMPT", `Standard user node @${currentUser.username} attempted to synchronize with the Command Core.`);
      hasLoggedBreach.current = true;
    }
    
    if (!isUnauthorized) {
      refreshAdminData();
    }
  }, [isUnauthorized, refreshAdminData, addAuditLog, currentUser?.username]);

  const pendingWithdrawals = useMemo(() => 
    withdrawalHistory.filter(w => w.status === 'PENDING'), 
    [withdrawalHistory]
  );

  const pendingPayments = useMemo(() => 
    paymentRequests.filter(p => p.status === 'PENDING'), 
    [paymentRequests]
  );

  const availableTabs = useMemo(() => {
    if (isSuper) return ["pulse", "economy", "intelligence", "velocity", "identity", "safety", "governance", "campaigns", "infrastructure", "resolution", "logs", "staff"] as AdminTab[];
    const tabs: AdminTab[] = ["pulse", "logs"];
    if (isFinancial) tabs.push("economy", "infrastructure");
    if (isModerator) tabs.push("intelligence", "velocity", "identity", "safety", "campaigns", "resolution");
    return tabs;
  }, [isSuper, isFinancial, isModerator]);

  const stats = useMemo(() => ({
    totalNodes: connections.length,
    totalSignatures: posts.length,
    totalEnergy: connections.reduce((acc, c) => acc + (c.goldBalance || 0), 0),
    auditEntries: auditLogs.length
  }), [posts, connections, auditLogs]);

  const livePulseData = useMemo(() => {
    const hourBuckets: Record<number, number> = {};
    posts.forEach(p => {
      const ts = p.timestamp || p.$createdAt;
      if (ts) {
        const h = new Date(ts).getHours();
        hourBuckets[h] = (hourBuckets[h] || 0) + 1;
      }
    });
    const hours = [0, 4, 8, 12, 16, 20, 23];
    return hours.map(h => ({
      time: `${String(h).padStart(2, '0')}:00`,
      active: Math.max(0, hourBuckets[h] || 0),
    }));
  }, [posts]);

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED', type: 'withdrawal' | 'payment') => {
    triggerHaptic(status === 'APPROVED' ? 50 : 100);
    if (type === 'withdrawal') {
      await processWithdrawal(id, status);
      toast({ title: status === 'APPROVED' ? "Node Materialized" : "Handshake Denied" });
    } else if (type === 'payment') {
      if (status === 'APPROVED') await approvePaymentRequest(id);
      else await rejectPaymentRequest(id);
      toast({ title: status === 'APPROVED' ? "Pulse Authorized" : "Handshake Purged" });
    }
  };

  const handleCampaignMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCampFile(file);
      if (file.type.startsWith('audio/')) {
        setCampPreview(null);
        setCampForm(prev => ({ ...prev, type: 'audio' }));
      } else if (file.type.startsWith('video/')) {
        setCampPreview(URL.createObjectURL(file));
        setCampForm(prev => ({ ...prev, type: 'video' }));
      } else {
        setCampPreview(URL.createObjectURL(file));
        setCampForm(prev => ({ ...prev, type: 'photo' }));
      }
    }
  };

  const handleLaunchCampaign = async () => {
    if (!campForm.title || !campForm.content || !campFile) return;
    setIsCreatingCampaign(true);
    triggerHaptic(50);
    try {
      const mediaUrl = await uploadMedia(campFile);
      let endDateIso: string | null = null;
      if (campForm.endDate) {
        const timeStr = campForm.endTime || "23:59";
        endDateIso = new Date(`${campForm.endDate}T${timeStr}:00`).toISOString();
      }
      await addCampaign({ ...campForm, mediaUrl, placement: campaignSubTab, endDate: endDateIso });
      toast({ title: "Campaign Created", description: "Your ad campaign is now live." });
      setCampForm({ title: "", content: "", type: campaignSubTab === 'music' ? 'audio' : campaignSubTab === 'reel' ? 'video' : 'photo', actionUrl: "", actionLabel: "Learn More", placement: campaignSubTab, endDate: "", endTime: "" });
      setCampFile(null);
      setCampPreview(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed", description: e.message });
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  const handleCampaignSubTabChange = (tab: 'story' | 'download' | 'music' | 'feed' | 'reel') => {
    setCampaignSubTab(tab);
    setCampForm({ title: "", content: "", type: tab === 'music' ? 'audio' : tab === 'reel' ? 'video' : 'photo', actionUrl: "", actionLabel: "Learn More", placement: tab, endDate: "", endTime: "" });
    setCampFile(null);
    setCampPreview(null);
  };

  // Auto-expire campaigns that have passed their end date
  useEffect(() => {
    const checkExpiry = () => {
      const now = new Date();
      campaigns.forEach((c: any) => {
        if (c.is_active && c.end_date) {
          const endDate = new Date(c.end_date);
          if (endDate <= now) {
            toggleCampaignStatus(c.$id);
          }
        }
      });
    };
    checkExpiry();
    const interval = setInterval(checkExpiry, 60000);
    return () => clearInterval(interval);
  }, [campaigns, toggleCampaignStatus]);

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 animate-pulse">Initializing Alpha Core...</p>
      </div>
    );
  }

  const TABS_DATA = {
    pulse: { label: "Pulse", icon: Activity },
    economy: { label: "Economy", icon: Coins },
    intelligence: { label: "Intelligence", icon: BrainCircuit },
    velocity: { label: "Velocity", icon: TrendingUp },
    identity: { label: "Identity", icon: UserPlus },
    safety: { label: "Safety", icon: ShieldAlert },
    governance: { label: "Governance", icon: Sliders },
    campaigns: { label: "Campaigns", icon: Megaphone },
    infrastructure: { label: "Infras", icon: Database },
    resolution: { label: "Resol", icon: Hammer },
    logs: { label: "Logs", icon: FileText },
    staff: { label: "Staff", icon: Users }
  };

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center space-y-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-destructive/20 blur-[150px] rounded-full animate-pulse" />
        </div>
        <div className="relative">
          <div className="absolute -inset-8 bg-destructive/10 rounded-full blur-2xl animate-ping opacity-40" />
          <div className="h-24 w-24 bg-destructive/10 rounded-3xl flex items-center justify-center text-destructive relative z-10 border border-destructive/20 shadow-2xl">
            <ShieldAlert className="h-12 w-12" />
          </div>
        </div>
        <div className="space-y-3 relative z-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">Handshake Denied</h1>
          <div className="flex flex-col items-center gap-2">
            <p className="text-muted-foreground text-sm max-w-xs uppercase font-bold tracking-widest leading-relaxed">
              Insufficient spatial authority to synchronize with the MTL Command Core.
            </p>
            <Badge variant="outline" className="border-destructive/20 text-destructive text-[8px] font-black uppercase px-2 h-5">BREACH ATTEMPT LOGGED</Badge>
          </div>
        </div>
        <Link href="/" className="relative z-10">
          <Button variant="outline" className="rounded-2xl border-white/10 text-white font-black uppercase italic text-[10px] tracking-[0.3em] h-14 px-10 transition-all hover:bg-white hover:text-black active:scale-95">
            Return to Network
          </Button>
        </Link>
        <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] pt-12">ViMore Sentry v1.5 • Command Core Active</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden selection:bg-primary/30 transition-colors duration-500">
      <aside className={cn(
        "h-screen bg-card/40 backdrop-blur-3xl border-r border-border transition-all duration-500 hidden md:flex flex-col shrink-0 z-[100]",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-4 border-b border-border">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shrink-0 shadow-lg shadow-primary/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <h1 className="font-black italic uppercase tracking-tighter text-lg leading-none">{t('nav_admin')}</h1>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">
                {userRole === 'SUPER' ? t('admin_role_super') : userRole === 'FINANCIAL' ? t('admin_role_financial') : t('admin_role_moderator')}
              </span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          {availableTabs.map((tab) => {
            const Icon = TABS_DATA[tab].icon;
            const isActive = activeTab === tab;
            return (
              <button key={tab} onClick={() => { triggerHaptic(5); setActiveTab(tab); }} className={cn("w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative", isActive ? "bg-primary text-white shadow-xl shadow-primary/10" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground")}>
                <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive && "animate-pulse")} />
                {isSidebarOpen && <span className="text-xs font-black italic uppercase tracking-widest">{TABS_DATA[tab].label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start gap-4 h-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50">
              <Rocket className="h-5 w-5" />
              {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Exit Core</span>}
            </Button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto scrollbar-hide">
        <header className="h-20 px-4 sm:px-8 flex items-center justify-between bg-card/20 border-b border-border backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="md:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex"><Menu className="h-6 w-6" /></Button>
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Spatial Node</h2>
              <span className="text-sm sm:text-lg font-black italic uppercase tracking-tighter">Cluster: ViMore-Main-Alpha</span>
            </div>
          </div>
          <Avatar className="h-10 w-10 border-2 border-primary/20"><AvatarImage src={currentUser?.avatar} /></Avatar>
        </header>

        <div className="p-4 sm:p-10 space-y-10 pb-32">
          {activeTab === 'pulse' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: "Active Nodes", value: stats.totalNodes.toLocaleString(), icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
                  { label: "Digital Signatures", value: stats.totalSignatures.toLocaleString(), icon: Rocket, color: "text-primary", bg: "bg-primary/10" },
                  { label: "Audit Handshakes", value: stats.auditEntries.toLocaleString(), icon: BarChart3, color: "text-accent", bg: "bg-accent/10" },
                  { label: "Network Energy", value: `GD ${stats.totalEnergy.toLocaleString()}`, icon: Coins, color: "text-amber-400", bg: "bg-amber-400/10" }
                ].map((m) => (
                  <Card key={m.label} className="bg-card/40 border-border rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all shadow-sm">
                    <CardContent className="p-6 flex items-center gap-5">
                      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", m.bg, m.color)}><m.icon className="h-6 w-6" /></div>
                      <div className="flex flex-col"><span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{m.label}</span><span className="text-xl font-black italic uppercase tracking-tighter">{m.value}</span></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="bg-card/40 border-border rounded-[2rem] p-8 shadow-sm">
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6">Live Network Concurrency</h3>
                <div className="h-[300px] w-full">
                  <ChartContainer config={{ active: { label: "Nodes", color: "hsl(var(--primary))" } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={livePulseData}>
                        <defs><linearGradient id="adminPulse" x1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/><stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="time" hide />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="active" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#adminPulse)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'economy' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1"><h3 className="text-3xl font-black italic uppercase tracking-tighter">Economy Auditor</h3><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Financial Node Synchronization</p></div>
                <div className="flex gap-1 bg-secondary/40 p-1.5 rounded-2xl">
                  <button onClick={() => setEconomySubTab("outbound")} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", economySubTab === "outbound" ? "bg-white dark:bg-card text-primary shadow-md" : "text-muted-foreground")}>Outbound</button>
                  <button onClick={() => setEconomySubTab("inbound")} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", economySubTab === "inbound" ? "bg-white dark:bg-card text-primary shadow-md" : "text-muted-foreground")}>Inbound</button>
                </div>
              </div>

              {economySubTab === 'outbound' ? (
                <Card className="bg-card/40 border-border rounded-[2.5rem] overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead><tr className="border-b border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/20"><th className="px-8 py-4">IDENTITY</th><th className="px-8 py-4">AMOUNT</th><th className="px-8 py-4">GATEWAY</th><th className="px-8 py-4 text-right">HANDSHAKE</th></tr></thead>
                      <tbody className="divide-y divide-border">
                        {pendingWithdrawals.length > 0 ? pendingWithdrawals.map((w) => (
                          <tr key={w.$id} className="hover:bg-secondary/10 transition-colors">
                            <td className="px-8 py-5"><div className="flex flex-col"><span className="font-bold text-sm">@{w.username}</span><span className="text-[10px] font-black text-muted-foreground uppercase">{w.accountName}</span></div></td>
                            <td className="px-8 py-5"><div className="flex flex-col"><span className="font-black text-primary text-sm">{w.payoutCurrency} {(w.payoutAmount ?? 0).toFixed(2)}</span><span className="text-[9px] font-bold text-muted-foreground uppercase">Source: {w.amount} {w.currency}</span></div></td>
                            <td className="px-8 py-5"><Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20">{w.method}</Badge></td>
                            <td className="px-8 py-5 text-right"><div className="flex items-center justify-end gap-2"><Button size="sm" className="h-8 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white" onClick={() => handleAction(w.$id, 'APPROVED', 'withdrawal')}><Check className="h-4 w-4" /></Button><Button size="sm" className="h-8 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white" onClick={() => handleAction(w.$id, 'REJECTED', 'withdrawal')}><X className="h-4 w-4" /></Button></div></td>
                          </tr>
                        )) : (<tr><td colSpan={4} className="py-24 text-center opacity-40 italic text-xs uppercase">No pending outbound handshakes</td></tr>)}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingPayments.map((p) => (
                    <Card key={p.$id} className="bg-card/40 border-border rounded-[2.5rem] p-6 space-y-6 shadow-xl group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4"><Avatar className="h-12 w-12 border-2 border-primary/10"><AvatarImage src={`https://picsum.photos/seed/${p.username}/100/100`} /></Avatar><div><p className="font-bold text-base">@{p.username}</p><p className="text-[10px] font-black text-muted-foreground uppercase">{p.packageName}</p></div></div>
                        <Badge className="bg-amber-500/10 text-amber-500 border-none font-black h-5 px-3 uppercase">{p.currency} {p.amount}</Badge>
                      </div>
                      <div className="aspect-video relative rounded-2xl overflow-hidden border border-white/5 cursor-zoom-in" onClick={() => setSelectedReceipt(p.screenshot)}><Image src={p.screenshot} alt="Receipt" fill className="object-cover group-hover:scale-105 transition-transform" /><div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-black text-[10px] uppercase tracking-widest">Verify Visual</div></div>
                      <div className="flex gap-3"><Button className="flex-1 h-12 rounded-2xl bg-green-600 text-white font-black uppercase text-[10px] tracking-widest" onClick={() => handleAction(p.$id, 'APPROVED', 'payment')}>Approve Node</Button><Button variant="ghost" className="flex-1 h-12 rounded-2xl bg-destructive/10 text-destructive font-black uppercase text-[10px] tracking-widest" onClick={() => handleAction(p.$id, 'REJECTED', 'payment')}>Reject</Button></div>
                    </Card>
                  ))}
                  {pendingPayments.length === 0 && <div className="col-span-full py-24 text-center bg-card/20 rounded-[2.5rem] border border-dashed border-border opacity-40 uppercase text-xs font-black">Vault Inbound Nodes Silent</div>}
                </div>
              )}
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="space-y-1 px-2">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Campaign Hub</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Create and manage in-app ad campaigns</p>
              </div>

              {/* Sub-tab selector — horizontal scroll on mobile */}
              <div className="overflow-x-auto pb-1 -mx-2 px-2">
                <div className="flex gap-2 bg-secondary/30 p-1.5 rounded-2xl w-max min-w-full">
                  {([
                    { key: 'story', label: 'Story Ads', icon: Clapperboard },
                    { key: 'download', label: 'Download Ads', icon: Download },
                    { key: 'music', label: 'Music Audio', icon: Music2 },
                    { key: 'feed', label: 'Feed Post Ads', icon: LayoutGrid },
                    { key: 'reel', label: 'Reel Video Ads', icon: Film },
                  ] as const).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => handleCampaignSubTabChange(key)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0",
                        campaignSubTab === key ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description for each type */}
              <div className="px-2">
                {campaignSubTab === 'story' && (
                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-3">
                    <Clapperboard className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Story Ads</p>
                      <p className="text-xs text-muted-foreground mt-0.5">These ads appear automatically after every 2 stories a user views. They match the exact full-screen story design with your photo or video and a call-to-action button.</p>
                    </div>
                  </div>
                )}
                {campaignSubTab === 'download' && (
                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-3">
                    <Download className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Download Ads</p>
                      <p className="text-xs text-muted-foreground mt-0.5">These ads show as a 30-second interstitial when a user clicks any download button. One active campaign shows at a time; if multiple exist they rotate. Supports photo and video.</p>
                    </div>
                  </div>
                )}
                {campaignSubTab === 'music' && (
                  <div className="p-4 bg-accent/5 border border-accent/10 rounded-2xl flex items-start gap-3">
                    <Music2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Music Audio Ads</p>
                      <p className="text-xs text-muted-foreground mt-0.5">These audio ads play automatically after every 2 songs. Users cannot skip to another song until the audio finishes. Upload an audio file — maximum 45 seconds long.</p>
                    </div>
                  </div>
                )}
                {campaignSubTab === 'feed' && (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
                    <LayoutGrid className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Feed Post Ads</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Photo ads that appear directly in the home feed every 3 posts, looking exactly like a regular post. Only shows your title, description, and a call-to-action button — no likes, comments, share, or download.</p>
                    </div>
                  </div>
                )}
                {campaignSubTab === 'reel' && (
                  <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-start gap-3">
                    <Film className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-sm">Reel Video Ads</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Video ads that appear in the Reels page exactly like a real reel, every 3 reels. Only shows your title, description, and a call-to-action button — no likes, comments, share, or download.</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Creation Form */}
                <Card className="lg:col-span-1 bg-card/40 border-border rounded-[2.5rem] p-8 space-y-5 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5"><Megaphone className="h-24 w-24" /></div>
                  <div className="space-y-1 relative z-10">
                    <h4 className="text-xl font-black italic uppercase tracking-tighter">
                      {campaignSubTab === 'story' ? 'New Story Ad' : campaignSubTab === 'download' ? 'New Download Ad' : campaignSubTab === 'music' ? 'New Music Audio Ad' : campaignSubTab === 'feed' ? 'New Feed Post Ad' : 'New Reel Video Ad'}
                    </h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">
                      {campaignSubTab === 'music' ? 'Upload audio (max 45 sec)' : campaignSubTab === 'reel' ? 'Upload video only' : 'Upload photo or video'}
                    </p>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Ad Title</Label>
                      <Input value={campForm.title} onChange={(e) => setCampForm({...campForm, title: e.target.value})} className="h-12 bg-secondary/30 border-none rounded-xl font-bold" placeholder="Your brand message..." />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                      <Textarea value={campForm.content} onChange={(e) => setCampForm({...campForm, content: e.target.value})} className="bg-secondary/30 border-none rounded-xl font-medium min-h-[80px] resize-none" placeholder="Tell users about your offer..." />
                    </div>
                    
                    {campaignSubTab !== 'music' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Link URL</Label>
                          <Input value={campForm.actionUrl} onChange={(e) => setCampForm({...campForm, actionUrl: e.target.value})} className="h-11 bg-secondary/30 border-none rounded-xl font-bold text-sm" placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Button Text</Label>
                          <Input value={campForm.actionLabel} onChange={(e) => setCampForm({...campForm, actionLabel: e.target.value})} className="h-11 bg-secondary/30 border-none rounded-xl font-bold text-sm" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        {campaignSubTab === 'music' ? 'Audio File (MP3, max 45s)' : campaignSubTab === 'reel' ? 'Video File' : 'Photo or Video'}
                      </Label>
                      <div
                        className="relative rounded-2xl bg-secondary/30 border-2 border-dashed border-primary/10 flex flex-col items-center justify-center cursor-pointer group hover:border-primary/30 transition-all overflow-hidden"
                        style={{ minHeight: campaignSubTab === 'music' ? '80px' : '140px' }}
                        onClick={() => campInputRef.current?.click()}
                      >
                        {campPreview && campForm.type !== 'audio' ? (
                          <>
                            {campForm.type === 'video'
                              ? <video src={campPreview} className="w-full h-full object-cover" autoPlay loop muted />
                              : <Image src={campPreview} alt="Preview" fill className="object-cover" />
                            }
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><RefreshCcw className="h-6 w-6 text-white" /></div>
                          </>
                        ) : campFile && campForm.type === 'audio' ? (
                          <div className="flex flex-col items-center gap-2 py-4">
                            <Music2 className="h-8 w-8 text-primary" />
                            <span className="text-[10px] font-black uppercase text-primary">{campFile.name}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity py-5">
                            <Upload className="h-6 w-6" />
                            <span className="text-[9px] font-black uppercase">
                              {campaignSubTab === 'music' ? 'Upload Audio File' : campaignSubTab === 'reel' ? 'Upload Video' : 'Upload Photo or Video'}
                            </span>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={campInputRef}
                        className="hidden"
                        accept={campaignSubTab === 'music' ? 'audio/*' : campaignSubTab === 'reel' ? 'video/*' : 'image/*,video/*'}
                        onChange={handleCampaignMedia}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Date & Time (optional)</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <CalendarClock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <Input
                            type="date"
                            value={campForm.endDate}
                            onChange={(e) => setCampForm({...campForm, endDate: e.target.value})}
                            min={new Date().toISOString().split('T')[0]}
                            className="h-11 bg-secondary/30 border-none rounded-xl font-bold text-sm pl-9"
                          />
                        </div>
                        <Input
                          type="time"
                          value={campForm.endTime}
                          onChange={(e) => setCampForm({...campForm, endTime: e.target.value})}
                          className="h-11 bg-secondary/30 border-none rounded-xl font-bold text-sm"
                          disabled={!campForm.endDate}
                        />
                      </div>
                      {campForm.endDate && (
                        <p className="text-[10px] text-muted-foreground ml-1">Campaign will auto-off on {new Date(`${campForm.endDate}T${campForm.endTime || "23:59"}:00`).toLocaleString()}</p>
                      )}
                    </div>

                    <Button
                      className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black italic uppercase tracking-widest shadow-xl shadow-primary/20"
                      disabled={isCreatingCampaign || !campForm.title || !campFile}
                      onClick={handleLaunchCampaign}
                    >
                      {isCreatingCampaign ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Zap className="h-5 w-5 mr-2" />}
                      Launch Campaign
                    </Button>
                  </div>
                </Card>

                {/* Campaign List */}
                <Card className="lg:col-span-2 bg-card/40 border-border rounded-[2.5rem] overflow-hidden shadow-xl flex flex-col">
                  <div className="p-8 border-b border-border flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-xl font-black italic uppercase tracking-tighter">Active Campaigns</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">
                        {campaignSubTab === 'story' ? 'Story ad placements' : campaignSubTab === 'download' ? 'Download interstitials' : campaignSubTab === 'music' ? 'Music audio spots' : campaignSubTab === 'feed' ? 'Home feed post ads' : 'Reel video ads'}
                      </p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground border-none font-black h-5 px-3 uppercase tracking-tighter">
                      {campaigns.filter((c: any) => c.placement === campaignSubTab).length} ADS
                    </Badge>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-6 grid grid-cols-1 gap-4">
                      {campaigns
                        .filter((c: any) => c.placement === campaignSubTab)
                        .map((c: any) => (
                        <div key={c.$id} className="p-4 bg-secondary/20 rounded-3xl border border-white/5 flex items-center gap-5 group hover:bg-secondary/30 transition-all">
                          <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0 shadow-lg bg-secondary/30 flex items-center justify-center">
                            {c.type === 'audio' ? (
                              <Music2 className="h-7 w-7 text-primary" />
                            ) : c.type === 'video' ? (
                              c.media_url ? <video src={c.media_url} className="w-full h-full object-cover" muted /> : <Video className="h-7 w-7 text-muted-foreground" />
                            ) : (
                              c.media_url ? <Image src={c.media_url} alt="Campaign" fill className="object-cover" /> : <ImageIcon className="h-7 w-7 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-bold text-sm truncate">{c.title}</h5>
                              <Badge className={cn("text-[8px] font-black uppercase h-4 px-1.5 border-none", c.is_active ? "bg-green-500 text-white" : "bg-zinc-500 text-white")}>
                                {c.is_active ? 'LIVE' : 'PAUSED'}
                              </Badge>
                              <Badge variant="outline" className="text-[8px] font-black uppercase h-4 px-1.5 border-primary/20 text-primary">
                                {c.type || 'photo'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{c.content}</p>
                            <div className="flex items-center gap-3 pt-0.5 flex-wrap">
                              <div className="flex items-center gap-1.5 bg-primary/10 rounded-lg px-2 py-0.5">
                                <Eye className="h-3 w-3 text-primary" />
                                <span className="text-[10px] font-black text-primary tabular-nums">{(c.impressions || 0).toLocaleString()} views</span>
                              </div>
                              <div className="flex items-center gap-1.5 bg-accent/10 rounded-lg px-2 py-0.5">
                                <MousePointerClick className="h-3 w-3 text-accent" />
                                <span className="text-[10px] font-black text-accent tabular-nums">{(c.clicks || 0).toLocaleString()} clicks</span>
                              </div>
                              {(c.impressions || 0) > 0 && (
                                <span className="text-[10px] font-black text-muted-foreground">
                                  CTR: {(((c.clicks || 0) / (c.impressions || 1)) * 100).toFixed(1)}%
                                </span>
                              )}
                            </div>
                            {c.end_date && (
                              <div className={cn("flex items-center gap-1.5 mt-0.5", new Date(c.end_date) <= new Date() ? "text-destructive" : "text-muted-foreground")}>
                                <CalendarClock className="h-3 w-3 shrink-0" />
                                <span className="text-[10px] font-black">
                                  {new Date(c.end_date) <= new Date() ? "Expired: " : "Ends: "}
                                  {new Date(c.end_date).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={!!c.is_active} onCheckedChange={() => toggleCampaignStatus(c.$id)} />
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive" onClick={() => { triggerHaptic(50); deleteCampaign(c.$id); }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                      {campaigns.filter((c: any) => c.placement === campaignSubTab).length === 0 && (
                        <div className="py-24 text-center opacity-40 italic text-xs uppercase font-black">No campaigns yet — create one to get started</div>
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'intelligence' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-1 px-2">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Intelligence Core</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">AI-Powered Network Analysis</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Network Sentiment", value: `${intelligenceMetrics.sentiment}%`, icon: BrainCircuit, color: "text-green-400", bg: "bg-green-400/10", sub: "Positive vibes detected" },
                  { label: "Velocity Status", value: intelligenceMetrics.velocity, icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10", sub: "Content spread rate" },
                  { label: "Ad Revenue", value: `$${adStats.revenue.toLocaleString()}`, icon: Coins, color: "text-primary", bg: "bg-primary/10", sub: "This billing cycle" },
                  { label: "Handshakes", value: adStats.handshakes.toLocaleString(), icon: ArrowUpRight, color: "text-blue-400", bg: "bg-blue-400/10", sub: "Ad interactions" },
                ].map(m => (
                  <Card key={m.label} className="bg-card/40 border-border rounded-[2rem] p-6 space-y-4 shadow-sm">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", m.bg, m.color)}><m.icon className="h-6 w-6" /></div>
                    <div><p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{m.label}</p><p className="text-2xl font-black italic uppercase tracking-tighter">{m.value}</p><p className="text-[10px] text-muted-foreground mt-1">{m.sub}</p></div>
                  </Card>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/40 border-border rounded-[2.5rem] p-8 space-y-6 shadow-xl">
                  <h4 className="text-xl font-black italic uppercase tracking-tighter">Sentiment Pulse</h4>
                  <div className="space-y-4">
                    {[{ label: "Positive", pct: intelligenceMetrics.sentiment, color: "bg-green-500" }, { label: "Neutral", pct: 100 - intelligenceMetrics.sentiment - 5, color: "bg-amber-400" }, { label: "Negative", pct: 5, color: "bg-destructive" }].map(s => (
                      <div key={s.label} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground"><span>{s.label}</span><span>{s.pct}%</span></div>
                        <div className="h-2 bg-secondary/40 rounded-full overflow-hidden"><div className={cn("h-full rounded-full transition-all", s.color)} style={{ width: `${s.pct}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="bg-card/40 border-border rounded-[2.5rem] p-8 space-y-6 shadow-xl">
                  <h4 className="text-xl font-black italic uppercase tracking-tighter">Content Distribution</h4>
                  <div className="space-y-3">
                    {(() => {
                      const total = posts.length || 1;
                      const photoCount = posts.filter(p => p.type === 'photo').length;
                      const videoCount = posts.filter(p => p.type === 'video').length;
                      const lockedCount = posts.filter(p => p.isLocked).length;
                      const boostedCount = posts.filter(p => p.isBoosted).length;
                      const otherCount = Math.max(0, total - photoCount - videoCount);
                      return [
                        { cat: "Photo", pct: Math.round((photoCount / total) * 100) },
                        { cat: "Video", pct: Math.round((videoCount / total) * 100) },
                        { cat: "Text", pct: Math.round((otherCount / total) * 100) },
                        { cat: "Locked", pct: Math.round((lockedCount / total) * 100) },
                        { cat: "Boosted", pct: Math.round((boostedCount / total) * 100) },
                      ];
                    })().map(c => (
                      <div key={c.cat} className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase w-16 text-muted-foreground">{c.cat}</span>
                        <div className="flex-1 h-2 bg-secondary/40 rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${c.pct}%` }} /></div>
                        <span className="text-[10px] font-black text-muted-foreground w-8 text-right">{c.pct}%</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'velocity' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-1 px-2">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Velocity Engine</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Content Spread & Engagement Ranking</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { label: "Total Views", value: posts.reduce((a, p) => a + (p.views || 0), 0).toLocaleString(), icon: Eye, color: "text-blue-400", bg: "bg-blue-400/10" },
                  { label: "Total Likes", value: posts.reduce((a, p) => a + (p.likes || 0), 0).toLocaleString(), icon: Star, color: "text-amber-400", bg: "bg-amber-400/10" },
                  { label: "Total Shares", value: posts.reduce((a, p) => a + (p.shares || 0), 0).toLocaleString(), icon: ArrowUpRight, color: "text-green-400", bg: "bg-green-400/10" },
                ].map(m => (
                  <Card key={m.label} className="bg-card/40 border-border rounded-[2rem] p-6 flex items-center gap-5 shadow-sm">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", m.bg, m.color)}><m.icon className="h-6 w-6" /></div>
                    <div><p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{m.label}</p><p className="text-xl font-black italic uppercase tracking-tighter">{m.value}</p></div>
                  </Card>
                ))}
              </div>
              <Card className="bg-card/40 border-border rounded-[2.5rem] overflow-hidden shadow-xl">
                <div className="p-8 border-b border-border"><h4 className="text-xl font-black italic uppercase tracking-tighter">Top Performing Signatures</h4><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Ranked by total view velocity</p></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead><tr className="border-b border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/20"><th className="px-8 py-4">#</th><th className="px-8 py-4">Creator</th><th className="px-8 py-4">Content</th><th className="px-8 py-4">Views</th><th className="px-8 py-4">Likes</th><th className="px-8 py-4">Shares</th></tr></thead>
                    <tbody className="divide-y divide-border">
                      {[...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).map((p, i) => (
                        <tr key={p.$id} className="hover:bg-secondary/10 transition-colors">
                          <td className="px-8 py-4"><span className={cn("text-sm font-black", i === 0 ? "text-amber-400" : i === 1 ? "text-zinc-400" : i === 2 ? "text-amber-700" : "text-muted-foreground")}>#{i + 1}</span></td>
                          <td className="px-8 py-4"><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarImage src={p.user?.avatar} /></Avatar><span className="font-bold text-sm">@{p.user?.username}</span></div></td>
                          <td className="px-8 py-4"><p className="text-xs text-muted-foreground max-w-[200px] truncate">{p.content}</p></td>
                          <td className="px-8 py-4"><span className="font-black text-sm text-blue-400">{(p.views || 0).toLocaleString()}</span></td>
                          <td className="px-8 py-4"><span className="font-black text-sm text-amber-400">{(p.likes || 0).toLocaleString()}</span></td>
                          <td className="px-8 py-4"><span className="font-black text-sm text-green-400">{(p.shares || 0).toLocaleString()}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'identity' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
                <div className="space-y-1"><h3 className="text-3xl font-black italic uppercase tracking-tighter">Identity Matrix</h3><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Node Verification & Role Management</p></div>
                <div className="relative w-full sm:w-64"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={idSearch} onChange={e => setIdSearch(e.target.value)} placeholder="Search nodes..." className="pl-10 h-12 bg-secondary/30 border-none rounded-2xl font-bold" /></div>
              </div>
              <Card className="bg-card/40 border-border rounded-[2.5rem] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead><tr className="border-b border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/20"><th className="px-8 py-4">Identity</th><th className="px-8 py-4">Role</th><th className="px-8 py-4">Followers</th><th className="px-8 py-4">Verified</th><th className="px-8 py-4 text-right">Actions</th></tr></thead>
                    <tbody className="divide-y divide-border">
                      {[currentUser, ...connections].filter(Boolean).filter(u => !idSearch || u.username?.toLowerCase().includes(idSearch.toLowerCase()) || u.name?.toLowerCase().includes(idSearch.toLowerCase())).map(u => (
                        <tr key={u.$id} className="hover:bg-secondary/10 transition-colors">
                          <td className="px-8 py-4"><div className="flex items-center gap-3"><Avatar className="h-9 w-9 border-2 border-primary/10"><AvatarImage src={u.avatar} /></Avatar><div><p className="font-bold text-sm">@{u.username}</p><p className="text-[10px] text-muted-foreground">{u.name}</p></div></div></td>
                          <td className="px-8 py-4"><Badge variant="outline" className={cn("text-[9px] font-black uppercase", u.role === 'SUPER' ? "border-amber-400/30 text-amber-400" : u.role === 'FINANCIAL' ? "border-green-400/30 text-green-400" : u.role === 'MODERATOR' ? "border-blue-400/30 text-blue-400" : "border-border text-muted-foreground")}>{u.role || 'USER'}</Badge></td>
                          <td className="px-8 py-4"><span className="font-black text-sm">{(u.followers || 0).toLocaleString()}</span></td>
                          <td className="px-8 py-4">{u.isVerified ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <CircleDashed className="h-5 w-5 text-muted-foreground/40" />}</td>
                          <td className="px-8 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {u.$id !== currentUser?.$id && (
                                <>
                                  <Button size="sm" variant="ghost" className="h-8 rounded-xl text-[9px] font-black uppercase text-blue-400 hover:bg-blue-400/10" onClick={() => { triggerHaptic(10); promoteUser(u.username || '', 'MODERATOR'); toast({ title: `@${u.username} promoted to Moderator` }); }}><UserCheck className="h-3 w-3 mr-1" />Promote</Button>
                                  <Button size="sm" variant="ghost" className="h-8 rounded-xl text-[9px] font-black uppercase text-destructive hover:bg-destructive/10" onClick={() => { triggerHaptic(50); demoteUser(u.username || ''); toast({ title: `@${u.username} demoted` }); }}><UserMinus className="h-3 w-3 mr-1" />Demote</Button>
                                </>
                              )}
                              {u.$id === currentUser?.$id && <Badge className="text-[8px] font-black uppercase bg-primary/10 text-primary border-none">You</Badge>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              {staff.length > 0 && (
                <Card className="bg-card/40 border-border rounded-[2.5rem] p-8 space-y-6 shadow-xl">
                  <h4 className="text-xl font-black italic uppercase tracking-tighter">Staff Roster</h4>
                  <div className="space-y-3">
                    {staff.map((s: any) => (
                      <div key={s.$id} className="flex items-center gap-4 p-4 bg-secondary/20 rounded-2xl">
                        <Avatar className="h-10 w-10"><AvatarImage src={s.avatar} /></Avatar>
                        <div className="flex-1"><p className="font-bold text-sm">@{s.username}</p><p className="text-[10px] text-muted-foreground">{s.name}</p></div>
                        <Badge className={cn("text-[9px] font-black uppercase border-none", s.role === 'MODERATOR' ? "bg-blue-400/10 text-blue-400" : "bg-green-400/10 text-green-400")}>{s.role}</Badge>
                        <Button size="sm" variant="ghost" className="h-8 rounded-xl text-destructive hover:bg-destructive/10 text-[9px] font-black uppercase" onClick={() => { demoteUser(s.username); toast({ title: `@${s.username} removed from staff` }); }}><UserMinus className="h-3 w-3 mr-1" />Remove</Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
                <div className="space-y-1"><h3 className="text-3xl font-black italic uppercase tracking-tighter">Safety Shield</h3><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Flagged Content & Community Reports</p></div>
                <div className="flex gap-2">
                  <Badge className="bg-destructive/10 text-destructive border-none font-black uppercase">{reports.filter((r: any) => r.status === 'PENDING').length} Pending</Badge>
                  <Badge className="bg-green-500/10 text-green-500 border-none font-black uppercase">{reports.filter((r: any) => r.status === 'RESOLVED').length} Resolved</Badge>
                </div>
              </div>
              <Card className="bg-card/40 border-border rounded-[2.5rem] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead><tr className="border-b border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/20"><th className="px-8 py-4">Reported Node</th><th className="px-8 py-4">Reason</th><th className="px-8 py-4">Details</th><th className="px-8 py-4">Reporter</th><th className="px-8 py-4">Status</th><th className="px-8 py-4 text-right">Action</th></tr></thead>
                    <tbody className="divide-y divide-border">
                      {reports.length > 0 ? reports.map((r: any) => (
                        <tr key={r.$id} className="hover:bg-secondary/10 transition-colors">
                          <td className="px-8 py-5"><span className="font-bold text-sm">@{r.reportedUsername}</span></td>
                          <td className="px-8 py-5"><Badge variant="outline" className={cn("text-[9px] font-black uppercase", r.reason === 'Spam' ? "border-amber-400/30 text-amber-400" : r.reason === 'Harassment' ? "border-destructive/30 text-destructive" : r.reason === 'Hate Speech' ? "border-red-600/30 text-red-500" : "border-border text-muted-foreground")}>{r.reason}</Badge></td>
                          <td className="px-8 py-5"><p className="text-xs text-muted-foreground max-w-[200px] line-clamp-2">{r.details}</p></td>
                          <td className="px-8 py-5"><span className="text-xs font-bold text-muted-foreground">@{r.reporterUsername}</span></td>
                          <td className="px-8 py-5"><Badge className={cn("text-[9px] font-black uppercase border-none", r.status === 'PENDING' ? "bg-amber-400/10 text-amber-400" : "bg-green-500/10 text-green-500")}>{r.status}</Badge></td>
                          <td className="px-8 py-5 text-right">
                            {r.status === 'PENDING' && (
                              <div className="flex items-center justify-end gap-2">
                                <Button size="sm" className="h-8 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white text-[9px] font-black uppercase" onClick={() => { triggerHaptic(30); handleReportAction(r.$id, 'RESOLVED'); addAuditLog('REPORT_RESOLVED', `Report ${r.$id} against @${r.reportedUsername} marked resolved`); toast({ title: "Report Resolved" }); }}><Check className="h-3 w-3 mr-1" />Resolve</Button>
                                <Button size="sm" className="h-8 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white text-[9px] font-black uppercase" onClick={() => { triggerHaptic(80); handleReportAction(r.$id, 'DISMISSED'); addAuditLog('REPORT_DISMISSED', `Report ${r.$id} against @${r.reportedUsername} dismissed`); toast({ title: "Report Dismissed" }); }}><X className="h-3 w-3 mr-1" />Dismiss</Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )) : (<tr><td colSpan={6} className="py-24 text-center opacity-40 italic text-xs uppercase">Safety shields nominal — no reports</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'governance' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
                <div className="space-y-1"><h3 className="text-3xl font-black italic uppercase tracking-tighter">Governance Console</h3><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Platform-Wide Settings & Controls</p></div>
                <div className="relative w-full sm:w-64"><Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input value={govSearch} onChange={e => setGovSearch(e.target.value)} placeholder="Filter settings..." className="pl-10 h-12 bg-secondary/30 border-none rounded-2xl font-bold" /></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/40 border-border rounded-[2.5rem] p-8 space-y-6 shadow-xl">
                  <h4 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-2"><Lock className="h-5 w-5 text-primary" />Privacy & Access</h4>
                  <div className="space-y-5">
                    {[
                      { label: "Ghost Mode", sub: "Hide online status across the network", key: "isGhostMode", value: settings.isGhostMode },
                      { label: "Auto-Follow Suggestions", sub: "Enable automated connection recommendations", key: "isAutoFollowEnabled", value: settings.isAutoFollowEnabled },
                    ].filter(s => !govSearch || s.label.toLowerCase().includes(govSearch.toLowerCase())).map(s => (
                      <div key={s.key} className="flex items-center justify-between gap-4 p-4 bg-secondary/20 rounded-2xl">
                        <div><p className="font-bold text-sm">{s.label}</p><p className="text-[10px] text-muted-foreground">{s.sub}</p></div>
                        <Switch checked={s.value as boolean} onCheckedChange={v => { updateSettings({ [s.key]: v }); addAuditLog('SETTINGS_UPDATED', `${s.label} set to ${v} by @${currentUser?.username}`); }} />
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="bg-card/40 border-border rounded-[2.5rem] p-8 space-y-6 shadow-xl">
                  <h4 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-2"><Sliders className="h-5 w-5 text-primary" />Experience Controls</h4>
                  <div className="space-y-6">
                    <div className="space-y-3 p-4 bg-secondary/20 rounded-2xl">
                      <div className="flex justify-between"><p className="font-bold text-sm">Haptic Intensity</p><span className="text-[10px] font-black text-primary">{settings.hapticIntensity}%</span></div>
                      <Slider value={[settings.hapticIntensity]} onValueChange={([v]) => updateSettings({ hapticIntensity: v })} min={0} max={100} step={10} className="w-full" />
                    </div>
                    <div className="space-y-3 p-4 bg-secondary/20 rounded-2xl">
                      <div className="flex justify-between"><p className="font-bold text-sm">Font Scale</p><span className="text-[10px] font-black text-primary">{settings.fontScale}x</span></div>
                      <Slider value={[settings.fontScale * 100]} onValueChange={([v]) => updateSettings({ fontScale: v / 100 })} min={80} max={120} step={10} className="w-full" />
                    </div>
                    <div className="p-4 bg-secondary/20 rounded-2xl space-y-2">
                      <p className="font-bold text-sm">Playback Quality</p>
                      <div className="flex gap-2">
                        {['low', 'standard', 'high'].map(q => (
                          <button key={q} onClick={() => updateSettings({ playbackQuality: q as any })} className={cn("flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all", settings.playbackQuality === q ? "bg-primary text-white" : "bg-secondary/40 text-muted-foreground hover:bg-secondary")}>{q}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
                <Card className="bg-card/40 border-border rounded-[2.5rem] p-8 space-y-6 shadow-xl">
                  <h4 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-2"><EyeOff className="h-5 w-5 text-primary" />Discovery Settings</h4>
                  <div className="space-y-4">
                    {['Tagging Privacy', 'Discovery Visibility'].map((label, i) => {
                      const key = i === 0 ? 'taggingPrivacy' : 'discoveryVisibility';
                      const val = (settings as any)[key];
                      return (
                        <div key={label} className="p-4 bg-secondary/20 rounded-2xl space-y-2">
                          <p className="font-bold text-sm">{label}</p>
                          <div className="flex gap-2">
                            {['everyone', 'friends', 'nobody'].map(opt => (
                              <button key={opt} onClick={() => updateSettings({ [key]: opt as any })} className={cn("flex-1 py-2 rounded-xl text-[10px] font-black uppercase transition-all capitalize", val === opt ? "bg-primary text-white" : "bg-secondary/40 text-muted-foreground hover:bg-secondary")}>{opt}</button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
                <Card className="bg-card/40 border-border rounded-[2.5rem] p-8 space-y-6 shadow-xl">
                  <h4 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-2"><Music2 className="h-5 w-5 text-primary" />Sound & Theme</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-secondary/20 rounded-2xl space-y-2">
                      <p className="font-bold text-sm">Active Sound Set</p>
                      <div className="grid grid-cols-3 gap-2">
                        {['cyberpunk', 'minimal', 'nature'].map(s => (
                          <button key={s} onClick={() => updateSettings({ activeSoundSet: s as any })} className={cn("py-2 rounded-xl text-[10px] font-black uppercase capitalize transition-all", settings.activeSoundSet === s ? "bg-primary text-white" : "bg-secondary/40 text-muted-foreground hover:bg-secondary")}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-secondary/20 rounded-2xl space-y-2">
                      <p className="font-bold text-sm">Theme</p>
                      <div className="flex gap-2">
                        {['light', 'dark', 'system'].map(t => (
                          <button key={t} onClick={() => updateSettings({ theme: t as any })} className={cn("flex-1 py-2 rounded-xl text-[10px] font-black uppercase capitalize transition-all", settings.theme === t ? "bg-primary text-white" : "bg-secondary/40 text-muted-foreground hover:bg-secondary")}>{t}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'infrastructure' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-1 px-2">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Infrastructure Node</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">System Health & Resource Allocation</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Uptime", value: "99.97%", icon: Activity, color: "text-green-400", bg: "bg-green-400/10", sub: "Last 30 days" },
                  { label: "Avg Latency", value: "42ms", icon: Zap, color: "text-amber-400", bg: "bg-amber-400/10", sub: "Global CDN" },
                  { label: "Storage Used", value: "2.4 TB", icon: HardDrive, color: "text-blue-400", bg: "bg-blue-400/10", sub: "of 10 TB allocated" },
                  { label: "API Calls", value: "1.2M", icon: Cpu, color: "text-primary", bg: "bg-primary/10", sub: "This week" },
                ].map(m => (
                  <Card key={m.label} className="bg-card/40 border-border rounded-[2rem] p-6 space-y-4 shadow-sm">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", m.bg, m.color)}><m.icon className="h-6 w-6" /></div>
                    <div><p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{m.label}</p><p className="text-2xl font-black italic uppercase tracking-tighter">{m.value}</p><p className="text-[10px] text-muted-foreground mt-1">{m.sub}</p></div>
                  </Card>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card/40 border-border rounded-[2.5rem] p-8 space-y-6 shadow-xl">
                  <h4 className="text-xl font-black italic uppercase tracking-tighter">Service Health</h4>
                  <div className="space-y-3">
                    {[
                      { name: "Appwrite Backend", status: connections.length > 0 || posts.length > 0 ? "OPERATIONAL" : "CHECKING" },
                      { name: "Authentication Gateway", status: currentUser ? "OPERATIONAL" : "CHECKING" },
                      { name: "Media Storage", status: posts.some(p => (p.mediaUrls?.length ?? 0) > 0 || !!p.image) ? "OPERATIONAL" : "CHECKING" },
                      { name: "Real-Time Messaging", status: "OPERATIONAL" },
                      { name: "AI Inference Layer", status: "OPERATIONAL" },
                    ].map(s => (
                      <div key={s.name} className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-2.5 w-2.5 rounded-full animate-pulse", s.status === 'OPERATIONAL' ? "bg-green-500" : "bg-amber-400")} />
                          <div><p className="font-bold text-sm">{s.name}</p></div>
                        </div>
                        <Badge className={cn("text-[9px] font-black uppercase border-none", s.status === 'OPERATIONAL' ? "bg-green-500/10 text-green-500" : "bg-amber-400/10 text-amber-400")}>{s.status}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="bg-card/40 border-border rounded-[2.5rem] p-8 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between"><h4 className="text-xl font-black italic uppercase tracking-tighter">Data Volume</h4></div>
                  <div className="space-y-5">
                    {[
                      { label: "Total Posts", value: posts.length.toLocaleString(), color: "bg-blue-500", sub: "Signatures" },
                      { label: "Total Users", value: connections.length.toLocaleString(), color: "bg-primary", sub: "Active Nodes" },
                      { label: "Audit Logs", value: auditLogs.length.toLocaleString(), color: "bg-green-500", sub: "Immutable Trail" },
                      { label: "Ad Campaigns", value: campaigns.length.toLocaleString(), color: "bg-amber-400", sub: "Discovery Nodes" },
                    ].map(r => (
                      <div key={r.label} className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-2.5 w-2.5 rounded-full", r.color)} />
                          <div><p className="font-bold text-sm">{r.label}</p><p className="text-[10px] text-muted-foreground">{r.sub}</p></div>
                        </div>
                        <span className="font-black text-lg tabular-nums">{r.value}</span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full h-12 rounded-2xl border-border font-black uppercase text-[10px] tracking-widest" onClick={() => { triggerHaptic(30); refreshAdminData(); toast({ title: "Data Refreshed", description: "Admin data synced from Appwrite." }); }}><RotateCcw className="h-4 w-4 mr-2" />Refresh Data</Button>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'resolution' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
                <div className="space-y-1"><h3 className="text-3xl font-black italic uppercase tracking-tighter">Resolution Hub</h3><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Support Ticket Management</p></div>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-destructive/10 text-destructive border-none font-black uppercase">{tickets.filter((t: any) => t.status === 'OPEN').length} Open</Badge>
                  <Badge className="bg-amber-400/10 text-amber-400 border-none font-black uppercase">{tickets.filter((t: any) => t.status === 'IN_REVIEW').length} In Review</Badge>
                  <Badge className="bg-green-500/10 text-green-500 border-none font-black uppercase">{tickets.filter((t: any) => t.status === 'CLOSED').length} Closed</Badge>
                </div>
              </div>
              <div className="space-y-4">
                {tickets.length > 0 ? tickets.map((t: any) => (
                  <Card key={t.$id} className="bg-card/40 border-border rounded-[2.5rem] p-6 sm:p-8 space-y-5 shadow-xl">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-11 w-11 border-2 border-primary/10"><AvatarImage src={t.avatar} /></Avatar>
                        <div>
                          <p className="font-bold text-base">@{t.username}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[9px] font-black uppercase border-primary/20">{t.category}</Badge>
                            <Badge className={cn("text-[9px] font-black uppercase border-none", t.priority === 'HIGH' ? "bg-destructive/10 text-destructive" : t.priority === 'MEDIUM' ? "bg-amber-400/10 text-amber-400" : "bg-secondary text-muted-foreground")}>{t.priority}</Badge>
                          </div>
                        </div>
                      </div>
                      <Badge className={cn("text-[9px] font-black uppercase border-none self-start sm:self-auto", t.status === 'OPEN' ? "bg-destructive/10 text-destructive" : t.status === 'IN_REVIEW' ? "bg-amber-400/10 text-amber-400" : "bg-green-500/10 text-green-500")}>{t.status}</Badge>
                    </div>
                    <div className="space-y-1.5">
                      <h5 className="font-black text-base">{t.subject}</h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t.message}</p>
                    </div>
                    {t.status !== 'CLOSED' && (
                      <div className="flex gap-3">
                        {t.status === 'OPEN' && <Button size="sm" className="h-10 rounded-2xl bg-amber-400/10 text-amber-400 hover:bg-amber-400 hover:text-black font-black uppercase text-[10px]" onClick={() => { triggerHaptic(20); handleTicketAction(t.$id, 'IN_REVIEW'); addAuditLog('TICKET_REVIEWED', `Ticket ${t.$id} from @${t.username} moved to review`); toast({ title: "Ticket Under Review" }); }}><Eye className="h-3 w-3 mr-1" />Review</Button>}
                        <Button size="sm" className="h-10 rounded-2xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white font-black uppercase text-[10px]" onClick={() => { triggerHaptic(50); handleTicketAction(t.$id, 'CLOSED'); addAuditLog('TICKET_CLOSED', `Ticket ${t.$id} from @${t.username} resolved and closed`); toast({ title: "Ticket Closed" }); }}><Check className="h-3 w-3 mr-1" />Close</Button>
                      </div>
                    )}
                  </Card>
                )) : (<div className="py-24 text-center bg-card/20 rounded-[2.5rem] border border-dashed border-border opacity-40 uppercase text-xs font-black">Resolution queue clear</div>)}
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
                <div className="space-y-1"><h3 className="text-3xl font-black italic uppercase tracking-tighter">Audit Logs</h3><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Immutable Admin Action Trail</p></div>
                <Badge className="bg-primary/10 text-primary border-none font-black uppercase self-start sm:self-auto">{auditLogs.length} Entries</Badge>
              </div>
              <Card className="bg-card/40 border-border rounded-[2.5rem] overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead><tr className="border-b border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/20"><th className="px-8 py-4">Action</th><th className="px-8 py-4">Details</th><th className="px-8 py-4">Performed By</th><th className="px-8 py-4">Timestamp</th></tr></thead>
                    <tbody className="divide-y divide-border">
                      {auditLogs.length > 0 ? auditLogs.map((log: any) => (
                        <tr key={log.$id} className="hover:bg-secondary/10 transition-colors">
                          <td className="px-8 py-5">
                            <Badge variant="outline" className={cn("text-[9px] font-black uppercase whitespace-nowrap",
                              log.action.includes('DELETE') || log.action.includes('BAN') || log.action.includes('BREACH') ? "border-destructive/30 text-destructive" :
                              log.action.includes('APPROVED') || log.action.includes('VERIFIED') || log.action.includes('LAUNCHED') ? "border-green-400/30 text-green-400" :
                              log.action.includes('UPDATED') || log.action.includes('REVIEWED') ? "border-blue-400/30 text-blue-400" :
                              "border-border text-muted-foreground"
                            )}>{log.action.replace(/_/g, ' ')}</Badge>
                          </td>
                          <td className="px-8 py-5"><p className="text-xs text-muted-foreground max-w-[280px] truncate">{log.details || '—'}</p></td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                              <Avatar className="h-6 w-6 border border-primary/10">
                                <AvatarImage src={log.performedByAvatar} />
                                <AvatarFallback className="text-[8px]">{log.performedBy?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                              </Avatar>
                              <span className="text-[10px] font-black text-foreground">@{log.performedBy || 'system'}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 whitespace-nowrap"><span className="text-[10px] font-black text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span></td>
                        </tr>
                      )) : (<tr><td colSpan={4} className="py-24 text-center opacity-40 italic text-xs uppercase">No audit entries found</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'staff' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">Staff Management</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Assign & Manage Admin Roles</p>
                </div>
                <Badge className="bg-violet-500/10 text-violet-400 border-none font-black uppercase self-start sm:self-auto">{staff.length} Active Staff</Badge>
              </div>

              <Card className="bg-card/40 border-border rounded-[2.5rem] p-8 shadow-xl space-y-6">
                <h4 className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground">Search & Assign Role</h4>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <input
                    value={staffSearch}
                    onChange={e => setStaffSearch(e.target.value)}
                    placeholder="Search username..."
                    className="w-full h-14 bg-secondary/30 border border-border rounded-2xl pl-12 pr-5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                {staffSearch.trim().length >= 2 && (() => {
                  const query = staffSearch.trim().toLowerCase();
                  const results = connections.filter(c =>
                    c.username?.toLowerCase().includes(query) || c.name?.toLowerCase().includes(query)
                  ).slice(0, 5);
                  return results.length > 0 ? (
                    <div className="space-y-3">
                      {results.map((user: any) => (
                        <div key={user.$id} className="flex items-center justify-between bg-secondary/20 border border-border rounded-2xl p-4 gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-10 w-10 border-2 border-primary/10 shrink-0">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate">{user.name}</p>
                              <p className="text-[10px] font-black text-muted-foreground">@{user.username}</p>
                            </div>
                            {user.role && user.role !== 'USER' && (
                              <Badge className="text-[9px] font-black uppercase border-none bg-primary/10 text-primary shrink-0">{user.role}</Badge>
                            )}
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[10px] font-black uppercase rounded-xl border-violet-500/30 text-violet-400 hover:bg-violet-500 hover:text-white transition-all"
                              onClick={async () => {
                                await promoteUser(user.username, 'MODERATOR');
                                addAuditLog('STAFF_PROMOTED', `@${user.username} promoted to MODERATOR`);
                                toast({ title: "Role Assigned", description: `@${user.username} is now a Moderator` });
                              }}
                            >Moderator</Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[10px] font-black uppercase rounded-xl border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white transition-all"
                              onClick={async () => {
                                await promoteUser(user.username, 'FINANCIAL');
                                addAuditLog('STAFF_PROMOTED', `@${user.username} promoted to FINANCIAL`);
                                toast({ title: "Role Assigned", description: `@${user.username} is now Financial Admin` });
                              }}
                            >Financial</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-6 text-xs text-muted-foreground uppercase font-black opacity-50">No matching users found</p>
                  );
                })()}
              </Card>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.25em] text-muted-foreground px-2">Active Staff Roster</h4>
                {staff.length > 0 ? (
                  <Card className="bg-card/40 border-border rounded-[2.5rem] overflow-hidden shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead><tr className="border-b border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/20"><th className="px-8 py-4">Staff Member</th><th className="px-8 py-4">Role</th><th className="px-8 py-4">Assigned</th><th className="px-8 py-4">Action</th></tr></thead>
                        <tbody className="divide-y divide-border">
                          {staff.map((member: any) => (
                            <tr key={member.$id || member.username} className="hover:bg-secondary/10 transition-colors">
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9 border border-primary/10">
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-bold">{member.name}</p>
                                    <p className="text-[10px] font-black text-muted-foreground">@{member.username}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <Badge className={cn("text-[9px] font-black uppercase border-none",
                                  member.role === 'MODERATOR' ? "bg-violet-500/10 text-violet-400" :
                                  member.role === 'FINANCIAL' ? "bg-green-500/10 text-green-400" :
                                  "bg-primary/10 text-primary"
                                )}>{member.role}</Badge>
                              </td>
                              <td className="px-8 py-5"><span className="text-[10px] font-black text-muted-foreground">{member.assignedAt ? new Date(member.assignedAt).toLocaleDateString() : '—'}</span></td>
                              <td className="px-8 py-5">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="text-[10px] font-black uppercase rounded-xl h-8 px-4"
                                  onClick={async () => {
                                    await demoteUser(member.username);
                                    addAuditLog('STAFF_REMOVED', `@${member.username} removed from staff roster`);
                                    toast({ title: "Staff Removed", description: `@${member.username} has been demoted to User` });
                                  }}
                                >Remove</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ) : (
                  <div className="py-16 text-center bg-white/40 dark:bg-white/5 border border-dashed border-primary/10 rounded-[2.5rem] opacity-40 uppercase text-xs font-black">No staff assigned yet</div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <nav className="fixed bottom-0 left-0 right-0 md:hidden z-[200] bg-card/95 backdrop-blur-3xl border-t border-border safe-area-bottom">
        <div className="flex overflow-x-auto scrollbar-hide py-2 px-2 gap-1">
          {availableTabs.map((tab) => {
            const { label, icon: Icon } = TABS_DATA[tab];
            const isTabActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => { triggerHaptic(5); setActiveTab(tab); }}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all shrink-0 min-w-[56px]",
                  isTabActive ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[8px] font-black uppercase tracking-wide leading-none">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {selectedReceipt && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-300">
          <Button variant="ghost" size="icon" className="absolute top-6 right-6 text-white bg-white/10 rounded-full" onClick={() => setSelectedReceipt(null)}><X className="h-6 w-6" /></Button>
          <div className="relative w-full max-w-2xl aspect-[3/4] sm:aspect-video rounded-[2rem] overflow-hidden shadow-2xl border border-white/10"><Image src={selectedReceipt} alt="Receipt Proof" fill className="object-contain" /></div>
          <p className="mt-6 text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Audit Trail Inspector</p>
        </div>
      )}
    </div>
  );
}
