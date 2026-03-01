
import { ShellSkeleton, SubHeaderSkeleton } from "@/components/layout/shell-skeleton";
import { StoryRailSkeleton, PostCardSkeleton } from "@/components/post/post-skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808] flex flex-col items-center">
      <ShellSkeleton />
      <SubHeaderSkeleton />
      
      <div className="w-full max-w-[1440px] grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-8 px-4 pt-6">
        <aside className="hidden lg:flex flex-col gap-4 py-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="w-6 h-6 rounded bg-muted animate-pulse" />
              <div className="w-24 h-4 rounded bg-muted animate-pulse" />
            </div>
          ))}
        </aside>

        <main className="flex flex-col gap-4 w-full max-w-[680px] mx-auto">
          <StoryRailSkeleton />
          <div className="flex flex-col gap-1">
            {[...Array(3)].map((_, i) => (
              <PostCardSkeleton key={i} />
            ))}
          </div>
        </main>

        <aside className="hidden lg:flex flex-col gap-6 py-6">
          <div className="bg-white/50 rounded-2xl p-5 border border-primary/10 space-y-4">
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                    <div className="h-2 w-12 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
