"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  X, 
  Zap, 
  Gem, 
  Star, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2,
  ChevronRight,
  Rocket,
  AlertTriangle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useTranslation } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BoostPortalProps {
  children: React.ReactNode;
  nodeId: string;
  type: 'POST' | 'REEL' | 'SONIC';
}

export function BoostPortal({ children, nodeId, type }: BoostPortalProps) {
  const { currentUser, boostNode, triggerHaptic } = usePosts();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [currency, setCurrency] = useState<'DIAMOND' | 'STAR'>('DIAMOND');
  const [duration, setDuration] = useState(3);
  const [amount, setAmount] = useState(25);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Calibration Logic: Deterministic Vault Parameters
  const minPrice = currency === 'DIAMOND' ? 25 : 30000;
  const maxPrice = currency === 'DIAMOND' ? 100 : 120000;
  const step = currency === 'DIAMOND' ? 1 : 1000;

  useEffect(() => {
    setAmount(minPrice);
  }, [currency, minPrice]);

  const promisedViews = useMemo(() => {
    const baseViews = 10000;
    const ratio = amount / minPrice;
    const durationBonus = (duration - 3) * 500; 
    return Math.round((ratio * baseViews) + durationBonus);
  }, [amount, duration, minPrice]);

  const balanceKey = currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance';
  const hasBalance = (currentUser[balanceKey] || 0) >= amount;

  const handleLaunch = async () => {
    if (!hasBalance) {
      toast({ variant: "destructive", title: "Insufficient Energy", description: "Increase your vault balance to materialize this boost." });
      return;
    }

    setIsSyncing(true);
    triggerHaptic(30);

    try {
      // VI-MORE PAYMENT VERIFICATION SYSTEM
      // Atomic handshake: Balance check -> Deduction -> Boost activation
      await boostNode(nodeId, promisedViews, duration, amount, currency, type);

      setIsSuccess(true);
      triggerHaptic(100);
      
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
      }, 2500);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Boost Failure", description: e.message });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="rounded-t-[3rem] p-0 border-primary/10 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-3xl h-[85vh] flex flex-col top-auto bottom-0 translate-y-0 translate-x-[-50%] overflow-hidden">
        <div className="mx-auto w-12 h-1.5 bg-primary/20 rounded-full mt-4 mb-2 shrink-0" />
        
        <DialogHeader className="px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-foreground">{t('boost_title')}</DialogTitle>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{t('boost_desc')}</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => setIsOpen(false)}>
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-500">
            <div className="relative">
              <div className="absolute -inset-8 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <div className="h-24 w-24 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-2xl relative z-10">
                <Rocket className="h-12 w-12" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Campaign Active</h3>
              <p className="text-sm text-muted-foreground uppercase font-bold">Node Priority Synchronized Successfully</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-6 space-y-10 py-6 scrollbar-hide">
              
              <div className="bg-primary/5 border-2 border-primary/20 rounded-[2rem] p-8 text-center space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp className="h-24 w-24" /></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{t('boost_promised_views')}</span>
                <div className="flex flex-col items-center gap-1">
                  <h4 className="text-5xl font-black italic tracking-tighter text-primary">{promisedViews.toLocaleString()}+</h4>
                  <p className="text-xs font-bold text-muted-foreground uppercase">Target Reach Nodes</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-[9px] font-black text-primary/60 uppercase">
                  <ShieldCheck className="h-3.5 w-3.5" /> High-Velocity Verified Protocol
                </div>
              </div>

              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t('boost_duration')}</span>
                    </div>
                    <Badge className="bg-secondary text-foreground font-black h-5 px-3 uppercase tracking-tighter">{duration} {t('boost_days')}</Badge>
                  </div>
                  <Slider 
                    value={[duration]} 
                    min={3} 
                    max={15} 
                    step={1} 
                    onValueChange={(val) => { triggerHaptic(5); setDuration(val[0]); }}
                  />
                  <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                    <span>3 DAYS</span>
                    <span>15 DAYS</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Energy Budget</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => { triggerHaptic(10); setCurrency('DIAMOND'); }}
                        className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", currency === 'DIAMOND' ? "bg-primary text-white" : "bg-secondary/40 text-muted-foreground")}
                      >DIAMOND</button>
                      <button 
                        onClick={() => { triggerHaptic(10); setCurrency('STAR'); }}
                        className={cn("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", currency === 'STAR' ? "bg-primary text-white" : "bg-secondary/40 text-muted-foreground")}
                      >STAR</button>
                    </div>
                  </div>
                  
                  <div className="relative pt-2">
                    <Slider 
                      value={[amount]} 
                      min={minPrice} 
                      max={maxPrice} 
                      step={step} 
                      onValueChange={(val) => { triggerHaptic(5); setAmount(val[0]); }}
                    />
                    <div className="mt-6 bg-secondary/20 h-16 rounded-2xl flex items-center justify-between px-6 border border-white/5">
                      <span className="text-[10px] font-black text-muted-foreground uppercase">COST</span>
                      <div className="flex items-center gap-3">
                        {currency === 'DIAMOND' ? <Gem className="h-5 w-5 text-cyan-500" /> : <Star className="h-5 w-5 text-yellow-500 fill-current" />}
                        <span className="text-3xl font-black italic tracking-tighter tabular-nums text-foreground">{amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/10 border border-white/5 rounded-[2rem] p-6 flex gap-4">
                <AlertTriangle className="h-5 w-5 text-primary shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest">Boost Strategy</p>
                  <p className="text-[11px] font-medium leading-relaxed uppercase tracking-tight text-muted-foreground">
                    This pulse will prioritize your node at a 2:1 ratio in the discovery stream. High-velocity interleaving will maintain campaign visibility until the views or duration threshold is reached.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-[#050505] border-t border-primary/5 pb-10">
              <Button 
                className={cn(
                  "w-full h-16 rounded-2xl font-black italic uppercase tracking-[0.2em] text-lg shadow-2xl transition-all active:scale-[0.98]",
                  hasBalance && !isSyncing ? "bg-primary text-white shadow-primary/20" : "bg-secondary text-muted-foreground/40 cursor-not-allowed"
                )}
                disabled={!hasBalance || isSyncing}
                onClick={handleLaunch}
              >
                {isSyncing ? (
                  <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> SYNCING...</>
                ) : (
                  <>{t('boost_launch')}</>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
