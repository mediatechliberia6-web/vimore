"use client";

import { useState, useMemo } from "react";
import { 
  ArrowLeft, 
  Coins, 
  Gem, 
  TrendingUp, 
  Info, 
  ShieldCheck, 
  ChevronRight,
  Wallet,
  ArrowDownToLine,
  BarChart3,
  PieChart as PieIcon,
  HelpCircle,
  Zap,
  Globe,
  Star,
  CheckCircle2,
  Lock,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";

const REVENUE_DATA = [
  { name: "Locked Posts", value: 65, color: "hsl(var(--primary))" },
  { name: "Subscriptions", value: 35, color: "hsl(var(--accent))" },
];

const CONVERSION_RATES = [
  { currency: "Gold (GD)", per: "1 Unit", usd: "$0.01", ld: "L$ 1.9" },
  { currency: "Diamond (D)", per: "1 Unit", usd: "$0.25", ld: "L$ 47.0" },
];

const QUALIFICATIONS = [
  { 
    title: "Locked Vibe Protocol", 
    requirement: "10,000+ Followers", 
    benefit: "Monetize posts & reels with Gold gates.",
    icon: Lock,
    color: "text-amber-500",
    bg: "bg-amber-500/10"
  },
  { 
    title: "Diamond Loyalty Loop", 
    requirement: "50,000+ Followers", 
    benefit: "Materialize monthly Diamond subscriptions.",
    icon: Gem,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10"
  },
];

export default function EarningsPage() {
  const { currentUser, triggerHaptic } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const isPlayerActive = currentTrack && !isExpanded;

  // Real-time conversion logic
  const estimates = useMemo(() => {
    const gold = currentUser.goldBalance || 0;
    const diamond = currentUser.diamondBalance || 0;
    
    return {
      totalUSD: (gold * 0.01) + (diamond * 0.25),
      totalLD: (gold * 1.9) + (diamond * 47)
    };
  }, [currentUser.goldBalance, currentUser.diamondBalance]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#050505] transition-colors duration-300 relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/menu">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/80 active:scale-90 transition-all">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-black italic uppercase tracking-tighter text-foreground">Earnings Portal</h1>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Financial Intelligence</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black uppercase px-2 h-5">VERIFIED NODE</Badge>
          <Avatar className="h-9 w-9 border-2 border-primary/10">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className={cn(
        "max-w-3xl mx-auto p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500",
        isPlayerActive ? "pt-[80px]" : "pt-4"
      )}>
        
        {/* 1. Hero Balance Card */}
        <section className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <Card className="relative bg-white dark:bg-card border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Wallet className="h-32 w-32" /></div>
            <CardHeader className="pb-2">
              <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Available Energy</CardDescription>
              <CardTitle className="text-4xl font-black italic uppercase tracking-tighter">Vault Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gold Pulse</span>
                  </div>
                  <p className="text-3xl font-black italic tabular-nums">{currentUser.goldBalance || 0}</p>
                  <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-tighter">≈ ${((currentUser.goldBalance || 0) * 0.01).toFixed(2)} USD</p>
                </div>
                <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-3xl p-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <Gem className="h-5 w-5 text-cyan-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Diamond Pulse</span>
                  </div>
                  <p className="text-3xl font-black italic tabular-nums">{currentUser.diamondBalance || 0}</p>
                  <p className="text-[10px] font-bold text-cyan-600/60 uppercase tracking-tighter">≈ ${((currentUser.diamondBalance || 0) * 0.25).toFixed(2)} USD</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-primary/5">
                <div className="flex flex-col items-center sm:items-start">
                  <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total Conversion Estimate</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-primary">${estimates.totalUSD.toFixed(2)}</span>
                    <span className="text-xs font-bold text-muted-foreground">/</span>
                    <span className="text-xl font-black text-foreground">L$ {estimates.totalLD.toLocaleString()}</span>
                  </div>
                </div>
                <Button 
                  className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-3"
                  onClick={() => { triggerHaptic(20); toast({ title: "Portal Opening", description: "Materializing withdrawal handshake..." }); }}
                >
                  <ArrowDownToLine className="h-5 w-5" />
                  Withdraw Earnings
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* 2. Earnings Analytics & Exchange Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Breakdown */}
          <Card className="bg-white dark:bg-card border-border shadow-xl rounded-[2rem]">
            <CardHeader className="pb-0">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><PieIcon className="h-4 w-4" /></div>
                <CardTitle className="text-lg font-black italic uppercase tracking-tighter">Revenue Pulse</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-[240px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={REVENUE_DATA}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {REVENUE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                {REVENUE_DATA.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">{item.name} ({item.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Exchange Rate Registry */}
          <Card className="bg-white dark:bg-card border-border shadow-xl rounded-[2rem]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500"><History className="h-4 w-4" /></div>
                <CardTitle className="text-lg font-black italic uppercase tracking-tighter">Exchange Rates</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {CONVERSION_RATES.map((rate) => (
                  <div key={rate.currency} className="p-4 rounded-2xl bg-secondary/30 border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{rate.currency}</span>
                      <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-tighter">{rate.per}</Badge>
                    </div>
                    <div className="flex items-center justify-between border-t border-black/5 pt-2">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-black text-muted-foreground uppercase">USD</span>
                        <span className="text-sm font-black">{rate.usd}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-muted-foreground uppercase">LD</span>
                        <span className="text-sm font-black">{rate.ld}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-[9px] text-muted-foreground text-center font-medium uppercase tracking-tight italic mt-2">
                  * Rates are updated every 24 hours based on global network liquidity.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 3. Monetization Requirements Card */}
        <Card className="bg-[#0A0A0A] border-white/5 shadow-2xl rounded-[2.5rem] overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp className="h-32 w-32 text-primary" /></div>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center text-primary"><Zap className="h-6 w-6 animate-pulse" /></div>
              <div>
                <CardTitle className="text-xl font-black italic uppercase tracking-tighter text-white">Creator Requirements</CardTitle>
                <CardDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Protocol Eligibility & Handshakes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {QUALIFICATIONS.map((q) => (
                <div key={q.title} className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4 hover:border-primary/30 transition-all group/q">
                  <div className="flex items-center justify-between">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover/q:scale-110", q.bg, q.color)}>
                      <q.icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="border-white/10 text-white/60 text-[8px] font-black uppercase">{q.requirement}</Badge>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black italic uppercase tracking-tight text-white">{q.title}</h4>
                    <p className="text-xs text-white/40 font-medium leading-relaxed">{q.benefit}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 flex gap-4">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0"><ShieldCheck className="h-5 w-5" /></div>
              <div className="space-y-1">
                <h5 className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">The 70/30 Handshake</h5>
                <p className="text-[11px] text-white/60 leading-relaxed font-medium uppercase tracking-tight">
                  ViMore operates on a high-velocity creator-first model. You receive exactly **70%** of all monetized pulses (Gold/Diamonds). The remaining **30%** maintains our high-fidelity server clusters and secure node infrastructure.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Footer */}
        <footer className="pt-10 pb-20 flex flex-col items-center gap-6 opacity-40">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">ViMore Economy v1.5.0-HighVelocity</span>
          </div>
          <p className="text-[9px] text-center max-w-xs font-bold uppercase tracking-widest">
            All transactions are audited by the Groq AI Financial Engine to ensure peak system integrity.
          </p>
        </footer>

      </main>
    </div>
  );
}
