
"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  ChevronDown, 
  Smile, 
  MapPin, 
  UserPlus, 
  Globe,
  Lock,
  Users,
  X,
  ListTodo,
  PlusSquare,
  Clapperboard,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const [privacy, setPrivacy] = useState<PrivacySetting>(privacySettings[0]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [feeling, setFeeling] = useState<{ emoji: string; text: string } | null>(null);
  const [isTagging, setIsTagging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const CHARACTER_LIMIT = 2000;
  const MAX_PHOTOS = 6;
  const MAX_POLL_OPTIONS = 8;

  useEffect(() => {
    const words = content.split(/\s+/);
    const lastWord = words[words.length - 1] || "";
    if (lastWord.startsWith("@")) {
      setIsTagging(true);
    } else {
      setIsTagging(false);
    }
  }, [content]);

  const handleMention = (friend: typeof mockFriends[0]) => {
    const words = content.split(/\s+/);
    words.pop();
    setContent([...words, `@${friend.name.replace(/\s+/g, '')}`, ""].join(" "));
    setIsTagging(false);
  };

  const handlePost = () => {
    toast({ title: "Post created!", description: "Your post has been shared with the community." });
    setContent("");
    setSelectedMedia([]);
    setMediaType(null);
    setIsPollOpen(false);
    setFeeling(null);
  };

  const handlePhotoUploadClick = () => {
    if (isPollOpen) {
      toast({ 
        title: "Incompatible content", 
        description: "You cannot add photos to a poll.",
        variant: "destructive"
      });
      return;
    }
    
    if (mediaType === 'video') {
      toast({ 
        title: "Selection cleared", 
        description: "Removing video to add photos.",
        variant: "default"
      });
      setSelectedMedia([]);
      setMediaType(null);
    }
    
    if (selectedMedia.length >= MAX_PHOTOS) {
      toast({ 
        title: "Limit reached", 
        description: `You can only upload up to ${MAX_PHOTOS} photos.`,
        variant: "destructive"
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleVideoUploadClick = () => {
    if (isPollOpen) {
      toast({ 
        title: "Incompatible content", 
        description: "You cannot add a video to a poll.",
        variant: "destructive"
      });
      return;
    }

    if (mediaType === 'image' && selectedMedia.length > 0) {
      toast({ 
        title: "Selection cleared", 
        description: "Removing photos to add a video.",
        variant: "default"
      });
      setSelectedMedia([]);
      setMediaType(null);
    }
    
    if (selectedMedia.length >= 1 && mediaType === 'video') {
      toast({ 
        title: "Limit reached", 
        description: "You can only upload 1 video per post.",
        variant: "destructive"
      });
      return;
    }
    videoInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setMediaType('image');
    const remainingSlots = MAX_PHOTOS - selectedMedia.length;
    const filesArray = Array.from(files).slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      toast({
        title: "Some photos skipped",
        description: `You can only have ${MAX_PHOTOS} photos total per post.`,
        variant: "destructive"
      });
    }

    filesArray.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedMedia(prev => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaType('video');
    setSelectedMedia([]); 

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSelectedMedia([base64String]);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const removeMedia = (index: number) => {
    const updated = selectedMedia.filter((_, i) => i !== index);
    setSelectedMedia(updated);
    if (updated.length === 0) {
      setMediaType(null);
    }
  };

  const togglePoll = () => {
    if (selectedMedia.length > 0) {
      toast({ 
        title: "Incompatible content", 
        description: "You cannot add a poll to a post that already has photos or videos.",
        variant: "destructive"
      });
      return;
    }
    setIsPollOpen(!isPollOpen);
  };

  const addPollOption = () => {
    if (pollOptions.length < MAX_POLL_OPTIONS) {
      setPollOptions(prev => [...prev, ""]);
    }
  };

  const updatePollOption = (index: number, val: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = val;
    setPollOptions(newOptions);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(prev => prev.filter((_, i) => i !== index));
    }
  };

  const actionItems = [
    { 
      icon: ImageIcon, 
      label: "Photo", 
      color: "text-green-500", 
      onClick: handlePhotoUploadClick,
      disabled: isPollOpen 
    },
    { 
      icon: Clapperboard, 
      label: "Video", 
      color: "text-red-500", 
      onClick: handleVideoUploadClick,
      disabled: isPollOpen 
    },
    { 
      icon: ListTodo, 
      label: "Create Poll", 
      color: "text-purple-500", 
      onClick: togglePoll,
      disabled: selectedMedia.length > 0 
    },
    { 
      icon: Smile, 
      label: "Feeling/activity", 
      color: "text-yellow-500", 
      onClick: () => setFeeling({ emoji: "😊", text: "Happy" }) 
    },
    { 
      icon: UserPlus, 
      label: "Tag people", 
      color: "text-blue-500", 
      onClick: () => setContent(prev => prev + " @") 
    },
    { 
      icon: MapPin, 
      label: "Add location", 
      color: "text-red-500" 
    },
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
        <DialogDescription className="sr-only" id="create-post-description">Interface to compose text, upload photos (up to 6) or a single video from device, add polls, and tagging for a new social media post.</DialogDescription>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          multiple 
          accept="image/*" 
          onChange={handleFileChange}
        />
        <input 
          type="file" 
          ref={videoInputRef} 
          className="hidden" 
          accept="video/*" 
          onChange={handleVideoFileChange}
        />

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

        <div className="flex-1 overflow-y-auto pb-safe">
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
                  <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase">Select Audience</div>
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
                <button className="h-6 w-6" onClick={() => setIsPollOpen(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Input 
                placeholder="Ask a question..." 
                className="bg-white border-primary/10 rounded-xl"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
              />
              <div className="space-y-2">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input 
                      placeholder={`Option ${i + 1}`}
                      className="bg-white border-primary/10 rounded-xl flex-1"
                      value={opt}
                      onChange={(e) => updatePollOption(i, e.target.value)}
                    />
                    {pollOptions.length > 2 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => removePollOption(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {pollOptions.length < MAX_POLL_OPTIONS && (
                  <Button variant="ghost" className="w-full text-xs font-bold text-primary hover:bg-primary/10" onClick={addPollOption}>
                    <PlusSquare className="h-4 w-4 mr-2" /> Add Option ({pollOptions.length}/{MAX_POLL_OPTIONS})
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
                    <div key={i} className="relative w-32 h-32 rounded-lg overflow-hidden shrink-0 border border-primary/10 bg-black flex items-center justify-center">
                      {mediaType === 'video' ? (
                        <>
                          <video src={url} className="object-cover w-full h-full opacity-60" />
                          <Play className="absolute h-8 w-8 text-white fill-white/20" />
                        </>
                      ) : (
                        <Image src={url} alt={`Preview ${i}`} fill className="object-cover" />
                      )}
                      <button 
                        onClick={() => removeMedia(i)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors z-10"
                        aria-label="Remove media"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {mediaType === 'image' && selectedMedia.length < MAX_PHOTOS && !isPollOpen && (
                    <button 
                      onClick={handlePhotoUploadClick}
                      className="w-32 h-32 rounded-lg border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-colors text-muted-foreground"
                    >
                      <PlusSquare className="h-6 w-6" />
                      <span className="text-[10px] font-bold">Add More ({MAX_PHOTOS - selectedMedia.length})</span>
                    </button>
                  )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}

          <div className="border-t">
            {actionItems.map((item, i) => (
              <button 
                key={i} 
                onClick={item.onClick}
                disabled={item.disabled}
                className={cn(
                  "w-full flex items-center justify-between p-4 transition-colors",
                  item.disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-secondary/20"
                )}
                aria-label={item.label}
              >
                <div className="flex items-center gap-4">
                  <item.icon className={cn("h-6 w-6", item.color)} />
                  <span className="text-base font-medium">{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-card border-t shrink-0">
          <DialogClose asChild>
            <Button 
              className="w-full h-11 font-bold text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-none"
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
