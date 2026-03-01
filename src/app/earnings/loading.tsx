
"use client";

import { ShellSkeleton } from "@/components/layout/shell-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function EarningsLoading() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#050505]">
      <ShellSkeleton />
      
      <main className="max-w-3xl mx-auto p-4 sm:p-8 space-y-8 pt-4">
        {/* Hero Card Pulse */}
        <div className="bg-white dark:bg-card border border-border rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32 rounded" />
            <Skeleton className="h-10 w-64 rounded" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-3xl" />
            <Skeleton className="h-32 w-full rounded-3xl" />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-primary/5">
            <div className="space-y-2">
              <Skeleton className="h-2 w-24 rounded" />
              <Skeleton className="h-8 w-40 rounded" />
            </div>
            <Skeleton className="h-14 w-full sm:w-48 rounded-2xl" />
          </div>
        </div>

        {/* Secondary Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-card border border-border rounded-[2rem] p-6 space-y-6">
            <Skeleton className="h-6 w-32 rounded" />
            <div className="flex justify-center py-4">
              <Skeleton className="h-40 w-40 rounded-full" />
            </div>
            <div className="flex justify-center gap-4">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-3 w-20 rounded-full" />
            </div>
          </div>

          <div className="bg-white dark:bg-card border border-border rounded-[2rem] p-6 space-y-6">
            <Skeleton className="h-6 w-32 rounded" />
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          </div>
        </div>

        {/* History List Skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-4 w-12 rounded" />
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-card border border-border p-5 rounded-[2rem] flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-2 w-32 rounded" />
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-2 w-12 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
