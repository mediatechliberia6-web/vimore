'use client';

import { useState, useEffect } from 'react';
import { useMusic } from '@/context/MusicContext';
import { Zap, Loader2, ShieldCheck, Info, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function AdPortal() {
  const { isAdPortalOpen, adDuration, adUrl, onAdComplete, triggerHaptic } = useMusic();
  const [timeLeft, setTimeLeft] = useState(adDuration);

  // Timer logic: Updates the local countdown state
  useEffect(() => {
    if (isAdPortalOpen) {
      setTimeLeft(adDuration);
      const timer = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isAdPortalOpen, adDuration]);

  // Completion logic: Triggers the data handshake when timer hits zero
  useEffect(() => {
    if (isAdPortalOpen && timeLeft === 0) {
      onAdComplete();
    }
  }, [timeLeft, isAdPortalOpen, onAdComplete]);

  if (!isAdPortalOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex flex-col animate-in fade-in duration-500 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/30 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/30 blur-[150px] rounded-full animate-pulse delay-1000" />
      </div>

      <header className="h-20 px-6 flex items-center justify-between shrink-0 relative z-[1010] bg-black/60 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
            <Zap className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-black italic uppercase tracking-widest text-white">Secure Node Fetch</h2>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-green-400" />
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Adsterra High-Velocity Link</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 flex items-center gap-3">
            <Loader2 className="h-3 w-3 text-primary animate-spin" />
            <span className="text-xs font-black text-white tabular-nums">SYNCING: {timeLeft}s</span>
          </div>
          <span className="text-[8px] font-black text-white/30 uppercase tracking-tighter mt-1">Archival starts after sync</span>
        </div>
      </header>

      <main className="flex-1 relative bg-black flex flex-col items-center justify-center">
        {/* Transparent Loader Background */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
          <div className="h-20 w-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
          <p className="text-xs font-black uppercase tracking-widest text-white/40">Synchronizing Spatial Node...</p>
        </div>
        
        {/* Permissive Iframe for Adsterra Compatibility */}
        <iframe 
          src={adUrl} 
          className="relative z-10 w-full h-full border-none shadow-2xl" 
          title="ViMore High-Velocity Ad"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation-by-user-activation"
        />

        {/* Fallback Interaction Node */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
          <p className="text-[10px] font-black uppercase text-white/20 text-center max-w-xs">
            If the high-velocity node fails to materialize, use the fallback link below.
          </p>
          <Button 
            variant="ghost" 
            className="bg-white/5 border border-white/10 text-white/60 hover:text-white rounded-xl h-10 px-6 font-bold text-[10px] uppercase tracking-widest gap-2 transition-all active:scale-95"
            onClick={() => { triggerHaptic(5); window.open(adUrl, '_blank'); }}
          >
            Manual Handshake <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </main>

      <footer className="h-16 px-6 flex items-center justify-center bg-black/40 border-t border-white/5 shrink-0 relative z-[1010]">
        <div className="flex items-center gap-2 text-white/40">
          <Info className="h-3.5 w-3.5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Advertisements maintain high-fidelity server clusters</span>
        </div>
      </footer>
    </div>
  );
}
