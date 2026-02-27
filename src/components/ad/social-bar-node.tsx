
"use client";

import { useEffect, useRef } from "react";

/**
 * SocialBarNode handles the injection of Adsterra Social Bar ads.
 * These are designed to be slim, non-intrusive bars that sit at the top of content hubs.
 */
export function SocialBarNode() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    // Clear existing content to prevent duplication
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://pl28803380.effectivegatecpm.com/b4/28/c1/b428c1c969c5f711cdbebb154404eff6.js";
    script.async = true;
    
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full flex justify-center py-1 overflow-hidden min-h-[40px] opacity-90 hover:opacity-100 transition-opacity" 
    />
  );
}
