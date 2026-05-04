'use client';

import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PhoneOff, Video, Phone } from 'lucide-react';
import { useCall } from '@/context/CallContext';

function useRingback(active: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!audioRef.current) {
      const audio = new Audio('/sounds/ringtone.wav');
      audio.loop = true;
      audio.volume = 0.6;
      audioRef.current = audio;
    }

    if (active) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    return () => {
      audioRef.current?.pause();
    };
  }, [active]);
}

function useElapsedTimer(active: boolean) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!active) { setElapsed(0); return; }
    setElapsed(0);
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [active]);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function OutgoingCallScreen() {
  const { callState, cancelCall } = useCall();
  const isVisible = callState.status === 'outgoing';
  const elapsed = useElapsedTimer(isVisible);

  useRingback(isVisible);

  if (!isVisible || !callState.contact) return null;

  const { contact, callType } = callState;
  const isVideo = callType === 'video';

  return (
    <div className="fixed inset-0 z-[500] flex flex-col bg-zinc-950 animate-in fade-in duration-300">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/30 via-zinc-950 to-zinc-950" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center gap-8 px-8">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">
          {isVideo ? 'Video' : 'Voice'} Call
        </span>

        <div className="relative flex items-center justify-center">
          <span className="absolute inline-flex h-52 w-52 rounded-full border border-violet-500/20 animate-ping" style={{ animationDuration: '2s' }} />
          <span className="absolute inline-flex h-44 w-44 rounded-full border border-violet-500/30 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.4s' }} />
          <span className="absolute inline-flex h-36 w-36 rounded-full border border-violet-500/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.8s' }} />
          <Avatar className="h-28 w-28 border-4 border-violet-500/50 shadow-[0_0_60px_rgba(153,64,229,0.35)] relative z-10">
            <AvatarImage src={contact.avatar} />
            <AvatarFallback className="text-4xl font-black bg-violet-900 text-violet-200">
              {contact.name?.[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col items-center gap-1 text-center">
          <h2 className="text-2xl font-black text-white tracking-tight">{contact.name}</h2>
          <span className="text-sm text-zinc-400 font-medium">@{contact.username}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="text-sm font-medium">Calling</span>
            <span className="flex gap-0.5">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="inline-block h-1 w-1 rounded-full bg-violet-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          </div>
          <span className="text-xs font-mono text-zinc-600 tabular-nums">{elapsed}</span>
        </div>
      </div>

      <div className="relative pb-16 pt-8 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={cancelCall}
            className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center shadow-xl shadow-red-500/40"
          >
            <PhoneOff className="h-7 w-7 text-white" />
          </button>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Cancel</span>
        </div>
      </div>
    </div>
  );
}
