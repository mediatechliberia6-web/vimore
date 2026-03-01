
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar Skeleton (Desktop) */}
      <aside className="h-screen w-72 bg-card/40 border-r border-border hidden md:flex flex-col shrink-0">
        <div className="p-6 border-b border-border flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-2 w-16 rounded" />
          </div>
        </div>
        <div className="flex-1 p-4 space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-2xl" />
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header Skeleton */}
        <header className="h-20 px-8 flex items-center justify-between border-b border-border shrink-0">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-5 w-48 rounded" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </header>

        {/* Content Pulse */}
        <div className="p-10 space-y-10 overflow-y-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card/40 border border-border rounded-[2rem] p-6 flex items-center gap-5">
                <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-2 w-16 rounded" />
                  <Skeleton className="h-5 w-24 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Chart Pulse */}
          <div className="bg-card/40 border border-border rounded-[2rem] p-8 space-y-6">
            <Skeleton className="h-6 w-48 rounded" />
            <Skeleton className="h-[300px] w-full rounded-2xl" />
          </div>

          {/* Table Pulse */}
          <div className="bg-card/40 border border-border rounded-[2rem] overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-6 border-b border-border flex items-center justify-between gap-8">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <Skeleton className="h-4 flex-1 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Mobile Dock Skeleton */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[200] bg-card/80 backdrop-blur-2xl border-t border-border px-4 py-3 flex items-center justify-between">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-2 w-8 rounded" />
          </div>
        ))}
      </nav>
    </div>
  );
}
