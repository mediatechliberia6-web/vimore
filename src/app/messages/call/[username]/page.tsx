"use client";

import { useState, useEffect, use, useCallback } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Zap, Volume2, VolumeX, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMusic } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function CallPage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { triggerHaptic } = useMusic();
  const { currentUser, callState, endCall } = usePosts();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callState.type === 'audio');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [statusText, setStatusText] = useState('Connecting...');

  const isAudioCall = callState.type === 'audio';

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setCallStatus('connected');
      setStatusText('Call Active');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (callStatus !== 'connected') return;
    const interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  useEffect(() => {
    if (callState.status === 'idle') {
      router.push('/messages');
    }
  }, [callState.status, router]);

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    triggerHaptic(5);
  };

  const handleVideoToggle = () => {
    setIsVideoOff(!isVideoOff);
    triggerHaptic(5);
  };

  const handleEndCall = useCallback(async () => {
    triggerHaptic(100);
    endCall(formatDuration(callDuration));
    router.push('/messages');
  }, [triggerHaptic, endCall, callDuration, router]);

  const contact = callState.contact;
  const contactName = contact?.name || resolvedParams.username;
  const contactAvatar = contact?.avatar;

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 bg-zinc-950">
        {!isAudioCall && callStatus === 'connected' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-full h-full opacity-30"
              style={{ background: 'radial-gradient(ellipse at center, #7c3aed 0%, #000 70%)' }}
            />
          </div>
        )}

        <div className="w-full h-full flex flex-col items-center justify-center space-y-8">
          {callStatus === 'connecting' ? (
            <>
              <div className="relative">
                <div className="absolute -inset-12 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                <div className="h-24 w-24 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <Avatar className="absolute inset-4 h-16 w-16">
                  <AvatarImage src={contactAvatar} />
                  <AvatarFallback>{contactName?.[0]}</AvatarFallback>
                </Avatar>
              </div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Connecting...</h2>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-12">
              <div className="relative">
                <div className="absolute -inset-8 bg-primary/10 blur-2xl rounded-full animate-pulse" />
                <Avatar className="h-48 w-48 border-4 border-primary shadow-2xl relative">
                  <AvatarImage src={contactAvatar} />
                  <AvatarFallback className="text-4xl">{contactName?.[0]}</AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-black italic uppercase text-white">{contactName}</h3>
                <div className="flex items-center justify-center gap-2 text-primary animate-pulse font-black uppercase text-xs">
                  <Volume2 className="h-4 w-4" /> {statusText}
                </div>
                {callStatus === 'connected' && (
                  <p className="text-white/60 text-sm font-mono">{formatDuration(callDuration)}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <header className="absolute top-0 left-0 right-0 z-50 px-6 py-8 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/10 text-white" onClick={handleEndCall}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-black italic uppercase text-white">{contactName}</h1>
            <span className="text-[10px] font-black text-primary uppercase">
              {callStatus === 'connected' ? formatDuration(callDuration) : statusText}
            </span>
          </div>
        </div>
        <div className="bg-primary/20 border border-primary/20 rounded-full px-4 py-1.5 flex items-center gap-2">
          <Zap className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase">Secure</span>
        </div>
      </header>

      <footer className="absolute bottom-12 left-0 right-0 z-50 flex justify-center px-6">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-3 rounded-[3rem] flex items-center gap-4 shadow-2xl">
          <Button
            variant="ghost" size="icon"
            className={cn("h-14 w-14 rounded-full transition-all", isMuted ? "bg-destructive text-white" : "bg-white/5 text-white")}
            onClick={handleMuteToggle}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          {!isAudioCall && (
            <Button
              variant="ghost" size="icon"
              className={cn("h-14 w-14 rounded-full transition-all", isVideoOff ? "bg-primary text-white" : "bg-white/5 text-white")}
              onClick={handleVideoToggle}
            >
              {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </Button>
          )}

          <div className="w-px h-8 bg-white/10 mx-1" />

          <Button className="h-16 w-16 rounded-full bg-destructive text-white shadow-xl shadow-destructive/20" onClick={handleEndCall}>
            <PhoneOff className="h-8 w-8" />
          </Button>

          <div className="w-px h-8 bg-white/10 mx-1" />

          <Button
            variant="ghost" size="icon"
            className={cn("h-14 w-14 rounded-full transition-all", "bg-white/5 text-white")}
            onClick={() => { triggerHaptic(5); setIsSpeakerOn(!isSpeakerOn); }}
          >
            {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}
