"use client";

import { useState, useMemo } from "react";
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Gem, 
  Star, 
  Zap, 
  Clock, 
  Loader2, 
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Info,
  Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useNotifications } from "@/context/NotificationContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { aiRequestSignatureVerificationAction } from "@/app/actions/ai";
import { Badge } from "@/components/ui/badge";

export default function VerificationHub() {
  const { currentUser, verifyUser, triggerHaptic, resendVerification } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const { addSignal } = useNotifications();
  const { toast } = useToast();

  const [currencyChoice, setCurrencyChoice] = useState<'DIAMOND' | 'STAR'>('DIAMOND');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const isPlayerActive = currentTrack && !isExpanded;
  const isFirstTime = !currentUser.hasEverBeenVerified;
  const isEmailPulseActive = currentUser.isEmailVerified;

  const pricing = useMemo(() => {
    if (isFirstTime) {
      return { diamond: 6, star: 10000 };
    }
    return { diamond: 15, star: 20000 };
  }, [isFirstTime]);

  const currentCost = currencyChoice === 'DIAMOND' ? pricing.diamond : pricing.star;
  const hasBalance = currencyChoice === 'DIAMOND' 
    ? (currentUser.diamondBalance || 0) >= pricing.diamond 
    : (currentUser.starBalance || 0) >= pricing.star;

  const handleResendEmail = async () => {
    setIsResending(true);
    triggerHaptic(10);
    try {
      await resendVerification();
      toast({ title: "Email Pulse Re-emitted", description: "Check your inbox for the verification link." });
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Failed" });
    } finally {
      setIsResending(false);
    }
  };

  const handleVerificationRequest = async () => {
    if (!isEmailPulseActive) {
      toast({ variant: "destructive", title: "Handshake Required", description: "You must synchronize your email node before materializing a signature." });
      return;
    }

    if (!hasBalance) {
      triggerHaptic(50);
      toast({ 
        variant: "destructive", 
        title: "Insufficient Energy", 
        description: `You need ${currentCost} ${currencyChoice.toLowerCase()}s to materialize this signature.` 
      });
      return;
    }

    setIsVerifying(true);
    triggerHaptic(20);

    try {
      // AI AUDITOR HANDSHAKE
      const result = await aiRequestSignatureVerificationAction({
        username: currentUser.username,
        hasEverBeenVerified: !isFirstTime,
        currencyChoice
      });

      if (result.approved) {
        // SECURE TRANSACTION
        verifyUser(result.cost, currencyChoice);
        
        // SYNC SIGNAL
        addSignal({
          type: 'SYSTEM',
          title: 'Signature Materialized',
          content: `Your high-velocity purple signature is now live. **Valid for 30 days.**`,
          avatar: currentUser.avatar
        });

        toast({
          title: "Signature Materialized",
          description: result.message
        });
      } else {
        toast({ variant: "destructive", title: "Audit Failed", description: result.message });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Protocol Error", description: "Audit node unreachable." });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2ECF7] dark:bg-[#050505] transition-colors duration-300 overflow-x-hidden relative">
      
      {/* Immersive Atmosphere */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/80 active:scale-90 transition-all">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-black italic uppercase tracking-tighter text-foreground">Signature Hub</h1>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Protocol Activation</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              <Gem className="h-3 w-3 text-cyan-500" />
              <span className="text-xs font-bold">{currentUser.diamondBalance || 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="text-xs font-bold">{(currentUser.starBalance || 0).toLocaleString()}</span>
            </div>
          </div>
          <Avatar className="h-9 w-9 border-2 border-primary/10">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className={cn(
        "max-w-xl mx-auto p-4 sm:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500",
        isPlayerActive ? "pt-[80px]" : "pt-4"
      )}>
        
        {/* Email Verification Requirement Card */}
        {!isEmailPulseActive && (
          <section className="bg-red-500/10 border-2 border-red-500/20 rounded-[2.5rem] p-8 space-y-6 animate-in shake-vibe">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-xl shadow-red-500/20">
                <Mail className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-red-500">Identity Guard</h3>
                <p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest">Email Handshake Required</p>
              </div>
            </div>
            <p className="text-sm font-medium leading-relaxed text-red-500/80">
              You must synchronize your email node before materializing spatial authority (Purple Signature). 
            </p>
            <Button 
              className="w-full h-12 rounded-xl bg-red-500 text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-red-500/20"
              onClick={handleResendEmail}
              disabled={isResending}
            >
              {isResending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {isResending ? "EMITTING PULSE..." : "Send Verification Email"}
            </Button>
          </section>
        )}

        {/* Profile Signature Preview */}
        <section className="text-center space-y-6">
          <div className="relative inline-block group">
            <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <Avatar className="h-32 w-32 border-4 border-white dark:border-card shadow-2xl relative z-10">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 -right-2 z-20 bg-primary text-white p-2 rounded-full shadow-xl ring-4 ring-white dark:ring-[#050505] animate-in zoom-in duration-1000 delay-300">
              <CheckCircle2 className="h-6 w-6 fill-primary text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">{currentUser.name}</h2>
              {currentUser.isVerified && <CheckCircle2 className="h-6 w-6 text-primary fill-primary text-white" />}
            </div>
            <p className="text-muted-foreground text-sm font-medium uppercase tracking-[0.2em]">Verified Signature Preview</p>
          </div>
        </section>

        {/* Pricing Protocol Selection */}
        <section className={cn("space-y-6 transition-opacity", !isEmailPulseActive && "opacity-40 pointer-events-none")}>
          <div className="flex flex-col items-center gap-2">
            <Badge variant="outline" className="border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1">
              {isFirstTime ? 'Initial Handshake' : 'Temporal Renewal'}
            </Badge>
            <h3 className="text-xl font-black italic uppercase tracking-widest text-center">Materialization Cost</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => { triggerHaptic(10); setCurrencyChoice('DIAMOND'); }}
              className={cn(
                "p-6 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden group",
                currencyChoice === 'DIAMOND' 
                  ? "bg-primary text-white border-primary shadow-2xl shadow-primary/20 scale-[1.02]" 
                  : "bg-white dark:bg-card border-border hover:border-primary/40 text-foreground"
              )}
            >
              <div className="relative z-10 flex flex-col gap-4">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-colors", currencyChoice === 'DIAMOND' ? "bg-white/20" : "bg-cyan-500/10")}>
                  <Gem className={cn("h-6 w-6", currencyChoice === 'DIAMOND' ? "text-white" : "text-cyan-500")} />
                </div>
                <div>
                  <p className={cn("text-2xl font-black tabular-nums tracking-tighter", currencyChoice === 'DIAMOND' ? "text-white" : "text-foreground")}>{pricing.diamond} D</p>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest", currencyChoice === 'DIAMOND' ? "text-white/60" : "text-muted-foreground")}>Premium Energy</p>
                </div>
              </div>
              <ChevronRight className={cn("absolute bottom-6 right-6 h-5 w-5 transition-opacity", currencyChoice === 'DIAMOND' ? "opacity-100" : "opacity-0")} />
            </button>

            <button 
              onClick={() => { triggerHaptic(10); setCurrencyChoice('STAR'); }}
              className={cn(
                "p-6 rounded-[2.5rem] border-2 transition-all text-left relative overflow-hidden group",
                currencyChoice === 'STAR' 
                  ? "bg-primary text-white border-primary shadow-2xl shadow-primary/20 scale-[1.02]" 
                  : "bg-white dark:bg-card border-border hover:border-primary/40 text-foreground"
              )}
            >
              <div className="relative z-10 flex flex-col gap-4">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-colors", currencyChoice === 'STAR' ? "bg-white/20" : "bg-yellow-500/10")}>
                  <Star className={cn("h-6 w-6", currencyChoice === 'STAR' ? "text-white" : "text-yellow-500 fill-current")} />
                </div>
                <div>
                  <p className={cn("text-2xl font-black tabular-nums tracking-tighter", currencyChoice === 'STAR' ? "text-white" : "text-foreground")}>{pricing.star.toLocaleString()} S</p>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest", currencyChoice === 'STAR' ? "text-white/60" : "text-muted-foreground")}>Community Pulse</p>
                </div>
              </div>
              <ChevronRight className={cn("absolute bottom-6 right-6 h-5 w-5 transition-opacity", currencyChoice === 'STAR' ? "opacity-100" : "opacity-0")} />
            </button>
          </div>
        </section>

        {/* Terms & Warning */}
        <div className="bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-500" />
            <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600">Temporal Validity</h4>
          </div>
          <p className="text-xs font-bold text-amber-600/80 leading-relaxed uppercase tracking-tighter">
            YOUR SIGNATURE WILL REMAIN ACTIVE FOR EXACTLY 30 DAYS FROM THIS HANDSHAKE. AFTER EXPIRY, YOUR PROFILE WILL LOSE THE VERIFICATION PULSE UNTIL RENEWAL.
          </p>
        </div>

        {/* Activation Button */}
        <div className="space-y-4 pt-4 pb-20">
          <Button 
            className={cn(
              "w-full h-16 rounded-[1.75rem] font-black italic uppercase tracking-[0.3em] text-lg shadow-2xl transition-all active:scale-[0.98]",
              hasBalance && !isVerifying && isEmailPulseActive
                ? "bg-primary text-white shadow-primary/20 hover:translate-y-[-2px] hover:shadow-primary/30" 
                : "bg-secondary text-muted-foreground/40 cursor-not-allowed"
            )}
            disabled={!hasBalance || isVerifying || currentUser.isVerified || !isEmailPulseActive}
            onClick={handleVerificationRequest}
          >
            {isVerifying ? (
              <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> AUDITING PROTOCOL...</>
            ) : currentUser.isVerified ? (
              <><CheckCircle2 className="mr-3 h-6 w-6" /> PROTOCOL ACTIVE</>
            ) : !isEmailPulseActive ? (
              <><Mail className="mr-3 h-6 w-6" /> SYNC EMAIL FIRST</>
            ) : (
              <><Zap className="mr-3 h-6 w-6" /> GET VERIFIED</>
            )}
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-muted-foreground/40 font-bold text-[9px] uppercase tracking-widest">
            <ShieldCheck className="h-3 w-3" /> 
            Groq AI Audited • End-to-End Encrypted
          </div>
        </div>

      </main>
    </div>
  );
}
