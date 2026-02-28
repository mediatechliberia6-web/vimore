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
  Image as ImageIcon,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Heart,
  Cake,
  Calendar,
  Lock,
  Clock,
  Music as MusicIcon,
  Disc3,
  Layers,
  Download,
  PlusSquare
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

const USER_CATEGORIES = [
  "Digital Creator",
  "Product Architect",
  "Visual Storyteller",
  "Fullstack Developer",
  "Sonic Producer"
];

const RELATIONSHIP_STATUSES = [
  "Single",
  "In a Handshake",
  "Synchronized",
  "Exploring"
];

export function InfoNode({ icon: Icon, label, value, colorClass }: { icon: any, label: string, value: string, colorClass: string }) {
  return (
    <div className="flex items-center gap-3 group/node">
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-transform group-hover/node:scale-110", colorClass)}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex flex-col">
        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">{label}</span>
        <span className="text-sm font-bold text-foreground leading-none">{value}</span>
      </div>
    </div>
  );
}

export default function MyProfilePage() {
  const { currentUser, posts, updateCurrentUser, isPostSaved, addPost, connections, followingUsernames, toggleFollowUser, isFollowing, setSelectedPostId, setSelectedImageUrl } = usePosts();
  const { currentTrack, isExpanded, userSongs, userAlbums, triggerHaptic } = useMusic();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedBio, setTranslatedBio] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isUploadingIntro, setIsUploadingIntro] = useState(false);
  const [deviceLanguage, setDeviceLanguage] = useState<string | null>(null);
  
  const [refiningImage, setRefiningImage] = useState<string | null>(null);
  const [refiningMode, setRefiningMode] = useState<"avatar" | "cover">("avatar");
  const [isRefinementOpen, setIsRefinementOpen] = useState(false);

  const [confirmUser, setConfirmUser] = useState<any | null>(null);
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
    category: currentUser.category || USER_CATEGORIES[0],
    bio: currentUser.bio || "",
    pronouns: currentUser.pronouns || "",
    profession: currentUser.profession || "",
    school: currentUser.school || "",
    relationshipStatus: currentUser.relationshipStatus || RELATIONSHIP_STATUSES[0],
    dateOfBirth: currentUser.dateOfBirth || ""
  });

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
    e.target.value = "";
  };

  const handleRefinementApply = (refinedUrl: string) => {
    triggerHaptic(30);
    updateCurrentUser({ [refiningMode]: refinedUrl });
    
    addPost({
      user: currentUser,
      content: `**${currentUser.name}** updated ${refiningMode === 'avatar' ? 'his profile picture' : 'his workspace cover'} ✨`,
      image: refinedUrl,
      language: currentUser.language || 'en'
    });

    toast({ title: "Presence Refreshed", description: `Your profile ${refiningMode} is now updated and shared.` });
  };

  const handleRemoveVisual = () => {
    if (!visualToDelete) return;
    triggerHaptic(50);
    const mode = visualToDelete;
    document.body.style.pointerEvents = 'auto';
    setVisualToDelete(null);
    
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
        toast({ variant: "destructive", title: "Intro Too Long", description: "Your sonic signature must be 10 seconds or less." });
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
    if (isPlayingIntro) { audioRef.current?.pause(); setIsPlayingIntro(false); return; }
    if (!currentUser.introUrl) { toast({ title: "No Intro Set", description: "Upload your sonic signature to share it with the world." }); return; }
    if (!audioRef.current) {
      audioRef.current = new Audio(currentUser.introUrl);
      audioRef.current.onended = () => setIsPlayingIntro(false);
    } else audioRef.current.src = currentUser.introUrl;
    audioRef.current.play().catch(e => { toast({ variant: "destructive", description: "Failed to play sonic ID." }); });
    setIsPlayingIntro(true);
  };

  const handleSaveProfile = () => {
    triggerHaptic(25);
    const updates: Partial<any> = { ...editData };
    const now = Date.now();
    if (editData.name !== currentUser.name) updates.lastModifiedName = now;
    if (editData.dateOfBirth !== currentUser.dateOfBirth) updates.lastModifiedDob = now;
    updateCurrentUser(updates);
    setIsEditModalOpen(false);
    toast({ title: "Changes Applied", description: "Your workspace identity has been updated." });
  };

  const isNameLocked = currentUser.lastModifiedName ? (Date.now() - currentUser.lastModifiedName < NINETY_DAYS_MS) : false;
  const isDobLocked = currentUser.lastModifiedDob ? (Date.now() - currentUser.lastModifiedDob < NINETY_DAYS_MS) : false;

  const getNameLockRemaining = () => {
    if (!currentUser.lastModifiedName) return 0;
    const remaining = NINETY_DAYS_MS - (Date.now() - currentUser.lastModifiedName);
    return Math.ceil(remaining / (1000 * 60 * 60 * 24));
  };

  const getDobLockRemaining = () => {
    if (!currentUser.lastModifiedDob) return 0;
    const remaining = NINETY_DAYS_MS - (Date.now() - currentUser.lastModifiedDob);
    return Math.ceil(remaining / (1000 * 60 * 60 * 24));
  };

  const myPosts = useMemo(() => posts.filter(p => p.user.username === currentUser.username), [posts, currentUser.username]);
  const myReels = useMemo(() => myPosts.filter(p => p.videoUrl), [myPosts]);
  const taggedPosts = useMemo(() => posts.filter(p => p.collaborator?.username === currentUser.username), [posts, currentUser.username]);
  const savedPosts = useMemo(() => posts.filter(p => isPostSaved(p.id)), [posts, isPostSaved]);
  
  const postedImages = useMemo(() => {
    const list: string[] = [];
    myPosts.forEach(p => {
      if (p.image) list.push(p.image);
      if (p.images) list.push(...p.images);
    });
    return Array.from(new Set(list));
  }, [myPosts]);

  const formattedDob = useMemo(() => {
    if (!currentUser.dateOfBirth) return null;
    const date = new Date(currentUser.dateOfBirth);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  }, [currentUser.dateOfBirth]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-background flex justify-center">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_360px] gap-8 px-0 md:px-4">
        
        <aside className={cn("hidden md:block sticky h-screen border-r border-border/50 transition-all duration-300", isPlayerActive ? "top-16" : "top-0")}>
          <MainNav />
        </aside>

        <main className={cn("w-full bg-white dark:bg-card min-h-screen shadow-sm transition-all duration-300", isPlayerActive ? "pt-[64px]" : "pt-0")}>
          <header className="sticky top-0 z-50 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-b border-border h-14 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button></Link>
              <div className="flex items-center gap-1">
                <h1 className="font-bold text-lg tracking-tight">My Workspace</h1>
                {currentUser.isVerified && <CheckCircle2 className="h-4 w-4 text-primary fill-primary text-white" />}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => { triggerHaptic(5); setIsEditModalOpen(true); setEditData({ name: currentUser.name, category: currentUser.category || USER_CATEGORIES[0], bio: currentUser.bio || "", pronouns: currentUser.pronouns || "", profession: currentUser.profession || "", school: currentUser.school || "", relationshipStatus: currentUser.relationshipStatus || RELATIONSHIP_STATUSES[0], dateOfBirth: currentUser.dateOfBirth || "" }); }}><Edit2 className="h-5 w-5" /></Button>
                <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-primary/10">
                  <DialogHeader className="p-6 bg-primary/5 border-b border-primary/10"><DialogTitle className="font-black italic uppercase tracking-widest text-2xl">Calibration Hub</DialogTitle></DialogHeader>
                  <ScrollArea className="max-h-[70vh]">
                    <div className="p-6 space-y-8">
                      <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Identity Lock</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Legal Label (Name)</Label>{isNameLocked && <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[8px] font-black h-4 px-2 uppercase"><Clock className="h-2.5 w-2.5 mr-1" /> SYNC IN {getNameLockRemaining()}D</Badge>}</div>
                            <div className="relative group"><Input disabled={isNameLocked} value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className={cn("rounded-xl bg-secondary/20 border-none h-12 transition-all", isNameLocked && "opacity-50 cursor-not-allowed")} />{isNameLocked && <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />}</div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Arrival Date (DOB)</Label>{isDobLocked && <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[8px] font-black h-4 px-2 uppercase"><Clock className="h-2.5 w-2.5 mr-1" /> SYNC IN {getDobLockRemaining()}D</Badge>}</div>
                            <div className="relative group"><Input type="date" disabled={isDobLocked} value={editData.dateOfBirth} onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })} className={cn("rounded-xl bg-secondary/20 border-none h-12 transition-all", isDobLocked && "opacity-50 cursor-not-allowed")} />{isDobLocked && <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/40" />}</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Digital Signature</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Professional Niche</Label>
                            <Select value={editData.category} onValueChange={(val) => setEditData({ ...editData, category: val })}><SelectTrigger className="h-12 rounded-xl bg-secondary/20 border-none px-4"><SelectValue placeholder="Select Category" /></SelectTrigger><SelectContent className="rounded-xl">{USER_CATEGORIES.map(cat => <SelectItem key={cat} value={cat} className="font-bold">{cat}</SelectItem>)}</SelectContent></Select>
                          </div>
                          <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identity Tokens (Pronouns)</Label><Input value={editData.pronouns} onChange={(e) => setEditData({ ...editData, pronouns: e.target.value })} className="rounded-xl bg-secondary/20 border-none h-12" placeholder="e.g. He/Him" /></div>
                        </div>
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Vibe Manifesto (Bio)</Label><Textarea value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} className="rounded-xl bg-secondary/20 border-none min-h-[100px] resize-none" placeholder="Share your network logic..." /></div>
                      </div>
                      <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Network Graph</h3>
                        <div className="space-y-4">
                          <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Node (Profession)</Label><Input value={editData.profession} onChange={(e) => setEditData({ ...editData, profession: e.target.value })} className="rounded-xl bg-secondary/20 border-none h-12" placeholder="e.g. Designer at ViMore" /></div>
                          <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Academic Node (School)</Label><Input value={editData.school} onChange={(e) => setEditData({ ...editData, school: e.target.value })} className="rounded-xl bg-secondary/20 border-none h-12" placeholder="e.g. University of Digital Arts" /></div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Handshake Status</Label>
                            <Select value={editData.relationshipStatus} onValueChange={(val) => setEditData({ ...editData, relationshipStatus: val })}><SelectTrigger className="h-12 rounded-xl bg-secondary/20 border-none px-4"><SelectValue placeholder="Select Status" /></SelectTrigger><SelectContent className="rounded-xl">{RELATIONSHIP_STATUSES.map(status => <SelectItem key={status} value={status} className="font-bold">{status}</SelectItem>)}</SelectContent></Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  <div className="p-6 bg-secondary/10 border-t border-primary/10"><Button onClick={handleSaveProfile} className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest h-14 rounded-2xl shadow-xl shadow-primary/20">Sync Identity Pulse</Button></div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
            </div>
          </header>

          <div className="relative">
            <div className="relative h-48 sm:h-64 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 overflow-hidden group">
              <Image src={currentUser.cover || "https://picsum.photos/seed/my_cover/1200/400"} alt="Cover" fill className="object-cover dark:brightness-75 transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><button className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white hover:bg-white/40 transition-all"><Camera className="h-6 w-6" /></button></DropdownMenuTrigger>
                  <DropdownMenuContent align="center" className="rounded-xl"><DropdownMenuItem className="gap-2 font-bold" onClick={() => coverInputRef.current?.click()}><ImageIcon className="h-4 w-4" /> Change Background</DropdownMenuItem>{currentUser.cover && <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive font-bold" onSelect={() => setVisualToDelete('cover')}><Trash2 className="h-4 w-4" /> Remove Visual</DropdownMenuItem>}</DropdownMenuContent>
                </DropdownMenu>
              </div>
              <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChoice(e, 'cover')} />
            </div>

            <div className="px-4 pb-4">
              <div className="relative inline-block -mt-16 sm:-mt-24 ml-0 sm:ml-2">
                <div className="relative w-32 h-32 sm:w-44 sm:h-44 group">
                  <Avatar className="w-full h-full border-4 border-white dark:border-card shadow-xl ring-2 ring-primary/10"><AvatarImage src={currentUser.avatar} /><AvatarFallback>JD</AvatarFallback></Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><button className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white hover:bg-white/40 transition-all"><Camera className="h-8 w-8" /></button></DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="rounded-xl"><DropdownMenuItem className="gap-2 font-bold" onClick={() => avatarInputRef.current?.click()}><ImageIcon className="h-4 w-4" /> Refine Photo</DropdownMenuItem><DropdownMenuItem className="gap-2 text-destructive focus:text-destructive font-bold" onSelect={() => setVisualToDelete('avatar')}><Trash2 className="h-4 w-4" /> Reset Signature</DropdownMenuItem></DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageChoice(e, 'avatar')} />
                </div>
              </div>

              <div className="mt-2 space-y-1 px-1">
                <div className="flex items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{currentUser.name}</h1>
                    {currentUser.isVerified && <CheckCircle2 className="h-6 w-6 text-primary fill-primary text-white" />}
                  </div>
                  <div className="flex items-center gap-1.5 bg-secondary/40 rounded-full p-0.5">
                    <Button variant="ghost" size="sm" className={cn("h-7 px-3 rounded-full gap-1.5 font-bold text-[11px] transition-all", isPlayingIntro ? "bg-primary text-white scale-105 shadow-lg" : "hover:bg-primary/10")} onClick={togglePlayIntro}>{isPlayingIntro ? <Volume2 className="h-3.5 w-3.5 animate-pulse" /> : <Play className="h-3.5 w-3.5" />} {currentUser.introUrl ? "Play Intro" : "No Intro Set"}</Button>
                    <div className="flex items-center gap-0.5 pr-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-primary" onClick={() => introInputRef.current?.click()} disabled={isUploadingIntro}>{isUploadingIntro ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mic2 className="h-3.5 w-3.5" />}</Button>
                      {currentUser.introUrl && <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-muted-foreground hover:text-destructive" onClick={() => updateCurrentUser({ introUrl: "" })}><Trash2 className="h-3.5 w-3.5" /></Button>}
                    </div>
                  </div>
                  <input type="file" ref={introInputRef} className="hidden" accept="audio/*" onChange={handleIntroUpload} />
                </div>
                
                <div className="flex items-center gap-6 py-2">
                  <div className="flex flex-col items-start"><span className="font-bold text-lg leading-none">{currentUser.followers}</span><span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Followers</span></div>
                  <div className="flex flex-col items-start"><span className="font-bold text-lg leading-none">{followingUsernames.size}</span><span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Following</span></div>
                  <div className="flex flex-col"><span className="font-bold text-lg leading-none">{myPosts.length}</span><span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Posts</span></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 py-6 my-4 border-y border-primary/5 bg-primary/[0.02] px-4 rounded-[2rem]">
                  {currentUser.profession && <InfoNode icon={Briefcase} label="Current Node" value={currentUser.profession} colorClass="bg-blue-500/10 text-blue-500" />}
                  {currentUser.school && <InfoNode icon={GraduationCap} label="Academic Node" value={currentUser.school} colorClass="bg-purple-500/10 text-purple-500" />}
                  {currentUser.relationshipStatus && <InfoNode icon={Heart} label="Handshake Status" value={currentUser.relationshipStatus} colorClass="bg-rose-500/10 text-rose-500" />}
                  {formattedDob && <InfoNode icon={Cake} label="Arrival Date" value={formattedDob} colorClass="bg-amber-500/10 text-amber-500" />}
                </div>

                <div className="mt-3 relative group max-w-2xl"><div className="flex items-start gap-4"><p className="text-[15px] leading-relaxed text-foreground flex-1">{translatedBio || currentUser.bio}</p></div></div>

                <div className="mt-4 flex gap-2">
                  <Link href="/dashboard" className="flex-1"><Button className="w-full rounded-lg gap-2 bg-primary hover:bg-primary/90 h-11 font-bold text-white shadow-lg shadow-primary/20 active:scale-95 transition-all"><LayoutDashboard className="h-5 w-5" /> Dashboard</Button></Link>
                  <Button variant="secondary" className="flex-1 rounded-lg gap-2 h-11 font-bold active:scale-95 transition-all" onClick={() => { triggerHaptic(5); setIsStoryModalOpen(true); }}><PlusSquare className="h-5 w-5" /> Share Story</Button>
                </div>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full mt-2">
              <TabsList className="w-full h-12 bg-white dark:bg-card border-t border-b border-border/50 rounded-none p-0 overflow-x-auto scrollbar-hide justify-start px-2">
                <TabsTrigger value="all" className="font-bold text-sm">Posts</TabsTrigger>
                <TabsTrigger value="reels" className="font-bold text-sm">Reels</TabsTrigger>
                <TabsTrigger value="music" className="font-bold text-sm">Music</TabsTrigger>
                <TabsTrigger value="media" className="font-bold text-sm">Media</TabsTrigger>
                <TabsTrigger value="tagged" className="font-bold text-sm">Tagged</TabsTrigger>
                <TabsTrigger value="saved" className="font-bold text-sm">Post Notes</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="p-4 space-y-4">
                {myPosts.length > 0 ? myPosts.map(post => <PostCard key={post.id} {...post} />) : <div className="py-20 text-center opacity-40"><p className="font-bold">No active vibes</p></div>}
              </TabsContent>

              <TabsContent value="reels" className="p-4">
                <div className="grid grid-cols-3 gap-1">
                  {myReels.length > 0 ? myReels.map(reel => (
                    <div key={reel.id} onClick={() => router.push(`/reels?id=${reel.id}`)} className="aspect-[9/16] relative group overflow-hidden rounded-xl bg-black cursor-pointer">
                      <video src={reel.videoUrl} className="object-cover w-full h-full opacity-80" muted playsInline />
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[10px] font-black"><Clapperboard className="h-3 w-3" />{reel.likes}</div>
                    </div>
                  )) : <div className="col-span-3 py-20 text-center opacity-40"><p className="font-bold">No Reels yet</p></div>}
                </div>
              </TabsContent>

              <TabsContent value="music" className="p-4 space-y-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-primary/5 pb-2">
                    <MusicIcon className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-widest">My Discography</h3>
                  </div>
                  {userSongs.length > 0 ? (
                    <div className="space-y-3">
                      {userSongs.map(song => (
                        <div key={song.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-2xl hover:bg-secondary/40 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="relative h-12 w-12 rounded-xl overflow-hidden shadow-lg"><Image src={song.cover} alt="Song" fill className="object-cover" /></div>
                            <div><p className="font-bold text-sm">{song.title}</p><p className="text-[10px] text-muted-foreground uppercase font-black">{song.artist}</p></div>
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-full text-primary opacity-0 group-hover:opacity-100 transition-opacity"><Play className="h-4 w-4 fill-current" /></Button>
                        </div>
                      ))}
                    </div>
                  ) : <p className="text-center text-sm opacity-40 italic py-10">No songs published yet.</p>}
                </div>
              </TabsContent>

              <TabsContent value="media" className="p-0">
                <Tabs defaultValue="visuals" className="w-full">
                  <TabsList className="w-full h-10 bg-secondary/10 border-b border-border/50 rounded-none gap-4 px-4 justify-start">
                    <TabsTrigger value="signatures" className="text-[10px] font-black uppercase p-0 h-auto">Signatures</TabsTrigger>
                    <TabsTrigger value="wraps" className="text-[10px] font-black uppercase p-0 h-auto">Wraps</TabsTrigger>
                    <TabsTrigger value="visuals" className="text-[10px] font-black uppercase p-0 h-auto">Visual Nodes</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signatures" className="p-4">
                    <div className="grid grid-cols-3 gap-2">
                      {currentUser.profilePictureHistory?.map((url, i) => (
                        <div key={i} onClick={() => setSelectedImageUrl(url)} className="aspect-square relative rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform shadow-lg"><Image src={url} alt="History" fill className="object-cover" /></div>
                      )) || <p className="col-span-3 text-center text-xs opacity-40 py-10">No avatar history tracked.</p>}
                    </div>
                  </TabsContent>

                  <TabsContent value="wraps" className="p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {currentUser.coverPhotoHistory?.map((url, i) => (
                        <div key={i} onClick={() => setSelectedImageUrl(url)} className="aspect-[21/9] relative rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform shadow-lg"><Image src={url} alt="History" fill className="object-cover" /></div>
                      )) || <p className="col-span-2 text-center text-xs opacity-40 py-10">No cover history tracked.</p>}
                    </div>
                  </TabsContent>

                  <TabsContent value="visuals" className="p-4">
                    <div className="grid grid-cols-3 gap-2">
                      {postedImages.map((url, i) => (
                        <div key={i} onClick={() => setSelectedImageUrl(url)} className="aspect-square relative rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform shadow-lg"><Image src={url} alt="Shared" fill className="object-cover" /></div>
                      ))}
                      {postedImages.length === 0 && <p className="col-span-3 text-center text-xs opacity-40 py-10">No images shared in the network.</p>}
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="tagged" className="p-4 space-y-4">
                {taggedPosts.map(post => <div key={post.id} onClick={() => setSelectedPostId(post.id)} className="cursor-pointer active:scale-[0.98] transition-all"><PostCard {...post} /></div>)}
                {taggedPosts.length === 0 && <div className="py-20 text-center opacity-40"><p className="font-bold">No tagged vibes</p></div>}
              </TabsContent>

              <TabsContent value="saved" className="p-4 space-y-4">
                 {savedPosts.map(post => <div key={post.id} onClick={() => setSelectedPostId(post.id)} className="cursor-pointer active:scale-[0.98] transition-all"><PostCard {...post} /></div>)}
                 {savedPosts.length === 0 && <div className="py-20 text-center opacity-40"><p className="font-bold">No post notes yet</p></div>}
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <aside className={cn("hidden lg:block sticky h-screen transition-all duration-300", isPlayerActive ? "top-16" : "top-0")}>
          <RightSidebar />
        </aside>
      </div>
      
      <CreateStoryModal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} />
      <ImageRefinementPortal isOpen={isRefinementOpen} onClose={() => setIsRefinementOpen(false)} image={refiningImage} mode={refiningMode} onApply={handleRefinementApply} />

      <AlertDialog open={!!confirmUser} onOpenChange={(open) => !open && setConfirmUser(null)}>
        <AlertDialogContent className="rounded-[2rem] sm:max-w-[400px] z-[200]">
          <AlertDialogHeader><AlertDialogTitle className="font-black italic uppercase tracking-tighter text-2xl">Confirm Action?</AlertDialogTitle><AlertDialogDescription className="text-base font-medium leading-relaxed">Adjust your network connection with this creator.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2"><AlertDialogCancel className="rounded-xl h-12 font-bold bg-secondary/50 border-none">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { setConfirmUser(null); if(confirmUser) toggleFollowUser(confirmUser.username); }} className="rounded-xl h-12 font-black italic uppercase bg-destructive text-white">Confirm</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!visualToDelete} onOpenChange={(open) => !open && setVisualToDelete(null)}>
        <AlertDialogContent className="rounded-[2.5rem] sm:max-w-[400px]">
          <AlertDialogHeader><AlertDialogTitle className="font-black italic uppercase tracking-tighter text-3xl text-center">Purge Visual?</AlertDialogTitle><AlertDialogDescription className="text-base font-medium leading-relaxed text-center px-4">Remove this visual node from your current profile presence.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6"><AlertDialogCancel className="rounded-xl h-12 font-bold bg-secondary/50 border-none">Cancel</AlertDialogCancel><AlertDialogAction onClick={handleRemoveVisual} className="rounded-xl h-12 font-black italic uppercase bg-destructive text-white">Confirm Purge</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
