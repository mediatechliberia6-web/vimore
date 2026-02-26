"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { ReelCard } from "./reel-card";
import { useMusic } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { ReelTab } from "@/app/reels/page";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_REELS = [
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
  },
  {
    id: "r4",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-red-light-studio-40029-preview.mp4",
    user: {
      name: "Julianne Moore",
      username: "jmoore",
      avatar: "https://picsum.photos/seed/50/200/200",
      role: "Content Creator",
      isVerified: true
    },
    caption: "New fashion drop is live! 👠 Testing the red light aesthetic today. #Fashion #Vibe #Studio",
    likes: 45000,
    comments: 210,
    shares: 56,
    music: {
      id: 4,
      title: "Calm Down",
      artist: "Rema",
      cover: "https://picsum.photos/seed/song4/100/100"
    }
  }
];

export function VibeStream({ activeTab }: { activeTab: ReelTab }) {
  const { followingUsernames } = usePosts();
  const { triggerHaptic } = useMusic();
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredReels = useMemo(() => {
    if (activeTab === "foryou") return MOCK_REELS;
    return MOCK_REELS.filter(reel => followingUsernames.has(reel.user.username));
  }, [activeTab, followingUsernames]);

  const [activeReelId, setActiveReelId] = useState<string | null>(null);

  useEffect(() => {
    if (filteredReels.length > 0 && !activeReelId) {
      setActiveReelId(filteredReels[0].id);
    }
  }, [filteredReels, activeReelId]);

  useEffect(() => {
    const options = {
      root: containerRef.current,
      rootMargin: "0px",
      threshold: 0.6,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("data-reel-id");
          if (id && id !== activeReelId) {
            setActiveReelId(id);
            triggerHaptic(5);
          }
        }
      });
    }, options);

    const cards = containerRef.current?.querySelectorAll("[data-reel-id]");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [activeReelId, triggerHaptic, filteredReels]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black"
    >
      {filteredReels.length > 0 ? (
        filteredReels.map((reel) => (
          <div key={reel.id} data-reel-id={reel.id} className="snap-start h-[100dvh] w-full relative">
            <ReelCard 
              {...reel} 
              isActive={activeReelId === reel.id} 
            />
          </div>
        ))
      ) : (
        <div className="h-full w-full flex flex-col items-center justify-center text-white/40 space-y-6 px-12 text-center animate-in fade-in duration-700">
          <div className="h-24 w-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10">
            <Search className="h-10 w-10 opacity-20" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Quiet in this Circle</h3>
            <p className="text-sm font-medium">Follow more creators to populate your custom VibeStream.</p>
          </div>
          <Button variant="outline" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white transition-all font-black uppercase tracking-widest text-[10px] h-12 px-8">
            <Sparkles className="mr-2 h-4 w-4" /> Discover Creators
          </Button>
        </div>
      )}
    </div>
  );
}
