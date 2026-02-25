"use client";

import { Header } from "@/components/layout/header";
import { SubHeader } from "@/components/layout/sub-header";
import { PostCard } from "@/components/post/post-card";
import { Stories } from "@/components/feed/stories";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { MainNav } from "@/components/layout/main-nav";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";

export default function Home() {
  const { posts } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const isPlayerActive = currentTrack && !isExpanded;

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808] flex flex-col items-center transition-colors duration-300">
      <Header />
      <SubHeader />
      
      <div className={cn(
        "w-full max-w-[1440px] grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-8 px-4 transition-all duration-300",
        isPlayerActive ? "py-20" : "py-6"
      )}>
        {/* Left Sidebar - Navigation (Hidden on mobile) */}
        <aside className={cn(
          "hidden lg:block sticky h-[calc(100vh-132px)] overflow-y-auto transition-all duration-300",
          isPlayerActive ? "top-[196px]" : "top-[132px]"
        )}>
          <MainNav />
        </aside>

        {/* Main Feed */}
        <main className="flex flex-col gap-4 w-full max-w-[680px] mx-auto">
          <Stories />
          
          <div className="flex flex-col gap-1">
            {posts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        </main>

        {/* Right Sidebar - Trends & Suggestions (Hidden on mobile) */}
        <aside className={cn(
          "hidden lg:block sticky h-[calc(100vh-132px)] overflow-y-auto transition-all duration-300",
          isPlayerActive ? "top-[196px]" : "top-[132px]"
        )}>
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
