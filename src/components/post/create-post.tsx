"use client";

import { useState } from "react";
import { Image as ImageIcon, Sparkles, Loader2, Video, X, Globe, ChevronDown, Smile, MapPin, UserPlus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { aiSuggestHashtags, aiSummarizePost } from "@/app/actions/ai";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function CreatePost() {
  const [content, setContent] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const { toast } = useToast();

  const handleEnhance = async () => {
    if (!content.trim()) {
      toast({ description: "Please enter some content first!", variant: "destructive" });
      return;
    }

    setIsEnhancing(true);
    try {
      const [hashtagResult, summaryResult] = await Promise.all([
        aiSuggestHashtags({ postContent: content }),
        aiSummarizePost({ postContent: content })
      ]);
      
      setSuggestedTags(hashtagResult.hashtags);
      
      toast({ 
        title: "AI Summary Suggestion", 
        description: summaryResult.summary,
      });

    } catch (error) {
      toast({ 
        description: "Failed to enhance post. Check your Groq API key!", 
        variant: "destructive" 
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const addTag = (tag: string) => {
    const cleanTag = tag.startsWith('#') ? tag : `#${tag}`;
    if (!content.includes(cleanTag)) {
      setContent(prev => `${prev.trim()} ${cleanTag} `);
    }
    setSuggestedTags(prev => prev.filter(t => t !== tag));
  };

  return (
    <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-primary/10 p-4 flex items-center gap-4">
      {/* User Avatar with Status */}
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10 border border-primary/10">
          <AvatarImage src="https://picsum.photos/seed/me/200/200" alt="Me" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-card rounded-full" />
      </div>
      
      <Dialog>
        <DialogTrigger asChild>
          <button className="flex-1 text-left bg-secondary/40 hover:bg-secondary/60 transition-colors rounded-full px-6 py-2.5 text-[#65676B] dark:text-gray-400 text-base">
            What's on your mind?
          </button>
        </DialogTrigger>
        
        {/* Photo Shortcut Trigger */}
        <DialogTrigger asChild>
          <div className="flex flex-col items-center gap-0.5 cursor-pointer group">
            <div className="p-1 rounded-lg transition-colors">
              <ImageIcon className="h-7 w-7 text-green-500" />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground">Photo</span>
          </div>
        </DialogTrigger>

        {/* Full Screen Dialog Content */}
        <DialogContent className="max-w-none w-screen h-screen sm:h-screen m-0 rounded-none border-none flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-background translate-x-0 translate-y-0 left-0 top-0">
          <DialogHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between">
            <div className="w-10">
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="h-6 w-6" />
                </Button>
              </DialogClose>
            </div>
            <DialogTitle className="text-center font-bold text-lg">Create post</DialogTitle>
            <div className="w-10">
              <Button 
                variant="ghost" 
                className={cn("font-bold text-primary", !content.trim() && "opacity-50")}
                disabled={!content.trim()}
              >
                POST
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {/* Post Author Info */}
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11">
                <AvatarImage src="https://picsum.photos/seed/me/200/200" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <p className="font-bold text-base leading-none">John Doe</p>
                <div className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-md w-fit">
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[11px] font-bold text-muted-foreground">Public</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Content Area */}
            <Textarea 
              placeholder="What's on your mind?" 
              className="flex-1 border-none focus-visible:ring-0 text-2xl resize-none p-0 placeholder:text-muted-foreground/40 min-h-[150px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />

            {/* AI Suggestions Section */}
            {suggestedTags.length > 0 && (
              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" /> AI Suggested Tags
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-primary" onClick={() => setSuggestedTags([])}>
                    Dismiss
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-primary hover:text-white transition-colors py-1.5 px-3 rounded-full border-primary/20"
                      onClick={() => addTag(tag)}
                    >
                      #{tag.replace('#', '')}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Toolbar Area */}
          <div className="p-4 border-t bg-white dark:bg-background shrink-0">
            <div className="flex items-center justify-between p-2 border rounded-xl mb-4">
              <span className="text-sm font-bold pl-2">Add to your post</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-green-500 h-9 w-9">
                  <ImageIcon className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" className="text-blue-500 h-9 w-9">
                  <UserPlus className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" className="text-amber-500 h-9 w-9">
                  <Smile className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 h-9 w-9">
                  <MapPin className="h-6 w-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary h-9 w-9"
                  onClick={handleEnhance}
                  disabled={isEnhancing || !content.trim()}
                >
                  {isEnhancing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground h-9 w-9">
                  <MoreHorizontal className="h-6 w-6" />
                </Button>
              </div>
            </div>
            
            <Button 
              className="w-full h-11 font-bold bg-primary hover:bg-primary/90 text-white rounded-lg shadow-lg"
              disabled={!content.trim()}
            >
              Post
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
