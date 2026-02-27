'use client';

import { useState, useEffect } from 'react';
import { useMusic } from '@/context/MusicContext';
import { Zap, Loader2, ShieldCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AdPortal() {
  const { isAdPortalOpen, adDuration, adUrl, onAdComplete } = useMusic();
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
  // Separated into an effect to avoid "update during render" errors
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

      <header className="h-20 px-6 flex items-center justify-between shrink-0 relative z-10 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
            <Zap className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-black italic uppercase tracking-widest text-white">Ad Node Preparation</h2>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-green-400" />
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Secure Temporal Handshake</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 flex items-center gap-3">
            <Loader2 className="h-3 w-3 text-primary animate-spin" />
            <span className="text-xs font-black text-white tabular-nums">SYNCING IN: {timeLeft}s</span>
          </div>
          <span className="text-[8px] font-black text-white/30 uppercase tracking-tighter mt-1">Downloading starts automatically</span>
        </div>
      </header>

      <main className="flex-1 relative flex flex-col bg-white overflow-hidden">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center text-slate-400 bg-slate-50 z-0">
          <Loader2 className="h-12 w-12 mb-4 animate-spin text-primary opacity-20" />
          <h3 className="text-xl font-black italic uppercase text-slate-900 mb-2">Establishing Connection</h3>
          <p className="text-sm max-w-md font-medium">Please wait while we finalize the high-fidelity archive node.</p>
        </div>
        
        {/* Adsterra Smartlink Sandbox */}
        <iframe 
          src={adUrl} 
          className="relative z-10 w-full h-full border-none" 
          title="ViMore Ad Stream"
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </main>

      <footer className="h-16 px-6 flex items-center justify-center bg-black/40 border-t border-white/5 shrink-0 relative z-10">
        <div className="flex items-center gap-2 text-white/40">
          <Info className="h-3.5 w-3.5" />
          <span className="text-[9px] font-black uppercase tracking-widest">Ads support high-velocity server maintenance</span>
        </div>
      </footer>
    </div>
  );
}
