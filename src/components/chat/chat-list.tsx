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
  Edit2,
  Radio,
  Plus,
  Users2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useToast } from "@/hooks/use-toast";

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
  const { triggerHaptic } = useMusic();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "broadcasts">("all");

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

    if (activeFilter === "broadcasts") {
      // Simulate empty broadcasts for now or filtering by a property
      return [];
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

  const handleNewBroadcast = () => {
    triggerHaptic(20);
    toast({
      title: "Broadcast Studio",
      description: "Select nodes to receive your collective update pulse.",
    });
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-card">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-primary/5 flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Chats</h2>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{connections.length} Active Nodes</span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" size="icon" className="rounded-full h-9 w-9 bg-primary/5 text-primary hover:bg-primary/10"
            onClick={handleNewBroadcast}
            title="New Broadcast"
          >
            <Radio className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="p-4 space-y-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Query conversations..." 
            className="pl-10 h-10 bg-secondary/30 border-none rounded-xl focus-visible:ring-primary/20 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Button 
            variant={activeFilter === "all" ? "default" : "secondary"} 
            size="sm" 
            className="rounded-full h-7 px-4 text-[10px] font-black uppercase tracking-widest shrink-0"
            onClick={() => { triggerHaptic(5); setActiveFilter("all"); }}
          >
            All
          </Button>
          <Button 
            variant={activeFilter === "unread" ? "default" : "secondary"} 
            size="sm" 
            className="rounded-full h-7 px-4 text-[10px] font-black uppercase tracking-widest shrink-0"
            onClick={() => { triggerHaptic(5); setActiveFilter("unread"); }}
          >
            Unread
          </Button>
          <Button 
            variant={activeFilter === "broadcasts" ? "default" : "secondary"} 
            size="sm" 
            className="rounded-full h-7 px-4 text-[10px] font-black uppercase tracking-widest shrink-0 gap-1.5"
            onClick={() => { triggerHaptic(5); setActiveFilter("broadcasts"); }}
          >
            <Radio className="h-3 w-3" /> Broadcasts
          </Button>
          <Button variant="secondary" size="sm" className="rounded-full h-7 px-4 text-[10px] font-black uppercase tracking-widest ml-auto shrink-0">
            <Filter className="h-3 w-3 mr-1.5" /> Filter
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {activeFilter === 'broadcasts' && sortedChats.length === 0 ? (
          <div className="p-12 text-center space-y-4 animate-in fade-in duration-500">
            <div className="h-16 w-16 bg-primary/5 rounded-[1.5rem] flex items-center justify-center mx-auto border border-dashed border-primary/20">
              <Radio className="h-6 w-6 text-primary/40" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black italic uppercase text-sm tracking-widest">No Active Pulses</h3>
              <p className="text-[10px] text-muted-foreground font-medium uppercase leading-relaxed">Broadcast updates to multiple followers simultaneously.</p>
            </div>
            <Button size="sm" className="rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white h-8 text-[10px] font-black uppercase tracking-widest" onClick={handleNewBroadcast}>
              Create Broadcast
            </Button>
          </div>
        ) : sortedChats.length > 0 ? (
          sortedChats.map((chat) => {
            const isSelected = selectedId === chat.username;
            const meta = MOCK_MESSAGES[chat.username] || { text: "No messages yet.", time: "", unread: 0 };
            const isPinned = pinnedUsernames.has(chat.username);

            return (
              <div 
                key={chat.username}
                onClick={() => { triggerHaptic(5); onSelect(chat.username); }}
                className={cn(
                  "group flex items-center gap-4 p-4 cursor-pointer transition-all border-l-4",
                  isSelected 
                    ? "bg-primary/5 border-primary" 
                    : "hover:bg-secondary/30 border-transparent"
                )}
              >
                <div className="relative shrink-0">
                  <Avatar className="h-12 w-12 border-2 border-primary/5 transition-transform group-hover:scale-105">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  {chat.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-card rounded-full animate-pulse" />
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
          <div className="p-12 text-center space-y-2 opacity-40">
            <Search className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm font-bold">No nodes matched query</p>
          </div>
        )}
      </div>
    </div>
  );
}
