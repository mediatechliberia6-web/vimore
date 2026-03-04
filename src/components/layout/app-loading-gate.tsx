"use client";

import { usePosts } from "@/context/PostContext";
import { KineticSplashScreen } from "./kinetic-splash-screen";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * @fileOverview ViMore App Loading Gate
 * Manages the transition between the kinetic splash screen and the application hub.
 * Ensures initial node synchronization is complete before reveal.
 */

export function AppLoadingGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = usePosts();
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Spatial Pulse: Allow branding to breathe for at least 2 seconds
    if (!isLoading) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Clean up the DOM node after the transition completes
        setTimeout(() => setShouldRender(false), 600);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!shouldRender) return <>{children}</>;

  return (
    <>
      <div className={cn(
        "fixed inset-0 z-[9999] transition-opacity duration-500 ease-in-out",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <KineticSplashScreen />
      </div>
      <div className={cn(
        "flex-1 flex flex-col transition-opacity duration-1000 ease-out",
        isVisible ? "opacity-0" : "opacity-100"
      )}>
        {children}
      </div>
    </>
  );
}
