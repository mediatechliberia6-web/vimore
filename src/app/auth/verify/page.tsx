
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * @fileOverview ViMore Legacy Verification Redirect
 * Email verification decommissioned. Redirecting to network hub.
 */

export default function VerifyPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home as verification is now direct-entry
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-6">
        <div className="flex justify-center">
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black italic uppercase text-white">Synchronizing Node...</h2>
          <p className="text-sm text-white/40 font-medium uppercase tracking-widest">Redirecting to Network Core</p>
        </div>
      </div>
    </div>
  );
}
