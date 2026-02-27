
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { 
  X, 
  Send, 
  Heart, 
  MoreHorizontal, 
  CheckCircle2, 
  Reply, 
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Zap,
  Trash2,
  Clock
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePosts, PostComment } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CommentNodeProps {
  comment: PostComment;
  postId: string;
  onReply: (comment: PostComment) => void;
  level?: number;
}

function CommentNode({ comment, postId, onReply, level = 0 }: CommentNodeProps) {
  const { triggerHaptic } = useMusic();
  const [isLiked, setIsLiked] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(15);
    setIsLiked(!isLiked);
  };

  return (
    <div className={cn("space-y-4", level > 0 && "ml-10 mt-4 border-l border-primary/10 pl-4")}>
      <div className="group relative flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
        <Avatar className={cn(level > 0 ? "h-7 w-7" : "h-9 w-9", "border border-primary/10")}>
          <AvatarImage src={comment.user.avatar} />
          <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs hover:underline cursor-pointer flex items-center gap-1">
              {comment.user.name}
              {comment.user.isVerified && <CheckCircle2 className="h-2.5 w-2.5 text-primary fill-primary text-white" />}
            </span>
            <span className="text-[9px] text-muted-foreground uppercase font-black tracking-tighter">{comment.time}</span>
          </div>
          
          <p className="text-sm leading-relaxed text-foreground/90 bg-secondary/20 p-3 rounded-2xl rounded-tl-none">
            {comment.text}
          </p>
          
          <div className="flex items-center gap-6 pt-1">
            <button 
              onClick={handleLike}
              className={cn("flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest transition-colors", isLiked ? "text-primary" : "text-muted-foreground hover:text-primary")}
            >
              <Heart className={cn("h-3 w-3", isLiked && "fill-current")} />
              {isLiked ? (comment.likes + 1) : comment.likes}
            </button>
            
            <button 
              onClick={() => onReply(comment)}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
            
            <button className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {comment.replies.length > 0 && (
        <div className="space-y-4">
          <button 
            onClick={() => setShowReplies(!showReplies)}
            className="ml-10 flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-80 transition-all"
          >
            <div className="w-6 h-[1px] bg-primary/20" />
            {showReplies ? "Hide Activity" : `View ${comment.replies.length} Replies`}
            {showReplies ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
          </button>
          
          {showReplies && (
            <div className="space-y-4">
              {comment.replies.map(reply => (
                <CommentNode 
                  key={reply.id} 
                  comment={reply} 
                  postId={postId} 
                  onReply={onReply} 
                  level={level + 1} 
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CommentHub() {
  const { activeCommentPostId, closeCommentHub, posts, addComment, addReply, triggerHaptic } = usePosts();
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState<PostComment | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activePost = useMemo(() => 
    posts.find(p => p.id === activeCommentPostId), 
    [posts, activeCommentPostId]
  );

  const handleSend = () => {
    if (!text.trim() || !activeCommentPostId) return;
    
    if (replyingTo) {
      addReply(activeCommentPostId, replyingTo.id, text);
    } else {
      addComment(activeCommentPostId, text);
    }
    
    setText("");
    setReplyingTo(null);
    triggerHaptic(20);
  };

  const handleInitiateReply = (comment: PostComment) => {
    triggerHaptic(10);
    setReplyingTo(comment);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (!activeCommentPostId) return null;

  return (
    <Sheet open={!!activeCommentPostId} onOpenChange={(open) => !open && closeCommentHub()}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-[3rem] p-0 border-primary/10 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-3xl h-[65vh] flex flex-col transition-all duration-500 overflow-hidden"
      >
        <div className="mx-auto w-12 h-1.5 bg-primary/20 rounded-full mt-4 mb-2 shrink-0" />
        
        <SheetHeader className="px-6 py-4 border-b border-primary/5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SheetTitle className="text-xl font-black italic uppercase tracking-tighter">Community Pulse</SheetTitle>
              <div className="bg-primary/5 px-3 py-1 rounded-full flex items-center gap-2 border border-primary/10">
                <Zap className="h-3 w-3 text-primary animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                  {activePost?.comments || 0} Vibes
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={closeCommentHub}>
              <X className="h-6 w-6" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 pt-6">
          <div className="space-y-8 pb-32">
            {activePost?.commentNodes && activePost.commentNodes.length > 0 ? (
              activePost.commentNodes.map(comment => (
                <CommentNode 
                  key={comment.id} 
                  comment={comment} 
                  postId={activePost.id} 
                  onReply={handleInitiateReply} 
                />
              ))
            ) : (
              <div className="py-20 text-center space-y-4 opacity-40">
                <MessageCircle className="h-12 w-12 mx-auto text-primary/40" />
                <div className="space-y-1">
                  <p className="text-sm font-black uppercase tracking-widest">Quiet in this Circle</p>
                  <p className="text-[10px] font-medium uppercase">Be the first to synchronize your thoughts.</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Dynamic Handshake Input */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-10 bg-gradient-to-t from-white dark:from-[#050505] via-white/95 dark:via-[#050505]/95 to-transparent">
          <div className="max-w-3xl mx-auto space-y-3">
            {replyingTo && (
              <div className="flex items-center justify-between bg-primary/10 px-4 py-2 rounded-xl animate-in slide-in-from-bottom-2 duration-300">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                  Replying to <span className="underline">@{replyingTo.user.username}</span>
                </p>
                <button onClick={() => setReplyingTo(null)} className="text-primary hover:text-primary/60">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            
            <div className="relative group">
              <Input 
                ref={inputRef}
                placeholder={replyingTo ? `Write a reply...` : "Synchronize your reaction..."}
                className="h-14 pl-6 pr-14 bg-secondary/40 border-none rounded-2xl focus-visible:ring-primary/20 text-sm font-medium shadow-inner transition-all focus-visible:bg-secondary/60"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button 
                size="icon" 
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl transition-all",
                  text.trim() ? "bg-primary text-white shadow-lg" : "bg-white/10 text-muted-foreground opacity-20"
                )}
                disabled={!text.trim()}
                onClick={handleSend}
              >
                <Send className="h-4 w-4 fill-current" />
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
