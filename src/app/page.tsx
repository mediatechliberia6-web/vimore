
"use client";

import { useMemo } from "react";
import { Header } from "@/components/layout/header";
import { SubHeader } from "@/components/layout/sub-header";
import { PostCard } from "@/components/post/post-card";
import { NativeAdNode } from "@/components/ad/native-ad-node";
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

  // Ad Injection Logic: 
  // 3rd position (index 2), then every 5 organic posts thereafter.
  const postsWithAds = useMemo(() => {
    const result: (any)[] = [];
    let organicCount = 0;

    posts.forEach((post, index) => {
      result.push({ type: 'post', data: post });
      organicCount++;

      // Condition 1: 3rd position (index 2 in result array)
      // Condition 2: Every 5 organic posts after that
      if (organicCount === 2) {
        result.push({ type: 'ad', id: `ad-init-${index}` });
      } else if (organicCount > 2 && (organicCount - 2) % 5 === 0) {
        result.push({ type: 'ad', id: `ad-seq-${index}` });
      }
    });

    return result;
  }, [posts]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808] flex flex-col items-center transition-colors duration-300">
      <Header />
      <SubHeader />
      
      <div className={cn(
        "w-full max-w-[1440px] grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-8 px-4 transition-all duration-300",
        isPlayerActive ? "pt-[184px]" : "pt-6"
      )}>
        {/* Left Sidebar - Navigation */}
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
            {postsWithAds.map((item, idx) => (
              item.type === 'ad' ? (
                <NativeAdNode key={item.id} type="banner" />
              ) : (
                <PostCard key={item.data.id} {...item.data} />
              )
            ))}
          </div>
        </main>

        {/* Right Sidebar */}
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
