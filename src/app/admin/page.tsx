
"use client";

import { useState, useMemo, useEffect } from "react";
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
  UserMinus,
  KeyRound,
  RefreshCcw,
  LayoutGrid
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
import { aiAnalyzeGlobalSentiment } from "@/app/actions/ai";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type AdminTab = "pulse" | "economy" | "intelligence" | "velocity" | "identity" | "safety" | "governance" | "gateway" | "campaigns" | "infrastructure" | "resolution" | "logs";
type EconomySubTab = "outbound" | "inbound";

const MOCK_DAILY_PULSE = [
  { time: "00:00", active: 1200, load: 15, latency: 45 },
  { time: "04:00", active: 800, load: 8, latency: 38 },
  { time: "08:00", active: 2400, load: 45, latency: 110 },
  { time: "12:00", active: 4800, load: 82, latency: 156 },
  { time: "16:00", active: 5200, load: 94, latency: 142 },
  { time: "20:00", active: 3800, load: 60, latency: 88 },
  { time: "23:59", active: 1500, load: 20, latency: 52 },
];

export default function AdminDashboard() {
  const { withdrawalHistory, paymentRequests, processWithdrawal, approvePaymentRequest, rejectPaymentRequest, triggerHaptic, posts, gatewaySettings, updateGatewaySettings, settings, updateSettings, auditLogs, addAuditLog, adStats, intelligenceMetrics, updateIntelligence, connections, disputes, resolveDispute, campaigns, addCampaign, deleteCampaign, toggleCampaignStatus, currentUser, staff, promoteUser, demoteUser, refreshAdminData } = usePosts();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const userRole = currentUser.role || 'USER';
  const isSuper = userRole === 'SUPER';
  const isFinancial = userRole === 'FINANCIAL';
  const isModerator = userRole === 'MODERATOR';

  const [activeTab, setActiveTab] = useState<AdminTab>("pulse");
  const [economySubTab, setEconomySubTab] = useState<EconomySubTab>("outbound");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [isAnalyzingVibe, setIsAnalyzingVibe] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const [govSearch, setGovSearch] = useState("");
  const [gatewayForm, setGatewayForm] = useState(gatewaySettings);

  useEffect(() => {
    if (userRole !== 'USER') {
      refreshAdminData();
    }
  }, [userRole, refreshAdminData]);

  const pendingWithdrawals = useMemo(() => 
    withdrawalHistory.filter(w => w.status === 'PENDING'), 
    [withdrawalHistory]
  );

  const pendingPayments = useMemo(() => 
    paymentRequests.filter(p => p.status === 'PENDING'), 
    [paymentRequests]
  );

  const availableTabs = useMemo(() => {
    if (isSuper) return ["pulse", "economy", "intelligence", "velocity", "identity", "safety", "governance", "gateway", "campaigns", "infrastructure", "resolution", "logs"] as AdminTab[];
    const tabs: AdminTab[] = ["pulse", "logs"];
    if (isFinancial) tabs.push("economy", "gateway", "infrastructure");
    if (isModerator) tabs.push("intelligence", "velocity", "identity", "safety", "campaigns", "resolution");
    return tabs;
  }, [isSuper, isFinancial, isModerator]);

  // LIVE STATS MATERIALIZATION
  const stats = useMemo(() => ({
    totalNodes: connections.length,
    totalSignatures: posts.length,
    totalEnergy: connections.reduce((acc, c) => acc + (c.goldBalance || 0), 0),
    auditEntries: auditLogs.length
  }), [posts, connections, auditLogs]);

  const filteredUsersForGov = useMemo(() => {
    if (!govSearch.trim()) return [];
    return connections.filter(c => 
      !staff.some(s => s.username === c.username) &&
      (c.name.toLowerCase().includes(govSearch.toLowerCase()) || c.username.toLowerCase().includes(govSearch.toLowerCase()))
    );
  }, [connections, staff, govSearch]);

  const handlePromote = (username: string, role: 'FINANCIAL' | 'MODERATOR') => {
    triggerHaptic(50);
    promoteUser(username, role);
    setGovSearch("");
    toast({ title: "Authority Materialized", description: `@${username} is now an administrative node.` });
  };

  const handleDemote = (username: string) => {
    triggerHaptic(100);
    demoteUser(username);
    toast({ title: "Node Severed", description: `Administrative authority removed for @${username}.` });
  };

  const handleAction = async (id: string, status: 'APPROVED' | 'REJECTED', type: 'withdrawal' | 'payment' | 'dispute') => {
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

  const handleSaveGateway = () => {
    triggerHaptic(50);
    updateGatewaySettings(gatewayForm);
    toast({ title: "Gateway Synchronized" });
  };

  const handleAnalyzeSentiment = async () => {
    setIsAnalyzingVibe(true);
    triggerHaptic(30);
    try {
      const messages = posts.slice(0, 10).map(p => p.content);
      const res = await aiAnalyzeGlobalSentiment({ messages });
      updateIntelligence({
        sentimentScore: res.score,
        sentimentVibe: res.vibe,
        sentimentSummary: res.summary
      });
      toast({ title: "Global Vibe Synchronized" });
    } catch (e) {
      toast({ variant: "destructive", title: "Audit Error" });
    } finally {
      setIsAnalyzingVibe(false);
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
    gateway: { label: "Gateway", icon: Settings },
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

  if (userRole === 'USER') {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="h-20 w-20 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive animate-pulse">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Access Denied</h1>
          <p className="text-muted-foreground text-sm max-w-xs uppercase font-bold">Insufficient spatial authority to synchronize with the Command Core.</p>
        </div>
        <Link href="/"><Button variant="outline" className="rounded-xl border-white/10 text-white font-black uppercase text-[10px] tracking-widest h-12 px-8">Return to Network</Button></Link>
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
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
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
          {(["pulse", "economy", "intelligence", "velocity", "identity", "safety", "governance", "gateway", "campaigns", "infrastructure", "resolution", "logs"] as AdminTab[]).map((tab) => {
            if (!availableTabs.includes(tab)) return null;
            const Icon = TABS_DATA[tab].icon;
            const isActive = activeTab === tab;
            return (
              <button key={tab} onClick={() => { triggerHaptic(5); setActiveTab(tab); }} className={cn("w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative", isActive ? "bg-primary text-white shadow-xl shadow-primary/10" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground")}>
                <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive && "animate-pulse")} />
                {isSidebarOpen && <span className="text-xs font-black italic uppercase tracking-widest">{tab}</span>}
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
          <Avatar className="h-10 w-10 border-2 border-primary/20"><AvatarImage src={currentUser.avatar} /></Avatar>
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
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-6">Global Concurrency</h3>
                <div className="h-[300px] w-full">
                  <ChartContainer config={{ active: { label: "Nodes", color: "hsl(var(--primary))" } }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_DAILY_PULSE}>
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

          {activeTab === 'intelligence' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-1 px-2"><h3 className="text-3xl font-black italic uppercase tracking-tighter">Intelligence Node</h3><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Network Sentiment & Bot Detection</p></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 bg-card/40 border-border rounded-[2.5rem] p-8 space-y-8 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5"><BrainCircuit className="h-32 w-32" /></div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1"><h4 className="text-xl font-black italic uppercase tracking-tighter">Sentiment Pulse</h4><p className="text-[10px] font-bold text-muted-foreground uppercase">Groq AI Linguistic Heuristics</p></div>
                    <Button onClick={handleAnalyzeSentiment} disabled={isAnalyzingVibe} className="bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest rounded-xl h-10 px-6 gap-2">{isAnalyzingVibe ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} Resync Pulse</Button>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-secondary/20 rounded-3xl space-y-4">
                      <span className="text-[10px] font-black text-muted-foreground uppercase">Vibe Classification</span>
                      <div className="flex items-center gap-3">
                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", intelligenceMetrics.sentimentVibe === 'POSITIVE' ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500")}><TrendingUp className="h-6 w-6" /></div>
                        <p className="text-2xl font-black italic text-foreground">{intelligenceMetrics.sentimentVibe}</p>
                      </div>
                    </div>
                    <div className="p-6 bg-secondary/20 rounded-3xl space-y-4">
                      <span className="text-[10px] font-black text-muted-foreground uppercase">Integrity Score</span>
                      <div className="flex flex-col gap-2"><div className="flex justify-between items-baseline"><p className="text-3xl font-black italic text-primary">{intelligenceMetrics.sentimentScore}%</p><span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Optimal</span></div><Progress value={intelligenceMetrics.sentimentScore} className="h-1.5" /></div>
                    </div>
                  </div>
                  <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 space-y-3"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><p className="text-[10px] font-black text-primary uppercase">Groq Summary Node</p></div><p className="text-sm font-bold text-foreground/80 leading-relaxed italic">"{intelligenceMetrics.sentimentSummary}"</p></div>
                </Card>
                <Card className="bg-card/40 border-border rounded-[2.5rem] p-8 space-y-6 shadow-xl">
                  <h4 className="text-xl font-black italic uppercase tracking-tighter">Cluster Metrics</h4>
                  <div className="space-y-6">
                    {[
                      { label: "Bot Handshake Risk", value: intelligenceMetrics.botRisk, max: 100, color: "bg-red-500" },
                      { label: "Network Latency", value: intelligenceMetrics.latency, max: 500, color: "bg-primary" },
                      { label: "Identity Veracity", value: 94, max: 100, color: "bg-green-500" }
                    ].map(m => (
                      <div key={m.label} className="space-y-2"><div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground"><span>{m.label}</span><span>{m.value}{m.label.includes('Risk') ? '%' : 'ms'}</span></div><Progress value={(m.value/m.max)*100} className="h-1.5" /></div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'governance' && isSuper && (
            <div className="space-y-10 animate-in slide-in-from-right-4 duration-700">
              <div className="space-y-1 px-2"><h3 className="text-3xl font-black italic uppercase tracking-tighter">Governance Hub</h3><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Administrative Authority Materialization</p></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1 bg-card/40 border-border rounded-[2.5rem] p-8 space-y-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5"><ShieldCheck className="h-24 w-24" /></div>
                  <div className="space-y-2 relative z-10"><h4 className="text-xl font-black italic uppercase tracking-tighter">Authority Forge</h4><p className="text-[10px] font-bold text-muted-foreground uppercase">Materialize authority nodes</p></div>
                  <div className="space-y-4 relative z-10">
                    <div className="relative group"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" /><Input placeholder="Query identity..." className="pl-10 h-12 bg-secondary/30 border-none rounded-2xl" value={govSearch} onChange={(e) => setGovSearch(e.target.value)} /></div>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-2 pr-4">
                        {filteredUsersForGov.map((user) => (
                          <div key={user.username} className="p-3 bg-secondary/20 rounded-2xl border border-transparent hover:border-primary/20 transition-all group">
                            <div className="flex items-center gap-3 mb-3"><Avatar className="h-9 w-9"><AvatarImage src={user.avatar} /></Avatar><div className="text-left"><p className="font-bold text-xs">{user.name}</p><p className="text-[9px] font-black text-muted-foreground uppercase">@{user.username}</p></div></div>
                            <div className="grid grid-cols-2 gap-2"><Button size="sm" className="h-8 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white text-[8px] font-black uppercase" onClick={() => handlePromote(user.username, 'FINANCIAL')}>FINANCIAL</Button><Button size="sm" className="h-8 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white text-[8px] font-black uppercase" onClick={() => handlePromote(user.username, 'MODERATOR')}>MODERATOR</Button></div>
                          </div>
                        ))}
                        {govSearch && filteredUsersForGov.length === 0 && <div className="py-12 text-center opacity-40 italic text-xs uppercase">No nodes found</div>}
                      </div>
                    </ScrollArea>
                  </div>
                </Card>
                <Card className="lg:col-span-2 bg-card/40 border-border rounded-[2.5rem] overflow-hidden shadow-xl">
                  <div className="p-8 border-b border-border flex items-center justify-between"><div className="space-y-1"><h4 className="text-xl font-black italic uppercase tracking-tighter">Administrative Cluster</h4><p className="text-[10px] font-bold text-muted-foreground uppercase">Active authorized signatures</p></div><Badge className="bg-primary text-white border-none font-black h-5 px-3 uppercase tracking-tighter">{staff.length} NODES</Badge></div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead><tr className="border-b border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/20"><th className="px-8 py-4">IDENTITY</th><th className="px-8 py-4">ROLE SIGNATURE</th><th className="px-8 py-4 text-right">HANDSHAKE</th></tr></thead>
                      <tbody className="divide-y divide-border">
                        {staff.map((s) => (
                          <tr key={s.username} className="hover:bg-secondary/10 transition-colors">
                            <td className="px-8 py-5"><div className="flex items-center gap-3"><Avatar className="h-10 w-10 border border-primary/10"><AvatarImage src={s.avatar} /></Avatar><div className="flex flex-col"><span className="font-bold text-sm">{s.name}</span><span className="text-[10px] font-black text-muted-foreground uppercase">@{s.username}</span></div></div></td>
                            <td className="px-8 py-5"><Badge className={cn("font-black text-[8px] uppercase tracking-widest px-3 h-5", s.role === 'SUPER' ? "bg-primary text-white" : s.role === 'FINANCIAL' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500")}>{s.role}</Badge></td>
                            <td className="px-8 py-5 text-right">{s.username !== currentUser.username ? <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-xl" onClick={() => handleDemote(s.username)}><UserMinus className="h-4 w-4" /></Button> : <Badge variant="outline" className="text-[8px] font-black uppercase opacity-40">PRIMARY</Badge>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'gateway' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-1 px-2"><h3 className="text-3xl font-black italic uppercase tracking-tighter">Gateway Logic</h3><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Platform Financial Node Calibration</p></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-card/40 border-border rounded-[2.5rem] p-8 space-y-8 shadow-xl">
                  <div className="flex items-center gap-4"><div className="h-14 w-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500"><Smartphone className="h-8 w-8" /></div><div><h4 className="text-xl font-black italic uppercase tracking-tighter">Orange Money Node</h4><p className="text-[10px] font-bold text-muted-foreground uppercase">Inbound collection point</p></div></div>
                  <div className="space-y-4"><div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account Identity (Name)</Label><Input value={gatewayForm.orangeName} onChange={(e) => setGatewayForm({...gatewayForm, orangeName: e.target.value})} className="h-14 bg-secondary/30 border-none rounded-2xl font-bold" /></div><div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Node Number</Label><Input value={gatewayForm.orangeNumber} onChange={(e) => setGatewayForm({...gatewayForm, orangeNumber: e.target.value})} className="h-14 bg-secondary/30 border-none rounded-2xl font-bold" /></div></div>
                </Card>
                <Card className="bg-card/40 border-border rounded-[2.5rem] p-8 space-y-8 shadow-xl">
                  <div className="flex items-center gap-4"><div className="h-14 w-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500"><Building2 className="h-8 w-8" /></div><div><h4 className="text-xl font-black italic uppercase tracking-tighter">MTN Momo Node</h4><p className="text-[10px] font-bold text-muted-foreground uppercase">Inbound collection point</p></div></div>
                  <div className="space-y-4"><div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Account Identity (Name)</Label><Input value={gatewayForm.mtnName} onChange={(e) => setGatewayForm({...gatewayForm, mtnName: e.target.value})} className="h-14 bg-secondary/30 border-none rounded-2xl font-bold" /></div><div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Node Number</Label><Input value={gatewayForm.mtnNumber} onChange={(e) => setGatewayForm({...gatewayForm, mtnNumber: e.target.value})} className="h-14 bg-secondary/30 border-none rounded-2xl font-bold" /></div></div>
                </Card>
              </div>
              <div className="flex justify-center pt-10"><Button onClick={handleSaveGateway} className="h-16 px-12 rounded-3xl bg-primary text-white font-black italic uppercase tracking-[0.2em] text-lg shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">Synchronize Gateways</Button></div>
            </div>
          )}

          {activeTab === 'infrastructure' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-1 px-2"><h3 className="text-3xl font-black italic uppercase tracking-tighter">Infrastructure</h3><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Platform Core Integrity</p></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="bg-card/40 border-border rounded-[2rem] p-8 space-y-6 shadow-xl">
                  <div className="flex items-center gap-3 text-primary"><Database className="h-6 w-6" /><h4 className="text-xl font-black italic uppercase tracking-tighter">Data Storage</h4></div>
                  <div className="space-y-4"><div className="space-y-2"><div className="flex justify-between text-[10px] font-black uppercase"><span>Cluster Load</span><span>84%</span></div><Progress value={84} className="h-1.5" /></div><div className="space-y-2"><div className="flex justify-between text-[10px] font-black uppercase"><span>Vibe Cache</span><span>1.2 TB</span></div><Progress value={62} className="h-1.5" /></div></div>
                </Card>
                <Card className="bg-card/40 border-border rounded-[2rem] p-8 space-y-6 shadow-xl">
                  <div className="flex items-center gap-3 text-amber-500"><TrendingUp className="h-6 w-6" /><h4 className="text-xl font-black italic uppercase tracking-tighter">Revenue Node</h4></div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline"><span className="text-[10px] font-black uppercase text-muted-foreground">Monthly Ad Revenue</span><p className="text-2xl font-black italic text-foreground">${adStats.revenue.toFixed(2)}</p></div>
                    <div className="flex justify-between items-baseline"><span className="text-[10px] font-black uppercase text-muted-foreground">Handshakes</span><p className="text-2xl font-black italic text-primary">{adStats.handshakes}</p></div>
                  </div>
                </Card>
                <Card className="bg-card/40 border-border rounded-[2rem] p-8 space-y-6 shadow-xl flex flex-col justify-center items-center text-center">
                  <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 animate-pulse"><Zap className="h-8 w-8" /></div>
                  <div className="space-y-1"><h4 className="text-xl font-black italic uppercase tracking-tighter text-green-500">SYSTEM OPTIMAL</h4><p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Global Handshake Active</p></div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-1 px-2"><h3 className="text-3xl font-black italic uppercase tracking-tighter">Audit Logs</h3><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Administrative Identity Logging</p></div>
              <Card className="bg-card/40 border-border rounded-[2rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead><tr className="border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-secondary/30"><th className="px-8 py-6">TIMESTAMP</th><th className="px-8 py-6">ADMIN</th><th className="px-8 py-6">ACTION</th><th className="px-8 py-6">DETAILS</th></tr></thead>
                    <tbody className="divide-y divide-border">
                      {auditLogs.map((log) => (
                        <tr key={log.$id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-8 py-6 font-mono text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="px-8 py-6"><Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black shadow-sm">{log.admin}</Badge></td>
                          <td className="px-8 py-6 font-black italic uppercase tracking-widest text-xs">{log.action}</td>
                          <td className="px-8 py-6 text-xs text-muted-foreground font-medium">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[200] bg-card/80 backdrop-blur-2xl border-t border-border px-4 py-3 flex items-center justify-between safe-area-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        {mobilePrimaryTabs.map((tab) => {
          const Icon = TABS_DATA[tab].icon;
          const isActive = activeTab === tab;
          return (
            <button key={tab} onClick={() => { triggerHaptic(10); setActiveTab(tab); }} className={cn("flex flex-col items-center gap-1 transition-all", isActive ? "text-primary" : "text-muted-foreground")}>
              <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-all", isActive ? "bg-primary/10 scale-110 shadow-lg shadow-primary/5" : "hover:bg-secondary/50")}>
                <Icon className={cn("h-5 w-5", isActive && "animate-pulse")} />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">{TABS_DATA[tab].label}</span>
            </button>
          );
        })}
        <Sheet open={isMobileDrawerOpen} onOpenChange={setIsMobileDrawerOpen}>
          <SheetTrigger asChild>
            <button onClick={() => triggerHaptic(5)} className="flex flex-col items-center gap-1 text-muted-foreground">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center hover:bg-secondary/50">
                <LayoutGrid className="h-5 w-5" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[2.5rem] bg-card/95 backdrop-blur-3xl border-primary/10 p-0 h-[60vh] overflow-hidden flex flex-col">
            <div className="mx-auto w-12 h-1.5 bg-primary/20 rounded-full mt-4 mb-2 shrink-0" />
            <SheetHeader className="px-6 py-4 border-b border-border shrink-0">
              <SheetTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" /> Command Hub
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="flex-1 px-6 pt-6">
              <div className="grid grid-cols-2 gap-3 pb-12">
                {mobileRemainingTabs.map((tab) => {
                  const Icon = TABS_DATA[tab].icon;
                  const isActive = activeTab === tab;
                  return (
                    <button key={tab} onClick={() => { triggerHaptic(15); setActiveTab(tab); setIsMobileDrawerOpen(false); }} className={cn("flex items-center gap-4 p-4 rounded-2xl transition-all border", isActive ? "bg-primary text-white border-primary shadow-xl shadow-primary/20" : "bg-secondary/30 border-transparent hover:border-primary/20")}>
                      <Icon className={cn("h-5 w-5", isActive && "animate-pulse")} />
                      <span className="text-xs font-black uppercase tracking-widest">{TABS_DATA[tab].label}</span>
                    </button>
                  );
                })}
                <Link href="/" className="col-span-2">
                  <Button variant="outline" className="w-full h-14 rounded-2xl border-destructive/20 text-destructive font-black uppercase italic text-[10px] tracking-[0.2em] gap-3">
                    <Rocket className="h-4 w-4" /> Exit Command Core
                  </Button>
                </Link>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
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
