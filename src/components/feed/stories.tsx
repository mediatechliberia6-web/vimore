
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Plus } from "lucide-react";

const mockStories = [
  { id: 2, name: "Alex Rivera", avatar: "https://picsum.photos/seed/1/100/100", image: "https://picsum.photos/seed/s2/200/300" },
  { id: 3, name: "Sarah Chen", avatar: "https://picsum.photos/seed/2/100/100", image: "https://picsum.photos/seed/s3/200/300" },
  { id: 4, name: "Marcus Stone", avatar: "https://picsum.photos/seed/3/100/100", image: "https://picsum.photos/seed/s4/200/300" },
  { id: 5, name: "Elena Gilbert", avatar: "https://picsum.photos/seed/4/100/100", image: "https://picsum.photos/seed/s5/200/300" },
  { id: 6, name: "Tech Insider", avatar: "https://picsum.photos/seed/10/100/100", image: "https://picsum.photos/seed/s6/200/300" },
];

const USER_PROFILE = {
  name: "John Doe",
  avatar: "https://picsum.photos/seed/me/200/200",
};

export function Stories() {
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

          {mockStories.map((story) => (
            <div key={story.id} className="relative w-28 h-48 rounded-2xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow">
              <Image 
                src={story.image} 
                alt={story.name} 
                fill 
                className="object-cover transition-transform group-hover:scale-110 duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
              
              <div className="absolute top-2 left-2 border-2 border-primary rounded-full p-0.5 shadow-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={story.avatar} />
                  <AvatarFallback>{story.name[0]}</AvatarFallback>
                </Avatar>
              </div>
              <span className="absolute bottom-2 left-2 right-2 text-[10px] font-bold text-white truncate drop-shadow-md">
                {story.name}
              </span>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </ScrollArea>
    </div>
  );
}
