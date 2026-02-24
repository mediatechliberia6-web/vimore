
"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PostCardProps {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
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
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden bg-white/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-sm hover:underline cursor-pointer">{user.name}</span>
            <span className="text-xs text-muted-foreground">@{user.username} • {time}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="px-4 pb-3 space-y-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        
        {hashtags && hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <span key={tag} className="text-xs font-medium text-accent hover:underline cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {image && (
          <div className="relative aspect-video rounded-xl overflow-hidden mt-3">
            <Image 
              src={image} 
              alt="Post content" 
              fill 
              className="object-cover transition-transform hover:scale-105 duration-500" 
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-2 border-t flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn("gap-2 hover:bg-pink-50", isLiked && "text-destructive")}
            onClick={handleLike}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
            <span className="text-xs font-medium">{likeCount}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-blue-50 text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs font-medium">{comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-primary/10 text-muted-foreground">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" size="sm" className="text-muted-foreground">
          <Bookmark className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
