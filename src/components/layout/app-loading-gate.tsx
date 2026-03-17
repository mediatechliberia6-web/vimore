"use client";

import { usePosts } from "@/context/PostContext";
import { KineticSplashScreen } from "./kinetic-splash-screen";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * @fileOverview ViMore App Loading Gate
 * Manages the transition between the kinetic splash screen and the application hub.
 * Calibrated: Materializes the branded splash on every hardware refresh/entry pulse.
 */

export function AppLoadingGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = usePosts();
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRenderSplash, setShouldRenderSplash] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Data Handshake Complete: Initiate high-velocity fade out
      // We keep the splash visible for a minimum duration to ensure brand presence
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Clean up the DOM node after the transition completes
        setTimeout(() => setShouldRenderSplash(false), 600);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <>
      {shouldRenderSplash && (
        <div className={cn(
          "fixed inset-0 z-[9999] transition-opacity duration-500 ease-in-out",
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <KineticSplashScreen />
        </div>
      )}
      <div className={cn(
        "flex-1 flex flex-col transition-opacity duration-1000 ease-out",
        isVisible ? "opacity-0" : "opacity-100"
      )}>
        {children}
      </div>
    </>
  );
}
