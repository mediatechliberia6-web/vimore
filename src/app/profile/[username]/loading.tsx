
"use client";

import { ShellSkeleton } from "@/components/layout/shell-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserProfileLoading() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">
      <ShellSkeleton />
      
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_360px] gap-8 px-0 md:px-4">
        {/* Left Sidebar Skeleton */}
        <aside className="hidden md:flex flex-col gap-4 py-6 px-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="w-6 h-6 rounded bg-muted animate-pulse" />
              <Skeleton className="w-24 h-4 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </aside>

        {/* Main Profile Skeleton */}
        <main className="w-full bg-white dark:bg-card min-h-screen shadow-sm animate-in fade-in duration-500">
          <header className="sticky top-0 z-50 bg-white/95 dark:bg-card/95 border-b border-border h-14 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </header>

          <div className="relative">
            <Skeleton className="h-48 sm:h-64 w-full rounded-none" />
            
            <div className="px-4 pb-4">
              <div className="relative inline-block -mt-16 sm:-mt-24 ml-0 sm:ml-2">
                <Skeleton className="w-32 h-32 sm:w-44 sm:h-44 rounded-full border-4 border-white dark:border-card shadow-xl" />
              </div>

              <div className="mt-2 space-y-6 px-1">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-48 sm:w-64 rounded-lg" />
                    <div className="flex gap-6 py-2">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                  <Skeleton className="h-14 w-32 rounded-2xl" />
                </div>

                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>

                <div className="flex gap-2">
                  <Skeleton className="h-11 flex-1 rounded-lg" />
                  <Skeleton className="h-11 flex-1 rounded-lg" />
                </div>
              </div>

              <div className="mt-8 border-t border-b h-12 flex gap-8 px-2 items-center">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>

              <div className="grid grid-cols-3 gap-1 mt-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square w-full rounded-sm" />
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar Skeleton */}
        <aside className="hidden lg:flex flex-col gap-6 py-6 px-4">
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
