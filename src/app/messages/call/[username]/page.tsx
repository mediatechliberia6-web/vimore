"use client";

import { useState, useEffect, useRef, use } from "react";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Zap, 
  Volume2,
  VolumeX,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMusic } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { AGORA_APP_ID } from "@/lib/agora";
import type { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteUser, IRemoteVideoTrack } from "agora-rtc-sdk-ng";

export default function CallPage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { triggerHaptic } = useMusic();
  const { currentUser, callState, endCall } = usePosts();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callState.type === 'audio');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [remoteUserJoined, setRemoteUserJoined] = useState(false);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<IRemoteVideoTrack | null>(null);

  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);
  const localTracksRef = useRef<{ video: ICameraVideoTrack | null; audio: IMicrophoneAudioTrack | null }>({ video: null, audio: null });
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);

  const isAudioCall = callState.type === 'audio';

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
    if (callState.status === 'idle' && !isConnecting) {
      router.push('/messages');
    }
  }, [callState.status, router, isConnecting]);

  useEffect(() => {
    if (remoteUserJoined && remoteVideoTrack && remoteVideoRef.current) {
      remoteVideoTrack.play(remoteVideoRef.current);
    }
  }, [remoteUserJoined, remoteVideoTrack]);

  useEffect(() => {
    const initAgora = async () => {
      if (callState.status !== 'active') return;

      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      agoraClientRef.current = client;

      client.on("user-published", async (user: IRemoteUser, mediaType: "video" | "audio") => {
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          setRemoteVideoTrack(user.videoTrack || null);
          setRemoteUserJoined(true);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      client.on("user-left", () => {
        setRemoteUserJoined(false);
        setRemoteVideoTrack(null);
      });

      try {
        if (!callState.channelName || !callState.token) {
          handleEndCall();
          return;
        }

        await client.join(AGORA_APP_ID, callState.channelName, callState.token, null);

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracksRef.current = { audio: audioTrack, video: videoTrack };

        if (!isAudioCall) {
          videoTrack.play(localVideoRef.current!);
        }

        await client.publish(isAudioCall ? [audioTrack] : [audioTrack, videoTrack]);
        setIsConnecting(false);
        triggerHaptic(50);
      } catch (e) {
        console.error("Agora Error:", e);
        handleEndCall();
      }
    };

    initAgora();

    return () => {
      localTracksRef.current.audio?.stop();
      localTracksRef.current.audio?.close();
      localTracksRef.current.video?.stop();
      localTracksRef.current.video?.close();
      agoraClientRef.current?.leave();
    };
  }, [callState.status, callState.channelName, callState.token, isAudioCall, triggerHaptic]);

  const handleEndCall = () => {
    triggerHaptic(100);
    const finalDuration = formatDuration(callDuration);
    endCall(finalDuration);
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
    <div className="fixed inset-0 z-[500] bg-black flex flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 bg-zinc-950">
        {isConnecting ? (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-8">
            <div className="relative">
              <div className="absolute -inset-12 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <Loader2 className="h-24 w-24 text-primary animate-spin" />
              <Avatar className="absolute inset-4 h-16 w-16">
                <AvatarImage src={callState.contact?.avatar} />
              </Avatar>
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Synchronizing Node...</h2>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {remoteUserJoined && !isAudioCall ? (
              <div ref={remoteVideoRef} className="w-full h-full bg-black" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-12">
                <Avatar className="h-48 w-48 border-4 border-primary shadow-2xl">
                  <AvatarImage src={callState.contact?.avatar} />
                </Avatar>
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-black italic uppercase text-white">{callState.contact?.name}</h3>
                  <div className="flex items-center justify-center gap-2 text-primary animate-pulse font-black uppercase text-xs">
                    <Volume2 className="h-4 w-4" /> Link Active
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {!isAudioCall && !isConnecting && (
        <div className={cn(
          "absolute top-24 right-6 z-50 w-32 aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl ring-2 ring-white/10 transition-all",
          isVideoOff && "opacity-0"
        )}>
          <div ref={localVideoRef} className="w-full h-full bg-zinc-900 scale-x-[-1]" />
        </div>
      )}

      <header className="absolute top-0 left-0 right-0 z-50 px-6 py-8 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-white/10 text-white" onClick={handleEndCall}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-black italic uppercase text-white">{callState.contact?.name}</h1>
            <span className="text-[10px] font-black text-primary uppercase">{formatDuration(callDuration)}</span>
          </div>
        </div>
        <div className="bg-primary/20 border border-primary/20 rounded-full px-4 py-1.5 flex items-center gap-2">
          <Zap className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase">Secure Sync</span>
        </div>
      </header>

      <footer className="absolute bottom-12 left-0 right-0 z-50 flex justify-center px-6">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-3 rounded-[3rem] flex items-center gap-4 shadow-2xl">
          <Button 
            variant="ghost" size="icon" 
            className={cn("h-14 w-14 rounded-full transition-all", isMuted ? "bg-destructive text-white" : "bg-white/5 text-white")}
            onClick={toggleMute}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </Button>

          {!isAudioCall && (
            <Button 
              variant="ghost" size="icon" 
              className={cn("h-14 w-14 rounded-full transition-all", isVideoOff ? "bg-primary text-white" : "bg-white/5 text-white")}
              onClick={toggleVideo}
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
