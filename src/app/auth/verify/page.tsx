
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { account } from "@/lib/appwrite";
import { usePosts } from "@/context/PostContext";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

/**
 * @fileOverview ViMore Verification Handshake Node
 * Handles incoming spatial verification pulses from the Appwrite Email Protocol.
 */

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { checkSession, triggerHaptic } = usePosts();
  const { toast } = useToast();

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const performHandshake = async () => {
      if (!userId || !secret) {
        setStatus("error");
        setErrorMessage("Missing spatial identity nodes (userId or secret).");
        return;
      }

      try {
        // Appwrite Protocol: Update verification status
        await account.updateVerification(userId, secret);
        
        setStatus("success");
        triggerHaptic(100);
        toast({ 
          title: "Identity Synchronized", 
          description: "Your email node has been successfully verified." 
        });
        
        // Final Handshake: Trigger global session refresh to update isEmailVerified state
        await checkSession();
        
        // Automatic Redirection to the Network Core
        setTimeout(() => router.push("/"), 3000);
      } catch (error: any) {
        console.error("Verification handshake failed:", error);
        setStatus("error");
        setErrorMessage(error.message || "The verification pulse expired or is invalid.");
      }
    };

    performHandshake();
  }, [userId, secret, router, toast, triggerHaptic, checkSession]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-700">
        <header className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-primary/20">
              <ShieldCheck className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">Identity Audit</h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Spatial Verification Pulse</p>
          </div>
        </header>

        <div className="w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl space-y-8">
          
          {status === 'verifying' && (
            <div className="space-y-6 animate-pulse">
              <div className="flex justify-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black italic uppercase text-white">Auditing Node...</h2>
                <p className="text-sm text-white/40 font-medium uppercase tracking-widest">Synchronizing credentials with the Command Core</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6 animate-in zoom-in duration-500">
              <div className="h-20 w-20 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl shadow-green-500/20">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black italic uppercase text-white">Sync Confirmed</h2>
                <p className="text-sm text-white/40 font-medium uppercase tracking-widest leading-relaxed">
                  Your identity node is now fully synchronized. Materializing feed in 3s...
                </p>
              </div>
              <Link href="/">
                <Button className="w-full h-14 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest mt-4 shadow-xl shadow-primary/20">
                  Enter Network Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6 animate-in shake-vibe">
              <div className="h-20 w-20 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mx-auto border border-destructive/20 shadow-2xl">
                <XCircle className="h-12 w-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black italic uppercase text-white">Handshake Failed</h2>
                <p className="text-sm text-destructive font-bold uppercase tracking-tight leading-relaxed">
                  {errorMessage}
                </p>
              </div>
              <div className="pt-4">
                <Link href="/">
                  <Button className="w-full h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-all">
                    Return to Entry Node
                  </Button>
                </Link>
              </div>
            </div>
          )}

        </div>

        <footer className="text-center opacity-30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">ViMore Security Cluster v1.5</span>
          </div>
          <p className="text-[8px] font-bold text-white/60 uppercase tracking-widest italic">From Media Tech Liberia</p>
        </footer>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
