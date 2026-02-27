"use client";

import { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Star, 
  Users, 
  Copy, 
  Share2, 
  Zap, 
  ChevronRight, 
  Globe, 
  ShieldCheck, 
  Trophy,
  History,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  Rocket,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useNotifications } from "@/context/NotificationContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const MOCK_HISTORY = [
  { id: "h1", name: "Alex Rivera", username: "arivera", time: "2h ago", avatar: "https://picsum.photos/seed/1/100/100" },
  { id: "h2", name: "Sarah Chen", username: "schen_dev", time: "Yesterday", avatar: "https://picsum.photos/seed/2/100/100" },
  { id: "h3", name: "Marcus Stone", username: "mstone", time: "3 days ago", avatar: "https://picsum.photos/seed/3/100/100" },
];

export default function ReferralHub() {
  const { currentUser, referralLink, triggerHaptic, triggerReferralPulse } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const { addSignal } = useNotifications();
  const { toast } = useToast();
  
  const [isCopied, setIsCopied] = useState(false);
  const isPlayerActive = currentTrack && !isExpanded;

  const handleCopyLink = () => {
    triggerHaptic(15);
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    toast({
      title: "Node Synced!",
      description: "Referral link copied to your digital clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleShare = () => {
    triggerHaptic(10);
    if (navigator.share) {
      navigator.share({
        title: 'Join me on ViMore',
        text: 'Sync your digital signature on ViMore and earn stars! 🚀',
        url: referralLink,
      });
    } else {
      handleCopyLink();
    }
  };

  const simulateHandshake = () => {
    // Phase 4: Incentive Engine Test
    triggerReferralPulse();
    
    addSignal({
      type: 'SOCIAL',
      title: 'New Node Materialized',
      content: 'A friend joined via your node! **+5,000 Stars ⭐** and a new follower synced.',
      avatar: `https://picsum.photos/seed/${Date.now()}/100/100`
    });

    toast({
      title: "Handshake Successful",
      description: "5,000 ⭐ Reward materializing in your vault.",
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#050505] transition-colors duration-300 overflow-x-hidden">
      {/* Aurora Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/menu">
            <button className="p-2 rounded-full hover:bg-secondary/80 active:scale-90 transition-all">
              <ArrowLeft className="h-6 w-6" />
            </button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-none">Star Network</h1>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Growth Hub</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-black uppercase text-[10px] h-7 px-3">
            Ambassador
          </Badge>
          <Avatar className="h-9 w-9 border-2 border-primary/10">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <main className={cn(
        "max-w-2xl mx-auto p-4 sm:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500",
        isPlayerActive ? "pt-[80px]" : "pt-4"
      )}>
        
        {/* Pulse Dashboard */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-card rounded-[2rem] p-6 shadow-xl border border-primary/5 flex flex-col items-center text-center gap-2 group transition-all hover:-translate-y-1">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <span className="text-3xl font-black italic uppercase tracking-tighter leading-none">{currentUser.referralCount || 0}</span>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nodes Referred</p>
            </div>
          </div>
          <div className="bg-white dark:bg-card rounded-[2rem] p-6 shadow-xl border border-primary/5 flex flex-col items-center text-center gap-2 group transition-all hover:-translate-y-1">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <div className="space-y-0.5">
              <span className="text-3xl font-black italic uppercase tracking-tighter leading-none">{(currentUser.starBalance || 0).toLocaleString()}</span>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Stars Earned</p>
            </div>
          </div>
        </section>

        {/* The Command Card */}
        <section className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-accent rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 blur-[80px] rounded-full animate-pulse delay-1000" />
            
            <div className="relative z-10 space-y-8">
              <div className="space-y-3">
                <Badge className="bg-white/20 hover:bg-white/30 text-[10px] font-black uppercase tracking-widest border-none px-4 py-1.5 rounded-full">
                  Your Unique Sharing Node
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-black italic uppercase tracking-tighter leading-tight drop-shadow-lg">
                  Expand the Cluster,<br />Earn Star Pulses.
                </h2>
                <p className="text-white/80 text-sm font-medium max-w-sm">
                  Receive 5,000 Stars ⭐ for every successful handshake. Friends will follow you automatically upon entry.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black uppercase text-white/40 mb-1 ml-1">Spatial Link</p>
                    <p className="text-sm font-bold truncate">{referralLink}</p>
                  </div>
                  <button 
                    onClick={handleCopyLink}
                    className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center transition-all active:scale-90",
                      isCopied ? "bg-green-500 text-white" : "bg-white text-primary"
                    )}
                  >
                    {isCopied ? <CheckCircle2 className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                  </button>
                </div>

                <Button 
                  onClick={handleShare}
                  className="w-full h-14 bg-white text-primary hover:bg-zinc-100 rounded-2xl font-black italic uppercase tracking-widest text-base shadow-2xl transition-all active:scale-[0.98]"
                >
                  <Share2 className="mr-3 h-5 w-5" /> Launch Invite
                </Button>
              </div>
            </div>
            <Rocket className="absolute -right-8 -bottom-8 h-48 w-48 opacity-10 rotate-[-15deg] group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-1000" />
          </div>
        </section>

        {/* Milestone Tracker Preview */}
        <section className="bg-white dark:bg-card rounded-[2rem] p-6 shadow-xl border border-primary/5 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" /> Ambassador Progress
            </h3>
            <span className="text-[10px] font-black text-primary uppercase">Next: 10 Referrals</span>
          </div>
          <div className="space-y-3">
            <div className="h-3 w-full bg-secondary/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 shadow-[0_0_10px_rgba(153,64,229,0.5)]" 
                style={{ width: `${Math.min(((currentUser.referralCount || 0) / 10) * 100, 100)}%` }} 
              />
            </div>
            <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <span>{currentUser.referralCount || 0} Synced</span>
              <span>10 Total</span>
            </div>
          </div>
        </section>

        {/* Network History */}
        <section className="space-y-4 pb-20">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black italic uppercase tracking-widest flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Handshake History
            </h3>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 rounded-full font-black uppercase text-[9px] gap-1.5 border-primary/20 text-primary"
              onClick={simulateHandshake}
            >
              <Plus className="h-3 w-3" /> Simulate Handshake
            </Button>
          </div>
          
          <div className="space-y-3">
            {MOCK_HISTORY.map((node, i) => (
              <div 
                key={node.id}
                className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 p-4 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-bottom-2"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border border-primary/10">
                    <AvatarImage src={node.avatar} />
                    <AvatarFallback>{node.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{node.name}</span>
                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">@{node.username}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-green-500 uppercase">+5,000 ⭐</span>
                  <span className="text-[9px] text-muted-foreground uppercase font-bold">{node.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
