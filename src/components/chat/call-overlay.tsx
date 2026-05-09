'use client';

import { useEffect, useRef, useState } from 'react';
import { useCall } from '@/context/CallContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Phone, PhoneOff, Mic, MicOff, VideoOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function formatDuration(s: number) {
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

export function CallOverlay() {
  const {
    callPhase, callInfo, callError, localStream, remoteStream,
    isMuted, isVideoOff,
    acceptCall, declineCall, endCall, toggleMute, switchToAudio, clearCallError,
  } = useCall();
  const { toast } = useToast();

  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (callPhase !== 'active') { setDuration(0); return; }
    const id = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(id);
  }, [callPhase]);

  useEffect(() => {
    if (callError) {
      toast({ variant: 'destructive', title: 'Call Failed', description: callError });
      clearCallError();
    }
  }, [callError, toast, clearCallError]);

  if (callPhase === 'idle' || !callInfo) return null;

  const isVideo = callInfo.callType === 'video';
  const initial = callInfo.contactName[0]?.toUpperCase() ?? '?';

  // ── INCOMING ─────────────────────────────────────────────────────────────
  if (callPhase === 'ringing') {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-b from-violet-950 via-violet-900 to-black select-none">
        <div className="relative flex items-center justify-center mb-10">
          <span className="absolute h-44 w-44 rounded-full bg-violet-400/10 animate-ping" style={{ animationDuration: '1.8s' }} />
          <span className="absolute h-36 w-36 rounded-full bg-violet-400/15 animate-ping" style={{ animationDuration: '1.4s', animationDelay: '0.3s' }} />
          <Avatar className="relative z-10 h-28 w-28 border-4 border-white/20 shadow-[0_0_60px_rgba(139,92,246,0.5)]">
            <AvatarImage src={callInfo.contactAvatar} />
            <AvatarFallback className="text-4xl bg-violet-800 text-white font-black">{initial}</AvatarFallback>
          </Avatar>
        </div>

        <h2 className="text-white text-3xl font-black tracking-tight mb-2">{callInfo.contactName}</h2>
        <p className="text-violet-300 text-xs font-bold uppercase tracking-[0.25em] mb-20">
          Incoming {isVideo ? 'Video' : 'Voice'} Call
        </p>

        <div className="flex items-end gap-20">
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={declineCall}
              className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-400 active:scale-95 transition-all shadow-2xl shadow-red-500/50 flex items-center justify-center border-4 border-red-400/30"
            >
              <PhoneOff className="h-8 w-8 text-white" />
            </button>
            <span className="text-white/50 text-[10px] font-black uppercase tracking-widest">Decline</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <button
              onClick={acceptCall}
              className="h-20 w-20 rounded-full bg-green-500 hover:bg-green-400 active:scale-95 transition-all shadow-2xl shadow-green-500/50 flex items-center justify-center border-4 border-green-400/30 animate-pulse"
              style={{ animationDuration: '1.2s' }}
            >
              <Phone className="h-8 w-8 text-white" />
            </button>
            <span className="text-white/50 text-[10px] font-black uppercase tracking-widest">Accept</span>
          </div>
        </div>
      </div>
    );
  }

  // ── DIALING ───────────────────────────────────────────────────────────────
  if (callPhase === 'dialing') {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-b from-violet-950 via-violet-900 to-black select-none overflow-hidden">
        {isVideo && localStream && (
          <video
            ref={localVideoRef}
            autoPlay muted playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-[0.15] scale-x-[-1]"
          />
        )}

        <div className="relative z-10 flex flex-col items-center">
          <Avatar className="h-32 w-32 border-4 border-white/20 shadow-[0_0_80px_rgba(139,92,246,0.4)] mb-7">
            <AvatarImage src={callInfo.contactAvatar} />
            <AvatarFallback className="text-5xl bg-violet-800 text-white font-black">{initial}</AvatarFallback>
          </Avatar>

          <h2 className="text-white text-3xl font-black tracking-tight mb-2">{callInfo.contactName}</h2>

          <div className="flex items-center gap-2 mb-24">
            <span className="text-green-400 text-sm font-bold uppercase tracking-widest">Calling</span>
            <span className="flex gap-1 pt-0.5">
              {[0, 1, 2].map(i => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-green-400 animate-bounce"
                  style={{ animationDelay: `${i * 160}ms` }} />
              ))}
            </span>
          </div>

          <button
            onClick={endCall}
            className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-400 active:scale-95 transition-all shadow-2xl shadow-red-500/50 flex items-center justify-center border-4 border-red-400/30"
          >
            <PhoneOff className="h-8 w-8 text-white" />
          </button>
          <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-3">Cancel</span>
        </div>
      </div>
    );
  }

  // ── ACTIVE CALL ───────────────────────────────────────────────────────────
  if (callPhase === 'active') {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex flex-col select-none">

        {/* Remote video — full screen background */}
        {isVideo && remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-violet-950 to-black">
            <div className="flex flex-col items-center gap-6">
              <Avatar className="h-36 w-36 border-4 border-white/10 shadow-[0_0_80px_rgba(139,92,246,0.3)]">
                <AvatarImage src={callInfo.contactAvatar} />
                <AvatarFallback className="text-6xl bg-violet-800 text-white font-black">{initial}</AvatarFallback>
              </Avatar>
              {/* Audio wave animation */}
              <div className="flex items-end gap-1 h-8">
                {[0,1,2,3,4].map(i => (
                  <div
                    key={i}
                    className="w-1.5 bg-violet-400 rounded-full animate-bounce"
                    style={{
                      height: `${[40, 70, 100, 70, 40][i]}%`,
                      animationDelay: `${i * 120}ms`,
                      animationDuration: '0.9s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Top overlay — contact name + timer */}
        <div className="relative z-10 pt-14 px-6 pb-6 bg-gradient-to-b from-black/80 to-transparent">
          <p className="text-white font-black text-xl tracking-tight leading-tight">{callInfo.contactName}</p>
          <p className="text-green-400 text-sm font-bold tabular-nums tracking-widest mt-0.5">
            {formatDuration(duration)}
          </p>
        </div>

        {/* Local video PiP */}
        {isVideo && localStream && !isVideoOff && (
          <div className="absolute top-20 right-4 z-20 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black">
            <video
              ref={localVideoRef}
              autoPlay muted playsInline
              className="w-full h-full object-cover scale-x-[-1]"
            />
          </div>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-14 pt-8 px-6 bg-gradient-to-t from-black/90 to-transparent">
          <div className="flex items-center justify-center gap-6">

            {/* Mute */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={toggleMute}
                className={cn(
                  'h-16 w-16 rounded-full flex items-center justify-center border-2 active:scale-95 transition-all shadow-xl',
                  isMuted
                    ? 'bg-white/25 border-white/40 text-white'
                    : 'bg-white/10 border-white/20 text-white',
                )}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>
              <span className="text-white/50 text-[9px] font-black uppercase tracking-widest">
                {isMuted ? 'Unmute' : 'Mute'}
              </span>
            </div>

            {/* End call */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={endCall}
                className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-400 active:scale-95 transition-all shadow-2xl shadow-red-500/50 flex items-center justify-center border-4 border-red-400/30"
              >
                <PhoneOff className="h-8 w-8 text-white" />
              </button>
              <span className="text-white/50 text-[9px] font-black uppercase tracking-widest">End</span>
            </div>

            {/* Switch to audio / audio mode badge */}
            <div className="flex flex-col items-center gap-2">
              {isVideo && !isVideoOff ? (
                <>
                  <button
                    onClick={switchToAudio}
                    className="h-16 w-16 rounded-full bg-white/10 border-2 border-white/20 text-white flex items-center justify-center active:scale-95 transition-all shadow-xl"
                  >
                    <VideoOff className="h-6 w-6" />
                  </button>
                  <span className="text-white/50 text-[9px] font-black uppercase tracking-widest">Audio</span>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-white/5 border-2 border-white/10 text-white/30 flex items-center justify-center">
                    <VideoOff className="h-6 w-6" />
                  </div>
                  <span className="text-white/30 text-[9px] font-black uppercase tracking-widest">Audio</span>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    );
  }

  return null;
}
