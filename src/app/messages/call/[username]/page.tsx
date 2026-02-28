
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
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMusic } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TooltipProvider } from "@/components/ui/tooltip";

const MOCK_USERS: Record<string, any> = {
  "arivera": { name: "Alex Rivera", avatar: "https://picsum.photos/seed/1/400/400", isVerified: true },
  "schen_dev": { name: "Sarah Chen", avatar: "https://picsum.photos/seed/2/400/400", isVerified: true },
  "mstone": { name: "Marcus Stone", avatar: "https://picsum.photos/seed/3/400/400", isVerified: false },
};

export default function VideoCallPage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const router = useRouter();
  const { triggerHaptic } = useMusic();
  const { currentUser, callState, endCall } = usePosts();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isUiVisible, setIsUiVisible] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnecting, setIsConnecting] = useState(true);
  const [cameraMode, setCameraMode] = useState<"user" | "environment">("user");

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteUser = MOCK_USERS[username] || { name: username, avatar: `https://picsum.photos/seed/${username}/400/400`, isVerified: false };

  // 1. Connection Handshake
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsConnecting(false);
      triggerHaptic(50);
    }, 2500);

    const interval = setInterval(() => {
      if (!isConnecting) setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [isConnecting, triggerHaptic]);

  // 2. Camera Access Handshake with Flip Logic
  useEffect(() => {
    const getCameraPermission = async () => {
      // 1. Force release of existing tracks
      if (localVideoRef.current?.srcObject) {
        const currentStream = localVideoRef.current.srcObject as MediaStream;
        currentStream.getTracks().forEach(track => track.stop());
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: cameraMode }, 
          audio: true 
        });
        setHasCameraPermission(true);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    if (!isVideoOff) {
      getCameraPermission();
    }

    return () => {
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoOff, cameraMode]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    triggerHaptic(100);
    
    // Temporal Logic: Store duration for the chat summary
    const durationStr = formatDuration(callDuration);
    localStorage.setItem('vimore_last_call_duration', durationStr);
    
    endCall();
    // Return to messages hub with a signal to show the end summary
    router.push(`/messages?lastCall=${username}`);
  };

  const handleFlipCamera = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(15);
    setCameraMode(prev => prev === "user" ? "environment" : "user");
  };

  const toggleUi = () => {
    setIsUiVisible(!isUiVisible);
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col overflow-hidden select-none touch-none">
      {/* 1. Main Immersive Canvas (Remote User) */}
      <div className="absolute inset-0 z-0 bg-zinc-900" onClick={toggleUi}>
        {isConnecting ? (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-8">
            <div className="relative">
              <div className="absolute -inset-12 bg-primary/20 blur-3xl rounded-full animate-pulse" />
              <div className="relative h-32 w-32 rounded-full border-4 border-primary/20 p-1 animate-[spin_4s_linear_infinite]">
                <div className="h-full w-full rounded-full border-t-4 border-primary shadow-[0_0_20px_rgba(153,64,229,0.5)]" />
              </div>
              <Avatar className="absolute inset-0 h-32 w-32 border-4 border-white/10 shadow-2xl">
                <AvatarImage src={remoteUser.avatar} />
                <AvatarFallback>{remoteUser.name[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-2">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Synchronizing Identity</h2>
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Secure Handshake Node</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Fallback Aurora Background */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full animate-pulse delay-700" />
              <Image src={remoteUser.avatar} alt="Blur" fill className="object-cover blur-[100px] opacity-20 scale-150" />
            </div>
            {/* Remote Video Participant (Mocked) */}
            <div className="relative w-full h-full flex items-center justify-center">
              <Image src={remoteUser.avatar} alt={remoteUser.name} fill className="object-cover brightness-75" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* 2. Floating PiP (Local User) */}
      <div className={cn(
        "absolute top-20 right-6 z-50 w-32 sm:w-44 aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-700 ring-2 ring-white/10 group",
        !isUiVisible && "opacity-0 translate-y-[-20px] pointer-events-none"
      )}>
        <video 
          ref={localVideoRef} 
          autoPlay 
          muted 
          playsInline 
          className={cn(
            "w-full h-full object-cover transition-all duration-500",
            isVideoOff && "opacity-0",
            cameraMode === 'user' && "scale-x-[-1]"
          )} 
        />
        {isVideoOff && (
          <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        )}
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span className="text-[8px] font-black uppercase text-white/60 tracking-widest drop-shadow-md">You (Me)</span>
        </div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button variant="ghost" size="icon" className="text-white rounded-full bg-white/10" onClick={handleFlipCamera}>
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 3. Header Controls */}
      <header className={cn(
        "absolute top-0 left-0 right-0 z-50 px-6 py-8 flex items-center justify-between transition-all duration-500",
        !isUiVisible && "opacity-0 translate-y-[-20px] pointer-events-none"
      )}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10" onClick={handleEndCall}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black italic uppercase tracking-tighter text-white">{remoteUser.name}</h1>
              {remoteUser.isVerified && <ShieldCheck className="h-4 w-4 text-primary fill-primary text-white" />}
            </div>
            {!isConnecting && (
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">
                SYNCED: {formatDuration(callDuration)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-primary/20 backdrop-blur-md border border-primary/20 rounded-full px-4 py-1.5 flex items-center gap-2">
            <Zap className="h-3 w-3 text-primary animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">High-Velocity Link</span>
          </div>
        </div>
      </header>

      {/* 4. Command Dock */}
      <footer className={cn(
        "absolute bottom-12 left-0 right-0 z-50 flex justify-center px-6 transition-all duration-500",
        !isUiVisible && "opacity-0 translate-y-[20px] pointer-events-none"
      )}>
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-2 sm:p-3 rounded-[3rem] flex items-center gap-2 sm:gap-4 shadow-2xl">
          <TooltipProvider>
            <Button 
              variant="ghost" size="icon" 
              className={cn("h-14 w-14 rounded-full transition-all", isMuted ? "bg-destructive/20 text-destructive" : "bg-white/5 text-white hover:bg-white/10")}
              onClick={() => { triggerHaptic(5); setIsMuted(!isMuted); }}
            >
              {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            </Button>

            <Button 
              variant="ghost" size="icon" 
              className={cn("h-14 w-14 rounded-full transition-all", isVideoOff ? "bg-primary/20 text-primary" : "bg-white/5 text-white hover:bg-white/10")}
              onClick={() => { triggerHaptic(5); setIsVideoOff(!isVideoOff); }}
            >
              {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
            </Button>

            <div className="w-px h-8 bg-white/10 mx-1" />

            <Button 
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-destructive text-white hover:bg-destructive/90 shadow-xl shadow-destructive/20 active:scale-90 transition-all"
              onClick={handleEndCall}
            >
              <PhoneOff className="h-8 w-8" />
            </Button>

            <div className="w-px h-8 bg-white/10 mx-1" />

            <Button 
              variant="ghost" size="icon" 
              className={cn("h-14 w-14 rounded-full transition-all", !isSpeakerOn ? "bg-white/20 text-white" : "bg-white/5 text-white/40")}
              onClick={() => { triggerHaptic(5); setIsSpeakerOn(!isSpeakerOn); }}
            >
              {isSpeakerOn ? <Volume2 className="h-6 w-6" /> : <VolumeX className="h-6 w-6" />}
            </Button>

            <Button 
              variant="ghost" size="icon" 
              className="h-14 w-14 rounded-full bg-white/5 text-white hover:bg-white/10"
              onClick={handleFlipCamera}
            >
              <RefreshCw className="h-6 w-6" />
            </Button>
          </TooltipProvider>
        </div>
      </footer>

      {/* Permission Warning */}
      {!(hasCameraPermission) && !isConnecting && !isVideoOff && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-12 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md bg-zinc-900 border border-destructive/20 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-destructive" />
              <h3 className="font-black italic uppercase tracking-widest text-lg text-white">Hardware Lock</h3>
            </div>
            <p className="text-zinc-400 font-medium leading-relaxed">
              Camera access is restricted. To initiate a full Video Handshake, please calibrate your browser settings.
            </p>
            <div className="flex justify-end">
              <Button variant="outline" className="rounded-xl font-bold uppercase tracking-widest text-[10px] text-white border-white/10" onClick={handleEndCall}>CLOSE NODE</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
