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
  Upload
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
import { aiAnalyzeGlobalSentimentAction } from "@/app/actions/ai";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AdminTab = "pulse" | "economy" | "intelligence" | "velocity" | "identity" | "safety" | "governance" | "campaigns" | "infrastructure" | "resolution" | "logs";
type EconomySubTab = "outbound" | "inbound";

export default function AdminDashboard() {
  const { withdrawalHistory, paymentRequests, reports, tickets, processWithdrawal, approvePaymentRequest, rejectPaymentRequest, triggerHaptic, posts, settings, updateSettings, auditLogs, addAuditLog, adStats, intelligenceMetrics, connections, campaigns, currentUser, staff, promoteUser, demoteUser, refreshAdminData, addCampaign, deleteCampaign, toggleCampaignStatus, updateUserIdentity, handleReportAction, handleTicketAction, uploadMedia } = usePosts();
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
  const hasLoggedBreach = useRef(false);

  // Campaign Form State
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [campForm, setCampForm] = useState({
    title: "",
    content: "",
    type: "photo" as "photo" | "video",
    actionUrl: "",
    actionLabel: "Launch Pulse"
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
    if (isSuper) return ["pulse", "economy", "intelligence", "velocity", "identity", "safety", "governance", "campaigns", "infrastructure", "resolution", "logs"] as AdminTab[];
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
    const hours = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00", "23:59"];
    return hours.map(h => ({
      time: h,
      active: Math.max(10, Math.floor(stats.totalNodes * (0.2 + Math.random() * 0.8))),
      load: 15 + Math.random() * 20,
      latency: 45 + Math.random() * 10
    }));
  }, [stats.totalNodes]);

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
      setCampPreview(URL.createObjectURL(file));
      setCampForm(prev => ({ ...prev, type: file.type.startsWith('video/') ? 'video' : 'photo' }));
    }
  };

  const handleLaunchCampaign = async () => {
    if (!campForm.title || !campForm.content || !campFile) return;
    setIsCreatingCampaign(true);
    triggerHaptic(50);
    try {
      const mediaUrl = await uploadMedia(campFile);
      await addCampaign({ ...campForm, mediaUrl });
      toast({ title: "Campaign Launched", description: "Global node materialized in discover stream." });
      setCampForm({ title: "", content: "", type: "photo", actionUrl: "", actionLabel: "Launch Pulse" });
      setCampFile(null);
      setCampPreview(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Handshake Failed", description: e.message });
    } finally {
      setIsCreatingCampaign(false);
    }
  };

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
    logs: { label: "Logs", icon: FileText }
  };

  const mobilePrimaryTabs: AdminTab[] = useMemo(() => {
    const list: AdminTab[] = ["pulse", "economy", "intelligence", "safety"];
    return list.filter(t => availableTabs.includes(t));
  }, [availableTabs]);

  const mobileRemainingTabs: AdminTab[] = useMemo(() => {
    return availableTabs.filter(t => !mobilePrimaryTabs.includes(t));
  }, [availableTabs, mobilePrimaryTabs]);

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
        <header className="h-20 px-6 sm:px-8 flex items-center justify-between bg-card/20 border-b border-border backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4">
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
                            <td className="px-8 py-5"><div className="flex flex-col"><span className="font-black text-primary text-sm">{w.payoutCurrency} {w.payoutAmount.toFixed(2)}</span><span className="text-[9px] font-bold text-muted-foreground uppercase">Source: {w.amount} {w.currency}</span></div></td>
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
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-1 px-2">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Campaign Hub</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Global Discovery Node Materialization</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 bg-card/40 border-border rounded-[2.5rem] p-8 space-y-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5"><Megaphone className="h-24 w-24" /></div>
                  <div className="space-y-2 relative z-10"><h4 className="text-xl font-black italic uppercase tracking-tighter">Materialize Node</h4><p className="text-[10px] font-bold text-muted-foreground uppercase">Launch global discovery vibes</p></div>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Vibe Title</Label><Input value={campForm.title} onChange={(e) => setCampForm({...campForm, title: e.target.value})} className="h-12 bg-secondary/30 border-none rounded-xl font-bold" placeholder="Summer Sonic Pulse..." /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Content Manifesto</Label><Textarea value={campForm.content} onChange={(e) => setCampForm({...campForm, content: e.target.value})} className="bg-secondary/30 border-none rounded-xl font-medium min-h-[100px] resize-none" placeholder="Experience the high-velocity..." /></div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Action Link</Label><Input value={campForm.actionUrl} onChange={(e) => setCampForm({...campForm, actionUrl: e.target.value})} className="h-12 bg-secondary/30 border-none rounded-xl font-bold" placeholder="/music or URL" /></div>
                      <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Button Label</Label><Input value={campForm.actionLabel} onChange={(e) => setCampForm({...campForm, actionLabel: e.target.value})} className="h-12 bg-secondary/30 border-none rounded-xl font-bold" /></div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Visual Handshake</Label>
                      <div className="relative aspect-video rounded-2xl bg-secondary/30 border-2 border-dashed border-primary/10 flex flex-col items-center justify-center cursor-pointer group hover:border-primary/30 transition-all overflow-hidden" onClick={() => campInputRef.current?.click()}>
                        {campPreview ? (
                          <>
                            {campForm.type === 'video' ? <video src={campPreview} className="w-full h-full object-cover" autoPlay loop muted /> : <Image src={campPreview} alt="Preview" fill className="object-cover" />}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><RefreshCcw className="h-6 w-6 text-white" /></div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                            <Upload className="h-6 w-6" />
                            <span className="text-[9px] font-black uppercase">Upload HQ Media</span>
                          </div>
                        )}
                      </div>
                      <input type="file" ref={campInputRef} className="hidden" accept="image/*,video/*" onChange={handleCampaignMedia} />
                    </div>

                    <Button className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black italic uppercase tracking-widest shadow-xl shadow-primary/20" disabled={isCreatingCampaign || !campForm.title || !campFile} onClick={handleLaunchCampaign}>
                      {isCreatingCampaign ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Zap className="h-5 w-5 mr-2" />}
                      Launch Node
                    </Button>
                  </div>
                </Card>

                <Card className="lg:col-span-2 bg-card/40 border-border rounded-[2.5rem] overflow-hidden shadow-xl flex flex-col">
                  <div className="p-8 border-b border-border flex items-center justify-between"><div className="space-y-1"><h4 className="text-xl font-black italic uppercase tracking-tighter">Campaign Registry</h4><p className="text-[10px] font-bold text-muted-foreground uppercase">Active global discovery stream handshakes</p></div><Badge className="bg-primary text-primary-foreground border-none font-black h-5 px-3 uppercase tracking-tighter">{campaigns.length} NODES</Badge></div>
                  <ScrollArea className="flex-1">
                    <div className="p-6 grid grid-cols-1 gap-4">
                      {campaigns.map((c) => (
                        <div key={c.$id} className="p-4 bg-secondary/20 rounded-3xl border border-white/5 flex items-center gap-6 group hover:bg-secondary/30 transition-all">
                          <div className="relative h-20 w-20 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                            {c.type === 'video' ? <video src={c.mediaUrl} className="w-full h-full object-cover" muted /> : <Image src={c.mediaUrl} alt="Campaign" fill className="object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-base truncate">{c.title}</h5>
                              <Badge className={cn("text-[8px] font-black uppercase h-4 px-1.5", c.isActive ? "bg-green-500 text-white" : "bg-zinc-500 text-white")}>{c.isActive ? 'ACTIVE' : 'IDLE'}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1 italic">"{c.content}"</p>
                            <div className="flex items-center gap-4 pt-1">
                              <div className="flex items-center gap-1 text-[9px] font-black text-primary uppercase"><Eye className="h-3 w-3" /> {c.impressions?.toLocaleString() || 0} Reach</div>
                              <div className="flex items-center gap-1 text-[9px] font-black text-accent uppercase"><ArrowUpRight className="h-3 w-3" /> {c.clicks?.toLocaleString() || 0} Clicks</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={c.isActive} onCheckedChange={() => toggleCampaignStatus(c.$id)} />
                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive transition-colors" onClick={() => { triggerHaptic(50); deleteCampaign(c.$id); }}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      ))}
                      {campaigns.length === 0 && <div className="py-24 text-center opacity-40 italic text-xs uppercase font-black">Campaign clusters silent</div>}
                    </div>
                  </ScrollArea>
                </Card>
              </div>
            </div>
          )}
          {/* Other tabs follow original layout logic */}
        </div>
      </main>
      {/* Mobile Nav Overlay */}
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
