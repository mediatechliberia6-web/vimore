"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ThumbsUp, 
  ThumbsDown,
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  CheckCircle2, 
  Heart,
  Send,
  Bookmark,
  EyeOff,
  Flag,
  Languages,
  Loader2,
  Pin,
  Archive,
  GalleryVerticalEnd,
  Link as LinkIcon,
  Trash2,
  Download,
  PlusSquare,
  Play,
  Video,
  Gift,
  Lock,
  Zap,
  ShieldCheck,
  Coins,
  ChevronRight,
  ExternalLink,
  Eye,
  Rocket
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn, parseFollowerCount, saveFileToDevice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { aiTranslatePostAction } from "@/app/actions/ai";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useNotifications } from "@/context/NotificationContext";
import { useTranslation } from "@/context/LanguageContext";
import { ShareHub } from "./share-hub";
import { BoostPortal } from "./boost-portal";
import { useRouter } from "next/navigation";
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

interface Comment {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  text: string;
  time: string;
  replies?: Comment[];
}

interface PostCardProps {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    role: string;
    isVerified?: boolean;
    isOnline?: boolean;
    followers?: string | number;
  };
  collaborator?: {
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
  };
  content: string;
  image?: string;
  images?: string[];
  imageFilter?: string;
  theme?: string;
  language?: string;
  likes: number;
  unlikes: number;
  comments: number;
  shares?: number;
  views: number;
  time: string;
  hashtags?: string[];
  feeling?: { emoji: string; text: string };
  location?: string;
  themeClass?: string;
  commentsDisabled?: boolean;
  isPinned?: boolean;
  isSeries?: boolean;
  seriesTitle?: string;
  isLocked?: boolean;
  unlockPrice?: number;
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
    duration?: string;
  };
  initialComments?: Comment[];
  isShared?: boolean;
  sharedPost?: PostCardProps;
  videoUrl?: string;
  isCampaign?: boolean;
  actionUrl?: string;
  actionLabel?: string;
  isBoosted?: boolean;
  boostTargetViews?: number;
  boostCurrentViews?: number;
}

export function PostCard(props: PostCardProps) {
  const { 
    id, user, collaborator, content, image, images = [], imageFilter, theme, language,
    likes = 0, unlikes = 0, comments = 0, shares = 0, views = 0, time, hashtags, feeling, location, commentsDisabled, isPinned, 
    isSeries, seriesTitle, poll, isShared = false, videoUrl, sharedPost, isLocked, unlockPrice, isCampaign, actionUrl, actionLabel,
    isBoosted, boostTargetViews, boostCurrentViews
  } = props;

  const { 
    currentUser, isPostLiked, isPostUnliked, isPostSaved, isPostUnlocked, toggleLikePost, toggleUnlikePost, toggleSavePost, archivePost, togglePinPost, deletePost, openCommentHub, setSelectedPostId, setSelectedImageUrl, openGiftHub, unlockPost, settings, recordCampaignClick, recordView
  } = usePosts();

  const { addSignal } = useNotifications();
  const { triggerHaptic } = useMusic();
  const { t } = useTranslation();
  const router = useRouter();

  const isLiked = isPostLiked(id);
  const isUnliked = isPostUnliked(id);
  const isBookmarked = isPostSaved(id);
  const isUnlocked = isPostUnlocked(id);
  const isOwner = user.username === currentUser.username;
  
  const effectiveIsVerified = isOwner ? currentUser.isVerified : user.isVerified;
  const isEligibleForGift = parseFollowerCount(user.followers) > 1000 && settings.isGiftingEnabled;
  const isHiddenByLock = isLocked && !isUnlocked && !isOwner && !isShared;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isRevealedManually, setIsRevealedManually] = useState(false);
  const [viewerLanguage, setViewerLanguage] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareHubOpen, setIsShareHubOpen] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [userVote, setUserVote] = useState<number | null>(null);
  const [localPollOptions, setLocalPollOptions] = useState(poll?.options || []);
  const [localTotalVotes, setLocalTotalVotes] = useState(poll?.totalVotes || 0);
  const [isPollExpanded, setIsPollExpanded] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const hasRecordedView = useRef(false);

  const { toast } = useToast();

  // Visibility Handshake for View Tracking
  useEffect(() => {
    if (isShared || isCampaign || hasRecordedView.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasRecordedView.current) {
            hasRecordedView.current = true;
            recordView(id);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [id, isShared, isCampaign, recordView]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setViewerLanguage(window.navigator.language.split('-')[0]);
    }
  }, []);

  useEffect(() => {
    if (!isDeleteDialogOpen) {
      document.body.style.pointerEvents = 'auto';
    }
    return () => {
      document.body.style.pointerEvents = 'auto';
    };
  }, [isDeleteDialogOpen]);

  const allImages = useMemo(() => {
    const list = [...images];
    if (image && !list.includes(image)) list.unshift(image);
    return list;
  }, [image, images]);

  const TRUNCATE_LIMIT = 150;
  const isLimitedType = useMemo(() => !!theme || allImages.length > 0 || !!videoUrl || !!poll || !!isLocked, [theme, allImages, videoUrl, poll, isLocked]);
  const isLongContent = useMemo(() => content.length > TRUNCATE_LIMIT && !isLimitedType, [content.length, isLimitedType]);

  const showTranslateButton = useMemo(() => {
    if (!language || !viewerLanguage || isShared || isHiddenByLock || isCampaign) return false;
    if (language === viewerLanguage) return false;
    if (content.length < 5) return false;
    return true;
  }, [language, viewerLanguage, content, isShared, isHiddenByLock, isCampaign]);

  const isSensitiveNode = settings.isSensitivityFilterActive && !isRevealedManually && !isOwner && !isCampaign && (allImages.length > 0 || !!videoUrl);

  const handleLike = () => { 
    triggerHaptic(20); 
    const wasLiked = isLiked;
    toggleLikePost(id); 
    if (!wasLiked && !isOwner && !isShared && !isCampaign) {
      addSignal({
        type: 'SOCIAL',
        title: 'New Vibe Pulse',
        content: `**${currentUser.name}** liked your post: "${content.slice(0, 30)}..."`,
        avatar: currentUser.avatar
      });
    }
  };

  const handleUnlock = async () => {
    if (isUnlocking || !unlockPrice) return;
    setIsUnlocking(true);
    triggerHaptic(30);

    try {
      await unlockPost(id, unlockPrice);
      addSignal({
        type: 'SYSTEM',
        title: 'Node Unlocked',
        content: `You unlocked a high-velocity vibe from **${user.name}**.`,
        avatar: user.avatar
      });
      toast({ title: "Vibe Materialized", description: "Node permanently synced to your feed." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Vault Sync Error", description: e.message });
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleCampaignAction = () => {
    if (!actionUrl) return;
    triggerHaptic(25);
    recordCampaignClick(id);
    if (actionUrl.startsWith('/')) {
      router.push(actionUrl);
    } else {
      window.open(actionUrl, '_blank');
    }
  };

  const handleUnlike = () => { triggerHaptic(15); toggleUnlikePost(id); };
  const handleSave = () => { triggerHaptic(5); toggleSavePost(id); toast({ description: isBookmarked ? "Removed" : "Noted ✨" }); };

  const handleTranslate = async () => {
    if (isTranslating) return;
    triggerHaptic();
    if (translatedText) { setTranslatedText(null); return; }
    setIsTranslating(true);
    try {
      const target = viewerLanguage || "English";
      const result = await aiTranslatePostAction({ postContent: content, targetLanguage: target });
      setTranslatedText(result.translation);
      toast({ description: "Vibe translated ✨" });
    } catch (error) { toast({ description: "Translation failed", variant: "destructive" }); }
    finally { setIsTranslating(false); }
  };

  const handleDelete = () => {
    triggerHaptic(50);
    document.body.style.pointerEvents = 'auto';
    setIsDeleteDialogOpen(false);
    deletePost(id);
    toast({ title: "Content Purged", description: "Your vibe has been removed from the network." });
  };

  const handleVote = (originalIndex: number) => {
    triggerHaptic(30);
    if (!poll) return;
    const newOptions = [...localPollOptions];
    let newTotal = localTotalVotes;
    if (userVote === originalIndex) {
      newOptions[originalIndex] = { ...newOptions[originalIndex], votes: Math.max(0, newOptions[originalIndex].votes - 1) };
      newTotal = Math.max(0, newTotal - 1);
      setUserVote(null);
    } else {
      if (userVote !== null) { newOptions[userVote] = { ...newOptions[userVote], votes: Math.max(0, newOptions[userVote].votes - 1) }; newTotal -= 1; }
      newOptions[originalIndex] = { ...newOptions[originalIndex], votes: newOptions[originalIndex].votes + 1 };
      newTotal += 1;
      setUserVote(originalIndex);
    }
    setLocalPollOptions(newOptions);
    setLocalTotalVotes(newTotal);
  };

  const rankedPollOptions = useMemo(() => {
    if (!poll) return [];
    return localPollOptions
      .map((option, idx) => ({ ...option, originalIndex: idx }))
      .sort((a, b) => b.votes - a.votes);
  }, [localPollOptions, poll]);

  const handleReelClick = (e: React.MouseEvent) => {
    if (isSensitiveNode) { setIsRevealedManually(true); return; }
    if (isHiddenByLock) { handleUnlock(); return; }
    e.stopPropagation();
    triggerHaptic(15);
    if (isCampaign) {
      handleCampaignAction();
    } else {
      router.push(`/reels?id=${id}`);
    }
  };

  const handleGiftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(30);
    openGiftHub(user as any);
  };

  const renderContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const segments = text.split(/(\*\*.*?\*\*|_.*?_|`.*?`)/g);
    
    return segments.map((segment, i) => {
      if (segment.startsWith('**') && segment.endsWith('**')) return <strong key={i}>{segment.slice(2, -2)}</strong>;
      const parts = segment.split(urlRegex);
      return parts.map((part, j) => {
        if (part.match(urlRegex)) {
          return (
            <button 
              key={`${i}-${j}`} 
              className="text-[#6E96FF] font-bold underline decoration-2 underline-offset-2 hover:opacity-80 transition-opacity inline-flex items-center gap-1" 
              onClick={(e) => { 
                e.stopPropagation(); 
                triggerHaptic(5); 
                window.open(part, '_blank'); 
              }}
            >
              <LinkIcon className="h-3 w-3" />
              {part}
            </button>
          );
        }
        return part;
      });
    });
  };

  if (isHidden) return null;

  const displayedContent = content.length > TRUNCATE_LIMIT && !isExpanded ? content.slice(0, TRUNCATE_LIMIT) + "..." : content;

  const VerificationBadge = ({ size = "h-3 w-3" }: { size?: string }) => (
    <CheckCircle2 className={cn(size, "text-primary fill-primary text-white shrink-0")} />
  );

  return (
    <>
      <Card ref={cardRef} className={cn(
        "border-none shadow-sm overflow-hidden mb-4 transition-colors relative ring-1 ring-black/5 dark:ring-white/5",
        isShared ? "bg-secondary/20 shadow-none ring-0 border border-primary/10 rounded-2xl" : "bg-white dark:bg-card",
        isCampaign && "border-2 border-primary/20 shadow-xl shadow-primary/5",
        isBoosted && !isShared && "ring-2 ring-primary/20 shadow-lg shadow-primary/5"
      )}>
        {isPinned && !isShared && <div className="absolute top-0 right-0 z-10 p-1 px-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-bl-lg flex items-center gap-1 shadow-md"><Pin className="h-2 w-2 fill-current" /> {t('post_pin').split(' ')[0]}</div>}
        
        {isBoosted && !isShared && (
          <div className="absolute top-0 left-0 z-10 p-1 px-3 bg-gradient-to-r from-primary to-accent text-white text-[8px] font-black uppercase tracking-widest rounded-br-lg flex items-center gap-1.5 shadow-md">
            <Zap className="h-2.5 w-2.5 fill-current animate-pulse" />
            {t('boost_active')}
          </div>
        )}

        <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 p-3", isShared ? "pb-1" : "bg-white dark:bg-card")}>
          <div className="flex items-center gap-2">
            <Link href={isCampaign ? "#" : `/profile/${user.username}`}><Avatar className={cn("border border-primary/10 hover:opacity-80 transition-opacity", isShared ? "h-7 w-7" : "h-10 w-10")}><AvatarImage src={isCampaign ? "/icon.svg" : user.avatar} /><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar></Link>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex items-center gap-1">
                  <Link href={isCampaign ? "#" : `/profile/${user.username}`} className={cn("font-bold text-foreground hover:underline", isShared ? "text-xs" : "text-sm")}>{user.name}</Link>
                  {effectiveIsVerified && <VerificationBadge size={isShared ? "h-2.5 w-2.5" : "h-3 w-3"} />}
                  {isCampaign && <Badge className="bg-primary text-white border-none text-[8px] font-black h-4 px-1.5 rounded ml-1 uppercase">{t('post_global_node')}</Badge>}
                </div>
                {!isShared && collaborator && <div className="flex items-center gap-1"><span className="text-xs text-muted-foreground">and</span><Link href={`/profile/${collaborator.username}`} className="font-bold text-sm text-foreground hover:underline">{collaborator.name}</Link>{collaborator.isVerified && <VerificationBadge />}</div>}
                {!isShared && feeling && <span className="text-xs text-muted-foreground">— is {feeling.emoji} {feeling.text}</span>}
                {!isShared && location && <span className="text-xs text-muted-foreground">— in <span className="font-bold text-foreground">{location}</span></span>}
              </div>
              {!isShared && <div className="flex items-center gap-1 text-[11px] text-muted-foreground"><span>{time === "Just now" ? t('post_now') : time}</span><span>•</span><Badge variant="ghost" className="p-0 h-auto font-normal text-[10px] uppercase">{isCampaign ? t('post_global_node') : t('post_public')}</Badge></div>}
            </div>
          </div>
          
          {!isShared && !isCampaign && (
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className={cn("h-8 w-8 rounded-full", isBookmarked && "text-primary")} onClick={handleSave}><Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} /></Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full"><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
                  <DropdownMenuItem className="gap-2" onClick={() => setIsHidden(true)}><EyeOff className="h-4 w-4" />{t('post_hide')}</DropdownMenuItem>
                  {isOwner && <DropdownMenuItem className="gap-2" onClick={() => { triggerHaptic(); togglePinPost(id); }}><Pin className="h-4 w-4" />{isPinned ? t('post_unpin') : t('post_pin')}</DropdownMenuItem>}
                  {!isOwner && <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => toast({ title: "Report Sent", description: "This node has been flagged for audit." })}><Flag className="h-4 w-4" />{t('post_report')}</DropdownMenuItem>}
                  {isOwner && <><DropdownMenuSeparator /><DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onSelect={() => setIsDeleteDialogOpen(true)}><Trash2 className="h-4 w-4" />{t('post_purge')}</DropdownMenuItem></>}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardHeader>

        <CardContent className={cn("px-3 pb-2 space-y-2 relative", theme && !isShared ? theme + " py-12 px-8 text-center" : "bg-transparent")}>
          {isHiddenByLock ? (
            <div className="relative min-h-[380px] w-full rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center p-8 bg-secondary/20">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-3xl" />
              {image && !settings.isFreeMode && <Image src={image} alt="Locked" fill className="object-cover opacity-20 blur-xl" />}
              <div className="relative z-10 flex flex-col items-center text-center space-y-5 animate-in zoom-in duration-500">
                <div className="h-16 w-16 bg-amber-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-amber-500/20">
                  <Lock className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">{t('post_locked_node')}</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest max-w-[240px]">Unlock this exclusive vibe from **{user.name}** to access the hub.</p>
                </div>
                <Button 
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl h-14 px-10 font-black italic uppercase tracking-widest text-sm shadow-xl transition-all active:scale-95 gap-3"
                  onClick={handleUnlock}
                  disabled={isUnlocking}
                >
                  {isUnlocking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 fill-current" />}
                  {t('post_unlock_for')} {unlockPrice} GOLD
                </Button>
                <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                  <ShieldCheck className="h-3 w-3" /> ViMore Handshake Verified
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className={cn("leading-relaxed whitespace-pre-wrap", theme && !isShared ? "text-2xl leading-tight font-black italic uppercase tracking-tighter" : "text-foreground", isShared ? "text-xs" : "text-[13px]")}>
                {renderContent(translatedText || displayedContent)}
              </div>
              
              {!isShared && !isCampaign && (
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  {content.length > TRUNCATE_LIMIT && !isLimitedType && <button onClick={() => setIsExpanded(!isExpanded)} className="text-[13px] font-bold text-primary hover:underline">{isExpanded ? t('post_see_less') : t('post_see_more')}</button>}
                  {showTranslateButton && <button onClick={handleTranslate} disabled={isTranslating} className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors disabled:opacity-50">{isTranslating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}{translatedText ? t('post_see_original') : t('post_translate')}</button>}
                </div>
              )}
              
              {poll && !theme && (
                <div className={cn("mt-3 p-4 rounded-xl border border-primary/10 bg-primary/5 space-y-3", isShared && "p-2 scale-95 origin-top-left")}>
                  <div className="flex items-center justify-between"><h4 className={cn("font-bold", isShared ? "text-xs" : "text-sm")}>{poll.question}</h4>{!isShared && <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[8px] font-black h-4 px-2">RANKED</Badge>}</div>
                  <div className="space-y-2">{(isPollExpanded || isShared ? rankedPollOptions.slice(0, isShared ? 2 : rankedPollOptions.length) : rankedPollOptions.slice(0, 4)).map((option, i) => {
                    const p = localTotalVotes > 0 ? (option.votes / localTotalVotes) * 100 : 0;
                    const isSelected = userVote === option.originalIndex;
                    return <button key={option.originalIndex} onClick={() => !isShared && handleVote(option.originalIndex)} disabled={isShared} className={cn("w-full relative h-10 rounded-lg border overflow-hidden transition-all", isSelected ? "border-primary bg-primary/10" : "border-primary/20 bg-white/40", isShared && "h-8 cursor-default")}><div className={cn("absolute inset-y-0 left-0 transition-all duration-700", isSelected ? "bg-primary/20" : "bg-primary/5")} style={{ width: `${p}%` }} /><div className="absolute inset-0 flex items-center justify-between px-3 text-sm"><div className="flex items-center gap-2"><span className="text-[10px] font-black text-primary/40">#{i + 1}</span><span className={cn("font-medium", isSelected && "text-primary font-bold", isShared && "text-xs")}>{option.text}</span></div><span className={cn("font-black text-primary", isShared ? "text-[10px]" : "text-xs")}>{Math.round(p)}%</span></div></button>;
                  })}</div>
                  {!isShared && <div className="flex items-center justify-between pt-1 border-t border-primary/5"><span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{localTotalVotes.toLocaleString()} {t('post_poll_total_votes')}</span>{rankedPollOptions.length > 4 && <button onClick={() => setIsPollExpanded(!isPollExpanded)} className="text-[10px] font-black text-primary uppercase">{isPollExpanded ? "Collapse" : "View all"}</button>}</div>}
                </div>
              )}

              {allImages.length > 0 && !settings.isFreeMode && (
                <div className={cn("relative mt-2", isShared ? "-mx-1" : "-mx-3 sm:mx-0")}>
                  {allImages.length > 1 && (
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/10 shadow-xl pointer-events-none">
                      <GalleryVerticalEnd className="h-3 w-3 text-white" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{currentSlide + 1}/{allImages.length}</span>
                    </div>
                  )}
                  <Carousel className="w-full" setApi={(api) => {
                    api?.on("select", () => setCurrentSlide(api.selectedScrollSnap()));
                  }}>
                    <CarouselContent>
                      {allImages.map((img, i) => (
                        <CarouselItem key={i}>
                          <div 
                            className={cn("relative aspect-video overflow-hidden rounded-lg cursor-pointer group/img")} 
                            onClick={() => { triggerHaptic(15); if(isSensitiveNode){ setIsRevealedManually(true); return; } if(isCampaign) handleCampaignAction(); else setSelectedImageUrl(img); }}
                          >
                            <Image src={img} alt="Post" fill className={cn("object-cover transition-transform group/img:scale-105", imageFilter, isSensitiveNode && "blur-3xl saturate-50")} />
                            {isSensitiveNode && (
                              <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center p-6 text-center space-y-3">
                                <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"><EyeOff className="h-6 w-6" /></div>
                                <div className="space-y-1">
                                  <p className="text-sm font-black italic uppercase tracking-widest text-white">Sensitive Vibe</p>
                                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">AI Filter Handshake Active</p>
                                </div>
                                <Button className="h-9 px-6 bg-white text-black font-black uppercase text-[10px] rounded-xl hover:bg-white/90">Reveal Node</Button>
                              </div>
                            )}
                            {isCampaign && !isSensitiveNode && (
                              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white">
                                  <ExternalLink className="h-6 w-6" />
                                </div>
                              </div>
                            )}
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
              )}
              
              {videoUrl && !settings.isFreeMode && (
                <div 
                  className={cn("relative mt-2 rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center cursor-pointer group/vid", isShared ? "-mx-1" : "-mx-3 sm:mx-0")} 
                  onClick={handleReelClick}
                >
                  <video 
                    src={videoUrl} 
                    className={cn("w-full h-full object-cover", isSensitiveNode && "blur-3xl opacity-40")} 
                    controls={false} 
                    playsInline 
                    muted={isShared} 
                    autoPlay={isShared} 
                    loop={isShared} 
                  />
                  {isSensitiveNode ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"><EyeOff className="h-7 w-7" /></div>
                      <div className="space-y-1">
                        <p className="text-base font-black italic uppercase tracking-widest text-white">Sensitive Reel</p>
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">Handshake required to reveal</p>
                      </div>
                      <Button className="h-10 px-8 bg-white text-black font-black uppercase text-[10px] rounded-2xl">Sync Visual</Button>
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/vid:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="p-4 bg-primary/20 backdrop-blur-md rounded-full border border-primary/30 text-white shadow-2xl">
                          <Play className="h-8 w-8 fill-current" />
                        </div>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1.5 border border-white/10">
                        <Video className="h-3 w-3 text-white" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{isCampaign ? "Sync Vibe" : "Open Reel"}</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {isCampaign && actionUrl && !isSensitiveNode && (
                <div className="mt-4">
                  <Button 
                    className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black italic uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 transition-all active:scale-95 gap-3"
                    onClick={handleCampaignAction}
                  >
                    <Zap className="h-4 w-4 fill-current" />
                    {actionLabel || "LAUNCH PULSE"}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {sharedPost && !isShared && <div className="mt-4"><PostCard {...sharedPost} isShared={true} /></div>}
            </>
          )}
        </CardContent>

        {!isShared && !isCampaign && (
          <CardFooter className="p-1 px-3 flex flex-col gap-1 relative bg-white dark:bg-card">
            {isOwner && (
              <div className="w-full mb-2">
                {isBoosted ? (
                  <div className="bg-primary/10 rounded-xl p-3 flex flex-col gap-2 border border-primary/20 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">{t('boost_active')}</span>
                      <span className="text-[9px] font-black text-primary/60 uppercase tracking-widest">
                        {boostCurrentViews?.toLocaleString() || 0} / {boostTargetViews?.toLocaleString()} {t('boost_views_reached').split(' ')[0]}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                      <div className="h-full bg-primary animate-pulse" style={{ width: `${Math.min(((boostCurrentViews || 0) / (boostTargetViews || 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                ) : (
                  <BoostPortal nodeId={id} type={videoUrl ? 'REEL' : 'POST'}>
                    <Button variant="outline" className="w-full h-9 rounded-xl border-dashed border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 transition-all gap-2 group">
                      <Rocket className="h-3 w-3 group-hover:animate-bounce" />
                      {t('boost_title')}
                    </Button>
                  </BoostPortal>
                )}
              </div>
            )}

            <div className="px-1 pt-2 pb-1 flex items-center justify-between w-full text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/50 border-t border-primary/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {isEligibleForGift && !isOwner && !isHiddenByLock && <button onClick={handleGiftClick} className="absolute -top-6 left-1/2 -translate-x-1/2 p-1.5 bg-primary rounded-full text-white shadow-lg animate-shake-vibe z-20"><Gift className="h-3.5 w-3.5" /></button>}
                  <span className={cn("flex items-center gap-1.5 transition-colors", isLiked && "text-primary")}><ThumbsUp className={cn("h-3 w-3", isLiked && "fill-current")} />{(likes ?? 0).toLocaleString()}</span>
                </div>
                <span className={cn("flex items-center gap-1.5 transition-colors", isUnliked && "text-destructive")}><ThumbsDown className={cn("h-3 w-3", isUnliked && "fill-current")} />{(unlikes ?? 0).toLocaleString()}</span>
                <span className="flex items-center gap-1.5"><Eye className="h-3 w-3" />{(views ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors" onClick={() => !isHiddenByLock && openCommentHub(id)}><MessageCircle className="h-3 w-3" />{(comments ?? 0).toLocaleString()}</span>
                <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors" onClick={() => !isHiddenByLock && setIsShareHubOpen(true)}><Share2 className="h-3 w-3" />{(shares ?? 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1 w-full pt-1">
              <button className={cn("flex-1 flex items-center justify-center gap-2 rounded-md h-9 font-bold text-xs transition-all hover:bg-secondary", isLiked ? "text-primary bg-primary/5" : "text-muted-foreground")} onClick={handleLike} disabled={isHiddenByLock}><ThumbsUp className={cn("h-4 w-4", isLiked && "fill-current")} /> {t('post_like')}</button>
              <button className={cn("flex-1 flex items-center justify-center gap-2 rounded-md h-9 font-bold text-xs transition-all hover:bg-secondary", isUnliked ? "text-destructive bg-destructive/5" : "text-muted-foreground")} onClick={handleUnlike} disabled={isHiddenByLock}><ThumbsDown className={cn("h-4 w-4", isUnliked && "fill-current")} /> {t('post_unlike')}</button>
              <button className="flex-1 flex items-center justify-center gap-2 rounded-md h-9 font-bold text-xs text-muted-foreground hover:bg-secondary" onClick={() => !isHiddenByLock && openCommentHub(id)} disabled={commentsDisabled || isHiddenByLock}><MessageCircle className="h-4 w-4" /> {t('post_comment')}</button>
              <button className="flex-1 flex items-center justify-center gap-2 rounded-md h-9 font-bold text-xs text-muted-foreground hover:bg-secondary" onClick={() => { if(!isHiddenByLock){ triggerHaptic(10); setIsShareHubOpen(true); } else { handleUnlock(); } }}><Share2 className="h-4 w-4" /> {t('post_share')}</button>
            </div>
          </CardFooter>
        )}

        {isCampaign && (
          <CardFooter className="p-3 bg-primary/5 flex items-center justify-center">
            <p className="text-[9px] font-black text-primary/40 uppercase tracking-[0.4em]">Official ViMore Pulse • Trusted Node</p>
          </CardFooter>
        )}
      </Card>

      <ShareHub isOpen={isShareHubOpen} onClose={() => setIsShareHubOpen(false)} post={props} />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] sm:max-w-[420px]"><AlertDialogHeader><div className="mx-auto h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-4"><Trash2 className="h-8 w-8" /></div><AlertDialogTitle className="font-black italic uppercase tracking-tighter text-3xl text-center">{t('post_purge')}?</AlertDialogTitle><AlertDialogDescription className="text-base font-medium leading-relaxed text-center px-4">This action is permanent and will remove this signature from the ViMore network.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6"><AlertDialogCancel className="rounded-xl h-12 font-bold bg-secondary/50 border-none">Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="rounded-xl h-12 font-black italic uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20">Confirm Purge</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </>
  );
}
