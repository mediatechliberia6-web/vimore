"use client";

import { VibeStream } from "@/components/reels/vibe-stream";
import { ArrowLeft, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ReelsPage() {
  const [activeTab, setActiveTab] = useState<"following" | "foryou">("foryou");

  return (
    <div className="h-[100dvh] w-full bg-black overflow-hidden relative flex flex-col">
      {/* Aurora Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-[100] h-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-10 w-10">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-8">
          <button 
            onClick={() => setActiveTab("following")}
            className={cn(
              "text-sm font-black italic uppercase tracking-[0.2em] transition-all relative pb-1",
              activeTab === "following" ? "text-white" : "text-white/40 hover:text-white/60"
            )}
          >
            Following
            {activeTab === "following" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(153,64,229,0.8)] rounded-full animate-in zoom-in duration-300" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab("foryou")}
            className={cn(
              "text-sm font-black italic uppercase tracking-[0.2em] transition-all relative pb-1",
              activeTab === "foryou" ? "text-white" : "text-white/40 hover:text-white/60"
            )}
          >
            For You
            {activeTab === "foryou" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(153,64,229,0.8)] rounded-full animate-in zoom-in duration-300" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-10 w-10">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main Stream */}
      <VibeStream />
    </div>
  );
}