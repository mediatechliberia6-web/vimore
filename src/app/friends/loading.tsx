
"use client";

import { ShellSkeleton, SubHeaderSkeleton } from "@/components/layout/shell-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function FriendsLoading() {
  return (
    <div className="min-h-screen bg-[#F2ECF7] dark:bg-[#050505]">
      <ShellSkeleton />
      <SubHeaderSkeleton />
      
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-8 px-4 pt-6">
        {/* Navigation Skeleton */}
        <aside className="hidden lg:flex flex-col gap-4 py-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="w-6 h-6 rounded bg-muted animate-pulse" />
              <Skeleton className="w-24 h-4 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </aside>

        {/* Friends Main Feed Skeleton */}
        <main className="w-full space-y-8 animate-in fade-in duration-500">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <Skeleton className="h-10 w-64 rounded-lg" />
                <Skeleton className="h-4 w-48 rounded" />
              </div>
              <Skeleton className="h-12 w-full sm:max-w-xs rounded-2xl" />
            </div>

            {/* Tab Bar Skeleton */}
            <div className="h-14 w-full bg-white/60 dark:bg-white/5 rounded-[2rem] border border-white/20 p-1 flex gap-1">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="flex-1 rounded-full" />
              ))}
            </div>

            {/* Chips Skeleton */}
            <div className="flex gap-2 overflow-hidden py-1">
              <Skeleton className="h-8 w-20 rounded-full shrink-0" />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full shrink-0" />
              ))}
            </div>
          </div>

          {/* User Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/40 dark:bg-white/5 border border-white/20 rounded-[2.5rem] p-6 space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32 rounded" />
                      <Skeleton className="h-3 w-20 rounded" />
                      <div className="flex gap-1">
                        <Skeleton className="h-4 w-12 rounded" />
                        <Skeleton className="h-4 w-12 rounded" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 flex flex-col items-end">
                    <Skeleton className="h-11 w-32 rounded-2xl" />
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <Skeleton className="h-10 w-10 rounded-xl" />
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-primary/10 flex justify-between items-center">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-6 w-24 rounded-full" />
                </div>
              </div>
            ))}
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
