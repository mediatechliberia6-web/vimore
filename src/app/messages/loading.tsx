
"use client";

import { ShellSkeleton } from "@/components/layout/shell-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function MessagesLoading() {
  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <ShellSkeleton />
      
      <div className="flex-1 max-w-[1440px] w-full mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] overflow-hidden">
        {/* Navigation Sidebar Skeleton */}
        <aside className="hidden md:flex flex-col gap-4 py-6 px-4 border-r border-primary/5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="w-6 h-6 rounded bg-muted animate-pulse" />
              <Skeleton className="w-24 h-4 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </aside>

        {/* Main Messaging Layout Skeleton */}
        <main className="flex grid grid-cols-1 lg:grid-cols-[400px_1fr] h-full overflow-hidden">
          
          {/* Chat List Skeleton */}
          <div className="h-full border-r border-primary/5 flex flex-col bg-white dark:bg-card">
            <div className="p-6 border-b border-primary/5 flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-32 rounded-lg" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-9 rounded-full" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <Skeleton className="h-10 w-full rounded-xl" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-7 w-16 rounded-full" />
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-hidden p-2 space-y-1">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-3 w-10 rounded" />
                    </div>
                    <Skeleton className="h-3 w-3/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Window Placeholder Skeleton */}
          <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-[#FAFAFF] dark:bg-[#080808]">
            <Skeleton className="w-24 h-24 rounded-full mb-6" />
            <div className="space-y-3 flex flex-col items-center">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="h-4 w-64 rounded mt-4" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
