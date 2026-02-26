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
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Connection, usePosts } from "@/context/PostContext";
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
  isDownloaded?: boolean;
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

const QUICK_REACTIONS = ["🔥", "❤️", "🙌", "💯", "🤯", "🚀"];

export function ChatWindow({ contact, onBack }: ChatWindowProps) {
  const { triggerHaptic } = useMusic();
  const { toggleSavePost } = usePosts();
  const { toast } = useToast();
  
  const [showVault, setShowVault] = useState(false);
  const [viewingMedia, setViewingMedia] = useState<Message | null>(null);
  const [fullScreenMedia, setFullScreenMedia] = useState<Message | null>(null);
  const [showMetadata, setShowMetadata] = useState(false);

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
      mediaUrl: "https://picsum.photos/seed/chat-ref/800/600",
      isDownloaded: false
    }
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

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
      isDownloaded: true, // Sent messages are considered "cached" locally
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

  const handleDownloadMessage = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isDownloaded: true } : m));
    toast({ title: "Node Synced", description: "Vibe cached for offline playback." });
  };

  const openViewOnce = (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (msg && !msg.isViewed) {
      if (msg.isDownloaded || msg.sender === 'me') {
        setViewingMedia(msg);
      } else {
        toast({ description: "Download to view disappearing vibe." });
      }
    }
  };

  const closeViewOnce = () => {
    if (viewingMedia) {
      setMessages(prev => prev.map(m => m.id === viewingMedia.id ? { ...m, isViewed: true } : m));
      setViewingMedia(null);
      toast({ title: "Vibe Exploded", description: "One-time view session complete." });
    }
  };

  const handleReact = (msgId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        const reactions = m.reactions || [];
        return { ...m, reactions: reactions.includes(emoji) ? reactions.filter(r => r !== emoji) : [...reactions, emoji] };
      }
      return m;
    }));
  };

  const openFullScreen = (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (msg) setFullScreenMedia(msg);
  };

  const handleVaultSync = () => {
    if (!fullScreenMedia) return;
    triggerHaptic(20);
    // Simulate bookmarking to global context
    toast({ title: "Vault Synced", description: "Asset migrated to your identity vault." });
  };

  return (
    <div className="flex flex-1 min-h-0 bg-[#F0F2F5] dark:bg-[#080808] relative overflow-hidden">
      {/* 1. View-Once Overlay */}
      {viewingMedia && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
          <header className="absolute top-8 left-0 right-0 px-8 flex items-center justify-between text-white/60">
            <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-primary" /><span className="text-[10px] font-black uppercase tracking-widest">Encrypted Vibe</span></div>
            <Button variant="ghost" size="icon" className="text-white bg-white/10 rounded-full" onClick={closeViewOnce}><X className="h-6 w-6" /></Button>
          </header>
          <div className="relative w-full max-w-lg aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl bg-zinc-900">
            {viewingMedia.type === 'video' ? (
              <video src={viewingMedia.mediaUrl} className="w-full h-full object-cover" autoPlay loop playsInline />
            ) : (
              <Image src={viewingMedia.mediaUrl!} alt="Vibe" fill className="object-cover" />
            )}
          </div>
          <Button className="absolute bottom-12 bg-primary text-white font-black uppercase tracking-widest h-14 px-10 rounded-2xl shadow-xl" onClick={closeViewOnce}>CLOSE VIEW</Button>
        </div>
      )}

      {/* 2. Immersive Media Portal (Standard Full Screen) */}
      {fullScreenMedia && (
        <div className="fixed inset-0 z-[400] bg-black/95 flex flex-col animate-in zoom-in-95 fade-in duration-300">
          {/* Aurora Backdrop */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 blur-[150px] rounded-full animate-pulse delay-700" />
            <Image src={fullScreenMedia.mediaUrl!} alt="Aurora" fill className="object-cover blur-[100px] opacity-20 scale-150" />
          </div>

          <header className="relative z-10 h-20 px-6 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white bg-white/10 rounded-full" onClick={() => setFullScreenMedia(null)}>
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white">{fullScreenMedia.sender === 'me' ? 'My Signature' : contact.name}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">{fullScreenMedia.time}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" size="icon" 
                className={cn("text-white bg-white/10 rounded-full transition-all", showMetadata && "bg-primary text-white")}
                onClick={() => setShowMetadata(!showMetadata)}
              >
                <InfoIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white bg-white/10 rounded-full" onClick={handleVaultSync}>
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white bg-white/10 rounded-full" onClick={() => setFullScreenMedia(null)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
          </header>

          <main className="flex-1 relative flex items-center justify-center p-4">
            <div className="relative w-full max-w-5xl h-full flex items-center justify-center">
              {fullScreenMedia.type === 'video' ? (
                <video src={fullScreenMedia.mediaUrl} className="max-w-full max-h-full rounded-2xl shadow-2xl" controls autoPlay loop playsInline />
              ) : (
                <div className="relative w-full h-full">
                  <Image src={fullScreenMedia.mediaUrl!} alt="Immersive" fill className="object-contain" priority />
                </div>
              )}

              {/* Metadata HUD */}
              {showMetadata && (
                <div className="absolute top-10 right-10 z-50 bg-black/60 backdrop-blur-md border border-white/10 p-6 rounded-2xl space-y-4 max-w-xs animate-in slide-in-from-right-4 duration-300">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Technical Vibe</h4>
                  <div className="space-y-3 font-mono text-[10px] text-white/80">
                    <div className="flex justify-between gap-8"><span>NODE_TYPE:</span> <span className="text-white">{fullScreenMedia.type.toUpperCase()}</span></div>
                    <div className="flex justify-between gap-8"><span>RESOLUTION:</span> <span className="text-white">1080 x 1920</span></div>
                    <div className="flex justify-between gap-8"><span>SYNC_TIME:</span> <span className="text-white">{fullScreenMedia.time}</span></div>
                    <div className="flex justify-between gap-8"><span>ENCRYPTION:</span> <span className="text-green-400">ACTIVE</span></div>
                  </div>
                </div>
              )}
            </div>
          </main>

          <footer className="relative z-10 p-10 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-2 px-6 shadow-2xl">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  className="text-3xl hover:scale-150 hover:-translate-y-2 transition-all active:scale-90 duration-300 px-2"
                  onClick={() => {
                    triggerHaptic(15);
                    handleReact(fullScreenMedia.id, emoji);
                    toast({ description: `Reacted with ${emoji}` });
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
              <Zap className="h-3 w-3 fill-current" /> High-Velocity Inspection Mode
            </div>
          </footer>
        </div>
      )}

      <div className="flex flex-col flex-1 min-h-0 relative overflow-hidden">
        <header className="h-[76px] px-4 sm:px-6 flex items-center justify-between bg-white dark:bg-card border-b border-primary/5 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-10 w-10 -ml-2" onClick={onBack}><ArrowLeft className="h-6 w-6" /></Button>
            <div className="relative shrink-0">
              <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border-2 border-primary/10"><AvatarImage src={contact.avatar} /><AvatarFallback>{contact.name[0]}</AvatarFallback></Avatar>
              {contact.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
            </div>
            <div className="flex flex-col min-w-0 ml-1">
              <h3 className="font-bold text-sm sm:text-base truncate">{contact.name}</h3>
              <span className={cn("text-[10px] font-bold uppercase tracking-widest", contact.isOnline ? "text-green-500" : "text-muted-foreground")}>{contact.isOnline ? "Active" : "Away"}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary"><Video className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary"><Phone className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className={cn("rounded-full transition-all", showVault ? "bg-primary text-white" : "text-muted-foreground")} onClick={() => { triggerHaptic(5); setShowVault(!showVault); }}><Bookmark className="h-5 w-5" /></Button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(153,64,229,0.03) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
          {messages.map((msg) => (
            <ChatBubble 
              key={msg.id} id={msg.id} isMe={msg.sender === "me"} text={msg.text} time={msg.time} status={msg.status} 
              type={msg.type} mediaUrl={msg.mediaUrl} voiceDuration={msg.voiceDuration} isViewOnce={msg.isViewOnce} 
              isViewed={msg.isViewed} isDownloaded={msg.isDownloaded} linkData={msg.linkData} reactions={msg.reactions} taggedUser={msg.taggedUser} 
              workspaceData={msg.workspaceData} onReact={(emoji) => handleReact(msg.id, emoji)} onViewOnceOpen={openViewOnce}
              onMediaOpen={openFullScreen}
              onDownload={handleDownloadMessage}
            />
          ))}
        </div>
        <ChatInput onSend={handleSend} />
      </div>

      <aside className={cn("h-full bg-white dark:bg-card border-l border-primary/5 transition-all duration-500 overflow-hidden flex flex-col shrink-0", showVault ? "w-[320px] opacity-100" : "w-0 opacity-0")}>
        <div className="p-6 border-b border-primary/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2"><Bookmark className="h-5 w-5 text-primary" /><h3 className="font-black italic uppercase tracking-tighter">Shared Vault</h3></div>
          <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setShowVault(false)}><X className="h-4 w-4" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1"><span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Media Nodes</span><span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{vaultMedia.filter(m => m.type === 'photo' || m.type === 'video').length}</span></div>
            <div className="grid grid-cols-2 gap-2">
              {vaultMedia.filter(m => m.type === 'photo' || m.type === 'video').map((m, i) => (
                <div key={i} className="aspect-square relative rounded-xl overflow-hidden group cursor-pointer bg-secondary/20" onClick={() => openFullScreen(m.id)}>
                  {m.type === 'video' ? (
                    <div className="w-full h-full relative">
                      <video src={m.mediaUrl} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center"><Play className="h-6 w-6 text-white drop-shadow-md" /></div>
                    </div>
                  ) : (
                    <Image src={m.mediaUrl!} alt="Asset" fill className="object-cover transition-transform group-hover:scale-110" />
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
