
"use client";

import { useState, useMemo } from "react";
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
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { usePosts, WithdrawalNode } from "@/context/PostContext";
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
  Cell
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type AdminTab = "pulse" | "economy" | "identity" | "safety";

const MOCK_DAILY_PULSE = [
  { time: "00:00", active: 1200, load: 15 },
  { time: "04:00", active: 800, load: 8 },
  { time: "08:00", active: 2400, load: 45 },
  { time: "12:00", active: 4800, load: 82 },
  { time: "16:00", active: 5200, load: 94 },
  { time: "20:00", active: 3800, load: 60 },
  { time: "23:59", active: 1500, load: 20 },
];

export default function AdminDashboard() {
  const { withdrawalHistory, processWithdrawal, triggerHaptic, connections, posts } = usePosts();
  const [activeTab, setActiveTab] = useState<AdminTab>("pulse");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const pendingWithdrawals = useMemo(() => 
    withdrawalHistory.filter(w => w.status === 'PENDING'), 
    [withdrawalHistory]
  );

  const stats = useMemo(() => ({
    totalNodes: 12450,
    totalSignatures: posts.length + 8540,
    totalEnergy: "L$ 4.2M",
    activeClusters: 142
  }), [posts]);

  const handleAction = (id: string, status: 'APPROVED' | 'REJECTED') => {
    processWithdrawal(id, status);
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
        "h-screen bg-black/40 backdrop-blur-3xl border-r border-white/5 transition-all duration-500 flex flex-col shrink-0 z-[100]",
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

        <nav className="flex-1 p-4 space-y-2">
          {(["pulse", "economy", "identity", "safety"] as AdminTab[]).map((tab) => {
            const icons = { pulse: Activity, economy: Coins, identity: Users, safety: ShieldCheck };
            const labels = { pulse: "Global Pulse", economy: "Economy Auditor", identity: "Identity Forge", safety: "Safety Node" };
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
        <header className="h-20 px-8 flex items-center justify-between bg-black/20 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-muted-foreground hover:text-white">
              <Menu className="h-6 w-6" />
            </Button>
            <div className="hidden sm:flex flex-col">
              <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Spatial Node</h2>
              <span className="text-lg font-black italic uppercase tracking-tighter text-white">Cluster: ViMore-Main-Alpha</span>
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

        <div className="p-6 sm:p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === 'pulse' && (
            <div className="space-y-10">
              {/* High-Velocity Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Active Nodes", value: stats.totalNodes.toLocaleString(), icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
                  { label: "Digital Signatures", value: stats.totalSignatures.toLocaleString(), icon: Rocket, color: "text-primary", bg: "bg-primary/10" },
                  { label: "Sonic Pulses", value: "842k", icon: BarChart3, color: "text-accent", bg: "bg-accent/10" },
                  { label: "Network Energy", value: stats.totalEnergy, icon: Coins, color: "text-amber-400", bg: "bg-amber-400/10" }
                ].map((m) => (
                  <Card key={m.label} className="bg-white/5 border-white/10 rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all">
                    <CardContent className="p-6 flex items-center gap-5">
                      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", m.bg, m.color)}>
                        <m.icon className="h-7 w-7" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{m.label}</span>
                        <span className="text-2xl font-black italic uppercase tracking-tighter text-white">{m.value}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load & Activity Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter">System Velocity</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Node Concurrency (24H)</p>
                    </div>
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><TrendingUp className="h-5 w-5" /></div>
                  </div>
                  <div className="h-[300px] w-full">
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

                <Card className="bg-white/5 border-white/10 rounded-[2.5rem] p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter">AI Node Load</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Groq High-Velocity Inference (%)</p>
                    </div>
                    <div className="h-10 w-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent"><Zap className="h-5 w-5" /></div>
                  </div>
                  <div className="h-[300px] w-full">
                    <ChartContainer config={{ load: { label: "Load %", color: "hsl(var(--accent))" } }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={MOCK_DAILY_PULSE}>
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="load" fill="hsl(var(--accent))" radius={[10, 10, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'economy' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter">Economy Auditor</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Authorizing Global Financial Handshakes</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input 
                      placeholder="Query transactions..." 
                      className="h-11 w-64 bg-white/5 border-white/10 rounded-xl pl-10 text-xs font-bold"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Badge className="bg-amber-500 text-white font-black h-11 px-6 rounded-xl uppercase tracking-widest">
                    {pendingWithdrawals.length} PENDING
                  </Badge>
                </div>
              </div>

              <Card className="bg-white/5 border-white/10 rounded-[2.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-black/20">
                        <th className="px-8 py-6">ID / NODE</th>
                        <th className="px-8 py-6">IDENTITY</th>
                        <th className="px-8 py-6">METHOD</th>
                        <th className="px-8 py-6">AMOUNT (CONVERTED)</th>
                        <th className="px-8 py-6">AI RISK</th>
                        <th className="px-8 py-6 text-right">HANDSHAKE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {pendingWithdrawals.length > 0 ? pendingWithdrawals.map((node) => {
                        const risk = Math.floor(Math.random() * 30); // Simulated risk check
                        return (
                          <tr key={node.id} className="group hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-white font-mono">{node.id}</span>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase mt-1">{new Date(node.timestamp).toLocaleString()}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border border-white/10">
                                  <AvatarImage src={`https://picsum.photos/seed/${node.accountName}/100/100`} />
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-white">{node.accountName}</span>
                                  <span className="text-[9px] font-black text-primary uppercase">@{node.username || 'unknown_node'}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <Badge className={cn(
                                "text-[9px] font-black uppercase px-3 h-6 border-none",
                                node.method === 'ORANGE' ? "bg-orange-500/20 text-orange-500" : "bg-yellow-500/20 text-yellow-500"
                              )}>
                                {node.method} Node
                              </Badge>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-white">{node.payoutCurrency} {node.payoutAmount.toFixed(2)}</span>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase">From {node.amount} {node.currency}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                                  <div className="h-full bg-green-500" style={{ width: `${100 - risk}%` }} />
                                </div>
                                <span className="text-[10px] font-black text-green-500">TRUSTED</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white"
                                  onClick={() => handleAction(node.id, 'APPROVED')}
                                >
                                  <CheckCircle2 className="h-5 w-5" />
                                </Button>
                                <Button 
                                  variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
                                  onClick={() => handleAction(node.id, 'REJECTED')}
                                >
                                  <XCircle className="h-5 w-5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr>
                          <td colSpan={6} className="px-8 py-32 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-20">
                              <CircleDashed className="h-12 w-12 animate-spin" />
                              <p className="text-sm font-black uppercase tracking-[0.2em]">Queue Silent — No Pending Handshakes</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'identity' && (
            <div className="py-20 text-center space-y-6 opacity-40">
              <div className="h-20 w-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-dashed border-primary/20">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Identity Forge Under Sync</h3>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest max-w-xs mx-auto">The verification request queue is currently being calibrated for high-velocity materialization.</p>
              </div>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="py-20 text-center space-y-6 opacity-40">
              <div className="h-20 w-20 bg-destructive/10 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-dashed border-destructive/20">
                <ShieldCheck className="h-10 w-10 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Safety Node Cold</h3>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest max-w-xs mx-auto">No community reports detected. Network integrity is currently at optimal levels.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Admin Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[200] px-4 pb-6 flex justify-center pointer-events-none">
        <nav className="flex items-center gap-2 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-2.5 shadow-2xl pointer-events-auto">
          {(["pulse", "economy", "identity", "safety"] as AdminTab[]).map((tab) => {
            const icons = { pulse: Activity, economy: Coins, identity: Users, safety: ShieldCheck };
            const Icon = icons[tab];
            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                onClick={() => { triggerHaptic(5); setActiveTab(tab); }}
                className={cn(
                  "p-3 rounded-2xl transition-all",
                  isActive ? "bg-primary text-white scale-110 shadow-lg" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
