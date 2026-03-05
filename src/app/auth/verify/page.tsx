
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
  Sparkles,
  Coins,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import client, { account, databases, APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, Query } from "@/lib/appwrite";
import { usePosts } from "@/context/PostContext";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

/**
 * @fileOverview ViMore Verification Handshake Node
 * Handles incoming spatial verification pulses.
 * Dual-Purpose: Identity Confirmation + Withdrawal Authorization.
 */

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { checkSession, triggerHaptic } = usePosts();
  const { toast } = useToast();

  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [withdrawalAuthorized, setWithdrawalAuthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const performHandshake = async () => {
      if (!userId || !secret) {
        setStatus("error");
        setErrorMessage("Missing spatial identity nodes (userId or secret).");
        return;
      }

      try {
        // 1. Official Appwrite Identity Handshake
        await account.updateVerification(userId, secret);
        
        // 2. Withdrawal Authorization Pulse
        // Check for any withdrawals for this userId awaiting email signature
        try {
          const pendingNodes = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            WITHDRAWALS_COLLECTION_ID,
            [
              Query.equal('userId', userId),
              Query.equal('status', 'AWAITING_EMAIL_SIGNATURE')
            ]
          );

          if (pendingNodes.total > 0) {
            // Materialize the signature for each pending node
            for (const doc of pendingNodes.documents) {
              await databases.updateDocument(
                APPWRITE_DATABASE_ID,
                WITHDRAWALS_COLLECTION_ID,
                doc.$id,
                { status: 'PENDING' }
              );
            }
            setWithdrawalAuthorized(true);
            toast({ title: "Withdrawal Authorized", description: "Your financial handshake has been signed." });
          }
        } catch (e) {
          console.warn("Withdrawal search node silent.");
        }

        setStatus("success");
        triggerHaptic(100);
        
        // 3. Final Handshake: Refresh global state
        await checkSession();
        
        // 4. Redirect Node
        if (!withdrawalAuthorized) {
          setTimeout(() => router.push("/"), 3000);
        }
      } catch (error: any) {
        console.error("Verification handshake failed:", error);
        setStatus("error");
        setErrorMessage(error.message || "The verification pulse expired or is invalid.");
      }
    };

    performHandshake();
  }, [userId, secret, router, toast, triggerHaptic, checkSession, withdrawalAuthorized]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
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
                {withdrawalAuthorized ? (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl space-y-2">
                    <div className="flex items-center justify-center gap-2 text-green-500">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Withdrawal Authorized</span>
                    </div>
                    <p className="text-xs text-white/60 font-medium uppercase tracking-tighter">Your financial node has been signed and transmitted to the review cluster.</p>
                  </div>
                ) : (
                  <p className="text-sm text-white/40 font-medium uppercase tracking-widest leading-relaxed">
                    Your identity node is now fully synchronized.
                  </p>
                )}
              </div>

              <Link href={withdrawalAuthorized ? "/earnings" : "/"}>
                <Button className="w-full h-14 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest mt-4 shadow-xl shadow-primary/20">
                  {withdrawalAuthorized ? "Back to Vault" : "Enter Network Now"} <ArrowRight className="ml-2 h-4 w-4" />
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
