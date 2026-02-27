
"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { PostCard } from "@/components/post/post-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMusic } from "@/context/MusicContext";
import { CreateStoryModal } from "@/components/feed/create-story-modal";
import { ImageRefinementPortal } from "@/components/profile/image-refinement-portal";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Camera, 
  Edit2, 
  MoreHorizontal, 
  LayoutDashboard,
  Plus,
  Volume2,
  Play,
  Star,
  Zap,
  Languages,
  Copy,
  AtSign,
  Bookmark,
  UserCheck,
  UserMinus,
  Mic2,
  Trash2,
  Loader2,
  Clapperboard,
  Image as ImageIcon
} from "lucide-react";
import Link from "next/link";
import { usePosts } from "@/context/PostContext";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { aiTranslatePost } from "@/app/actions/ai";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MyProfilePage() {
  const { currentUser, posts, updateCurrentUser, isPostSaved, addPost, connections, followingUsernames, toggleFollowUser, isFollowing } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedBio, setTranslatedBio] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isUploadingIntro, setIsUploadingIntro] = useState(false);
  const [deviceLanguage, setDeviceLanguage] = useState<string | null>(null);
  
  // Refinement Portal State
  const [refiningImage, setRefiningImage] = useState<string | null>(null);
  const [refinementMode, setRefiningMode] = useState<"avatar" | "cover">("avatar");
  const [isRefinementOpen, setIsRefinementOpen] = useState(false);

  const [confirmUser, setConfirmUser] = useState<any | null>(null);
  const [confirmType, setConfirmType] = useState<"unfollow" | "unfriend">("unfollow");
  const [visualToDelete, setVisualToDelete] = useState<"avatar" | "cover" | null>(null);

  const isPlayerActive = currentTrack && !isExpanded;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const introInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDeviceLanguage(window.navigator.language.split('-')[0]);
    }
  }, []);

  // Interaction Recovery Fail-safe
  useEffect(() => {
    if (!confirmUser && !isEditModalOpen && !isRefinementOpen && !visualToDelete) {
      document.body.style.pointerEvents = 'auto';
    }
    return () => {
      document.body.style.pointerEvents = 'auto';
    };
  }, [confirmUser, isEditModalOpen, isRefinementOpen, visualToDelete]);

  const [skills, setSkills] = useState([
    { name: "UI/UX Design", count: 42, endorsed: false },
    { name: "Mobile Photography", count: 28, endorsed: false },
    { name: "Brand Strategy", count: 15, endorsed: false },
    { name: "React Development", count: 33, endorsed: false }
  ]);

  const [editData, setEditData] = useState({
    name: currentUser.name,
    category: currentUser.category,
    bio: currentUser.bio,
    pronouns: currentUser.pronouns
  });

  const triggerHaptic = (intensity = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(intensity);
    }
  };

  const handleCopyBio = () => {
    triggerHaptic(5);
    navigator.clipboard.writeText(currentUser.bio || "");
    toast({ title: "Copied!", description: "Bio copied to clipboard." });
  };

  const handleTranslateBio = async () => {
    if (translatedBio) {
      setTranslatedBio(null);
      return;
    }
    triggerHaptic();
    setIsTranslating(true);
    try {
      const target = deviceLanguage || "en";
      const res = await aiTranslatePost({ postContent: currentUser.bio || "", targetLanguage: target });
      setTranslatedBio(res.translation);
      toast({ description: `Bio translated to ${target} ✨` });
    } catch (e) {
      toast({ variant: "destructive", description: "Translation failed" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleEndorseSkill = (idx: number) => {
    triggerHaptic(20);
    const newSkills = [...skills];
    if (newSkills[idx].endorsed) {
      newSkills[idx].count--;
      newSkills[idx].endorsed = false;
    } else {
      newSkills[idx].count++;
      newSkills[idx].endorsed = true;
      toast({ title: "Skill Verified", description: `Community endorsement added for ${newSkills[idx].name}.` });
    }
    setSkills(newSkills);
  };

  const handleImageChoice = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    triggerHaptic(15);
    const reader = new FileReader();
    reader.onloadend = () => {
      setRefiningImage(reader.result as string);
      setRefiningMode(field);
      setIsRefinementOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset input
  };

  const handleRefinementApply = (refinedUrl: string) => {
    triggerHaptic(30);
    updateCurrentUser({ [refinementMode]: refinedUrl });
    
    addPost({
      user: {
        name: currentUser.name,
        username: currentUser.username,
        avatar: refinementMode === 'avatar' ? refinedUrl : currentUser.avatar,
        isOnline: true
      },
      content: `**${currentUser.name}** updated ${refinementMode === 'avatar' ? 'his profile picture' : 'his workspace cover'} ✨`,
      image: refinedUrl,
      language: currentUser.language || 'en'
    });

    toast({ title: "Presence Refreshed", description: `Your profile ${refinementMode} is now updated and shared.` });
  };

  const handleRemoveVisual = () => {
    if (!visualToDelete) return;
    triggerHaptic(50);
    const mode = visualToDelete;
    
    // 1. Force interaction restoration
    document.body.style.pointerEvents = 'auto';
    // 2. Clear dialog state
    setVisualToDelete(null);
    
    // 3. Purge visual
    if (mode === 'avatar') {
      updateCurrentUser({ avatar: "https://picsum.photos/seed/default/400/400" });
      toast({ title: "Avatar Purged", description: "Profile visual reset to default." });
    } else {
      updateCurrentUser({ cover: "" });
      toast({ title: "Cover Purged", description: "Workspace background removed." });
    }
  };

  const handleIntroUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const audio = document.createElement('audio');
    audio.src = URL.createObjectURL(file);
    
    audio.onloadedmetadata = () => {
      window.URL.revokeObjectURL(audio.src);
      if (audio.duration > 10) {
        toast({ 
          variant: "destructive", 
          title: "Intro Too Long", 
          description: "Your sonic signature must be 10 seconds or less." 
        });
        if (introInputRef.current) introInputRef.current.value = "";
        return;
      }
      
      setIsUploadingIntro(true);
      triggerHaptic(20);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const audioUrl = reader.result as string;
        updateCurrentUser({ introUrl: audioUrl });
        setIsUploadingIntro(false);
        toast({ title: "Sonic ID Updated", description: "Your digital signature is now live." });
      };
      reader.readAsDataURL(file);
    };
  };

  const togglePlayIntro = () => {
    triggerHaptic(15);
    
    if (isPlayingIntro) {
      audioRef.current?.pause();
      setIsPlayingIntro(false);
      return;
    }

    if (!currentUser.introUrl) {
      toast({ title: "No Intro Set", description: "Upload your sonic signature to share it with the world." });
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(currentUser.introUrl);
      audioRef.current.onended = () => setIsPlayingIntro(false);
    } else {
      audioRef.current.src = currentUser.introUrl;
    }

    audioRef.current.play().catch(e => {
      console.error("Playback failed", e);
      toast({ variant: "destructive", description: "Failed to play sonic ID." });
    });
    setIsPlayingIntro(true);
  };

  const handleRemoveIntro = () => {
    triggerHaptic(30);
    updateCurrentUser({ introUrl: "" });
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlayingIntro(false);
    toast({ title: "Intro Removed", description: "Your sonic signature has been cleared." });
  };

  const handleSaveProfile = () => {
    triggerHaptic(25);
    updateCurrentUser(editData);
    setIsEditModalOpen(false);
    toast({ title: "Changes Applied", description: "Your workspace identity has been updated." });
  };

  const navigateToHub = (tab: "followers" | "following") => {
    triggerHaptic(5);
    router.push(`/friends?tab=${tab}`);
  };

  const confirmUnfollow = () => {
    if (confirmUser) {
      triggerHaptic(30);
      const user = { ...confirmUser };
      // 1. Force interaction restoration
      document.body.style.pointerEvents = 'auto';
      // 2. Clear dialog state
      setConfirmUser(null);
      // 3. Purge relationship
      toggleFollowUser(user.username);
      toast({ 
        title: "Network Adjusted", 
        description: `You no longer follow ${user.name}` 
      });
    }
  };

  const myPosts = useMemo(() => posts.filter(p => p.user.username === currentUser.username), [posts, currentUser.username]);
  const myReels = useMemo(() => myPosts.filter(p => p.videoUrl), [myPosts]);
  const taggedPosts = useMemo(() => posts.filter(p => p.collaborator?.username === currentUser.username), [posts, currentUser.username]);
  const savedPosts = useMemo(() => posts.filter(p => isPostSaved(p.id)), [posts, isPostSaved]);

  const showTranslateButton = useMemo(() => {
    if (!deviceLanguage || !currentUser.language) return false;
    return deviceLanguage !== currentUser.language && (currentUser.bio?.length || 0) > 5;
  }, [deviceLanguage, currentUser]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-background flex justify-center">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_360px] gap-8 px-0 md:px-4">
        
        <aside className={cn(
          "hidden md:block sticky h-screen border-r border-border/50 transition-all duration-300",
          isPlayerActive ? "top-16" : "top-0"
        )}>
          <MainNav />
        </aside>

        <main className={cn(
          "w-full bg-white dark:bg-card min-h-screen shadow-sm transition-all duration-300",
          isPlayerActive ? "pt-[64px]" : "pt-0"
        )}>
          <header className="sticky top-0 z-50 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-b border-border h-14 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button>
              </Link>
              <h1 className="font-bold text-lg tracking-tight">My Workspace</h1>
            </div>
            <div className="flex items-center gap-1">
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => { triggerHaptic(5); setIsEditModalOpen(true); setEditData({ name: currentUser.name, category: currentUser.category, bio: currentUser.bio, pronouns: currentUser.pronouns }); }}>
                  <Edit2 className="h-5 w-5" />
                </Button>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="font-black italic uppercase tracking-tighter text-2xl">Refine Presence</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identity Label</Label>
                      <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="rounded-xl bg-secondary/20 border-none h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Professional Niche</Label>
                      <Input value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="rounded-xl bg-secondary/20 border-none h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Digital Signature (Bio)</Label>
                      <Textarea value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} className="rounded-xl bg-secondary/20 border-none min-h-[100px]" />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={handleSaveProfile} className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest h-12 rounded-xl shadow-lg shadow-primary/20">Sync Identity</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
            </div>
          </header>

          <div className="relative">
            <div className="relative h-48 sm:h-64 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 overflow-hidden group">
              <Image 
                src={currentUser.cover || "https://picsum.photos/seed/my_cover/1200/400"} 
                alt="Cover" fill className="object-cover dark:brightness-75 transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white hover:bg-white/40 transition-all">
                      <Camera className="h-6 w-6" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="rounded-xl">
                    <DropdownMenuItem className="gap-2 font-bold" onClick={() => coverInputRef.current?.click()}>
                      <ImageIcon className="h-4 w-4" /> Change Background
                    </DropdownMenuItem>
                    {currentUser.cover && (
                      <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive font-bold" onSelect={() => setVisualToDelete('cover')}>
                        <Trash2 className="h-4 w-4" /> Remove Visual
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChoice(e, 'cover')} />
            </div>

            <div className="px-4 pb-4">
              <div className="relative inline-block -mt-16 sm:-mt-24 ml-0 sm:ml-2">
                <div className="relative w-32 h-32 sm:w-44 sm:h-44 group">
                  <Avatar className="w-full h-full border-4 border-white dark:border-card shadow-xl ring-2 ring-primary/10">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white hover:bg-white/40 transition-all">
                          <Camera className="h-8 w-8" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="rounded-xl">
                        <DropdownMenuItem className="gap-2 font-bold" onClick={() => avatarInputRef.current?.click()}>
                          <ImageIcon className="h-4 w-4" /> Refine Photo
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive font-bold" onSelect={() => setVisualToDelete('avatar')}>
                          <Trash2 className="h-4 w-4" /> Reset Signature
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChoice(e, 'avatar')} />
                </div>
              </div>

              <div className="mt-2 space-y-1 px-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{currentUser.name}</h1>
                  {currentUser.pronouns && <Badge variant="secondary" className="bg-secondary/50 text-[10px] font-bold uppercase">{currentUser.pronouns}</Badge>}
                  
                  <div className="flex items-center gap-1.5 bg-secondary/40 rounded-full p-0.5">
                    <Button 
                      variant="ghost" size="sm" 
                      className={cn(
                        "h-7 px-3 rounded-full gap-1.5 font-bold text-[11px] transition-all", 
                        isPlayingIntro ? "bg-primary text-white scale-105 shadow-lg" : "hover:bg-primary/10"
                      )}
                      onClick={togglePlayIntro}
                    >
                      {isPlayingIntro ? <Volume2 className="h-3.5 w-3.5 animate-pulse" /> : <Play className="h-3.5 w-3.5" />} 
                      {currentUser.introUrl ? "Play Intro" : "No Intro Set"}
                    </Button>
                    
                    <div className="flex items-center gap-0.5 pr-1">
                      <Button 
                        variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary"
                        onClick={() => introInputRef.current?.click()}
                        disabled={isUploadingIntro}
                        title="Upload Intro (Max 10s)"
                      >
                        {isUploadingIntro ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic2 className="h-3.5 w-3.5" />}
                      </Button>
                      {currentUser.introUrl && (
                        <Button 
                          variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive"
                          onClick={handleRemoveIntro}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <input type="file" ref={introInputRef} className="hidden" accept="audio/*" onChange={handleIntroUpload} />
                </div>
                
                <div className="flex items-center gap-6 py-2">
                  <button 
                    onClick={() => navigateToHub('followers')}
                    className="flex flex-col items-start hover:bg-secondary/30 p-2 -m-2 rounded-xl transition-colors group text-left"
                  >
                    <span className="font-bold text-lg leading-none group-hover:text-primary transition-colors">{currentUser.followers}</span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Followers</span>
                  </button>
                  <button 
                    onClick={() => navigateToHub('following')}
                    className="flex flex-col items-start hover:bg-secondary/30 p-2 -m-2 rounded-xl transition-colors group text-left"
                  >
                    <span className="font-bold text-lg leading-none group-hover:text-primary transition-colors">{followingUsernames.size}</span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Following</span>
                  </button>
                  <div className="flex flex-col"><span className="font-bold text-lg leading-none">{myPosts.length}</span><span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Posts</span></div>
                </div>

                <div className="mt-3 relative group max-w-2xl">
                   <div className="flex items-start gap-4">
                    <p className="text-[15px] leading-relaxed text-foreground flex-1">{translatedBio || currentUser.bio}</p>
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleCopyBio}><Copy className="h-3.5 w-3.5" /></Button>
                      {showTranslateButton && (
                        <Button variant="ghost" size="icon" className={cn("h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity", translatedBio && "text-primary opacity-100")} onClick={handleTranslateBio} disabled={isTranslating}>
                          {isTranslating ? <Zap className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href="/dashboard" className="flex-1">
                    <Button className="w-full rounded-lg gap-2 bg-primary hover:bg-primary/90 h-11 font-bold text-white shadow-lg shadow-primary/20 active:scale-95 transition-all">
                      <LayoutDashboard className="h-5 w-5" /> Dashboard
                    </Button>
                  </Link>
                  <Button 
                    variant="secondary" className="flex-1 rounded-lg gap-2 h-11 font-bold active:scale-95 transition-all"
                    onClick={() => { triggerHaptic(5); setIsStoryModalOpen(true); }}
                  >
                    <Plus className="h-5 w-5" /> Share Vibe
                  </Button>
                </div>

                <div className="mt-6">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2"><Star className="h-3.5 w-3.5 text-yellow-500" /> Professional Proof</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <button key={idx} onClick={() => handleEndorseSkill(idx)} className={cn("px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all active:scale-95", skill.endorsed ? "bg-primary text-white border-primary shadow-md" : "bg-white dark:bg-card hover:border-primary/30")}>
                        {skill.name} <span className={cn("px-1.5 rounded", skill.endorsed ? "bg-white/20" : "bg-black/10")}>{skill.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full mt-2">
              <TabsList className="w-full h-12 bg-white dark:bg-card border-t border-b border-border/50 rounded-none p-0">
                <TabsTrigger value="all" className="flex-1 font-bold text-sm">Posts</TabsTrigger>
                <TabsTrigger value="reels" className="flex-1 font-bold text-sm">Reels</TabsTrigger>
                <TabsTrigger value="tagged" className="flex-1 font-bold text-sm">Tagged</TabsTrigger>
                <TabsTrigger value="saved" className="flex-1 font-bold text-sm">Post Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="p-4 space-y-4">
                {myPosts.length > 0 ? myPosts.map(post => <PostCard key={post.id} {...post} />) : (
                  <div className="py-20 text-center text-muted-foreground bg-secondary/10 rounded-[2rem] border-2 border-dashed border-border/50"><Plus className="h-10 w-10 mx-auto mb-2 opacity-20" /><p className="font-bold">No active vibes</p><p className="text-sm">Start curating your thoughts.</p></div>
                )}
              </TabsContent>

              <TabsContent value="reels" className="p-4">
                <div className="grid grid-cols-3 gap-1">
                  {myReels.length > 0 ? myReels.map(reel => (
                    <Link key={reel.id} href="/reels" className="aspect-[9/16] relative group overflow-hidden rounded-xl bg-black">
                      <video src={reel.videoUrl} className="object-cover w-full h-full opacity-80" muted playsInline />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[10px] font-black">
                        <Clapperboard className="h-3 w-3" />
                        {reel.likes}
                      </div>
                    </Link>
                  )) : (
                    <div className="col-span-3 py-20 text-center text-muted-foreground bg-secondary/10 rounded-[2rem] border-2 border-dashed border-border/50">
                      <Clapperboard className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p className="font-bold">No Reels yet</p>
                      <p className="text-sm">Upload your first Vibe.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tagged" className="p-4 space-y-4">
                {taggedPosts.length > 0 ? taggedPosts.map(post => <PostCard key={post.id} {...post} />) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-secondary/10 rounded-[2rem] border-2 border-dashed border-border/50"><AtSign className="h-12 w-12 text-muted-foreground mb-4 opacity-20" /><h3 className="font-bold text-lg">Collaboration Network</h3><p className="text-sm text-muted-foreground max-w-[240px] mt-1">Posts where you've been tagged as a collaborator will appear here.</p></div>
                )}
              </TabsContent>

              <TabsContent value="saved" className="p-4 space-y-4">
                 <div className="flex items-center justify-between px-1 mb-2"><div className="flex items-center gap-2"><Bookmark className="h-5 w-5 text-primary" /><h3 className="font-bold text-lg italic uppercase tracking-tighter">Your Post Notes</h3></div></div>
                 {savedPosts.length > 0 ? (
                   <div className="space-y-4">{savedPosts.map(post => <PostCard key={post.id} {...post} />) }</div>
                 ) : (
                   <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="aspect-square relative rounded-2xl overflow-hidden bg-secondary shadow-lg group cursor-pointer ring-1 ring-black/5">
                          <Image src={`https://picsum.photos/seed/save_${i}/400/400`} alt="Saved" fill className="object-cover transition-transform group-hover:scale-110" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3"><span className="text-white text-[10px] font-black uppercase tracking-widest">View Archive</span></div>
                        </div>
                      ))}
                   </div>
                 )}
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <aside className={cn(
          "hidden lg:block sticky h-screen transition-all duration-300",
          isPlayerActive ? "top-16" : "top-0"
        )}>
          <RightSidebar />
        </aside>
      </div>
      
      <CreateStoryModal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} />

      <ImageRefinementPortal 
        isOpen={isRefinementOpen}
        onClose={() => setIsRefinementOpen(false)}
        image={refiningImage}
        mode={refinementMode}
        onApply={handleRefinementApply}
      />

      <AlertDialog open={!!confirmUser} onOpenChange={(open) => !open && setConfirmUser(null)}>
        <AlertDialogContent className="rounded-[2rem] sm:max-w-[400px] z-[200]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black italic uppercase tracking-tighter text-2xl">
              {confirmType === "unfriend" ? "Unfriend Creator?" : "Unfollow Creator?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium leading-relaxed">
              Are you sure you want to {confirmType === "unfriend" ? "unfriend" : "unfollow"} <span className="font-bold text-foreground">@{confirmUser?.username}</span>? This action will adjust your community connection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="rounded-xl h-12 font-bold bg-secondary/50 border-none">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmUnfollow}
              className="rounded-xl h-12 font-black italic uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20"
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!visualToDelete} onOpenChange={(open) => !open && setVisualToDelete(null)}>
        <AlertDialogContent className="rounded-[2.5rem] sm:max-w-[400px]">
          <AlertDialogHeader>
            <div className="mx-auto h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-4">
              <Trash2 className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="font-black italic uppercase tracking-tighter text-3xl text-center">Purge Visual?</AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium leading-relaxed text-center px-4">
              This will remove this signature visual from your workspace profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6">
            <AlertDialogCancel className="rounded-xl h-12 font-bold bg-secondary/50 border-none">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveVisual}
              className="rounded-xl h-12 font-black italic uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20"
            >
              Confirm Purge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
