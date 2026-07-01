"use client";

import { useEffect, useRef } from "react";
import { usePosts } from "@/context/PostContext";

const INTERVAL_MS = 15 * 60 * 1000; // every 15 minutes

export function ExpiryCleanup() {
  const { currentUser } = usePosts();
  const lastRun = useRef(0);

  const runCleanup = () => {
    const now = Date.now();
    if (now - lastRun.current < INTERVAL_MS) return;
    lastRun.current = now;
    fetch("/api/cron/cleanup").catch(() => {});
  };

  useEffect(() => {
    if (!currentUser?.$id) return;

    // Run once shortly after login
    const initial = setTimeout(runCleanup, 5000);

    // Then every 15 minutes
    const interval = setInterval(runCleanup, INTERVAL_MS);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [currentUser?.$id]);

  return null;
}
