"use client";

import { useState, useEffect, useRef } from "react";
import { X, Zap, ShieldCheck, Timer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";

interface InterstitialPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InterstitialPortal({ isOpen, onClose }: InterstitialPortalProps) {
  const { triggerHaptic, isPlaying, togglePlay } = useMusic();
  const [timeLeft, setTimeLeft] = useState(10);
  const [canClose, setCanClose] = useState(false);
  const adContainerRef = useRef<HTMLDivElement>(null);
  const wasPlayingRef = useRef(false);

  // 1. Timer Logic
  useEffect(() => {
    if (isOpen) {
      // Sonic Safety: Pause music if playing
      if (isPlaying) {
        wasPlayingRef.current = true;
        togglePlay();
      }

      triggerHaptic(25);
      setTimeLeft(10);
      setCanClose(false);

      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            triggerHaptic(15);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  // 2. Script Injection Handshake
  useEffect(() => {
    if (isOpen && adContainerRef.current) {
      const container = adContainerRef.current;
      container.innerHTML = ""; // Purge old node
      
      const script = document.createElement("script");
      script.src = "https://pl28803340.effectivegatecpm.com/ea/33/17/ea33174cb87fd4e73ca39402fe522836.js";
      script.async = true;
      
      container.appendChild(script);
    }
  }, [isOpen]);

  const handlePurge = () => {
    if (!canClose) return;
    triggerHaptic(10);
    
    // Restore Sonic State if it was playing
    if (wasPlayingRef.current) {
      togglePlay();
      wasPlayingRef.current = false;
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex flex-col animate-in fade-in duration-500 overflow-hidden">
      {/* Aurora Ambient Pulse */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 blur-[150px] rounded-full animate-pulse delay-700" />
      </div>

      <header className="h-20 px-6 flex items-center justify-between shrink-0 bg-black/40 border-b border-white/5 relative z-[1010]">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
            <Zap className="h-5 w-5 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-sm font-black italic uppercase tracking-widest text-white leading-tight">Sponsored Pulse</h2>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-green-400" />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">High-Velocity Handshake</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!canClose ? (
            <div className="bg-white/5 border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-3">
              <Timer className="h-3.5 w-3.5 text-primary animate-spin" />
              <span className="text-xs font-black text-white tabular-nums uppercase tracking-widest">Unlock in {timeLeft}s</span>
            </div>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full bg-primary text-white hover:bg-primary/80 animate-in zoom-in duration-300 shadow-lg shadow-primary/20"
              onClick={handlePurge}
            >
              <X className="h-6 w-6" />
            </Button>
          )}
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center p-4">
        {/* Ad Handshake Container */}
        <div className="w-full h-full flex items-center justify-center">
          <div 
            ref={adContainerRef} 
            className="w-full h-full flex items-center justify-center bg-transparent"
          />
          
          {/* Fallback Loader */}
          <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center gap-4 opacity-20">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Synchronizing Spatial Node...</p>
          </div>
        </div>
      </main>

      <footer className="h-16 px-6 flex items-center justify-center bg-black/40 border-t border-white/5 relative z-[1010]">
        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
          ViMore Global Network • Sponsored Vibration
        </p>
      </footer>
    </div>
  );
}
