
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  Info, 
  MoreHorizontal,
  Search,
  ChevronDown,
  CheckCheck,
  Bookmark,
  X,
  Zap,
  LayoutDashboard,
  ShieldCheck,
  Eye,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  Play,
  Maximize2,
  Minimize2,
  Info as InfoIcon,
  Heart,
  Flame,
  Rocket,
  CheckCircle2,
  Download,
  ExternalLink,
  ShieldAlert,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Connection, Cluster, usePosts } from "@/context/PostContext";
import { ChatBubble } from "./chat-bubble";
import { ChatInput } from "./chat-input";
import { useMusic } from "@/context/MusicContext";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Message {
  id: string;
  sender: "me" | "them";
  senderName?: string;
  senderAvatar?: string;
  text?: string;
  time: string;
  status: "sent" | "delivered" | "read";
  type: "text" | "photo" | "video" | "link" | "voice" | "tag" | "workspace" | "call";
  mediaUrl?: string;
  voiceDuration?: string;
  isViewOnce?: boolean;
  isViewed?: boolean;
  isDownloaded?: boolean;
  reactions?: string[];
  callData?: {
    type: 'audio' | 'video';
    status: 'started' | 'missed' | 'ended';
    duration?: string;
  };
  linkData?: {
    title: string;
    description: string;
    image: string;
    url: string;
  };
  taggedUser?: {
    name: string;
    username: string;
    avatar: string;
    category: string;
  };
  workspaceData?: {
    title: string;
    metrics: string;
    image: string;
  };
}

interface ChatWindowProps {
  contact: Connection | Cluster;
  onBack: () => void;
}

const QUICK_REACTIONS = ["🔥", "❤️", "🙌", "💯", "🤯", "🚀"];

export function ChatWindow({ contact, onBack }: ChatWindowProps) {
  const { triggerHaptic, initiateCall } = usePosts();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const isCluster = 'isGroup' in contact;
  const [showVault, setShowVault] = useState(false);
  const [viewingMedia, setViewingMedia] = useState<Message | null>(null);
  const [fullScreenMedia, setFullScreenMedia] = useState<Message | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);
  const [externalPortalUrl, setExternalPortalUrl] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "1", 
      sender: "them", 
      senderName: isCluster ? contact.members[0].name : undefined,
      senderAvatar: isCluster ? contact.members[0].avatar : undefined,
      text: isCluster ? "Team, welcome to the cluster node! 🚀" : "Yo! Did you check out the new design system I pushed to the hub?", 
      time: "10:40 AM", 
      status: "read", 
      type: "text",
      reactions: ["🔥"]
    }
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const vaultMedia = useMemo(() => {
    return messages.filter(m => (m.type === 'photo' || m.type === 'video' || m.type === 'link') && !m.isViewOnce);
  }, [messages]);

  const vaultLinks = useMemo(() => {
    return messages.filter(m => m.type === 'link' || (m.text && m.text.includes('http')));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current && !fullScreenMedia && !externalPortalUrl) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showVault, fullScreenMedia, externalPortalUrl]);

  const scrollToMessage = (id: string) => {
    const element = document.getElementById(`msg-${id}`);
    if (element) {
      triggerHaptic(15);
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-primary', 'ring-offset-4', 'ring-offset-background', 'rounded-2xl', 'scale-105', 'z-50', 'transition-all', 'duration-500');
      setTimeout(() => element.classList.remove('ring-2', 'ring-primary', 'ring-offset-4', 'ring-offset-background', 'scale-105'), 2000);
    }
  };

  const handleSend = (text: string, options?: { isViewOnce?: boolean; isWorkspace?: boolean; mediaUrl?: string; mediaType?: 'photo' | 'video' | 'voice'; duration?: string }) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "me",
      text: text || undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent",
      type: options?.isWorkspace ? "workspace" : (text.includes("http") ? "link" : "text"),
      isViewOnce: options?.isViewOnce,
      isViewed: false,
      isDownloaded: true, 
      mediaUrl: options?.mediaUrl,
      voiceDuration: options?.duration
    };

    if (options?.mediaUrl) newMessage.type = options.mediaType || 'photo';
    if (options?.isWorkspace) newMessage.workspaceData = { title: "John's Workspace", metrics: "8.4k Followers", image: "https://picsum.photos/seed/my_cover/1200/400" };
    if (text.includes("http") && !options?.isWorkspace && !options?.mediaUrl) {
      newMessage.linkData = { title: "External Vibe", description: "Network resource...", image: "https://picsum.photos/seed/new-link/800/400", url: text.match(/(https?:\/\/[^\s]+)/)?.[0] || text };
    }

    setMessages(prev => [...prev, newMessage]);
  };

  const handleStartCall = (type: 'video' | 'audio') => {
    if (isCluster) return; // Logic constraint: Groups can't call
    triggerHaptic(25);
    initiateCall(contact as Connection, type);
    router.push(`/messages/call/${(contact as Connection).username}`);
  };

  return (
    <div className="flex flex-1 min-h-0 bg-[#F0F2F5] dark:bg-[#080808] relative overflow-hidden">
      {/* Portals omitted for brevity - assuming they stay the same as original chat window */}
      <div className="flex flex-col flex-1 min-h-0 relative overflow-hidden">
        <header className="h-[76px] px-4 sm:px-6 flex items-center justify-between bg-white dark:bg-card border-b border-primary/5 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-10 w-10 -ml-2" onClick={onBack}><ArrowLeft className="h-6 w-6" /></Button>
            <div className="relative shrink-0">
              {isCluster ? (
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[1rem] bg-primary/10 flex items-center justify-center relative overflow-hidden">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border-2 border-primary/10">
                  <AvatarImage src={(contact as Connection).avatar} />
                  <AvatarFallback>{contact.name[0]}</AvatarFallback>
                </Avatar>
              )}
              {(!isCluster && (contact as Connection).isOnline) && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
            </div>
            <div className="flex flex-col min-w-0 ml-1">
              <h3 className="font-bold text-sm sm:text-base truncate">{contact.name}</h3>
              <span className={cn("text-[10px] font-bold uppercase tracking-widest", isCluster ? "text-primary" : (contact as Connection).isOnline ? "text-green-500" : "text-muted-foreground")}>
                {isCluster ? `${contact.members.length} Members` : (contact as Connection).isOnline ? "Active Node" : "Away"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {!isCluster && (
              <>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary" onClick={() => handleStartCall('video')}><Video className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary" onClick={() => handleStartCall('audio')}><Phone className="h-5 w-5" /></Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground" onClick={() => setShowVault(!showVault)}><Bookmark className="h-5 w-5" /></Button>
            {isCluster && <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground"><InfoIcon className="h-5 w-5" /></Button>}
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(153,64,229,0.03) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
          {messages.map((msg) => (
            <div key={msg.id} id={`msg-${msg.id}`} className="flex flex-col gap-1">
              {isCluster && !msg.isMe && msg.senderName && (
                <div className="flex items-center gap-2 ml-2 mb-1">
                  <Avatar className="h-5 w-5"><AvatarImage src={msg.senderAvatar} /></Avatar>
                  <span className="text-[10px] font-black uppercase text-muted-foreground">{msg.senderName}</span>
                </div>
              )}
              <ChatBubble 
                {...msg} 
                isMe={msg.sender === "me"} 
                onDelete={(id) => setMessages(prev => prev.filter(m => m.id !== id))}
                onDownload={(id) => setMessages(prev => prev.map(m => m.id === id ? { ...m, isDownloaded: true } : m))}
              />
            </div>
          ))}
        </div>
        <ChatInput onSend={handleSend} />
      </div>

      <aside className={cn("h-full bg-white dark:bg-card border-l border-primary/5 transition-all duration-500 overflow-hidden flex flex-col shrink-0", showVault ? "w-[320px] opacity-100" : "w-0 opacity-0")}>
        <div className="p-6 border-b border-primary/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2"><Bookmark className="h-5 w-5 text-primary" /><h3 className="font-black italic uppercase tracking-tighter">Cluster Notes</h3></div>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setShowVault(false)}><X className="h-4 w-4" /></Button>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-8">
            <section className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Members Pulse</span>
              <div className="space-y-2">
                {isCluster ? contact.members.map(m => (
                  <div key={m.username} className="flex items-center gap-3 p-2 rounded-xl bg-secondary/20">
                    <Avatar className="h-8 w-8"><AvatarImage src={m.avatar} /></Avatar>
                    <span className="text-xs font-bold">{m.name}</span>
                  </div>
                )) : (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-secondary/20">
                    <Avatar className="h-8 w-8"><AvatarImage src={(contact as Connection).avatar} /></Avatar>
                    <span className="text-xs font-bold">{contact.name}</span>
                  </div>
                )}
              </div>
            </section>
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}
