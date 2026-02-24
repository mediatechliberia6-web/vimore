
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const mockConversations = [
  { id: 1, name: "Alex Rivera", username: "arivera", lastMsg: "See you at the event!", time: "2m", unread: 2, avatar: "https://picsum.photos/seed/1/100/100" },
  { id: 2, name: "Sarah Chen", username: "schen_dev", lastMsg: "The AI summary was great!", time: "15m", unread: 0, avatar: "https://picsum.photos/seed/2/100/100" },
  { id: 3, name: "Marcus Stone", username: "mstone", lastMsg: "Did you check the new post?", time: "1h", unread: 0, avatar: "https://picsum.photos/seed/3/100/100" },
  { id: 4, name: "Elena Gilbert", username: "elena_g", lastMsg: "Let's catch up later.", time: "3h", unread: 0, avatar: "https://picsum.photos/seed/4/100/100" },
];

export function DirectMessageList() {
  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur-md border-r border-primary/10">
      <div className="p-6 border-b border-primary/10">
        <h2 className="font-headline font-bold text-2xl">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {mockConversations.map((chat) => (
          <div 
            key={chat.id} 
            className={cn(
              "flex items-center gap-4 p-4 hover:bg-primary/5 cursor-pointer transition-colors relative group",
              chat.unread > 0 && "bg-accent/5"
            )}
          >
            <Link href="/profile" className="shrink-0 transition-transform group-hover:scale-105">
              <Avatar className="h-12 w-12 border-2 border-primary/10">
                <AvatarImage src={chat.avatar} alt={chat.name} />
                <AvatarFallback>{chat.name[0]}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <Link href="/profile" className="font-bold text-sm truncate hover:underline">
                  {chat.name}
                </Link>
                <span className="text-[10px] text-muted-foreground">{chat.time}</span>
              </div>
              <p className={cn(
                "text-xs truncate",
                chat.unread > 0 ? "text-foreground font-semibold" : "text-muted-foreground"
              )}>
                {chat.lastMsg}
              </p>
            </div>
            {chat.unread > 0 && (
              <div className="absolute right-4 bottom-4 bg-accent text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center">
                {chat.unread}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
