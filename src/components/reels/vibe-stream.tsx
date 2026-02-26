"use client";

import { useRef, useState, useEffect } from "react";
import { ReelCard } from "./reel-card";

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
      title: "Unavailable",
      artist: "Davido",
      cover: "https://picsum.photos/seed/song3/100/100"
    }
  }
];

export function VibeStream() {
  const [activeReelId, setActiveReelId] = useState(MOCK_REELS[0].id);
  const containerRef = useRef<HTMLDivElement>(null);

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
          if (id) {
            setActiveReelId(id);
            // Optional: Trigger haptic on major scroll snap
            if (typeof window !== 'undefined' && window.navigator?.vibrate) {
              window.navigator.vibrate(5);
            }
          }
        }
      });
    }, options);

    const cards = containerRef.current?.querySelectorAll("[data-reel-id]");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="flex-1 w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide bg-black"
    >
      {MOCK_REELS.map((reel) => (
        <div key={reel.id} data-reel-id={reel.id} className="snap-start h-[100dvh] w-full">
          <ReelCard 
            {...reel} 
            isActive={activeReelId === reel.id} 
          />
        </div>
      ))}
    </div>
  );
}
