"use client";

import { useMemo, useState, useEffect, useRef } from "react";
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
import { Rocket, Zap, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateStoryModal } from "@/components/feed/create-story-modal";

export default function Home() {
  const { posts, campaigns, isLoading, followingUsernames, seenPostIds } = usePosts();
  const { currentTrack, isExpanded, triggerHaptic } = useMusic();
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  
  // Batch Protocol State
  const [displayLimit, setDisplayLimit] = useState(16);
  const observerTarget = useRef(null);

  const isPlayerActive = currentTrack && !isExpanded;

  /**
   * TIERED SHUFFLE HEURISTIC
   * Randomizes content within priority tiers to ensure every refresh feels unique.
   */
  const organicSorted = useMemo(() => {
    const regular = posts.filter(p => !p.isBoosted);
    
    const followingUnseen = regular.filter(p => followingUsernames.has(p.user.username) && !seenPostIds.has(p.id));
    const publicUnseen = regular.filter(p => !followingUsernames.has(p.user.username) && !seenPostIds.has(p.id));
    const seenNodes = regular.filter(p => seenPostIds.has(p.id));

    // High-Velocity Shuffle helper
    const shuffle = (arr: any[]) => {
      const newArr = [...arr];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    return [...shuffle(followingUnseen), ...shuffle(publicUnseen), ...shuffle(seenNodes)];
  }, [posts, followingUsernames, seenPostIds]);

  /**
   * INTERLEAVING ALGORITHM (2:1 RATIO)
   * Materializes 1 Boosted Post after every 2 Organic Posts up to the current display limit.
   */
  const feedItems = useMemo(() => {
    if (posts.length === 0) return [];
    
    const boostedPosts = posts.filter(p => p.isBoosted);
    const activeCampaigns = campaigns.filter(c => c.isActive);
    
    const result: (any)[] = [];
    let organicIdx = 0;
    let boostedIdx = 0;

    // Weave the discovery stream
    while (organicIdx < organicSorted.length) {
      for (let i = 0; i < 2 && organicIdx < organicSorted.length; i++) {
        const post = organicSorted[organicIdx];
        result.push({ type: 'post', data: post });
        organicIdx++;

        if (organicIdx === 1 && activeCampaigns.length > 0) {
          result.push({ type: 'campaign', data: activeCampaigns[0] });
        }
        if (organicIdx === 3) {
          result.push({ type: 'ad', id: `ad-init-${organicIdx}` });
        }
        if (organicIdx === 5) {
          result.push({ type: 'suggestions', id: `suggested-follows-${organicIdx}` });
        }
      }

      if (boostedIdx < boostedPosts.length) {
        result.push({ type: 'post', data: boostedPosts[boostedIdx] });
        boostedIdx++;
      } else if (organicIdx % 5 === 0) {
        result.push({ type: 'ad', id: `ad-seq-${organicIdx}` });
      }
    }

    return result.slice(0, displayLimit);
  }, [posts, organicSorted, campaigns, displayLimit]);

  /**
   * INFINITE SCROLL HANDSHAKE
   * Materializes the next batch of 16 when the sentinel node enters the viewport.
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && feedItems.length >= displayLimit) {
          triggerHaptic(5);
          setDisplayLimit(prev => prev + 16);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [isLoading, feedItems.length, displayLimit, triggerHaptic]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808] flex flex-col items-center transition-colors duration-300">
      <Header />
      <SubHeader />
      
      <div className={cn(
        "w-full max-w-[1440px] grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-8 px-4 transition-all duration-300",
        isPlayerActive ? "pt-[184px]" : "pt-6"
      )}>
        <aside className={cn(
          "hidden lg:block sticky h-[calc(100vh-132px)] overflow-y-auto transition-all duration-300",
          isPlayerActive ? "top-[196px]" : "top-[132px]"
        )}>
          <MainNav />
        </aside>

        <main className="flex flex-col gap-4 w-full max-w-[680px] mx-auto">
          <Stories onOpenCreate={() => setIsStoryModalOpen(true)} />
          
          <div className="flex flex-col gap-1">
            {posts.length > 0 ? (
              <>
                {feedItems.map((item, idx) => {
                  if (item.type === 'ad') return <NativeAdNode key={item.id} type="banner" />;
                  if (item.type === 'suggestions') return <SuggestedFollows key={item.id} />;
                  if (item.type === 'campaign') {
                    return (
                      <PostCard 
                        key={item.data.id}
                        id={item.data.id}
                        isCampaign={true}
                        user={{ name: "ViMore Official", username: "vimore", avatar: "/icon.svg", isVerified: true }}
                        content={item.data.content}
                        image={item.data.type === 'photo' ? item.data.mediaUrl : undefined}
                        videoUrl={item.data.type === 'video' ? item.data.mediaUrl : undefined}
                        actionUrl={item.data.actionUrl}
                        actionLabel={item.data.actionLabel}
                        likes={1420}
                        unlikes={0}
                        comments={0}
                        views={0}
                        time="Now"
                      />
                    );
                  }
                  return <PostCard key={item.data.id} {...item.data} />;
                })}
                
                {/* Sentinel Node */}
                <div ref={observerTarget} className="h-20 flex items-center justify-center p-8">
                  {feedItems.length < (posts.length + campaigns.length) ? (
                    <div className="flex items-center gap-2 text-muted-foreground/40 font-black uppercase text-[10px] tracking-[0.3em]">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Materializing Next Batch...
                    </div>
                  ) : (
                    <div className="text-muted-foreground/20 text-[8px] font-black uppercase tracking-[0.5em]">
                      Network End Reached
                    </div>
                  )}
                </div>
              </>
            ) : !isLoading && (
              <div className="py-32 text-center bg-white dark:bg-card rounded-[2.5rem] border border-dashed border-primary/10 shadow-sm flex flex-col items-center justify-center space-y-6 px-12 animate-in fade-in zoom-in duration-700">
                <div className="h-24 w-24 bg-primary/5 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-primary/20">
                  <Rocket className="h-10 w-10 text-primary/40 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Cluster Initialized</h3>
                  <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Your spatial feed is silent. Materialize the first vibe to sync with the network.</p>
                </div>
                <Button className="rounded-full bg-primary text-white font-black uppercase italic tracking-widest h-12 px-10 shadow-xl shadow-primary/20 gap-3">
                  <Zap className="h-4 w-4" /> Start Pulse
                </Button>
              </div>
            )}
          </div>
        </main>

        <aside className={cn(
          "hidden lg:block sticky h-[calc(100vh-132px)] overflow-y-auto transition-all duration-300",
          isPlayerActive ? "top-[196px]" : "top-[132px]"
        )}>
          <RightSidebar />
        </aside>
      </div>

      <CreateStoryModal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} />
    </div>
  );
}
