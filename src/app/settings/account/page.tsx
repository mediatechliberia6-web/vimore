
"use client";

import { useState } from "react";
import { ArrowLeft, UserCog, ShieldCheck, Mail, Smartphone, AtSign, KeyRound, Fingerprint, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function AccountCenter() {
  const { currentUser, updateCurrentUser, triggerHaptic } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: currentUser.name,
    username: currentUser.username,
    email: "amos@mediatech.lib",
    phone: "+231 77 845 1835"
  });

  const isPlayerActive = currentTrack && !isExpanded;

  const handleSave = () => {
    triggerHaptic(25);
    updateCurrentUser({ name: formData.name });
    toast({ title: "Identity Updated", description: "Your account credentials have been synchronized." });
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#050505] transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/menu">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/80">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-tight">Account Center</h1>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Identity Vault</span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-primary" onClick={handleSave}>Save</Button>
      </header>

      <main className={cn(
        "max-w-xl mx-auto p-4 sm:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32",
        isPlayerActive ? "pt-[80px]" : "pt-4"
      )}>
        
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Digital Identity</h3>
          <Card className="rounded-[2.5rem] bg-white dark:bg-card border-none shadow-xl shadow-black/5 overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Legal Pulse (Name)</Label>
                  <div className="relative group">
                    <UserCog className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-14 pl-12 bg-secondary/30 border-none rounded-2xl font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Spatial ID (Username)</Label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={formData.username} readOnly className="h-14 pl-12 bg-secondary/10 border-none rounded-2xl font-bold text-muted-foreground cursor-not-allowed" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Contact Handshakes</h3>
          <Card className="rounded-[2.5rem] bg-white dark:bg-card border-none shadow-xl shadow-black/5 overflow-hidden">
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Email Node</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="h-14 pl-12 bg-secondary/30 border-none rounded-2xl font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">Mobile Pulse</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="h-14 pl-12 bg-secondary/30 border-none rounded-2xl font-bold" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Security Vault</h3>
          <div className="grid grid-cols-1 gap-3">
            <Button variant="outline" className="h-16 rounded-2xl border-primary/10 bg-white dark:bg-card justify-start gap-4 px-6 group hover:bg-primary/5 transition-all">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <KeyRound className="h-5 w-5" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-bold text-sm">Rotate Password</span>
                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Update vault credentials</span>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/40" />
            </Button>
            <Button variant="outline" className="h-16 rounded-2xl border-primary/10 bg-white dark:bg-card justify-start gap-4 px-6 group hover:bg-primary/5 transition-all">
              <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                <Fingerprint className="h-5 w-5" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-bold text-sm">Two-Pulse Auth</span>
                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Enable 2FA security</span>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/40" />
            </Button>
          </div>
        </section>

        <div className="pt-10 flex flex-col items-center gap-6">
          <Button variant="ghost" className="text-destructive font-black uppercase text-[10px] tracking-widest gap-2">
            <Trash2 className="h-4 w-4" /> Deactivate Identity Node
          </Button>
          <div className="opacity-30 text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground">Account Core v1.5</p>
            <p className="text-[8px] font-bold uppercase tracking-widest text-primary italic">From Media Tech Liberia</p>
          </div>
        </div>
      </main>
    </div>
  );
}
