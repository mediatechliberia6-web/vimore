
"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  Zap, 
  Coins, 
  Gem, 
  Star, 
  Rocket, 
  Music2, 
  Users, 
  ShieldCheck, 
  TrendingUp, 
  EyeOff, 
  CheckCircle2, 
  ChevronRight,
  Info,
  BookOpen,
  Sparkles,
  Clapperboard,
  Lock,
  Globe,
  Smartphone,
  Mic2,
  Download,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/context/LanguageContext";
import { usePosts } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BannerAdNode } from "@/components/ad/banner-ad-node";
import { NativeAdNode } from "@/components/ad/native-ad-node";

interface ProtocolCardProps {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  color: string;
  bg: string;
  details: string[];
}

export function ProtocolCard({ title, subtitle, description, icon: Icon, color, bg, details }: ProtocolCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { triggerHaptic } = usePosts();

  const toggle = () => {
    triggerHaptic(5);
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      className={cn(
        "group bg-white dark:bg-card border-2 transition-all duration-500 rounded-[2.5rem] overflow-hidden",
        isExpanded ? "border-primary shadow-2xl shadow-primary/10" : "border-primary/5 hover:border-primary/20 shadow-sm"
      )}
    >
      <button 
        onClick={toggle}
        className="w-full p-6 sm:p-8 flex items-start gap-6 text-left"
      >
        <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", bg, color)}>
          <Icon className="h-7 w-7" />
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between">
            <span className={cn("text-[10px] font-black uppercase tracking-[0.3em]", color)}>{subtitle}</span>
            <ChevronRight className={cn("h-5 w-5 text-muted-foreground/40 transition-transform duration-500", isExpanded && "rotate-90 text-primary")} />
          </div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter">{title}</h3>
          <p className="text-sm text-muted-foreground font-medium leading-relaxed">{description}</p>
        </div>
      </button>

      {isExpanded && (
        <div className="px-8 pb-8 pt-2 animate-in slide-in-from-top-4 duration-500">
          <div className="h-px bg-primary/5 mb-6" />
          <ul className="space-y-4">
            {details.map((detail, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className={cn("mt-1.5 h-1.5 w-1.5 rounded-full shrink-0", color)} />
                <p className="text-[13px] font-bold text-foreground/80 uppercase tracking-tight leading-relaxed">{detail}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function HowItWorks() {
  const { t } = useTranslation();
  const { triggerHaptic } = usePosts();

  const protocols = [
    {
      id: "energy",
      title: t('how_energy_title'),
      subtitle: "The Financial Node",
      description: t('how_energy_desc'),
      icon: Coins,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      details: [
        "STARS: Earned through successful referral handshakes. Stars represent your influence and community growth pulse.",
        "GOLD: The standard fuel for content interactions. Used to unlock 'Locked Nodes' and send digital gifts to rising creators.",
        "DIAMONDS: Premium crystalline energy. Required for high-value gifting and materializing 'Premium Loop' subscriptions."
      ]
    },
    {
      id: "content",
      title: t('how_content_title'),
      subtitle: "The Vibe Logic",
      description: t('how_content_desc'),
      icon: Rocket,
      color: "text-primary",
      bg: "bg-primary/10",
      details: [
        "DISCOVERY STREAM: A high-velocity feed tuned by Groq AI engaging heuristics to show you the best vibes across the network.",
        "VIBE STREAM (REELS): Immersive, full-screen vertical synchronization designed for deep-level connection with creators.",
        "LOCKED NODES: Creators can protect exclusive vibes behind a Gold energy gate, rewarding high-fidelity contributors."
      ]
    },
    {
      id: "sonic",
      title: t('how_sonic_title'),
      subtitle: "The Audio Handshake",
      description: t('how_sonic_desc'),
      icon: Music2,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      details: [
        "SONIC SIGNATURE: Every node can upload a 10-second audio identity that pulses when users visit their digital workspace.",
        "MUSIC NOTES: Use the 'Binary Handshake' to archive tracks to your device hardware for high-fidelity playback even when off-grid.",
        "SONIC STUDIO: A specialized flow for artists to publish singles, albums, and curated playlists to the global cluster."
      ]
    },
    {
      id: "social",
      title: t('how_social_title'),
      subtitle: "Community Sync",
      description: t('how_social_desc'),
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      details: [
        "HANDSHAKES: When two nodes follow each other, a 'Mutual Pulse' is established, unlocking deeper messaging capabilities.",
        "CLUSTERS: Specialized group nodes for team collaboration, high-speed media sharing, and collective vibe synchronization.",
        "LEGACY HANDSHAKE: Designate a trusted node to manage your digital signature and vault assets if your primary pulse goes offline."
      ]
    },
    {
      id: "economy",
      title: t('how_economy_title'),
      subtitle: "Economic Logic",
      description: t('how_economy_desc'),
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-500/10",
      details: [
        "THE 70/30 SPLIT: Creators receive exactly 70% of all monetized pulses. The remaining 30% maintains the MTL high-fidelity clusters.",
        "WITHDRAWAL PORTAL: Convert your vault energy (Gold/Diamonds) into real assets via secure Orange/MTN MoMo handshakes.",
        "GROQ AI AUDIT: Every financial pulse is verified by our AI auditor node to ensure system integrity and prevent fraudulent handshakes."
      ]
    },
    {
      id: "integrity",
      title: t('how_integrity_title'),
      subtitle: "Safety Protocols",
      description: t('how_integrity_desc'),
      icon: ShieldCheck,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      details: [
        "GHOST NODE: Move through the network without leaving a spatial trace. Your active status and read receipts will be neutralized.",
        "SENSITIVITY FILTER: Potential high-intensity visuals are materialized with a blur handshake until you manually reveal them.",
        "ADMINISTRATIVE PURGE: Breaking the social contract results in an immediate severance of your identity node from the network."
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F2ECF7] dark:bg-[#050505] transition-colors duration-500 relative overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none -z-10">
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
            <h1 className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-none">{t('how_title')}</h1>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">Network Manual</span>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black uppercase px-2 h-5">v1.5.0-SYNC</Badge>
      </header>

      <main className="max-w-3xl mx-auto p-6 sm:p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
        
        <section className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary shadow-xl shadow-primary/5">
              <BookOpen className="h-10 w-10" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter">{t('how_subtitle')}</h2>
            <p className="text-muted-foreground text-sm font-medium max-w-lg mx-auto leading-relaxed">
              {t('how_desc')}
            </p>
          </div>
        </section>

        {/* Standard Global Ad Pulse */}
        <NativeAdNode type="standard" />

        {/* Banner Ad Integration */}
        <BannerAdNode />

        <section className="space-y-6">
          {protocols.map((p) => (
            <ProtocolCard key={p.id} {...p} />
          ))}
        </section>

        <section className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="h-48 w-48" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-black italic uppercase tracking-widest">Master Handshake</h3>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed font-medium uppercase tracking-tight">
              ViMore is more than an application; it is a spatial handshake between technology and community. By participating in this network, you agree to uphold the integrity of the cluster and contribute to the collective high-velocity vibe.
            </p>
            <div className="pt-4 border-t border-primary/10">
              <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em] mb-1">Architecture by</p>
              <p className="text-sm font-black italic uppercase tracking-widest">{t('branding_mtl')}</p>
            </div>
          </div>
        </section>

        <footer className="pt-10 flex flex-col items-center gap-6 opacity-40">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-1">{t('branding_amos')}</span>
              <span className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground">Founder & CEO</span>
            </div>
            <div className="w-px h-6 bg-primary/20" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest checkbox-none leading-none mb-1">{t('branding_aaron')}</span>
              <span className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground">Co-founder & President</span>
            </div>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground">ViMore Logic v1.5.0 • MTL Core</p>
        </footer>

      </main>
    </div>
  );
}
