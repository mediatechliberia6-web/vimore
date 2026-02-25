
"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, MoreHorizontal, Send, Heart, Eye, BellOff, VolumeX } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { usePosts, StorySegment } from "@/context/PostContext";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STORY_DURATION = 5000; // 5 seconds per segment
const QUICK_REACTIONS = ["❤️", "🔥", "😂", "😮", "😢", "👏"];
const CURRENT_USER_NAME = "John Doe";

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

export function StoryViewer() {
  const { stories, activeStoryIndex, mutedUserNames, setActiveStoryIndex, voteOnStoryPoll, toggleMuteUser } = usePosts();
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [votedSegmentId, setVotedSegmentId] = useState<string | null>(null);
  
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
    setVotedSegmentId(null);
  }, [setActiveStoryIndex]);

  const nextSegment = useCallback(() => {
    if (!activeStory) return;
    
    if (segmentIndex < activeStory.segments.length - 1) {
      setSegmentIndex(prev => prev + 1);
      setProgress(0);
      startTime.current = null;
      pausedTime.current = 0;
      setVotedSegmentId(null);
    } else if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setSegmentIndex(0);
      setProgress(0);
      startTime.current = null;
      pausedTime.current = 0;
      setVotedSegmentId(null);
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
      setVotedSegmentId(null);
    } else if (activeStoryIndex !== null && activeStoryIndex > 0) {
      const prevStory = stories[activeStoryIndex - 1];
      setActiveStoryIndex(activeStoryIndex - 1);
      setSegmentIndex(prevStory.segments.length - 1);
      setProgress(0);
      startTime.current = null;
      pausedTime.current = 0;
      setVotedSegmentId(null);
    } else {
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

  const addReaction = (emoji: string) => {
    const id = Date.now();
    const newReaction = {
      id,
      emoji,
      x: Math.random() * 60 + 20,
    };
    setReactions(prev => [...prev, newReaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2000);
  };

  const currentSegment = activeStory?.segments[segmentIndex];
  const isOwner = activeStory?.user.name === CURRENT_USER_NAME;

  const handlePollVote = (e: React.MouseEvent, optionIndex: number) => {
    e.stopPropagation();
    if (!activeStory || !currentSegment || votedSegmentId === currentSegment.id || isOwner) return;
    
    voteOnStoryPoll(activeStory.id, currentSegment.id, optionIndex);
    setVotedSegmentId(currentSegment.id);
  };

  const totalPollVotes = useMemo(() => {
    if (!currentSegment?.poll) return 0;
    return currentSegment.poll.options.reduce((acc, opt) => acc + opt.votes, 0);
  }, [currentSegment]);

  if (!activeStory || !currentSegment) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden animate-in fade-in duration-300"
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
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
          "absolute top-8 left-0 right-0 z-50 px-6 flex items-start justify-between transition-opacity duration-300",
          isPaused ? "opacity-0" : "opacity-100"
        )}>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center gap-1.5">
              <Link 
                href={`/profile/${activeStory.user.username || 'johndoe_creative'}`} 
                onClick={handleClose}
                className="transition-transform hover:scale-105 active:scale-95"
              >
                <Avatar className={cn(
                  "h-10 w-10 border-2",
                  activeStory.isCloseFriends ? "border-[#42b72a]" : "border-white/20"
                )}>
                  <AvatarImage src={activeStory.user.avatar} />
                  <AvatarFallback>{activeStory.user.name[0]}</AvatarFallback>
                </Avatar>
              </Link>
              
              {isOwner && (
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full text-white/90 border border-white/10 shadow-lg animate-in slide-in-from-top-1">
                  <Eye className="h-2.5 w-2.5 text-primary" />
                  <span className="text-[10px] font-black tracking-tighter">{activeStory.viewCount || 0}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col pt-0.5">
              <Link 
                href={`/profile/${activeStory.user.username || 'johndoe_creative'}`} 
                onClick={handleClose} 
                className="group"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white drop-shadow-md group-hover:underline">{activeStory.user.name}</span>
                  {activeStory.isCloseFriends && (
                    <span className="text-[9px] bg-[#42b72a] text-white px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">Close Friends</span>
                  )}
                </div>
              </Link>
              <span className="text-[10px] text-white/60 font-medium mt-0.5">Recently</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <DropdownMenu onOpenChange={(open) => setIsPaused(open)}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-8 w-8">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                <DropdownMenuItem className="gap-2 cursor-pointer font-bold" onClick={() => toggleMuteUser(activeStory.user.name)}>
                  <VolumeX className="h-4 w-4" />
                  {mutedUserNames.includes(activeStory.user.name) ? "Unmute" : "Mute"} {activeStory.user.name}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer font-bold text-destructive focus:text-destructive">
                  <BellOff className="h-4 w-4" />
                  Notifications Off
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full h-8 w-8" onClick={handleClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Media Container */}
        <div 
          className={cn(
            "relative flex-1 cursor-pointer select-none flex items-center justify-center overflow-hidden",
            // @ts-ignore - checking for background from text stories
            currentSegment.background || "bg-black"
          )}
          onClick={handleTap}
        >
          {currentSegment.type === 'video' ? (
            <video 
              src={currentSegment.image} 
              className="w-full h-full object-cover" 
              autoPlay 
              muted 
              loop 
              playsInline 
            />
          ) : currentSegment.image ? (
            <Image 
              src={currentSegment.image} 
              alt="Story Content" 
              fill 
              className={cn("object-cover", currentSegment.filter)}
              priority
            />
          ) : null}

          {/* Draggable Text Overlays / Centered Story Text */}
          {currentSegment.textOverlays?.map((overlay, i) => (
            <div 
              key={i}
              className="absolute z-40 p-6 pointer-events-none w-full text-center"
              style={{ 
                top: `${overlay.y}%`, 
                left: `${overlay.x}%`, 
                transform: 'translate(-50%, -50%)',
                color: overlay.color,
                textShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
            >
              <span className="text-3xl font-black italic uppercase tracking-tighter leading-tight">
                {overlay.text}
              </span>
            </div>
          ))}

          {/* Poll Sticker */}
          {currentSegment.poll && (
            <div 
              className="absolute z-40 w-[240px] bg-white rounded-2xl p-4 shadow-2xl animate-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="text-center font-bold text-sm text-zinc-900 mb-3">{currentSegment.poll.question}</h4>
              <div className="space-y-2">
                {currentSegment.poll.options.map((opt, i) => {
                  const percent = totalPollVotes > 0 ? (opt.votes / totalPollVotes) * 100 : 0;
                  const isVoted = votedSegmentId === currentSegment.id || isOwner;
                  
                  return (
                    <button
                      key={i}
                      onClick={(e) => handlePollVote(e, i)}
                      disabled={isVoted}
                      className={cn(
                        "w-full h-10 rounded-xl border-2 relative overflow-hidden transition-all group",
                        isVoted ? "border-primary/20" : "border-primary/10 hover:border-primary/30"
                      )}
                    >
                      {isVoted && (
                        <div 
                          className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-1000"
                          style={{ width: `${percent}%` }}
                        />
                      )}
                      <div className="absolute inset-0 flex items-center justify-between px-3 text-sm font-bold">
                        <span className={cn(isVoted ? "text-primary" : "text-zinc-800")}>{opt.text}</span>
                        {isVoted && <span className="text-primary/60">{Math.round(percent)}%</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Floating Reactions */}
          {reactions.map((r) => (
            <div
              key={r.id}
              className="absolute bottom-20 text-4xl animate-out fade-out slide-out-to-top-[300px] pointer-events-none"
              style={{ left: `${r.x}%`, animationDuration: '2000ms' }}
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
          {!isOwner ? (
            <>
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
                <div className="flex-1 h-12 bg-white/10 backdrop-blur-md rounded-full border border-white/20 px-5 flex items-center text-white/60 text-sm transition-colors group">
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
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 mb-2 animate-in slide-in-from-bottom-2">
              <div className="h-1 w-8 bg-white/20 rounded-full mb-2" />
              <div className="flex items-center gap-2 text-white/40 font-bold text-[10px] uppercase tracking-[0.2em]">
                Owner Presence
              </div>
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
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
