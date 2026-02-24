"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, CheckCircle2, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface PostCardProps {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
    isOnline?: boolean;
  };
  content: string;
  image?: string;
  images?: string[];
  likes: number;
  comments: number;
  time: string;
  hashtags?: string[];
}

export function PostCard({ user, content, image, images = [], likes, comments, time, hashtags }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [showReactions, setShowReactions] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  const allImages = useMemo(() => {
    const list = [...images];
    if (image && !list.includes(image)) list.unshift(image);
    return list;
  }, [image, images]);

  const handleLike = () => {
    if (activeReaction) {
      setActiveReaction(null);
      setLikeCount(prev => prev - 1);
    } else {
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    }
  };

  const handleReaction = (type: string) => {
    if (!activeReaction) setLikeCount(prev => prev + 1);
    setActiveReaction(type);
    setIsLiked(true);
    setShowReactions(false);
  };

  const TRUNCATE_LIMIT = 280;
  const isLongContent = content.length > TRUNCATE_LIMIT;
  const displayedContent = isLongContent && !isExpanded 
    ? content.slice(0, TRUNCATE_LIMIT) + "..." 
    : content;

  // Simple Link Preview Simulation
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const foundUrl = content.match(urlRegex)?.[0];

  return (
    <Card className="border-none shadow-sm overflow-hidden bg-white dark:bg-card mb-4 ring-1 ring-black/5 dark:ring-white/5">
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
              {user.isVerified && <CheckCircle2 className="h-3 w-3 text-primary fill-primary text-white" />}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>{time}</span>
              <span>•</span>
              <Badge variant="ghost" className="p-0 h-auto font-normal text-[10px]">Public</Badge>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full hover:bg-secondary" aria-label="More options">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="px-3 pb-2 space-y-2">
        <div className="space-y-1">
          <p className="text-[13px] leading-relaxed whitespace-pre-wrap">
            {displayedContent}
          </p>
          {isLongContent && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[13px] font-bold text-primary hover:underline"
              aria-label={isExpanded ? "Show less" : "See more"}
            >
              {isExpanded ? "Show less" : "See more"}
            </button>
          )}
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

        {/* Link Preview Simulation */}
        {foundUrl && !allImages.length && (
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

        {/* Media Content */}
        {allImages.length > 0 && (
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
                <DialogContent className="max-w-none w-screen h-screen p-0 bg-black/95 border-none flex items-center justify-center">
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
                        <DialogContent className="max-w-none w-screen h-screen p-0 bg-black/95 border-none flex items-center justify-center">
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

        <div className="flex items-center justify-between py-1 border-b border-secondary">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-1">
              <div className="bg-primary p-1 rounded-full text-white ring-2 ring-white dark:ring-card">
                <ThumbsUp className="h-2.5 w-2.5 fill-current" />
              </div>
              <div className="bg-red-500 p-1 rounded-full text-white ring-2 ring-white dark:ring-card">
                <Heart className="h-2.5 w-2.5 fill-current" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground ml-1" aria-label={`${likeCount} likes`}>{likeCount}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{comments} comments</span>
            <span>•</span>
            <span>28 shares</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-1 px-3 flex items-center justify-between gap-1 relative">
        {/* Reactions Tray */}
        {showReactions && (
          <div 
            className="absolute bottom-full left-4 mb-2 bg-white dark:bg-card rounded-full shadow-xl border border-border p-1.5 flex gap-2 animate-in slide-in-from-bottom-2 duration-200 z-50"
            onMouseLeave={() => setShowReactions(false)}
          >
            {[
              { type: 'like', icon: ThumbsUp, color: 'text-primary' },
              { type: 'love', icon: Heart, color: 'text-red-500' },
              { type: 'laugh', icon: Laugh, color: 'text-yellow-500' },
              { type: 'wow', icon: Wow, color: 'text-blue-500' },
              { type: 'sad', icon: Sad, color: 'text-orange-500' },
            ].map((reaction) => {
              const Icon = reaction.icon;
              return (
                <button
                  key={reaction.type}
                  onClick={() => handleReaction(reaction.type)}
                  className={cn("p-2 rounded-full hover:bg-secondary hover:scale-125 transition-all", reaction.color)}
                >
                  <Icon className="h-5 w-5 fill-current" />
                </button>
              );
            })}
          </div>
        )}

        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "flex-1 gap-2 rounded-md h-9 text-muted-foreground hover:bg-secondary dark:hover:bg-white/5 font-bold text-xs transition-colors", 
            isLiked && "text-primary"
          )}
          onClick={handleLike}
          onMouseEnter={() => setShowReactions(true)}
          aria-label={isLiked ? "Unlike post" : "Like post"}
        >
          {activeReaction === 'love' ? <Heart className="h-4 w-4 fill-red-500 text-red-500" /> :
           activeReaction === 'laugh' ? <Laugh className="h-4 w-4 text-yellow-500" /> :
           activeReaction === 'wow' ? <Wow className="h-4 w-4 text-blue-500" /> :
           activeReaction === 'sad' ? <Sad className="h-4 w-4 text-orange-500" /> :
           <ThumbsUp className={cn("h-4 w-4", isLiked && "fill-current")} />}
          {activeReaction ? activeReaction.charAt(0).toUpperCase() + activeReaction.slice(1) : 'Like'}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 gap-2 rounded-md h-9 text-muted-foreground hover:bg-secondary dark:hover:bg-white/5 font-bold text-xs transition-colors"
          aria-label="Comment on post"
        >
          <MessageCircle className="h-4 w-4" />
          Comment
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 gap-2 rounded-md h-9 text-muted-foreground hover:bg-secondary dark:hover:bg-white/5 font-bold text-xs transition-colors"
          aria-label="Share post"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </CardFooter>
    </Card>
  );
}

function Laugh(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M18 13a6 6 0 0 1-12 0" />
      <line x1="9" x2="9.01" y1="9" y2="9" />
      <line x1="15" x2="15.01" y1="9" y2="9" />
    </svg>
  )
}

function Wow(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="15" r="2" />
      <line x1="9" x2="9.01" y1="9" y2="9" />
      <line x1="15" x2="15.01" y1="9" y2="9" />
    </svg>
  )
}

function Sad(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
      <line x1="9" x2="9.01" y1="9" y2="9" />
      <line x1="15" x2="15.01" y1="9" y2="9" />
    </svg>
  )
}