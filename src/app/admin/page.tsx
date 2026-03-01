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
  Plus
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

const MOCK_CREATOR_VELOCITY = [
  { name: "Neon Architect", username: "neon_arch", followers: 142000, growth: "+12%", status: "ELITE" },
  { name: "Sarah Chen", username: "schen_dev", followers: 4200, growth: "+45%", status: "RISING" },
  { name: "Alex Rivera", username: "arivera", followers: 12200, growth: "+8%", status: "MONETIZED" },
  { name: "Marcus Stone", username: "mstone", followers: 25100, growth: "+15%", status: "ELITE" },
];

const MOCK_SONIC_TRENDS = [
  { title: "Essence", artist: "Wizkid", syncs: "12.4k", velocity: "+24%", rank: 1 },
  { title: "Last Last", artist: "Burna Boy", syncs: "8.2k", velocity: "+12%", rank: 2 },
  { title: "Unavailable", artist: "Davido", syncs: "15.6k", velocity: "+45%", rank: 3 },
];

const MOCK_VERIFICATION_REQUESTS = [
  { id: "V-8421", name: "Alex Rivera", username: "arivera", currency: "DIAMOND", cost: 15, time: "12m ago", avatar: "https://picsum.photos/seed/1/100/100" },
  { id: "V-8422", name: "Sarah Chen", username: "schen_dev", currency: "STAR", cost: 20000, time: "45m ago", avatar: "https://picsum.photos/seed/2/100/100" },
  { id: "V-8423", name: "Paul Node", username: "paul", currency: "DIAMOND", cost: 6, time: "1h ago", avatar: "https://picsum.photos/seed/paul/100/100" },
];

const MOCK_REPORTS = [
  { id: "R-901", reporter: "jmoore", target: "spam_node", reason: "Commercial Spam", content: "Check out this link for cheap diamonds...", risk: "HIGH", time: "5m ago" },
  { id: "R-902", reporter: "arivera", target: "troll_42", reason: "Harassment", content: "You pixels are trash, give up designing.", risk: "MEDIUM", time: "18m ago" },
];

export default function AdminDashboard() {
  const { withdrawalHistory, paymentRequests, processWithdrawal, approvePaymentRequest, rejectPaymentRequest, triggerHaptic, posts, gatewaySettings, updateGatewaySettings, settings, updateSettings, auditLogs, addAuditLog, adStats, intelligenceMetrics, updateIntelligence, connections, disputes, resolveDispute, campaigns, addCampaign, deleteCampaign, toggleCampaignStatus } = usePosts();
  const { addSignal } = useNotifications();
  const { downloadedSongIds } = useMusic();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>("pulse");
  const [economySubTab, setEconomySubTab] = useState<EconomySubTab>("outbound");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [isAnalyzingVibe, setIsAnalyzingVibe] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Campaign States
  const [campType, setCampType] = useState<'photo' | 'video' | 'link'>('photo');
  const [campContent, setCampContent] = useState("");
  const [campMediaUrl, setCampMediaUrl] = useState("");
  const [campActionUrl, setCampActionUrl] = useState("");
  const [campActionLabel, setCampActionLabel] = useState("LAUNCH PULSE");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Governance States
  const [broadcastText, setBroadcastText] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

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

  const stats = useMemo(() => ({
    totalNodes: 12450,
    totalSignatures: posts.length + 8540,
    totalEnergy: "L$ 4.2M",
    activeClusters: 142
  }), [posts]);

  // Infrastructure Logic
  const storageData = useMemo(() => {
    const sonicSize = downloadedSongIds.size * 10.5;
    const vibeSize = posts.filter(p => p.videoUrl).length * 15.2;
    const metaSize = (posts.length * 0.5) + (connections.length * 0.2) + 1.2;
    return [
      { label: "Sonic Notes", size: `${sonicSize.toFixed(1)}MB`, value: Math.min((sonicSize / 2000) * 100, 100), icon: Music2, color: "bg-primary" },
      { label: "Vibe Cache", size: `${vibeSize.toFixed(1)}MB`, value: Math.min((vibeSize / 2500) * 100, 100), icon: Clapperboard, color: "bg-accent" },
      { label: "Core Meta", size: `${metaSize.toFixed(1)}MB`, value: Math.min((metaSize / 500) * 100, 100), icon: Database, color: "bg-amber-500" },
    ];
  }, [downloadedSongIds, posts, connections]);

  const totalUsedMB = useMemo(() => storageData.reduce((acc, curr) => acc + parseFloat(curr.size), 0), [storageData]);

  const handleAnalyzeVibe = async () => {
    setIsAnalyzingVibe(true);
    triggerHaptic(25);
    try {
      const messages = posts.slice(0, 10).map(p => p.content);
      const res = await aiAnalyzeGlobalSentiment({ messages });
      updateIntelligence({
        sentimentScore: res.score,
        sentimentVibe: res.vibe,
        sentimentSummary: res.summary
      });
      toast({ title: "Intelligence Synced", description: "Global vibe analysis complete." });
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error", description: "Sentiment pulse failed." });
    } finally {
      setIsAnalyzingVibe(false);
    }
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
    } else if (type === 'verification') {
      addAuditLog("VERIFICATION_AUDIT", `${status} verification for request ${id}`);
      toast({ title: "Identity Updated", description: `Verification pulse ${status.toLowerCase()} for request ${id}.` });
    } else if (type === 'bot') {
      addAuditLog("BOT_PURGE", `Severed node connection for ${id}`);
      toast({ title: "Node Severed", description: `Suspicious node ${id} removed from network.` });
    } else if (type === 'dispute') {
      resolveDispute(id, status === 'APPROVED' ? 'RESTORE' : 'SEVER');
      toast({ title: "Resolution Synced", description: `Dispute ${id} resolved via ${status.toLowerCase()} pulse.` });
    } else {
      addAuditLog("SAFETY_ACTION", `Report ${id} closed via ${status.toLowerCase()} handshake.`);
      toast({ title: "Safety Action", description: `Report ${id} closed via ${status.toLowerCase()} handshake.` });
    }
  };

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    triggerHaptic(50);
    
    setTimeout(() => {
      const data = {
        meta: { title: "ViMore Velocity Report", timestamp: new Date().toISOString() },
        revenue: { totalInbound: paymentRequests.length * 15, totalOutbound: withdrawalHistory.length * 50 },
        nodes: { active: stats.totalNodes, verified: stats.totalSignatures }
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vimore_velocity_report_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setIsGeneratingReport(false);
      toast({ title: "Report Materialized", description: "High-velocity data node saved to hardware." });
    }, 2000);
  };

  const handleSaveGateway = () => {
    triggerHaptic(50);
    updateGatewaySettings(gatewayForm);
    addAuditLog("GATEWAY_SYNC", "Updated platform financial nodes (Orange/MTN)");
    toast({ title: "Gateway Synchronized", description: "Financial nodes updated platform-wide." });
  };

  const handleLaunchCampaign = () => {
    if (!campContent.trim() || !campActionUrl.trim()) return;
    addCampaign({
      type: campType,
      content: campContent,
      mediaUrl: campMediaUrl || undefined,
      actionUrl: campActionUrl,
      actionLabel: campActionLabel,
      isActive: true
    });
    toast({ title: "Campaign Materialized", description: "Official node launched to the stream." });
    setCampContent("");
    setCampMediaUrl("");
    setCampActionUrl("");
    setCampActionLabel("LAUNCH PULSE");
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic(10);
      const reader = new FileReader();
      reader.onloadend = () => setCampMediaUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBroadcast = () => {
    if (!broadcastText.trim()) return;
    setIsBroadcasting(true);
    triggerHaptic(100);
    
    setTimeout(() => {
      addSignal({
        type: 'SYSTEM',
        title: 'Platform Pulse',
        content: `**SYSTEM BROADCAST:** ${broadcastText}`,
      });
      addAuditLog("GLOBAL_BROADCAST", `Pulse sent: ${broadcastText.slice(0, 30)}...`);
      setBroadcastText("");
      setIsBroadcasting(false);
      toast({ title: "Broadcast Launched", description: "All nodes have received the platform pulse." });
    }, 1500);
  };

  const handleToggleSwitch = (key: keyof typeof settings, value: boolean) => {
    triggerHaptic(10);
    updateSettings({ [key]: value });
    addAuditLog("FEATURE_TOGGLE", `Switched ${key} to ${value ? 'ACTIVE' : 'STASIS'}`);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-foreground flex overflow-hidden selection:bg-primary/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/5 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Admin Sidebar */}
      <aside className={cn(
        "h-screen bg-black/40 backdrop-blur-3xl border-r border-white/5 transition-all duration-500 hidden md:flex flex-col shrink-0 z-[100]",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        <div className="p-6 flex items-center gap-4 border-b border-white/5">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col animate-in fade-in duration-500">
              <h1 className="font-black italic uppercase tracking-tighter text-lg leading-none">Command Core</h1>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Platform Auth v1.5</span>
            </div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
          {(["pulse", "economy", "intelligence", "velocity", "identity", "safety", "governance", "gateway", "campaigns", "infrastructure", "resolution", "logs"] as AdminTab[]).map((tab) => {
            const icons = { pulse: Activity, economy: Coins, intelligence: BrainCircuit, velocity: TrendingUp, identity: UserPlus, safety: ShieldAlert, governance: Sliders, gateway: Settings, campaigns: Megaphone, infrastructure: Database, resolution: Hammer, logs: FileText };
            const labels = { pulse: "Global Pulse", economy: "Economy Auditor", intelligence: "Intelligence Node", velocity: "Velocity Hub", identity: "Identity Forge", safety: "Safety Node", governance: "Governance", gateway: "Gateway Logic", campaigns: "Campaign Hub", infrastructure: "Infrastructure", resolution: "Resolution Hub", logs: "Audit Logs" };
            const Icon = icons[tab];
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => { triggerHaptic(5); setActiveTab(tab); }}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative overflow-hidden",
                  isActive ? "bg-primary text-white shadow-xl shadow-primary/10" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110", isActive && "animate-pulse")} />
                {isSidebarOpen && <span className="text-sm font-black italic uppercase tracking-widest">{labels[tab]}</span>}
                {isActive && <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start gap-4 h-12 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5">
              <Rocket className="h-5 w-5" />
              {isSidebarOpen && <span className="font-bold text-xs uppercase tracking-widest">Back to Feed</span>}
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Command Workspace */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto scrollbar-hide">
        <header className="h-20 px-6 sm:px-8 flex items-center justify-between bg-black/20 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-4 sm:gap-6">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-muted-foreground hover:text-white hidden md:flex">
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex flex-col">
              <h2 className="text-[10px] sm:text-sm font-black uppercase tracking-widest text-muted-foreground">Spatial Node</h2>
              <span className="text-sm sm:text-lg font-black italic uppercase tracking-tighter text-white truncate max-w-[150px] sm:max-w-none">Cluster: ViMore-Main-Alpha</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-full px-4 py-1.5 border border-white/10">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Groq AI Handshake: Active</span>
            </div>
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src="https://picsum.photos/seed/admin/100/100" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="p-4 sm:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
          
          {activeTab === 'pulse' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                  { label: "Active Nodes", value: stats.totalNodes.toLocaleString(), icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
                  { label: "Digital Signatures", value: stats.totalSignatures.toLocaleString(), icon: Rocket, color: "text-primary", bg: "bg-primary/10" },
                  { label: "Sonic Pulses", value: "842k", icon: BarChart3, color: "text-accent", bg: "bg-accent/10" },
                  { label: "Network Energy", value: stats.totalEnergy, icon: Coins, color: "text-amber-400", bg: "bg-amber-400/10" }
                ].map((m) => (
                  <Card key={m.label} className="bg-white/5 border-white/10 rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all">
                    <CardContent className="p-6 flex items-center gap-5">
                      <div className={cn("h-12 w-12 sm:h-14 sm:w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", m.bg, m.color)}>
                        <m.icon className="h-6 w-6 sm:h-7 sm:w-7" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest">{m.label}</span>
                        <span className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-white">{m.value}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white/5 border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter">System Velocity</h3>
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

                <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 space-y-6 overflow-hidden relative group">
                  <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <Globe className="absolute -right-20 -bottom-20 h-[400px] w-[400px] text-primary animate-[spin_20s_linear_infinite]" />
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter">Spatial Clusters</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Handshake Activity Map</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500 border-none font-black h-5 px-3 uppercase tracking-tighter">LIVE FEED</Badge>
                  </div>
                  <div className="h-[250px] sm:h-[300px] w-full flex items-center justify-center bg-black/20 rounded-[2rem] border border-dashed border-white/10 relative">
                    <div className="grid grid-cols-8 gap-4 opacity-40">
                      {[...Array(24)].map((_, i) => (
                        <div key={i} className={cn(
                          "h-1.5 w-1.5 rounded-full transition-all duration-1000",
                          Math.random() > 0.7 ? "bg-primary animate-ping" : "bg-white/10"
                        )} />
                      ))}
                    </div>
                    <div className="absolute bottom-6 left-6 flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white/40 uppercase">Active Cluster</span>
                        <span className="text-xs font-bold text-white italic">Lagos-Node-01</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-white/40 uppercase">Sync Delay</span>
                        <span className="text-xs font-bold text-green-500 italic">42ms</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'intelligence' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-6">
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">Intelligence Node</h3>
                  <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">AI Analytics & Security Integrity</p>
                </div>
                <Button 
                  className="rounded-xl h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-2"
                  onClick={handleAnalyzeVibe}
                  disabled={isAnalyzingVibe}
                >
                  {isAnalyzingVibe ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                  Refresh Collective Vibe
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-2">
                <Card className="bg-white/5 border-white/10 rounded-[2rem] p-6 space-y-6 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                      </div>
                      <h4 className="font-black italic uppercase tracking-widest text-sm">Community Vibe Analytics</h4>
                    </div>
                    <Badge className={cn(
                      "font-black uppercase tracking-widest px-3 h-6 border-none",
                      intelligenceMetrics.sentimentVibe === 'POSITIVE' ? "bg-green-500/20 text-green-500" :
                      intelligenceMetrics.sentimentVibe === 'NEGATIVE' ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"
                    )}>
                      {intelligenceMetrics.sentimentVibe} PULSE
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                      <div className="flex justify-between items-baseline">
                        <span className="text-4xl font-black italic text-white">{intelligenceMetrics.sentimentScore}%</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Alignment Score</span>
                      </div>
                      <Progress value={intelligenceMetrics.sentimentScore} className="h-3 bg-white/5" />
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
                        "{intelligenceMetrics.sentimentSummary}"
                      </p>
                    </div>
                    <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-4">
                      <h5 className="text-[10px] font-black uppercase text-primary tracking-widest">Sponsored Conversion Pulse</h5>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-white/40 uppercase">Materialized</span>
                          <p className="text-lg font-black text-white">{adStats.materializations.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-white/40 uppercase">Handshakes</span>
                          <p className="text-lg font-black text-primary">{adStats.handshakes.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Revenue Hub: ${adStats.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-white/5 border-white/10 rounded-[2rem] p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <h4 className="font-black italic uppercase tracking-widest text-sm">Security Audit</h4>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { username: "spam_node_42", reason: "Rapid Post Pulse", risk: "CRITICAL" },
                      { username: "fake_creator", reason: "Zero Interaction Pattern", risk: "MEDIUM" }
                    ].map(bot => (
                      <div key={bot.username} className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-3 group hover:border-red-500/30 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{bot.risk} RISK</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">@{bot.username}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">{bot.reason}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          className="w-full h-8 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest"
                          onClick={() => handleAction(bot.username, 'REJECTED', 'bot')}
                        >
                          Sever Node Connection
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'velocity' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-6">
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">Velocity Hub</h3>
                  <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Creator Growth & Content Synchronicity</p>
                </div>
                <div className="flex items-center gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={cn("h-4 w-4", settings.isAiVerificationActive ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-[10px] font-black uppercase text-white/60">AI Verification Auto-Pilot</span>
                  </div>
                  <Switch 
                    checked={settings.isAiVerificationActive} 
                    onCheckedChange={(val) => handleToggleSwitch('isAiVerificationActive', val)}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2">
                <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                        <Trophy className="h-5 w-5" />
                      </div>
                      <h4 className="text-xl font-black italic uppercase tracking-tighter">Rising Stars</h4>
                    </div>
                    <Badge className="bg-primary text-white border-none font-black h-5 px-3">TOP NODES</Badge>
                  </div>

                  <div className="space-y-4">
                    {MOCK_CREATOR_VELOCITY.map(creator => (
                      <div key={creator.username} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border border-white/10 shadow-lg">
                            <AvatarImage src={`https://picsum.photos/seed/${creator.username}/100/100`} />
                          </Avatar>
                          <div>
                            <p className="font-bold text-sm text-white">{creator.name}</p>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">@{creator.username}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-primary italic">{creator.growth}</p>
                          <Badge variant="outline" className="border-white/10 text-white/40 text-[8px] font-black uppercase px-2 h-4">{creator.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500">
                        <Music2 className="h-5 w-5" />
                      </div>
                      <h4 className="text-xl font-black italic uppercase tracking-tighter">Sonic Velocity</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">LIVE PULSE</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {MOCK_SONIC_TRENDS.map(song => (
                      <div key={song.title} className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5 hover:bg-white/5 transition-all">
                        <div className="h-10 w-10 bg-secondary/40 rounded-lg flex items-center justify-center font-black italic text-muted-foreground">{song.rank}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-white truncate">{song.title}</p>
                          <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{song.artist}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1 text-primary">
                            <Zap className="h-3 w-3 fill-current" />
                            <span className="text-xs font-black">{song.syncs}</span>
                          </div>
                          <span className="text-[9px] font-black text-green-500 uppercase">{song.velocity} VELOCITY</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-6">
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">Campaign Hub</h3>
                  <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Official Platform Materializations</p>
                </div>
                <div className="h-11 w-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Megaphone className="h-6 w-6" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
                <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 space-y-8 lg:col-span-2">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Plus className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">Create Pulse</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Materialize New Official Node</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Node Format</Label>
                      <div className="flex gap-2">
                        {(['photo', 'video', 'link'] as const).map(type => (
                          <button 
                            key={type}
                            onClick={() => { triggerHaptic(5); setCampType(type); if(type === 'link') setCampMediaUrl(""); }}
                            className={cn(
                              "flex-1 h-12 rounded-xl border font-black text-[10px] uppercase tracking-widest transition-all",
                              campType === type ? "bg-primary border-primary text-white" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                            )}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Vibe Content (Caption)</Label>
                      <Textarea 
                        placeholder="What's the official pulse? Use **bold** for impact..." 
                        className="min-h-[100px] bg-black/40 border-white/10 rounded-2xl text-sm font-medium focus-visible:ring-primary/20"
                        value={campContent}
                        onChange={(e) => setCampContent(e.target.value)}
                      />
                    </div>

                    {campType !== 'link' && (
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Media Visual</Label>
                        <div 
                          className="relative aspect-video rounded-2xl bg-black/40 border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer group hover:border-primary/40 transition-all overflow-hidden"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {campMediaUrl ? (
                            <>
                              {campType === 'video' ? (
                                <video src={campMediaUrl} className="w-full h-full object-cover" autoPlay muted loop />
                              ) : (
                                <Image src={campMediaUrl} alt="Campaign Preview" fill className="object-cover" />
                              )}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <RotateCcw className="h-8 w-8 text-white" />
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center gap-3 opacity-40 group-hover:opacity-100 transition-all">
                              {campType === 'video' ? <Video className="h-10 w-10" /> : <ImageIcon className="h-10 w-10" />}
                              <p className="text-[10px] font-black uppercase tracking-widest">Upload High-Velocity {campType}</p>
                            </div>
                          )}
                          <input type="file" ref={fileInputRef} className="hidden" accept={campType === 'video' ? "video/*" : "image/*"} onChange={handleMediaUpload} />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Action Handshake (URL)</Label>
                        <Input 
                          placeholder="https://..." 
                          className="h-14 bg-black/40 border-white/10 rounded-2xl text-sm font-bold text-primary"
                          value={campActionUrl}
                          onChange={(e) => setCampActionUrl(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Action Label (Button)</Label>
                        <Input 
                          placeholder="SYNC NOW, JOIN HUB..." 
                          className="h-14 bg-black/40 border-white/10 rounded-2xl text-sm font-bold"
                          value={campActionLabel}
                          onChange={(e) => setCampActionLabel(e.target.value)}
                        />
                      </div>
                    </div>

                    <Button 
                      className="w-full h-16 rounded-2xl bg-primary text-white font-black italic uppercase tracking-[0.2em] text-lg shadow-2xl shadow-primary/20 transition-all active:scale-95 gap-3"
                      onClick={handleLaunchCampaign}
                      disabled={!campContent.trim() || !campActionUrl.trim()}
                    >
                      <Zap className="h-6 w-6 fill-current" />
                      Materialize Campaign
                    </Button>
                  </div>
                </Card>

                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Active Nodes</h4>
                  {campaigns.length > 0 ? campaigns.map(camp => (
                    <Card key={camp.id} className="bg-white/5 border-white/10 rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all">
                      <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-2 h-4">{camp.type} Node</Badge>
                          <div className="flex items-center gap-2">
                            <Switch checked={camp.isActive} onCheckedChange={() => toggleCampaignStatus(camp.id)} className="scale-75 data-[state=checked]:bg-primary" />
                            <button onClick={() => deleteCampaign(camp.id)} className="text-white/20 hover:text-red-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                        <p className="text-xs font-bold line-clamp-2 italic text-white/80">"{camp.content}"</p>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black text-white/40 uppercase">Sync Pulses</span>
                            <span className="text-sm font-black text-primary">{camp.clicks}</span>
                          </div>
                          <Badge variant="outline" className="border-white/10 text-white/40 text-[8px] font-black uppercase">{new Date(camp.timestamp).toLocaleDateString()}</Badge>
                        </div>
                      </div>
                    </Card>
                  )) : (
                    <div className="py-20 text-center opacity-20 border-2 border-dashed border-white/10 rounded-[2rem]">
                      <Megaphone className="h-10 w-10 mx-auto mb-2" />
                      <p className="text-[10px] font-black uppercase">No campaigns active</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'infrastructure' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-6">
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">Infrastructure Node</h3>
                  <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Resource Monitoring & Velocity Reporting</p>
                </div>
                <Button 
                  className="rounded-xl h-12 px-6 bg-primary text-white font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20"
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Generate Velocity Report
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-2">
                {/* Database Pulse Meter */}
                <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 space-y-8 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                        <Database className="h-5 w-5" />
                      </div>
                      <h4 className="text-xl font-black italic uppercase tracking-tighter">Archival Pulse</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Total Utilization</span>
                      <span className="text-2xl font-black text-white italic">{totalUsedMB.toFixed(1)} MB</span>
                    </div>
                  </div>

                  <div className="space-y-10">
                    {storageData.map((node) => (
                      <div key={node.label} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <node.icon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs font-black uppercase tracking-widest text-white/80">{node.label}</span>
                          </div>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{node.size} / 2.5 GB</span>
                        </div>
                        <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className={cn("h-full transition-all duration-1000 ease-out", node.color)} style={{ width: `${node.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-white/5 flex gap-4">
                    <Button variant="ghost" className="rounded-xl h-10 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest gap-2">
                      <RotateCcw className="h-3.5 w-3.5" /> Recalibrate Nodes
                    </Button>
                    <Button variant="ghost" className="rounded-xl h-10 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest gap-2">
                      <Unplug className="h-3.5 w-3.5" /> Maintenance Mode
                    </Button>
                  </div>
                </Card>

                {/* Cluster Efficiency Node */}
                <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 space-y-6 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h4 className="text-lg font-black italic uppercase tracking-widest">Node Efficiency</h4>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Temporal Request Handshakes</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-5xl font-black italic text-primary">99.8%</span>
                      <Badge className="bg-green-500/20 text-green-500 border-none h-5 font-black uppercase px-3">OPTIMAL</Badge>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { label: "Sync Latency", value: "12ms" },
                        { label: "AI Inference", value: "0.4s" },
                        { label: "Asset Delivery", value: "1.2MB/s" }
                      ].map(m => (
                        <div key={m.label} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                          <span className="text-[9px] font-black text-white/40 uppercase">{m.label}</span>
                          <span className="text-[10px] font-bold text-white italic">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-widest">
                    Infrastructure Audit
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'resolution' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">Resolution Hub</h3>
                  <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Managing Severed Handshakes & Disputes</p>
                </div>
                <div className="h-11 w-11 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Hammer className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-4 px-2">
                {disputes.length > 0 ? disputes.map((dispute) => (
                  <Card key={dispute.id} className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all">
                    <div className="p-8 flex flex-col md:flex-row gap-8">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-4">
                          <Badge className={cn(
                            "font-black uppercase tracking-widest h-6 px-3 border-none",
                            dispute.status === 'OPEN' ? "bg-amber-500 text-white" : 
                            dispute.status === 'RESOLVED' ? "bg-green-500 text-white" : "bg-red-500 text-white"
                          )}>
                            {dispute.status} APPEAL
                          </Badge>
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">DISPUTE: {dispute.id}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Identity Node</span>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6 border border-white/10"><AvatarFallback>{dispute.username[0]}</AvatarFallback></Avatar>
                              <p className="font-bold text-sm text-white">@{dispute.username}</p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Original Pulse</span>
                            <p className="font-bold text-sm text-primary uppercase">{dispute.type} Handshake</p>
                          </div>
                        </div>

                        <div className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-2">
                          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2">
                            <History className="h-3 w-3" /> User Justification
                          </span>
                          <p className="text-sm font-medium text-white/80 leading-relaxed italic">"{dispute.reason}"</p>
                        </div>
                      </div>

                      {dispute.status === 'OPEN' && (
                        <div className="flex flex-col gap-3 justify-center">
                          <Button 
                            className="rounded-xl h-14 w-full md:w-48 bg-green-500 text-white font-black italic uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-green-500/20"
                            onClick={() => handleAction(dispute.id, 'APPROVED', 'dispute')}
                          >
                            <Check className="h-4 w-4" /> Restore Handshake
                          </Button>
                          <Button 
                            variant="ghost" 
                            className="rounded-xl h-14 w-full md:w-48 bg-white/5 text-muted-foreground hover:bg-red-500 hover:text-white font-black italic uppercase tracking-widest text-[10px] gap-2"
                            onClick={() => handleAction(dispute.id, 'REJECTED', 'dispute')}
                          >
                            <X className="h-4 w-4" /> Sever Permanently
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                )) : (
                  <div className="py-32 text-center space-y-6 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                    <Hammer className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
                    <div className="space-y-1">
                      <h4 className="text-xl font-black italic uppercase tracking-tighter text-white">Cluster Harmony</h4>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No active disputes detected in the network.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'economy' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-6">
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">Economy Auditor</h3>
                  <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Global Revenue & Disbursement Control</p>
                </div>
                <div className="bg-white/5 p-1 rounded-xl flex items-center gap-1">
                  <button onClick={() => setEconomySubTab("outbound")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", economySubTab === 'outbound' ? "bg-primary text-white" : "text-muted-foreground")}>Outbound</button>
                  <button onClick={() => setEconomySubTab("inbound")} className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", economySubTab === 'inbound' ? "bg-primary text-white" : "text-muted-foreground")}>Inbound</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-2">
                <Card className="bg-white/5 border-white/10 rounded-[2rem] p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <Sliders className="h-5 w-5 text-amber-500" />
                    <h4 className="font-black italic uppercase tracking-widest text-sm">Exchange Rate Hub</h4>
                  </div>
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gold per 1 USD ($)</Label><Badge className="bg-amber-500/20 text-amber-500 border-none font-black h-5">{settings.goldRate} Rate</Badge></div>
                      <Slider value={[settings.goldRate * 100]} min={1} max={10} step={1} onValueChange={(val) => updateSettings({ goldRate: val[0] / 100 })} className="[&_[role=slider]]:bg-amber-500" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Diamond per 1 USD ($)</Label><Badge className="bg-cyan-500/20 text-cyan-500 border-none font-black h-5">{settings.diamondRate} Rate</Badge></div>
                      <Slider value={[settings.diamondRate * 100]} min={5} max={100} step={5} onValueChange={(val) => updateSettings({ diamondRate: val[0] / 100 })} className="[&_[role=slider]]:bg-cyan-500" />
                    </div>
                  </div>
                </Card>

                <Card className="bg-white/5 border-white/10 rounded-[2rem] p-6 flex flex-col justify-center items-center text-center space-y-4">
                  <div className="h-16 w-16 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary"><Globe className="h-8 w-8 animate-pulse" /></div>
                  <div><h4 className="font-black italic uppercase tracking-tighter text-xl">Dynamic Economy</h4><p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto">Adjust rates platform-wide based on network liquidity. All user portals update instantly.</p></div>
                </Card>
              </div>

              {economySubTab === 'outbound' ? (
                <Card className="bg-white/5 border-white/10 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                      <thead><tr className="border-b border-white/5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-black/20"><th className="px-8 py-6">ID / NODE</th><th className="px-8 py-6">IDENTITY</th><th className="px-8 py-6">METHOD</th><th className="px-8 py-6">AMOUNT (CONVERTED)</th><th className="px-8 py-6">AI RISK</th><th className="px-8 py-6 text-right">HANDSHAKE</th></tr></thead>
                      <tbody className="divide-y divide-white/5">
                        {pendingWithdrawals.length > 0 ? pendingWithdrawals.map((node) => (
                          <tr key={node.id} className="group hover:bg-white/[0.02] transition-colors"><td className="px-8 py-6"><div className="flex flex-col"><span className="text-sm font-black text-white font-mono">{node.id}</span><span className="text-[9px] font-bold text-muted-foreground uppercase mt-1">{new Date(node.timestamp).toLocaleString()}</span></div></td><td className="px-8 py-6"><div className="flex items-center gap-3"><Avatar className="h-10 w-10 border border-white/10"><AvatarImage src={`https://picsum.photos/seed/${node.accountName}/100/100`} /></Avatar><div className="flex flex-col"><span className="text-sm font-bold text-white">{node.accountName}</span><span className="text-[9px] font-black text-primary uppercase">@{node.username || 'unknown_node'}</span></div></div></td><td className="px-8 py-6"><Badge className={cn("text-[9px] font-black uppercase px-3 h-6 border-none", node.method === 'ORANGE' ? "bg-orange-500/20 text-orange-500" : "bg-yellow-500/20 text-yellow-500")}>{node.method} Node</Badge></td><td className="px-8 py-6"><div className="flex flex-col"><span className="text-sm font-black text-white">{node.payoutCurrency} {node.payoutAmount.toFixed(2)}</span><span className="text-[9px] font-bold text-muted-foreground uppercase">From {node.amount} {node.currency}</span></div></td><td className="px-8 py-6"><div className="flex items-center gap-3"><div className="flex-1 h-1.5 w-24 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-green-500" style={{ width: '85%' }} /></div><span className="text-[10px] font-black text-green-500">TRUSTED</span></div></td><td className="px-8 py-6"><div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white" onClick={() => handleAction(node.id, 'APPROVED', 'withdrawal')}><CheckCircle2 className="h-5 w-5" /></Button><Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white" onClick={() => handleAction(node.id, 'REJECTED', 'withdrawal')}><XCircle className="h-5 w-5" /></Button></div></td></tr>
                        )) : (<tr><td colSpan={6} className="px-8 py-32 text-center"><div className="flex flex-col items-center gap-4 opacity-20"><CircleDashed className="h-12 w-12 animate-spin" /><p className="text-sm font-black uppercase tracking-[0.2em]">Queue Silent — No Pending Withdrawals</p></div></td></tr>)}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <Card className="bg-white/5 border-white/10 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                      <thead><tr className="border-b border-white/5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-black/20"><th className="px-8 py-6">ID / PULSE</th><th className="px-8 py-6">SENDER</th><th className="px-8 py-6">PACKAGE / CODE</th><th className="px-8 py-6">RECEIPT</th><th className="px-8 py-6">AI OCR</th><th className="px-8 py-6 text-right">AUTHORIZE</th></tr></thead>
                      <tbody className="divide-y divide-white/5">
                        {pendingPayments.length > 0 ? pendingPayments.map((req) => (
                          <tr key={req.id} className="group hover:bg-white/[0.02] transition-colors"><td className="px-8 py-6"><div className="flex flex-col"><span className="text-sm font-black text-white font-mono">{req.id}</span><span className="text-[9px] font-bold text-muted-foreground uppercase mt-1">{new Date(req.timestamp).toLocaleString()}</span></div></td><td className="px-8 py-6"><div className="flex items-center gap-3"><Avatar className="h-10 w-10 border border-white/10"><AvatarImage src={`https://picsum.photos/seed/${req.username}/100/100`} /></Avatar><div className="flex flex-col"><span className="text-sm font-bold text-white">{req.name}</span><span className="text-[9px] font-black text-primary uppercase">@{req.username}</span></div></div></td><td className="px-8 py-6"><div className="flex flex-col"><span className="text-sm font-black text-white">{req.packageName}</span><span className="text-[10px] font-black text-primary tracking-widest">{req.code}</span></div></td><td className="px-8 py-6"><button className="bg-white/5 border border-white/10 rounded-xl h-10 px-4 gap-2 text-[10px] font-black uppercase flex items-center hover:bg-white/10 transition-all" onClick={() => setSelectedReceipt(req.screenshot)}><ImageIcon className="h-4 w-4" /> View Receipt</button></td><td className="px-8 py-6"><div className="flex items-center gap-2"><div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" /><span className="text-[10px] font-black text-green-500 uppercase tracking-widest">CODE MATCH: 98%</span></div></td><td className="px-8 py-6"><div className="flex items-center justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white" onClick={() => handleAction(req.id, 'APPROVED', 'payment')}><CheckCircle2 className="h-5 w-5" /></Button><Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white" onClick={() => handleAction(req.id, 'REJECTED', 'payment')}><XCircle className="h-5 w-5" /></Button></div></td></tr>
                        )) : (<tr><td colSpan={6} className="px-8 py-32 text-center"><div className="flex flex-col items-center gap-4 opacity-20"><CircleDashed className="h-12 w-12 animate-spin" /><p className="text-sm font-black uppercase tracking-[0.2em]">Queue Silent — No Inbound Payments</p></div></td></tr>)}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'governance' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-1 px-2">
                <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">Governance Node</h3>
                <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">System Broadcasts & Feature Governance</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center gap-4"><div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary"><Send className="h-6 w-6" /></div><div><h4 className="text-xl font-black italic uppercase tracking-tighter text-white">Global Broadcast</h4><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pulse System Signal to All Nodes</p></div></div>
                  <div className="space-y-4">
                    <Textarea placeholder="Enter system announcement..." className="min-h-[120px] bg-black/40 border-white/10 rounded-2xl text-sm font-medium focus-visible:ring-primary/20" value={broadcastText} onChange={(e) => setBroadcastText(e.target.value)} />
                    <Button className="w-full h-14 bg-primary text-white font-black italic uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 gap-3" disabled={isBroadcasting || !broadcastText.trim()} onClick={handleBroadcast}>{isBroadcasting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 fill-current" />}Launch Broadcast Pulse</Button>
                  </div>
                </Card>

                <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 space-y-8">
                  <div className="flex items-center gap-4"><div className="h-12 w-12 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive"><ShieldAlert className="h-6 w-6" /></div><div><h4 className="text-xl font-black italic uppercase tracking-tighter text-white">Feature Access</h4><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Governance Overrides</p></div></div>
                  <div className="space-y-6">
                    {[
                      { id: 'isReelsEnabled' as keyof typeof settings, label: "Reels Stream", icon: Clapperboard, color: "text-orange-500", bg: "bg-orange-500/10" },
                      { id: 'isMusicEnabled' as keyof typeof settings, label: "Music Hub", icon: Music2, color: "text-purple-500", bg: "bg-purple-500/10" },
                      { id: 'isGiftingEnabled' as keyof typeof settings, label: "Gift Exchange", icon: Gem, color: "text-cyan-500", bg: "bg-cyan-500/10" }
                    ].map((f) => (
                      <div key={f.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4"><div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", f.bg, f.color)}><f.icon className="h-5 w-5" /></div><span className="font-bold text-sm text-white/80">{f.label}</span></div>
                        <Switch checked={settings[f.id] as boolean} onCheckedChange={(val) => handleToggleSwitch(f.id, val)} className="data-[state=checked]:bg-primary" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'identity' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-4">
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">Identity Forge</h3>
                  <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Managing Spatial Verification Signatures</p>
                </div>
                <Badge className="bg-primary text-white font-black h-11 px-6 rounded-xl uppercase tracking-widest w-fit">{MOCK_VERIFICATION_REQUESTS.length} REQUESTS</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_VERIFICATION_REQUESTS.map((req) => (
                  <Card key={req.id} className="bg-white/5 border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 space-y-6 group hover:border-primary/40 transition-all">
                    <div className="flex items-center justify-between"><Avatar className="h-14 w-14 sm:h-16 sm:w-16 border-2 border-primary/20"><AvatarImage src={req.avatar} /></Avatar><div className="text-right"><span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Method</span><div className="flex items-center gap-2 justify-end">{req.currency === 'DIAMOND' ? <Gem className="h-4 w-4 text-cyan-500" /> : <Star className="h-4 w-4 text-yellow-500 fill-current" />}<span className="font-black text-white">{req.cost.toLocaleString()}</span></div></div></div>
                    <div className="space-y-1"><h4 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-white">{req.name}</h4><p className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-widest">@{req.username}</p></div>
                    <div className="bg-black/20 rounded-2xl p-4 flex items-center justify-between border border-white/5"><div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">{req.time}</span></div><span className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest">ID: {req.id}</span></div>
                    <div className="grid grid-cols-2 gap-3"><Button className="rounded-xl h-12 bg-primary text-white font-black uppercase tracking-widest text-[10px]" onClick={() => handleAction(req.id, 'APPROVED', 'verification')}>Authorize</Button><Button variant="ghost" className="rounded-xl h-12 bg-white/5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive font-black uppercase tracking-widest text-[10px]" onClick={() => handleAction(req.id, 'REJECTED', 'verification')}>Purge</Button></div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">Safety Node</h3>
                  <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Network Integrity & Moderation Feed</p>
                </div>
                <div className="h-10 w-10 sm:h-11 sm:w-11 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive"><ShieldAlert className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" /></div>
              </div>
              <div className="space-y-4">
                {MOCK_REPORTS.map((report) => (
                  <Card key={report.id} className="bg-white/5 border-white/10 rounded-[2rem] overflow-hidden group hover:border-destructive/30 transition-all">
                    <div className="p-6 flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4"><div className="flex items-center gap-3"><Badge className={cn("font-black text-[8px] sm:text-[9px] uppercase tracking-widest px-3 h-6 border-none", report.risk === 'HIGH' ? "bg-red-500 text-white" : "bg-amber-500 text-white")}>{report.risk} RISK</Badge><span className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest">Report {report.id} • {report.time}</span></div><div className="grid grid-cols-2 gap-8 py-2"><div className="space-y-1"><span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Reporter</span><p className="font-bold text-sm text-white">@{report.reporter}</p></div><div className="space-y-1"><span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Target Node</span><p className="font-bold text-sm text-destructive">@{report.target}</p></div></div><div className="p-4 bg-black/40 rounded-2xl border border-white/5 space-y-2"><div className="flex items-center gap-2"><Flag className="h-3.5 w-3.5 text-primary" /><span className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest">AI Content Audit</span></div><p className="text-sm font-medium text-white/80 leading-relaxed italic">"{report.content}"</p></div></div>
                      <div className="flex flex-row md:flex-col gap-2 justify-end"><Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white/5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all" onClick={() => handleAction(report.id, 'APPROVED', 'report')}><Eye className="h-5 w-5" /></Button><Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white/5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all" onClick={() => handleAction(report.id, 'REJECTED', 'report')}><Trash2 className="h-5 w-5" /></Button><Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl bg-white/5 text-muted-foreground hover:bg-red-500 hover:text-white transition-all" onClick={() => handleAction(report.id, 'REJECTED', 'report')}><Ban className="h-5 w-5" /></Button></div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'gateway' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-1 px-2">
                <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">Gateway Logic</h3>
                <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Configure Financial Inbound Nodes</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 space-y-8">
                  <div className="flex items-center gap-4"><div className="h-12 w-12 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500"><Smartphone className="h-6 w-6" /></div><div><h4 className="text-xl font-black italic uppercase tracking-tighter text-white">Orange Money</h4><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Primary Inbound Pulse</p></div></div>
                  <div className="space-y-6"><div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Account Label</Label><Input value={gatewayForm.orangeName} onChange={(e) => setGatewayForm({ ...gatewayForm, orangeName: e.target.value })} className="h-14 bg-black/40 border-white/10 rounded-2xl text-white font-bold" /></div><div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Node Number</Label><Input value={gatewayForm.orangeNumber} onChange={(e) => setGatewayForm({ ...gatewayForm, orangeNumber: e.target.value })} className="h-14 bg-black/40 border-white/10 rounded-2xl text-white font-bold" /></div></div>
                </Card>
                <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 space-y-8">
                  <div className="flex items-center gap-4"><div className="h-12 w-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500"><Building2 className="h-6 w-6" /></div><div><h4 className="text-xl font-black italic uppercase tracking-tighter text-white">MTN Momo</h4><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Secondary Inbound Pulse</p></div></div>
                  <div className="space-y-6"><div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Account Label</Label><Input value={gatewayForm.mtnName} onChange={(e) => setGatewayForm({ ...gatewayForm, mtnName: e.target.value })} className="h-14 bg-black/40 border-white/10 rounded-2xl text-white font-bold" /></div><div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Node Number</Label><Input value={gatewayForm.mtnNumber} onChange={(e) => setGatewayForm({ ...gatewayForm, mtnNumber: e.target.value })} className="h-14 bg-black/40 border-white/10 rounded-2xl text-white font-bold" /></div></div>
                </Card>
              </div>
              <div className="flex justify-center pt-6"><Button className="h-16 px-12 rounded-2xl bg-primary text-white font-black italic uppercase tracking-[0.2em] text-lg shadow-2xl shadow-primary/20 transition-all active:scale-95 gap-3" onClick={handleSaveGateway}><Check className="h-6 w-6" />Sync Gateway logic</Button></div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="space-y-1 px-2"><h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter">Audit Trail</h3><p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Administrative Identity Logging</p></div>
              <Card className="bg-white/5 border-white/10 rounded-[2rem] overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left min-w-[800px]"><thead><tr className="border-b border-white/5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-black/20"><th className="px-8 py-6">TIMESTAMP</th><th className="px-8 py-6">ADMIN</th><th className="px-8 py-6">ACTION</th><th className="px-8 py-6">DETAILS</th></tr></thead><tbody className="divide-y divide-white/5">
                {auditLogs.length > 0 ? auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]"><td className="px-8 py-6 font-mono text-[10px] text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</td><td className="px-8 py-6"><Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black">{log.admin}</Badge></td><td className="px-8 py-6 font-black italic uppercase tracking-widest text-xs text-white">{log.action}</td><td className="px-8 py-6 text-xs text-muted-foreground font-medium">{log.details}</td></tr>
                )) : (<tr><td colSpan={4} className="px-8 py-32 text-center opacity-40"><Activity className="h-12 w-12 mx-auto mb-4" /><p className="font-black uppercase tracking-widest text-xs">Logs silent — No pulses recorded</p></td></tr>)}
              </tbody></table></div></Card>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Admin Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[200] px-4 pb-6 flex justify-center pointer-events-none">
        <nav className="flex items-center gap-2 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-2.5 shadow-2xl pointer-events-auto overflow-x-auto scrollbar-hide max-w-full">
          {(["pulse", "economy", "intelligence", "velocity", "identity", "safety", "governance", "gateway", "campaigns", "infrastructure", "resolution", "logs"] as AdminTab[]).map((tab) => {
            const icons = { pulse: Activity, economy: Coins, intelligence: BrainCircuit, velocity: TrendingUp, identity: UserPlus, safety: ShieldAlert, governance: Sliders, gateway: Settings, campaigns: Megaphone, infrastructure: Database, resolution: Hammer, logs: FileText };
            const Icon = icons[tab];
            const isActive = activeTab === tab;
            return <button key={tab} onClick={() => { triggerHaptic(5); setActiveTab(tab); }} className={cn("p-3 rounded-2xl transition-all shrink-0", isActive ? "bg-primary text-white scale-110 shadow-lg" : "text-muted-foreground")}><Icon className="h-5 w-5" /></button>;
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
