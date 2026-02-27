
"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { ReelCard } from "./reel-card";
import { NativeAdNode } from "@/components/ad/native-ad-node";
import { useMusic } from "@/context/MusicContext";
import { usePosts, Post } from "@/context/PostContext";
import { ReelTab } from "@/app/reels/page";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_REELS_DATA = [
  {
    id: "r1",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-lit-city-at-night-11411-preview.mp4",
    user: {
      name: "Alex Rivera",
      username: "arivera",
      avatar: "https://picsum.photos/seed/1/100/100",
      role: "Product Designer",
      isVerified: true
    },
    caption: "Designing the future of **ViMore**... 🎨✨ Building edge-to-edge experiences for the high-velocity creator. #Design #ViMore #Future #Creativity",
    likes: 124500,
    comments: 856,
    shares: 420,
    music: {
      id: 1,
      title: "Essence",
      artist: "Wizkid",
      cover: "https://picsum.photos/seed/song1/100/100"
    }
  },
  {
    id: "r2",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-vertical-video-of-a-woman-in-a-field-of-flowers-40030-preview.mp4",
    user: {
      name: "Sarah Chen",
      username: "schen_dev",
      avatar: "https://picsum.photos/seed/2/100/100",
      role: "Fullstack Architect",
      isVerified: true
    },
    caption: "Sunset sessions at the HQ. 🌅 The lighting here is just literal chills. #Studio #Vibes #DevLife #Web3",
    likes: 89200,
    comments: 432,
    shares: 128,
    music: {
      id: 2,
      title: "Last Last",
      artist: "Burna Boy",
      cover: "https://picsum.photos/seed/song2/100/100"
    }
  },
  {
    id: "r3",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-in-a-dark-room-with-neon-lights-40028-preview.mp4",
    user: {
      name: "Marcus Stone",
      username: "mstone",
      avatar: "https://picsum.photos/seed/3/100/100",
      role: "Visual Storyteller",
      isVerified: false
    },
    caption: "Late night energy. ⚡️ Exploring motion and light in the new studio setup. #Movement #Neon #Creative #Vibes",
    likes: 156000,
    comments: 1204,
    shares: 890,
    music: {
      id: 3,
      title: "Unavailable",
      artist: "Davido",
      cover: "https://picsum.photos/seed/song3/100/100"
    }
  }
];

export function VibeStream({ activeTab }: { activeTab: ReelTab }) {
  const { posts, followingUsernames } = usePosts();
  const { triggerHaptic } = useMusic();
  const containerRef = useRef<HTMLDivElement>(null);

  // Ad Injection Logic: 
  // 2nd position (index 1), then every 4 organic reels thereafter.
  const reelsWithAds = useMemo(() => {
    // Convert posts with videoUrl to Reel format
    const userReels = posts
      .filter(p => p.videoUrl)
      .map(p => ({
        id: p.id,
        videoUrl: p.videoUrl!,
        user: {
          name: p.user.name,
          username: p.user.username,
          avatar: p.user.avatar,
          role: p.user.category || "Creator",
          isVerified: p.user.isVerified
        },
        caption: p.content,
        likes: p.likes,
        comments: p.comments,
        shares: p.shares || 0,
        music: {
          id: 'custom',
          title: "Original Audio",
          artist: p.user.name,
          cover: p.user.avatar
        }
      }));

    const combined = [...userReels, ...MOCK_REELS_DATA];
    const source = activeTab === "foryou" ? combined : combined.filter(reel => followingUsernames.has(reel.user.username));
    
    const result: (any)[] = [];
    let organicCount = 0;

    source.forEach((reel, index) => {
      result.push({ type: 'reel', data: reel });
      organicCount++;

      // Condition 1: 2nd position (index 1)
      // Condition 2: Every 4 organic reels after that
      if (organicCount === 1) { // Will insert at index 1
        result.push({ type: 'ad', id: `ad-reel-init-${index}` });
      } else if (organicCount > 1 && (organicCount - 1) % 4 === 0) {
        result.push({ type: 'ad', id: `ad-reel-seq-${index}` });
      }
    });

    return result;
  }, [activeTab, followingUsernames, posts]);

  const [activeReelId, setActiveReelId] = useState<string | null>(null);

  useEffect(() => {
    if (reelsWithAds.length > 0 && !activeReelId) {
      const first = reelsWithAds[0];
      setActiveReelId(first.type === 'ad' ? first.id : first.data.id);
    }
  }, [reelsWithAds, activeReelId]);

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
          }
        }
      });
    }, options);

    const cards = containerRef.current?.querySelectorAll("[data-node-id]");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [activeReelId, triggerHaptic, reelsWithAds]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black"
    >
      {reelsWithAds.length > 0 ? (
        reelsWithAds.map((item) => (
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
        ))
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
