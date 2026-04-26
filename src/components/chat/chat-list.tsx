
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
  Layers,
  ArrowLeft,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useNotifications } from "@/context/NotificationContext";
import { useTranslation } from "@/context/LanguageContext";
import { useNetwork } from "@/context/NetworkContext";
import { getAdaptivePreview } from "@/lib/adaptive-media";
import { useToast } from "@/hooks/use-toast";
import { CreateClusterModal } from "./create-cluster-modal";
import Link from "next/link";

interface ChatListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ChatList({ selectedId, onSelect }: ChatListProps) {
  const { tier } = useNetwork();
  const { connections = [], clusters = [], triggerHaptic, settings, currentUser, friendUsernames, acceptedStrangerUsernames, chatMessages, markChatMessagesRead, chatLastMessageAt, chatLastIncomingAt, chatReadReceipts, chatUnreadCounts } = usePosts();
  const { categoryPulses, clearPulse, messagePreviews } = useNotifications();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "unread" | "broadcasts" | "clusters">("all");
  const [showRequests, setShowRequests] = useState(false);

  const [pinnedUsernames] = useState(new Set<string>());

  const { sortedChats, requestCount } = useMemo(() => {
    // Handshake Guard: Handle null user during build
    if (!currentUser) return { sortedChats: [], requestCount: 0 };

    // 1. Identify all conversation nodes
    const allItems = [
      ...(connections || [])
        .filter(c => c && c.username && c.username !== currentUser.username)
        .map(c => ({ ...c, isGroup: false })),
      ...(clusters || [])
        .filter(cl => cl.members && cl.members.some((m: any) => m.username === currentUser.username))
        .map(cl => ({ ...cl, isGroup: true }))
    ];

    // 2. Partition by Friendship and Acceptance
    let requests: any[] = [];
    let mains: any[] = [];

    allItems.forEach(item => {
      const id = (item as any).username || (item as any).$id;
      const hasMessages = chatMessages[id] && chatMessages[id].length > 0;
      
      if (item.isGroup) {
        mains.push(item);
        return;
      }

      const isFriendNode = friendUsernames.has(id);
      const isAccepted = acceptedStrangerUsernames.has(id);

      if (isFriendNode || isAccepted) {
        mains.push(item);
      } else if (hasMessages) {
        requests.push(item);
      }
    });

    let list = showRequests ? requests : mains;

    if (activeFilter === "clusters") {
      list = list.filter(item => item.isGroup);
    } else if (activeFilter === "unread") {
      list = list.filter(item => {
        const itemId = (item as any).username || (item as any).$id;
        const lastIncomingAt = chatLastIncomingAt[itemId];
        if (lastIncomingAt === undefined) return false;
        const lastReadAt = chatReadReceipts[itemId] ? new Date(chatReadReceipts[itemId]).getTime() : 0;
        return lastIncomingAt > lastReadAt;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        (item.name || "").toLowerCase().includes(q) || 
        ((item as any).username || "").toLowerCase().includes(q)
      );
    }

    const getLastMsgTime = (id: string): number => {
      if (chatLastMessageAt[id]) return chatLastMessageAt[id];
      const msgs = chatMessages[id];
      if (!msgs || msgs.length === 0) return -1;
      return msgs.length;
    };

    const sorted = list.sort((a, b) => {
      const aId = (a as any).username || (a as any).$id;
      const bId = (b as any).username || (b as any).$id;
      const aPinned = pinnedUsernames.has(aId);
      const bPinned = pinnedUsernames.has(bId);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return getLastMsgTime(bId) - getLastMsgTime(aId);
    });

    return { sortedChats: sorted, requestCount: requests.length };
  }, [connections, clusters, searchQuery, activeFilter, pinnedUsernames, currentUser, friendUsernames, acceptedStrangerUsernames, chatMessages, chatLastMessageAt, chatLastIncomingAt, chatReadReceipts, showRequests]);

  const handleSelection = (id: string) => {
    triggerHaptic(5);
    clearPulse('MESSAGES');
    markChatMessagesRead(id);
    onSelect(id);
  };

  const handleToggleRequests = () => {
    triggerHaptic(10);
    setShowRequests(!showRequests);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-card">
      <div className="p-4 sm:p-6 border-b border-primary/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-secondary/80">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="space-y-0.5">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">
              {showRequests ? t('chat_requests') : t('nav_messages')}
            </h2>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
              {showRequests ? `${requestCount} PENDING PULSES` : `${(connections?.length || 0) + (clusters?.length || 0)} ${t('chat_nodes_online')}`}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {requestCount > 0 && (
            <button 
              onClick={handleToggleRequests}
              className={cn(
                "relative h-9 px-4 rounded-xl flex items-center justify-center gap-2 transition-all font-black text-[9px] uppercase tracking-widest border",
                showRequests ? "bg-primary text-white border-primary" : "bg-primary/5 text-primary border-primary/10 hover:bg-primary/10"
              )}
            >
              <Mail className="h-3.5 w-3.5" />
              {showRequests ? "Show Main" : t('chat_requests')}
              {!showRequests && <div className="absolute -top-1 -right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-card" />}
            </button>
          )}
          {!showRequests && (
            <CreateClusterModal>
              <button className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center hover:bg-primary/20 transition-all active:scale-90" title={t('chat_materialize_cluster')}><Layers className="h-4 w-4" /></button>
            </CreateClusterModal>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative group"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary" /><Input placeholder={t('chat_query_nodes')} className="pl-10 h-10 bg-secondary/30 border-none rounded-xl text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
        {!showRequests && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Button variant={activeFilter === "all" ? "default" : "secondary"} size="sm" className="rounded-full h-7 px-4 text-[10px] font-black uppercase tracking-widest" onClick={() => { triggerHaptic(5); setActiveFilter("all"); }}>{t('ui_all')}</Button>
            <Button variant={activeFilter === "clusters" ? "default" : "secondary"} size="sm" className="rounded-full h-7 px-4 text-[10px] font-black uppercase tracking-widest gap-1.5" onClick={() => { triggerHaptic(5); setActiveFilter("clusters"); }}><Layers className="h-3 w-3" /> {t('admin_clusters')}</Button>
            <Button variant={activeFilter === "unread" ? "default" : "secondary"} size="sm" className="rounded-full h-7 px-4 text-[10px] font-black uppercase tracking-widest" onClick={() => { triggerHaptic(5); setActiveFilter("unread"); }}>
              {t('ui_unread')} 
              {categoryPulses.MESSAGES > 0 && <div className="ml-2 h-2 w-2 bg-red-500 rounded-full animate-pulse" />}
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {sortedChats.length > 0 ? (
          sortedChats.map((item) => {
            const id = (item as any).username || (item as any).$id;
            const isSelected = selectedId === id;
            
            // Respect Ghost Mode Protocol
            const isOnlineVisible = (item as any).isOnline && !settings.isGhostMode;
            
            const msgs = chatMessages[id];
            const lastIncomingAt = chatLastIncomingAt[id];
            const lastReadAt = chatReadReceipts[id] ? new Date(chatReadReceipts[id]).getTime() : 0;
            const hasNewPulse = !isSelected && lastIncomingAt !== undefined && lastIncomingAt > lastReadAt;

            return (
              <div key={id} onClick={() => handleSelection(id)} className={cn("group flex items-center gap-4 p-4 cursor-pointer transition-all border-l-4", isSelected ? "bg-primary/5 border-primary" : "hover:bg-secondary/30 border-transparent")}>
                <div className="relative shrink-0">
                  {item.isGroup ? (
                    <div className="h-12 w-12 rounded-[1rem] bg-primary/10 flex items-center justify-center relative overflow-hidden border border-primary/5">
                      {item.avatar ? <img src={getAdaptivePreview(item.avatar, 'avatar', tier) || item.avatar} alt="Cluster" className="w-full h-full object-cover" /> : <div className="relative w-full h-full">{(item as any).members?.slice(0, 2).map((m: any, i: number) => (<Avatar key={m.username} className={cn("absolute h-8 w-8 border-2 border-white dark:border-card", i === 0 ? "top-0 left-0" : "bottom-0 right-0")}><AvatarImage src={getAdaptivePreview(m.avatar, 'avatar', tier) || m.avatar} /></Avatar>))}</div>}
                    </div>
                  ) : (
                    <Avatar className="h-12 w-12 border-2 border-primary/5"><AvatarImage src={getAdaptivePreview((item as any).avatar, 'avatar', tier) || (item as any).avatar} /><AvatarFallback>{item.name[0]}</AvatarFallback></Avatar>
                  )}
                  {isOnlineVisible && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-card rounded-full animate-pulse" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={cn("font-bold text-sm truncate", hasNewPulse && "text-primary")}>{item.name}</span>
                      {item.isGroup && <Badge className="bg-primary/10 text-primary border-none text-[7px] font-black h-3.5 px-1 uppercase">CLUSTER</Badge>}
                    </div>
                    <span className={cn("text-[10px] font-medium", hasNewPulse ? "text-primary" : "text-muted-foreground")}>
                      {messagePreviews[id]?.time || (item as any).lastTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-xs truncate", hasNewPulse ? "text-foreground font-bold" : "text-muted-foreground")}>
                      {(() => {
                        const lastMsg = chatMessages[id]?.at(-1);
                        if (lastMsg) {
                          if (lastMsg.text) return lastMsg.text;
                          if (lastMsg.type === 'photo') return '📷 Photo';
                          if (lastMsg.type === 'video') return '🎥 Video';
                          if (lastMsg.type === 'voice') return `🎤 Voice message${lastMsg.voiceDuration ? ` · ${lastMsg.voiceDuration}` : ''}`;
                          if (lastMsg.type === 'call') return '📞 Call';
                          if (lastMsg.type === 'post') return '📌 Shared Post';
                        }
                        if (messagePreviews[id]?.text) return messagePreviews[id].text;
                        return (item as any).lastMessage || "No messages yet.";
                      })()}
                    </p>
                    {pinnedUsernames.has(id) && <Pin className="h-3 w-3 text-muted-foreground/40 rotate-45" />}
                    {(() => {
                      const count = (chatUnreadCounts && chatUnreadCounts[id]) || 0;
                      if (!isSelected && count > 0) {
                        return (
                          <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shadow-[0_0_8px_rgba(153,64,229,0.8)]">
                            {count > 99 ? '99+' : count}
                          </span>
                        );
                      }
                      return hasNewPulse ? (
                        <div className="h-2 w-2 bg-primary rounded-full shadow-[0_0_8px_rgba(153,64,229,0.8)]" />
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center opacity-40">
            {showRequests ? <Mail className="h-8 w-8 mx-auto mb-2" /> : <Search className="h-8 w-8 mx-auto mb-2" />}
            <p className="text-sm font-bold">
              {showRequests ? "Vault Inbound Nodes Silent" : "No nodes matched query"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
