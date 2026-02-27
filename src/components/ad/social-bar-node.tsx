
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * SocialBarNode handles the injection of Adsterra Social Bar ads.
 * These are designed to be slim, non-intrusive bars that sit at the top of content hubs.
 * Synchronized to vanish after 5 seconds of visibility to maintain feed focus.
 */
export function SocialBarNode() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    // Clear existing content to prevent duplication
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://pl28803380.effectivegatecpm.com/b4/28/c1/b428c1c969c5f711cdbebb154404eff6.js";
    script.async = true;
    
    containerRef.current.appendChild(script);

    // Temporal Dismissal: 5 second display window
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      ref={containerRef} 
      className="w-full flex justify-center py-1 overflow-hidden min-h-[40px] opacity-90 hover:opacity-100 transition-all duration-500 animate-in fade-in slide-in-from-top-2" 
    />
  );
}
