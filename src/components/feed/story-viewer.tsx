
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, MoreHorizontal, Send, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePosts } from "@/context/PostContext";
import Image from "next/image";
import { cn } from "@/lib/utils";

const STORY_DURATION = 5000; // 5 seconds per segment
const QUICK_REACTIONS = ["❤️", "🔥", "😂", "😮", "😢", "👏"];

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

export function StoryViewer() {
  const { stories, activeStoryIndex, setActiveStoryIndex } = usePosts();
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  
  const startTime = useRef<number | null>(null);
  const requestRef = useRef<number | null>(null);
  const pausedTime = useRef<number>(0);

  const activeStory = activeStoryIndex !== null ? stories[activeStoryIndex] : null;

  const handleClose = useCallback(() => {
    setActiveStoryIndex(null);
    setSegmentIndex(0);
    setProgress(0);
    startTime.current = null;
    pausedTime.current = 0;
    setReactions([]);
  }, [setActiveStoryIndex]);

  const nextSegment = useCallback(() => {
    if (!activeStory) return;
    
    if (segmentIndex < activeStory.segments.length - 1) {
      setSegmentIndex(prev => prev + 1);
      setProgress(0);
      startTime.current = null;
      pausedTime.current = 0;
    } else if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setSegmentIndex(0);
      setProgress(0);
      startTime.current = null;
      pausedTime.current = 0;
    } else {
      handleClose();
    }
  }, [activeStory, segmentIndex, activeStoryIndex, stories.length, setActiveStoryIndex, handleClose]);

  const prevSegment = useCallback(() => {
    if (!activeStory) return;

    if (segmentIndex > 0) {
      setSegmentIndex(prev => prev - 1);
      setProgress(0);
      startTime.current = null;
      pausedTime.current = 0;
    } else if (activeStoryIndex !== null && activeStoryIndex > 0) {
      const prevStory = stories[activeStoryIndex - 1];
      setActiveStoryIndex(activeStoryIndex - 1);
      setSegmentIndex(prevStory.segments.length - 1);
      setProgress(0);
      startTime.current = null;
      pausedTime.current = 0;
    } else {
      // Re-start current segment
      setProgress(0);
      startTime.current = null;
      pausedTime.current = 0;
    }
  }, [activeStory, segmentIndex, activeStoryIndex, stories, setActiveStoryIndex]);

  const animate = useCallback((time: number) => {
    if (startTime.current === null) {
      startTime.current = time;
    }

    if (!isPaused) {
      const elapsed = time - startTime.current;
      const newProgress = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(newProgress);

      if (newProgress >= 100) {
        nextSegment();
        return;
      }
      requestRef.current = requestAnimationFrame(animate);
    } else {
      pausedTime.current = time - (startTime.current || 0);
    }
  }, [isPaused, nextSegment]);

  useEffect(() => {
    if (activeStoryIndex !== null && !isPaused) {
      startTime.current = performance.now() - pausedTime.current;
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [activeStoryIndex, isPaused, animate, segmentIndex]);

  const handleTap = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPaused) return;

    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const width = window.innerWidth;

    if (x < width * 0.3) {
      prevSegment();
    } else {
      nextSegment();
    }
  };

  const handleStartPress = () => {
    setIsPaused(true);
  };

  const handleEndPress = () => {
    setIsPaused(false);
  };

  const addReaction = (emoji: string) => {
    const id = Date.now();
    const newReaction = {
      id,
      emoji,
      x: Math.random() * 60 + 20, // 20% to 80% to stay centered
    };
    setReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  if (!activeStory) return null;

  const currentSegment = activeStory.segments[segmentIndex];

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden animate-in fade-in duration-300"
      onMouseDown={handleStartPress}
      onMouseUp={handleEndPress}
      onMouseLeave={handleEndPress}
      onTouchStart={handleStartPress}
      onTouchEnd={handleEndPress}
    >
      {/* Background Blur */}
      <div className="absolute inset-0 opacity-40 blur-3xl pointer-events-none">
        <Image 
          src={currentSegment.image} 
          alt="Blur Background" 
          fill 
          className="object-cover"
        />
      </div>

      <div className="relative w-full max-w-[500px] h-full sm:h-[90vh] sm:rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl flex flex-col">
        {/* Progress Bars */}
        <div className="absolute top-4 left-4 right-4 z-[60] flex gap-1.5 px-1">
          {activeStory.segments.map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full bg-white transition-[width] duration-100 ease-linear",
                  i < segmentIndex ? "w-full" : i === segmentIndex ? "" : "w-0"
                )}
                style={i === segmentIndex ? { width: `${progress}%` } : {}}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className={cn(
          "absolute top-8 left-0 right-0 z-50 px-6 flex items-center justify-between transition-opacity duration-300",
          isPaused ? "opacity-0" : "opacity-100"
        )}>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border-2 border-white/20">
              <AvatarImage src={activeStory.user.avatar} />
              <AvatarFallback>{activeStory.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white drop-shadow-md">{activeStory.user.name}</span>
              <span className="text-[10px] text-white/60 font-medium">10h ago</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-8 w-8">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10 rounded-full h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Media Container */}
        <div 
          className="relative flex-1 cursor-pointer select-none"
          onClick={handleTap}
        >
          <Image 
            src={currentSegment.image} 
            alt="Story Content" 
            fill 
            className="object-cover"
            priority
          />

          {/* Mentions */}
          {currentSegment.mentions?.map((mention, i) => (
            <div 
              key={i}
              className="absolute bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg animate-in zoom-in duration-300"
              style={{ top: mention.y, left: mention.x }}
            >
              @{mention.username}
            </div>
          ))}

          {/* Floating Reactions */}
          {reactions.map((r) => (
            <div
              key={r.id}
              className="absolute bottom-20 text-4xl animate-out fade-out slide-out-to-top-[300px] duration-[2000ms] pointer-events-none"
              style={{ left: `${r.x}%` }}
            >
              {r.emoji}
            </div>
          ))}
        </div>

        {/* Interaction Bar */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300",
          isPaused ? "opacity-0" : "opacity-100"
        )}>
          {/* Quick Reactions */}
          <div className="flex items-center justify-between mb-4 px-2">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={(e) => {
                  e.stopPropagation();
                  addReaction(emoji);
                }}
                className="text-2xl hover:scale-125 transition-transform active:scale-95 px-2"
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 px-5 flex items-center text-white/60 text-sm focus-within:text-white transition-colors group">
              <input 
                type="text"
                placeholder={`Reply to ${activeStory.user.name}...`}
                className="bg-transparent border-none focus:ring-0 w-full placeholder:text-white/40"
                onClick={(e) => e.stopPropagation()}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
              />
              <Send className="h-5 w-5 text-white/40 group-focus-within:text-white cursor-pointer" />
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-12 w-12 bg-white/10 border border-white/20 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                addReaction("❤️");
              }}
            >
              <Heart className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Desktop Navigation Arrows */}
        <div className="hidden sm:block">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute -left-16 top-1/2 -translate-y-1/2 text-white bg-white/5 hover:bg-white/10 rounded-full h-12 w-12 border border-white/10 z-50"
            onClick={(e) => { e.stopPropagation(); prevSegment(); }}
            disabled={activeStoryIndex === 0 && segmentIndex === 0}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute -right-16 top-1/2 -translate-y-1/2 text-white bg-white/5 hover:bg-white/10 rounded-full h-12 w-12 border border-white/10 z-50"
            onClick={(e) => { e.stopPropagation(); nextSegment(); }}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  );
}
