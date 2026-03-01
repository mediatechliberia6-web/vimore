
"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ReelsLoading() {
  return (
    <div className="h-[100dvh] w-full bg-black overflow-hidden relative flex flex-col">
      {/* Header Overlay Skeleton */}
      <div className="absolute top-0 left-0 right-0 z-[100] h-16 flex items-center justify-between px-6">
        <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
        <div className="flex gap-6">
          <Skeleton className="h-4 w-16 rounded bg-white/10" />
          <Skeleton className="h-4 w-16 rounded bg-white/10" />
        </div>
        <Skeleton className="h-9 w-9 rounded-full bg-white/10" />
      </div>

      {/* Main Stream Container */}
      <div className="flex-1 w-full bg-zinc-950 relative">
        {/* Interaction Side Node Skeletons */}
        <div className="absolute right-3 bottom-20 z-50 flex flex-col items-center gap-6">
          <Skeleton className="h-11 w-11 rounded-full bg-white/10" />
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
              <Skeleton className="h-2 w-6 rounded bg-white/10" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
              <Skeleton className="h-2 w-6 rounded bg-white/10" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
              <Skeleton className="h-2 w-6 rounded bg-white/10" />
            </div>
          </div>
          <Skeleton className="h-10 w-10 rounded-full bg-white/10" />
          <Skeleton className="h-10 w-10 rounded-full bg-white/10 animate-spin" />
        </div>

        {/* Bottom Metadata Skeletons */}
        <div className="absolute bottom-0 left-0 right-0 p-5 pt-20 bg-gradient-to-t from-black to-transparent space-y-4">
          <div className="max-w-[70%] space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-32 rounded bg-white/10" />
              <Skeleton className="h-5 w-20 rounded-full bg-white/10" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-full rounded bg-white/10" />
              <Skeleton className="h-3 w-2/3 rounded bg-white/10" />
            </div>
          </div>
          <Skeleton className="h-12 w-48 rounded-xl bg-white/10" />
        </div>
      </div>
    </div>
  );
}
