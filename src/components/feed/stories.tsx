"use client";

import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Plus } from "lucide-react";
import { usePosts } from "@/context/PostContext";
import { StoryViewer } from "./story-viewer";
import { cn } from "@/lib/utils";

export function Stories() {
  const { stories, setActiveStoryIndex, currentUser, triggerHaptic, settings } = usePosts();

  const handleStoryClick = (index: number) => {
    triggerHaptic(10);
    setActiveStoryIndex(index);
  };

  return (
    <div className="relative">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-3 p-1 pb-4">
          {/* Create Story Button */}
          <div 
            className="relative w-28 h-48 rounded-2xl overflow-hidden shrink-0 border border-primary/10 bg-white dark:bg-card cursor-pointer group shadow-sm"
            onClick={() => triggerHaptic(5)}
          >
            <div className="relative h-3/4 w-full overflow-hidden">
              <Image 
                src={currentUser.avatar} 
                alt="My Profile" 
                fill 
                className="object-cover transition-transform group-hover:scale-110" 
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-white dark:bg-card flex items-center justify-center p-2">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 bg-primary rounded-full border-4 border-white dark:border-card flex items-center justify-center text-white shadow-lg">
                <Plus className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest mt-2">Create</span>
            </div>
          </div>

          {/* Stories Rail */}
          {stories.map((story, index) => (
            <div 
              key={story.id} 
              className={cn(
                "relative w-28 h-48 rounded-2xl overflow-hidden shrink-0 border border-primary/5 cursor-pointer group shadow-sm transition-all hover:scale-[1.02]",
                settings.isFreeMode ? "bg-secondary/20" : ""
              )}
              onClick={() => handleStoryClick(index)}
            >
              {!settings.isFreeMode && (
                <Image 
                  src={story.segments[0].image} 
                  alt={story.user.name} 
                  fill 
                  className={cn("object-cover transition-transform group-hover:scale-110", story.segments[0].filter)} 
                />
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
                  {story.user.name}
                </p>
              </div>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="opacity-0" />
      </ScrollArea>

      <StoryViewer />
    </div>
  );
}
