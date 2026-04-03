'use client';

import { useState, useEffect } from 'react';
import { Zap, Globe, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { account } from '@/lib/appwrite';

const FREE_DOMAIN = 'free.vimore.cfd';
const MAIN_DOMAIN = 'vimore.cfd';

export function ModeSwitcher() {
  const [isFreeMode, setIsFreeMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProduction, setIsProduction] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      setIsFreeMode(hostname === FREE_DOMAIN || hostname.startsWith('free.'));
      setIsProduction(hostname === FREE_DOMAIN || hostname === MAIN_DOMAIN);
    }
  }, []);

  const handleToggle = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const targetDomain = isFreeMode ? MAIN_DOMAIN : FREE_DOMAIN;

    if (!isProduction) {
      window.location.href = isFreeMode ? '/' : '/free-mode';
      return;
    }

    try {
      const jwtObj = await account.createJWT();
      window.location.href = `https://${targetDomain}/api/session-handoff?jwt=${encodeURIComponent(jwtObj.jwt)}`;
    } catch {
      window.location.href = `https://${targetDomain}`;
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
