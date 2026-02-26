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
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Connection } from "@/context/PostContext";
import { ChatBubble } from "./chat-bubble";
import { ChatInput } from "./chat-input";
import { useMusic } from "@/context/MusicContext";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface ChatWindowProps {
  contact: Connection;
  onBack: () => void;
}

interface Message {
  id: string;
  sender: "me" | "them";
  text?: string;
  time: string;
  status: "sent" | "delivered" | "read";
  type: "text" | "photo" | "video" | "link" | "voice" | "tag" | "workspace";
  mediaUrl?: string;
  voiceDuration?: string;
  isViewOnce?: boolean;
  isViewed?: boolean;
  reactions?: string[];
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

export function ChatWindow({ contact, onBack }: ChatWindowProps) {
  const { triggerHaptic } = useMusic();
  const { toast } = useToast();
  
  // States
  const [showVault, setShowVault] = useState(false);
  const [viewingMedia, setViewingMedia] = useState<Message | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "1", 
      sender: "them", 
      text: "Yo! Did you check out the new design system I pushed to the hub?", 
      time: "10:40 AM", 
      status: "read", 
      type: "text",
      reactions: ["🔥"]
    },
    { 
      id: "2", 
      sender: "me", 
      text: "I did! The typography choices are absolute fire. That font pairing is very high-velocity. 🔥", 
      time: "10:42 AM", 
      status: "read", 
      type: "text" 
    },
    { 
      id: "3", 
      sender: "them", 
      time: "10:43 AM", 
      status: "read", 
      type: "photo",
      mediaUrl: "https://picsum.photos/seed/chat-ref/800/600"
    },
    {
      id: "v1",
      sender: "them",
      time: "10:44 AM",
      status: "read",
      type: "photo",
      mediaUrl: "https://picsum.photos/seed/viewonce/800/1200",
      isViewOnce: true,
      isViewed: false
    },
    { 
      id: "5", 
      sender: "them", 
      time: "10:45 AM", 
      status: "read", 
      type: "link",
      text: "Found this great article: https://vimore.social/motion-trends",
      linkData: {
        title: "The Future of High-Velocity Motion",
        description: "Exploring how sub-second transitions are redefining user engagement.",
        image: "https://picsum.photos/seed/link-preview/800/400",
        url: "https://vimore.social/motion-trends"
      }
    },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Screen Protection Simulation
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        toast({
          variant: "destructive",
          title: "Privacy Guard Active",
          description: "A potential screen capture attempt was detected.",
          duration: 5000,
        });
      }
    };

    window.addEventListener('blur', handleVisibilityChange);
    return () => window.removeEventListener('blur', handleVisibilityChange);
  }, [toast]);

  // Filter media for the Vault
  const vaultMedia = useMemo(() => {
    return messages.filter(m => (m.type === 'photo' || m.type === 'video' || m.type === 'link') && !m.isViewOnce);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showVault]);

  const handleSend = (text: string, options?: { isViewOnce?: boolean; isWorkspace?: boolean; mediaUrl?: string; mediaType?: 'photo' | 'video' | 'voice'; duration?: string }) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "me",
      text: text || undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent",
      type: options?.isWorkspace ? "workspace" : (text.startsWith("http") ? "link" : "text"),
      isViewOnce: options?.isViewOnce,
      isViewed: false,
      mediaUrl: options?.mediaUrl,
      voiceDuration: options?.duration
    };

    if (options?.mediaUrl) {
      newMessage.type = options.mediaType || 'photo';
    }

    if (options?.isWorkspace) {
      newMessage.workspaceData = {
        title: "John's Digital Workspace",
        metrics: "8.4k Followers • 142 Posts",
        image: "https://picsum.photos/seed/my_cover/1200/400"
      };
    }

    if (text.startsWith("http") && !options?.isWorkspace && !options?.mediaUrl) {
      newMessage.linkData = {
        title: "External Vibe",
        description: "Checking out shared resources in the ViMore network...",
        image: "https://picsum.photos/seed/new-link/800/400",
        url: text
      };
    }

    setMessages(prev => [...prev, newMessage]);
  };

  const openViewOnce = (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (msg && !msg.isViewed) {
      setViewingMedia(msg);
    }
  };

  const closeViewOnce = () => {
    if (viewingMedia) {
      setMessages(prev => prev.map(m => 
        m.id === viewingMedia.id ? { ...m, isViewed: true } : m
      ));
      setViewingMedia(null);
      toast({ title: "Vibe Exploded", description: "This media can no longer be viewed." });
    }
  };

  const handleReact = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        const reactions = m.reactions || [];
        if (reactions.includes(emoji)) return { ...m, reactions: reactions.filter(r => r !== emoji) };
        return { ...m, reactions: [...reactions, emoji] };
      }
      return m;
    }));
  };

  return (
    <div className="flex flex-1 min-h-0 bg-[#F0F2F5] dark:bg-[#080808] relative overflow-hidden">
      
      {/* Immersive View-Once Overlay */}
      {viewingMedia && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
          <header className="absolute top-8 left-0 right-0 px-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Encrypted Vibe View</span>
            </div>
            <Button variant="ghost" size="icon" className="text-white bg-white/10 rounded-full" onClick={closeViewOnce}>
              <X className="h-6 w-6" />
            </Button>
          </header>
          
          <div className="relative w-full max-w-lg aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl bg-zinc-900">
            {viewingMedia.type === 'video' ? (
              <video 
                key={viewingMedia.mediaUrl}
                src={viewingMedia.mediaUrl} 
                className="w-full h-full object-cover" 
                autoPlay 
                loop 
                playsInline 
              />
            ) : (
              <Image src={viewingMedia.mediaUrl!} alt="Disappearing Vibe" fill className="object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-10 left-0 right-0 text-center space-y-2">
              <p className="text-white text-lg font-bold italic uppercase tracking-tighter">One-Time Glimpse</p>
              <div className="flex justify-center">
                <div className="bg-primary/20 backdrop-blur-md px-4 py-1 rounded-full border border-primary/20">
                  <span className="text-[10px] font-black text-primary uppercase">Identity Protected</span>
                </div>
              </div>
            </div>
          </div>

          <footer className="absolute bottom-12 w-full text-center">
            <Button 
              className="bg-primary text-white font-black uppercase tracking-widest text-xs px-10 h-14 rounded-2xl shadow-xl shadow-primary/20"
              onClick={closeViewOnce}
            >
              FINISH VIEWING
            </Button>
          </footer>
        </div>
      )}

      <div className="flex flex-col flex-1 min-h-0 relative transition-all duration-500 overflow-hidden">
        <header className="h-[76px] px-4 sm:px-6 flex items-center justify-between bg-white dark:bg-card border-b border-primary/5 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-10 w-10 -ml-2" onClick={onBack}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border-2 border-primary/10">
                <AvatarImage src={contact.avatar} />
                <AvatarFallback>{contact.name[0]}</AvatarFallback>
              </Avatar>
              {contact.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-card rounded-full" />}
            </div>
            <div className="flex flex-col min-w-0 ml-1">
              <h3 className="font-bold text-sm sm:text-base truncate">{contact.name}</h3>
              <div className="flex items-center gap-1.5">
                <span className={cn("text-[10px] font-bold uppercase tracking-widest", contact.isOnline ? "text-green-500" : "text-muted-foreground")}>{contact.isOnline ? "Active Now" : "Offline"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary">
              <Phone className="h-5 w-5" />
            </Button>
            <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("rounded-full h-10 w-10 transition-all", showVault ? "bg-primary text-white" : "text-muted-foreground hover:text-primary")}
              onClick={() => { triggerHaptic(5); setShowVault(!showVault); }}
            >
              <Bookmark className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary">
              <Info className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth bg-opacity-50 min-h-0"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(153,64,229,0.03) 1px, transparent 0)', backgroundSize: '24px 24px' }}
        >
          <div className="flex justify-center mb-8 sticky top-0 z-10">
            <span className="bg-white/80 dark:bg-card/80 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm border border-primary/5">Today</span>
          </div>

          {messages.map((msg) => (
            <ChatBubble 
              key={msg.id}
              id={msg.id}
              isMe={msg.sender === "me"}
              text={msg.text}
              time={msg.time}
              status={msg.status}
              type={msg.type}
              mediaUrl={msg.mediaUrl}
              voiceDuration={msg.voiceDuration}
              isViewOnce={msg.isViewOnce}
              isViewed={msg.isViewed}
              linkData={msg.linkData}
              reactions={msg.reactions}
              taggedUser={msg.taggedUser}
              workspaceData={msg.workspaceData}
              onReact={(emoji) => handleReact(msg.id, emoji)}
              onViewOnceOpen={openViewOnce}
            />
          ))}
        </div>

        <ChatInput onSend={handleSend} />
      </div>

      {/* Shared Vault Sidebar */}
      <aside className={cn(
        "h-full bg-white dark:bg-card border-l border-primary/5 transition-all duration-500 overflow-hidden flex flex-col shrink-0",
        showVault ? "w-[320px] opacity-100" : "w-0 opacity-0"
      )}>
        <div className="p-6 border-b border-primary/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            <h3 className="font-black italic uppercase tracking-tighter">Shared Vault</h3>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setShowVault(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8 min-h-0">
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Media Assets</span>
              <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{vaultMedia.filter(m => m.type !== 'link').length}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {vaultMedia.filter(m => m.type !== 'link').map((m, i) => (
                <div key={i} className="aspect-square relative rounded-xl overflow-hidden group cursor-pointer border border-primary/5">
                  <Image src={m.mediaUrl!} alt="Media" fill className="object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Eye className="h-5 w-5 text-white" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Network Links</span>
              <span className="text-[10px] font-black text-accent bg-accent/10 px-2 py-0.5 rounded-full">{vaultMedia.filter(m => m.type === 'link').length}</span>
            </div>
            <div className="space-y-3">
              {vaultMedia.filter(m => m.type === 'link').map((m, i) => (
                <div key={i} className="flex gap-3 p-2 rounded-xl hover:bg-secondary/30 transition-all cursor-pointer group border border-transparent hover:border-primary/10">
                  <div className="h-12 w-12 rounded-lg relative overflow-hidden shrink-0 shadow-sm">
                    <Image src={m.linkData?.image || ''} alt="Link" fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold truncate group-hover:text-primary transition-colors">{m.linkData?.title}</p>
                    <p className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest mt-0.5 truncate">{new URL(m.linkData?.url || '').hostname}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4 pt-4 border-t border-primary/5">
            <div className="flex items-center gap-2 px-1 text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Active Workspace</span>
            </div>
            <div className="p-4 bg-secondary/20 rounded-[1.5rem] flex flex-col gap-3">
              <p className="text-[10px] font-medium leading-relaxed opacity-60 italic">"Syncing live creator nodes for high-velocity collaboration."</p>
              <Button size="sm" variant="outline" className="w-full rounded-xl text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary">Go to Hub</Button>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
