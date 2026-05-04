'use client';

import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useCall } from '@/context/CallContext';

function useRingtone(active: boolean) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!audioRef.current) {
      const audio = new Audio('/sounds/ringtone.wav');
      audio.loop = true;
      audio.volume = 0.85;
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

export function IncomingCallOverlay() {
  const { callState, acceptCall, declineCall } = useCall();
  const isVisible = callState.status === 'incoming';

  useRingtone(isVisible);

  if (!isVisible || !callState.contact) return null;

  const { contact, callType } = callState;
  const isVideo = callType === 'video';

  return (
    <div className="fixed inset-0 z-[600] flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(153,64,229,0.15)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-8 px-8 w-full max-w-sm">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">
          Incoming {isVideo ? 'Video' : 'Audio'} Call
        </span>

        <div className="relative flex items-center justify-center">
          <span className="absolute inline-flex h-40 w-40 rounded-full bg-violet-500/10 animate-ping" style={{ animationDuration: '1.4s' }} />
          <span className="absolute inline-flex h-32 w-32 rounded-full bg-violet-500/15 animate-ping" style={{ animationDuration: '1.4s', animationDelay: '0.2s' }} />
          <Avatar className="h-28 w-28 border-4 border-violet-500/40 shadow-[0_0_40px_rgba(153,64,229,0.4)] relative z-10">
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

        <div className="flex items-center gap-2">
          {isVideo ? <Video className="h-4 w-4 text-violet-400" /> : <Phone className="h-4 w-4 text-violet-400" />}
          <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
            {isVideo ? 'Video' : 'Voice'} · Ringing
          </span>
        </div>

        <div className="flex items-center justify-center gap-16 mt-4">
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={declineCall}
              className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center shadow-xl shadow-red-500/40"
            >
              <PhoneOff className="h-7 w-7 text-white" />
            </button>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Decline</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={acceptCall}
              className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center shadow-xl shadow-green-500/40 animate-pulse"
              style={{ animationDuration: '1.5s' }}
            >
              <Phone className="h-7 w-7 text-white" />
            </button>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Answer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
