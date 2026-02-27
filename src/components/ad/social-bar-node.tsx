
"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * SocialBarNode handles the injection of Adsterra Social Bar ads.
 * These are designed to be slim, non-intrusive bars that sit at the top of content hubs.
 * Now synchronized to reveal a close button after 5 seconds of visibility.
 * Implements a 10-minute recurrence cycle to refresh the monetization signal.
 */
export function SocialBarNode() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [sessionKey, setSessionKey] = useState(0);

  // Recurrence Logic: 10 Minute Cycle (600,000ms)
  useEffect(() => {
    const recurrenceInterval = setInterval(() => {
      setIsVisible(true);
      setShowCloseButton(false);
      setSessionKey(prev => prev + 1);
    }, 600000);

    return () => clearInterval(recurrenceInterval);
  }, []);

  // Injection and Control Reveal Logic
  useEffect(() => {
    if (!isVisible || typeof window === "undefined" || !containerRef.current) return;

    // Clear existing content to prevent duplication on re-injection
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://pl28803380.effectivegatecpm.com/b4/28/c1/b428c1c969c5f711cdbebb154404eff6.js";
    script.async = true;
    
    containerRef.current.appendChild(script);

    // Temporal Control: Show Close button after 5 seconds
    const controlTimer = setTimeout(() => {
      setShowCloseButton(true);
    }, 5000);

    return () => {
      clearTimeout(controlTimer);
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [isVisible, sessionKey]);

  if (!isVisible) return null;

  return (
    <div className="relative w-full group animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Ad Container */}
      <div 
        ref={containerRef} 
        className="w-full flex justify-center py-1 overflow-hidden min-h-[40px] opacity-90 hover:opacity-100 transition-all duration-500" 
      />

      {/* Manual Dismissal Button - Appears after 5s */}
      {showCloseButton && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[100] animate-in zoom-in fade-in duration-300">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-primary/20 hover:text-primary border border-white/10 transition-all active:scale-90"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
