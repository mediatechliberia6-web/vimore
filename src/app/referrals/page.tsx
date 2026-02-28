"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, 
  Star, 
  Users, 
  Copy, 
  Share2, 
  Zap, 
  ChevronRight, 
  Trophy,
  History,
  Sparkles,
  CheckCircle2,
  Rocket,
  Plus,
  MessageSquare,
  Globe,
  Award,
  Crown,
  TrendingUp,
  Volume2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useNotifications } from "@/context/NotificationContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const LEADERBOARD = [
  { rank: 1, name: "Neon Architect", username: "neon_arch", referrals: 142, avatar: "https://picsum.photos/seed/leader1/100/100", isVip: true },
  { rank: 2, name: "Sarah Chen", username: "schen_dev", referrals: 89, avatar: "https://picsum.photos/seed/2/100/100" },
  { rank: 3, name: "Marcus Stone", username: "mstone", referrals: 64, avatar: "https://picsum.photos/seed/3/100/100" },
];

const MILESTONES = [
  { id: "m1", label: "Star Pioneer", count: 1, icon: Star, color: "text-blue-400" },
  { id: "m2", label: "Network King", count: 5, icon: Crown, color: "text-amber-400" },
  { id: "m3", label: "Ambassador", count: 10, icon: Award, color: "text-primary" },
];

const MOCK_HISTORY = [
  { id: "h1", name: "Alex Rivera", username: "arivera", time: "2h ago", avatar: "https://picsum.photos/seed/1/100/100" },
  { id: "h2", name: "Paul Node", username: "paul", time: "Yesterday", avatar: "https://picsum.photos/seed/paul/100/100" },
];

interface StarParticle {
  id: number;
  width: string;
  height: string;
  top: string;
  left: string;
  opacity: number;
  duration: string;
  delay: string;
}

export default function ReferralHub() {
  const { currentUser, referralLink, triggerHaptic, triggerReferralPulse } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const { addSignal } = useNotifications();
  const { toast } = useToast();
  
  const [isCopied, setIsCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [customMessage, setCustomMessage] = useState("Join me on ViMore! Sync your digital signature and let's build the cluster together. 🚀");
  const [displayedReferrals, setDisplayedReferrals] = useState(0);
  const [displayedStars, setDisplayedStars] = useState(0);
  const [stars, setStars] = useState<StarParticle[]>([]);

  const isPlayerActive = currentTrack && !isExpanded;

  // Star Particles Generator (Client Side Only)
  useEffect(() => {
    const generatedStars = [...Array(20)].map((_, i) => ({
      id: i,
      width: Math.random() * 3 + 'px',
      height: Math.random() * 3 + 'px',
      top: Math.random() * 100 + '%',
      left: Math.random() * 100 + '%',
      opacity: Math.random() * 0.5,
      duration: (Math.random() * 3 + 2) + 's',
      delay: (Math.random() * 5) + 's'
    }));
    setStars(generatedStars);
  }, []);

  // Star Ting Sound Effect
  const playStarSound = () => {
    const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  // Rollup Stats Effect
  useEffect(() => {
    const targetRef = currentUser.referralCount || 0;
    const targetStars = currentUser.starBalance || 0;
    
    const interval = setInterval(() => {
      setDisplayedReferrals(prev => {
        if (prev < targetRef) return prev + 1;
        return targetRef;
      });
      setDisplayedStars(prev => {
        if (prev < targetStars) {
          const step = Math.ceil((targetStars - prev) / 10);
          return prev + step;
        }
        return targetStars;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentUser.referralCount, currentUser.starBalance]);

  // Handle successful handshake (Confetti + Sound)
  useEffect(() => {
    if (currentUser.starBalance! > 0) {
      playStarSound();
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      addSignal({
        type: 'SOCIAL',
        title: 'New Node Materialized',
        content: 'A friend joined via your node! **+5,000 Stars ⭐** and a new follower synced.',
        avatar: `https://picsum.photos/seed/${Date.now()}/100/100`
      });
    }
  }, [currentUser.referralCount]);

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
        text: customMessage,
        url: referralLink,
      });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#050505] transition-colors duration-300 overflow-x-hidden relative">
      
      {/* Particle & Aurora Engine */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full animate-pulse delay-700" />
        
        {/* CSS Star Particles */}
        {stars.map((star) => (
          <div 
            key={star.id}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: star.width,
              height: star.height,
              top: star.top,
              left: star.left,
              opacity: star.opacity,
              animationDuration: star.duration,
              animationDelay: star.delay
            }}
          />
        ))}
      </div>

      {/* Confetti Overlay */}
      {showConfetti && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i}
              className="absolute text-2xl animate-bounce"
              style={{
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                transform: `rotate(${Math.random() * 360}deg)`,
                animationDuration: (Math.random() * 1 + 0.5) + 's'
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/menu">
            <button className="p-2 rounded-full hover:bg-secondary/80 active:scale-90 transition-all">
              <ArrowLeft className="h-6 w-6" />
            </button>
          </Link>
          <div className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                <path d="M3 7L10 19L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 15L17 7L21 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-none">Star Network</h1>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Global Ambassador</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 border border-primary/20 rounded-full px-3 py-1 flex items-center gap-2">
            <Award className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Level 1</span>
          </div>
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
        
        {/* Pulse Dashboard with Animated Rolling Numbers */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-card rounded-[2rem] p-6 shadow-xl border border-primary/5 flex flex-col items-center text-center gap-2 group transition-all hover:-translate-y-1">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <span className="text-3xl font-black italic uppercase tracking-tighter leading-none tabular-nums">{displayedReferrals}</span>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nodes Referred</p>
            </div>
          </div>
          <div className="bg-white dark:bg-card rounded-[2rem] p-6 shadow-xl border border-primary/5 flex flex-col items-center text-center gap-2 group transition-all hover:-translate-y-1">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <div className="space-y-0.5">
              <span className="text-3xl font-black italic uppercase tracking-tighter leading-none tabular-nums">{displayedStars.toLocaleString()}</span>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Stars Earned</p>
            </div>
          </div>
        </section>

        {/* Milestone Badges System */}
        <section className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 rounded-[2rem] p-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 text-center">Ambassador Achievements</h3>
          <div className="flex justify-around items-center">
            {MILESTONES.map((m) => {
              const isLocked = (currentUser.referralCount || 0) < m.count;
              return (
                <div key={m.id} className={cn(
                  "flex flex-col items-center gap-2 transition-all duration-500",
                  isLocked ? "opacity-30 grayscale scale-90" : "opacity-100 scale-110"
                )}>
                  <div className={cn("h-14 w-14 rounded-full flex items-center justify-center border-2 border-dashed relative", !isLocked && "border-solid bg-white dark:bg-card shadow-lg ring-4 ring-primary/5")}>
                    <m.icon className={cn("h-6 w-6", m.color)} />
                    {!isLocked && <div className="absolute -top-1 -right-1 bg-green-500 text-white p-0.5 rounded-full"><CheckCircle2 className="h-3 w-3" /></div>}
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-center max-w-[60px] leading-tight">{m.label}</span>
                </div>
              );
            })}
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

                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <MessageSquare className="h-3.5 w-3.5 text-white/60" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Customize Invite</span>
                  </div>
                  <Textarea 
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="bg-black/20 border-white/10 rounded-2xl text-white text-xs font-medium placeholder:text-white/30 resize-none min-h-[80px]"
                  />
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

        {/* Invite Preview Hub */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Globe className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-black italic uppercase tracking-widest">Network Preview</h3>
          </div>
          <div className="bg-white dark:bg-card border border-border rounded-[2rem] p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex gap-4">
              <div className="relative h-20 w-20 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                <Image src={currentUser.avatar} alt="Preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">Incoming Node Invite</span>
                  <Badge variant="secondary" className="text-[8px] bg-secondary/50 font-bold">vimore.appwrite.network</Badge>
                </div>
                <h4 className="font-bold text-sm leading-tight">Join {currentUser.name} on the ViMore network!</h4>
                <p className="text-[11px] text-muted-foreground line-clamp-2 italic">"{customMessage}"</p>
              </div>
            </div>
          </div>
        </section>

        {/* Global Leaderboard Hub */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-black italic uppercase tracking-widest">Top Networkers</h3>
            </div>
            <Button variant="link" className="text-[10px] font-black uppercase p-0 h-auto">View Full Pulse</Button>
          </div>
          <div className="bg-white dark:bg-card border border-primary/10 rounded-[2.5rem] overflow-hidden shadow-xl">
            <div className="divide-y divide-border">
              {LEADERBOARD.map((user) => (
                <div key={user.rank} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-center text-lg font-black italic text-muted-foreground/40">0{user.rank}</span>
                    <Avatar className="h-10 w-10 border border-primary/10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold">{user.name}</span>
                        {user.isVip && <CheckCircle2 className="h-3 w-3 text-primary fill-primary text-white" />}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">@{user.username}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-black italic text-primary">{user.referrals}</span>
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Nodes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Network History */}
        <section className="space-y-4 pb-20">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-black italic uppercase tracking-widest flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Handshake History
            </h3>
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
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-500 fill-current" />
                    <span className="text-[10px] font-black text-green-500 uppercase">+5,000</span>
                  </div>
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
