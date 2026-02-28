
"use client";

import { useState, useMemo, useEffect } from "react";
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
  Gift
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn, parseFollowerCount } from "@/lib/utils";
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
import { aiTranslatePost } from "@/app/actions/ai";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useNotifications } from "@/context/NotificationContext";
import { ShareHub } from "./share-hub";
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
  time: string;
  hashtags?: string[];
  feeling?: { emoji: string; text: string };
  location?: string;
  themeClass?: string;
  commentsDisabled?: boolean;
  isPinned?: boolean;
  isSeries?: boolean;
  seriesTitle?: string;
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
}

export function PostCard(props: PostCardProps) {
  const { 
    id, user, collaborator, content, image, images = [], imageFilter, theme, language,
    likes = 0, unlikes = 0, comments = 0, shares = 0, time, hashtags, feeling, commentsDisabled, isPinned, 
    isSeries, seriesTitle, poll, isShared = false, videoUrl, sharedPost
  } = props;

  const { 
    currentUser, isPostLiked, isPostUnliked, isPostSaved, toggleLikePost, toggleUnlikePost, toggleSavePost, archivePost, togglePinPost, deletePost, openCommentHub, setSelectedImageUrl, openGiftHub
  } = usePosts();

  const { addSignal } = useNotifications();
  const { triggerHaptic } = useMusic();
  const router = useRouter();

  const isLiked = isPostLiked(id);
  const isUnliked = isPostUnliked(id);
  const isBookmarked = isPostSaved(id);
  const isOwner = user.username === currentUser.username;
  
  const effectiveIsVerified = isOwner ? currentUser.isVerified : user.isVerified;
  const isEligibleForGift = parseFollowerCount(user.followers) > 1000;

  const [isExpanded, setIsExpanded] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [viewerLanguage, setViewerLanguage] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareHubOpen, setIsShareHubOpen] = useState(false);

  const [userVote, setUserVote] = useState<number | null>(null);
  const [localPollOptions, setLocalPollOptions] = useState(poll?.options || []);
  const [localTotalVotes, setLocalTotalVotes] = useState(poll?.totalVotes || 0);
  const [isPollExpanded, setIsPollExpanded] = useState(false);

  const { toast } = useToast();

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
  const isLimitedType = useMemo(() => !!theme || allImages.length > 0 || !!videoUrl || !!poll, [theme, allImages, videoUrl, poll]);
  const isLongContent = useMemo(() => content.length > TRUNCATE_LIMIT && !isLimitedType, [content, isLimitedType]);

  const showTranslateButton = useMemo(() => {
    if (!language || !viewerLanguage || isShared) return false;
    if (language === viewerLanguage) return false;
    if (content.length < 5) return false;
    return true;
  }, [language, viewerLanguage, content, isShared]);

  const handleLike = () => { 
    triggerHaptic(20); 
    const wasLiked = isLiked;
    toggleLikePost(id); 
    
    if (!wasLiked && !isOwner && !isShared) {
      addSignal({
        type: 'SOCIAL',
        title: 'New Vibe Pulse',
        content: `**${currentUser.name}** liked your post: "${content.slice(0, 30)}..."`,
        avatar: currentUser.avatar
      });
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
      const result = await aiTranslatePost({ postContent: content, targetLanguage: viewerLanguage || "English" });
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
    e.stopPropagation();
    triggerHaptic(15);
    router.push(`/reels?id=${id}`);
  };

  const handleGiftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(30);
    openGiftHub(user as any);
  };

  const renderContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const boldItalicRegex = /(\*\*.*?\*\*|_.*?_|`.*?`)/g;
    const segments = text.split(boldItalicRegex);
    
    return segments.map((segment, i) => {
      if (segment.startsWith('**') && segment.endsWith('**')) return <strong key={i}>{segment.slice(2, -2)}</strong>;
      if (segment.startsWith('_') && segment.endsWith('_')) return <em key={i}>{segment.slice(1, -1)}</em>;
      if (segment.startsWith('`') && segment.endsWith('`')) return <code key={i} className="bg-secondary/30 px-1 rounded text-sm font-mono">{segment.slice(1, -1)}</code>;
      
      const parts = segment.split(urlRegex);
      return parts.map((part, j) => {
        if (part.match(urlRegex)) {
          return (
            <a 
              key={`${i}-${j}`} 
              href={part} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#6E96FF] font-bold underline decoration-2 underline-offset-2 hover:opacity-80 transition-opacity inline-flex items-center gap-1"
              onClick={(e) => { e.stopPropagation(); triggerHaptic(5); }}
            >
              <LinkIcon className="h-3 w-3" />
              {part}
            </a>
          );
        }
        return part;
      });
    });
  };

  if (isHidden) return null;

  const displayedContent = isLongContent && !isExpanded ? content.slice(0, TRUNCATE_LIMIT) + "..." : content;

  const VerificationBadge = ({ size = "h-3 w-3" }: { size?: string }) => (
    <CheckCircle2 className={cn(size, "text-primary fill-primary text-white shrink-0")} />
  );

  return (
    <>
      <Card className={cn(
        "border-none shadow-sm overflow-hidden mb-4 transition-colors relative ring-1 ring-black/5 dark:ring-white/5",
        isShared ? "bg-secondary/20 shadow-none ring-0 border border-primary/10 rounded-2xl" : "bg-white dark:bg-card"
      )}>
        {isPinned && !isShared && (
          <div className="absolute top-0 right-0 z-10 p-1 px-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-bl-lg flex items-center gap-1 shadow-md">
            <Pin className="h-2 w-2 fill-current" /> Pinned
          </div>
        )}
        
        <CardHeader className={cn(
          "flex flex-row items-center justify-between space-y-0 p-3",
          isShared ? "pb-1" : "bg-white dark:bg-card"
        )}>
          <div className="flex items-center gap-2">
            <Link href={`/profile/${user.username}`}>
              <Avatar className={cn(
                "border border-primary/10 hover:opacity-80 transition-opacity",
                isShared ? "h-7 w-7" : "h-10 w-10"
              )}>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="flex items-center gap-1">
                  <Link href={`/profile/${user.username}`} className={cn("font-bold text-foreground hover:underline", isShared ? "text-xs" : "text-sm")}>{user.name}</Link>
                  {effectiveIsVerified && <VerificationBadge size={isShared ? "h-2.5 w-2.5" : "h-3 w-3"} />}
                </div>
                {!isShared && collaborator && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">and</span>
                    <Link href={`/profile/${collaborator.username}`} className="font-bold text-sm text-foreground hover:underline">{collaborator.name}</Link>
                    {collaborator.isVerified && <VerificationBadge />}
                  </div>
                )}
                {!isShared && feeling && <span className="text-xs text-muted-foreground">— is {feeling.emoji} {feeling.text}</span>}
              </div>
              {!isShared && (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span>{time}</span>
                  <span>•</span>
                  <Badge variant="ghost" className="p-0 h-auto font-normal text-[10px]">Public</Badge>
                </div>
              )}
            </div>
          </div>
          
          {!isShared && (
            <div className="flex items-center gap-0.5">
              <Button variant="ghost" size="icon" className={cn("h-8 w-8 rounded-full", isBookmarked && "text-primary")} onClick={handleSave}><Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} /></Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full"><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
                  <DropdownMenuItem className="gap-2" onClick={() => setIsHidden(true)}><EyeOff className="h-4 w-4" />Hide post</DropdownMenuItem>
                  <DropdownMenuItem className="gap-2" onClick={() => { triggerHaptic(); togglePinPost(id); }}><Pin className="h-4 w-4" />{isPinned ? "Unpin" : "Pin to profile"}</DropdownMenuItem>
                  {isOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onSelect={() => setIsDeleteDialogOpen(true)}><Trash2 className="h-4 w-4" />Purge Node</DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardHeader>

        <CardContent className={cn(
          "px-3 pb-2 space-y-2", 
          theme && !isShared ? theme + " py-12 px-8 text-center" : "bg-transparent"
        )}>
          <div className={cn(
            "leading-relaxed whitespace-pre-wrap", 
            theme && !isShared ? "text-2xl leading-tight font-black italic uppercase tracking-tighter" : "text-foreground",
            isShared ? "text-xs" : "text-[13px]"
          )}>
            {renderContent(translatedText || displayedContent)}
          </div>
          
          {!isShared && (
            <div className="flex flex-wrap items-center gap-3 mt-1">
              {isLongContent && <button onClick={() => setIsExpanded(!isExpanded)} className="text-[13px] font-bold text-primary hover:underline">{isExpanded ? "Show less" : "See more"}</button>}
              
              {showTranslateButton && (
                <button 
                  onClick={handleTranslate} 
                  disabled={isTranslating}
                  className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors disabled:opacity-50"
                >
                  {isTranslating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Languages className="h-3.5 w-3.5" />
                  )}
                  {translatedText ? "See Original" : "Translate Vibe"}
                </button>
              )}
            </div>
          )}
          
          {poll && !theme && (
            <div className={cn(
              "mt-3 p-4 rounded-xl border border-primary/10 bg-primary/5 space-y-3",
              isShared && "p-2 scale-95 origin-top-left"
            )}>
              <div className="flex items-center justify-between">
                <h4 className={cn("font-bold", isShared ? "text-xs" : "text-sm")}>{poll.question}</h4>
                {!isShared && <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[8px] font-black h-4 px-2">RANKED</Badge>}
              </div>
              <div className="space-y-2">
                {(isPollExpanded || isShared ? rankedPollOptions.slice(0, isShared ? 2 : rankedPollOptions.length) : rankedPollOptions.slice(0, 4)).map((option, i) => {
                  const p = localTotalVotes > 0 ? (option.votes / localTotalVotes) * 100 : 0;
                  const isSelected = userVote === option.originalIndex;
                  return (
                    <button 
                      key={option.originalIndex} 
                      onClick={() => !isShared && handleVote(option.originalIndex)} 
                      disabled={isShared}
                      className={cn(
                        "w-full relative h-10 rounded-lg border overflow-hidden transition-all", 
                        isSelected ? "border-primary bg-primary/10" : "border-primary/20 bg-white/40",
                        isShared && "h-8 cursor-default"
                      )}
                    >
                      <div className={cn("absolute inset-y-0 left-0 transition-all duration-700", isSelected ? "bg-primary/20" : "bg-primary/5")} style={{ width: `${p}%` }} />
                      <div className="absolute inset-0 flex items-center justify-between px-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-primary/40">#{i + 1}</span>
                          <span className={cn("font-medium", isSelected && "text-primary font-bold", isShared && "text-xs")}>{option.text}</span>
                        </div>
                        <span className={cn("font-black text-primary", isShared ? "text-[10px]" : "text-xs")}>{Math.round(p)}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {!isShared && (
                <div className="flex items-center justify-between pt-1 border-t border-primary/5">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{localTotalVotes.toLocaleString()} Total Votes</span>
                  {rankedPollOptions.length > 4 && <button onClick={() => setIsPollExpanded(!isPollExpanded)} className="text-[10px] font-black text-primary uppercase">{isPollExpanded ? "Collapse" : "View all"}</button>}
                </div>
              )}
            </div>
          )}

          {allImages.length > 0 && (
            <div className={cn("relative mt-2", isShared ? "-mx-1" : "-mx-3 sm:mx-0")}>
              <Carousel className="w-full">
                <CarouselContent>
                  {allImages.map((img, i) => (
                    <CarouselItem key={i}>
                      <div 
                        className={cn("relative aspect-video overflow-hidden rounded-lg cursor-pointer group/img")}
                        onClick={() => { triggerHaptic(15); setSelectedImageUrl(img); }}
                      >
                        <Image src={img} alt="Post" fill className={cn("object-cover transition-transform group-hover/img:scale-105", imageFilter)} />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white">
                            <PlusSquare className="h-6 w-6" />
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          )}
          
          {videoUrl && (
            <div 
              className={cn(
                "relative mt-2 rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center cursor-pointer group/vid",
                isShared ? "-mx-1" : "-mx-3 sm:mx-0"
              )}
              onClick={handleReelClick}
            >
              <video src={videoUrl} className="w-full h-full object-cover" controls={false} playsInline muted={isShared} autoPlay={isShared} loop={isShared} />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/vid:opacity-100 transition-opacity flex items-center justify-center">
                <div className="p-4 bg-primary/20 backdrop-blur-md rounded-full border border-primary/30 text-white shadow-2xl">
                  <Play className="h-8 w-8 fill-current" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1.5 border border-white/10">
                <Video className="h-3 w-3 text-white" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Open Reel</span>
              </div>
            </div>
          )}

          {sharedPost && !isShared && (
            <div className="mt-4">
              <PostCard {...sharedPost} isShared={true} />
            </div>
          )}
        </CardContent>

        {!isShared && (
          <CardFooter className="p-1 px-3 flex flex-col gap-1 relative bg-white dark:bg-card">
            <div className="px-1 pt-2 pb-1 flex items-center justify-between w-full text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/50 border-t border-primary/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {isEligibleForGift && (
                    <button 
                      onClick={handleGiftClick}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 p-1.5 bg-primary rounded-full text-white shadow-lg animate-shake-vibe z-20"
                    >
                      <Gift className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <span className={cn("flex items-center gap-1.5 transition-colors", isLiked && "text-primary")}>
                    <ThumbsUp className={cn("h-3 w-3", isLiked && "fill-current")} />
                    {((likes ?? 0) + (isLiked ? 1 : 0)).toLocaleString()}
                  </span>
                </div>
                <span className={cn("flex items-center gap-1.5 transition-colors", isUnliked && "text-destructive")}>
                  <ThumbsDown className={cn("h-3 w-3", isUnliked && "fill-current")} />
                  {((unlikes ?? 0) + (isUnliked ? 1 : 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors" onClick={() => openCommentHub(id)}>
                  <MessageCircle className="h-3 w-3" />
                  {(comments ?? 0).toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors" onClick={() => setIsShareHubOpen(true)}>
                  <Share2 className="h-3 w-3" />
                  {(shares ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-1 w-full pt-1">
              <button 
                className={cn("flex-1 flex items-center justify-center gap-2 rounded-md h-9 font-bold text-xs transition-all hover:bg-secondary", isLiked ? "text-primary bg-primary/5" : "text-muted-foreground")} 
                onClick={handleLike}
              >
                <ThumbsUp className={cn("h-4 w-4", isLiked && "fill-current")} /> Like
              </button>
              <button 
                className={cn("flex-1 flex items-center justify-center gap-2 rounded-md h-9 font-bold text-xs transition-all hover:bg-secondary", isUnliked ? "text-destructive bg-destructive/5" : "text-muted-foreground")} 
                onClick={handleUnlike}
              >
                <ThumbsDown className={cn("h-4 w-4", isUnliked && "fill-current")} /> Dislike
              </button>
              <button 
                className="flex-1 flex items-center justify-center gap-2 rounded-md h-9 font-bold text-xs text-muted-foreground hover:bg-secondary" 
                onClick={() => openCommentHub(id)} 
                disabled={commentsDisabled}
              >
                <MessageCircle className="h-4 w-4" /> Comment
              </button>
              <button 
                className="flex-1 flex items-center justify-center gap-2 rounded-md h-9 font-bold text-xs text-muted-foreground hover:bg-secondary"
                onClick={() => { triggerHaptic(10); setIsShareHubOpen(true); }}
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </CardFooter>
        )}
      </Card>

      <ShareHub 
        isOpen={isShareHubOpen} 
        onClose={() => setIsShareHubOpen(false)} 
        post={props} 
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] sm:max-w-[400px]">
          <AlertDialogHeader>
            <div className="mx-auto h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-4">
              <Trash2 className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="font-black italic uppercase tracking-tighter text-3xl text-center">Purge Node?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium leading-relaxed text-center px-4">
              This action is permanent and will remove this signature from the ViMore network.
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
