'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[SW] Registered. Scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[SW] Registration failed:', err);
        });
    }
  }, []);

  return null;
}
