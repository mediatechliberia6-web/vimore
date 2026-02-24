"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
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
  Gift
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
  content: string;
  image?: string;
  images?: string[];
  likes: number;
  unlikes: number;
  comments: number;
  time: string;
  hashtags?: string[];
  feeling?: { emoji: string; text: string };
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
  };
  initialComments?: Comment[];
  isShared?: boolean;
  sharedPost?: PostCardProps;
}

export function PostCard({ 
  user, 
  content, 
  image, 
  images = [], 
  likes, 
  unlikes,
  comments, 
  time, 
  hashtags,
  feeling,
  poll,
  initialComments = [],
  isShared = false,
  sharedPost
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isUnliked, setIsUnliked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [unlikeCount, setUnlikeCount] = useState(unlikes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  // Poll state
  const [userVote, setUserVote] = useState<number | null>(null);
  const [localPollOptions, setLocalPollOptions] = useState(poll?.options || []);
  const [localTotalVotes, setLocalTotalVotes] = useState(poll?.totalVotes || 0);
  const [isPollExpanded, setIsPollExpanded] = useState(false);

  const { toast } = useToast();

  const allImages = useMemo(() => {
    const list = [...images];
    if (image && !list.includes(image)) list.unshift(image);
    return list;
  }, [image, images]);

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
      if (isUnliked) {
        setIsUnliked(false);
        setUnlikeCount(prev => prev - 1);
      }
    }
  };

  const handleUnlike = () => {
    if (isUnliked) {
      setIsUnliked(false);
      setUnlikeCount(prev => prev - 1);
    } else {
      setIsUnliked(true);
      setUnlikeCount(prev => prev + 1);
      if (isLiked) {
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      }
    }
  };

  const handleTranslate = async () => {
    if (translatedText) {
      setTranslatedText(null);
      return;
    }
    setIsTranslating(true);
    try {
      const result = await aiTranslatePost({ postContent: content });
      setTranslatedText(result.translation);
    } catch (error) {
      toast({ description: "Translation failed. Try again later.", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleVote = (index: number) => {
    if (!poll) return;
    const newOptions = [...localPollOptions];
    let newTotal = localTotalVotes;

    if (userVote === index) {
      newOptions[index] = { ...newOptions[index], votes: newOptions[index].votes - 1 };
      newTotal -= 1;
      setUserVote(null);
      toast({ description: "Vote removed" });
    } else {
      if (userVote !== null) {
        newOptions[userVote] = { ...newOptions[userVote], votes: newOptions[userVote].votes - 1 };
        newTotal -= 1;
      }
      newOptions[index] = { ...newOptions[index], votes: newOptions[index].votes + 1 };
      newTotal += 1;
      setUserVote(index);
      toast({ description: "Vote recorded" });
    }
    setLocalPollOptions(newOptions);
    setLocalTotalVotes(newTotal);
  };

  if (isHidden) {
    return (
      <Card className="p-4 flex items-center justify-between bg-secondary/20 border-dashed border-2">
        <span className="text-sm font-medium text-muted-foreground">Post hidden</span>
        <Button variant="ghost" size="sm" onClick={() => setIsHidden(false)} className="text-primary font-bold">Undo</Button>
      </Card>
    );
  }

  const TRUNCATE_LIMIT = 280;
  const isLongContent = content.length > TRUNCATE_LIMIT;
  const displayedContent = isLongContent && !isExpanded 
    ? content.slice(0, TRUNCATE_LIMIT) + "..." 
    : content;

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const foundUrl = content.match(urlRegex)?.[0];

  const visiblePollOptions = isPollExpanded ? localPollOptions : localPollOptions.slice(0, 4);
  const hasMorePollOptions = localPollOptions.length > 4;

  const showGiftIcon = (user.followers || 0) >= 1000;

  return (
    <Card className={cn(
      "border-none shadow-sm overflow-hidden bg-white dark:bg-card mb-4 transition-colors",
      isShared ? "ring-1 ring-primary/10 shadow-none scale-[0.98] mx-2" : "ring-1 ring-black/5 dark:ring-white/5"
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="h-10 w-10 border border-primary/10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-card rounded-full" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm hover:underline cursor-pointer">{user.name}</span>
              {feeling && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  is {feeling.emoji} {feeling.text}
                </span>
              )}
              {user.isVerified && <CheckCircle2 className="h-3 w-3 text-primary fill-primary text-white" />}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>{time}</span>
              {!isShared && (
                <>
                  <span>•</span>
                  <Badge variant="ghost" className="p-0 h-auto font-normal text-[10px]">Public</Badge>
                </>
              )}
            </div>
          </div>
        </div>
        {!isShared && (
          <div className="flex items-center gap-0.5">
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-8 w-8 rounded-full", isBookmarked && "text-primary")}
              onClick={() => {
                setIsBookmarked(!isBookmarked);
                toast({ description: isBookmarked ? "Removed from bookmarks" : "Saved to bookmarks" });
              }}
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
                <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => setIsHidden(true)}>
                  <EyeOff className="h-4 w-4" />
                  Hide post
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                  <Flag className="h-4 w-4" />
                  Report post
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer">
                  <EyeOff className="h-4 w-4" />
                  Turn off notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="px-3 pb-2 space-y-2">
        <div className="space-y-1">
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
            {translatedText || displayedContent}
          </p>
          {isLongContent && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[13px] font-bold text-primary hover:underline"
            >
              {isExpanded ? "Show less" : "See more"}
            </button>
          )}
          <div className="flex items-center gap-2 pt-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary gap-1"
              onClick={handleTranslate}
              disabled={isTranslating}
            >
              {isTranslating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Languages className="h-3 w-3" />}
              {translatedText ? "Show Original" : "See Translation"}
            </Button>
          </div>
        </div>
        
        {hashtags && hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hashtags.map((tag) => (
              <span key={tag} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {poll && (
          <div className="mt-3 p-4 rounded-xl border border-primary/10 bg-primary/5 space-y-3">
            <h4 className="font-bold text-sm">{poll.question}</h4>
            <div className="space-y-2">
              {visiblePollOptions.map((option, i) => {
                const percentage = localTotalVotes > 0 ? (option.votes / localTotalVotes) * 100 : 0;
                const isSelected = userVote === i;
                return (
                  <button 
                    key={i} 
                    onClick={() => handleVote(i)}
                    className={cn(
                      "w-full relative h-10 rounded-lg border overflow-hidden group transition-all",
                      isSelected ? "border-primary bg-primary/10" : "border-primary/20 hover:border-primary/40"
                    )}
                  >
                    <div 
                      className={cn(
                        "absolute inset-y-0 left-0 transition-all duration-500",
                        isSelected ? "bg-primary/20" : "bg-primary/5"
                      )} 
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-3 text-sm">
                      <span className={cn("font-medium", isSelected && "text-primary font-bold")}>
                        {option.text}
                        {isSelected && <CheckCircle2 className="inline ml-2 h-3.5 w-3.5" />}
                      </span>
                      <span className="text-xs font-bold text-primary">{Math.round(percentage)}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                {localTotalVotes} votes {userVote !== null && "• You voted"}
              </p>
              {hasMorePollOptions && (
                <button 
                  onClick={() => setIsPollExpanded(!isPollExpanded)}
                  className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                >
                  {isPollExpanded ? (
                    <>Show less <ChevronUp className="h-3 w-3" /></>
                  ) : (
                    <>See more ({localPollOptions.length - 4}) <ChevronDown className="h-3 w-3" /></>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {sharedPost && (
          <div className="mt-2">
            <PostCard {...sharedPost} isShared={true} />
          </div>
        )}

        {foundUrl && !allImages.length && !sharedPost && (
          <div className="rounded-xl border border-border overflow-hidden bg-secondary/20 cursor-pointer hover:bg-secondary/30 transition-colors">
            <div className="relative aspect-[1.91/1] w-full">
               <Image src={`https://picsum.photos/seed/${foundUrl}/800/420`} alt="Link preview" fill className="object-cover" />
            </div>
            <div className="p-3 space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{new URL(foundUrl).hostname}</p>
              <h4 className="text-sm font-bold line-clamp-1">Discover more with ViMore Connect</h4>
              <p className="text-xs text-muted-foreground line-clamp-1">Explore the latest trends and connect with creators around the world.</p>
            </div>
          </div>
        )}

        {allImages.length > 0 && !isShared && (
          <div className="relative mt-2 -mx-3 sm:mx-0 group">
            {allImages.length === 1 ? (
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50 cursor-pointer">
                    <Image 
                      src={allImages[0]} 
                      alt="Post content" 
                      fill 
                      className="object-cover hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-none w-screen h-screen p-0 bg-black/95 border-none flex flex-col items-center justify-center">
                  <DialogTitle className="sr-only">Media Preview</DialogTitle>
                  <DialogDescription className="sr-only">Full screen view of post media</DialogDescription>
                  <div className="relative w-full h-full">
                    <Image src={allImages[0]} alt="Lightbox" fill className="object-contain" />
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <Carousel className="w-full">
                <CarouselContent>
                  {allImages.map((img, i) => (
                    <CarouselItem key={i}>
                      <Dialog>
                        <DialogTrigger asChild>
                          <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50 cursor-pointer">
                            <Image src={img} alt={`Slide ${i}`} fill className="object-cover" />
                          </div>
                        </DialogTrigger>
                        <DialogContent className="max-w-none w-screen h-screen p-0 bg-black/95 border-none flex flex-col items-center justify-center">
                          <DialogTitle className="sr-only">Media Preview - Slide {i + 1}</DialogTitle>
                          <DialogDescription className="sr-only">Full screen view of carousel image {i + 1}</DialogDescription>
                          <div className="relative w-full h-full">
                            <Image src={img} alt="Lightbox" fill className="object-contain" />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Carousel>
            )}
          </div>
        )}

        {!isShared && (
          <div className="flex items-center justify-between py-1 border-b border-secondary">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="bg-primary p-1 rounded-full text-white ring-2 ring-white dark:ring-card">
                  <ThumbsUp className="h-2.5 w-2.5 fill-current" />
                </div>
                <span className="text-[11px] text-muted-foreground ml-1 font-bold">{likeCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="bg-destructive p-1 rounded-full text-white ring-2 ring-white dark:ring-card">
                  <ThumbsDown className="h-2.5 w-2.5 fill-current" />
                </div>
                <span className="text-[11px] text-muted-foreground ml-1 font-bold">{unlikeCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-bold">
              <span>{comments} comments</span>
              <span>•</span>
              <span>28 shares</span>
            </div>
          </div>
        )}
      </CardContent>

      {!isShared && (
        <CardFooter className="p-1 px-3 flex flex-col gap-1 relative">
          <div className="flex items-center justify-between gap-1 w-full relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "flex-1 gap-2 rounded-md h-9 text-muted-foreground hover:bg-secondary dark:hover:bg-white/5 font-bold text-xs transition-colors select-none", 
                isLiked && "text-primary"
              )}
              onClick={handleLike}
              aria-label={isLiked ? "Unlike post" : "Like post"}
            >
              <ThumbsUp className={cn("h-4 w-4", isLiked && "fill-current")} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "flex-1 gap-2 rounded-md h-9 text-muted-foreground hover:bg-secondary dark:hover:bg-white/5 font-bold text-xs transition-colors select-none", 
                isUnliked && "text-destructive"
              )}
              onClick={handleUnlike}
              aria-label={isUnliked ? "Remove unlike" : "Unlike post"}
            >
              <ThumbsDown className={cn("h-4 w-4", isUnliked && "fill-current")} />
            </Button>
            {showGiftIcon && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 gap-2 rounded-md h-9 text-yellow-500 hover:bg-secondary dark:hover:bg-white/5 font-bold text-xs transition-colors"
                onClick={() => toast({ description: "Gifting feature coming soon!" })}
              >
                <Gift className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 gap-2 rounded-md h-9 text-muted-foreground hover:bg-secondary dark:hover:bg-white/5 font-bold text-xs transition-colors"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 gap-2 rounded-md h-9 text-muted-foreground hover:bg-secondary dark:hover:bg-white/5 font-bold text-xs transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {showComments && (
            <div className="w-full pt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://picsum.photos/seed/me/100/100" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-secondary/30 rounded-full px-4 py-2 flex items-center gap-2">
                  <Input 
                    placeholder="Write a comment..." 
                    className="bg-transparent border-none focus-visible:ring-0 h-7 text-xs p-0"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-primary">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4 pl-2 pb-2">
                {initialComments.map((comment) => (
                  <div key={comment.id} className="space-y-2">
                    <div className="flex gap-2">
                      <Avatar className="h-8 w-8 mt-0.5">
                        <AvatarImage src={comment.user.avatar} />
                        <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1">
                        <div className="bg-secondary/20 rounded-2xl p-3">
                          <p className="text-[11px] font-bold">{comment.user.name}</p>
                          <p className="text-[11px] leading-relaxed">{comment.text}</p>
                        </div>
                        <div className="flex gap-4 pl-2 text-[10px] font-bold text-muted-foreground">
                          <button className="hover:text-primary">Like</button>
                          <button className="hover:text-primary">Reply</button>
                          <span>{comment.time}</span>
                        </div>
                      </div>
                    </div>
                    
                    {comment.replies?.map((reply) => (
                      <div key={reply.id} className="flex gap-2 pl-10">
                        <Avatar className="h-6 w-6 mt-0.5">
                          <AvatarImage src={reply.user.avatar} />
                          <AvatarFallback>{reply.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-1">
                          <div className="bg-secondary/10 rounded-2xl p-2.5">
                            <p className="text-[10px] font-bold">{reply.user.name}</p>
                            <p className="text-[10px] leading-relaxed">{reply.text}</p>
                          </div>
                          <div className="flex gap-4 pl-2 text-[10px] font-bold text-muted-foreground">
                            <button className="hover:text-primary">Like</button>
                            <span>{reply.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
