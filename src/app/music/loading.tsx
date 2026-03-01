
"use client";

import { ShellSkeleton } from "@/components/layout/shell-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function MusicLoading() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-background">
      <ShellSkeleton />
      
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr]">
        {/* Navigation Sidebar Skeleton */}
        <aside className="hidden lg:block sticky top-[61px] h-[calc(100vh-61px)] border-r border-border/50 px-4 py-6 space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="w-6 h-6 rounded bg-muted animate-pulse" />
              <Skeleton className="w-24 h-4 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </aside>

        {/* Music Main Hub Skeleton */}
        <main className="flex flex-col relative">
          {/* Sub Header Skeleton */}
          <div className="sticky top-[61px] z-30 bg-background/80 backdrop-blur-md px-4 sm:px-10 py-4 flex items-center justify-between border-b border-border/50">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-lg" />
            </div>
            <Skeleton className="h-10 w-full max-w-md rounded-xl" />
          </div>

          <div className="px-4 sm:px-10 py-6 sm:py-10 space-y-12">
            {/* Hero Section Skeleton */}
            <Skeleton className="relative w-full aspect-video sm:h-[400px] rounded-[2rem] sm:rounded-[3rem]" />

            {/* Content Rails Skeletons */}
            {[...Array(3)].map((_, railIdx) => (
              <div key={railIdx} className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <Skeleton className="h-8 w-48 rounded-lg" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
                <div className="flex gap-6 overflow-hidden pb-4">
                  {[...Array(6)].map((_, itemIdx) => (
                    <div key={itemIdx} className="w-[160px] sm:w-[200px] shrink-0 space-y-3">
                      <Skeleton className="aspect-square w-full rounded-2xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Floating Bottom Nav Skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-[80] px-4 pb-6 flex justify-center">
        <Skeleton className="h-16 w-64 rounded-full shadow-2xl" />
      </div>
    </div>
  );
}
