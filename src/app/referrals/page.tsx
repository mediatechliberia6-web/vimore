
"use client";

import { useState, useEffect, useCallback } from "react";
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
  X,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useNotifications } from "@/context/NotificationContext";
import { useTranslation } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

const MOCK_LEADERBOARD = [
  { rank: 1, name: "Amos B. Kortu", username: "amos_mtl", referrals: 142, avatar: "https://picsum.photos/seed/amos/100/100", isVip: true },
  { rank: 2, name: "Sarah Chen", username: "schen_dev", referrals: 89, avatar: "https://picsum.photos/seed/2/100/100", isVip: true },
  { rank: 3, name: "Alex Rivera", username: "arivera", referrals: 64, avatar: "https://picsum.photos/seed/1/100/100", isVip: true },
  { rank: 4, name: "Marcus Stone", username: "mstone", referrals: 42, avatar: "https://picsum.photos/seed/3/100/100", isVip: false },
];

const MOCK_HISTORY = [
  { id: 'h1', name: "John Doe", username: "jdoe", time: "Today", avatar: "https://picsum.photos/seed/jdoe/100/100" },
  { id: 'h2', name: "Jane Smith", username: "jsmith", time: "Yesterday", avatar: "https://picsum.photos/seed/jsmith/100/100" }
];

export default function ReferralHub() {
  const { currentUser, referralLink, triggerHaptic } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const { addSignal } = useNotifications();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [isCopied, setIsCopied] = useState(false);
  const [displayedReferrals, setDisplayedReferrals] = useState(0);
  const [displayedStars, setDisplayedStars] = useState(0);
  const [stars, setStars] = useState<StarParticle[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const isPlayerActive = currentTrack && !isExpanded;

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

  useEffect(() => {
    const targetRef = currentUser.referralCount || 0;
    const targetStars = currentUser.starBalance || 0;
    const interval = setInterval(() => {
      setDisplayedReferrals(prev => prev < targetRef ? prev + 1 : targetRef);
      setDisplayedStars(prev => {
        if (prev < targetStars) {
          const step = Math.ceil((targetStars - prev) / 10);
          return Math.min(prev + step, targetStars);
        }
        return targetStars;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [currentUser.referralCount, currentUser.starBalance]);

  const handleCopyLink = () => {
    triggerHaptic(15);
    navigator.clipboard.writeText(referralLink);
    setIsCopied(true);
    toast({ title: "Node Synced!", description: "Referral link copied to clipboard." });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#050505] transition-colors duration-300 overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full animate-pulse delay-700" />
        {stars.map((star) => (
          <div key={star.id} className="absolute bg-white rounded-full animate-pulse" style={{ width: star.width, height: star.height, top: star.top, left: star.left, opacity: star.opacity, animationDuration: star.duration, animationDelay: star.delay }} />
        ))}
      </div>

      <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/menu"><button className="p-2 rounded-full hover:bg-secondary/80 active:scale-90 transition-all"><ArrowLeft className="h-6 w-6" /></button></Link>
          <div className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white"><Star className="w-2/3 h-2/3 fill-current" /></div>
            <div className="flex flex-col">
              <h1 className="text-lg font-black italic uppercase tracking-tighter text-foreground">{t('star_network')}</h1>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">{t('star_ambassador')}</span>
            </div>
          </div>
        </div>
        <Avatar className="h-9 w-9 border-2 border-primary/10"><AvatarImage src={currentUser.avatar} /></Avatar>
      </header>

      <main className={cn("max-w-xl mx-auto p-4 sm:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500", isPlayerActive ? "pt-[80px]" : "pt-4")}>
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-card rounded-[2rem] p-6 shadow-xl border border-primary/5 flex flex-col items-center text-center gap-2 transition-all hover:-translate-y-1">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Users className="h-6 w-6" /></div>
            <div className="space-y-0.5">
              <span className="text-3xl font-black italic uppercase tracking-tighter leading-none tabular-nums">{displayedReferrals}</span>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('star_nodes_referred')}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-card rounded-[2rem] p-6 shadow-xl border border-primary/5 flex flex-col items-center text-center gap-2 transition-all hover:-translate-y-1">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500"><Star className="h-6 w-6 fill-current" /></div>
            <div className="space-y-0.5">
              <span className="text-3xl font-black italic uppercase tracking-tighter leading-none tabular-nums">{displayedStars.toLocaleString()}</span>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('star_earned')}</p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="bg-gradient-to-br from-primary to-accent rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full animate-pulse" />
            <div className="relative z-10 space-y-8">
              <div className="space-y-3">
                <Badge className="bg-white/20 text-[10px] font-black uppercase tracking-widest border-none px-4 py-1.5 rounded-full">Your Referral Signature</Badge>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-tight drop-shadow-lg">Expand the Cluster,<br />Earn Star Pulses.</h2>
                <p className="text-white/80 text-sm font-medium max-w-sm">Receive 5,000 Stars ⭐ for every successful handshake. Friends will follow you automatically upon entry.</p>
              </div>
              <div className="space-y-4">
                <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <p className="text-sm font-bold truncate flex-1">{referralLink}</p>
                  <button onClick={handleCopyLink} className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-all", isCopied ? "bg-green-500" : "bg-white text-primary")}>{isCopied ? <CheckCircle2 className="h-6 w-6 text-white" /> : <Copy className="h-6 w-6" />}</button>
                </div>
                <Button className="w-full h-14 bg-white text-primary hover:bg-zinc-100 rounded-2xl font-black italic uppercase tracking-widest text-base shadow-2xl transition-all active:scale-[0.98]"><Share2 className="mr-3 h-5 w-5" /> {t('star_invite_launch')}</Button>
              </div>
            </div>
            <Rocket className="absolute -right-8 -bottom-8 h-48 w-48 opacity-10 rotate-[-15deg]" />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-black italic uppercase tracking-widest flex items-center gap-2"><TrendingUp className="h-4 w-4 text-amber-500" /> {t('star_top_networkers')}</h3>
          <div className="bg-white dark:bg-card border border-primary/10 rounded-[2.5rem] overflow-hidden shadow-xl">
            <div className="divide-y divide-border">
              {MOCK_LEADERBOARD.map((user) => (
                <div key={user.username} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="w-6 text-center text-lg font-black italic text-muted-foreground/40">{user.rank.toString().padStart(2, '0')}</span>
                    <Avatar className="h-10 w-10 border border-primary/10"><AvatarImage src={user.avatar} /></Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1"><span className="text-sm font-bold">{user.name}</span>{user.isVip && <CheckCircle2 className="h-3 w-3 text-primary fill-primary text-white" />}</div>
                      <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">@{user.username}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end"><span className="text-sm font-black italic text-primary">{user.referrals}</span><span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Nodes</span></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4 pb-20">
          <h3 className="text-sm font-black italic uppercase tracking-widest flex items-center gap-2"><History className="h-4 w-4 text-primary" /> {t('earn_recent_history')}</h3>
          <div className="space-y-3">
            {MOCK_HISTORY.map((node) => (
              <div key={node.id} className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border border-primary/10"><AvatarImage src={node.avatar} /></Avatar>
                  <div className="flex flex-col"><span className="text-sm font-bold">{node.name}</span><span className="text-[10px] text-muted-foreground font-black uppercase">@{node.username}</span></div>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1"><Star className="h-3 w-3 text-amber-500 fill-current" /><span className="text-[10px] font-black text-green-500">+5,000</span></div>
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
