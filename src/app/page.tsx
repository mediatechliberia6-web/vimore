"use client";

import { useMemo } from "react";
import { Header } from "@/components/layout/header";
import { SubHeader } from "@/components/layout/sub-header";
import { PostCard } from "@/components/post/post-card";
import { NativeAdNode } from "@/components/ad/native-ad-node";
import { Stories } from "@/components/feed/stories";
import { SuggestedFollows } from "@/components/feed/suggested-follows";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { MainNav } from "@/components/layout/main-nav";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";

export default function Home() {
  const { posts } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const isPlayerActive = currentTrack && !isExpanded;

  // Ad & Discovery Injection Logic: 
  // 3rd position: First Ad
  // 4th position: Suggested Follows
  // Then every 5 organic posts thereafter: sequence Ads
  const feedItems = useMemo(() => {
    const result: (any)[] = [];
    let organicCount = 0;

    posts.forEach((post, index) => {
      result.push({ type: 'post', data: post });
      organicCount++;

      // Injections
      if (organicCount === 2) {
        result.push({ type: 'ad', id: `ad-init-${index}` });
      } else if (organicCount === 3) {
        result.push({ type: 'suggestions', id: `suggested-follows-${index}` });
      } else if (organicCount > 3 && (organicCount - 3) % 5 === 0) {
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
            {feedItems.map((item, idx) => {
              if (item.type === 'ad') {
                return <NativeAdNode key={item.id} type="banner" />;
              }
              if (item.type === 'suggestions') {
                return <SuggestedFollows key={item.id} />;
              }
              return <PostCard key={item.data.id} {...item.data} />;
            })}
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
