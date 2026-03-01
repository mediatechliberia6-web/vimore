"use client";

import { useState, useMemo, useEffect } from "react";
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
  Languages,
  Fingerprint,
  UserCheck,
  Users2,
  Trash2,
  Lock,
  Globe,
  MoreVertical,
  HardDrive,
  Archive,
  ArrowDownToLine,
  Activity,
  Music2,
  Video,
  Loader2,
  Bell,
  Clock,
  Radio,
  Sparkles,
  Trophy,
  UserPlus,
  Rocket,
  Search,
  CheckCircle2,
  Gem,
  X,
  ShieldAlert,
  KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  const { settings, updateSettings, triggerHaptic, currentUser, connections, posts, savedPostIds, activeSubscriptions, cancelSubscription } = usePosts();
  const { currentTrack, isExpanded, downloadedSongIds, userSongs } = useMusic();
  const { toast } = useToast();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isLegacySelectorOpen, setIsLegacySelectorOpen] = useState(false);
  const [legacySearch, setLegacySearch] = useState("");

  const isPlayerActive = currentTrack && !isExpanded;

  const handleSync = () => {
    setIsSyncing(true);
    triggerHaptic(50);
    setTimeout(() => {
      setIsSyncing(false);
      toast({ title: "System Balanced", description: "All digital nodes and identity pulses are now synchronized." });
    }, 2500);
  };

  const handleArchive = () => {
    setIsArchiving(true);
    triggerHaptic(100);
    toast({ title: "Archive Initiated", description: "Compiling your digital footprint into a secure node..." });
    
    setTimeout(() => {
      setIsArchiving(false);
      const data = { meta: { version: "1.5.0-HighVelocity", timestamp: new Date().toISOString(), cluster: "ViMore-Node-Spatial" }, identity: currentUser, handshakes: connections.map(c => ({ username: c.username, followsYou: c.followsYou })), preferences: settings, vault: { savedPosts: Array.from(savedPostIds), downloadedSongs: Array.from(downloadedSongIds) }, discography: userSongs.map(s => ({ title: s.title, artist: s.artist })) };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vimore_archive_${currentUser.username}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: "Archive Materialized", description: "Identity node download complete." });
    }, 3500);
  };

  const handleUpdate = (data: any) => { triggerHaptic(10); updateSettings(data); };

  const handleTotalPurge = () => {
    triggerHaptic(150);
    if (confirm("CRITICAL: Initiate Total System Purge? This will permanently delete all local identity nodes, balances, and history. This action cannot be reversed.")) {
      toast({ title: "Purge Initiated", description: "Shutting down identity nodes..." });
      setTimeout(() => { localStorage.clear(); sessionStorage.clear(); window.location.href = "/"; }, 1500);
    }
  };

  const handleCancelSub = (username: string) => {
    triggerHaptic(30);
    cancelSubscription(username);
    toast({ title: "Node Severed", description: "Premium subscription link has been deactivated." });
  };

  const filteredConnections = useMemo(() => {
    return connections.filter(c => c.followsYou && (c.name.toLowerCase().includes(legacySearch.toLowerCase()) || c.username.toLowerCase().includes(legacySearch.toLowerCase())));
  }, [connections, legacySearch]);

  const selectedLegacyNode = useMemo(() => {
    return connections.find(c => c.username === settings.legacyContact);
  }, [connections, settings.legacyContact]);

  const subCreators = useMemo(() => {
    return connections.filter(c => activeSubscriptions.has(c.username));
  }, [connections, activeSubscriptions]);

  const storageData = useMemo(() => {
    const sonicSize = downloadedSongIds.size * 10.5;
    const vibeSize = posts.filter(p => p.videoUrl).length * 15.2;
    const metaSize = (posts.length * 0.5) + (connections.length * 0.2) + 1.2;
    return [
      { label: "Sonic Notes", size: `${sonicSize.toFixed(1)}MB`, value: Math.min((sonicSize / 2000) * 100, 100), icon: Music2, color: "bg-primary" },
      { label: "Vibe Cache", size: `${vibeSize.toFixed(1)}MB`, value: Math.min((vibeSize / 2500) * 100, 100), icon: Video, color: "bg-accent" },
      { label: "Core Meta", size: `${metaSize.toFixed(1)}MB`, value: Math.min((metaSize / 500) * 100, 100), icon: Database, color: "bg-amber-500" },
    ];
  }, [downloadedSongIds, posts, connections]);

  const totalUsedMB = useMemo(() => storageData.reduce((acc, curr) => acc + parseFloat(curr.size), 0), [storageData]);

  const referrals = currentUser.referralCount || 0;
  const currentLevel = referrals < 5 ? 1 : referrals < 10 ? 2 : 3;
  const nextMilestone = referrals < 5 ? 5 : referrals < 10 ? 10 : referrals;
  const growthProgress = referrals >= 10 ? 100 : (referrals / nextMilestone) * 100;

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#050505] transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4"><Link href="/menu"><Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/80 active:scale-90 transition-all"><ArrowLeft className="h-6 w-6" /></Button></Link><div className="flex flex-col"><h1 className="text-lg font-black italic uppercase tracking-tighter text-foreground">System Core</h1><div className="flex items-center gap-1.5"><div className={cn("h-1.5 w-1.5 rounded-full", isSyncing ? "bg-primary animate-ping" : "bg-green-500")} /><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{isSyncing ? "Syncing Nodes..." : "Status: Optimal"}</span></div></div></div>
        <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary gap-2 transition-all active:scale-95" onClick={handleSync} disabled={isSyncing}>{isSyncing ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3" />} Manual Sync</Button>
      </header>

      <main className={cn("max-w-2xl mx-auto p-4 sm:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32", isPlayerActive ? "pt-[80px]" : "pt-4")}>
        
        {/* PHASE 1: AESTHETICS & ENVIRONMENT */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Appearance Node</h3>
          <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border shadow-xl shadow-black/5 p-6 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="font-bold text-sm">Universal Theme</p>
                <p className="text-[10px] text-muted-foreground uppercase font-black">Flip the platform environment</p>
              </div>
              <div className="flex bg-secondary/40 p-1 rounded-xl">
                {[
                  { id: 'light', icon: Sun, label: 'Ivory' },
                  { id: 'dark', icon: Moon, label: 'Space' },
                  { id: 'system', icon: Monitor, label: 'Sync' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleUpdate({ theme: t.id })}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                      settings.theme === t.id ? "bg-white dark:bg-zinc-800 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <t.icon className="h-3 w-3" /> {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-border -mx-6" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-primary" />
                    <p className="font-bold text-sm">Font Scale Engine</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Calibrate global text size</p>
                </div>
                <Badge className="bg-primary/5 text-primary border-primary/10 text-[10px] font-black">{Math.round(settings.fontScale * 100)}%</Badge>
              </div>
              <Slider 
                value={[settings.fontScale]} 
                min={0.8} 
                max={1.4} 
                step={0.05} 
                onValueChange={(val) => handleUpdate({ fontScale: val[0] })}
              />
            </div>

            <div className="h-px bg-border -mx-6" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <p className="font-bold text-sm">Haptic Calibration</p>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Vibration handshake intensity</p>
                </div>
                <Badge className="bg-amber-500/5 text-amber-500 border-amber-500/10 text-[10px] font-black">{settings.hapticIntensity}%</Badge>
              </div>
              <Slider 
                value={[settings.hapticIntensity]} 
                min={0} 
                max={100} 
                step={5} 
                onValueChange={(val) => handleUpdate({ hapticIntensity: val[0] })}
                className="[&_[role=slider]]:bg-amber-500"
              />
            </div>
          </div>
        </section>

        {/* PHASE 3: SECURITY & PASSWORD (INTEGRATED) */}
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Security Handshake</h3>
          <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border shadow-xl shadow-black/5 p-6 space-y-6">
            <button className="w-full flex items-center justify-between p-4 bg-secondary/20 rounded-2xl hover:bg-secondary/40 transition-all group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">Change Network Password</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-black">Rotate your security node credentials</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-40" />
            </button>

            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                  <Fingerprint className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">Biometric Vault</p>
                  <p className="text-[9px] text-muted-foreground uppercase font-black">Fingerprint lock for hubs</p>
                </div>
              </div>
              <Switch checked={settings.isBiometricActive} onCheckedChange={(val) => handleUpdate({ isBiometricActive: val })} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Subscription Vault</h3>
          <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border shadow-xl shadow-black/5 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gem className="h-5 w-5 text-cyan-500" />
                <p className="font-bold text-sm">Premium Creator Links</p>
              </div>
              <Badge variant="outline" className="bg-cyan-500/5 text-cyan-500 border-cyan-500/20 text-[8px] font-black uppercase">{activeSubscriptions.size} ACTIVE</Badge>
            </div>
            
            {subCreators.length > 0 ? (
              <div className="space-y-3">
                {subCreators.map(creator => (
                  <div key={creator.username} className="flex items-center justify-between p-4 bg-secondary/20 rounded-2xl border border-transparent hover:border-cyan-500/20 transition-all group">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-white/10 shadow-sm"><AvatarImage src={creator.avatar} /></Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-bold truncate max-w-[120px]">{creator.name}</p>
                        <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest">20 DIAMONDS / MO</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" size="icon" 
                      className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
                      onClick={() => handleCancelSub(creator.username)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center bg-secondary/10 rounded-2xl border-2 border-dashed border-cyan-500/5">
                <Gem className="h-8 w-8 mx-auto text-cyan-500/20 mb-2" />
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">No premium nodes linked</p>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2"><h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Identity & Signature</h3><Badge variant="outline" className="text-[8px] font-black border-primary/20 text-primary">SYNCED</Badge></div>
          <div className="bg-white dark:bg-card rounded-[2.5rem] border border-border shadow-xl shadow-black/5 overflow-hidden">
            <Link href="/profile" className="flex items-center justify-between p-6 hover:bg-secondary/20 transition-colors group"><div className="flex items-center gap-4"><div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><User className="h-6 w-6" /></div><div><p className="font-black italic uppercase tracking-tighter text-lg">{currentUser.name}</p><p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Edit Public Digital Workspace</p></div></div><ChevronRight className="h-5 w-5 text-muted-foreground opacity-40" /></Link>
            <div className="p-6 space-y-8"><div className="flex items-center justify-between"><div className="space-y-0.5"><p className="font-bold text-sm">Ghost Node Mode</p><p className="text-[10px] text-muted-foreground uppercase font-black">Hide your online pulse and browsing footprint</p></div><Switch checked={settings.isGhostMode} onCheckedChange={(val) => handleUpdate({ isGhostMode: val })} className="data-[state=checked]:bg-primary" /></div><div className="h-px bg-border -mx-6" /><div className="space-y-4"><div className="flex items-center justify-between"><div className="space-y-0.5"><p className="font-bold text-sm">Legacy Handshake</p><p className="text-[10px] text-muted-foreground uppercase font-black">Designate a node to manage your signature</p></div><Dialog open={isLegacySelectorOpen} onOpenChange={setIsLegacySelectorOpen}><DialogTrigger asChild><Button variant="outline" className="rounded-xl h-10 border-primary/20 text-primary font-black uppercase text-[10px]">{selectedLegacyNode ? "Switch Node" : "Designate"}</Button></DialogTrigger><DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-primary/10"><DialogHeader className="p-6 bg-primary/5 border-b border-primary/10"><DialogTitle className="text-xl font-black italic uppercase tracking-widest text-primary">Select Legacy Node</DialogTitle></DialogHeader><div className="p-4 space-y-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Query mutual connections..." className="h-12 pl-10 rounded-2xl bg-secondary/20 border-none" value={legacySearch} onChange={(e) => setLegacySearch(e.target.value)} /></div><ScrollArea className="h-[300px]"><div className="space-y-2 pr-4">{filteredConnections.length > 0 ? filteredConnections.map((c) => (<button key={c.username} onClick={() => { handleUpdate({ legacyContact: c.username }); setIsLegacySelectorOpen(false); toast({ title: "Protocol Established", description: `@${c.username} is now your legacy node.` }); }} className={cn("w-full flex items-center justify-between p-3 rounded-2xl transition-all", settings.legacyContact === c.username ? "bg-primary/10 ring-1 ring-primary/20" : "hover:bg-secondary/40")}><div className="flex items-center gap-3"><Avatar className="h-10 w-10 border border-primary/10"><AvatarImage src={c.avatar} /></Avatar><div className="text-left"><p className="font-bold text-sm leading-none">{c.name}</p><p className="text-[10px] text-muted-foreground font-black uppercase mt-1">@{c.username}</p></div></div>{settings.legacyContact === c.username && <CheckCircle2 className="h-5 w-5 text-primary" />}</button>)) : (<div className="py-12 text-center text-muted-foreground italic text-sm">No mutual nodes found.</div>)}</div></ScrollArea></div></DialogContent></Dialog></div>{selectedLegacyNode && (<div className="flex items-center gap-3 p-3 rounded-2xl bg-primary/5 border border-primary/10 animate-in slide-in-from-top-2"><Avatar className="h-8 w-8"><AvatarImage src={selectedLegacyNode.avatar} /></Avatar><div className="flex-1 min-w-0"><p className="text-xs font-bold truncate">{selectedLegacyNode.name}</p><p className="text-[9px] font-black uppercase text-primary tracking-widest">Digital Proxy Node</p></div><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleUpdate({ legacyContact: null })}><Trash2 className="h-4 w-4" /></Button></div>)}</div></div></div>
        </section>

        <section className="space-y-4"><h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Growth & Handshakes</h3><div className="bg-white dark:bg-card rounded-[2rem] border border-border shadow-xl shadow-black/5 p-6 space-y-8"><div className="bg-primary/5 rounded-[1.75rem] p-6 border border-primary/10 relative overflow-hidden group"><div className="relative z-10 space-y-4"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-amber-500" /><span className="text-xs font-black uppercase tracking-widest">Ambassador Status</span></div><Badge variant="outline" className="bg-primary text-white text-[8px] font-black uppercase tracking-widest border-none">Level {currentLevel} {currentLevel === 3 && "MAX"}</Badge></div><div className="space-y-2"><div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter"><span className="text-muted-foreground">{currentLevel === 3 ? "Maximum Tier Reached" : `Progress to Level ${currentLevel + 1}`}</span><span className="text-primary">{referrals} / {nextMilestone} Nodes</span></div><Progress value={growthProgress} className="h-2" /></div></div><Rocket className="absolute -right-4 -bottom-4 h-24 w-24 opacity-5 rotate-[-15deg] group-hover:scale-110 transition-transform duration-700" /></div><div className="flex items-center justify-between"><div className="space-y-0.5"><div className="flex items-center gap-2"><UserPlus className="h-4 w-4 text-primary" /><p className="font-bold text-sm">Auto-Follow Protocol</p></div><p className="text-[10px] text-muted-foreground uppercase font-black">Automatically follow nodes that join via your link</p></div><Switch checked={settings.isAutoFollowEnabled} onCheckedChange={(val) => handleUpdate({ isAutoFollowEnabled: val })} className="data-[state=checked]:bg-primary" /></div></div></section>

        <section className="pt-10 pb-20"><Button variant="outline" className="w-full h-14 rounded-2xl border-destructive/20 text-destructive font-black italic uppercase tracking-widest text-[10px] hover:bg-destructive/5 transition-all active:scale-95 shadow-lg shadow-destructive/5" onClick={handleTotalPurge}>Purge Local Cache & Sign Out</Button><p className="text-center text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-6">ViMore Node v1.5.0-HighVelocity</p></section>
      </main>
    </div>
  );
}