"use client";

import { useState, useEffect, useRef, use, useCallback } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Zap, Volume2, VolumeX, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMusic } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { AGORA_APP_ID } from "@/lib/agora";

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

  const agoraClientRef = useRef<any>(null);
  const localAudioTrackRef = useRef<any>(null);
  const localVideoTrackRef = useRef<any>(null);
  const localVideoContainerRef = useRef<HTMLDivElement>(null);
  const remoteVideoContainerRef = useRef<HTMLDivElement>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cleanupAgora = useCallback(async () => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (localVideoTrackRef.current) {
        localVideoTrackRef.current.close();
        localVideoTrackRef.current = null;
      }
      if (agoraClientRef.current) {
        await agoraClientRef.current.leave();
        agoraClientRef.current = null;
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!callState.channelName || !callState.token || !AGORA_APP_ID) {
      setCallStatus('failed');
      setStatusText('Call configuration missing.');
      return;
    }

    let mounted = true;
    const uid = Math.floor(Math.random() * 100000);

    const startCall = async () => {
      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;

        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        agoraClientRef.current = client;

        client.on('user-published', async (remoteUser: any, mediaType: 'audio' | 'video') => {
          await client.subscribe(remoteUser, mediaType);
          if (mediaType === 'audio') {
            remoteUser.audioTrack?.play();
          }
          if (mediaType === 'video' && remoteVideoContainerRef.current) {
            remoteUser.videoTrack?.play(remoteVideoContainerRef.current);
          }
        });

        client.on('user-unpublished', async (remoteUser: any, mediaType: 'audio' | 'video') => {
          await client.unsubscribe(remoteUser, mediaType);
        });

        client.on('user-left', () => {
          if (mounted) setStatusText('Call ended by the other party.');
        });

        await client.join(AGORA_APP_ID, callState.channelName!, callState.token!, uid);

        const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        localAudioTrackRef.current = localAudioTrack;

        if (!isAudioCall) {
          const localVideoTrack = await AgoraRTC.createCameraVideoTrack();
          localVideoTrackRef.current = localVideoTrack;
          if (localVideoContainerRef.current) {
            localVideoTrack.play(localVideoContainerRef.current);
          }
          await client.publish([localAudioTrack, localVideoTrack]);
        } else {
          await client.publish([localAudioTrack]);
        }

        if (mounted) {
          setCallStatus('connected');
          setStatusText('Call Active');
        }
      } catch (err: any) {
        if (mounted) {
          setCallStatus('failed');
          setStatusText(err?.message || 'Failed to connect to call.');
        }
      }
    };

    startCall();

    return () => {
      mounted = false;
      cleanupAgora();
    };
  }, [callState.channelName, callState.token, isAudioCall, cleanupAgora]);

  useEffect(() => {
    if (callStatus !== 'connected') return;
    const interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  useEffect(() => {
    if (callState.status === 'idle') {
      cleanupAgora().then(() => router.push('/messages'));
    }
  }, [callState.status, router, cleanupAgora]);

  const handleMuteToggle = () => {
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.setEnabled(isMuted);
    }
    setIsMuted(!isMuted);
    triggerHaptic(5);
  };

  const handleVideoToggle = () => {
    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.setEnabled(isVideoOff);
    }
    setIsVideoOff(!isVideoOff);
    triggerHaptic(5);
  };

  const handleEndCall = async () => {
    triggerHaptic(100);
    await cleanupAgora();
    endCall(formatDuration(callDuration));
    router.push('/messages');
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 bg-zinc-950">
        {!isAudioCall && (
          <>
            <div ref={remoteVideoContainerRef} className="absolute inset-0 w-full h-full object-cover" />
            <div ref={localVideoContainerRef} className="absolute bottom-32 right-4 w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20 z-10" />
          </>
        )}

        {(isAudioCall || callStatus === 'connecting') && (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-8">
            {callStatus === 'connecting' ? (
              <>
                <div className="relative">
                  <div className="absolute -inset-12 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                  <div className="h-24 w-24 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <Avatar className="absolute inset-4 h-16 w-16">
                    <AvatarImage src={callState.contact?.avatar} />
                    <AvatarFallback>{callState.contact?.name?.[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Connecting...</h2>
              </>
            ) : callStatus === 'failed' ? (
              <>
                <div className="h-24 w-24 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/20">
                  <PhoneOff className="h-12 w-12 text-red-400" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-black italic uppercase text-white">Call Failed</h2>
                  <p className="text-sm text-white/40">{statusText}</p>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-12">
                <Avatar className="h-48 w-48 border-4 border-primary shadow-2xl">
                  <AvatarImage src={callState.contact?.avatar} />
                  <AvatarFallback className="text-4xl">{callState.contact?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-black italic uppercase text-white">{callState.contact?.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-primary animate-pulse font-black uppercase text-xs">
                    <Volume2 className="h-4 w-4" /> {statusText}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <header className="absolute top-0 left-0 right-0 z-50 px-6 py-8 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/10 text-white" onClick={handleEndCall}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-black italic uppercase text-white">{callState.contact?.name || resolvedParams.username}</h1>
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
            className={cn("h-14 w-14 rounded-full transition-all", isSpeakerOn ? "bg-white/5 text-white" : "bg-white/5 text-white/40")}
            onClick={() => { triggerHaptic(5); setIsSpeakerOn(!isSpeakerOn); }}
          >
            {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}
