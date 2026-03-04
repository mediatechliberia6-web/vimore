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
import { useTranslation } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { CreateClusterModal } from "./create-cluster-modal";

interface ChatListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ChatList({ selectedId, onSelect }: ChatListProps) {
  const { connections = [], clusters = [], triggerHaptic, settings, currentUser } = usePosts();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "broadcasts" | "clusters">("all");

  const [pinnedUsernames] = useState(new Set<string>());

  const sortedChats = useMemo(() => {
    // Identity Protocol: Only message OTHER users, never yourself.
    const allItems = [
      ...(connections || [])
        .filter(c => c.username !== currentUser.username)
        .map(c => ({ ...c, isGroup: false })),
      ...(clusters || []).map(cl => ({ ...cl, isGroup: true }))
    ];

    let list = allItems;

    if (activeFilter === "clusters") {
      list = list.filter(item => item.isGroup);
    } else if (activeFilter === "unread") {
      // Logic for real unread count would be here in a production node
      list = list.filter(item => false); 
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        (item.name || "").toLowerCase().includes(q) || 
        ((item as any).username || "").toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => {
      const aId = (a as any).username || (a as any).id;
      const bId = (b as any).username || (b as any).id;
      const aPinned = pinnedUsernames.has(aId);
      const bPinned = pinnedUsernames.has(bId);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }, [connections, clusters, searchQuery, activeFilter, pinnedUsernames, currentUser.username]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-card">
      <div className="p-4 sm:p-6 border-b border-primary/5 flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">{t('nav_messages')}</h2>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{connections.length + clusters.length} {t('chat_nodes_online')}</span>
        </div>
        <div className="flex items-center gap-1">
          <CreateClusterModal>
            <button className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all active:scale-90" title={t('chat_materialize_cluster')}><Layers className="h-4 w-4" /></button>
          </CreateClusterModal>
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9"><Edit2 className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative group"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary" /><Input placeholder={t('chat_query_nodes')} className="pl-10 h-10 bg-secondary/30 border-none rounded-xl text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <Button variant={activeFilter === "all" ? "default" : "secondary"} size="sm" className="rounded-full h-7 px-4 text-[10px] font-black uppercase tracking-widest" onClick={() => { triggerHaptic(5); setActiveFilter("all"); }}>{t('ui_all')}</Button>
          <Button variant={activeFilter === "clusters" ? "default" : "secondary"} size="sm" className="rounded-full h-7 px-4 text-[10px] font-black uppercase tracking-widest gap-1.5" onClick={() => { triggerHaptic(5); setActiveFilter("clusters"); }}><Layers className="h-3 w-3" /> {t('admin_clusters')}</Button>
          <Button variant={activeFilter === "unread" ? "default" : "secondary"} size="sm" className="rounded-full h-7 px-4 text-[10px] font-black uppercase tracking-widest" onClick={() => { triggerHaptic(5); setActiveFilter("unread"); }}>{t('ui_unread')}</Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {sortedChats.length > 0 ? (
          sortedChats.map((item) => {
            const id = (item as any).username || item.id;
            const isSelected = selectedId === id;
            const isOnlineVisible = (item as any).isOnline && !settings.isGhostMode;

            return (
              <div key={id} onClick={() => { triggerHaptic(5); onSelect(id); }} className={cn("group flex items-center gap-4 p-4 cursor-pointer transition-all border-l-4", isSelected ? "bg-primary/5 border-primary" : "hover:bg-secondary/30 border-transparent")}>
                <div className="relative shrink-0">
                  {item.isGroup ? (
                    <div className="h-12 w-12 rounded-[1rem] bg-primary/10 flex items-center justify-center relative overflow-hidden border border-primary/5">
                      {item.avatar ? <img src={item.avatar} alt="Cluster" className="w-full h-full object-cover" /> : <div className="relative w-full h-full">{(item as any).members?.slice(0, 2).map((m: any, i: number) => (<Avatar key={m.username} className={cn("absolute h-8 w-8 border-2 border-white dark:border-card", i === 0 ? "top-0 left-0" : "bottom-0 right-0")}><AvatarImage src={m.avatar} /></Avatar>))}</div>}
                    </div>
                  ) : (
                    <Avatar className="h-12 w-12 border-2 border-primary/5"><AvatarImage src={(item as any).avatar} /><AvatarFallback>{item.name[0]}</AvatarFallback></Avatar>
                  )}
                  {isOnlineVisible && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-card rounded-full animate-pulse" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2 overflow-hidden"><span className="font-bold text-sm truncate">{item.name}</span>{item.isGroup && <Badge className="bg-primary/10 text-primary border-none text-[7px] font-black h-3.5 px-1 uppercase">CLUSTER</Badge>}</div>
                    <span className="text-[10px] font-medium text-muted-foreground">{(item as any).lastTime}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs truncate text-muted-foreground">{(item as any).lastMessage || "No messages yet."}</p>
                    {pinnedUsernames.has(id) && <Pin className="h-3 w-3 text-muted-foreground/40 rotate-45" />}
                  </div>
                </div>
              </div>
            );
          })
        ) : <div className="p-12 text-center opacity-40"><Search className="h-8 w-8 mx-auto mb-2" /><p className="text-sm font-bold">No nodes matched query</p></div>}
      </div>
    </div>
  );
}
