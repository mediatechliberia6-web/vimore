"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { ReelCard } from "./reel-card";
import { NativeAdNode } from "@/components/ad/native-ad-node";
import { useMusic } from "@/context/MusicContext";
import { usePosts, Post } from "@/context/PostContext";
import { ReelTab } from "@/app/reels/page";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

export function VibeStream({ activeTab }: { activeTab: ReelTab }) {
  const { posts, followingUsernames, triggerHaptic, recordView, seenPostIds, isLoading } = usePosts();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [activeReelId, setActiveReelId] = useState<string | null>(null);
  const [displayLimit, setDisplayLimit] = useState(16);

  /**
   * REEL PRIORITIZATION & BATCHING (2:1 RATIO)
   * Materializes unseen vertical content from following, then public in randomized batches of 16.
   */
  const reelsWithAds = useMemo(() => {
    const allReels = posts
      .filter(p => p.videoUrl)
      .map(p => ({
        id: p.id,
        videoUrl: p.videoUrl!,
        user: {
          name: p.user.name,
          username: p.user.username,
          avatar: p.user.avatar,
          role: p.user.category || "Creator",
          isVerified: p.user.isVerified,
          followers: p.user.followers
        },
        caption: p.content,
        likes: p.likes,
        comments: p.comments,
        shares: p.shares || 0,
        views: p.views || 0,
        isLocked: p.isLocked,
        unlockPrice: p.unlockPrice,
        isBoosted: p.isBoosted,
        boostTargetViews: p.boostTargetViews,
        boostCurrentViews: p.boostCurrentViews,
        music: {
          id: 'custom',
          title: "Original Audio",
          artist: p.user.name,
          cover: p.user.avatar
        }
      }));

    const source = activeTab === "foryou" ? allReels : allReels.filter(reel => followingUsernames.has(reel.user.username));
    
    const organic = source.filter(r => !r.isBoosted);
    const boosted = source.filter(r => r.isBoosted);

    const followingUnseen = organic.filter(r => followingUsernames.has(r.user.username) && !seenPostIds.has(r.id));
    const publicUnseen = organic.filter(r => !followingUsernames.has(r.user.username) && !seenPostIds.has(r.id));
    const seenNodes = organic.filter(r => seenPostIds.has(r.id));

    // Shuffle helper for refresh unique-ness
    const shuffle = (arr: any[]) => {
      const newArr = [...arr];
      for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
      }
      return newArr;
    };

    const organicSorted = [...shuffle(followingUnseen), ...shuffle(publicUnseen), ...shuffle(seenNodes)];
    
    const result: (any)[] = [];
    let organicIdx = 0;
    let boostedIdx = 0;

    while (organicIdx < organicSorted.length) {
      for (let i = 0; i < 2 && organicIdx < organicSorted.length; i++) {
        result.push({ type: 'reel', data: organicSorted[organicIdx] });
        organicIdx++;

        if (organicIdx === 1 || (organicIdx > 1 && organicIdx % 6 === 0)) {
          result.push({ type: 'ad', id: `ad-reel-${organicIdx}` });
        }
      }

      if (boostedIdx < boosted.length) {
        result.push({ type: 'reel', data: boosted[boostedIdx] });
        boostedIdx++;
      }
    }

    return result.slice(0, displayLimit);
  }, [activeTab, followingUsernames, posts, seenPostIds, displayLimit]);

  // Infinite Scroll Observer for Vibe Stream
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && reelsWithAds.length >= displayLimit) {
          setDisplayLimit(prev => prev + 16);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [isLoading, reelsWithAds.length, displayLimit]);

  useEffect(() => {
    const targetId = searchParams.get('id');
    if (targetId && containerRef.current) {
      const element = containerRef.current.querySelector(`[data-node-id="${targetId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'auto' });
        setActiveReelId(targetId);
      }
    } else if (reelsWithAds.length > 0 && !activeReelId) {
      const first = reelsWithAds[0];
      const firstId = first.type === 'ad' ? first.id : first.data.id;
      setActiveReelId(firstId);
      if (first.type === 'reel') recordView(first.data.id);
    }
  }, [searchParams, reelsWithAds, activeReelId, recordView]);

  useEffect(() => {
    const options = {
      root: containerRef.current,
      rootMargin: "0px",
      threshold: 0.6,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("data-node-id");
          if (id && id !== activeReelId) {
            setActiveReelId(id);
            triggerHaptic(5);
            const item = reelsWithAds.find(r => (r.type === 'reel' && r.data.id === id));
            if (item) recordView(id);
          }
        }
      });
    }, options);

    const cards = containerRef.current?.querySelectorAll("[data-node-id]");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [activeReelId, triggerHaptic, reelsWithAds, recordView]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black"
    >
      {reelsWithAds.length > 0 ? (
        <>
          {reelsWithAds.map((item) => (
            <div key={item.type === 'ad' ? item.id : item.data.id} data-node-id={item.type === 'ad' ? item.id : item.data.id} className="snap-start h-[100dvh] w-full relative">
              {item.type === 'ad' ? (
                <NativeAdNode type="reel" isActive={activeReelId === item.id} />
              ) : (
                <ReelCard 
                  {...item.data} 
                  isActive={activeReelId === item.data.id} 
                />
              )}
            </div>
          ))}
          
          {/* Sentinel Node for Reels */}
          <div ref={observerTarget} className="h-40 flex flex-col items-center justify-center bg-zinc-950 gap-4">
            {reelsWithAds.length < 50 ? ( // Cap simulation for prototype
              <>
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Fetching Next Block</p>
              </>
            ) : (
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Network End</p>
            )}
          </div>
        </>
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center text-white/40 space-y-4 px-12 text-center animate-in fade-in duration-700">
          <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
            <Search className="h-6 w-6 opacity-20" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">Quiet in this Circle</h3>
            <p className="text-xs font-medium">Follow more creators to populate your feed.</p>
          </div>
          <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white transition-all font-black uppercase tracking-widest text-[9px] h-10 px-6">
            <Sparkles className="mr-2 h-3.5 w-3.5" /> Discover
          </Button>
        </div>
      )}
    </div>
  );
}
