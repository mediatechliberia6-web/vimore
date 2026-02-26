"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  ImageIcon, 
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
  Play,
  Check,
  History,
  Users2,
  Bold,
  Italic,
  Code,
  Palette,
  Clock,
  Settings2,
  MessageCircleOff,
  Filter,
  Wand2,
  Trash2,
  Video
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
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { aiSuggestHashtags } from "@/app/actions/ai";

interface CreatePostModalProps {
  children: React.ReactNode;
}

type PrivacySetting = {
  id: string;
  label: string;
  icon: any;
  description: string;
};

const privacySettings: PrivacySetting[] = [
  { id: "public", label: "Public", icon: Globe, description: "Anyone on or off ViMore" },
  { id: "friends", label: "Friends", icon: Users, description: "Your friends on ViMore" },
  { id: "private", label: "Only Me", icon: Lock, description: "Only you can see this post" },
];

const mockFriends = [
  { name: "Alex Rivera", username: "arivera", avatar: "https://picsum.photos/seed/1/100/100" },
  { name: "Sarah Chen", username: "schen_dev", avatar: "https://picsum.photos/seed/2/100/100" },
  { name: "Marcus Stone", username: "mstone", avatar: "https://picsum.photos/seed/3/100/100" },
  { name: "Julianne Moore", username: "jmoore", avatar: "https://picsum.photos/seed/50/200/200" },
];

const feelings = [
  { emoji: "😊", text: "Happy" },
  { emoji: "😇", text: "Blessed" },
  { emoji: "🤩", text: "Excited" },
  { emoji: "🥰", text: "Loved" },
  { emoji: "😎", text: "Cool" },
  { emoji: "🤔", text: "Thinking" },
  { emoji: "😴", text: "Tired" },
  { emoji: "🥳", text: "Celebrating" },
];

const backgroundThemes = [
  { id: "none", label: "Default", class: "bg-transparent" },
  { id: "purple-grad", label: "ViMore Purple", class: "bg-gradient-to-br from-primary to-accent text-white" },
  { id: "ocean", label: "Ocean Breeze", class: "bg-gradient-to-br from-blue-400 to-emerald-400 text-white" },
  { id: "sunset", label: "Sunset Glow", class: "bg-gradient-to-br from-orange-500 to-rose-500 text-white" },
  { id: "royal", label: "Royal", class: "bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white" },
  { id: "midnight", label: "Midnight", class: "bg-gradient-to-br from-slate-900 to-slate-700 text-white" },
];

const imageFilters = [
  { id: "none", label: "None", class: "" },
  { id: "grayscale", label: "Mono", class: "grayscale" },
  { id: "sepia", label: "Sepia", class: "sepia" },
  { id: "brightness", label: "Lume", class: "brightness-125 contrast-110" },
  { id: "invert", label: "Noir", class: "invert" },
  { id: "saturate", label: "Vivid", class: "saturate-150" },
];

const pollDurations = ["1 Hour", "6 Hours", "12 Hours", "24 Hours", "3 Days", "7 Days"];

const USER_PROFILE = {
  name: "John Doe",
  username: "johndoe_creative",
  avatar: "https://picsum.photos/seed/me/200/200",
  homeLocation: "Lagos, Nigeria"
};

export function CreatePostModal({ children }: CreatePostModalProps) {
  const { addPost } = usePosts();
  const { openCaptureStudio, triggerHaptic } = useMusic();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState<PrivacySetting>(privacySettings[0]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [pollDuration, setPollDuration] = useState("24 Hours");
  
  const [feeling, setFeeling] = useState<{ emoji: string; text: string } | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [isTagging, setIsTagging] = useState(false);
  const [collaborator, setCollaborator] = useState<typeof mockFriends[0] | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(backgroundThemes[0]);
  const [selectedFilter, setSelectedFilter] = useState(imageFilters[0]);
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  
  const [showFeelingSelector, setShowFeelingSelector] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFilterSelector, setShowFilterSelector] = useState(false);
  const [recentLocations, setRecentLocations] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  const MAX_PHOTOS = 6;
  const MAX_POLL_OPTIONS = 8;

  // HIGH-VELOCITY LIMITS: 150 for themed/media, 2000 for pure text
  const isLimitedType = selectedTheme.id !== "none" || selectedMedia.length > 0 || mediaType !== null || isPollOpen;
  const currentLimit = isLimitedType ? 150 : 2000;
  const progress = (content.length / currentLimit) * 100;
  const isOverLimit = content.length > currentLimit;

  useEffect(() => {
    const savedContent = localStorage.getItem('vimore_post_draft');
    if (savedContent) setContent(savedContent);
    
    const savedLocs = localStorage.getItem('vimore_recent_locations');
    if (savedLocs) {
      try {
        setRecentLocations(JSON.parse(savedLocs));
      } catch (e) {
        console.error("Failed to load recents", e);
      }
    }
  }, []);

  useEffect(() => {
    if (content) {
      localStorage.setItem('vimore_post_draft', content);
    }
  }, [content]);

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
    setContent([...words, `@${friend.username}`, ""].join(" "));
    setIsTagging(false);
  };

  const applyFormatting = (prefix: string, suffix: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = content;
    const selected = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    setContent(`${before}${prefix}${selected}${suffix}${after}`);
    
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleAiEnhance = async () => {
    if (!content.trim()) return;
    setIsAiLoading(true);
    try {
      const hashtagsRes = await aiSuggestHashtags({ postContent: content });
      const tags = hashtagsRes.hashtags.join(" ");
      setContent(prev => `${prev}\n\n${tags}`);
      toast({ title: "AI Enhanced!", description: "Suggested hashtags added to your post." });
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: "Failed to enhance post. Try again." });
    } finally {
      setIsAiLoading(false);
    }
  };

  const clearDraft = () => {
    setContent("");
    localStorage.removeItem('vimore_post_draft');
    toast({ description: "Draft cleared." });
  };

  const handlePost = () => {
    if (location) {
      const updatedRecents = [location, ...recentLocations.filter(l => l !== location)].slice(0, 5);
      setRecentLocations(updatedRecents);
      localStorage.setItem('vimore_recent_locations', JSON.stringify(updatedRecents));
    }

    const creationLanguage = typeof window !== 'undefined' ? window.navigator.language.split('-')[0] : 'en';

    addPost({
      user: {
        name: USER_PROFILE.name,
        username: USER_PROFILE.username,
        avatar: USER_PROFILE.avatar,
        isOnline: true
      },
      collaborator: collaborator || undefined,
      content,
      language: creationLanguage,
      theme: selectedTheme.id !== "none" ? selectedTheme.class : undefined,
      images: mediaType === 'image' ? selectedMedia : undefined,
      image: mediaType === 'video' ? undefined : (selectedMedia[0] || undefined),
      videoUrl: mediaType === 'video' ? selectedMedia[0] : undefined,
      imageFilter: selectedFilter.id !== "none" ? selectedFilter.class : undefined,
      feeling: feeling || undefined,
      location: location || undefined,
      commentsDisabled,
      poll: isPollOpen && pollQuestion ? {
        question: pollQuestion,
        options: pollOptions.filter(o => o.trim()).map(text => ({ text, votes: 0 })),
        totalVotes: 0,
        duration: pollDuration
      } : undefined
    });

    toast({ title: "Vibe Shared!", description: mediaType === 'video' ? "Your Reel is now live." : "Your post has been shared." });
    localStorage.removeItem('vimore_post_draft');
    
    setContent("");
    setSelectedMedia([]);
    setMediaType(null);
    setIsPollOpen(false);
    setFeeling(null);
    setLocation(null);
    setLocationSearch("");
    setPollQuestion("");
    setPollOptions(["", ""]);
    setCollaborator(null);
    setSelectedTheme(backgroundThemes[0]);
    setSelectedFilter(imageFilters[0]);
    setCommentsDisabled(false);
    setIsOpen(false);
  };

  const handlePhotoUploadClick = () => {
    if (isPollOpen) {
      toast({ title: "Incompatible content", description: "You cannot add photos to a poll.", variant: "destructive" });
      return;
    }
    if (selectedTheme.id !== "none") {
      toast({ title: "Incompatible content", description: "You cannot add photos to a themed post.", variant: "destructive" });
      return;
    }
    if (mediaType === 'video') {
      setSelectedMedia([]);
      setMediaType(null);
    }
    if (selectedMedia.length >= MAX_PHOTOS) {
      toast({ title: "Limit reached", description: `You can only upload up to ${MAX_PHOTOS} photos.`, variant: "destructive" });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleVideoUploadClick = () => {
    if (isPollOpen) {
      toast({ title: "Incompatible content", description: "You cannot add a video to a poll.", variant: "destructive" });
      return;
    }
    if (selectedTheme.id !== "none") {
      toast({ title: "Incompatible content", description: "You cannot add a video to a themed post.", variant: "destructive" });
      return;
    }
    triggerHaptic(15);
    setIsOpen(false);
    openCaptureStudio();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setMediaType('image');
    const remainingSlots = MAX_PHOTOS - selectedMedia.length;
    const filesArray = Array.from(files).slice(0, remainingSlots);
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

  const removeMedia = (index: number) => {
    const itemToRemove = selectedMedia[index];
    if (itemToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(itemToRemove);
    }
    const updated = selectedMedia.filter((_, i) => i !== index);
    setSelectedMedia(updated);
    if (updated.length === 0) {
      setMediaType(null);
      setSelectedFilter(imageFilters[0]);
    }
  };

  const togglePoll = () => {
    if (selectedMedia.length > 0) {
      toast({ title: "Incompatible content", description: "You cannot add a poll to a post that already has media.", variant: "destructive" });
      return;
    }
    if (selectedTheme.id !== "none") {
      toast({ title: "Incompatible content", description: "Themes only work for text posts.", variant: "destructive" });
      return;
    }
    setIsPollOpen(!isPollOpen);
  };

  const handleLocationSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (locationSearch.trim()) {
      setLocation(locationSearch.trim());
      setShowLocationSelector(false);
    }
  };

  const actionItems = [
    { icon: ImageIcon, label: "Photo", color: "text-green-500", onClick: handlePhotoUploadClick, disabled: isPollOpen || selectedTheme.id !== "none" },
    { icon: Video, label: "Upload Reel", color: "text-red-500", onClick: handleVideoUploadClick, disabled: isPollOpen || selectedTheme.id !== "none" },
    { icon: ListTodo, label: "Create Poll", color: "text-purple-500", onClick: togglePoll, disabled: selectedMedia.length > 0 || selectedTheme.id !== "none" },
    { icon: Palette, label: "Theme", color: "text-pink-500", onClick: () => { if (selectedMedia.length > 0 || isPollOpen) { toast({ title: "Incompatible content", description: "Themes only work for text posts.", variant: "destructive" }); return; } setShowThemeSelector(!showThemeSelector); setShowFeelingSelector(false); setShowLocationSelector(false); setShowSettings(false); } },
    { icon: Smile, label: "Feeling/activity", color: "text-yellow-500", onClick: () => { setShowFeelingSelector(!showFeelingSelector); setShowLocationSelector(false); setShowThemeSelector(false); setShowSettings(false); } },
    { icon: UserPlus, label: "Tag people", color: "text-blue-500", onClick: () => setContent(prev => prev + " @") },
    { icon: MapPin, label: "Add location", color: "text-red-500", onClick: () => { setShowLocationSelector(!showLocationSelector); setShowFeelingSelector(false); setShowThemeSelector(false); setShowSettings(false); } },
    { icon: Settings2, label: "Post Settings", color: "text-slate-500", onClick: () => { setShowSettings(!showSettings); setShowFeelingSelector(false); setShowLocationSelector(false); setShowThemeSelector(false); } }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-none w-screen h-[100dvh] m-0 rounded-none border-none flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-background translate-x-0 translate-y-0 left-0 top-0">
        <DialogTitle className="sr-only">Create a New Post</DialogTitle>
        <DialogHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between space-y-0 bg-white dark:bg-card">
          <div className="flex items-center gap-4">
            <DialogClose asChild><Button variant="ghost" size="icon" className="rounded-full h-8 w-8"><ArrowLeft className="h-6 w-6" /></Button></DialogClose>
            <DialogTitle className="font-bold text-lg">Create post</DialogTitle>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="text-primary h-9 w-9" onClick={handleAiEnhance} disabled={isAiLoading || !content.trim()}>{isAiLoading ? <Clock className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}</Button>
            {content && <Button variant="ghost" size="icon" className="text-destructive h-9 w-9" onClick={clearDraft}><Trash2 className="h-5 w-5" /></Button>}
            <Button variant="ghost" className={cn("font-bold text-primary text-base", ((!content.trim() && selectedMedia.length === 0 && !pollQuestion) || isOverLimit) && "opacity-50")} disabled={(!content.trim() && selectedMedia.length === 0 && !pollQuestion) || isOverLimit} onClick={handlePost}>POST</Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pb-safe">
          <div className="p-4 flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-primary/10"><AvatarImage src={USER_PROFILE.avatar} /><AvatarFallback>JD</AvatarFallback></Avatar>
            <div className="flex flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-1">
                <p className="font-bold text-base">{USER_PROFILE.name}</p>
                {feeling && <span className="text-[13px] text-muted-foreground">— is {feeling.emoji} {feeling.text}</span>}
                {location && <span className="text-[13px] text-muted-foreground">— in <span className="font-bold text-foreground">{location}</span></span>}
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm" className="h-7 px-2 bg-secondary/60 rounded-md flex items-center gap-1.5"><privacy.icon className="h-3.5 w-3.5" /><span className="text-[13px] font-bold">{privacy.label}</span><ChevronDown className="h-3.5 w-3.5" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 rounded-xl p-2">
                    {privacySettings.map((item) => (
                      <DropdownMenuItem key={item.id} className="flex flex-col items-start gap-0.5 py-3 cursor-pointer" onClick={() => setPrivacy(item)}>
                        <div className="flex items-center gap-2 font-bold text-sm"><item.icon className="h-4 w-4" />{item.label}</div>
                        <span className="text-[10px] text-muted-foreground ml-6">{item.description}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm" className={cn("h-7 px-2 rounded-md flex items-center gap-1.5", collaborator ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary/60")}><Users2 className="h-3.5 w-3.5" /><span className="text-[13px] font-bold">{collaborator ? `With ${collaborator.name}` : "Collaborator"}</span><ChevronDown className="h-3.5 w-3.5" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 rounded-xl p-2">
                    {mockFriends.map((friend) => (
                      <DropdownMenuItem key={friend.username} className="flex items-center gap-3 py-2.5 cursor-pointer" onClick={() => setCollaborator(friend)}>
                        <Avatar className="h-8 w-8"><AvatarImage src={friend.avatar} /><AvatarFallback>{friend.name[0]}</AvatarFallback></Avatar>
                        <div className="flex flex-col"><span className="font-bold text-sm">{friend.name}</span><span className="text-[10px] text-muted-foreground">@{friend.username}</span></div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="p-4 border-b flex gap-4 bg-secondary/10">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => applyFormatting("**", "**")}><Bold className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => applyFormatting("_", "_")}><Italic className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => applyFormatting("`", "`")}><Code className="h-4 w-4" /></Button>
          </div>

          <div className={cn("px-4 relative min-h-[220px] transition-all duration-300 flex items-center justify-center p-8", selectedTheme.class)}>
            <Textarea ref={textareaRef} placeholder={isLimitedType ? "Short vibe... (150 chars max)" : "What's on your mind? (2000 chars max)"} className={cn("border-none focus-visible:ring-0 text-2xl resize-none p-0 min-h-[160px] bg-transparent text-center", selectedTheme.id !== "none" ? "text-white placeholder:text-white/60" : "text-foreground")} value={content} onChange={(e) => setContent(e.target.value)} autoFocus />
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
              <div className="relative w-6 h-6">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path className="text-muted/30" strokeDasharray="100, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className={cn(isOverLimit ? "text-destructive" : progress > 90 ? "text-yellow-500" : "text-primary")} strokeDasharray={`${Math.min(progress, 100)}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
              </div>
              <span className={cn("text-[10px] font-bold", isOverLimit && "text-destructive")}>{currentLimit - content.length}</span>
            </div>
          </div>

          {isPollOpen && (
            <div className="mx-4 mb-4 p-4 border border-primary/20 rounded-2xl bg-primary/5 space-y-4">
              <Input placeholder="Ask a question..." className="bg-white border-primary/10 rounded-xl" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} />
              <div className="space-y-2">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input placeholder={`Option ${i + 1}`} className="bg-white border-primary/10 rounded-xl flex-1" value={opt} onChange={(e) => { const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n); }} />
                    {pollOptions.length > 2 && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>}
                  </div>
                ))}
                {pollOptions.length < MAX_POLL_OPTIONS && <Button variant="ghost" className="w-full text-xs font-bold text-primary" onClick={() => setPollOptions([...pollOptions, ""])}><PlusSquare className="h-4 w-4 mr-2" /> Add Option</Button>}
              </div>
            </div>
          )}

          <div className="border-t">
            {actionItems.map((item, i) => (
              <button key={i} onClick={item.onClick} disabled={item.disabled} className={cn("w-full flex items-center justify-between p-4 transition-colors", item.disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-secondary/20")}>
                <div className="flex items-center gap-4"><item.icon className={cn("h-6 w-6", item.color)} /><span className="text-base font-medium">{item.label}</span></div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-card border-t shrink-0">
          <Button className="w-full h-11 font-bold text-lg bg-primary hover:bg-primary/90 text-white rounded-lg" disabled={(!content.trim() && selectedMedia.length === 0 && !pollQuestion) || isOverLimit} onClick={handlePost}>POST</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}