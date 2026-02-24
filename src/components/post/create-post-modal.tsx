"use client";

import { useState, useEffect } from "react";
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
  Lock,
  Users,
  X,
  ListTodo,
  PlusSquare,
  AtSign,
  Clapperboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { aiSuggestHashtags, aiSummarizePost } from "@/app/actions/ai";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";

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

const mockFriends = [
  { name: "Alex Rivera", avatar: "https://picsum.photos/seed/1/100/100" },
  { name: "Sarah Chen", avatar: "https://picsum.photos/seed/2/100/100" },
  { name: "Marcus Stone", avatar: "https://picsum.photos/seed/3/100/100" },
];

export function CreatePostModal({ children }: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<PrivacySetting>(privacySettings[0]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [feeling, setFeeling] = useState<{ emoji: string; text: string } | null>(null);
  const [isTagging, setIsTagging] = useState(false);

  const { toast } = useToast();
  
  const CHARACTER_LIMIT = 2000;

  useEffect(() => {
    const lastWord = content.split(/\s+/).pop() || "";
    if (lastWord.startsWith("@")) {
      setIsTagging(true);
    } else {
      setIsTagging(false);
    }
  }, [content]);

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

  const handleMention = (friend: typeof mockFriends[0]) => {
    const words = content.split(/\s+/);
    words.pop();
    setContent([...words, friend.name, ""].join(" "));
    setIsTagging(false);
  };

  const handlePost = () => {
    toast({ title: "Post created!", description: "Your post has been shared with the community." });
    setContent("");
    setSuggestedTags([]);
    setSelectedMedia([]);
    setIsPollOpen(false);
    setFeeling(null);
  };

  const simulateMediaUpload = () => {
    const randomImg = PlaceHolderImages[Math.floor(Math.random() * PlaceHolderImages.length)].imageUrl;
    setSelectedMedia(prev => [...prev, randomImg]);
  };

  const removeMedia = (index: number) => {
    setSelectedMedia(prev => prev.filter((_, i) => i !== index));
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions(prev => [...prev, ""]);
    }
  };

  const updatePollOption = (index: number, val: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = val;
    setPollOptions(newOptions);
  };

  const actionItems = [
    { icon: ImageIcon, label: "Photo", color: "text-green-500", onClick: simulateMediaUpload },
    { icon: Clapperboard, label: "Video", color: "text-red-500", onClick: simulateMediaUpload },
    { icon: ListTodo, label: "Create Poll", color: "text-purple-500", onClick: () => setIsPollOpen(!isPollOpen) },
    { icon: Smile, label: "Feeling/activity", color: "text-yellow-500", onClick: () => setFeeling({ emoji: "😊", text: "Happy" }) },
    { icon: UserPlus, label: "Tag people", color: "text-blue-500", onClick: () => setContent(prev => prev + " @") },
    { icon: MapPin, label: "Add location", color: "text-red-500" },
    { icon: MessageCircle, label: "Get messages", color: "text-blue-400" },
    { icon: Calendar, label: "Create Event", color: "text-red-400" },
    { icon: Video, label: "Go live", color: "text-red-600" },
  ];

  const progress = (content.length / CHARACTER_LIMIT) * 100;
  const isOverLimit = content.length > CHARACTER_LIMIT;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-none w-screen h-[100dvh] m-0 rounded-none border-none flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-background translate-x-0 translate-y-0 left-0 top-0" aria-describedby="create-post-description">
        <DialogTitle className="sr-only">Create a New Post</DialogTitle>
        <DialogDescription className="sr-only">Interface to compose text, add media, create polls, and use AI tools for a new social media post.</DialogDescription>
        
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
              className={cn("font-bold text-primary text-base", (!content.trim() && selectedMedia.length === 0 && !pollQuestion || isOverLimit) && "opacity-50")}
              disabled={(!content.trim() && selectedMedia.length === 0 && !pollQuestion) || isOverLimit}
              onClick={handlePost}
              aria-label="Submit post"
            >
              POST
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-primary/10">
              <AvatarImage src="https://picsum.photos/seed/me/200/200" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1">
                <p className="font-bold text-base">John Doe</p>
                {feeling && <span className="text-xs text-muted-foreground">— is {feeling.emoji} {feeling.text}</span>}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="h-7 px-2 bg-secondary/60 rounded-md flex items-center gap-1.5" aria-label={`Privacy: ${privacy.label}`}>
                    <privacy.icon className="h-3.5 w-3.5" />
                    <span className="text-[13px] font-bold">{privacy.label}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 rounded-xl p-2">
                  <DialogTitle className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase">Select Audience</DialogTitle>
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

          <div className="px-4 relative">
            <Textarea 
              placeholder="What's on your mind?" 
              className="border-none focus-visible:ring-0 text-2xl resize-none p-0 placeholder:text-muted-foreground/50 min-h-[120px] bg-transparent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
              aria-label="Post content"
            />
            
            {isTagging && (
              <div className="absolute top-full left-4 right-4 z-50 mt-1 bg-white dark:bg-card border rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2">
                <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mention Friends</p>
                {mockFriends.map((friend) => (
                  <button
                    key={friend.name}
                    className="w-full flex items-center gap-3 p-2 hover:bg-secondary rounded-lg transition-colors"
                    onClick={() => handleMention(friend)}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={friend.avatar} />
                      <AvatarFallback>{friend.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-sm">{friend.name}</span>
                  </button>
                ))}
              </div>
            )}

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

          {isPollOpen && (
            <div className="mx-4 mb-4 p-4 border border-primary/20 rounded-2xl bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase">Poll Settings</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsPollOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Input 
                placeholder="Ask a question..." 
                className="bg-white border-primary/10 rounded-xl"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
              />
              <div className="space-y-2">
                {pollOptions.map((opt, i) => (
                  <Input 
                    key={i}
                    placeholder={`Option ${i + 1}`}
                    className="bg-white border-primary/10 rounded-xl"
                    value={opt}
                    onChange={(e) => updatePollOption(i, e.target.value)}
                  />
                ))}
                {pollOptions.length < 4 && (
                  <Button variant="ghost" className="w-full text-xs font-bold text-primary hover:bg-primary/10" onClick={addPollOption}>
                    <PlusSquare className="h-4 w-4 mr-2" /> Add Option
                  </Button>
                )}
              </div>
            </div>
          )}

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

        <div className="p-4 pb-10 bg-white dark:bg-card border-t shrink-0 sm:pb-4">
          <DialogClose asChild>
            <Button 
              className="w-full h-12 font-bold text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-none"
              disabled={(!content.trim() && selectedMedia.length === 0 && !pollQuestion) || isOverLimit}
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
