
"use client";

import React, { useEffect, useRef, memo } from "react";
import { 
  MoreHorizontal, 
  Share2, 
  Zap, 
  ShieldCheck, 
  Heart, 
  ChevronRight, 
  Plus,
  Loader2,
  Gauge
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMusic } from "@/context/MusicContext";
import { useTranslation } from "@/context/LanguageContext";

interface NativeAdNodeProps {
  type: "banner" | "reel" | "standard" | "banner-468";
  id?: string;
  isActive?: boolean;
}

const ViMoreAdLogo = () => (
  <div className="w-full h-full bg-primary flex items-center justify-center text-white">
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2/3 h-2/3">
      <path d="M3 7L10 19L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 15L17 7L21 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

/**
 * @fileOverview ViMore Native Ad Node (State-Locked)
 * High-velocity advertisement node with strict memoization and initialization guards.
 * Prevents re-render conflicts that cause ad nodes to vanish.
 */
const NativeAdNodeBase = ({ type, id, isActive }: NativeAdNodeProps) => {
  const { triggerHaptic, triggerDownloadWithAd } = useMusic();
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !iframeRef.current || hasInitialized.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // STATE-LOCKED HANDSHAKE: Ensure script injection happens exactly once
    doc.open();
    
    if (type === "standard") {
      doc.write(`
        <body style="margin: 0; padding: 0; background: transparent; overflow: hidden; display: flex; justify-content: center;">
          <script type="text/javascript">
            atOptions = {
              'key' : 'dbb5c7fa11689ae615919a9aed7fca72',
              'format' : 'iframe',
              'height' : 90,
              'width' : 728,
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="https://www.highperformanceformat.com/dbb5c7fa11689ae615919a9aed7fca72/invoke.js"></script>
        </body>
      `);
    } else if (type === "banner-468") {
      doc.write(`
        <body style="margin: 0; padding: 0; background: transparent; overflow: hidden; display: flex; justify-content: center;">
          <script type="text/javascript">
            atOptions = {
              'key' : 'beed0ad29b5a54546b811f3f5ee2224f',
              'format' : 'iframe',
              'height' : 60,
              'width' : 468,
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="https://www.highperformanceformat.com/beed0ad29b5a54546b811f3f5ee2224f/invoke.js"></script>
        </body>
      `);
    } else {
      doc.write(`
        <body style="margin: 0; padding: 0; background: transparent; overflow: hidden; display: flex; justify-content: center;">
          <div id="container-d13d860ccc8aa5337c2883a5d6f33e5f"></div>
          <script async="async" data-cfasync="false" src="https://pl28925245.effectivegatecpm.com/d13d860ccc8aa5337c2883a5d6f33e5f/invoke.js"></script>
        </body>
      `);
    }
    doc.close();
    hasInitialized.current = true;
  }, [type]);

  const handleLearnMore = () => {
    triggerHaptic(20);
    triggerDownloadWithAd('single', async () => {
      console.log("Ad session complete.");
    });
  };

  if (type === "standard") {
    return (
      <div className="w-full flex justify-center py-6 overflow-hidden min-h-[106px] relative">
        <div className="relative w-[728px] h-[90px] shrink-0">
          <iframe 
            ref={iframeRef}
            width="728"
            height="90"
            className="border-none bg-transparent overflow-hidden"
            title={`ViMore-Standard-Ad-${id || 'generic'}`}
            scrolling="no"
          />
        </div>
      </div>
    );
  }

  if (type === "banner-468") {
    return (
      <div className="w-full flex justify-center py-4 overflow-hidden min-h-[76px] relative">
        <div className="relative w-[468px] h-[60px] shrink-0">
          <iframe 
            ref={iframeRef}
            width="468"
            height="60"
            className="border-none bg-transparent overflow-hidden"
            title={`ViMore-Banner-468-${id || 'generic'}`}
            scrolling="no"
          />
        </div>
      </div>
    );
  }

  if (type === "reel") {
    return (
      <div className="relative h-[100dvh] w-full flex items-center justify-center bg-black overflow-hidden group select-none">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full animate-pulse delay-700" />
          </div>
          
          <div className="relative z-10 w-full px-8 flex flex-col items-center gap-8">
            <div className="w-full min-h-[250px] flex items-center justify-center rounded-3xl overflow-hidden bg-white/5 border border-white/10">
              <iframe 
                ref={iframeRef}
                className="w-full h-[250px] border-none bg-transparent"
                title={`ViMore-Reel-Ad-${id || 'generic'}`}
                scrolling="no"
              />
            </div>
            <div className="text-center space-y-4">
              <Badge className="bg-primary/20 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">Sponsored Node</Badge>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Explore New Horizons</h3>
              <p className="text-white/60 text-sm max-w-xs mx-auto">Discover high-velocity tools curated for the ViMore community.</p>
              <Button 
                onClick={handleLearnMore}
                className="bg-white text-black hover:bg-zinc-200 rounded-2xl h-14 px-10 font-black italic uppercase tracking-widest text-xs shadow-2xl transition-all active:scale-95"
              >
                Learn More <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute right-3 bottom-20 z-50 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-11 w-11 rounded-xl overflow-hidden border-[1.5px] border-white/80 ring-2 ring-primary/10 shadow-xl">
              <ViMoreAdLogo />
            </div>
            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-primary text-white rounded-full p-0.5 shadow-lg"><Plus className="h-2 w-2" /></div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button className="p-2.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white"><Heart className="h-5 w-5" /></button>
            <span className="text-[9px] font-black text-white drop-shadow-md uppercase tracking-widest">AD</span>
          </div>
          <button className="p-2.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white"><Share2 className="h-5 w-5" /></button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 pt-20 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
          <div className="max-w-[75%] space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black italic uppercase tracking-tighter text-white">ViMore Hub</span>
              <div className="flex items-center gap-1 bg-primary/20 border border-primary/20 px-2 py-0.5 rounded-full">
                <ShieldCheck className="h-2.5 w-2.5 text-primary fill-primary text-white" />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Verified Ads</span>
              </div>
            </div>
            <p className="text-xs text-white/80 leading-tight font-medium">Discover official ViMore recommendations.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-card mb-4 ring-1 ring-black/5 dark:ring-white/5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl overflow-hidden border border-primary/10 shadow-sm">
              <ViMoreAdLogo />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-white p-0.5 rounded-full"><Zap className="h-2 w-2 fill-current" /></div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm">ViMore Official</span>
              <Badge variant="secondary" className="bg-secondary/50 text-[8px] font-black h-4 px-1.5 rounded uppercase tracking-tighter">Sponsored</Badge>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-black tracking-widest">
              <ShieldCheck className="h-2.5 w-2.5 text-green-500" /> Secure Node
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
      </CardHeader>

      <CardContent className="px-3 pb-3 space-y-4">
        <div className="relative group rounded-2xl overflow-hidden bg-secondary/20 min-h-[120px] flex items-center justify-center border border-primary/5">
          <iframe 
            ref={iframeRef}
            className="w-full min-h-[120px] border-none bg-transparent overflow-hidden"
            title={`ViMore-Banner-Ad-${id || 'generic'}`}
            scrolling="no"
          />
        </div>

        <div className="space-y-2 px-1 text-center sm:text-left">
          <h4 className="text-xl font-black italic uppercase tracking-tighter leading-none text-primary">High-Velocity Recommended Node</h4>
          <p className="text-[13px] leading-relaxed text-muted-foreground">Tap to explore our latest verified network enhancements.</p>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex flex-col gap-3">
        <Button 
          onClick={handleLearnMore}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-black italic uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-98"
        >
          Explore Now <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export const NativeAdNode = memo(NativeAdNodeBase);
