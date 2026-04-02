'use client';

import { useState, useEffect } from 'react';
import { Zap, Globe, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePosts } from '@/context/PostContext';

const FREE_DOMAIN = 'free.vimore.cfd';

export function ModeSwitcher() {
  const { settings } = usePosts();
  const [isOnFreeDomain, setIsOnFreeDomain] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnFreeDomain(window.location.hostname === FREE_DOMAIN);
    }
  }, []);

  const isFreeMode = isOnFreeDomain || settings.isFreeMode;

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/set-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable: !isFreeMode }),
      });

      if (!res.ok) throw new Error('Failed to set mode');

      const { redirectUrl } = await res.json();
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('[ModeSwitcher] Error:', err);
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      title={isFreeMode ? 'Switch to Full Mode' : 'Switch to Free Mode'}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border select-none',
        isFreeMode
          ? 'bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20'
          : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
        isLoading && 'opacity-60 cursor-not-allowed'
      )}
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isFreeMode ? (
        <Zap className="h-3 w-3" />
      ) : (
        <Globe className="h-3 w-3" />
      )}
      {isFreeMode ? 'Free Mode' : 'Full Mode'}
    </button>
  );
}
