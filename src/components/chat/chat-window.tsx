
"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Trash2,
  UserPlus,
  ChevronRight,
  Plus,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Connection, Cluster, usePosts } from "@/context/PostContext";
import { ChatBubble } from "./chat-bubble";
import { ChatInput } from "./chat-input";
import { useMusic } from "@/context/MusicContext";
import { useTranslation } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import client, { databases, APPWRITE_DATABASE_ID, MESSAGES_COLLECTION_ID, ID, BUCKET_VOICENOTE, BUCKET_IMAGES, BUCKET_REEL } from "@/lib/appwrite";
import { Query } from "appwrite";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  sender: "me" | "them";
  senderName?: string;
  senderAvatar?: string;
  senderId: string;
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
  const { currentUser, triggerHaptic, initiateCall, leaveCluster, connections = [], addMemberToCluster, settings, uploadMedia } = usePosts();
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();
  
  const isCluster = contact.isGroup === true;
  const isAdmin = isCluster && (contact as Cluster).adminUsername === currentUser.username;
  
  const [showVault, setShowVault] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [addNodeSearch, setAddNodeSearch] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  const conversationId = useMemo(() => {
    if (isCluster) return (contact as Cluster).id;
    
    const contactUsername = (contact as Connection).username;
    if (!currentUser.username || !contactUsername || currentUser.username === contactUsername) {
      return null;
    }
    
    return [currentUser.username, contactUsername].sort().join('_');
  }, [isCluster, contact, currentUser.username]);

  const nonClusterMembers = useMemo(() => {
    if (!isCluster) return [];
    const memberUsernames = new Set(((contact as Cluster).members || []).map(m => m.username));
    return connections.filter(c => !memberUsernames.has(c.username));
  }, [isCluster, contact, connections]);

  const fetchHistory = useCallback(async () => {
    if (!conversationId) return;
    setIsLoadingMessages(true);
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [
          Query.equal('conversationId', conversationId),
          Query.orderAsc('$createdAt'),
          Query.limit(100)
        ]
      );
      
      const mapped = response.documents.map(doc => ({
        id: doc.$id,
        sender: doc.senderId === currentUser.username ? "me" as const : "them" as const,
        senderId: doc.senderId,
        senderName: doc.senderName,
        senderAvatar: doc.senderAvatar,
        text: doc.text,
        time: new Date(doc.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: doc.status || 'sent',
        type: doc.type || 'text',
        mediaUrl: doc.mediaUrl,
        voiceDuration: doc.duration,
        isViewOnce: doc.isViewOnce,
        isViewed: doc.isViewed,
        isDownloaded: true,
        reactions: doc.reactions ? JSON.parse(doc.reactions) : []
      }));
      
      setMessages(mapped);
    } catch (e) {
      console.error("Vault history fetch failed:", e);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [conversationId, currentUser.username]);

  useEffect(() => {
    if (!conversationId) return;
    fetchHistory();

    if (!currentUser.id) return;

    // REAL-TIME HANDSHAKE SUBSCRIPTION
    const unsubscribe = client.subscribe(
      `databases.${APPWRITE_DATABASE_ID}.collections.${MESSAGES_COLLECTION_ID}.documents`,
      (response) => {
        const payload = response.payload as any;
        if (payload.conversationId === conversationId && payload.senderId !== currentUser.username) {
          const incoming: Message = {
            id: payload.$id,
            sender: "them",
            senderId: payload.senderId,
            senderName: payload.senderName,
            senderAvatar: payload.senderAvatar,
            text: payload.text,
            time: new Date(payload.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: payload.status,
            type: payload.type,
            mediaUrl: payload.mediaUrl,
            voiceDuration: payload.duration,
            isViewOnce: payload.isViewOnce,
            isViewed: payload.isViewed,
            isDownloaded: false,
            reactions: payload.reactions ? JSON.parse(payload.reactions) : []
          };
          setMessages(prev => [...prev, incoming]);
          triggerHaptic(10);
        }
      }
    );

    return () => unsubscribe();
  }, [conversationId, fetchHistory, currentUser.id, currentUser.username, triggerHaptic]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showVault]);

  const handleSend = async (text: string, options?: { isViewOnce?: boolean; isWorkspace?: boolean; mediaUrl?: string; mediaType?: 'photo' | 'video' | 'voice'; duration?: string }) => {
    if (!conversationId) return;
    
    let finalMediaUrl = options?.mediaUrl || "";
    const type = options?.isWorkspace ? "workspace" : (options?.mediaType || (text.includes("http") ? "link" : "text"));

    const optimisticId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: optimisticId,
      sender: "me",
      senderId: currentUser.username,
      text: text || undefined,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "sent",
      type: type as any,
      isViewOnce: options?.isViewOnce,
      isDownloaded: true,
      mediaUrl: finalMediaUrl,
      voiceDuration: options?.duration
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      if (finalMediaUrl.startsWith('blob:')) {
        const response = await fetch(finalMediaUrl);
        const blob = await response.blob();
        
        // INTELLIGENT BUCKET DISPATCHING
        let targetBucket = BUCKET_IMAGES;
        if (type === 'voice') targetBucket = BUCKET_VOICENOTE;
        else if (type === 'video') targetBucket = BUCKET_REEL;

        const extension = type === 'voice' ? 'webm' : (type === 'video' ? 'mp4' : 'jpg');
        const file = new File([blob], `msg_media_${Date.now()}.${extension}`, { type: blob.type });
        finalMediaUrl = await uploadMedia(file, targetBucket);
      }

      const docData = {
        conversationId,
        senderId: currentUser.username,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        text: text || "",
        type,
        mediaUrl: finalMediaUrl,
        duration: options?.duration || "",
        status: "sent",
        isViewOnce: options?.isViewOnce || false,
        isViewed: false,
        reactions: JSON.stringify([])
      };

      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        docData
      );
    } catch (e) {
      toast({ variant: "destructive", title: "Sync Error", description: "Node transmission failed." });
      setMessages(prev => prev.filter(m => m.id !== optimisticId));
    }
  };

  const handleExternalLink = (url: string) => {
    triggerHaptic(5);
    window.open(url, '_blank', 'noopener,noreferrer');
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
      leaveCluster((contact as Cluster).id);
      onBack();
    }
  };

  const handleAddNode = (member: Connection) => {
    if (isCluster) {
      triggerHaptic(30);
      addMemberToCluster((contact as Cluster).id, member);
      toast({ title: "Node Synced", description: `@${member.username} joined cluster.` });
      setAddNodeSearch("");
    }
  };

  const isContactOnline = !isCluster && (contact as Connection).isOnline && !settings.isGhostMode;

  return (
    <div className="flex flex-1 min-h-0 bg-[#F0F2F5] dark:bg-[#080808] relative overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 relative overflow-hidden">
        <header className="h-[76px] px-4 sm:px-6 flex items-center justify-between bg-white dark:bg-card border-b border-primary/5 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-10 w-10 -ml-2" onClick={onBack}><ArrowLeft className="h-6 w-6" /></Button>
            <div className="relative shrink-0">
              {isCluster ? (
                <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-[1rem] bg-primary/10 flex items-center justify-center relative overflow-hidden border border-primary/5">
                  {(contact as Cluster).avatar ? <img src={(contact as Cluster).avatar} alt="Cluster" className="w-full h-full object-cover" /> : <Layers className="h-5 w-5 text-primary" />}
                </div>
              ) : (
                <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border-2 border-primary/10">
                  <AvatarImage src={(contact as Connection).avatar} />
                  <AvatarFallback>{contact.name[0]}</AvatarFallback>
                </Avatar>
              )}
              {isContactOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse" />}
            </div>
            <div className="flex flex-col min-w-0 ml-1">
              <h3 className="font-bold text-sm sm:text-base truncate">{contact.name}</h3>
              <span className={cn("text-[10px] font-black uppercase tracking-widest", isCluster ? "text-primary" : isContactOnline ? "text-green-500" : "text-muted-foreground")}>
                {isCluster ? `${((contact as Cluster).members || []).length} ${t('chat_members_pulse')}` : isContactOnline ? t('chat_active_pulse') : t('chat_away')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {!isCluster && (
              <>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary transition-colors" onClick={() => handleStartCall('video')}><VideoIcon className="h-5 w-5" /></Button>
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

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(153, 64, 22, 0.03) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
          {isLoadingMessages ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest">Vault Syncing...</p>
            </div>
          ) : (
            (messages || []).map((msg) => (
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
                  status={settings.showReadReceipts ? msg.status : 'sent'}
                  onExternalLink={handleExternalLink}
                  onDelete={(id) => setMessages(prev => prev.filter(m => m.id !== id))}
                  onDownload={(id) => setMessages(prev => prev.map(m => m.id === id ? { ...m, isDownloaded: true } : m))}
                />
              </div>
            ))
          )}
        </div>
        <ChatInput onSend={handleSend} />
      </div>

      <aside className={cn(
        "h-full bg-white dark:bg-card border-l border-primary/5 transition-all duration-500 overflow-hidden flex flex-col shrink-0 relative z-30", 
        showVault ? "w-full sm:w-[360px] opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-full"
      )}>
        <div className="p-6 border-b border-primary/5 flex items-center justify-between shrink-0 bg-white/80 dark:bg-card/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {isCluster ? <Bookmark className="h-5 w-5" /> : <InfoIcon className="h-5 w-5" />}
            </div>
            <h3 className="font-black italic uppercase tracking-tighter text-lg">{isCluster ? t('chat_vault') : t('chat_node_details')}</h3>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={() => setShowVault(false)}><X className="h-6 w-6" /></Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-10 pb-20">
            {isCluster && (
              <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{t('chat_members_pulse')}</span>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <Dialog open={isAddNodeOpen} onOpenChange={setIsAddNodeOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"><UserPlus className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2rem] p-0 overflow-hidden border-primary/10">
                          <DialogHeader className="p-6 bg-primary/5 border-b border-primary/10"><DialogTitle className="text-xl font-black italic uppercase tracking-widest text-primary">Add Node to Cluster</DialogTitle></DialogHeader>
                          <div className="p-4 space-y-4">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input placeholder="Search connections..." className="h-12 pl-10 rounded-2xl bg-secondary/20 border-none" value={addNodeSearch} onChange={(e) => setAddNodeSearch(e.target.value)} />
                            </div>
                            <ScrollArea className="h-[300px]">
                              <div className="space-y-2 pr-4">
                                {(nonClusterMembers || []).map((c) => (
                                  <button key={c.username} onClick={() => handleAddNode(c)} className="w-full flex items-center justify-between p-3 rounded-2xl transition-all hover:bg-secondary/40">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-10 w-10 border border-primary/10"><AvatarImage src={c.avatar} /></Avatar>
                                      <div className="text-left"><p className="font-bold text-sm leading-none">{c.name}</p><p className="text-[10px] text-muted-foreground font-black uppercase mt-1">@{c.username}</p></div>
                                    </div>
                                    <Plus className="h-4 w-4 text-primary" />
                                  </button>
                                ))}
                              </div>
                            </ScrollArea>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[8px] font-black h-4 px-2 uppercase">{((contact as Cluster).members || []).length} ACTIVE</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {((contact as Cluster).members || []).map(m => (
                    <div key={m.username} className="flex items-center justify-between p-3 rounded-2xl bg-secondary/20 hover:bg-secondary/40 transition-all group">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-primary/5 shadow-sm group-hover:scale-105 transition-transform"><AvatarImage src={m.avatar} /></Avatar>
                        <div className="flex flex-col"><span className="text-sm font-bold truncate max-w-[120px]">{m.name}</span><span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">@{m.username}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="pt-6 border-t border-primary/5 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">System Controls</h4>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-2xl text-muted-foreground hover:bg-primary/5 hover:text-primary transition-all"><ShieldCheck className="h-5 w-5" /><span className="font-bold text-sm">Security Handshake</span></Button>
                {isCluster && (
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-2xl text-destructive hover:bg-destructive/5 transition-all" onClick={() => { triggerHaptic(15); setIsLeaveDialogOpen(true); }}>
                    <LogOut className="h-5 w-5" />
                    <span className="font-bold text-sm">{isAdmin ? "Dissolve Cluster" : "Leave Cluster"}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </aside>

      <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem] sm:max-w-[420px] z-[400] bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-2xl border-primary/10 shadow-2xl">
          <AlertDialogHeader>
            <div className="mx-auto h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-4"><LogOut className="h-8 w-8" /></div>
            <AlertDialogTitle className="font-black italic uppercase tracking-tighter text-3xl text-center">{isAdmin ? "Dissolve Cluster?" : "Leave Cluster?"}</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium leading-relaxed text-center px-4">This action is terminal. You will lose access to this collective workspace node.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6"><AlertDialogCancel className="rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] bg-secondary/50 border-none hover:bg-secondary transition-all">Cancel</AlertDialogCancel><AlertDialogAction onClick={handleConfirmLeave} className="rounded-2xl h-14 font-black italic uppercase tracking-widest text-[10px] bg-destructive hover:bg-destructive/90 text-white shadow-xl">Confirm</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
