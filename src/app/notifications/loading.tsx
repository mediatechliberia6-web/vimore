
"use client";

import { ShellSkeleton, SubHeaderSkeleton } from "@/components/layout/shell-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">
      <ShellSkeleton />
      <SubHeaderSkeleton />

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-8 px-4 pt-6">
        {/* Sidebar Skeleton */}
        <aside className="hidden lg:flex flex-col gap-4 py-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="w-6 h-6 rounded bg-muted animate-pulse" />
              <Skeleton className="w-24 h-4 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </aside>

        {/* Signals Feed Skeleton */}
        <main className="w-full space-y-6">
          <div className="bg-white dark:bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl border border-primary/5">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-2">
                <Skeleton className="h-8 w-32 rounded-lg" />
                <Skeleton className="h-3 w-48 rounded" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>

            {/* Filter Rail Skeleton */}
            <div className="flex gap-2 overflow-hidden pb-6">
              <Skeleton className="h-8 w-16 rounded-full shrink-0" />
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full shrink-0" />
              ))}
            </div>

            {/* Signal Nodes Skeleton */}
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-5 rounded-[2rem] border-2 border-transparent">
                  <Skeleton className="h-14 w-14 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/4 rounded" />
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-8 w-24 rounded-xl" />
                      <Skeleton className="h-8 w-16 rounded-xl" />
                    </div>
                  </div>
                  <Skeleton className="hidden sm:block h-16 w-16 rounded-2xl shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Sidebar Skeleton */}
        <aside className="hidden lg:flex flex-col gap-6 py-6">
          <div className="bg-white/50 rounded-2xl p-5 border border-primary/10 space-y-4">
            <Skeleton className="h-5 w-32 rounded" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
