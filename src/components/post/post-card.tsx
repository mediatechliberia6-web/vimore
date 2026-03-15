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
  Rocket,
  UserRoundPlus,
  UserRoundCheck,
  UserPlus,
  Check,
  UserRoundX
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
    voters?: Record<string, number>;
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
    currentUser, isPostLiked, isPostUnliked, isPostSaved, isPostUnlocked, toggleLikePost, toggleUnlikePost, toggleSavePost, archivePost, togglePinPost, deletePost, openCommentHub, setSelectedPostId, setSelectedImageUrl, openGiftHub, unlockPost, voteOnPostPoll, settings, recordCampaignClick, recordView, isFriend, isRequestSent, isRequestReceived, sendFriendRequest, confirmFriendRequest, cancelFriendRequest, unfriendUser
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
  
  const amIFriend = isFriend(user.username);
  const sent = isRequestSent(user.username);
  const received = isRequestReceived(user.username);

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
  const [isPollExpanded, setIsPollExpanded] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const hasRecordedView = useRef(false);
  const { toast } = useToast();

  const userVote = useMemo(() => {
    if (!poll || !poll.voters) return null;
    return poll.voters[currentUser.username] ?? null;
  }, [poll, currentUser.username]);

  const rankedPollOptions = useMemo(() => {
    if (!poll) return [];
    return [...poll.options]
      .map((option, idx) => ({ ...option, originalIndex: idx }))
      .sort((a, b) => b.votes - a.votes);
  }, [poll]);

  useEffect(() => {
    if (isShared || isCampaign || hasRecordedView.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting && !hasRecordedView.current) { hasRecordedView.current = true; recordView(id); } });
    }, { threshold: 0.5 });
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [id, isShared, isCampaign, recordView]);

  useEffect(() => { if (typeof window !== 'undefined') setViewerLanguage(window.navigator.language.split('-')[0]); }, []);

  const allImages = useMemo(() => {
    const list = [...images];
    if (image && !list.includes(image)) list.unshift(image);
    return list;
  }, [image, images]);

  const TRUNCATE_LIMIT = 150;
  const isLimitedType = useMemo(() => !!theme || allImages.length > 0 || !!videoUrl || !!poll || !!isLocked, [theme, allImages, videoUrl, poll, isLocked]);
  const isLongContent = useMemo(() => content.length > TRUNCATE_LIMIT && !isLimitedType, [content.length, isLimitedType]);

  const isSensitiveNode = settings.isSensitivityFilterActive && !isRevealedManually && !isOwner && !isCampaign && (allImages.length > 0 || !!videoUrl);

  const handleLike = () => { triggerHaptic(20); toggleLikePost(id); };
  const handleUnlike = () => { triggerHaptic(15); toggleUnlikePost(id); };
  const handleSave = () => { triggerHaptic(5); toggleSavePost(id); toast({ description: isBookmarked ? "Removed" : "Noted ✨" }); };

  const handleHandshakeAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (amIFriend) unfriendUser(user.username);
    else if (sent) cancelFriendRequest(user.username);
    else if (received) confirmFriendRequest(user.username);
    else sendFriendRequest(user.username);
  };

  const renderHandshakeButton = () => {
    if (isOwner || isCampaign || isShared) return null;
    
    let label = t('friends_add_friend');
    let variant: "default" | "outline" | "secondary" = "default";
    let Icon = UserRoundPlus;

    if (amIFriend) {
      label = "Friends";
      variant = "secondary";
      Icon = UserRoundCheck;
    } else if (sent) {
      label = t('friends_request_sent');
      variant = "outline";
      Icon = Check;
    } else if (received) {
      label = t('friends_confirm').split(' ')[0];
      variant = "default";
      Icon = UserPlus;
    }

    return (
      <Button 
        size="sm" 
        variant={variant}
        className={cn(
          "h-7 px-3 rounded-full text-[9px] font-black uppercase tracking-widest gap-1.5 transition-all group/hs",
          variant === "default" && "bg-primary text-white hover:bg-primary/90",
          (amIFriend || sent) && "hover:bg-destructive hover:text-white hover:border-destructive"
        )}
        onClick={handleHandshakeAction}
      >
        <span className={cn((amIFriend || sent) && "group-hover/hs:hidden")}>
          <Icon className="h-3 w-3" /> {label}
        </span>
        {(amIFriend || sent) && (
          <span className="hidden group-hover/hs:inline flex items-center gap-1">
            <UserRoundX className="h-3 w-3" /> {amIFriend ? "Unfriend" : "Cancel"}
          </span>
        )}
      </Button>
    );
  };

  return (
    <>
      <Card ref={cardRef} className={cn(
        "border-none shadow-sm overflow-hidden mb-4 transition-colors relative ring-1 ring-black/5 dark:ring-white/5",
        isShared ? "bg-secondary/20 shadow-none ring-0 border border-primary/10 rounded-2xl" : "bg-white dark:bg-card",
        isCampaign && "border-2 border-primary/20 shadow-xl shadow-primary/5",
        isBoosted && !isShared && "ring-2 ring-primary/20 shadow-lg shadow-primary/5"
      )}>
        {isPinned && !isShared && <div className="absolute top-0 right-0 z-10 p-1 px-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-bl-lg flex items-center gap-1 shadow-md"><Pin className="h-2 w-2 fill-current" /> {t('post_pin').split(' ')[0]}</div>}
        {isBoosted && !isShared && <div className="absolute top-0 left-0 z-10 p-1 px-3 bg-gradient-to-r from-primary to-accent text-white text-[8px] font-black uppercase tracking-widest rounded-br-lg flex items-center gap-1.5 shadow-md"><Zap className="h-2.5 w-2.5 fill-current animate-pulse" />{t('boost_active')}</div>}

        <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 p-3", isShared ? "pb-1" : "bg-white dark:bg-card")}>
          <div className="flex items-center gap-2">
            <Link href={isCampaign ? "#" : `/profile/${user.username}`}><Avatar className={cn("border border-primary/10 hover:opacity-80 transition-opacity", isShared ? "h-7 w-7" : "h-10 w-10")}><AvatarImage src={isCampaign ? "/icon.svg" : user.avatar} /><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar></Link>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex items-center gap-1">
                  <Link href={isCampaign ? "#" : `/profile/${user.username}`} className={cn("font-bold text-foreground hover:underline", isShared ? "text-xs" : "text-sm")}>{user.name}</Link>
                  {effectiveIsVerified && <CheckCircle2 className="h-3 w-3 text-primary fill-primary text-white" />}
                  {isCampaign && <Badge className="bg-primary text-white border-none text-[8px] font-black h-4 px-1.5 rounded ml-1 uppercase">{t('post_global_node')}</Badge>}
                </div>
                {renderHandshakeButton()}
              </div>
              {!isShared && <div className="flex items-center gap-1 text-[11px] text-muted-foreground"><span>{time === "Just now" ? t('post_now') : time}</span><span>•</span><Badge variant="ghost" className="p-0 h-auto font-normal text-[10px] uppercase">{isCampaign ? t('post_global_node') : t('post_public')}</Badge></div>}
            </div>
          </div>
          
          {!isShared && !isCampaign && (
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className={cn("h-8 w-8 rounded-full", isBookmarked && "text-primary")} onClick={handleSave}><Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} /></Button>
              <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full"><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5"><DropdownMenuItem className="gap-2" onClick={() => setIsHidden(true)}><EyeOff className="h-4 w-4" />{t('post_hide')}</DropdownMenuItem>{isOwner && <DropdownMenuItem className="gap-2" onClick={() => { triggerHaptic(); togglePinPost(id); }}><Pin className="h-4 w-4" />{isPinned ? t('post_unpin') : t('post_pin')}</DropdownMenuItem>}{!isOwner && <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => toast({ title: "Report Sent" })}><Flag className="h-4 w-4" />{t('post_report')}</DropdownMenuItem>}{isOwner && <><DropdownMenuSeparator /><DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onSelect={() => setIsDeleteDialogOpen(true)}><Trash2 className="h-4 w-4" />{t('post_purge')}</DropdownMenuItem></>}</DropdownMenuContent></DropdownMenu>
            </div>
          )}
        </CardHeader>

        <CardContent className={cn("px-3 pb-2 space-y-2 relative", theme && !isShared ? theme + " py-12 px-8 text-center" : "bg-transparent")}>
          {isHiddenByLock ? (
            <div className="relative min-h-[380px] w-full rounded-[2.5rem] overflow-hidden flex flex-col items-center justify-center p-8 bg-secondary/20">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-3xl" />
              <div className="relative z-10 flex flex-col items-center text-center space-y-5">
                <div className="h-16 w-16 bg-amber-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl"><Lock className="h-8 w-8" /></div>
                <div className="space-y-2"><h3 className="text-2xl font-black italic uppercase tracking-tighter">{t('post_locked_node')}</h3><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest max-w-[240px]">Unlock this vibe to access the hub.</p></div>
                <Button className="bg-amber-500 hover:bg-amber-600 text-white rounded-2xl h-14 px-10 font-black italic uppercase tracking-widest text-sm shadow-xl active:scale-95 gap-3" onClick={() => unlockPost(id, unlockPrice!)} disabled={isUnlocking}>{isUnlocking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5 fill-current" />}{t('post_unlock_for')} {unlockPrice} GOLD</Button>
              </div>
            </div>
          ) : (
            <>
              <div className={cn("leading-relaxed whitespace-pre-wrap", theme && !isShared ? "text-2xl leading-tight font-black italic uppercase tracking-tighter" : "text-foreground", isShared ? "text-xs" : "text-[13px]")}>{content}</div>
              {poll && !theme && (
                <div className={cn("mt-3 p-4 rounded-xl border border-primary/10 bg-primary/5 space-y-3", isShared && "p-2 scale-95 origin-top-left")}>
                  <div className="flex items-center justify-between"><h4 className={cn("font-bold", isShared ? "text-xs" : "text-sm")}>{poll.question}</h4></div>
                  <div className="space-y-2">{rankedPollOptions.map((option, i) => {
                    const p = poll.totalVotes > 0 ? (option.votes / poll.totalVotes) * 100 : 0;
                    const isSelected = userVote === option.originalIndex;
                    return <button key={option.originalIndex} onClick={() => !isShared && handleVote(option.originalIndex)} className={cn("w-full relative h-10 rounded-lg border overflow-hidden", isSelected ? "border-primary bg-primary/10" : "border-primary/20 bg-white/40")}><div className="absolute inset-y-0 left-0 bg-primary/30 transition-all duration-700" style={{ width: `${p}%` }} /><div className="absolute inset-0 flex items-center justify-between px-3 text-sm"><span className="font-medium">{option.text}</span><span className="font-black text-primary">{Math.round(p)}%</span></div></button>;
                  })}</div>
                </div>
              )}
              {allImages.length > 0 && !settings.isFreeMode && (
                <div className={cn("relative mt-2", isShared ? "-mx-1" : "-mx-3 sm:mx-0")}>
                  {allImages.length > 1 && <div className="absolute top-3 right-3 z-20 bg-black/40 backdrop-blur-md px-2 py-1 rounded-xl border border-white/10 text-white text-[10px] font-black">{currentSlide + 1}/{allImages.length}</div>}
                  <Carousel className="w-full" setApi={(api) => api?.on("select", () => setCurrentSlide(api.selectedScrollSnap()))}><CarouselContent>{allImages.map((img, i) => (<CarouselItem key={i}><div className="relative overflow-hidden rounded-lg cursor-pointer" onClick={() => setSelectedImageUrl(img)}><img src={img} alt="Post" className="w-full h-auto" /></div></CarouselItem>))}</CarouselContent></Carousel>
                </div>
              )}
              {videoUrl && !settings.isFreeMode && (
                <div className={cn("relative mt-2 rounded-lg overflow-hidden bg-black", isShared ? "-mx-1" : "-mx-3 sm:mx-0")} onClick={() => router.push(`/reels?id=${id}`)}>
                  <video src={videoUrl} className="w-full h-auto" playsInline muted={isShared} autoPlay={isShared} loop={isShared} />
                  {!isShared && <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20"><Play className="h-8 w-8 text-white fill-current" /></div>}
                </div>
              )}
            </>
          )}
        </CardContent>

        {!isShared && !isCampaign && (
          <CardFooter className="p-1 px-3 flex flex-col gap-1 relative bg-white dark:bg-card">
            {isOwner && (
              <div className="w-full mb-2">
                {isBoosted ? (
                  <div className="bg-primary/10 rounded-xl p-3 flex flex-col gap-2 border border-primary/20"><div className="flex items-center justify-between"><span className="text-[9px] font-black text-primary uppercase">{t('boost_active')}</span><span className="text-[9px] font-black text-primary/60">{boostCurrentViews?.toLocaleString() || 0} / {boostTargetViews?.toLocaleString()}</span></div><div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden"><div className="h-full bg-primary animate-pulse" style={{ width: `${Math.min(((boostCurrentViews || 0) / (boostTargetViews || 1)) * 100, 100)}%` }} /></div></div>
                ) : (
                  <BoostPortal nodeId={id} type={videoUrl ? 'REEL' : 'POST'}><Button variant="outline" className="w-full h-9 rounded-xl border-dashed border-primary/20 text-primary font-black uppercase text-[10px] gap-2"><Rocket className="h-3 w-3" />{t('boost_title')}</Button></BoostPortal>
                )}
              </div>
            )}
            <div className="px-1 pt-2 pb-1 flex items-center justify-between w-full text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/50 border-t border-primary/5">
              <div className="flex items-center gap-3">
                <span className={cn("flex items-center gap-1.5", isLiked && "text-primary")}><ThumbsUp className={cn("h-3 w-3", isLiked && "fill-current")} />{likes.toLocaleString()}</span>
                <span className={cn("flex items-center gap-1.5", isUnliked && "text-destructive")}><ThumbsDown className={cn("h-3 w-3", isUnliked && "fill-current")} />{unlikes.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors" onClick={() => openCommentHub(id)}><MessageCircle className="h-3 w-3" />{comments.toLocaleString()}</span>
                <span className="flex items-center gap-1.5"><Share2 className="h-3 w-3" />{shares.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-1 w-full pt-1">
              <button className={cn("flex-1 flex items-center justify-center gap-2 rounded-md h-9 font-bold text-xs transition-all", isLiked ? "text-primary bg-primary/5" : "text-muted-foreground")} onClick={handleLike}><ThumbsUp className="h-4 w-4" /> {t('post_like')}</button>
              <button className={cn("flex-1 flex items-center justify-center gap-2 rounded-md h-9 font-bold text-xs transition-all", isUnliked ? "text-destructive bg-destructive/5" : "text-muted-foreground")} onClick={handleUnlike}><ThumbsDown className="h-4 w-4" /> {t('post_unlike')}</button>
              <button className="flex-1 flex items-center justify-center gap-2 rounded-md h-9 font-bold text-xs text-muted-foreground" onClick={() => openCommentHub(id)}><MessageCircle className="h-4 w-4" /> {t('post_comment')}</button>
              <button className="flex-1 flex items-center justify-center gap-2 rounded-md h-9 font-bold text-xs text-muted-foreground" onClick={() => setIsShareHubOpen(true)}><Share2 className="h-4 w-4" /> {t('post_share')}</button>
            </div>
          </CardFooter>
        )}
      </Card>
      <ShareHub isOpen={isShareHubOpen} onClose={() => setIsShareHubOpen(false)} post={props} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}><AlertDialogContent className="rounded-[2rem] sm:max-w-[420px]"><AlertDialogHeader><div className="mx-auto h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-4"><Trash2 className="h-8 w-8" /></div><AlertDialogTitle className="font-black italic uppercase tracking-tighter text-3xl text-center">{t('post_purge')}?</AlertDialogTitle></AlertDialogHeader><AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6"><AlertDialogCancel className="rounded-xl h-12 font-bold bg-secondary/50">Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="rounded-xl h-12 font-black italic uppercase bg-destructive text-white">Confirm Purge</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </>
  );
}
