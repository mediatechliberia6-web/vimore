
"use client";

import { useState, useMemo } from "react";
import { 
  ArrowLeft, 
  Coins, 
  Gem, 
  TrendingUp, 
  ShieldCheck, 
  ChevronRight,
  Wallet,
  ArrowDownToLine,
  PieChart as PieIcon,
  Zap,
  CheckCircle2,
  Lock,
  History,
  Building2,
  Smartphone,
  X,
  Loader2,
  FileText,
  CircleDashed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useNotifications } from "@/context/NotificationContext";
import { useTranslation } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { BiometricGate } from "@/components/layout/biometric-gate";

const REVENUE_DATA = [
  { name: "Locked Posts", value: 65, color: "hsl(var(--primary))" },
  { name: "Subscriptions", value: 35, color: "hsl(var(--accent))" },
];

export default function EarningsPage() {
  const { currentUser, triggerHaptic, withdrawalHistory, recordWithdrawal, processGiftTransaction, settings } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const { addSignal } = useNotifications();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [isPortalOpen, setIsPortalOpen] = useState(false);
  const isPlayerActive = currentTrack && !isExpanded;

  // Real-time conversion logic
  const estimates = useMemo(() => {
    const gold = currentUser.goldBalance || 0;
    const diamond = currentUser.diamondBalance || 0;
    
    const totalUSD = (gold * settings.goldRate) + (diamond * settings.diamondRate);
    return {
      totalUSD,
      totalLD: totalUSD * settings.ldMultiplier
    };
  }, [currentUser.goldBalance, currentUser.diamondBalance, settings.goldRate, settings.diamondRate, settings.ldMultiplier]);

  const conversionRates = useMemo(() => [
    { currency: "Gold (GD)", per: "1 Unit", usd: `$${settings.goldRate}`, ld: `L$ ${(settings.goldRate * settings.ldMultiplier).toFixed(1)}` },
    { currency: "Diamond (D)", per: "1 Unit", usd: `$${settings.diamondRate}`, ld: `L$ ${(settings.diamondRate * settings.ldMultiplier).toFixed(1)}` },
  ], [settings]);

  // PORTAL STATE
  const [payoutMethod, setPayoutMethod] = useState<"ORANGE" | "MTN" | null>(null);
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [withdrawCurrency, setWithdrawCurrency] = useState<"GOLD" | "DIAMOND">("GOLD");
  const [amount, setAmount] = useState("");
  const [payoutCurrency, setPayoutCurrency] = useState<"USD" | "LD">("USD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feeMultiplier = currentUser.isVerified ? 1 : 0.85;
  const rawAmount = parseFloat(amount) || 0;
  
  const calculation = useMemo(() => {
    let baseUSD = 0;
    if (withdrawCurrency === 'GOLD') baseUSD = rawAmount * settings.goldRate;
    else baseUSD = rawAmount * settings.diamondRate;

    const payoutValue = payoutCurrency === 'USD' 
      ? baseUSD 
      : baseUSD * settings.ldMultiplier;
    
    const feeAmount = payoutValue * (1 - feeMultiplier);
    const finalPayout = payoutValue * feeMultiplier;

    return {
      payoutValue,
      feeAmount,
      finalPayout
    };
  }, [withdrawCurrency, amount, payoutCurrency, feeMultiplier, rawAmount, settings]);

  const hasEnoughBalance = useMemo(() => {
    const balance = withdrawCurrency === 'GOLD' ? (currentUser.goldBalance || 0) : (currentUser.diamondBalance || 0);
    return rawAmount > 0 && rawAmount <= balance;
  }, [withdrawCurrency, rawAmount, currentUser]);

  const canProceed = payoutMethod && accountName && accountNumber && amount && hasEnoughBalance;

  // HANDLERS
  const handleInitiateHandshake = async () => {
    if (!canProceed) return;
    setIsSubmitting(true);
    triggerHaptic(50);
    
    try {
      // 1. Lock Balances immediately
      await processGiftTransaction(rawAmount, withdrawCurrency);

      const historyNode = {
        id: `TX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        username: currentUser.username,
        method: payoutMethod!,
        amount: rawAmount,
        currency: withdrawCurrency,
        payoutAmount: calculation.finalPayout,
        payoutCurrency: payoutCurrency,
        timestamp: Date.now(),
        accountName,
        accountNumber
      };

      // 2. Archive record in vault
      await recordWithdrawal(historyNode);

      addSignal({
        type: 'SYSTEM',
        title: 'Withdrawal Pending',
        content: `Your request for **${payoutCurrency} ${calculation.finalPayout.toFixed(2)}** is being processed by the financial cluster.`,
        image: "https://picsum.photos/seed/secure/100/100"
      });

      toast({
        title: "Request Transmitted",
        description: "Your financial node is now pending review."
      });
      setIsPortalOpen(false);
      resetPortal();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Handshake Failed", description: e.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetPortal = () => {
    setPayoutMethod(null);
    setAccountName("");
    setAccountNumber("");
    setAmount("");
  };

  return (
    <BiometricGate title="Earnings Portal">
      <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#050505] transition-colors duration-300 relative overflow-x-hidden">
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full animate-pulse delay-700" />
        </div>

        <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/menu">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/80 active:scale-90 transition-all">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div className="flex flex-col">
              <h1 className="text-lg font-black italic uppercase tracking-tighter text-foreground">{t('earn_portal')}</h1>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{t('earn_financial_intel')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentUser.isVerified && <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black uppercase px-2 h-5">VERIFIED NODE</Badge>}
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
          
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <Card className="relative bg-white dark:bg-card border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5"><Wallet className="h-32 w-32" /></div>
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">{t('earn_available_energy')}</CardDescription>
                <CardTitle className="text-4xl font-black italic uppercase tracking-tighter">{t('earn_vault_balance')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <Coins className="h-5 w-5 text-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('earn_gold_pulse')}</span>
                    </div>
                    <p className="text-3xl font-black italic tabular-nums">{currentUser.goldBalance || 0}</p>
                    <p className="text-[10px] font-bold text-amber-600/60 uppercase tracking-tighter">≈ ${((currentUser.goldBalance || 0) * settings.goldRate).toFixed(2)} USD</p>
                  </div>
                  <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-3xl p-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <Gem className="h-5 w-5 text-cyan-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('earn_diamond_pulse')}</span>
                    </div>
                    <p className="text-3xl font-black italic tabular-nums">{currentUser.diamondBalance || 0}</p>
                    <p className="text-[10px] font-bold text-cyan-600/60 uppercase tracking-tighter">≈ ${((currentUser.diamondBalance || 0) * settings.diamondRate).toFixed(2)} USD</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-primary/5">
                  <div className="flex flex-col items-center sm:items-start">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">{t('earn_conversion_estimate')}</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-primary">${estimates.totalUSD.toFixed(2)}</span>
                      <span className="text-xs font-bold text-muted-foreground">/</span>
                      <span className="text-xl font-black text-foreground">L$ {estimates.totalLD.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full sm:w-auto h-14 px-10 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all gap-3"
                    onClick={() => { triggerHaptic(20); setIsPortalOpen(true); }}
                  >
                    <ArrowDownToLine className="h-5 w-5" />
                    {t('earn_withdraw')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-card border-border shadow-xl rounded-[2rem]">
              <CardHeader className="pb-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><PieIcon className="h-4 w-4" /></div>
                  <CardTitle className="text-lg font-black italic uppercase tracking-tighter">{t('earn_revenue_pulse')}</CardTitle>
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

            <Card className="bg-white dark:bg-card border-border shadow-xl rounded-[2rem]">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500"><History className="h-4 w-4" /></div>
                  <CardTitle className="text-lg font-black italic uppercase tracking-tighter">{t('earn_exchange_rates')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionRates.map((rate) => (
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
                </div>
              </CardContent>
            </Card>
          </div>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">{t('earn_audit_trail')} ({t('earn_recent_history')})</h3>
              <span className="text-[9px] font-black text-primary uppercase">{withdrawalHistory.length} NODES</span>
            </div>
            <div className="space-y-3">
              {withdrawalHistory.length > 0 ? withdrawalHistory.map((node) => (
                <div key={node.id} className="bg-white dark:bg-card border border-primary/5 p-5 rounded-[2rem] flex items-center justify-between group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center",
                      node.status === 'PENDING' ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"
                    )}>
                      {node.status === 'PENDING' ? <CircleDashed className="h-6 w-6 animate-spin" /> : <CheckCircle2 className="h-6 w-6" />}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-bold">{node.payoutCurrency} {node.payoutAmount.toFixed(2)}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-muted-foreground">{node.method} Node</span>
                        <div className="h-1 w-1 bg-muted-foreground/30 rounded-full" />
                        <span className="text-[10px] font-black uppercase text-primary">Ref: {node.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge className={cn(
                      "font-black text-[8px] uppercase tracking-tighter border-none h-5 px-3",
                      node.status === 'PENDING' ? "bg-amber-500/10 text-amber-500" : "bg-green-500/10 text-green-500"
                    )}>
                      {node.status}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground uppercase mt-1">{new Date(node.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              )) : (
                <div className="py-16 text-center bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-dashed border-primary/10 rounded-[2.5rem] space-y-4 opacity-40">
                  <FileText className="h-10 w-10 mx-auto" />
                  <p className="text-sm font-black italic uppercase tracking-widest">Vault Empty</p>
                </div>
              )}
            </div>
          </section>
        </main>

        {isPortalOpen && (
          <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-500 overflow-hidden">
            <header className="h-20 px-6 flex items-center justify-between shrink-0 bg-black/40 border-b border-white/5">
              <Button variant="ghost" size="icon" className="text-white bg-white/5 rounded-full" onClick={() => { setIsPortalOpen(false); resetPortal(); }}>
                <X className="h-6 w-6" />
              </Button>
              <div className="flex flex-col items-center">
                <h2 className="text-sm font-black italic uppercase tracking-widest text-white">Withdrawal Portal</h2>
                <span className="text-[10px] font-bold text-primary uppercase">Financial Handshake</span>
              </div>
              <div className="w-10" />
            </header>

            <main className="flex-1 overflow-y-auto p-6 sm:p-12">
              <div className="max-w-xl mx-auto space-y-10">
                <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                  <section className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 text-center">Select Payout Node</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => { triggerHaptic(10); setPayoutMethod("ORANGE"); }}
                        className={cn(
                          "h-24 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all group",
                          payoutMethod === "ORANGE" ? "bg-orange-500 border-orange-400 text-white shadow-xl shadow-orange-500/20" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                        )}
                      >
                        <Smartphone className="h-6 w-6" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Orange Money</span>
                      </button>
                      <button 
                        onClick={() => { triggerHaptic(10); setPayoutMethod("MTN"); }}
                        className={cn(
                          "h-24 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all group",
                          payoutMethod === "MTN" ? "bg-yellow-500 border-yellow-400 text-black shadow-xl shadow-yellow-500/20" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                        )}
                      >
                        <Building2 className="h-6 w-6" />
                        <span className="text-[10px] font-black uppercase tracking-widest">MTN Momo</span>
                      </button>
                    </div>
                  </section>

                  <section className="space-y-6 bg-white/5 border border-white/10 p-8 rounded-[2.5rem]">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Account Identity (Name)</Label>
                        <Input 
                          placeholder="Registered account holder name" 
                          className="h-14 bg-white/5 border-none rounded-2xl text-white font-bold"
                          value={accountName}
                          onChange={(e) => setAccountName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Node Number (Phone)</Label>
                        <Input 
                          placeholder="+231 77/88..." 
                          className="h-14 bg-white/5 border-none rounded-2xl text-white font-bold"
                          value={accountName}
                          onChange={(e) => setAccountNumber(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Source Energy</Label>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setWithdrawCurrency("GOLD")}
                            className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", withdrawCurrency === 'GOLD' ? "bg-amber-500 text-white" : "bg-white/5 text-white/40")}
                          >GOLD</button>
                          <button 
                            onClick={() => setWithdrawCurrency("DIAMOND")}
                            className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", withdrawCurrency === 'DIAMOND' ? "bg-cyan-500 text-white" : "bg-white/5 text-white/40")}
                          >DIAMOND</button>
                        </div>
                      </div>
                      <div className="relative">
                        <Input 
                          type="number"
                          placeholder="Amount to withdraw..." 
                          className={cn(
                            "h-20 bg-white/5 border-none rounded-[1.5rem] text-3xl font-black italic uppercase tracking-tighter text-white px-8",
                            !hasEnoughBalance && rawAmount > 0 && "text-red-500"
                          )}
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          {withdrawCurrency === 'GOLD' ? <Coins className="h-6 w-6 text-amber-500" /> : <Gem className="h-6 w-6 text-cyan-500" />}
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Payout Asset</Label>
                        <div className="flex gap-2">
                          <button onClick={() => setPayoutCurrency("USD")} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", payoutCurrency === 'USD' ? "bg-white text-black" : "bg-white/5 text-white/40")}>USD ($)</button>
                          <button onClick={() => setPayoutCurrency("LD")} className={cn("px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all", payoutCurrency === 'LD' ? "bg-white text-black" : "bg-white/5 text-white/40")}>LD (L$)</button>
                        </div>
                      </div>

                      <div className="bg-black/40 rounded-3xl p-6 space-y-4 border border-white/5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-white tracking-[0.2em]">Final Payout</span>
                          <span className="text-2xl font-black italic text-primary">{payoutCurrency === 'USD' ? '$' : 'L$'} {calculation.finalPayout.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <Button 
                    className={cn(
                      "w-full h-20 rounded-[2rem] font-black italic uppercase tracking-[0.3em] text-xl shadow-2xl transition-all active:scale-95",
                      canProceed && !isSubmitting ? "bg-primary text-white shadow-primary/20" : "bg-white/5 text-white/20 cursor-not-allowed"
                    )}
                    onClick={handleInitiateHandshake}
                    disabled={!canProceed || isSubmitting}
                  >
                    {isSubmitting ? <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> SYNCING...</> : "Submit for Review"}
                  </Button>
                </div>
              </div>
            </main>
          </div>
        )}
      </div>
    </BiometricGate>
  );
}
