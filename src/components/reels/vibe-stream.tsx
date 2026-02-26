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
    caption: "Designing the future of **ViMore**... 🎨✨ Building edge-to-edge experiences for the high-velocity creator. #Design #ViMore #Future",
    likes: 12400,
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
      role: "Fullstack Dev",
      isVerified: true
    },
    caption: "Sunset sessions at the HQ. 🌅 The lighting here is just literal chills. #Studio #Vibes #DevLife",
    likes: 8900,
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
      role: "Photographer",
      isVerified: false
    },
    caption: "Late night energy. ⚡️ Exploring motion and light in the new studio setup. #Movement #Neon #Creative",
    likes: 15600,
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
          if (id) setActiveReelId(id);
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
        <div key={reel.id} data-reel-id={reel.id} className="snap-start">
          <ReelCard 
            {...reel} 
            isActive={activeReelId === reel.id} 
          />
        </div>
      ))}
    </div>
  );
}