
"use client";

import { useEffect, useRef } from "react";

/**
 * SocialBarNode handles the injection of Adsterra Social Bar ads.
 * This node is now a permanent fixture and stays on the screen until the user leaves the page.
 */
export function SocialBarNode() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    // Clear and inject the script node
    containerRef.current.innerHTML = "";
    
    const script = document.createElement("script");
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
    <div className="w-full flex justify-center py-2 animate-in fade-in duration-500">
      <div ref={containerRef} className="w-full max-w-4xl min-h-[50px] relative z-40" />
    </div>
  );
}
