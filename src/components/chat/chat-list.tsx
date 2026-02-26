"use client";

import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Settings2, 
  Pin, 
  Circle, 
  Filter,
  MoreVertical,
  Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePosts } from "@/context/PostContext";

interface ChatListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const MOCK_MESSAGES: Record<string, { text: string; time: string; unread: number }> = {
  "arivera": { text: "The new design system is live! 🚀", time: "10:42 AM", unread: 2 },
  "schen_dev": { text: "Check out the API docs I sent.", time: "Yesterday", unread: 0 },
  "mstone": { text: "That shoot was incredible.", time: "2:15 PM", unread: 0 },
  "jmoore": { text: "Let's sync up later today.", time: "9:00 AM", unread: 1 },
  "techex": { text: "I've optimized the capture studio.", time: "Mon", unread: 0 },
};

export function ChatList({ selectedId, onSelect }: ChatListProps) {
  const { connections } = usePosts();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread">("all");

  const [pinnedUsernames] = useState(new Set(["arivera", "schen_dev"]));

  const sortedChats = useMemo(() => {
    let list = [...connections];

    if (searchQuery) {
      list = list.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeFilter === "unread") {
      list = list.filter(c => (MOCK_MESSAGES[c.username]?.unread || 0) > 0);
    }

    // Sorting: Pinned first, then by online status
    return list.sort((a, b) => {
      const aPinned = pinnedUsernames.has(a.username);
      const bPinned = pinnedUsernames.has(b.username);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      
      return 0;
    });
  }, [connections, searchQuery, activeFilter, pinnedUsernames]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-card">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-primary/5 flex items-center justify-between">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Chats</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 space-y-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search conversations..." 
            className="pl-10 h-10 bg-secondary/30 border-none rounded-xl focus-visible:ring-primary/20 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant={activeFilter === "all" ? "default" : "secondary"} 
            size="sm" 
            className="rounded-full h-7 px-4 text-[10px] font-black uppercase tracking-widest"
            onClick={() => setActiveFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={activeFilter === "unread" ? "default" : "secondary"} 
            size="sm" 
            className="rounded-full h-7 px-4 text-[10px] font-black uppercase tracking-widest"
            onClick={() => setActiveFilter("unread")}
          >
            Unread
          </Button>
          <Button variant="secondary" size="sm" className="rounded-full h-7 px-4 text-[10px] font-black uppercase tracking-widest ml-auto">
            <Filter className="h-3 w-3 mr-1.5" /> Filter
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {sortedChats.length > 0 ? (
          sortedChats.map((chat) => {
            const isSelected = selectedId === chat.username;
            const meta = MOCK_MESSAGES[chat.username] || { text: "No messages yet.", time: "", unread: 0 };
            const isPinned = pinnedUsernames.has(chat.username);

            return (
              <div 
                key={chat.username}
                onClick={() => onSelect(chat.username)}
                className={cn(
                  "group flex items-center gap-4 p-4 cursor-pointer transition-all border-l-4",
                  isSelected 
                    ? "bg-primary/5 border-primary" 
                    : "hover:bg-secondary/30 border-transparent"
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 border-2 border-primary/5">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  {chat.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-card rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-sm truncate">{chat.name}</span>
                    <span className={cn(
                      "text-[10px] font-medium",
                      meta.unread > 0 ? "text-primary font-bold" : "text-muted-foreground"
                    )}>
                      {meta.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                      "text-xs truncate",
                      meta.unread > 0 ? "text-foreground font-semibold" : "text-muted-foreground"
                    )}>
                      {meta.text}
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isPinned && <Pin className="h-3 w-3 text-muted-foreground/40 rotate-45" />}
                      {meta.unread > 0 && (
                        <div className="h-4 min-w-[16px] px-1 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                          {meta.unread}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center space-y-2 opacity-40">
            <Search className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm font-bold">No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
}
