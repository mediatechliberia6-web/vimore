"use client";

import { useEffect, useRef } from "react";
import { usePosts } from "@/context/PostContext";

const INTERVAL_MS = 15 * 60 * 1000; // every 15 minutes

export function ExpiryCleanup() {
  const { currentUser } = usePosts();
  const lastCleanup = useRef(0);
  const lastAlerts = useRef(0);

  const runCleanup = () => {
    const now = Date.now();
    if (now - lastCleanup.current < INTERVAL_MS) return;
    lastCleanup.current = now;
    fetch("/api/cron/cleanup").catch(() => {});
  };

  const runAlerts = () => {
    const now = Date.now();
    if (now - lastAlerts.current < INTERVAL_MS) return;
    lastAlerts.current = now;
    fetch("/api/cron/expiry-alerts").catch(() => {});
  };

  useEffect(() => {
    if (!currentUser?.$id) return;

    // Run both once shortly after login
    const initial = setTimeout(() => {
      runCleanup();
      runAlerts();
    }, 8000);

    // Then every 15 minutes
    const interval = setInterval(() => {
      runCleanup();
      runAlerts();
    }, INTERVAL_MS);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [currentUser?.$id]);

  return null;
}
