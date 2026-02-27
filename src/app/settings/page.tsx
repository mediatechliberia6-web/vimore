"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Zap, 
  Volume2, 
  Smartphone, 
  Moon, 
  Sun, 
  EyeOff, 
  Monitor, 
  Download, 
  Type, 
  ChevronRight,
  ShieldCheck,
  BellOff,
  Database,
  RefreshCcw,
  Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SettingsPage() {
  const { settings, updateSettings, triggerHaptic, currentUser } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const [isSyncing, setIsSyncing] = useState(false);

  const isPlayerActive = currentTrack && !isExpanded;

  const handleSync = () => {
    setIsSyncing(true);
    triggerHaptic(50);
    setTimeout(() => {
      setIsSyncing(false);
    }, 2000);
  };

  const handleUpdate = (data: any) => {
    triggerHaptic(10);
    updateSettings(data);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#050505] transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/menu">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/80 active:scale-90 transition-all">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-black italic uppercase tracking-tighter text-foreground">System Core</h1>
            <div className="flex items-center gap-1.5">
              <div className={cn("h-1.5 w-1.5 rounded-full", isSyncing ? "bg-primary animate-ping" : "bg-green-500")} />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {isSyncing ? "Syncing Nodes..." : "Status: Optimal"}
              </span>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[10px] font-black uppercase tracking-widest text-primary gap-2"
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? <RefreshCcw className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3" />}
          Manual Sync
        </Button>
      </header>

      <main className={cn(
        "max-w-2xl mx-auto p-4 sm:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500",
        isPlayerActive ? "pt-[80px]" : "pt-4"
      )}>
        
        {/* Category: Identity Node */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Identity & Signature</h3>
          <div className="bg-white dark:bg-card rounded-[2rem] border border-border shadow-xl shadow-black/5 overflow-hidden">
            <Link href="/profile" className="flex items-center justify-between p-6 hover:bg-secondary/20 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-black italic uppercase tracking-tighter text-lg">{currentUser.name}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Edit Public Digital Workspace</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground opacity-40" />
            </Link>
            <div className="h-px bg-border mx-6" />
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold text-sm">Ghost Node Mode</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Hide your online pulse and browsing footprint</p>
                </div>
                <Switch 
                  checked={settings.isGhostMode} 
                  onCheckedChange={(val) => handleUpdate({ isGhostMode: val })}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Category: Performance Node */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Pulse & Performance</h3>
          <div className="bg-white dark:bg-card rounded-[2rem] border border-border shadow-xl shadow-black/5 p-6 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <p className="font-bold text-sm">Haptic Intensity</p>
                </div>
                <Badge variant="secondary" className="text-[9px] font-black uppercase">{settings.hapticIntensity}%</Badge>
              </div>
              <Slider 
                value={[settings.hapticIntensity]} 
                max={100} 
                step={1} 
                onValueChange={(val) => updateSettings({ hapticIntensity: val[0] })}
                onValueCommit={() => triggerHaptic(settings.hapticIntensity / 2)}
              />
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Adjust the vibration pulse for every interaction</p>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" />
                  <p className="font-bold text-sm">Pro HD Streaming</p>
                </div>
                <p className="text-[10px] text-muted-foreground uppercase font-black">Force high-fidelity 4K video nodes</p>
              </div>
              <Switch 
                checked={settings.playbackQuality === 'pro-hd'} 
                onCheckedChange={(val) => handleUpdate({ playbackQuality: val ? 'pro-hd' : 'standard' })}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </section>

        {/* Category: System Node */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Visual Core</h3>
          <div className="bg-white dark:bg-card rounded-[2rem] border border-border shadow-xl shadow-black/5 p-6 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-[#6E96FF]" />
                  <p className="font-bold text-sm">Font Scaling</p>
                </div>
                <Badge variant="secondary" className="text-[9px] font-black uppercase">{Math.round(settings.fontScale * 100)}%</Badge>
              </div>
              <Slider 
                value={[settings.fontScale]} 
                min={0.8} 
                max={1.4} 
                step={0.05} 
                onValueChange={(val) => handleUpdate({ fontScale: val[0] })}
              />
              <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Scale text across the entire cluster</p>
            </div>
          </div>
        </section>

        <section className="pt-10 pb-20">
          <Button 
            variant="outline" 
            className="w-full h-14 rounded-2xl border-destructive/20 text-destructive font-black italic uppercase tracking-widest text-[10px] hover:bg-destructive/5"
            onClick={() => triggerHaptic(100)}
          >
            Purge Local Cache & Sign Out
          </Button>
          <p className="text-center text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-6">
            ViMore Node v1.5.0-HighVelocity
          </p>
        </section>

      </main>
    </div>
  );
}
