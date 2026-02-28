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
  Layers,
  Video as VideoIcon,
  LogOut,
  Shield,
  Trash2
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

export function ChatWindow({ contact, onBack }: ChatWindowProps) {
  const { currentUser, triggerHaptic, initiateCall, leaveCluster } = usePosts();
  const { toast } = useToast();
  const router = useRouter();
  
  const isCluster = 'isGroup' in contact;
  const [showVault, setShowVault] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);

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

  // Dynamic Vault Intelligence
  const vaultMedia = useMemo(() => {
    return messages.filter(m => (m.type === 'photo' || m.type === 'video') && !m.isViewOnce && m.mediaUrl);
  }, [messages]);

  const vaultLinks = useMemo(() => {
    return messages.filter(m => m.type === 'link' && m.linkData);
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
      type: options?.isWorkspace ? "workspace" : (text.includes("http") ? "link" : "text"),
      isViewOnce: options?.isViewOnce,
      isViewed: false,
      isDownloaded: true, 
      mediaUrl: options?.mediaUrl,
      voiceDuration: options?.duration
    };

    if (options?.mediaUrl) newMessage.type = options.mediaType || 'photo';
    if (options?.isWorkspace) newMessage.workspaceData = { title: "John's Workspace", metrics: "8.4k Followers", image: "https://picsum.photos/seed/my_cover/1200/400" };
    
    // Auto-detect links for vault
    if (text.includes("http") && !options?.isWorkspace && !options?.mediaUrl) {
      newMessage.linkData = { 
        title: "Shared Resource", 
        description: "Shared in collective cluster...", 
        image: "https://picsum.photos/seed/vault-link/800/400", 
        url: text.match(/(https?:\/\/[^\s]+)/)?.[0] || text 
      };
    }

    setMessages(prev => [...prev, newMessage]);
  };

  const handleStartCall = (type: 'video' | 'audio') => {
    if (isCluster) return;
    triggerHaptic(25);
    initiateCall(contact as Connection, type);
    router.push(`/messages/call/${(contact as Connection).username}`);
  };

  const handleConfirmLeave = () => {
    if (isCluster) {
      triggerHaptic(50);
      leaveCluster(contact.id);
      toast({ title: "Node Disconnected", description: `You have left the cluster: ${contact.name}` });
      onBack();
    }
  };

  return (
    <div className="flex flex-1 min-h-0 bg-[#F0F2F5] dark:bg-[#080808] relative overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 relative overflow-hidden">
        <header className="h-[76px] px-4 sm:px-6 flex items-center justify-between bg-white dark:bg-card border-b border-primary/5 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-10 w-10 -ml-2" onClick={onBack}><ArrowLeft className="h-6 w-6" /></Button>
            <div className="relative shrink-0">
              {isCluster ? (
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[1rem] bg-primary/10 flex items-center justify-center relative overflow-hidden border border-primary/5">
                  {contact.avatar ? (
                    <img src={contact.avatar} alt="Cluster" className="w-full h-full object-cover" />
                  ) : (
                    <Layers className="h-5 w-5 text-primary" />
                  )}
                </div>
              ) : (
                <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border-2 border-primary/10">
                  <AvatarImage src={(contact as Connection).avatar} />
                  <AvatarFallback>{contact.name[0]}</AvatarFallback>
                </Avatar>
              )}
              {(!isCluster && (contact as Connection).isOnline) && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />}
            </div>
            <div className="flex flex-col min-w-0 ml-1">
              <h3 className="font-bold text-sm sm:text-base truncate">{contact.name}</h3>
              <span className={cn("text-[10px] font-black uppercase tracking-widest", isCluster ? "text-primary" : (contact as Connection).isOnline ? "text-green-500" : "text-muted-foreground")}>
                {isCluster ? `${contact.members.length} Nodes in Cluster` : (contact as Connection).isOnline ? "Active Pulse" : "Away"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {!isCluster && (
              <>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary transition-colors" onClick={() => handleStartCall('video')}><Video className="h-5 w-5" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary transition-colors" onClick={() => handleStartCall('audio')}><Phone className="h-5 w-5" /></Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("rounded-full transition-all", showVault ? "bg-primary/10 text-primary" : "text-muted-foreground")} 
              onClick={() => { triggerHaptic(5); setShowVault(!showVault); }}
            >
              {isCluster ? <Bookmark className="h-5 w-5" /> : <InfoIcon className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(153,64,229,0.03) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
          {messages.map((msg) => (
            <div key={msg.id} id={`msg-${msg.id}`} className="flex flex-col gap-1">
              {isCluster && !msg.isMe && msg.senderName && (
                <div className="flex items-center gap-2 ml-2 mb-1">
                  <Avatar className="h-5 w-5 border border-primary/10 shadow-sm"><AvatarImage src={msg.senderAvatar} /></Avatar>
                  <span className="text-[10px] font-black uppercase text-primary/60 tracking-widest">{msg.senderName}</span>
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

      {/* Cluster Vault Sidebar */}
      <aside className={cn(
        "h-full bg-white dark:bg-card border-l border-primary/5 transition-all duration-500 overflow-hidden flex flex-col shrink-0 relative z-30", 
        showVault ? "w-full sm:w-[360px] opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-full"
      )}>
        <div className="p-6 border-b border-primary/5 flex items-center justify-between shrink-0 bg-white/80 dark:bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {isCluster ? <Bookmark className="h-5 w-5" /> : <InfoIcon className="h-5 w-5" />}
            </div>
            <h3 className="font-black italic uppercase tracking-tighter text-lg">{isCluster ? "Collective Vault" : "Node Details"}</h3>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => setShowVault(false)}><X className="h-6 w-6" /></Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-10 pb-20">
            {isCluster && (
              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Members Pulse</span>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[8px] font-black h-4 px-2 uppercase">{contact.members.length} ACTIVE</Badge>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {contact.members.map(m => (
                    <div key={m.username} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10 border border-primary/5 shadow-sm group-hover:scale-105 transition-transform"><AvatarImage src={m.avatar} /></Avatar>
                          {m.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold truncate max-w-[120px]">{m.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">@{m.username}</span>
                            {m.username === contact.adminUsername && <Badge className="bg-primary text-white border-none text-[7px] h-3 px-1">ADMIN</Badge>}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><ChevronDown className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Visual History</span>
                <span className="text-[10px] font-black text-primary uppercase">{vaultMedia.length} NODES</span>
              </div>
              {vaultMedia.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {vaultMedia.map((m, i) => (
                    <div 
                      key={i} 
                      className="relative aspect-square rounded-xl overflow-hidden group/thumb cursor-pointer shadow-md"
                      onClick={() => m.mediaUrl && triggerHaptic(10)}
                    >
                      <Image src={m.mediaUrl!} alt="Media" fill className="object-cover transition-transform group-hover/thumb:scale-110" />
                      {m.type === 'video' && <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><Play className="h-4 w-4 text-white fill-current" /></div>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center bg-secondary/10 rounded-2xl border-2 border-dashed border-primary/5">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No visuals indexed</p>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Spatial Links</span>
                <span className="text-[10px] font-black text-primary uppercase">{vaultLinks.length} NODES</span>
              </div>
              {vaultLinks.length > 0 ? (
                <div className="space-y-2">
                  {vaultLinks.map((m, i) => (
                    <button 
                      key={i} 
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-all text-left group/link"
                      onClick={() => m.linkData && window.open(m.linkData.url, '_blank')}
                    >
                      <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 shadow-sm relative">
                        <Image src={m.linkData!.image} alt="Link" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/link:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate uppercase tracking-tighter">{m.linkData!.title}</p>
                        <p className="text-[9px] font-black text-primary uppercase tracking-widest">{new URL(m.linkData!.url).hostname}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center bg-secondary/10 rounded-2xl border-2 border-dashed border-primary/5">
                  <LinkIcon className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">No links indexed</p>
                </div>
              )}
            </section>

            <div className="pt-6 border-t border-primary/5 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">System Controls</h4>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-2xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all">
                  <ShieldCheck className="h-5 w-5" />
                  <span className="font-bold text-sm">Security Handshake</span>
                </Button>
                {isCluster && (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 h-12 rounded-2xl text-destructive hover:bg-destructive/5 transition-all"
                    onClick={() => { triggerHaptic(15); setIsLeaveDialogOpen(true); }}
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-bold text-sm">Leave Cluster</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>

      <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem] sm:max-w-[400px] z-[400] bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-2xl border-primary/10 shadow-2xl">
          <AlertDialogHeader>
            <div className="mx-auto h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-4">
              <LogOut className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="font-black italic uppercase tracking-tighter text-3xl text-center">Leave Cluster?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium leading-relaxed text-center px-4">
              You will lose access to this collective workspace and its vault nodes. You must be re-invited to synchronize again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6">
            <AlertDialogCancel className="rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] bg-secondary/50 border-none">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmLeave}
              className="rounded-2xl h-14 font-black italic uppercase tracking-widest text-[10px] bg-destructive hover:bg-destructive/90 text-white shadow-xl shadow-destructive/20"
            >
              Leave Node
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
