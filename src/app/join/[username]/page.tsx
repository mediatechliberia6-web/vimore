
"use client";

import { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap } from "lucide-react";

/**
 * @fileOverview ViMore Join Hub
 * Captures the referrer's identity signature and redirects to signup.
 */

export default function JoinRedirect({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  useEffect(() => {
    const referrer = resolvedParams.username;
    if (referrer) {
      try { localStorage.setItem("vimore_referrer", referrer); } catch { /* ignore */ }
    }
    // Redirect to signup tab so new users land in the right place
    const timer = setTimeout(() => {
      router.replace("/?signup=1");
    }, 1500);
    return () => clearTimeout(timer);
  }, [resolvedParams.username, router]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center space-y-8 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/20 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-6 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative group">
          <div className="absolute -inset-6 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative h-20 w-20 bg-primary rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-primary/30">
            <Zap className="h-10 w-10 animate-pulse" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Invitation Pulse Detected</h2>
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
              <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Routing to Identity Hub...</p>
            </div>
            <p className="text-[9px] font-bold text-primary/60 uppercase tracking-widest">
              Referrer: @{resolvedParams.username}
            </p>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-12 left-0 right-0 flex justify-center opacity-20">
        <p className="text-[9px] font-black text-white uppercase tracking-[0.5em]">ViMore Logic v1.5.0 • MTL Core</p>
      </footer>
    </div>
  );
}
