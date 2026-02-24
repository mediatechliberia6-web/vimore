"use client";

import { useState } from "react";
import Image from "next/image";
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
  likes: number;
  comments: number;
  time: string;
  hashtags?: string[];
}

export function PostCard({ user, content, image, likes, comments, time, hashtags }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <Card className="border-none shadow-sm overflow-hidden bg-white mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Avatar className="h-10 w-10 border border-primary/10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            {user.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
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
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground rounded-full hover:bg-secondary">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="px-3 pb-2 space-y-2">
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{content}</p>
        
        {hashtags && hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {hashtags.map((tag) => (
              <span key={tag} className="text-xs font-bold text-primary hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {image && (
          <div className="relative aspect-video rounded-lg overflow-hidden mt-2 -mx-3 sm:mx-0">
            <Image 
              src={image} 
              alt="Post content" 
              fill 
              className="object-cover" 
            />
          </div>
        )}

        <div className="flex items-center justify-between py-1 border-b border-secondary">
          <div className="flex items-center gap-1">
            <div className="bg-primary p-1 rounded-full text-white">
              <ThumbsUp className="h-2.5 w-2.5 fill-current" />
            </div>
            <span className="text-[11px] text-muted-foreground">{likeCount}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{comments} comments</span>
            <span>•</span>
            <span>28 shares</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-1 px-3 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn("flex-1 gap-2 rounded-md h-9 text-muted-foreground hover:bg-secondary font-bold text-xs", isLiked && "text-primary")}
          onClick={handleLike}
        >
          <ThumbsUp className={cn("h-4 w-4", isLiked && "fill-current")} />
          Like
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 gap-2 rounded-md h-9 text-muted-foreground hover:bg-secondary font-bold text-xs">
          <MessageCircle className="h-4 w-4" />
          Comment
        </Button>
        <Button variant="ghost" size="sm" className="flex-1 gap-2 rounded-md h-9 text-muted-foreground hover:bg-secondary font-bold text-xs">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </CardFooter>
    </Card>
  );
}
