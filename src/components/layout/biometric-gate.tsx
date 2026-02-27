"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Fingerprint, Lock, Zap, Loader2, CheckCircle2, Eye, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";

interface BiometricGateProps {
  children: React.ReactNode;
  title: string;
}

export function BiometricGate({ children, title }: BiometricGateProps) {
  const { settings } = usePosts();
  const { triggerHaptic } = useMusic();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [error, setError] = useState(false);

  // If biometric vault is disabled, bypass the gate entirely
  if (!settings.isBiometricActive) return <>{children}</>;

  // If already authenticated during this session/mount, show content
  if (isAuthenticated) return <>{children}</>;

  const handleAuthenticate = () => {
    if (isScanning) return;
    
    setError(false);
    setIsScanning(true);
    triggerHaptic(20);

    // Simulate High-Velocity Biometric Handshake
    setTimeout(() => {
      // 95% success rate for simulation
      const success = Math.random() > 0.05;
      
      if (success) {
        setScanComplete(true);
        triggerHaptic(50);
        setTimeout(() => {
          setIsAuthenticated(true);
          setIsScanning(false);
        }, 800);
      } else {
        setIsScanning(false);
        setError(true);
        triggerHaptic(100);
      }
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#050505] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 blur-[150px] rounded-full animate-pulse delay-1000" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
        
        <header className="space-y-3">
          <div className="flex justify-center">
            <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-1.5 flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Secure Node Access</span>
            </div>
          </div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Vault Identity Check</h1>
          <p className="text-white/40 text-sm font-medium">Authentication required to materialize the **{title}** node.</p>
        </header>

        <main className="relative py-10">
          {/* The Scanner Node */}
          <div 
            className={cn(
              "relative h-48 w-48 rounded-[3rem] border-2 transition-all duration-500 flex items-center justify-center cursor-pointer group",
              isScanning ? "border-primary shadow-[0_0_40px_rgba(153,64,229,0.3)]" : 
              scanComplete ? "border-green-500 bg-green-500/10" :
              error ? "border-destructive animate-shake" : "border-white/10 hover:border-primary/40 bg-white/5"
            )}
            onClick={handleAuthenticate}
          >
            {/* Visual Pulses */}
            {isScanning && (
              <>
                <div className="absolute inset-0 bg-primary/20 rounded-[3rem] animate-ping" />
                <div className="absolute inset-4 border border-primary/40 rounded-[2.5rem] animate-pulse" />
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary shadow-[0_0_15px_rgba(153,64,229,1)] animate-[scan_2s_ease-in-out_infinite] z-20" />
              </>
            )}

            <div className="relative z-10 flex flex-col items-center gap-4">
              {scanComplete ? (
                <CheckCircle2 className="h-16 w-16 text-green-500 animate-in zoom-in duration-300" />
              ) : isScanning ? (
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              ) : error ? (
                <ShieldAlert className="h-16 w-16 text-destructive" />
              ) : (
                <Fingerprint className="h-16 w-16 text-white/20 group-hover:text-primary transition-colors" />
              )}
            </div>
          </div>

          {/* Verification Status */}
          <div className="absolute -bottom-16 left-0 right-0">
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.3em] transition-all",
              isScanning ? "text-primary animate-pulse" : 
              scanComplete ? "text-green-500" :
              error ? "text-destructive" : "text-white/20"
            )}>
              {isScanning ? "Scanning Signature..." : 
               scanComplete ? "Verified" : 
               error ? "Handshake Failed - Retry" : "Touch Sensor to Sync"}
            </span>
          </div>
        </main>

        <footer className="w-full pt-12 space-y-4">
          <Button 
            className={cn(
              "w-full h-14 rounded-2xl font-black italic uppercase tracking-[0.2em] transition-all",
              isScanning || scanComplete ? "bg-primary/20 text-white/40 cursor-not-allowed" : "bg-white text-black hover:bg-zinc-200"
            )}
            onClick={handleAuthenticate}
            disabled={isScanning || scanComplete}
          >
            {isScanning ? "Verifying..." : "Launch Handshake"}
          </Button>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">
            Identity guarded by ViMore Pro-HD Security Cluster
          </p>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(192px); opacity: 0; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
}
