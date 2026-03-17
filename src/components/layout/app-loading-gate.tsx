"use client";

import { usePosts } from "@/context/PostContext";
import { KineticSplashScreen } from "./kinetic-splash-screen";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * @fileOverview ViMore App Loading Gate
 * Manages the transition between the kinetic splash screen and the application hub.
 * Optimized: Only shows the branded splash on initial session entry.
 */

export function AppLoadingGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = usePosts();
  const [showSplash, setShowSplash] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Session Handshake: Check if this is a first-time entry or a refresh
    const isSessionActive = sessionStorage.getItem("vimore_session_active");
    
    if (!isSessionActive) {
      setShowSplash(true);
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Archive session status once initial sync is complete
      sessionStorage.setItem("vimore_session_active", "true");

      const timer = setTimeout(() => {
        setIsVisible(false);
        // Clean up the DOM node after the transition completes
        setTimeout(() => setShouldRender(false), 600);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // If session is active, we bypass splash and show children immediately (allowing skeletons to show)
  if (!shouldRender || (!showSplash && !isLoading)) return <>{children}</>;

  return (
    <>
      {showSplash && (
        <div className={cn(
          "fixed inset-0 z-[9999] transition-opacity duration-500 ease-in-out",
          isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}>
          <KineticSplashScreen />
        </div>
      )}
      <div className={cn(
        "flex-1 flex flex-col transition-opacity duration-1000 ease-out",
        (showSplash && isVisible) ? "opacity-0" : "opacity-100"
      )}>
        {children}
      </div>
    </>
  );
}
