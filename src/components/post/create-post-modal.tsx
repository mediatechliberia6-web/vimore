"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Sparkles, 
  Loader2, 
  ChevronDown, 
  Smile, 
  MapPin, 
  UserPlus, 
  MoreHorizontal,
  Globe,
  MessageCircle,
  Calendar,
  Video,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { aiSuggestHashtags, aiSummarizePost } from "@/app/actions/ai";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CreatePostModalProps {
  children: React.ReactNode;
}

export function CreatePostModal({ children }: CreatePostModalProps) {
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

  const handlePost = () => {
    toast({ title: "Post created!", description: "Your post has been shared with the community." });
    setContent("");
    setSuggestedTags([]);
  };

  const actionItems = [
    { icon: ImageIcon, label: "Photos/Videos", color: "text-green-500" },
    { icon: UserPlus, label: "Tag people", color: "text-blue-500" },
    { icon: MapPin, label: "Add location", color: "text-red-500" },
    { icon: Smile, label: "Feeling/activity", color: "text-yellow-500" },
    { icon: MessageCircle, label: "Get messages", color: "text-blue-400" },
    { icon: Calendar, label: "Create Event", color: "text-red-400" },
    { icon: Video, label: "Go live", color: "text-red-600" },
  ];

  const backgroundColors = [
    "bg-white border",
    "bg-gradient-to-br from-yellow-200 to-yellow-400",
    "bg-gradient-to-br from-purple-500 to-purple-800",
    "bg-gradient-to-br from-pink-500 to-red-500",
    "bg-black",
    "bg-gradient-to-br from-purple-600 to-blue-500",
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-none w-screen h-screen sm:h-screen m-0 rounded-none border-none flex flex-col p-0 gap-0 overflow-hidden bg-white translate-x-0 translate-y-0 left-0 top-0">
        {/* Header */}
        <DialogHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-4">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </DialogClose>
            <DialogTitle className="font-bold text-lg">Create post</DialogTitle>
          </div>
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              className={cn("font-bold text-primary text-base", !content.trim() && "opacity-50")}
              disabled={!content.trim()}
              onClick={handlePost}
            >
              POST
            </Button>
          </DialogClose>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* User Info */}
          <div className="p-4 flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-primary/10">
              <AvatarImage src="https://picsum.photos/seed/me/200/200" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <p className="font-bold text-base">John Doe</p>
              <Button variant="secondary" size="sm" className="h-7 px-2 bg-secondary/60 rounded-md flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5" />
                <span className="text-[13px] font-bold">Public</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Text Area */}
          <div className="px-4">
            <Textarea 
              placeholder="What's on your mind?" 
              className="border-none focus-visible:ring-0 text-2xl resize-none p-0 placeholder:text-muted-foreground/50 min-h-[200px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
          </div>

          {/* AI Suggested Tags (Optional overlay) */}
          {suggestedTags.length > 0 && (
            <div className="px-4 pb-4">
              <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-primary">
                    <Sparkles className="w-3.5 h-3.5" /> AI SUGGESTIONS
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedTags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer hover:bg-primary hover:text-white py-1 px-3 rounded-full text-xs font-medium"
                      onClick={() => addTag(tag)}
                    >
                      #{tag.replace('#', '')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Background Picker */}
          <div className="px-4 py-4 flex items-center gap-3">
             <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-lg">
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
             </Button>
             <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-lg border-2 border-primary/20 bg-white" />
                  {backgroundColors.map((color, i) => (
                    <div key={i} className={cn("w-10 h-10 rounded-lg shrink-0", color)} />
                  ))}
                  <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                    <span className="text-xl font-bold">@</span>
                  </div>
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
             </ScrollArea>
          </div>

          {/* Action List */}
          <div className="border-t">
            {actionItems.map((item, i) => (
              <button 
                key={i} 
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <item.icon className={cn("h-6 w-6", item.color)} />
                  <span className="text-base font-medium">{item.label}</span>
                </div>
              </button>
            ))}
            
            {/* AI Action */}
            <button 
              onClick={handleEnhance}
              disabled={isEnhancing || !content.trim()}
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors border-t"
            >
              <div className="flex items-center gap-4">
                {isEnhancing ? (
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                ) : (
                  <Sparkles className="h-6 w-6 text-primary" />
                )}
                <span className="text-base font-medium text-primary">Enhance with AI</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Post Button */}
        <div className="p-4 bg-white border-t shrink-0">
          <DialogClose asChild>
            <Button 
              className="w-full h-12 font-bold text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-none"
              disabled={!content.trim()}
              onClick={handlePost}
            >
              POST
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
