"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { 
  Phone, 
  PhoneOff, 
  Video, 
  Zap, 
  ShieldCheck, 
  CheckCircle2,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const RINGTONE_URL = "/sounds/incoming-ring.mp3";
const RINGBACK_URL = "/sounds/outgoing-ring.mp3";
const RING_TIMEOUT_SECONDS = 60;

export function IncomingCallOverlay() {
  const { callState, acceptCall, endCall, declineCall, triggerHaptic, settings } = usePosts();
  const { isPlaying, togglePlay } = useMusic();
  const { toast } = useToast();
  const router = useRouter();
  
  const [pulseScale, setPulseScale] = useState(1);
  const [outgoingSecondsLeft, setOutgoingSecondsLeft] = useState(RING_TIMEOUT_SECONDS);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const ringbackRef = useRef<HTMLAudioElement | null>(null);
  const wasMusicPlayingRef = useRef(false);
  const endCallRef = useRef(endCall);
  useEffect(() => { endCallRef.current = endCall; }, [endCall]);

  // Audio management based on call status
  useEffect(() => {
    if (callState.status === 'incoming') {
      if (isPlaying) { wasMusicPlayingRef.current = true; togglePlay(); }
      if (!ringtoneRef.current) ringtoneRef.current = new Audio(RINGTONE_URL);
      ringtoneRef.current.loop = true;
      if (!settings.isSilenceActive) ringtoneRef.current.play().catch(() => {});
    } else if (callState.status === 'outgoing' || callState.status === 'ringing') {
      if (isPlaying) { wasMusicPlayingRef.current = true; togglePlay(); }
      if (!ringbackRef.current) ringbackRef.current = new Audio(RINGBACK_URL);
      ringbackRef.current.loop = true;
      ringbackRef.current.play().catch(() => {});
    } else {
      if (ringtoneRef.current) { ringtoneRef.current.pause(); ringtoneRef.current.currentTime = 0; }
      if (ringbackRef.current) { ringbackRef.current.pause(); ringbackRef.current.currentTime = 0; }
      if (wasMusicPlayingRef.current && !isPlaying) { togglePlay(); wasMusicPlayingRef.current = false; }
    }

    const interval = setInterval(() => {
      if (callState.status !== 'idle') setPulseScale(s => s === 1 ? 1.1 : 1);
    }, 1000);
    
    return () => {
      clearInterval(interval);
      if (ringtoneRef.current) ringtoneRef.current.pause();
      if (ringbackRef.current) ringbackRef.current.pause();
    };
  }, [callState.status, isPlaying, togglePlay, settings.isSilenceActive]);

  // 60-second ring timeout for outgoing calls with countdown
  useEffect(() => {
    if (callState.status !== 'outgoing' && callState.status !== 'ringing') {
      setOutgoingSecondsLeft(RING_TIMEOUT_SECONDS);
      return;
    }
    setOutgoingSecondsLeft(RING_TIMEOUT_SECONDS);

    // Countdown ticker
    const ticker = setInterval(() => {
      setOutgoingSecondsLeft(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    // Auto-end the call after timeout
    const timeout = setTimeout(() => {
      endCallRef.current();
    }, RING_TIMEOUT_SECONDS * 1000);

    return () => {
      clearInterval(ticker);
      clearTimeout(timeout);
    };
  }, [callState.status]);

  if (callState.status === 'idle' || !callState.contact) return null;

  const handleAccept = async () => {
    if (settings.isFreeMode) {
      endCall();
      toast({ variant: "destructive", title: "Free Mode Active", description: "Calls are disabled in Free Mode." });
      return;
    }
    triggerHaptic(50);
    await acceptCall();
    router.push(`/messages/call/${callState.contact!.username}`);
  };

  // Outgoing / ringing screen
  if (callState.status === 'outgoing' || callState.status === 'ringing') {
    return (
      <div className="fixed inset-0 z-[600] bg-black flex flex-col items-center justify-center animate-in fade-in">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-8">
          <Avatar className="h-32 w-32 border-4 border-primary animate-pulse shadow-2xl">
            <AvatarImage src={callState.contact.avatar} />
            <AvatarFallback>V</AvatarFallback>
          </Avatar>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black italic uppercase text-white">Calling {callState.contact.name}</h2>
            <div className="flex items-center justify-center gap-2 text-primary">
              <Volume2 className="h-4 w-4 animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-widest">Ringing Node...</span>
            </div>
            {/* Countdown ring */}
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className="relative h-10 w-10">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none"
                    stroke="#9940E5" strokeWidth="3"
                    strokeDasharray={`${(outgoingSecondsLeft / RING_TIMEOUT_SECONDS) * 94.25} 94.25`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">
                  {outgoingSecondsLeft}s
                </span>
              </div>
              <span className="text-[10px] text-white/40 font-medium uppercase tracking-widest">Auto-ends</span>
            </div>
          </div>
          <Button
            variant="ghost" size="icon"
            className="h-20 w-20 rounded-full bg-destructive text-white mt-12"
            onClick={() => endCall()}
          >
            <PhoneOff className="h-8 w-8" />
          </Button>
        </div>
      </div>
    );
  }

  // Incoming call screen
  return (
    <div className="fixed inset-0 z-[600] bg-[#050505]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 overflow-hidden animate-in fade-in duration-500">
      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-12">
        <header className="space-y-4">
          <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-1.5 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Incoming Handshake</span>
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Digital Pulse</h1>
        </header>

        <div className="relative h-48 w-48" style={{ transform: `scale(${pulseScale})` }}>
          <div className="absolute inset-[-20px] border border-primary/20 rounded-full animate-ping" />
          <div className="relative h-full w-full rounded-full border-4 border-primary shadow-2xl overflow-hidden bg-zinc-900">
            <Avatar className="h-full w-full"><AvatarImage src={callState.contact.avatar} /></Avatar>
          </div>
        </div>

        <div className="space-y-4 pt-12">
          <div className="flex items-center justify-center gap-12">
            <div className="flex flex-col items-center gap-3">
              <Button size="icon" className="h-20 w-20 rounded-full bg-destructive text-white" onClick={() => declineCall()}>
                <PhoneOff className="h-8 w-8" />
              </Button>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Decline</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <Button size="icon" className="h-24 w-24 rounded-full bg-green-500 text-white animate-bounce shadow-xl" onClick={handleAccept}>
                <CheckCircle2 className="h-10 w-10" />
              </Button>
              <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Accept Pulse</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
