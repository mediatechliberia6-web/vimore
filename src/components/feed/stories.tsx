
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Plus } from "lucide-react";
import { usePosts } from "@/context/PostContext";
import { StoryViewer } from "./story-viewer";
import { cn } from "@/lib/utils";

const USER_PROFILE = {
  name: "John Doe",
  avatar: "https://picsum.photos/seed/me/200/200",
};

export function Stories() {
  const { stories, setActiveStoryIndex } = usePosts();

  return (
    <div className="w-full">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-2.5 p-1 pb-4">
          {/* Create Story */}
          <div className="relative w-28 h-48 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-card border border-primary/10">
            <div className="relative h-[70%] w-full">
              <Image 
                src={USER_PROFILE.avatar} 
                alt="My Story" 
                fill 
                className="object-cover transition-transform group-hover:scale-105 duration-500"
              />
              <div className="absolute inset-0 bg-black/10" />
            </div>
            <div className="relative h-[30%] bg-white dark:bg-card flex flex-col items-center justify-center">
              <div className="absolute -top-4 w-8 h-8 bg-primary rounded-full border-4 border-white dark:border-card flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110">
                <Plus className="h-5 w-5" />
              </div>
              <span className="mt-3 text-[10px] font-bold text-foreground">Create Story</span>
            </div>
          </div>

          {stories.map((story, index) => (
            <div 
              key={story.id} 
              className="relative w-28 h-48 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow"
              onClick={() => setActiveStoryIndex(index)}
            >
              <Image 
                src={story.segments[0].image} 
                alt={story.user.name} 
                fill 
                className="object-cover transition-transform group-hover:scale-110 duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
              
              <div className={cn(
                "absolute top-2 left-2 border-2 rounded-full p-0.5 shadow-lg",
                story.isCloseFriends ? "border-[#42b72a]" : "border-primary"
              )}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={story.user.avatar} />
                  <AvatarFallback>{story.user.name[0]}</AvatarFallback>
                </Avatar>
              </div>
              <span className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white truncate drop-shadow-md">
                {story.user.name}
              </span>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </ScrollArea>

      <StoryViewer />
    </div>
  );
}
