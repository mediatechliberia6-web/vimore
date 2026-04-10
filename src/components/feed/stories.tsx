
"use client";

import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Plus } from "lucide-react";
import { usePosts } from "@/context/PostContext";
import { StoryViewer } from "./story-viewer";
import { cn } from "@/lib/utils";

interface StoriesProps {
  onOpenCreate?: () => void;
}

export function Stories({ onOpenCreate }: StoriesProps) {
  const { stories, setActiveStoryIndex, currentUser, triggerHaptic, settings } = usePosts();

  /**
   * Spatial Sorting Handshake:
   * Prioritize the user's own story at the front of the rail.
   */
  const sortedStories = useMemo(() => {
    // Map stories with their original indices to ensure the click handshake remains valid
    const storiesWithIndices = stories.map((story, index) => ({ story, index }));
    
    if (!currentUser) return storiesWithIndices;

    const myStoryNode = storiesWithIndices.find(item => item.story.user.username === currentUser.username);
    const otherStoryNodes = storiesWithIndices.filter(item => item.story.user.username !== currentUser.username);
    
    return myStoryNode ? [myStoryNode, ...otherStoryNodes] : otherStoryNodes;
  }, [stories, currentUser?.username]);

  const handleStoryClick = (index: number) => {
    triggerHaptic(10);
    setActiveStoryIndex(index);
  };

  return (
    <div className="relative">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 p-1 pb-4">
          {/* Create Story Button - Fixed far left */}
          <div 
            className="relative w-28 h-48 rounded-2xl overflow-hidden shrink-0 border border-primary/10 bg-white dark:bg-card cursor-pointer group shadow-sm"
            onClick={() => { triggerHaptic(5); onOpenCreate?.(); }}
          >
            <div className="relative h-3/4 w-full overflow-hidden bg-primary/10">
              {currentUser?.avatar ? (
                <Image 
                  src={currentUser.avatar} 
                  alt="My Profile" 
                  fill 
                  className="object-cover transition-transform group-hover:scale-110" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-1/2 h-1/2 text-primary">
                    <path d="M3 7L10 19L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 15L17 7L21 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-white dark:bg-card flex items-center justify-center p-2">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 bg-primary rounded-full border-4 border-white dark:border-card flex items-center justify-center text-white shadow-lg">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest mt-2">Create</span>
            </div>
          </div>

          {/* Stories Rail - Sorted with current user first */}
          {sortedStories.map(({ story, index }) => {
            const firstSegment = story.segments[0];
            if (!firstSegment) return null;
            const isVideo = firstSegment.type === 'video';
            const mediaUrl = (firstSegment as any).mediaUrl || (firstSegment as any).image;
            const isTextStory = firstSegment.type === 'text' || (!mediaUrl && firstSegment.text);

            return (
              <div 
                key={story.$id} 
                className={cn(
                  "relative w-28 h-48 rounded-2xl overflow-hidden shrink-0 border border-primary/5 cursor-pointer group shadow-sm transition-all hover:scale-[1.02]",
                  settings.isFreeMode ? "bg-secondary/20" : isTextStory ? ((firstSegment as any).background || "bg-gradient-to-br from-primary to-accent") : ""
                )}
                onClick={() => handleStoryClick(index)}
              >
                {!settings.isFreeMode && (
                  isVideo ? (
                    mediaUrl ? (
                      <video 
                        src={mediaUrl} 
                        className={cn("object-cover w-full h-full transition-transform group-hover:scale-110", (firstSegment as any).filter)}
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : null
                  ) : isTextStory ? (
                    <div className="w-full h-full flex items-center justify-center p-3 text-center">
                      <span className="text-white text-xs font-bold line-clamp-4 italic">{firstSegment.text}</span>
                    </div>
                  ) : (
                    mediaUrl ? (
                      <Image 
                        src={mediaUrl} 
                        alt={story.user.name} 
                        fill 
                        className={cn("object-cover transition-transform group-hover:scale-110", (firstSegment as any).filter)} 
                      />
                    ) : null
                  )
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                
                <div className={cn(
                  "absolute transition-all duration-500",
                  settings.isFreeMode ? "inset-0 flex items-center justify-center" : "top-2 left-2"
                )}>
                  <Avatar className={cn(
                    "border-2 shadow-lg transition-all",
                    settings.isFreeMode ? "h-16 w-16" : "h-8 w-8",
                    story.isCloseFriends ? "border-[#42b72a]" : "border-primary"
                  )}>
                    <AvatarImage src={story.user.avatar} />
                    <AvatarFallback>{story.user.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-[10px] font-bold text-white truncate drop-shadow-md">
                    {story.user.username === currentUser?.username ? "Your Story" : story.user.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="opacity-0" />
      </ScrollArea>

      <StoryViewer />
    </div>
  );
}
