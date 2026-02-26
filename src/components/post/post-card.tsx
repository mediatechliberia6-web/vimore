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
  GalleryVerticalEnd
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
    likes, unlikes, comments, time, hashtags, feeling, commentsDisabled, isPinned, 
    isSeries, seriesTitle, poll, isShared = false, videoUrl
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

  const handleLike = () => { triggerHaptic(20); toggleLikePost(id); };
  const handleUnlike = () => { triggerHaptic(15); toggleUnlikePost(id); };
  const handleSave = () => { triggerHaptic(5); toggleSavePost(id); toast({ description: isBookmarked ? "Removed" : "Saved ✨" }); };

  const handleTranslate = async () => {
    triggerHaptic();
    if (translatedText) { setTranslatedText(null); return; }
    setIsTranslating(true);
    try {
      const result = await aiTranslatePost({ postContent: content, targetLanguage: viewerLanguage || "English" });
      setTranslatedText(result.translation);
    } catch (error) { toast({ description: "Translation failed", variant: "destructive" }); }
    finally { setIsTranslating(false); }
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

  const isLimitedType = !!theme || allImages.length > 0 || !!videoUrl || !!poll;
  const TRUNCATE_LIMIT = 150; // Character limit synchronized to 150
  const isLongContent = content.length > TRUNCATE_LIMIT && !isLimitedType;
  const displayedContent = isLongContent && !isExpanded ? content.slice(0, TRUNCATE_LIMIT) + "..." : content;

  return (
    <Card className={cn("border-none shadow-sm overflow-hidden bg-white dark:bg-card mb-4 transition-colors relative ring-1 ring-black/5 dark:ring-white/5")}>
      {isPinned && !isShared && <div className="absolute top-0 right-0 z-10 p-1 px-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-bl-lg flex items-center gap-1 shadow-md"><Pin className="h-2 w-2 fill-current" /> Pinned</div>}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 bg-white dark:bg-card">
        <div className="flex items-center gap-2">
          <Link href={`/profile/${user.username}`}><Avatar className="h-10 w-10 border border-primary/10 hover:opacity-80 transition-opacity"><AvatarImage src={user.avatar} /><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar></Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <Link href={`/profile/${user.username}`} className="font-bold text-sm text-foreground hover:underline">{user.name}</Link>
              {feeling && <span className="text-xs text-muted-foreground">— is {feeling.emoji} {feeling.text}</span>}
              {user.isVerified && <CheckCircle2 className="h-3 w-3 text-primary fill-primary text-white" />}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground"><span>{time}</span><span>•</span><Badge variant="ghost" className="p-0 h-auto font-normal text-[10px]">Public</Badge></div>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className={cn("h-8 w-8 rounded-full", isBookmarked && "text-primary")} onClick={handleSave}><Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full"><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
              <DropdownMenuItem className="gap-2" onClick={() => setIsHidden(true)}><EyeOff className="h-4 w-4" />Hide post</DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => { triggerHaptic(); togglePinPost(id); }}><Pin className="h-4 w-4" />{isPinned ? "Unpin" : "Pin to profile"}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className={cn("px-3 pb-2 space-y-2", theme && !isShared ? theme + " py-12 px-8 text-center" : "bg-white dark:bg-card")}>
        <div className={cn("text-[13px] leading-relaxed whitespace-pre-wrap", theme && !isShared ? "text-2xl leading-tight font-black italic uppercase tracking-tighter" : "text-foreground")}>{renderContent(translatedText || displayedContent)}</div>
        {isLongContent && <button onClick={() => setIsExpanded(!isExpanded)} className="text-[13px] font-bold text-primary">{isExpanded ? "Show less" : "See more"}</button>}
        
        {poll && !theme && (
          <div className="mt-3 p-4 rounded-xl border border-primary/10 bg-primary/5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm">{poll.question}</h4>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[8px] font-black h-4 px-2">RANKED</Badge>
            </div>
            <div className="space-y-2">
              {(isPollExpanded ? rankedPollOptions : rankedPollOptions.slice(0, 4)).map((option, i) => {
                const p = localTotalVotes > 0 ? (option.votes / localTotalVotes) * 100 : 0;
                const isSelected = userVote === option.originalIndex;
                return (
                  <button key={option.originalIndex} onClick={() => handleVote(option.originalIndex)} className={cn("w-full relative h-10 rounded-lg border overflow-hidden transition-all", isSelected ? "border-primary bg-primary/10" : "border-primary/20 bg-white/40")}>
                    <div className={cn("absolute inset-y-0 left-0 transition-all duration-700", isSelected ? "bg-primary/20" : "bg-primary/5")} style={{ width: `${p}%` }} />
                    <div className="absolute inset-0 flex items-center justify-between px-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-primary/40">#{i + 1}</span>
                        <span className={cn("font-medium", isSelected && "text-primary font-bold")}>{option.text}</span>
                      </div>
                      <span className="text-xs font-black text-primary">{Math.round(p)}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-primary/5">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{localTotalVotes.toLocaleString()} Total Votes</span>
              {rankedPollOptions.length > 4 && <button onClick={() => setIsPollExpanded(!isPollExpanded)} className="text-[10px] font-black text-primary uppercase">{isPollExpanded ? "Collapse" : "View all"}</button>}
            </div>
          </div>
        )}

        {allImages.length > 0 && !isShared && !theme && (
          <div className="relative mt-2 -mx-3 sm:mx-0"><Carousel className="w-full"><CarouselContent>{allImages.map((img, i) => (<CarouselItem key={i}><div className="relative aspect-video rounded-lg overflow-hidden"><Image src={img} alt="Post" fill className={cn("object-cover", imageFilter)} /></div></CarouselItem>))}</CarouselContent></Carousel></div>
        )}
        {videoUrl && !isShared && !theme && <div className="relative mt-2 -mx-3 sm:mx-0 rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center"><video src={videoUrl} className="w-full h-full object-cover" controls playsInline /></div>}
      </CardContent>
      <CardFooter className="p-1 px-3 flex flex-col gap-1 relative bg-white dark:bg-card">
        <div className="flex items-center justify-between gap-1 w-full">
          <button className={cn("flex-1 flex items-center justify-center gap-2 rounded-md h-9 font-bold text-xs transition-all hover:bg-secondary", isLiked ? "text-primary" : "text-muted-foreground")} onClick={handleLike}><ThumbsUp className={cn("h-4 w-4", isLiked && "fill-current")} /> Like</button>
          <button className={cn("flex-1 flex items-center justify-center gap-2 rounded-md h-9 font-bold text-xs transition-all hover:bg-secondary", isUnliked ? "text-destructive" : "text-muted-foreground")} onClick={handleUnlike}><ThumbsDown className={cn("h-4 w-4", isUnliked && "fill-current")} /> Dislike</button>
          <button className="flex-1 flex items-center justify-center gap-2 rounded-md h-9 font-bold text-xs text-muted-foreground hover:bg-secondary" onClick={() => setShowComments(!showComments)} disabled={commentsDisabled}><MessageCircle className="h-4 w-4" /> Comment</button>
          <button className="flex-1 flex items-center justify-center gap-2 rounded-md h-9 font-bold text-xs text-muted-foreground hover:bg-secondary"><Share2 className="h-4 w-4" /> Share</button>
        </div>
      </CardFooter>
    </Card>
  );
}