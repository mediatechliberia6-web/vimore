"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCheck, Play, Pause, ExternalLink, UserPlus, Mic } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMusic } from "@/context/MusicContext";

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
  type?: "text" | "photo" | "video" | "link" | "voice" | "tag";
  mediaUrl?: string;
  linkData?: LinkPreview;
  reactions?: string[];
  taggedUser?: {
    name: string;
    username: string;
    avatar: string;
    category: string;
  };
  onReact?: (emoji: string) => void;
}

export function ChatBubble({ 
  isMe, text, time, status, type = "text", mediaUrl, linkData, reactions = [], taggedUser, onReact 
}: ChatBubbleProps) {
  const { triggerHaptic } = useMusic();
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const isRead = status === "read";

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic(20);
    onReact?.("🔥");
  };

  return (
    <div 
      className={cn(
        "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 group",
        isMe ? "justify-end" : "justify-start"
      )}
      onDoubleClick={handleDoubleClick}
    >
      <div className={cn(
        "relative max-w-[85%] sm:max-w-[70%] shadow-md",
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

          {/* 3. Voice Note Content */}
          {type === "voice" && (
            <div className="px-4 py-3 flex items-center gap-4 min-w-[220px]">
              <button 
                onClick={() => { triggerHaptic(5); setIsPlayingVoice(!isPlayingVoice); }}
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center transition-all",
                  isMe ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                )}
              >
                {isPlayingVoice ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
              </button>
              <div className="flex-1 flex items-center gap-1 h-6">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "w-1 rounded-full transition-all duration-300",
                      isMe ? "bg-white/40" : "bg-primary/30",
                      isPlayingVoice && "animate-pulse"
                    )}
                    style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
              <Mic className={cn("h-4 w-4 opacity-40", isMe ? "text-white" : "text-primary")} />
            </div>
          )}

          {/* 4. Collaborator Tag Content */}
          {type === "tag" && taggedUser && (
            <div className={cn(
              "m-1 mb-2 p-3 rounded-xl flex items-center gap-3 border border-white/10",
              isMe ? "bg-white/10" : "bg-primary/5"
            )}>
              <Avatar className="h-12 w-12 border-2 border-white/20">
                <AvatarImage src={taggedUser.avatar} />
                <AvatarFallback>{taggedUser.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{taggedUser.name}</p>
                <p className={cn("text-[10px] font-black uppercase tracking-widest", isMe ? "text-white/60" : "text-primary")}>
                  {taggedUser.category}
                </p>
              </div>
              <button className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center",
                isMe ? "bg-white/20" : "bg-primary text-white"
              )}>
                <UserPlus className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* 5. Text Content */}
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

        {/* Reaction Row */}
        {reactions.length > 0 && (
          <div className={cn(
            "absolute -bottom-3 flex gap-1",
            isMe ? "right-2" : "left-2"
          )}>
            {reactions.map((emoji, i) => (
              <div 
                key={i} 
                className="bg-white dark:bg-zinc-800 shadow-lg rounded-full px-1.5 py-0.5 text-xs border border-primary/10 animate-in zoom-in duration-300"
              >
                {emoji}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
