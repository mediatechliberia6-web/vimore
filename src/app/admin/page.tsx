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
  UserMinus,
  KeyRound
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
  const { withdrawalHistory, paymentRequests, processWithdrawal, approvePaymentRequest, rejectPaymentRequest, triggerHaptic, posts, gatewaySettings, updateGatewaySettings, settings, updateSettings, auditLogs, addAuditLog, adStats, intelligenceMetrics, updateIntelligence, connections, disputes, resolveDispute, campaigns, addCampaign, deleteCampaign, toggleCampaignStatus, currentUser, staff, promoteUser, demoteUser } = usePosts();
  const { addSignal } = useNotifications();
  const { downloadedSongIds } = useMusic();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  // RBAC State
  const userRole = currentUser.role || 'USER';
  const isSuper = userRole === 'SUPER';
  const isFinancial = userRole === 'FINANCIAL';
  const isModerator = userRole === 'MODERATOR';

  const [activeTab, setActiveTab] = useState<AdminTab>("pulse");
  const [economySubTab, setEconomySubTab] = useState<EconomySubTab>("outbound");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [isAnalyzingVibe, setIsAnalyzingVibe] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Governance Hub States
  const [govSearch, setGovSearch] = useState("");
  const [isPromoting, setIsPromoting] = useState(false);

  // Campaign States
  const [campType, setCampType] = useState<'photo' | 'video' | 'link'>('photo');
  const [campContent, setCampContent] = useState("");
  const [campMediaUrl, setCampMediaUrl] = useState("");
  const [campActionUrl, setCampActionUrl] = useState("");
  const [campActionLabel, setCampActionLabel] = useState("LAUNCH PULSE");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gateway form state
  const [gatewayForm, setGatewayForm] = useState(gatewaySettings);

  const pendingWithdrawals = useMemo(() => 
    withdrawalHistory.filter(w => w.status === 'PENDING'), 
    [withdrawalHistory]
  );

  const pendingPayments = useMemo(() => 
    paymentRequests.filter(p => p.status === 'PENDING'), 
    [paymentRequests]
  );

  // RBAC Tab Filtering
  const availableTabs = useMemo(() => {
    const tabs: AdminTab[] = ["pulse", "logs"];
    
    if (isSuper) return ["pulse", "economy", "intelligence", "velocity", "identity", "safety", "governance", "gateway", "campaigns", "infrastructure", "resolution", "logs"] as AdminTab[];
    
    if (isFinancial) {
      tabs.push("economy", "gateway", "infrastructure");
    }
    
    if (isModerator) {
      tabs.push("intelligence", "velocity", "identity", "safety", "campaigns", "resolution");
    }
    
    return tabs;
  }, [isSuper, isFinancial, isModerator]);

  const stats = useMemo(() => ({
    totalNodes: 12450,
    totalSignatures: posts.length + 8540,
    totalEnergy: "L$ 4.2M",
    activeClusters: 142
  }), [posts]);

  // Governance Logic
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

  const handleAction = (id: string, status: 'APPROVED' | 'REJECTED', type: 'withdrawal' | 'payment' | 'verification' | 'report' | 'bot' | 'dispute') => {
    triggerHaptic(status === 'APPROVED' ? 50 : 100);
    
    if (type === 'withdrawal') {
      processWithdrawal(id, status);
      toast({ title: status === 'APPROVED' ? "Node Materialized" : "Handshake Denied", description: `Transaction ${id} processed.` });
    } else if (type === 'payment') {
      if (status === 'APPROVED') approvePaymentRequest(id);
      else rejectPaymentRequest(id);
      toast({ title: status === 'APPROVED' ? "Pulse Authorized" : "Handshake Purged", description: `Payment request ${id} ${status.toLowerCase()}.` });
    } else if (type === 'dispute') {
      resolveDispute(id, status === 'APPROVED' ? 'RESTORE' : 'SEVER');
      toast({ title: "Resolution Synced", description: `Dispute ${id} resolved via ${status.toLowerCase()} pulse.` });
    } else {
      addAuditLog("SAFETY_ACTION", `Safety node action on ${id} via ${status.toLowerCase()} handshake.`);
      toast({ title: "Safety Action", description: `Safety node action on ${id} processed.` });
    }
  };

  const handleSaveGateway = () => {
    triggerHaptic(50);
    updateGatewaySettings(gatewayForm);
    addAuditLog("GATEWAY_SYNC", "Updated platform financial nodes (Orange/MTN)");
    toast({ title: "Gateway Synchronized", description: "Financial nodes updated platform-wide." });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden selection:bg-primary/30 transition-colors duration-500">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Admin Sidebar */}
      <aside className={cn(
        "h-screen bg-card/40 backdrop-blur-3xl border-r border-border transition-all duration-500 hidden md:flex flex-col shrink-0 z-[100]",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-4 border-b border-border">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col animate-in fade-in duration-500">
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

            const icons = { pulse: Activity, economy: Coins, intelligence: BrainCircuit, velocity: TrendingUp, identity: UserPlus, safety: ShieldAlert, governance: Sliders, gateway: Settings, campaigns: Megaphone, infrastructure: Database, resolution: Hammer, logs: FileText };
            const labels = { pulse: "Global Pulse", economy: "Economy Auditor", intelligence: "Intelligence Node", velocity: "Velocity Hub", identity: "Identity Forge", safety: "Safety Node", governance: t('admin_governance'), gateway: "Gateway Logic", campaigns: "Campaign Hub", infrastructure: "Infrastructure", resolution: "Resolution Hub", logs: "Audit Logs" };
            const Icon = icons[tab];
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => { triggerHaptic(5); setActiveTab(tab); }}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative overflow-hidden",
                  isActive ? "bg-primary text-white shadow-xl shadow-primary/10" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive && "animate-pulse")} />
                {isSidebarOpen && <span className="text-sm font-black italic uppercase tracking-widest">{labels[tab]}</span>}
                {isActive && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start gap-4 h-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/50">
              <Rocket className="h-5 w-5" />
              {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Back to Feed</span>}
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Command Workspace */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto scrollbar-hide">
        <header className="h-20 px-6 sm:px-8 flex items-center justify-between bg-card/20 border-b border-border backdrop-blur-md sticky top-0 z-50 transition-colors">
          <div className="flex items-center gap-4 sm:gap-6">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-muted-foreground hover:text-foreground hidden md:flex">
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex flex-col">
              <h2 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-muted-foreground">Spatial Node</h2>
              <span className="text-sm sm:text-lg font-black italic uppercase tracking-tighter text-foreground truncate max-w-[150px] sm:max-w-none">Cluster: ViMore-Main-Alpha</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-secondary/50 rounded-full px-4 py-1.5 border border-border">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">Handshake: {userRole} Node</span>
            </div>
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {!availableTabs.includes(activeTab) ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="relative">
              <div className="absolute -inset-8 bg-destructive/10 blur-3xl rounded-full" />
              <ShieldAlert className="h-24 w-24 text-destructive relative z-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">{t('admin_access_denied')}</h2>
              <p className="text-muted-foreground font-medium uppercase tracking-widest">{t('admin_access_denied_desc')}</p>
            </div>
            <Button className="rounded-2xl h-14 px-10 bg-primary text-white font-black italic uppercase" onClick={() => setActiveTab("pulse")}>RETURN TO PULSE</Button>
          </div>
        ) : (
          <div className="p-4 sm:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
            
            {activeTab === 'pulse' && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { label: t('admin_active_nodes'), value: stats.totalNodes.toLocaleString(), icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
                    { label: t('admin_signatures'), value: stats.totalSignatures.toLocaleString(), icon: Rocket, color: "text-primary", bg: "bg-primary/10" },
                    { label: t('admin_pulses'), value: "842k", icon: BarChart3, color: "text-accent", bg: "bg-accent/10" },
                    { label: t('admin_energy'), value: stats.totalEnergy, icon: Coins, color: "text-amber-400", bg: "bg-amber-400/10" }
                  ].map((m) => (
                    <Card key={m.label} className="bg-card/40 border-border rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all shadow-sm">
                      <CardContent className="p-6 flex items-center gap-5">
                        <div className={cn("h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", m.bg, m.color)}>
                          <m.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest">{m.label}</span>
                          <span className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-foreground">{m.value}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card className="bg-card/40 border-border rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter">{t('admin_velocity')}</h3>
                        <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Node Concurrency (24H)</p>
                      </div>
                      <div className="h-9 w-9 sm:h-10 sm:w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><TrendingUp className="h-5 w-5" /></div>
                    </div>
                    <div className="h-[250px] sm:h-[300px] w-full">
                      <ChartContainer config={{ active: { label: "Nodes", color: "hsl(var(--primary))" } }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={MOCK_DAILY_PULSE}>
                            <defs>
                              <linearGradient id="adminPulse" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="time" hide />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area type="monotone" dataKey="active" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#adminPulse)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>
                  </Card>

                  <Card className="bg-card/40 border-border rounded-[2.5rem] p-8 space-y-6 overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">{t('admin_clusters')}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Handshake Activity Map</p>
                      </div>
                      <Badge className="bg-green-500/20 text-green-500 border-none font-black h-5 px-3 uppercase tracking-tighter">LIVE FEED</Badge>
                    </div>
                    <div className="h-[250px] sm:h-[300px] w-full flex items-center justify-center bg-background/40 rounded-[2rem] border border-dashed border-border relative">
                      <div className="grid grid-cols-8 gap-4 opacity-40">
                        {[...Array(24)].map((_, i) => (
                          <div key={i} className={cn(
                            "h-1.5 w-1.5 rounded-full transition-all duration-1000",
                            Math.random() > 0.7 ? "bg-primary animate-ping" : "bg-muted"
                          )} />
                        ))}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'governance' && isSuper && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-700">
                <div className="space-y-1 px-2">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">{t('admin_gov_title')}</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('admin_gov_desc')}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Promote User Card */}
                  <Card className="lg:col-span-1 bg-card/40 border-border rounded-[2.5rem] p-8 space-y-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5"><ShieldCheck className="h-24 w-24" /></div>
                    <div className="space-y-2 relative z-10">
                      <h4 className="text-xl font-black italic uppercase tracking-tighter">{t('admin_gov_promote')}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Materialize authority nodes</p>
                    </div>
                    <div className="space-y-4 relative z-10">
                      <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input 
                          placeholder="Query identity..." 
                          className="pl-10 h-12 bg-secondary/30 border-none rounded-2xl"
                          value={govSearch}
                          onChange={(e) => setGovSearch(e.target.value)}
                        />
                      </div>
                      
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-2 pr-4">
                          {filteredUsersForGov.map((user) => (
                            <div key={user.username} className="p-3 bg-secondary/20 rounded-2xl border border-transparent hover:border-primary/20 transition-all group">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9"><AvatarImage src={user.avatar} /></Avatar>
                                  <div className="text-left">
                                    <p className="font-bold text-xs">{user.name}</p>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase">@{user.username}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <Button 
                                  size="sm" 
                                  className="h-8 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white text-[8px] font-black uppercase"
                                  onClick={() => handlePromote(user.username, 'FINANCIAL')}
                                >
                                  FINANCIAL
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="h-8 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white text-[8px] font-black uppercase"
                                  onClick={() => handlePromote(user.username, 'MODERATOR')}
                                >
                                  MODERATOR
                                </Button>
                              </div>
                            </div>
                          ))}
                          {govSearch && filteredUsersForGov.length === 0 && (
                            <div className="py-12 text-center opacity-40 italic text-xs uppercase">No nodes found</div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </Card>

                  {/* Staff List */}
                  <Card className="lg:col-span-2 bg-card/40 border-border rounded-[2.5rem] overflow-hidden shadow-xl">
                    <div className="p-8 border-b border-border flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="text-xl font-black italic uppercase tracking-tighter">{t('admin_gov_staff')}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Active administrative cluster</p>
                      </div>
                      <Badge className="bg-primary text-white border-none font-black h-5 px-3 uppercase tracking-tighter">{staff.length} NODES</Badge>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/20">
                            <th className="px-8 py-4">IDENTITY</th>
                            <th className="px-8 py-4">ROLE SIGNATURE</th>
                            <th className="px-8 py-4 text-right">HANDSHAKE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {staff.map((s) => {
                            const user = connections.find(c => c.username === s.username) || { name: s.username, avatar: "" };
                            const isMe = s.username === currentUser.username;
                            
                            return (
                              <tr key={s.username} className="hover:bg-secondary/10 transition-colors">
                                <td className="px-8 py-5">
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border border-primary/10">
                                      <AvatarImage src={(user as any).avatar || `https://picsum.photos/seed/${s.username}/100/100`} />
                                    </Avatar>
                                    <div className="flex flex-col">
                                      <span className="font-bold text-sm">{(user as any).name}</span>
                                      <span className="text-[10px] font-black text-muted-foreground uppercase">@{s.username}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-5">
                                  <Badge className={cn(
                                    "font-black text-[8px] uppercase tracking-widest px-3 h-5",
                                    s.role === 'SUPER' ? "bg-primary text-white" : 
                                    s.role === 'FINANCIAL' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                                  )}>
                                    {s.role === 'SUPER' ? t('admin_role_super') : s.role === 'FINANCIAL' ? t('admin_role_financial') : t('admin_role_moderator')}
                                  </Badge>
                                </td>
                                <td className="px-8 py-5 text-right">
                                  {isMe ? (
                                    <Badge variant="outline" className="text-[8px] font-black uppercase opacity-40">PRIMARY</Badge>
                                  ) : (
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl"
                                      onClick={() => handleDemote(s.username)}
                                    >
                                      <UserMinus className="h-4 w-4" />
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="space-y-1 px-2"><h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">{t('admin_audit')}</h3><p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Administrative Identity Logging</p></div>
                <Card className="bg-card/40 border-border rounded-[2rem] overflow-hidden shadow-sm"><div className="overflow-x-auto"><table className="w-full text-left min-w-[800px]"><thead><tr className="border-b border-border text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-secondary/30"><th className="px-8 py-6">TIMESTAMP</th><th className="px-8 py-6">ADMIN</th><th className="px-8 py-6">ACTION</th><th className="px-8 py-6">DETAILS</th></tr></thead><tbody className="divide-y divide-border">
                  {auditLogs.length > 0 ? auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-secondary/20 transition-colors"><td className="px-8 py-6 font-mono text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</td><td className="px-8 py-6"><Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black shadow-sm">{log.admin}</Badge></td><td className="px-8 py-6 font-black italic uppercase tracking-widest text-xs">{log.action}</td><td className="px-8 py-6 text-xs text-muted-foreground font-medium">{log.details}</td></tr>
                  )) : (<tr><td colSpan={4} className="px-8 py-32 text-center opacity-40"><Activity className="h-12 w-12 mx-auto mb-4" /><p className="font-black uppercase tracking-widest text-xs">Logs silent — No pulses recorded</p></td></tr>)}
                </tbody></table></div></Card>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Admin Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[200] px-4 pb-6 flex justify-center pointer-events-none">
        <nav className="flex items-center gap-2 bg-background/80 backdrop-blur-2xl border border-border rounded-full px-6 py-2.5 shadow-2xl pointer-events-auto overflow-x-auto scrollbar-hide max-w-full">
          {(["pulse", "economy", "intelligence", "velocity", "identity", "safety", "governance", "gateway", "campaigns", "infrastructure", "resolution", "logs"] as AdminTab[]).map((tab) => {
            if (!availableTabs.includes(tab)) return null;
            const icons = { pulse: Activity, economy: Coins, intelligence: BrainCircuit, velocity: TrendingUp, identity: UserPlus, safety: ShieldAlert, governance: Sliders, gateway: Settings, campaigns: Megaphone, infrastructure: Database, resolution: Hammer, logs: FileText };
            const Icon = icons[tab];
            const isActive = activeTab === tab;
            return <button key={tab} onClick={() => { triggerHaptic(5); setActiveTab(tab); }} className={cn("p-3 rounded-2xl transition-all shrink-0", isActive ? "bg-primary text-white scale-110 shadow-lg" : "text-muted-foreground hover:text-foreground")}><Icon className="h-5 w-5" /></button>;
          })}
        </nav>
      </div>

      {/* Receipt Lightbox */}
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
