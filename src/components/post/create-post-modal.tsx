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
  Play,
  Check,
  History,
  Users2
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

const USER_PROFILE = {
  name: "John Doe",
  username: "johndoe_creative",
  avatar: "https://picsum.photos/seed/me/200/200",
  homeLocation: "Lagos, Nigeria"
};

export function CreatePostModal({ children }: CreatePostModalProps) {
  const { addPost } = usePosts();
  const [content, setContent] = useState("");
  const [privacy, setPrivacy] = useState<PrivacySetting>(privacySettings[0]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  
  const [isPollOpen, setIsPollOpen] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [feeling, setFeeling] = useState<{ emoji: string; text: string } | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [isTagging, setIsTagging] = useState(false);
  const [collaborator, setCollaborator] = useState<typeof mockFriends[0] | null>(null);
  
  const [showFeelingSelector, setShowFeelingSelector] = useState(false);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [recentLocations, setRecentLocations] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const CHARACTER_LIMIT = 2000;
  const MAX_PHOTOS = 6;
  const MAX_POLL_OPTIONS = 8;

  useEffect(() => {
    const saved = localStorage.getItem('vimore_recent_locations');
    if (saved) {
      try {
        setRecentLocations(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load recents", e);
      }
    }
  }, []);

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
    words.pop(); // Remove the incomplete @mention
    setContent([...words, `@${friend.username}`, ""].join(" "));
    setIsTagging(false);
  };

  const handlePost = () => {
    if (location) {
      const updatedRecents = [location, ...recentLocations.filter(l => l !== location)].slice(0, 5);
      setRecentLocations(updatedRecents);
      localStorage.setItem('vimore_recent_locations', JSON.stringify(updatedRecents));
    }

    addPost({
      user: {
        name: USER_PROFILE.name,
        username: USER_PROFILE.username,
        avatar: USER_PROFILE.avatar,
        isOnline: true
      },
      collaborator: collaborator || undefined,
      content,
      images: mediaType === 'image' ? selectedMedia : undefined,
      image: mediaType === 'video' ? undefined : (selectedMedia[0] || undefined),
      feeling: feeling || undefined,
      location: location || undefined,
      poll: isPollOpen && pollQuestion ? {
        question: pollQuestion,
        options: pollOptions.filter(o => o.trim()).map(text => ({ text, votes: 0 })),
        totalVotes: 0
      } : undefined
    });

    toast({ title: "Post created!", description: "Your post has been shared with the community." });
    
    // Reset state
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
  };

  const handlePhotoUploadClick = () => {
    if (isPollOpen) {
      toast({ title: "Incompatible content", description: "You cannot add photos to a poll.", variant: "destructive" });
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
    if (mediaType === 'image' && selectedMedia.length > 0) {
      setSelectedMedia([]);
      setMediaType(null);
    }
    videoInputRef.current?.click();
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
    if (updated.length === 0) setMediaType(null);
  };

  const togglePoll = () => {
    if (selectedMedia.length > 0) {
      toast({ title: "Incompatible content", description: "You cannot add a poll to a post that already has media.", variant: "destructive" });
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

  const progress = (content.length / CHARACTER_LIMIT) * 100;
  const isOverLimit = content.length > CHARACTER_LIMIT;

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
      onClick: () => {
        setShowFeelingSelector(!showFeelingSelector);
        setShowLocationSelector(false);
      } 
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
      color: "text-red-500",
      onClick: () => {
        setShowLocationSelector(!showLocationSelector);
        setShowFeelingSelector(false);
      } 
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-none w-screen h-[100dvh] m-0 rounded-none border-none flex flex-col p-0 gap-0 overflow-hidden bg-white dark:bg-background translate-x-0 translate-y-0 left-0 top-0" aria-describedby="create-post-description">
        <DialogTitle className="sr-only">Create a New Post</DialogTitle>
        <DialogDescription className="sr-only" id="create-post-description">Interface to compose text, upload media, add polls, feelings, and locations.</DialogDescription>
        
        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileChange} />
        <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={handleVideoFileChange} />

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
            >
              POST
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pb-safe">
          <div className="p-4 flex items-center gap-3">
            <Avatar className="h-12 w-12 border border-primary/10">
              <AvatarImage src={USER_PROFILE.avatar} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <div className="flex flex-wrap items-center gap-1">
                <p className="font-bold text-base">{USER_PROFILE.name}</p>
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
                  <DropdownMenuContent align="start" className="w-64 rounded-xl p-2">
                    <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase">Select Audience</div>
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
                    <Button variant="secondary" size="sm" className={cn(
                      "h-7 px-2 rounded-md flex items-center gap-1.5",
                      collaborator ? "bg-primary/10 text-primary border-primary/20" : "bg-secondary/60"
                    )}>
                      <Users2 className="h-3.5 w-3.5" />
                      <span className="text-[13px] font-bold">
                        {collaborator ? `With ${collaborator.name}` : "Collaborator"}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 rounded-xl p-2">
                    <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase">Tag Collaborator</div>
                    {collaborator && (
                      <DropdownMenuItem className="py-2.5 text-destructive font-bold cursor-pointer" onClick={() => setCollaborator(null)}>
                        Remove Collaborator
                      </DropdownMenuItem>
                    )}
                    {mockFriends.map((friend) => (
                      <DropdownMenuItem key={friend.username} className="flex items-center gap-3 py-2.5 cursor-pointer" onClick={() => setCollaborator(friend)}>
                        <Avatar className="h-8 w-8"><AvatarImage src={friend.avatar} /><AvatarFallback>{friend.name[0]}</AvatarFallback></Avatar>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{friend.name}</span>
                          <span className="text-[10px] text-muted-foreground">@{friend.username}</span>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          <div className="px-4 relative min-h-[160px]">
            <Textarea 
              placeholder="What's on your mind?" 
              className="border-none focus-visible:ring-0 text-2xl resize-none p-0 placeholder:text-muted-foreground/50 min-h-[120px] bg-transparent"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
            
            {isTagging && (
              <div className="absolute top-0 left-4 right-4 z-50 mt-1 bg-white dark:bg-card border rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2">
                <p className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mention Friends</p>
                {mockFriends.map((friend) => (
                  <button key={friend.username} className="w-full flex items-center gap-3 p-2 hover:bg-secondary rounded-lg transition-colors" onClick={() => handleMention(friend)}>
                    <Avatar className="h-8 w-8"><AvatarImage src={friend.avatar} /><AvatarFallback>{friend.name[0]}</AvatarFallback></Avatar>
                    <div className="text-left">
                      <span className="font-bold text-sm block">{friend.name}</span>
                      <span className="text-[10px] text-muted-foreground">@{friend.username}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="absolute bottom-2 right-4 flex items-center gap-2">
              <div className="relative w-6 h-6">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path className="text-muted/30" strokeDasharray="100, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className={cn(isOverLimit ? "text-destructive" : progress > 90 ? "text-yellow-500" : "text-primary")} strokeDasharray={`${Math.min(progress, 100)}, 100`} strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
              </div>
              <span className={cn("text-[10px] font-bold", isOverLimit && "text-destructive")}>{CHARACTER_LIMIT - content.length}</span>
            </div>
          </div>

          {showFeelingSelector && (
            <div className="mx-4 mb-4 p-4 border border-primary/20 rounded-2xl bg-white dark:bg-card shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">How are you feeling?</span>
                <button onClick={() => setShowFeelingSelector(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {feelings.map((f) => (
                  <button
                    key={f.text}
                    onClick={() => { setFeeling(f); setShowFeelingSelector(false); }}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-xl text-sm transition-all border",
                      feeling?.text === f.text 
                        ? "bg-primary/10 border-primary text-primary font-bold" 
                        : "hover:bg-secondary/50 border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="text-lg">{f.emoji}</span>
                    <span className="truncate">{f.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {showLocationSelector && (
            <div className="mx-4 mb-4 p-4 border border-primary/20 rounded-2xl bg-white dark:bg-card shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Add Location</span>
                <button onClick={() => setShowLocationSelector(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <form onSubmit={handleLocationSubmit} className="relative mb-4">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Where are you?" 
                  className="pl-9 rounded-xl border-primary/10 focus-visible:ring-primary h-11"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  autoFocus
                />
              </form>

              <ScrollArea className="h-[200px] -mx-4 px-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">From your profile</p>
                    <button
                      onClick={() => { setLocation(USER_PROFILE.homeLocation); setShowLocationSelector(false); }}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl transition-all border",
                        location === USER_PROFILE.homeLocation ? "bg-primary/10 border-primary" : "hover:bg-secondary/50 border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold">{USER_PROFILE.homeLocation}</p>
                          <p className="text-[10px] text-muted-foreground">Home Town</p>
                        </div>
                      </div>
                      {location === USER_PROFILE.homeLocation && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  </div>

                  {recentLocations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recent places</p>
                      <div className="space-y-1">
                        {recentLocations.map((loc) => (
                          <button
                            key={loc}
                            onClick={() => { setLocation(loc); setShowLocationSelector(false); }}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-xl transition-all border",
                              location === loc ? "bg-primary/10 border-primary" : "hover:bg-secondary/50 border-transparent"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <History className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{loc}</span>
                            </div>
                            {location === loc && <Check className="h-4 w-4 text-primary" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {isPollOpen && (
            <div className="mx-4 mb-4 p-4 border border-primary/20 rounded-2xl bg-primary/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase">Poll Settings</span>
                <button onClick={() => setIsPollOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <Input placeholder="Ask a question..." className="bg-white border-primary/10 rounded-xl" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} />
              <div className="space-y-2">
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input placeholder={`Option ${i + 1}`} className="bg-white border-primary/10 rounded-xl flex-1" value={opt} onChange={(e) => {
                      const newOptions = [...pollOptions];
                      newOptions[i] = e.target.value;
                      setPollOptions(newOptions);
                    }} />
                    {pollOptions.length > 2 && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}><X className="h-4 w-4" /></Button>}
                  </div>
                ))}
                {pollOptions.length < MAX_POLL_OPTIONS && (
                  <Button variant="ghost" className="w-full text-xs font-bold text-primary" onClick={() => setPollOptions([...pollOptions, ""])}>
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
                        <><video src={url} className="object-cover w-full h-full opacity-60" /><Play className="absolute h-8 w-8 text-white fill-white/20" /></>
                      ) : (
                        <Image src={url} alt={`Preview ${i}`} fill className="object-cover" />
                      )}
                      <button onClick={() => removeMedia(i)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 z-10"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  {mediaType === 'image' && selectedMedia.length < MAX_PHOTOS && !isPollOpen && (
                    <button onClick={handlePhotoUploadClick} className="w-32 h-32 rounded-lg border-2 border-dashed border-primary/20 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-primary/5">
                      <PlusSquare className="h-6 w-6" /><span className="text-[10px] font-bold">Add More</span>
                    </button>
                  )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}

          <div className="border-t">
            {actionItems.map((item, i) => (
              <button key={i} onClick={item.onClick} disabled={item.disabled} className={cn("w-full flex items-center justify-between p-4 transition-colors", item.disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-secondary/20")}>
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
            <Button className="w-full h-11 font-bold text-lg bg-primary hover:bg-primary/90 text-white rounded-lg" disabled={(!content.trim() && selectedMedia.length === 0 && !pollQuestion) || isOverLimit} onClick={handlePost}>
              POST
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
