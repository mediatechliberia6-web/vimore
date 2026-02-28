
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
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
  Video,
  Search,
  Coins,
  ShieldCheck,
  AlertTriangle,
  Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn, parseFollowerCount } from "@/lib/utils";
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
import { Slider } from "@/components/ui/slider";
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

const feelings = [
  { emoji: "😊", text: "Happy" },
  { emoji: "😇", text: "Blessed" },
  { emoji: "🤩", text: "Excited" },
  { emoji: "🥰", text: "Loved" },
  { emoji: "😎", text: "Cool" },
  { emoji: "🤔", text: "Thinking" },
  { emoji: "😴", text: "Tired" },
  { emoji: "🥳", text: "Celebrating" },
  { emoji: "😤", text: "Productive" },
  { emoji: "🔥", text: "On Fire" },
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

export function CreatePostModal({ children }: CreatePostModalProps) {
  const { addPost, currentUser, connections, settings, isFollowing, triggerHaptic } = usePosts();
  const { openCaptureStudio } = useMusic();
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
  const [location, setLocation] = useState<string>("");
  const [isTaggingSelectorOpen, setIsTaggingSelectorOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [collaborator, setCollaborator] = useState<any | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(backgroundThemes[0]);
  const [selectedFilter, setSelectedFilter] = useState(imageFilters[0]);
  const [commentsDisabled, setCommentsDisabled] = useState(false);
  
  const [isLocked, setIsLocked] = useState(false);
  const [unlockPrice, setUnlockPrice] = useState(50);
  
  const [showFeelingSelector, setShowFeelingSelector] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  
  const TRUNCATE_LIMIT = 150; 
  const isEliteCreator = parseFollowerCount(currentUser.followers) >= 10000;

  const isLimitedType = selectedTheme.id !== "none" || selectedMedia.length > 0 || mediaType !== null || isPollOpen || isLocked;
  const currentLimit = isLimitedType ? TRUNCATE_LIMIT : 2000;
  const isOverLimit = content.length > currentLimit;

  const filteredTagResults = useMemo(() => {
    let base = connections;
    if (settings.taggingPrivacy === 'friends') base = connections.filter(c => c.followsYou && isFollowing(c.username));
    if (!tagSearch.trim()) return base;
    return base.filter(c => c.name.toLowerCase().includes(tagSearch.toLowerCase()) || c.username.toLowerCase().includes(tagSearch.toLowerCase()));
  }, [connections, tagSearch, settings.taggingPrivacy, isFollowing]);

  useEffect(() => {
    const savedContent = localStorage.getItem('vimore_post_draft');
    if (savedContent) setContent(savedContent);
  }, []);

  useEffect(() => {
    if (content) localStorage.setItem('vimore_post_draft', content);
  }, [content]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    triggerHaptic(10);
    const fileArray = Array.from(files);
    const isVideo = fileArray[0].type.startsWith('video/');

    if (isVideo) {
      setMediaType('video');
      const url = URL.createObjectURL(fileArray[0]);
      setSelectedMedia([url]);
      toast({ title: "Reel Selected", description: "Your video node is staged for sync." });
    } else {
      setMediaType('image');
      const urls = fileArray.map(file => URL.createObjectURL(file));
      setSelectedMedia(prev => [...prev, ...urls].slice(0, 10)); // Limit to 10 photos
      toast({ title: "Photos Staged", description: `${fileArray.length} visuals added to draft.` });
    }
    setSelectedTheme(backgroundThemes[0]);
    setShowThemeSelector(false);
  };

  const removeMedia = (index: number) => {
    triggerHaptic(5);
    setSelectedMedia(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) setMediaType(null);
      return updated;
    });
  };

  const handleAiEnhance = async () => {
    if (!content.trim()) return;
    setIsAiLoading(true);
    triggerHaptic(30);
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

  const handlePost = () => {
    const creationLanguage = typeof window !== 'undefined' ? window.navigator.language.split('-')[0] : 'en';

    addPost({
      user: currentUser,
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
      isLocked,
      unlockPrice: isLocked ? unlockPrice : undefined,
      poll: isPollOpen && pollQuestion ? {
        question: pollQuestion,
        options: pollOptions.filter(o => o.trim()).map(text => ({ text, votes: 0 })),
        totalVotes: 0,
        duration: pollDuration
      } : undefined
    });

    toast({ title: "Vibe Shared!", description: isLocked ? "Monetized node is now live." : "Your post has been shared." });
    localStorage.removeItem('vimore_post_draft');
    resetForm();
    setIsOpen(false);
  };

  const resetForm = () => {
    setContent("");
    setSelectedMedia([]);
    setMediaType(null);
    setIsPollOpen(false);
    setFeeling(null);
    setLocation("");
    setPollQuestion("");
    setPollOptions(["", ""]);
    setCollaborator(null);
    setSelectedTheme(backgroundThemes[0]);
    setSelectedFilter(imageFilters[0]);
    setIsLocked(false);
    setUnlockPrice(50);
    setShowFeelingSelector(false);
    setShowLocationSelector(false);
    setShowThemeSelector(false);
  };

  const toggleAction = (type: 'feeling' | 'location' | 'theme' | 'poll') => {
    triggerHaptic(5);
    if (type === 'feeling') {
      setShowFeelingSelector(!showFeelingSelector);
      setShowLocationSelector(false);
      setShowThemeSelector(false);
    } else if (type === 'location') {
      setShowLocationSelector(!showLocationSelector);
      setShowFeelingSelector(false);
      setShowThemeSelector(false);
    } else if (type === 'theme') {
      setShowThemeSelector(!showThemeSelector);
      setShowFeelingSelector(false);
      setShowLocationSelector(false);
    } else if (type === 'poll') {
      setIsPollOpen(!isPollOpen);
      setShowFeelingSelector(false);
      setShowLocationSelector(false);
      setShowThemeSelector(false);
    }
  };

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
             <Button variant="ghost" size="icon" className="text-primary h-9 w-9" onClick={handleAiEnhance} disabled={isAiLoading || !content.trim()}>{isAiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wand2 className="h-5 w-5" />}</Button>
            <Button variant="ghost" className={cn("font-bold text-primary text-base", ((!content.trim() && selectedMedia.length === 0 && !pollQuestion) || isOverLimit) && "opacity-50")} disabled={(!content.trim() && selectedMedia.length === 0 && !pollQuestion) || isOverLimit} onClick={handlePost}>POST</Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pb-safe">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-primary/10"><AvatarImage src={currentUser.avatar} /><AvatarFallback>JD</AvatarFallback></Avatar>
              <div className="flex flex-col gap-0.5">
                <div className="flex flex-wrap items-center gap-1">
                  <p className="font-bold text-base">{currentUser.name}</p>
                  {feeling && <span className="text-[13px] text-muted-foreground">— is {feeling.emoji} {feeling.text}</span>}
                  {location && <span className="text-[13px] text-muted-foreground">— in <span className="font-bold text-foreground">{location}</span></span>}
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" size="sm" className="h-7 px-2 bg-secondary/60 rounded-md flex items-center gap-1.5">
                        <privacy.icon className="h-3.5 w-3.5" />
                        <span className="text-[13px] font-bold">{privacy.label}</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 rounded-xl p-2">
                      {privacySettings.map((s) => (
                        <DropdownMenuItem key={s.id} onClick={() => setPrivacy(s)} className="gap-3 py-2.5">
                          <s.icon className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{s.label}</span>
                            <span className="text-[10px] text-muted-foreground">{s.description}</span>
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className={cn("h-7 px-2 rounded-md flex items-center gap-1.5", collaborator ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary/60")}
                    onClick={() => setIsTaggingSelectorOpen(true)}
                  >
                    <Users2 className="h-3.5 w-3.5" />
                    <span className="text-[13px] font-bold">{collaborator ? `With ${collaborator.name}` : "Collaborator"}</span>
                  </Button>
                </div>
              </div>
            </div>

            {isEliteCreator && (
              <div className="flex items-center gap-2 bg-amber-500/5 p-2 rounded-xl border border-amber-500/10">
                <Lock className={cn("h-4 w-4", isLocked ? "text-amber-500" : "text-muted-foreground/40")} />
                <Switch 
                  checked={isLocked} 
                  onCheckedChange={(val) => { triggerHaptic(10); setIsLocked(val); if(val) setIsPollOpen(false); }} 
                  className="data-[state=checked]:bg-amber-500"
                />
              </div>
            )}
          </div>

          <div className={cn("px-4 relative min-h-[220px] transition-all duration-300 flex flex-col items-center justify-center p-8", selectedTheme.class)}>
            <Textarea ref={textareaRef} placeholder={isLimitedType ? "Short vibe... (150 chars max)" : "What's on your mind? (2000 chars max)"} className={cn("border-none focus-visible:ring-0 text-2xl resize-none p-0 min-h-[160px] bg-transparent text-center", selectedTheme.id !== "none" ? "text-white placeholder:text-white/60" : "text-foreground")} value={content} onChange={(e) => setContent(e.target.value)} autoFocus />
            
            {isLocked && (
              <div className="w-full max-w-sm mt-8 p-6 bg-black/20 backdrop-blur-md rounded-[2rem] border border-white/10 space-y-6 animate-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Unlock Price</span>
                  </div>
                  <Badge className="bg-amber-500 text-white border-none font-black h-5 px-3 uppercase tracking-tighter">{unlockPrice} GOLD</Badge>
                </div>
                <Slider 
                  value={[unlockPrice]} 
                  min={20} 
                  max={200} 
                  step={10} 
                  onValueChange={(val) => setUnlockPrice(val[0])}
                  className="[&_[role=slider]]:bg-amber-500"
                />
                <div className="flex justify-between text-[8px] font-black text-white/40 uppercase tracking-widest">
                  <span>20 GD</span>
                  <span>200 GD</span>
                </div>
                <p className="text-[9px] text-center text-white/40 uppercase font-bold leading-tight">70% of energy will be synced to your vault on unlock.</p>
              </div>
            )}
          </div>

          {/* Media Preview Grid */}
          {selectedMedia.length > 0 && (
            <div className="px-4 pb-6">
              <div className={cn(
                "grid gap-2",
                selectedMedia.length === 1 ? "grid-cols-1" : "grid-cols-2"
              )}>
                {selectedMedia.map((url, i) => (
                  <div key={i} className="relative aspect-video rounded-[1.5rem] overflow-hidden group/media shadow-lg border border-primary/5">
                    {mediaType === 'video' ? (
                      <video src={url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                    ) : (
                      <Image src={url} alt="Preview" fill className={cn("object-cover", selectedFilter.class)} />
                    )}
                    <button 
                      onClick={() => removeMedia(i)}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-all active:scale-90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              {mediaType === 'image' && (
                <ScrollArea className="w-full whitespace-nowrap mt-4">
                  <div className="flex gap-3 pb-2">
                    {imageFilters.map(f => (
                      <button
                        key={f.id}
                        onClick={() => { triggerHaptic(5); setSelectedFilter(f); }}
                        className={cn(
                          "flex flex-col items-center gap-2 group",
                          selectedFilter.id === f.id ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        <div className={cn(
                          "h-12 w-12 rounded-xl border-2 transition-all overflow-hidden bg-secondary",
                          selectedFilter.id === f.id ? "border-primary scale-105" : "border-transparent"
                        )}>
                          <div className={cn("w-full h-full bg-zinc-400", f.class)} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">{f.label}</span>
                      </button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" className="opacity-0" />
                </ScrollArea>
              )}
            </div>
          )}

          {isPollOpen && (
            <div className="mx-4 mb-4 p-4 border border-primary/20 rounded-2xl bg-primary/5 space-y-4 animate-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Post Poll</span>
                <button onClick={() => setIsPollOpen(false)} className="text-primary"><X className="h-4 w-4" /></button>
              </div>
              <Input placeholder="Ask a question..." className="bg-white border-primary/10 rounded-xl" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} />
              <div className="space-y-2">
                {pollOptions.map((opt, i) => (
                  <Input key={i} placeholder={`Option ${i + 1}`} className="bg-white border-primary/10 rounded-xl" value={opt} onChange={(e) => { const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n); }} />
                ))}
              </div>
            </div>
          )}

          {/* Action Selectors */}
          <div className="px-4 space-y-4 mb-4">
            {showFeelingSelector && (
              <div className="p-4 bg-secondary/20 rounded-2xl animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Feeling</span>
                  <button onClick={() => setShowFeelingSelector(false)}><X className="h-3 w-3" /></button>
                </div>
                <ScrollArea className="w-full">
                  <div className="flex gap-2 pb-2">
                    {feelings.map((f) => (
                      <button
                        key={f.text}
                        onClick={() => { triggerHaptic(5); setFeeling(f); setShowFeelingSelector(false); }}
                        className={cn(
                          "px-4 py-2 rounded-xl border flex items-center gap-2 transition-all whitespace-nowrap",
                          feeling?.text === f.text ? "bg-primary border-primary text-white" : "bg-white dark:bg-card border-border hover:border-primary/40"
                        )}
                      >
                        <span>{f.emoji}</span>
                        <span className="text-xs font-bold">{f.text}</span>
                      </button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" className="opacity-0" />
                </ScrollArea>
              </div>
            )}

            {showLocationSelector && (
              <div className="p-4 bg-secondary/20 rounded-2xl animate-in slide-in-from-bottom-2 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Add Location</span>
                  <button onClick={() => setShowLocationSelector(false)}><X className="h-3 w-3" /></button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                  <Input 
                    placeholder="Where are you? (e.g. Lagos, Nigeria)" 
                    className="pl-10 h-12 bg-white dark:bg-card border-none rounded-xl"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            )}

            {showThemeSelector && (
              <div className="p-4 bg-secondary/20 rounded-2xl animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Theme</span>
                  <button onClick={() => setShowThemeSelector(false)}><X className="h-3 w-3" /></button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {backgroundThemes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { triggerHaptic(5); setSelectedTheme(t); if(t.id !== 'none') setSelectedMedia([]); }}
                      className={cn(
                        "h-12 rounded-xl border-2 transition-all flex items-center justify-center relative overflow-hidden",
                        selectedTheme.id === t.id ? "border-primary scale-105" : "border-transparent"
                      )}
                    >
                      <div className={cn("absolute inset-0", t.class)} />
                      <span className={cn("relative z-10 text-[9px] font-black uppercase tracking-tighter", t.id === 'none' ? "text-muted-foreground" : "text-white")}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isPollOpen || selectedTheme.id !== "none"}
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-secondary/20 disabled:opacity-30"
            >
              <div className="flex items-center gap-4">
                <ImageIcon className="h-6 w-6 text-green-500" />
                <span className="text-base font-medium">Photo</span>
              </div>
            </button>
            <button 
              onClick={() => { triggerHaptic(15); setIsOpen(false); openCaptureStudio(); }}
              disabled={isPollOpen || selectedTheme.id !== "none"}
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-secondary/20 disabled:opacity-30"
            >
              <div className="flex items-center gap-4">
                <Video className="h-6 w-6 text-red-500" />
                <span className="text-base font-medium">Upload Reel</span>
              </div>
            </button>
            <button 
              onClick={() => toggleAction('poll')}
              disabled={selectedMedia.length > 0 || selectedTheme.id !== "none"}
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-secondary/20 disabled:opacity-30"
            >
              <div className="flex items-center gap-4">
                <ListTodo className="h-6 w-6 text-purple-500" />
                <span className="text-base font-medium">Create Poll</span>
              </div>
            </button>
            <button 
              onClick={() => toggleAction('theme')}
              disabled={selectedMedia.length > 0 || isPollOpen}
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-secondary/20 disabled:opacity-30"
            >
              <div className="flex items-center gap-4">
                <Palette className="h-6 w-6 text-pink-500" />
                <span className="text-base font-medium">Theme</span>
              </div>
            </button>
            <button 
              onClick={() => toggleAction('feeling')}
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-secondary/20"
            >
              <div className="flex items-center gap-4">
                <Smile className="h-6 w-6 text-yellow-500" />
                <span className="text-base font-medium">Feeling</span>
              </div>
            </button>
            <button 
              onClick={() => setIsTaggingSelectorOpen(true)}
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-secondary/20"
            >
              <div className="flex items-center gap-4">
                <UserPlus className="h-6 w-6 text-blue-500" />
                <span className="text-base font-medium">Tag Node</span>
              </div>
            </button>
            <button 
              onClick={() => toggleAction('location')}
              className="w-full flex items-center justify-between p-4 transition-colors hover:bg-secondary/20"
            >
              <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-red-500" />
                <span className="text-base font-medium">Location</span>
              </div>
            </button>
          </div>
        </div>

        <Dialog open={isTaggingSelectorOpen} onOpenChange={setIsTaggingSelectorOpen}>
          <DialogContent className="rounded-t-[3rem] p-0 border-primary/10 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-2xl h-[80vh] flex flex-col top-auto bottom-0 translate-y-0 translate-x-[-50%]">
            <div className="mx-auto w-12 h-1.5 bg-primary/20 rounded-full mt-4 mb-2 shrink-0" />
            <DialogHeader className="px-6 py-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-black italic uppercase tracking-widest">Tag Collaborator</DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[8px] font-black border-primary/20 text-primary">{settings.taggingPrivacy.toUpperCase()} FILTER</Badge>
                </div>
              </div>
            </DialogHeader>
            <div className="px-6 pb-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Query connections..." className="pl-11 h-12 bg-secondary/30 border-none rounded-2xl" value={tagSearch} onChange={(e) => setTagSearch(e.target.value)} />
              </div>
            </div>
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-3 pb-10">
                {filteredTagResults.length > 0 ? filteredTagResults.map((person) => (
                  <button 
                    key={person.username}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl transition-all border",
                      collaborator?.username === person.username ? "bg-primary/10 border-primary/20" : "bg-secondary/20 border-transparent hover:bg-secondary/40"
                    )}
                    onClick={() => { triggerHaptic(10); setCollaborator(person); setIsTaggingSelectorOpen(false); }}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12"><AvatarImage src={person.avatar} /></Avatar>
                      <div className="text-left">
                        <p className="font-bold text-sm">{person.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-black">@{person.username}</p>
                      </div>
                    </div>
                    {collaborator?.username === person.username && <Check className="h-5 w-5 text-primary" />}
                  </button>
                )) : (
                  <div className="py-20 text-center space-y-4 opacity-40">
                    <Users2 className="h-12 w-12 mx-auto" />
                    <p className="text-sm font-bold uppercase tracking-widest">No valid nodes found</p>
                    {settings.taggingPrivacy === 'friends' && <p className="text-[10px] max-w-[200px] mx-auto">Collaboration Whitelist is active. You can only tag mutual connections.</p>}
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        <div className="p-4 bg-white dark:bg-card border-t shrink-0">
          <Button className="w-full h-11 font-bold text-lg bg-primary hover:bg-primary/90 text-white rounded-lg" disabled={(!content.trim() && selectedMedia.length === 0 && !pollQuestion) || isOverLimit} onClick={handlePost}>POST</Button>
        </div>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*,video/*" 
          multiple 
          onChange={handleFileChange} 
        />
      </DialogContent>
    </Dialog>
  );
}
