
"use client";

import { useState, useEffect, useRef, use } from "react";
import { 
  X, 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Maximize2, 
  Minimize2,
  Volume2,
  VolumeX,
  MoreHorizontal,
  Sparkles,
  Camera,
  Heart,
  ChevronLeft,
  Loader2,
  Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMusic } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { AGORA_APP_ID } from "@/lib/agora";
import type { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteUser } from "agora-rtc-sdk-ng";

export default function CallPage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const router = useRouter();
  const { triggerHaptic } = useMusic();
  const { currentUser, callState, endCall } = usePosts();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callState.type === 'audio');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<any>(null);

  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);
  const localTracksRef = useRef<{ video: ICameraVideoTrack | null; audio: IMicrophoneAudioTrack | null }>({ video: null, audio: null });
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const isAudioCall = callState.type === 'audio';
  const isOutgoing = callState.status === 'outgoing' || callState.status === 'ringing';

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (callState.status === 'active') setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState.status]);

  useEffect(() => {
    const initAgora = async () => {
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      agoraClientRef.current = client;

      // Signaling Handshake
      client.on("user-published", async (user: IRemoteUser, mediaType: "video" | "audio") => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          setRemoteVideoTrack(user.videoTrack);
          setRemoteUserJoined(true);
          user.videoTrack?.play(remoteVideoRef.current!);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      client.on("user-unpublished", (user) => {
        if (!user.videoTrack) setRemoteUserJoined(false);
      });

      try {
        // Use wildcard UID null to allow SDK to assign a compatible numeric UID for wildcard tokens
        const uid = await client.join(
          AGORA_APP_ID, 
          callState.channelName || "", 
          callState.token || null, 
          null
        );

        // Create hardware tracks
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracksRef.current = { audio: audioTrack, video: videoTrack };

        if (!isAudioCall) {
          videoTrack.play(localVideoRef.current!);
        }

        await client.publish(isAudioCall ? [audioTrack] : [audioTrack, videoTrack]);
        setIsConnecting(false);
        triggerHaptic(50);
      } catch (e) {
        console.error("Agora Handshake Failure:", e);
        handleEndCall();
      }
    };

    if (callState.token && callState.status !== 'idle') {
      initAgora();
    }

    return () => {
      localTracksRef.current.audio?.close();
      localTracksRef.current.video?.close();
      agoraClientRef.current?.leave();
    };
  }, [callState.token, callState.channelName, callState.status]);

  const handleEndCall = () => {
    triggerHaptic(100);
    endCall();
    router.push(`/messages`);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    localTracksRef.current.audio?.setEnabled(!next);
    triggerHaptic(5);
  };

  const toggleVideo = () => {
    const next = !isVideoOff;
    setIsVideoOff(next);
    localTracksRef.current.video?.setEnabled(!next);
    triggerHaptic(5);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col overflow-hidden select-none touch-none">
      {/* Remote Video Container */}
      <div className="absolute inset-0 z-0 bg-zinc-900">
        {isConnecting ? (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-8">
            <div className="relative">
              <div className="absolute -inset-12 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <div className="relative h-32 w-32 rounded-full border-4 border-primary/20 p-1 animate-[spin_4s_linear_infinite]">
                <div className="h-full w-full rounded-full border-t-4 border-primary shadow-[0_0_20px_rgba(153,64,229,0.5)]" />
              </div>
              <Avatar className="absolute inset-0 h-32 w-32 border-4 border-white/10">
                <AvatarImage src={callState.contact?.avatar} />
                <AvatarFallback>V</AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Synchronizing Node</h2>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Agora Edge Handshake Active</p>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {remoteUserJoined && !isAudioCall ? (
              <div ref={remoteVideoRef} className="w-full h-full animate-in fade-in duration-1000" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-12">
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                  <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
                  <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full animate-pulse delay-700" />
                </div>
                
                <div className="relative">
                  {isOutgoing && (
                    <div className="absolute -inset-8 border-2 border-primary/40 rounded-full animate-ping" />
                  )}
                  <Avatar className="h-48 w-48 border-4 border-white/10 shadow-2xl relative z-10">
                    <AvatarImage src={callState.contact?.avatar} />
                    <AvatarFallback>V</AvatarFallback>
                  </Avatar>
                </div>

                <div className="text-center space-y-2 z-10">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white">{callState.contact?.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
                    {isOutgoing ? (
                      <><Radio className="h-3 w-3" /> Calling Node...</>
                    ) : (
                      <><Volume2 className="h-3 w-3" /> Spatial Link Established</>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Local Video PiP */}
      {!isAudioCall && !isConnecting && (
        <div className={cn(
          "absolute top-20 right-6 z-50 w-32 sm:w-44 aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-2xl ring-2 ring-white/10 transition-all",
          isVideoOff && "opacity-0 scale-90"
        )}>
          <div ref={localVideoRef} className="w-full h-full bg-zinc-800" />
        </div>
      )}

      {/* Header Controls */}
      <header className="absolute top-0 left-0 right-0 z-50 px-6 py-8 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10" onClick={handleEndCall}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-black italic uppercase tracking-tighter text-white">{callState.contact?.name}</h1>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">
              {callState.status === 'active' ? `SYNCED: ${formatDuration(callDuration)}` : 'Handshaking...'}
            </span>
          </div>
        </div>
        <div className="bg-primary/20 backdrop-blur-md border border-primary/20 rounded-full px-4 py-1.5 flex items-center gap-2">
          <Zap className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">High-Velocity</span>
        </div>
      </header>

      {/* Command Dock */}
      <footer className="absolute bottom-12 left-0 right-0 z-50 flex justify-center px-6">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-3 rounded-[3rem] flex items-center gap-4 shadow-2xl">
          <Button 
            variant="ghost" size="icon" 
            className={cn("h-14 w-14 rounded-full transition-all", isMuted ? "bg-destructive/20 text-destructive" : "bg-white/5 text-white")}
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          {!isAudioCall && (
            <Button 
              variant="ghost" size="icon" 
              className={cn("h-14 w-14 rounded-full transition-all", isVideoOff ? "bg-primary/20 text-primary" : "bg-white/5 text-white")}
              onClick={toggleVideo}
            >
              {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </Button>
          )}

          <div className="w-px h-8 bg-white/10 mx-1" />

          <Button 
            className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-destructive text-white hover:bg-destructive/90 shadow-xl shadow-destructive/20 transition-all active:scale-90"
            onClick={handleEndCall}
          >
            <PhoneOff className="h-8 w-8" />
          </Button>

          <div className="w-px h-8 bg-white/10 mx-1" />

          <Button 
            variant="ghost" size="icon" 
            className={cn("h-14 w-14 rounded-full bg-white/5 text-white")}
            onClick={() => { triggerHaptic(5); setIsSpeakerOn(!isSpeakerOn); }}
          >
            {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
          </Button>
        </div>
      </footer>
    </div>
  );
}
