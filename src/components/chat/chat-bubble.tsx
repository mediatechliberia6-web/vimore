"use client";

import { cn } from "@/lib/utils";
import { CheckCheck } from "lucide-react";

interface ChatBubbleProps {
  isMe: boolean;
  text: string;
  time: string;
  status?: "sent" | "delivered" | "read";
}

export function ChatBubble({ isMe, text, time, status }: ChatBubbleProps) {
  return (
    <div className={cn(
      "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300",
      isMe ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "relative max-w-[85%] sm:max-w-[70%] p-3 sm:p-4 shadow-md",
        isMe 
          ? "bg-primary text-white rounded-2xl rounded-tr-none" 
          : "bg-white dark:bg-card text-foreground rounded-2xl rounded-tl-none border border-primary/5"
      )}>
        {/* The Tail */}
        <div className={cn(
          "absolute top-0 w-4 h-4",
          isMe 
            ? "-right-2 bg-primary [clip-path:polygon(0_0,0_100%,100%_0)]" 
            : "-left-2 bg-white dark:bg-card [clip-path:polygon(100%_0,100%_100%,0_0)]"
        )} />

        <div className="space-y-1">
          <p className="text-sm sm:text-[15px] leading-relaxed break-words font-medium">
            {text}
          </p>
          <div className={cn(
            "flex items-center justify-end gap-1.5 mt-1",
            isMe ? "text-white/60" : "text-muted-foreground"
          )}>
            <span className="text-[9px] font-bold uppercase tracking-wider">{time}</span>
            {isMe && (
              <CheckCheck className={cn(
                "h-3 w-3",
                status === "read" ? "text-accent" : "text-white/40"
              )} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
