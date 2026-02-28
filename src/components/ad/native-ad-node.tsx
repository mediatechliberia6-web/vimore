"use client";

import { useEffect, useRef, useState } from "react";
import { 
  MoreHorizontal, 
  Share2, 
  ExternalLink, 
  Zap, 
  Info,
  ShieldCheck,
  Heart,
  MessageCircle,
  Download,
  CheckCircle2,
  Sparkles,
  Music2,
  Plus,
  ChevronRight
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMusic } from "@/context/MusicContext";
import Image from "next/image";

interface NativeAdNodeProps {
  type: "banner" | "reel" | "standard";
  id?: string;
  isActive?: boolean;
}

export function NativeAdNode({ type, id, isActive }: NativeAdNodeProps) {
  const { triggerHaptic, triggerDownloadWithAd } = useMusic();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !iframeRef.current) return;

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // 1. ISOLATION HANDSHAKE: Clear and open a new document inside the sandbox
    doc.open();
    
    // 2. NODE CALIBRATION: Inject specific ad script based on type
    if (type === "standard") {
      // Standard 728x90 Banner Logic
      doc.write(`
        <html>
          <body style="margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden;">
            <script type="text/javascript">
              atOptions = {
                'key' : '3eba8b91263527bd1a02399ff4d2ee8e',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="//www.highperformanceformat.com/3eba8b91263527bd1a02399ff4d2ee8e/invoke.js"></script>
          </body>
        </html>
      `);
    } else {
      // Native Ad Logic (Banner/Reel)
      doc.write(`
        <html>
          <body style="margin: 0; padding: 0; background: transparent; overflow: hidden; display: flex; justify-content: center;">
            <div id="container-da434b4b9d70fa28431080d1f00b7b40"></div>
            <script async="async" data-cfasync="false" src="https://pl28803356.effectivegatecpm.com/da434b4b9d70fa28431080d1f00b7b40/invoke.js"></script>
          </body>
        </html>
      `);
    }
    
    doc.close();
    setIsLoaded(true);

    return () => {
      // PURGE: Ensure the iframe is decommissioned on unmount
      if (iframe) {
        iframe.src = "about:blank";
      }
    };
  }, [type]);

  const handleLearnMore = () => {
    triggerHaptic(20);
    triggerDownloadWithAd('single', async () => {
      console.log("Ad session complete.");
    });
  };

  // 1. Isolated Standard Banner (728x90)
  if (type === "standard") {
    return (
      <div className="w-full flex justify-center py-4 animate-in fade-in duration-700 overflow-hidden">
        <iframe 
          ref={iframeRef}
          className="w-full max-w-[728px] h-[90px] border-none bg-transparent overflow-hidden"
          title="ViMore Ad Node"
          scrolling="no"
        />
      </div>
    );
  }

  // 2. Immersive Reel Ad Node
  if (type === "reel") {
    return (
      <div className="relative h-[100dvh] w-full flex items-center justify-center bg-black overflow-hidden group select-none">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 blur-[150px] rounded-full animate-pulse delay-700" />
          </div>
          
          <div className="relative z-10 w-full px-8 flex flex-col items-center gap-8">
            <div className="w-full min-h-[250px] flex items-center justify-center rounded-3xl overflow-hidden bg-white/5 border border-white/10">
              <iframe 
                ref={iframeRef}
                className="w-full h-[250px] border-none bg-transparent"
                title="ViMore Reel Ad"
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
            <Avatar className="h-11 w-11 border-[1.5px] border-white/80 ring-2 ring-primary/10">
              <AvatarImage src="https://picsum.photos/seed/ads/100/100" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-primary text-white rounded-full p-0.5"><Plus className="h-2 w-2" /></div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <button className="p-2.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white"><Heart className="h-5 w-5" /></button>
            <span className="text-[9px] font-black text-white uppercase tracking-widest">AD</span>
          </div>
          <button className="p-2.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white"><Share2 className="h-5 w-5" /></button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 pt-20 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
          <div className="max-w-[75%] space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black italic uppercase tracking-tighter text-white">@ViMoreAds</span>
              <div className="flex items-center gap-1 bg-primary/20 border border-primary/20 px-2 py-0.5 rounded-full">
                <ShieldCheck className="h-2.5 w-2.5 text-primary fill-primary text-white" />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">Verified Ads</span>
              </div>
            </div>
            <p className="text-xs text-white/80 leading-tight font-medium">Discover premium nodes curated for high-velocity creators.</p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Isolated Banner Node (In-Feed)
  return (
    <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-card mb-4 ring-1 ring-black/5 dark:ring-white/5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="h-10 w-10 border border-primary/10">
              <AvatarImage src="https://picsum.photos/seed/ad-logo/100/100" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 bg-primary text-white p-0.5 rounded-full"><Zap className="h-2 w-2 fill-current" /></div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm">ViMore Ads</span>
              <Badge variant="secondary" className="bg-secondary/50 text-[8px] font-black h-4 px-1.5 rounded uppercase tracking-tighter">Sponsored</Badge>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-black tracking-widest">
              <ShieldCheck className="h-2.5 w-2.5 text-green-500" /> Secure Ad Node
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
      </CardHeader>

      <CardContent className="px-3 pb-3 space-y-4">
        <div className="relative group rounded-2xl overflow-hidden bg-secondary/20 min-h-[120px] flex items-center justify-center border border-primary/5">
          <iframe 
            ref={iframeRef}
            className="w-full min-h-[120px] border-none bg-transparent"
            title="ViMore In-Feed Ad"
            scrolling="no"
          />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white">
              <ExternalLink className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="space-y-2 px-1 text-center sm:text-left">
          <h4 className="text-xl font-black italic uppercase tracking-tighter leading-none text-primary">Unlock High-Velocity Access</h4>
          <p className="text-[13px] leading-relaxed text-muted-foreground">Tap to explore our latest high-fidelity nodes and tools.</p>
        </div>
      </CardContent>

      <CardFooter className="p-3 pt-0 flex flex-col gap-3">
        <Button 
          onClick={handleLearnMore}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-xl font-black italic uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
        >
          Explore Node <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
            <span className="flex items-center gap-1"><Info className="h-3 w-3" /> Transparency</span>
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Secure Link</span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/40"><Share2 className="h-4 w-4" /></Button>
        </div>
      </CardFooter>
    </Card>
  );
}
