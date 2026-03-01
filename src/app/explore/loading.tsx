
import { ShellSkeleton, SubHeaderSkeleton } from "@/components/layout/shell-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808]">
      <ShellSkeleton />
      <SubHeaderSkeleton />

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 px-4 pt-6">
        <aside className="hidden lg:block">
          <div className="space-y-4 py-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </aside>

        <main className="w-full space-y-8">
          <Skeleton className="h-14 w-full max-w-2xl mx-auto rounded-2xl lg:hidden" />

          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-none md:grid-rows-4 gap-4 min-h-[800px]">
            <Skeleton className="md:col-span-2 md:row-span-2 rounded-3xl" />
            <Skeleton className="md:col-span-1 md:row-span-1 rounded-3xl" />
            <Skeleton className="md:col-span-1 md:row-span-2 rounded-3xl" />
            <Skeleton className="md:col-span-1 md:row-span-1 rounded-3xl" />
            <Skeleton className="md:col-span-1 md:row-span-1 rounded-3xl" />
            <Skeleton className="md:col-span-2 md:row-span-1 rounded-3xl" />
            <Skeleton className="md:col-span-2 md:row-span-1 rounded-3xl" />
          </div>
        </main>
      </div>
    </div>
  );
}
