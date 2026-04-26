
"use client";

import { useState, useRef, useEffect } from "react";
import { cn, isTextForeignToUser } from "@/lib/utils";
import { 
  CheckCheck, 
  Play, 
  Pause, 
  ExternalLink, 
  UserPlus, 
  Eye, 
  Flame, 
  Lock,
  LayoutDashboard,
  Zap,
  EyeOff,
  Download,
  Loader2,
  Languages,
  Image as ImageIcon,
  Video as VideoIcon,
  Link as LinkIcon,
  Trash2,
  MoreVertical,
  Pencil,
  Check,
  X as XIcon,
  Phone,
  Video,
  PhoneMissed
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMusic } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { useNetwork } from "@/context/NetworkContext";
import { getAdaptivePreview } from "@/lib/adaptive-media";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { aiTranslatePostAction } from "@/app/actions/ai";
import { useToast } from "@/hooks/use-toast";

interface LinkPreview {
  title: string;
  description: string;
  image: string;
  url: string;
}

interface SharedPostData {
  postId: string;
  postImage?: string;
  postVideo?: string;
  postContent?: string;
  postAuthorName?: string;
  postAuthorAvatar?: string;
  postAuthorUsername?: string;
}

interface ChatBubbleProps {
  id: string;
  isMe: boolean;
  text?: string;
  time: string;
  status?: "sent" | "delivered" | "read";
  type?: "text" | "photo" | "video" | "link" | "voice" | "tag" | "workspace" | "call" | "post";
  mediaUrl?: string;
  voiceDuration?: string;
  linkData?: LinkPreview;
  reactions?: string[];
  isViewOnce?: boolean;
  isViewed?: boolean;
  isDownloaded?: boolean;
  callData?: {
    type: 'audio' | 'video';
    status: 'started' | 'missed' | 'ended';
    duration?: string;
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
  postId?: string;
  sharedPostData?: SharedPostData;
  onReact?: (emoji: string) => void;
  onViewOnceOpen?: (id: string) => void;
  onMediaOpen?: (id: string) => void;
  onDownload?: (id: string) => void;
  onExternalLink?: (url: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, newText: string) => void;
}

export function ChatBubble({ 
  id, isMe, text, time, status, type = "text", mediaUrl, voiceDuration, linkData, reactions = [], taggedUser, isViewOnce, isViewed, isDownloaded, workspaceData, callData, postId, sharedPostData, onReact, onViewOnceOpen, onMediaOpen, onDownload, onExternalLink, onDelete, onEdit
}: ChatBubbleProps) {
  const { triggerHaptic } = useMusic();
  const { setSelectedImageUrl, setSelectedVideoUrl, settings } = usePosts();
  const { tier } = useNetwork();
  const { toast } = useToast();
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text || '');
  const [voiceWaveHeights, setVoiceWaveHeights] = useState<number[]>([]);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [browserLang, setBrowserLang] = useState<string>('en');

  useEffect(() => {
    if (typeof window !== 'undefined') setBrowserLang(window.navigator.language.split('-')[0]);
  }, []);

  const showTranslateButton = !isMe && type === 'text' && !!text && isTextForeignToUser(text, browserLang);

  const handleTranslate = async () => {
    if (translatedText) { setTranslatedText(null); return; }
    if (!text) return;
    setIsTranslating(true);
    try {
      const targetLang = new Intl.DisplayNames([browserLang], { type: 'language' }).of(browserLang) || 'English';
      const res = await aiTranslatePostAction({ postContent: text, targetLanguage: targetLang });
      setTranslatedText(res.translation);
    } catch {
      /* silently ignore */
    } finally {
      setIsTranslating(false);
    }
  };
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const isRead = status === "read";

  const formatDisplayTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (type === 'voice') {
      setVoiceWaveHeights([...Array(12)].map(() => 20 + Math.random() * 80));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof document !== 'undefined') {
        document.body.style.pointerEvents = 'auto';
      }
    };
  }, [type]);

  useEffect(() => {
    if (!isDeleteDialogOpen) {
      if (typeof document !== 'undefined') {
        document.body.style.pointerEvents = 'auto';
      }
    }
  }, [isDeleteDialogOpen]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    triggerHaptic(20);
    onReact?.("🔥");
  };

  const handleViewOnce = () => {
    if (isViewed) return;
    if (settings.isFreeMode) return;
    if (!isDownloaded && !isMe) {
      handleDownload();
      return;
    }
    triggerHaptic(30);
    onViewOnceOpen?.(id);
  };

  const handleMediaClick = () => {
    if (!mediaUrl) return;
    if (settings.isFreeMode) return;
    triggerHaptic(10);
    if (type === 'photo') {
      setSelectedImageUrl(mediaUrl);
    } else if (type === 'video') {
      setSelectedVideoUrl(mediaUrl);
    }
    onMediaOpen?.(id);
  };

  const handleDownload = async () => {
    if (isDownloaded || isDownloading) return;
    triggerHaptic(15);
    setIsDownloading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsDownloading(false);
    onDownload?.(id);
    triggerHaptic(25);
  };

  const handleDelete = () => {
    triggerHaptic(50);
    setIsDeleteDialogOpen(false);
    setTimeout(() => {
      if (typeof document !== 'undefined') {
        document.body.style.pointerEvents = 'auto';
      }
      onDelete?.(id);
    }, 100);
  };

  const toggleVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current || !mediaUrl) return;
    if (settings.isFreeMode) return;
    triggerHaptic(10);
    if (isPlayingVideo) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => {
        console.warn("Video playback failed:", err);
      });
    }
    setIsPlayingVideo(!isPlayingVideo);
  };

  const toggleVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!mediaUrl) return;
    if (settings.isFreeMode) return;
    triggerHaptic(10);

    if (!audioRef.current) {
      const audio = new Audio(mediaUrl);
      audio.onended = () => {
        setIsPlayingVoice(false);
        setElapsedTime(0);
        if (timerRef.current) clearInterval(timerRef.current);
        audioRef.current = null;
      };
      audioRef.current = audio;
    }

    if (isPlayingVoice) {
      audioRef.current.pause();
      setIsPlayingVoice(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.warn("Voice playback failed:", err);
        setIsPlayingVoice(false);
        audioRef.current = null;
        // Show a helpful message — on iOS, older webm voice notes can't play
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        toast({
          variant: "destructive",
          title: "Can't Play Voice Note",
          description: isIOS
            ? "This voice note was recorded in a format not supported by iPhone. Ask the sender to record a new one — new notes will play on all devices."
            : "Voice note playback failed. Please try again.",
        });
      });
      setIsPlayingVoice(true);
      
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (audioRef.current) {
          setElapsedTime(audioRef.current.currentTime);
        }
      }, 100);
    }
  };

  const renderFormattedText = (content?: string) => {
    if (!content) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <button 
            key={i} 
            className="text-[#6E96FF] underline hover:text-[#6E96FF]/80 transition-colors font-bold decoration-2 underline-offset-2 animate-pulse inline-flex items-center gap-1"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic(5);
              onExternalLink?.(part);
            }}
          >
            <LinkIcon className="h-3 w-3" />
            {part}
          </button>
        );
      }
      return part;
    });
  };

  const showMediaPlaceholder = isViewOnce && !isViewed && !isDownloaded && !isMe;

  return (
    <>
      <div 
        className={cn(
          "flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300 group relative",
          isMe ? "justify-end" : "justify-start"
        )}
        onDoubleClick={handleDoubleClick}
      >
        <div className={cn(
          "relative max-w-[85%] sm:max-w-[70%] shadow-md overflow-hidden",
          isMe 
            ? "bg-primary text-white rounded-2xl rounded-tr-none" 
            : "bg-white dark:bg-card text-foreground rounded-2xl rounded-tl-none border border-primary/5",
          (type === "photo" || type === "video" || type === "workspace") && "p-1 pb-0",
          type === "call" && "bg-secondary/20 dark:bg-zinc-900 border-none px-6 py-4 rounded-3xl"
        )}>
          {isMe && type !== "call" && (
            <div className="absolute top-1 right-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-black/20 text-white hover:bg-black/40">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  {type === 'text' && !!text && (
                    <DropdownMenuItem className="gap-2" onSelect={() => { setEditText(text); setIsEditing(true); }}>
                      <Pencil className="h-3.5 w-3.5" /> Edit Message
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onSelect={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="h-3.5 w-3.5" /> Purge Message
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {type !== "call" && (
            <div className={cn(
              "absolute top-0 w-4 h-4 z-10",
              isMe 
                ? "-right-2 bg-primary [clip-path:polygon(0_0,0_100%,100%_0)]" 
                : "-left-2 bg-white dark:bg-card [clip-path:polygon(100%_0,100%_100%,0_0)]"
            )} />
          )}

          <div className="flex flex-col">
            {type === "call" && callData && (
              <div className="flex flex-col gap-3 min-w-[220px]">
                <div className="flex items-center gap-3">
                  {/* Icon column */}
                  <div className={cn(
                    "h-11 w-11 rounded-2xl flex items-center justify-center shrink-0",
                    callData.status === 'missed'
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary"
                  )}>
                    {callData.status === 'missed' ? (
                      <PhoneMissed className="h-5 w-5" />
                    ) : callData.type === 'video' ? (
                      <Video className="h-5 w-5" />
                    ) : (
                      <Phone className="h-5 w-5" />
                    )}
                  </div>

                  {/* Text column */}
                  <div className="flex flex-col min-w-0">
                    <span className={cn(
                      "text-sm font-black uppercase tracking-tight leading-tight",
                      callData.status === 'missed' ? "text-destructive" : "text-foreground"
                    )}>
                      {callData.status === 'missed'
                        ? (isMe ? 'Missed Call' : 'Missed Call')
                        : callData.status === 'ended'
                          ? (isMe ? 'Outgoing Call' : 'Incoming Call')
                          : (isMe ? 'Outgoing Call' : 'Incoming Call')}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {callData.type === 'video' ? 'Video' : 'Voice'}
                      </span>
                      {callData.duration && callData.status === 'ended' && (
                        <>
                          <span className="text-[10px] text-muted-foreground/40">·</span>
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest">{callData.duration}</span>
                        </>
                      )}
                      {callData.status === 'missed' && (
                        <>
                          <span className="text-[10px] text-muted-foreground/40">·</span>
                          <span className="text-[10px] font-black text-destructive uppercase tracking-widest">No Answer</span>
                        </>
                      )}
                    </div>
                    <span className="text-[9px] text-muted-foreground/50 uppercase tracking-widest mt-0.5">{time}</span>
                  </div>
                </div>

              </div>
            )}

            {isViewOnce && (type === "photo" || type === "video") && (
              <div className="p-3 min-w-[200px]">
                {isViewed ? (
                  <div className="flex items-center gap-3 text-white/60 dark:text-muted-foreground italic py-2">
                    <div className="h-10 w-10 rounded-full bg-black/10 flex items-center justify-center">
                      <Flame className="h-5 w-5 opacity-40" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black uppercase tracking-widest">Vibe Exploded</span>
                      <span className="text-[9px] uppercase font-bold opacity-50">Content Purged</span>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={handleViewOnce}
                    className={cn(
                      "w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 p-6 transition-all hover:scale-[1.02] active:scale-95",
                      isMe ? "border-white/20 hover:border-white/40 bg-white/5" : "border-primary/20 hover:border-primary/40 bg-primary/5"
                    )}
                  >
                    <div className={cn(
                      "h-12 w-12 rounded-full flex items-center justify-center shadow-lg",
                      isMe ? "bg-white/20" : "bg-primary text-white"
                    )}>
                      {isDownloading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Eye className="h-6 w-6" />}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black uppercase tracking-widest">
                        {isMe ? "Sent Disappearing Vibe" : isDownloaded ? "View Disappearing Vibe" : "Download to View"}
                      </p>
                      <p className="text-[9px] font-bold opacity-60 mt-1 uppercase tracking-tighter">One-time Playback Only</p>
                    </div>
                  </button>
                )}
              </div>
            )}

            {!isViewOnce && (type === "photo" || type === "video") && mediaUrl && (
              <div className="relative aspect-square sm:aspect-video min-w-[240px] rounded-xl overflow-hidden mb-1 bg-secondary/20">
                {showMediaPlaceholder ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 group/download cursor-pointer" onClick={handleDownload}>
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-md" />
                    <div className={cn(
                      "relative z-10 h-14 w-14 rounded-full flex items-center justify-center transition-all shadow-xl",
                      isDownloading ? "bg-primary/20" : "bg-primary text-white group-hover/download:scale-110"
                    )}>
                      {isDownloading ? (
                        <Loader2 className="h-7 w-7 animate-spin text-primary" />
                      ) : (
                        <Download className="h-7 w-7" />
                      )}
                    </div>
                    <div className="relative z-10 text-center">
                      <p className="text-xs font-black uppercase tracking-widest drop-shadow-md text-white">
                        {isDownloading ? "Syncing Node..." : `Download ${type === 'photo' ? 'Vibe' : 'Video'}`}
                      </p>
                      <span className="text-[9px] font-bold uppercase text-white/60 tracking-widest">High-Velocity Encrypted</span>
                    </div>
                  </div>
                ) : (
                  <>
                    {type === "photo" ? (
                      <div className="relative w-full h-full cursor-pointer" onClick={handleMediaClick}>
                        <Image src={mediaUrl} alt="Chat Media" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="relative w-full h-full cursor-pointer" onClick={handleMediaClick}>
                        <video
                          key={mediaUrl}
                          ref={videoRef}
                          src={mediaUrl}
                          className="w-full h-full object-cover"
                          muted={!isPlayingVideo}
                          playsInline
                          preload="none"
                        />
                        <div className={cn(
                          "absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300",
                          isPlayingVideo ? "opacity-0" : "opacity-100"
                        )}>
                          <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                            <Play className="h-6 w-6 text-white fill-current" />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {type === "workspace" && workspaceData && (
              <div className={cn(
                "m-1 mb-2 rounded-xl overflow-hidden border border-white/10 flex flex-col",
                isMe ? "bg-white/10" : "bg-primary/5"
              )}>
                <div className="relative h-24 w-full">
                  <Image src={workspaceData.image} alt="Workspace" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                    <LayoutDashboard className="h-8 w-8 text-white opacity-60" />
                  </div>
                </div>
                <div className="p-3 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs uppercase tracking-widest truncate">{workspaceData.title}</h4>
                    <p className={cn("text-[9px] font-black uppercase opacity-60", isMe ? "text-white" : "text-primary")}>{workspaceData.metrics}</p>
                  </div>
                  <Button size="sm" className={cn("h-8 rounded-lg text-[9px] font-black uppercase px-3", isMe ? "bg-white/20 text-white" : "bg-primary text-white")}>
                    VIEW HUB
                  </Button>
                </div>
              </div>
            )}

            {type === "post" && sharedPostData && (
              <Link
                href={`/post/${sharedPostData.postId}`}
                className={cn(
                  "m-1 mb-2 rounded-xl overflow-hidden border flex flex-col text-left group/post transition-transform active:scale-95",
                  isMe ? "bg-white/10 border-white/10" : "bg-secondary/30 border-primary/10"
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {(sharedPostData.postImage || sharedPostData.postVideo) && (
                  <div className="relative aspect-video w-full">
                    {sharedPostData.postVideo && !sharedPostData.postImage ? (
                      <>
                        <video src={sharedPostData.postVideo} className="h-full w-full object-cover" muted playsInline preload="none" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-10 w-10 rounded-full bg-black/45 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                            <Play className="h-4 w-4 fill-current ml-0.5" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <Image src={sharedPostData.postImage!} alt="Shared Post" fill className="object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                )}
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-white/20 shrink-0">
                      <AvatarImage src={getAdaptivePreview(sharedPostData.postAuthorAvatar, 'avatar', tier) || sharedPostData.postAuthorAvatar} />
                      <AvatarFallback>{sharedPostData.postAuthorName?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <span className={cn("text-[11px] font-black uppercase tracking-widest truncate", isMe ? "text-white/80" : "text-foreground")}>
                      {sharedPostData.postAuthorName}
                    </span>
                    <span className={cn("text-[10px] shrink-0", isMe ? "text-white/40" : "text-muted-foreground")}>
                      @{sharedPostData.postAuthorUsername}
                    </span>
                  </div>
                  {sharedPostData.postContent && (
                    <p className={cn("text-[12px] leading-snug line-clamp-2", isMe ? "text-white/70" : "text-muted-foreground")}>
                      {sharedPostData.postContent}
                    </p>
                  )}
                  <div className={cn("flex items-center gap-1 text-[10px] font-black uppercase tracking-widest", isMe ? "text-white/50" : "text-primary")}>
                    <ExternalLink className="h-3 w-3" />
                    View Post
                  </div>
                </div>
              </Link>
            )}

            {type === "link" && linkData && (
              <button 
                className={cn(
                  "m-1 mb-2 rounded-xl overflow-hidden border border-white/10 flex flex-col text-left group/link transition-transform active:scale-95",
                  isMe ? "bg-white/10" : "bg-secondary/30"
                )}
                onClick={() => onExternalLink?.(linkData.url)}
              >
                <div className="relative aspect-video w-full">
                  <Image src={linkData.image} alt="Link Preview" fill className="object-cover transition-transform group/link:scale-105" />
                </div>
                <div className="p-3 space-y-1">
                  <h4 className="font-bold text-xs uppercase tracking-widest truncate">{linkData.title}</h4>
                  <p className="text-[10px] opacity-70 line-clamp-2 leading-tight">{linkData.description}</p>
                </div>
              </button>
            )}


            {type === "tag" && taggedUser && (
              <div className={cn(
                "m-1 mb-2 p-3 rounded-xl flex items-center gap-3 border border-white/10",
                isMe ? "bg-white/10" : "bg-primary/5"
              )}>
                <Avatar className="h-12 w-12 border-2 border-white/20">
                  <AvatarImage src={getAdaptivePreview(taggedUser.avatar, 'avatar', tier) || taggedUser.avatar} />
                  <AvatarFallback>{taggedUser.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{taggedUser.name}</p>
                  <p className={cn("text-[10px] font-black uppercase tracking-widest", isMe ? "text-white/60" : "text-primary")}>
                    {taggedUser.category}
                  </p>
                </div>
                <button className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  isMe ? "bg-white/20" : "bg-primary text-white"
                )}>
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>
            )}

            {text && (
              <div className="px-3 sm:px-4 py-2 sm:py-3">
                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      className={cn(
                        "w-full min-h-[60px] resize-none rounded-xl p-2 text-sm font-medium leading-relaxed focus:outline-none",
                        isMe ? "bg-white/10 text-white placeholder:text-white/40" : "bg-secondary/40 text-foreground"
                      )}
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (editText.trim()) { onEdit?.(id, editText.trim()); setIsEditing(false); } }
                        if (e.key === 'Escape') { setIsEditing(false); }
                      }}
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => setIsEditing(false)} className={cn("h-7 w-7 rounded-full flex items-center justify-center transition-colors", isMe ? "bg-white/10 hover:bg-white/20 text-white" : "bg-secondary hover:bg-secondary/80")}>
                        <XIcon className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => { if (editText.trim()) { onEdit?.(id, editText.trim()); setIsEditing(false); } }}
                        disabled={!editText.trim() || editText.trim() === text}
                        className={cn("h-7 w-7 rounded-full flex items-center justify-center transition-colors", isMe ? "bg-white/20 hover:bg-white/30 text-white" : "bg-primary text-white hover:bg-primary/90", (!editText.trim() || editText.trim() === text) && "opacity-40 cursor-not-allowed")}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm sm:text-[15px] leading-relaxed break-words font-medium">
                      {renderFormattedText(translatedText || text)}
                    </div>
                    {showTranslateButton && (
                      <button
                        onClick={handleTranslate}
                        disabled={isTranslating}
                        className={cn(
                          "flex items-center gap-1 mt-1 text-[10px] font-black uppercase tracking-widest transition-colors",
                          isMe ? "text-white/50 hover:text-white" : translatedText ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                      >
                        {isTranslating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                        {isTranslating ? "Translating..." : translatedText ? "Show original" : "Translate"}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            <div className={cn(
              "flex items-center justify-end gap-1.5 px-3 pb-2",
              isMe ? "text-white/60" : "text-muted-foreground",
              (type === "photo" || type === "video") && !text && "absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white/80",
              type === "call" && "mt-2"
            )}>
              <span className="text-[9px] font-bold uppercase tracking-wider">{time}</span>
              {isMe && (
                <CheckCheck className={cn(
                  "h-3 w-3",
                  (isRead && settings.showReadReceipts) ? "text-accent" : "text-white/40"
                )} />
              )}
            </div>
          </div>

          {reactions.length > 0 && (
            <div className={cn(
              "absolute -bottom-3 flex gap-1",
              isMe ? "right-2" : "left-2"
            )}>
              {reactions.map((emoji, i) => (
                <div 
                  key={i} 
                  className="bg-white dark:bg-zinc-800 shadow-lg rounded-full px-1.5 py-0.5 text-xs border border-primary/10 animate-in zoom-in duration-300"
                >
                  {emoji}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem] sm:max-w-[420px]">
          <AlertDialogHeader>
            <div className="mx-auto h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-4">
              <Trash2 className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="font-black italic uppercase tracking-tighter text-3xl text-center">Purge Message?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium leading-relaxed text-center px-4">
              This will permanently remove this data node from the conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6">
            <AlertDialogCancel className="rounded-xl h-12 font-bold bg-secondary/50 border-none">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-xl h-12 font-black italic uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20"
            >
              Confirm Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
