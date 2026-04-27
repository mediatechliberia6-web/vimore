"use client";

import { useState, useEffect, use, useCallback, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Zap, Volume2, VolumeX, ChevronLeft, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMusic } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID || '4afa1dbbd2ee4695ad1d29eaa0310ca3';

export default function CallPage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { triggerHaptic } = useMusic();
  const { currentUser, callState, endCall } = usePosts();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callState.type === 'audio');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [statusText, setStatusText] = useState('Connecting...');
  const [callDuration, setCallDuration] = useState(0);
  const [remoteVideoVisible, setRemoteVideoVisible] = useState(false);

  const callDurationRef = useRef(0);
  const clientRef = useRef<any>(null);
  const localAudioRef = useRef<any>(null);
  const localVideoRef = useRef<any>(null);
  const isAudioCall = callState.type === 'audio';

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    callDurationRef.current = callDuration;
  }, [callDuration]);

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

  const cleanup = useCallback(async () => {
    try {
      if (localAudioRef.current) {
        localAudioRef.current.stop();
        localAudioRef.current.close();
        localAudioRef.current = null;
      }
    } catch {}
    try {
      if (localVideoRef.current) {
        localVideoRef.current.stop();
        localVideoRef.current.close();
        localVideoRef.current = null;
      }
    } catch {}
    try {
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current = null;
      }
    } catch {}
  }, []);

  useEffect(() => {
    let destroyed = false;

    const startCall = async () => {
      if (!APP_ID) {
        setCallStatus('failed');
        setStatusText('Agora App ID missing');
        return;
      }

      try {
        const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
        AgoraRTC.setLogLevel(4);

        const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
        clientRef.current = client;

        client.on('user-published', async (user: any, mediaType: 'audio' | 'video') => {
          try {
            await client.subscribe(user, mediaType);
            if (mediaType === 'audio') {
              user.audioTrack?.play();
              if (!destroyed) {
                setCallStatus('connected');
                setStatusText('Call Active');
              }
            }
            if (mediaType === 'video' && !isAudioCall) {
              user.videoTrack?.play('remote-video-container');
              if (!destroyed) setRemoteVideoVisible(true);
            }
          } catch {}
        });

        client.on('user-unpublished', (_user: any, mediaType: 'audio' | 'video') => {
          if (mediaType === 'video' && !destroyed) setRemoteVideoVisible(false);
        });

        client.on('user-left', () => {
          if (!destroyed) {
            endCall(formatDuration(callDurationRef.current));
            router.push('/messages');
          }
        });

        let channelName = callState.channelName;
        let token = callState.token;
        const uid = Math.floor(Math.random() * 100000);

        if (!channelName) {
          channelName = `vimore_${Date.now()}`;
        }

        if (!token) {
          try {
            const res = await fetch('/api/agora-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ channelName, uid }),
            });
            const data = await res.json();
            token = data.token || '';
          } catch {
            token = '';
          }
        }

        await client.join(APP_ID, channelName, token || null, uid);

        if (destroyed) return;
        setStatusText('Publishing media...');

        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        localAudioRef.current = audioTrack;
        const tracksToPublish: any[] = [audioTrack];

        if (!isAudioCall) {
          try {
            const videoTrack = await AgoraRTC.createCameraVideoTrack();
            localVideoRef.current = videoTrack;
            tracksToPublish.push(videoTrack);
            if (!destroyed) videoTrack.play('local-video-container');
          } catch {}
        }

        await client.publish(tracksToPublish);

        if (!destroyed) {
          setCallStatus('connected');
          setStatusText('Call Active');
        }
      } catch (err: any) {
        console.error('Agora call error:', err);
        if (!destroyed) {
          setCallStatus('failed');
          setStatusText(err?.message || 'Connection failed');
          // Auto-reset call state after 3 seconds so both sides can call again
          setTimeout(() => {
            if (!destroyed) {
              cleanup();
              endCall(undefined);
              router.push('/messages');
            }
          }, 3000);
        }
      }
    };

    startCall();

    return () => {
      destroyed = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleMuteToggle = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      try { localAudioRef.current?.setEnabled(!next); } catch {}
      return next;
    });
    triggerHaptic(5);
  }, [triggerHaptic]);

  const handleVideoToggle = useCallback(() => {
    setIsVideoOff(prev => {
      const next = !prev;
      try { localVideoRef.current?.setEnabled(!next); } catch {}
      return next;
    });
    triggerHaptic(5);
  }, [triggerHaptic]);

  const handleEndCall = useCallback(async () => {
    triggerHaptic(100);
    await cleanup();
    endCall(formatDuration(callDurationRef.current));
    router.push('/messages');
  }, [triggerHaptic, cleanup, endCall, router]);

  const contact = callState.contact;
  const contactName = contact?.name || resolvedParams.username;
  const contactAvatar = contact?.avatar;

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col overflow-hidden">
      {!isAudioCall && (
        <>
          <div
            id="remote-video-container"
            className={cn(
              "absolute inset-0 z-0 bg-zinc-950",
              !remoteVideoVisible && "hidden"
            )}
          />
          <div
            id="local-video-container"
            className="absolute bottom-32 right-4 z-20 w-28 h-40 rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-xl"
          />
        </>
      )}

      {(isAudioCall || !remoteVideoVisible) && (
        <div className="absolute inset-0 z-0 bg-zinc-950">
          {!isAudioCall && callStatus === 'connected' && (
            <div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at center, #7c3aed22 0%, #000 70%)' }}
            />
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
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">{statusText}</h2>
              </>
            ) : callStatus === 'failed' ? (
              <>
                <WifiOff className="h-20 w-20 text-destructive" />
                <p className="text-white/70 text-sm text-center px-8">{statusText}</p>
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
                  <p className="text-white/60 text-sm font-mono">{formatDuration(callDuration)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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

          <Button
            className="h-16 w-16 rounded-full bg-destructive text-white shadow-xl shadow-destructive/20"
            onClick={handleEndCall}
          >
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
