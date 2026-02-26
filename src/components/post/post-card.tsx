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
  ChevronDown,
  ChevronUp,
  Gift,
  Users2,
  MessageCircleOff,
  Pin,
  Archive,
  GalleryVerticalEnd
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
    followers?: number;
  };
  collaborator?: {
    name: string;
    username: string;
    avatar: string;
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
  time: string;
  hashtags?: string[];
  feeling?: { emoji: string; text: string };
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
}

export function PostCard(props: PostCardProps) {
  const { 
    id, user, collaborator, content, image, images = [], imageFilter, theme, language,
    likes, unlikes, comments, time, hashtags, feeling, commentsDisabled, isPinned, 
    isSeries, seriesTitle, poll, initialComments = [], isShared = false, sharedPost 
  } = props;

  const { 
    currentUser, isPostLiked, isPostUnliked, isPostSaved, toggleLikePost, toggleUnlikePost, toggleSavePost, archivePost, togglePinPost 
  } = usePosts();

  const isLiked = isPostLiked(id);
  const isUnliked = isPostUnliked(id);
  const isBookmarked = isPostSaved(id);

  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const [viewerLanguage, setViewerLanguage] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

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

  const effectiveLikes = isLiked ? likes + 1 : likes;
  const effectiveUnlikes = isUnliked ? unlikes + 1 : unlikes;

  const showTranslateButton = useMemo(() => {
    if (!language || !viewerLanguage) return false;
    if (language === viewerLanguage) return false;
    if (content.length < 5) return false;
    return true;
  }, [language, viewerLanguage, content]);

  const allImages = useMemo(() => {
    const list = [...images];
    if (image && !list.includes(image)) list.unshift(image);
    return list;
  }, [image, images]);

  const triggerHaptic = (intensity = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(intensity);
    }
  };

  const handleLike = () => {
    triggerHaptic(20);
    toggleLikePost(id);
  };

  const handleUnlike = () => {
    triggerHaptic(15);
    toggleUnlikePost(id);
  };

  const handleSave = () => {
    triggerHaptic(5);
    toggleSavePost(id);
    toast({ description: isBookmarked ? "Removed from Vault" : "Saved to Vault ✨" });
  };

  const handleTranslate = async () => {
    triggerHaptic();
    if (translatedText) {
      setTranslatedText(null);
      return;
    }
    setIsTranslating(true);
    try {
      const result = await aiTranslatePost({ postContent: content, targetLanguage: viewerLanguage || "English" });
      setTranslatedText(result.translation);
    } catch (error) {
      toast({ description: "Translation failed", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleVote = (index: number) => {
    triggerHaptic(30);
    if (!poll) return;
    const newOptions = [...localPollOptions];
    let newTotal = localTotalVotes;

    if (userVote === index) {
      newOptions[index] = { ...newOptions[index], votes: newOptions[index].votes - 1 };
      newTotal -= 1;
      setUserVote(null);
    } else {
      if (userVote !== null) {
        newOptions[userVote] = { ...newOptions[userVote], votes: userVote < localPollOptions.length ? localPollOptions[userVote].votes - 1 : 0 };
        newTotal -= 1;
      }
      newOptions[index] = { ...newOptions[index], votes: newOptions[index].votes + 1 };
      newTotal += 1;
      setUserVote(index);
    }
    setLocalPollOptions(newOptions);
    setLocalTotalVotes(newTotal);
  };

  const handleArchiveClick = () => {
    triggerHaptic();
    archivePost(id);
    toast({ title: "Archived", description: "Post moved to your private archives." });
  };

  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|_.*?_|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith('_') && part.endsWith('_')) return <em key={i}>{part.slice(1, -1)}</em>;
      if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="bg-secondary/30 px-1 rounded text-sm font-mono">{part.slice(1, -1)}</code>;
      return part;
    });
  };

  if (isHidden) return null;

  const TRUNCATE_LIMIT = 280;
  const isLongContent = content.length > TRUNCATE_LIMIT;
  const displayedContent = isLongContent && !isExpanded ? content.slice(0, TRUNCATE_LIMIT) + "..." : content;

  const isMe = user.username === currentUser.username;
  const profileHref = isMe ? "/profile" : `/profile/${user.username}`;

  return (
    <Card className={cn(
      "border-none shadow-sm overflow-hidden bg-white dark:bg-card mb-4 transition-colors relative",
      isShared ? "ring-1 ring-primary/10 shadow-none scale-[0.98] mx-2" : "ring-1 ring-black/5 dark:ring-white/5",
      theme && !isShared && "text-white"
    )}>
      {isPinned && !isShared && (
        <div className="absolute top-0 right-0 z-10 p-1 px-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-bl-lg flex items-center gap-1 shadow-md">
          <Pin className="h-2 w-2 fill-current" /> Pinned
        </div>
      )}

      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
        <div className="flex items-center gap-2">
          <Link href={profileHref}>
            <Avatar className="h-10 w-10 border border-primary/10 hover:opacity-80 transition-opacity">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <div className="flex items-center flex-wrap gap-x-1">
                <Link href={profileHref} className="font-bold text-sm hover:underline">{user.name}</Link>
                {collaborator && (
                  <><span className="text-xs text-muted-foreground font-medium">with</span><Link href={collaborator.username === currentUser.username ? '/profile' : `/profile/${collaborator.username}`} className="font-bold text-sm hover:underline">{collaborator.name}</Link></>
                )}
                {feeling && <span className="text-xs text-muted-foreground">— is {feeling.emoji} {feeling.text}</span>}
                {user.isVerified && <CheckCircle2 className="h-3 w-3 text-primary fill-primary text-white" />}
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>{time}</span>
              {!isShared && (
                <>
                  <span>•</span>
                  <Badge variant="ghost" className="p-0 h-auto font-normal text-[10px]">Public</Badge>
                  {isSeries && (
                    <><span className="mx-1">•</span><div className="flex items-center gap-0.5 text-primary font-bold"><GalleryVerticalEnd className="h-2.5 w-2.5" /><span>{seriesTitle || "Curated"}</span></div></>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        {!isShared && (
          <div className="flex items-center gap-0.5">
            <Button 
              variant="ghost" size="icon" className={cn("h-8 w-8 rounded-full", isBookmarked && "text-primary")}
              onClick={handleSave}
            >
              <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full hover:bg-secondary">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setIsHidden(true)}><EyeOff className="h-4 w-4" />Hide post</DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={handleArchiveClick}><Archive className="h-4 w-4" />Archive post</DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => { triggerHaptic(); togglePinPost(id); }}><Pin className="h-4 w-4" />{isPinned ? "Unpin post" : "Pin to profile"}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive"><Flag className="h-4 w-4" />Report post</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardHeader>
      
      <CardContent className={cn("px-3 pb-2 space-y-2", theme && !isShared ? theme + " py-8 px-6 text-center text-xl font-bold" : "")}>
        <div className="space-y-1">
          <div className={cn("text-[13px] leading-relaxed whitespace-pre-wrap", theme && !isShared ? "text-xl leading-snug" : "")}>
            {renderContent(translatedText || displayedContent)}
          </div>
          {isLongContent && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-[13px] font-bold text-primary hover:underline">
              {isExpanded ? "Show less" : "See more"}
            </button>
          )}
          {!theme && showTranslateButton && (
            <div className="flex items-center gap-2 pt-1">
              <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary gap-1" onClick={handleTranslate} disabled={isTranslating}>
                {isTranslating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
                {translatedText ? "Show Original" : "Translate"}
              </Button>
            </div>
          )}
        </div>
        
        {hashtags && hashtags.length > 0 && !theme && (
          <div className="flex flex-wrap gap-1">
            {hashtags.map((tag) => <span key={tag} className="text-xs font-bold text-primary hover:underline cursor-pointer">#{tag}</span>)}
          </div>
        )}

        {poll && !theme && (
          <div className="mt-3 p-4 rounded-xl border border-primary/10 bg-primary/5 space-y-3">
            <h4 className="font-bold text-sm text-foreground">{poll.question}</h4>
            <div className="space-y-2">
              {(isPollExpanded ? localPollOptions : localPollOptions.slice(0, 4)).map((option, i) => {
                const percentage = localTotalVotes > 0 ? (option.votes / localTotalVotes) * 100 : 0;
                const isSelected = userVote === i;
                return (
                  <button key={i} onClick={() => handleVote(i)} className={cn("w-full relative h-10 rounded-lg border overflow-hidden group transition-all", isSelected ? "border-primary bg-primary/10" : "border-primary/20 hover:border-primary/40")}>
                    <div className={cn("absolute inset-y-0 left-0 transition-all duration-500", isSelected ? "bg-primary/20" : "bg-primary/5")} style={{ width: `${percentage}%` }} />
                    <div className="absolute inset-0 flex items-center justify-between px-3 text-sm">
                      <span className={cn("font-medium", isSelected && "text-primary font-bold")}>{option.text}{isSelected && <CheckCircle2 className="inline ml-2 h-3.5 w-3.5" />}</span>
                      <span className="text-xs font-bold text-primary">{Math.round(percentage)}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {localPollOptions.length > 4 && (
              <button onClick={() => setIsPollExpanded(!isPollExpanded)} className="text-[10px] font-bold text-primary hover:underline">
                {isPollExpanded ? "Show less" : `See more (${localPollOptions.length - 4})`}
              </button>
            )}
          </div>
        )}

        {allImages.length > 0 && !isShared && !theme && (
          <div className="relative mt-2 -mx-3 sm:mx-0 group">
            {allImages.length === 1 ? (
              <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50">
                <Image src={allImages[0]} alt="Post" fill className={cn("object-cover", imageFilter)} />
              </div>
            ) : (
              <Carousel className="w-full">
                <CarouselContent>
                  {allImages.map((img, i) => (
                    <CarouselItem key={i}><div className="relative aspect-video rounded-lg overflow-hidden"><Image src={img} alt="Post" fill className={cn("object-cover", imageFilter)} /></div></CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Carousel>
            )}
          </div>
        )}

        {!isShared && (
          <div className={cn("flex items-center justify-between py-1 border-b", theme ? "border-white/20 mb-2" : "border-secondary")}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="bg-primary p-1 rounded-full text-white ring-2 ring-white dark:ring-card"><ThumbsUp className="h-2.5 w-2.5 fill-current" /></div>
                <span className={cn("text-[11px] ml-1 font-bold", theme ? "text-white" : "text-muted-foreground")}>{effectiveLikes}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="bg-destructive p-1 rounded-full text-white ring-2 ring-white dark:ring-card"><ThumbsDown className="h-2.5 w-2.5 fill-current" /></div>
                <span className={cn("text-[11px] ml-1 font-bold", theme ? "text-white" : "text-muted-foreground")}>{effectiveUnlikes}</span>
              </div>
            </div>
            <div className={cn("flex items-center gap-2 text-[11px] font-bold", theme ? "text-white/80" : "text-muted-foreground")}>
              <span>{commentsDisabled ? 0 : comments} comments</span>
              <span>•</span>
              <span>28 shares</span>
            </div>
          </div>
        )}
      </CardContent>

      {!isShared && (
        <CardFooter className="p-1 px-3 flex flex-col gap-1 relative">
          <div className="flex items-center justify-between gap-1 w-full">
            <Button variant="ghost" size="sm" className={cn("flex-1 gap-2 rounded-md h-9 font-bold text-xs transition-all", isLiked ? "text-primary" : (theme ? "text-white/70" : "text-muted-foreground"))} onClick={handleLike}>
              <ThumbsUp className={cn("h-4 w-4", isLiked && "fill-current")} />
            </Button>
            <Button variant="ghost" size="sm" className={cn("flex-1 gap-2 rounded-md h-9 font-bold text-xs transition-all", isUnliked ? "text-destructive" : (theme ? "text-white/70" : "text-muted-foreground"))} onClick={handleUnlike}>
              <ThumbsDown className={cn("h-4 w-4", isUnliked && "fill-current")} />
            </Button>
            <Button variant="ghost" size="sm" className={cn("flex-1 gap-2 rounded-md h-9 font-bold text-xs", theme ? "text-white/70" : "text-muted-foreground")} onClick={() => setShowComments(!showComments)} disabled={commentsDisabled}>
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className={cn("flex-1 gap-2 rounded-md h-9 font-bold text-xs", theme ? "text-white/70" : "text-muted-foreground")}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          {showComments && !commentsDisabled && (
            <div className="w-full pt-4 space-y-4 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8"><AvatarImage src={INITIAL_USER.avatar} /></Avatar>
                <div className="flex-1 bg-secondary/30 rounded-full px-4 py-2 flex items-center gap-2">
                  <Input placeholder="Write a comment..." className="bg-transparent border-none focus-visible:ring-0 h-7 text-xs p-0" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-primary" onClick={() => triggerHaptic(5)}><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

const INITIAL_USER = { name: "John Doe", username: "johndoe_creative", avatar: "https://picsum.photos/seed/me/400/400" };
