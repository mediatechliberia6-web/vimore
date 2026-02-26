"use client";

import { cn } from "@/lib/utils";
import { CheckCheck, Play, ExternalLink } from "lucide-react";
import Image from "next/image";

interface LinkPreview {
  title: string;
  description: string;
  image: string;
  url: string;
}

interface ChatBubbleProps {
  isMe: boolean;
  text?: string;
  time: string;
  status?: "sent" | "delivered" | "read";
  type?: "text" | "photo" | "video" | "link";
  mediaUrl?: string;
  linkData?: LinkPreview;
}

export function ChatBubble({ isMe, text, time, status, type = "text", mediaUrl, linkData }: ChatBubbleProps) {
  const isRead = status === "read";

  return (
    <div className={cn(
      "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
      isMe ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "relative max-w-[85%] sm:max-w-[70%] shadow-md overflow-hidden",
        isMe 
          ? "bg-primary text-white rounded-2xl rounded-tr-none" 
          : "bg-white dark:bg-card text-foreground rounded-2xl rounded-tl-none border border-primary/5",
        (type === "photo" || type === "video") && "p-1 pb-0"
      )}>
        {/* The Tail */}
        <div className={cn(
          "absolute top-0 w-4 h-4 z-10",
          isMe 
            ? "-right-2 bg-primary [clip-path:polygon(0_0,0_100%,100%_0)]" 
            : "-left-2 bg-white dark:bg-card [clip-path:polygon(100%_0,100%_100%,0_0)]"
        )} />

        <div className="flex flex-col">
          {/* 1. Photo/Video Content */}
          {(type === "photo" || type === "video") && mediaUrl && (
            <div className="relative aspect-square sm:aspect-video min-w-[200px] rounded-xl overflow-hidden mb-1">
              {type === "photo" ? (
                <Image src={mediaUrl} alt="Chat Media" fill className="object-cover" />
              ) : (
                <div className="relative w-full h-full">
                  <video src={mediaUrl} className="w-full h-full object-cover" muted />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                      <Play className="h-6 w-6 text-white fill-current" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Link Preview Content */}
          {type === "link" && linkData && (
            <div className={cn(
              "m-1 mb-2 rounded-xl overflow-hidden border border-white/10 flex flex-col",
              isMe ? "bg-white/10" : "bg-secondary/30"
            )}>
              <div className="relative aspect-video w-full">
                <Image src={linkData.image} alt="Link Preview" fill className="object-cover" />
              </div>
              <div className="p-3 space-y-1">
                <h4 className="font-bold text-xs uppercase tracking-widest truncate">{linkData.title}</h4>
                <p className="text-[10px] opacity-70 line-clamp-2 leading-tight">{linkData.description}</p>
                <div className="flex items-center gap-1.5 pt-1 text-[9px] font-black opacity-50 uppercase">
                  <ExternalLink className="h-2.5 w-2.5" />
                  {new URL(linkData.url).hostname}
                </div>
              </div>
            </div>
          )}

          {/* 3. Text Content */}
          {text && (
            <div className="px-3 sm:px-4 py-2 sm:py-3">
              <p className="text-sm sm:text-[15px] leading-relaxed break-words font-medium">
                {text}
              </p>
            </div>
          )}

          {/* Timestamp & Status */}
          <div className={cn(
            "flex items-center justify-end gap-1.5 px-3 pb-2",
            isMe ? "text-white/60" : "text-muted-foreground",
            (type === "photo" || type === "video") && !text && "absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white/80"
          )}>
            <span className="text-[9px] font-bold uppercase tracking-wider">{time}</span>
            {isMe && (
              <CheckCheck className={cn(
                "h-3 w-3",
                isRead ? "text-accent" : "text-white/40"
              )} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
