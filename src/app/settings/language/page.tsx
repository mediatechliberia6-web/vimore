
"use client";

import { useState } from "react";
import { ArrowLeft, Languages, Zap, Check, Sparkles, Globe, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

const LANGUAGES = [
  { id: "en", name: "English", native: "International", flag: "🇺🇸" },
  { id: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { id: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { id: "pt", name: "Portuguese", native: "Português", flag: "🇵🇹" },
  { id: "ar", name: "Arabic", native: "العربية", flag: "🇦🇪" },
  { id: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
];

export default function LanguageHub() {
  const { triggerHaptic, currentUser, updateCurrentUser } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const { toast } = useToast();
  const [selectedLang, setSelectedLang] = useState(currentUser.language || "en");
  const [autoTranslate, setAutoTranslate] = useState(true);

  const isPlayerActive = currentTrack && !isExpanded;

  const handleLanguageSelect = (langId: string) => {
    triggerHaptic(10);
    setSelectedLang(langId);
    updateCurrentUser({ language: langId });
    toast({ title: "Linguistic Sync", description: `Platform UI is now tuned to ${LANGUAGES.find(l => l.id === langId)?.name}.` });
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
            <h1 className="text-lg font-black italic uppercase tracking-tighter text-foreground leading-tight">Language Hub</h1>
            <div className="flex items-center gap-2">
              <Globe className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Global Sync</span>
            </div>
          </div>
        </div>
        <Badge variant="outline" className="border-primary/20 text-primary text-[8px] font-black uppercase px-2 h-5">AUTO-PULSE</Badge>
      </header>

      <main className={cn(
        "max-w-xl mx-auto p-4 sm:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32",
        isPlayerActive ? "pt-[80px]" : "pt-4"
      )}>
        
        <section className="space-y-6">
          <div className="bg-primary/10 border border-primary/20 rounded-[2rem] p-6 flex gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shrink-0 shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black italic uppercase tracking-widest text-primary">Universal Translation</h3>
              <p className="text-[11px] font-medium leading-relaxed text-primary/70 uppercase tracking-tight">
                ViMore automatically materializes translations for content nodes in foreign linguistic clusters.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 bg-white dark:bg-card rounded-[2.5rem] border border-border shadow-xl shadow-black/5">
            <div className="space-y-0.5">
              <p className="font-bold text-sm">Groq AI Auto-Pulse</p>
              <p className="text-[10px] text-muted-foreground uppercase font-black">Sync translations while scrolling</p>
            </div>
            <Switch checked={autoTranslate} onCheckedChange={setAutoTranslate} className="data-[state=checked]:bg-primary" />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">Platform Dialect</h3>
          <div className="grid grid-cols-1 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => handleLanguageSelect(lang.id)}
                className={cn(
                  "flex items-center justify-between p-5 rounded-[1.75rem] transition-all border group",
                  selectedLang === lang.id ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]" : "bg-white dark:bg-card border-border hover:bg-secondary/40"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl h-10 w-10 flex items-center justify-center bg-secondary/30 rounded-xl group-hover:scale-110 transition-transform">{lang.flag}</div>
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-sm">{lang.name}</span>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest opacity-60", selectedLang === lang.id ? "text-white" : "text-primary")}>{lang.native}</span>
                  </div>
                </div>
                {selectedLang === lang.id && <Check className="h-5 w-5 text-white" />}
              </button>
            ))}
          </div>
        </section>

        <div className="pt-10 flex flex-col items-center gap-4 opacity-30">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div className="text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-foreground">Global Registry v1.5</p>
            <p className="text-[8px] font-bold uppercase tracking-widest text-primary italic">From Media Tech Liberia</p>
          </div>
        </div>
      </main>
    </div>
  );
}
