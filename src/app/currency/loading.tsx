
"use client";

import { ShellSkeleton } from "@/components/layout/shell-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function CurrencyLoading() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#050505]">
      <ShellSkeleton />
      
      <main className="max-w-2xl mx-auto p-4 sm:p-8 space-y-10 pt-4">
        {/* Tab Bar Skeleton */}
        <div className="h-14 w-full bg-white/50 dark:bg-white/5 rounded-2xl border border-white/20 p-1 flex gap-1">
          <Skeleton className="flex-1 rounded-xl" />
          <Skeleton className="flex-1 rounded-xl" />
          <Skeleton className="flex-1 rounded-xl" />
        </div>

        {/* Mode Switcher Skeleton */}
        <div className="flex justify-center">
          <Skeleton className="h-10 w-48 rounded-full" />
        </div>

        {/* Package Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-card border border-border rounded-[2rem] p-6 space-y-6">
              <div className="flex justify-between items-start">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-8 w-24 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
              <div className="pt-4 border-t border-black/5 flex items-center justify-between">
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
