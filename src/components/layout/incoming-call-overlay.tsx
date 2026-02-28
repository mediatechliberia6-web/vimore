
"use client";

import { useEffect, useState } from "react";
import { 
  Phone, 
  PhoneOff, 
  Video, 
  X, 
  Zap, 
  ShieldCheck, 
  Loader2,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePosts } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function IncomingCallOverlay() {
  const { callState, acceptCall, endCall, triggerHaptic } = usePosts();
  const router = useRouter();
  const [pulseScale, setPulseScale] = useState(1);

  // Identity Pulse Animation
  useEffect(() => {
    if (callState.status === 'incoming') {
      const interval = setInterval(() => {
        setPulseScale(s => s === 1 ? 1.1 : 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callState.status]);

  if (callState.status !== 'incoming' || !callState.contact) return null;

  const handleAccept = () => {
    triggerHaptic(50);
    acceptCall();
    router.push(`/messages/call/${callState.contact!.username}`);
  };

  const handleDecline = () => {
    triggerHaptic(100);
    endCall();
  };

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6 overflow-hidden animate-in fade-in duration-500">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-12">
        
        <header className="space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-1.5 flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Incoming Handshake</span>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Digital Pulse</h1>
            <p className="text-white/40 text-sm font-medium uppercase tracking-widest">Secure Node Syncing...</p>
          </div>
        </header>

        <main className="relative py-10">
          <div 
            className="relative h-48 w-48 transition-transform duration-1000 ease-in-out"
            style={{ transform: `scale(${pulseScale})` }}
          >
            {/* Visual Pulses */}
            <div className="absolute inset-[-20px] border border-primary/20 rounded-full animate-ping" />
            <div className="absolute inset-[-40px] border border-primary/10 rounded-full animate-ping delay-300" />
            
            <div className="relative h-full w-full rounded-full border-4 border-primary shadow-[0_0_40px_rgba(153,64,229,0.4)] overflow-hidden bg-zinc-900">
              <Avatar className="h-full w-full">
                <AvatarImage src={callState.contact.avatar} />
                <AvatarFallback>{callState.contact.name[0]}</AvatarFallback>
              </Avatar>
            </div>

            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-2xl ring-4 ring-black">
              {callState.type === 'video' ? <Video className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
            </div>
          </div>

          <div className="mt-12 space-y-2">
            <h2 className="text-2xl font-black text-white">{callState.contact.name}</h2>
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Verified Signature Active</span>
            </div>
          </div>
        </main>

        <footer className="w-full pt-12 flex items-center justify-center gap-12">
          <div className="flex flex-col items-center gap-3">
            <Button 
              size="icon"
              className="h-20 w-20 rounded-full bg-destructive text-white hover:bg-destructive/90 shadow-2xl shadow-destructive/20 active:scale-90 transition-all"
              onClick={handleDecline}
            >
              <PhoneOff className="h-8 w-8" />
            </Button>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Decline</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <Button 
              size="icon"
              className="h-24 w-24 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-[0_0_40px_rgba(34,197,94,0.4)] active:scale-95 transition-all group"
              onClick={handleAccept}
            >
              <CheckCircle2 className="h-10 w-10 group-hover:scale-110 transition-transform" />
            </Button>
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest animate-pulse">Accept Pulse</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
