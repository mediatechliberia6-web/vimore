"use client";

import { Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CreatePostModal } from "./create-post-modal";

export function CreatePost() {
  return (
    <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-primary/10 p-4 flex items-center gap-4">
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10 border border-primary/10">
          <AvatarImage src="https://picsum.photos/seed/me/200/200" alt="Me" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-card rounded-full" />
      </div>
      
      <CreatePostModal>
        <button className="flex-1 text-left bg-secondary/40 hover:bg-secondary/60 transition-colors rounded-full px-6 py-2.5 text-[#65676B] dark:text-gray-400 text-base">
          What's on your mind?
        </button>
      </CreatePostModal>
      
      <CreatePostModal>
        <div className="flex flex-col items-center gap-0.5 cursor-pointer group">
          <div className="p-1 rounded-lg transition-colors">
            <ImageIcon className="h-7 w-7 text-green-500" />
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground">Photo</span>
        </div>
      </CreatePostModal>
    </div>
  );
}
