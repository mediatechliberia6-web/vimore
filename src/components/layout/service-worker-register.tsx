'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Listen for SW_UPDATED broadcast from the activated service worker.
    // Fire a DOM event so any component inside the provider tree can react.
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SW_UPDATED') {
        window.dispatchEvent(new CustomEvent('sw-updated', { detail: { version: event.data.version } }));
      }
    };
    navigator.serviceWorker.addEventListener('message', onMessage);

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // If a new SW is already waiting when we register, signal an update immediately.
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version installed and waiting — tell it to take over now.
              newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
          });
        });
      })
      .catch(() => {
        // Service worker registration failed silently — app still works without it.
      });

    return () => {
      navigator.serviceWorker.removeEventListener('message', onMessage);
    };
  }, []);

  return null;
}
