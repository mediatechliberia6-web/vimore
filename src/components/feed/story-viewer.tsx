
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePosts } from "@/context/PostContext";
import Image from "next/image";
import { cn } from "@/lib/utils";

const STORY_DURATION = 5000; // 5 seconds per segment

export function StoryViewer() {
  const { stories, activeStoryIndex, setActiveStoryIndex } = usePosts();
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  
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
      // When paused, we don't request a new frame, 
      // but we store where we were so we can resume smoothly
      pausedTime.current = time - (startTime.current || 0);
    }
  }, [isPaused, nextSegment]);

  useEffect(() => {
    if (activeStoryIndex !== null && !isPaused) {
      // Adjust startTime to resume from exactly where we left off
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
    // If long press just finished, ignore the tap trigger from mouseUp/touchend
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
                  "h-full bg-white",
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
        </div>

        {/* Interaction Bar */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 p-6 pt-12 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300",
          isPaused ? "opacity-0" : "opacity-100"
        )}>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-11 bg-white/10 backdrop-blur-md rounded-full border border-white/20 px-5 flex items-center text-white/60 text-sm">
              Reply to {activeStory.user.name}...
            </div>
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
