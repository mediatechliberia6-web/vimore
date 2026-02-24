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
  Globe,
  MessageCircle,
  Calendar,
  Video,
  ChevronLeft,
  Lock,
  Users,
  X
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface CreatePostModalProps {
  children: React.ReactNode;
}

type PrivacySetting = {
  id: string;
  label: string;
  icon: typeof Globe;
  description: string;
};

const privacySettings: PrivacySetting[] = [
  { id: "public", label: "Public", icon: Globe, description: "Anyone on or off ViMore" },
  { id: "friends", label: "Friends", icon: Users, description: "Your friends on ViMore" },
  { id: "private", label: "Only Me", icon: Lock, description: "Only you can see this post" },
];

export function CreatePostModal({ children }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<PrivacySetting>(privacySettings[0]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const { toast } = useToast();
  
  const CHARACTER_LIMIT = 2000;

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
    setSelectedMedia([]);
  };

  const simulateMediaUpload = () => {
    const randomImg = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)].imageUrl;
    setSelectedMedia(prev => [...prev, randomImg]);
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const actionItems = [
    { icon: ImageIcon, label: "Photos/Videos", color: "text-green-500", onClick: simulateMediaUpload },
    { icon: UserPlus, label: "Tag people", color: "text-blue-500" },
    { icon: MapPin, label: "Add location", color: "text-red-500" },
    { icon: Smile, label: "Feeling/activity", color: "text-yellow-500" },
    { icon: MessageCircle, label: "Get messages", color: "text-blue-400" },
    { icon: Calendar, label: "Create Event", color: "text-red-400" },
    { icon: Video, label: "Go live", color: "text-red-600" },
  ];

  const backgrounds = [
    { id: 'white', class: "bg-white border" },
    { id: 'yellow', class: "bg-gradient-to-br from-yellow-200 to-yellow-400" },
    { id: 'purple', class: "bg-gradient-to-br from-purple-500 to-purple-800" },
    { id: 'pink', class: "bg-gradient-to-br from-pink-500 to-red-500" },
    { id: 'black', class: "bg-black" },
    { id: 'mesh', class: "bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-primary" },
    { id: 'dots', class: "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-accent" },
  ];

  const progress = (content.length / CHARACTER_LIMIT) * 100;
  const isOverLimit = content.length > CHARACTER_LIMIT;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-none w-screen h-[100dvh] m-0 rounded-none border-none flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-background translate-x-0 translate-y-0 left-0 top-0" aria-describedby="create-post-description">
        <div id="create-post-description" className="sr-only">Interface to create a new post with text, media, and AI tools.</div>
        
        {/* Header */}
        <DialogHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between space-y-0 bg-white dark:bg-card">
          <div className="flex items-center gap-4">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" aria-label="Go back">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </DialogClose>
            <DialogTitle className="font-bold text-lg">Create post</DialogTitle>
          </div>
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              className={cn("font-bold text-primary text-base", (!content.trim() && selectedMedia.length === 0 || isOverLimit) && "opacity-50")}
              disabled={(!content.trim() && selectedMedia.length === 0) || isOverLimit}
              onClick={handlePost}
              aria-label="Submit post"
            >
              POST
            </Button>
          </DialogClose>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* User Info & Privacy Selector */}
          <div className="p-4 flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-primary/10">
              <AvatarImage src="https://picsum.photos/seed/me/200/200" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <p className="font-bold text-base">John Doe</p>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="h-7 px-2 bg-secondary/60 rounded-md flex items-center gap-1.5" aria-label={`Privacy: ${privacy.label}`}>
                    <privacy.icon className="h-3.5 w-3.5" />
                    <span className="text-[13px] font-bold">{privacy.label}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 rounded-xl p-2">
                  {privacySettings.map((item) => (
                    <DropdownMenuItem 
                      key={item.id} 
                      className="flex flex-col items-start gap-0.5 py-3 cursor-pointer"
                      onClick={() => setPrivacy(item)}
                    >
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </div>
                      <span className="text-[10px] text-muted-foreground ml-6">{item.description}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Text Area */}
          <div className="px-4 relative">
            <Textarea 
              placeholder="What's on your mind?" 
              className="border-none focus-visible:ring-0 text-2xl resize-none p-0 placeholder:text-muted-foreground/50 min-h-[150px] bg-transparent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
              aria-label="Post content"
            />
            
            {/* Character Counter */}
            <div className="absolute bottom-2 right-4 flex items-center gap-2">
              <div className="relative w-6 h-6">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="text-muted/30"
                    strokeDasharray="100, 100"
                    strokeWidth="3"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={cn(isOverLimit ? "text-destructive" : progress > 90 ? "text-yellow-500" : "text-primary")}
                    strokeDasharray={`${Math.min(progress, 100)}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
              <span className={cn("text-[10px] font-bold", isOverLimit && "text-destructive")}>
                {CHARACTER_LIMIT - content.length}
              </span>
            </div>
          </div>

          {/* Media Strip */}
          {selectedMedia.length > 0 && (
            <div className="px-4 pb-4">
              <ScrollArea className="w-full whitespace-nowrap rounded-xl">
                <div className="flex gap-2 p-1">
                  {selectedMedia.map((url, i) => (
                    <div key={i} className="relative w-32 h-32 rounded-lg overflow-hidden shrink-0 border border-primary/10">
                      <Image src={url} alt={`Preview ${i}`} fill className="object-cover" />
                      <button 
                        onClick={() => removeMedia(i)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                        aria-label="Remove media"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={simulateMediaUpload}
                    className="w-32 h-32 rounded-lg border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-colors text-muted-foreground"
                  >
                    <PlusSquare className="h-6 w-6" />
                    <span className="text-[10px] font-bold">Add More</span>
                  </button>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}

          {/* AI Suggested Tags */}
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
                      className="cursor-pointer hover:bg-primary hover:text-white py-1 px-3 rounded-full text-xs font-medium transition-colors"
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
             <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-lg" aria-label="Previous backgrounds">
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
             </Button>
             <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-lg border-2 border-primary/20 bg-white" />
                  {backgrounds.map((bg) => (
                    <div key={bg.id} className={cn("w-10 h-10 rounded-lg shrink-0 cursor-pointer", bg.class)} />
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
             </ScrollArea>
          </div>

          {/* Action List */}
          <div className="border-t">
            {actionItems.map((item, i) => (
              <button 
                key={i} 
                onClick={item.onClick}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors"
                aria-label={item.label}
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
              aria-label="Enhance post with AI"
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
        <div className="p-4 pb-10 bg-white dark:bg-card border-t shrink-0 sm:pb-4">
          <DialogClose asChild>
            <Button 
              className="w-full h-12 font-bold text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-none"
              disabled={(!content.trim() && selectedMedia.length === 0) || isOverLimit}
              onClick={handlePost}
              aria-label="Post now"
            >
              POST
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PlusSquare(props: any) {
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
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  )
}
