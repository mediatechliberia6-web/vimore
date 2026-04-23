'use client';

import { useState } from 'react';
import { useNetwork } from '@/context/NetworkContext';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, Gauge } from 'lucide-react';

export function NetworkTierIndicator() {
  const { tier, effectiveType, downlink, saveData, isOnline, forcedTier, setForcedTier } = useNetwork();
  const [open, setOpen] = useState(false);

  // Hide when on rich tier and online (no point cluttering the header)
  if (tier === 'rich' && isOnline && !forcedTier) return null;

  const dotColor =
    !isOnline ? 'bg-red-500'
    : tier === 'lite' ? 'bg-amber-500'
    : tier === 'standard' ? 'bg-yellow-400'
    : 'bg-emerald-500';

  const label =
    !isOnline ? 'Offline'
    : tier === 'lite' ? 'Lite mode'
    : tier === 'standard' ? 'Standard'
    : 'Full speed';

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Network: ${label}`}
        onClick={() => setOpen(o => !o)}
        className="rounded-full bg-secondary/50 h-9 w-9 flex items-center justify-center relative"
      >
        {isOnline ? <Wifi className="h-4 w-4 text-muted-foreground" /> : <WifiOff className="h-4 w-4 text-red-500" />}
        <span className={cn("absolute top-1.5 right-1.5 h-2 w-2 rounded-full ring-2 ring-white dark:ring-background", dotColor)} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-card border border-border rounded-xl shadow-xl p-3 z-[60] text-xs">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{label}</span>
          </div>
          <div className="space-y-1 text-muted-foreground">
            <div>Network: <span className="font-mono text-foreground">{effectiveType}</span></div>
            <div>Downlink: <span className="font-mono text-foreground">{downlink} Mbps</span></div>
            {saveData && <div className="text-amber-600">Data Saver is on</div>}
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground mb-1.5">Force mode (debug):</p>
            <div className="grid grid-cols-4 gap-1">
              {(['lite', 'standard', 'rich'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setForcedTier(forcedTier === t ? null : t)}
                  className={cn(
                    "px-1.5 py-1 rounded text-[10px] font-medium transition-colors",
                    forcedTier === t ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                  )}
                >
                  {t}
                </button>
              ))}
              <button
                onClick={() => setForcedTier(null)}
                className={cn(
                  "px-1.5 py-1 rounded text-[10px] font-medium transition-colors",
                  !forcedTier ? "bg-primary text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                )}
              >
                auto
              </button>
            </div>
          </div>
          {tier === 'lite' && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Saving data: smaller images, no autoplay, fewer live updates.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
