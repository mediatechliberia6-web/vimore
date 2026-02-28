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
  Users2,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useToast } from "@/hooks/use-toast";
import { CreateClusterModal } from "./create-cluster-modal";

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
  const { connections, clusters, triggerHaptic } = usePosts();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "broadcasts" | "clusters">("all");

  const [pinnedUsernames] = useState(new Set(["arivera", "schen_dev"]));

  const sortedChats = useMemo(() => {
    // Combine individual connections and clusters
    const allItems = [
      ...connections.map(c => ({ ...c, isGroup: false })),
      ...clusters.map(cl => ({ ...cl, isGroup: true }))
    ];

    let list = allItems;

    if (activeFilter === "clusters") {
      list = list.filter(item => item.isGroup);
    } else if (activeFilter === "unread") {
      list = list.filter(item => (MOCK_MESSAGES[(item as any).username || (item as any).id]?.unread || 0) > 0);
    } else if (activeFilter === "broadcasts") {
      return []; // To be implemented in next sync
    }

    if (searchQuery) {
      list = list.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (item as any).username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return list.sort((a, b) => {
      const aPinned = pinnedUsernames.has((a as any).username || (a as any).id);
      const bPinned = pinnedUsernames.has((b as any).username || (b as any).id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }, [connections, clusters, searchQuery, activeFilter, pinnedUsernames]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-card">
      <div className="p-4 sm:p-6 border-b border-primary/5 flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Chats</h2>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{connections.length + clusters.length} Active Nodes</span>
        </div>
        <div className="flex items-center gap-1">
          <CreateClusterModal>
            <button 
              className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all active:scale-90"
              title="Materialize Cluster"
            >
              <Layers className="h-4 w-4" />
            </button>
          </CreateClusterModal>
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Query nodes..." 
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
            variant={activeFilter === "clusters" ? "default" : "secondary"} 
            size="sm" 
            className="rounded-full h-7 px-4 text-[10px] font-black uppercase tracking-widest shrink-0 gap-1.5"
            onClick={() => { triggerHaptic(5); setActiveFilter("clusters"); }}
          >
            <Layers className="h-3 w-3" /> Clusters
          </Button>
          <Button 
            variant={activeFilter === "unread" ? "default" : "secondary"} 
            size="sm" 
            className="rounded-full h-7 px-4 text-[10px] font-black uppercase tracking-widest shrink-0"
            onClick={() => { triggerHaptic(5); setActiveFilter("unread"); }}
          >
            Unread
          </Button>
          <Button variant="secondary" size="sm" className="rounded-full h-7 px-4 text-[10px] font-black uppercase tracking-widest ml-auto shrink-0">
            <Filter className="h-3 w-3 mr-1.5" /> Filter
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {sortedChats.length > 0 ? (
          sortedChats.map((item) => {
            const id = (item as any).username || item.id;
            const isSelected = selectedId === id;
            const meta = MOCK_MESSAGES[id] || { text: (item as any).lastMessage || "No messages yet.", time: (item as any).lastTime || "", unread: 0 };
            const isPinned = pinnedUsernames.has(id);

            return (
              <div 
                key={id}
                onClick={() => { triggerHaptic(5); onSelect(id); }}
                className={cn(
                  "group flex items-center gap-4 p-4 cursor-pointer transition-all border-l-4",
                  isSelected ? "bg-primary/5 border-primary" : "hover:bg-secondary/30 border-transparent"
                )}
              >
                <div className="relative shrink-0">
                  {item.isGroup ? (
                    <div className="h-12 w-12 rounded-[1rem] bg-primary/10 flex items-center justify-center relative overflow-hidden border border-primary/5">
                      {item.avatar ? (
                        <img src={item.avatar} alt="Cluster" className="w-full h-full object-cover" />
                      ) : (
                        <div className="relative w-full h-full">
                          {(item as any).members.slice(0, 2).map((m: any, i: number) => (
                            <Avatar key={m.username} className={cn("absolute h-8 w-8 border-2 border-white dark:border-card", i === 0 ? "top-0 left-0" : "bottom-0 right-0")}>
                              <AvatarImage src={m.avatar} />
                            </Avatar>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Avatar className="h-12 w-12 border-2 border-primary/5 transition-transform group-hover:scale-105">
                      <AvatarImage src={(item as any).avatar} />
                      <AvatarFallback>{item.name[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  {(item as any).isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-card rounded-full animate-pulse" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-bold text-sm truncate">{item.name}</span>
                      {item.isGroup && <Badge className="bg-primary/10 text-primary border-none text-[7px] font-black h-3.5 px-1 uppercase tracking-tighter">CLUSTER</Badge>}
                    </div>
                    <span className={cn("text-[10px] font-medium", meta.unread > 0 ? "text-primary font-bold" : "text-muted-foreground")}>{meta.time}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-xs truncate", meta.unread > 0 ? "text-foreground font-semibold" : "text-muted-foreground")}>{meta.text}</p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isPinned && <Pin className="h-3 w-3 text-muted-foreground/40 rotate-45" />}
                      {meta.unread > 0 && (
                        <div className="h-4 min-w-[16px] px-1 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-lg shadow-primary/20">{meta.unread}</div>
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
