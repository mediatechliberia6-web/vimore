"use client";

import { useState, useEffect, useRef } from "react";
import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { PostCard } from "@/components/post/post-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMusic } from "@/context/MusicContext";
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
  Check,
  X
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function MyProfilePage() {
  const { currentUser, posts, updateCurrentUser } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const { toast } = useToast();
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedBio, setTranslatedBio] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const isPlayerActive = currentTrack && !isExpanded;

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

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handleCopyBio = () => {
    triggerHaptic();
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
      const res = await aiTranslatePost({ postContent: currentUser.bio || "", targetLanguage: "Spanish" });
      setTranslatedBio(res.translation);
      toast({ description: "Bio translated to Spanish ✨" });
    } catch (e) {
      toast({ variant: "destructive", description: "Translation failed" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleEndorseSkill = (idx: number) => {
    triggerHaptic();
    const newSkills = [...skills];
    if (newSkills[idx].endorsed) {
      newSkills[idx].count--;
      newSkills[idx].endorsed = false;
    } else {
      newSkills[idx].count++;
      newSkills[idx].endorsed = true;
      toast({ title: "Skill Endorsed!", description: `You verified your expertise in ${newSkills[idx].name}.` });
    }
    setSkills(newSkills);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    triggerHaptic();
    const reader = new FileReader();
    reader.onloadend = () => {
      updateCurrentUser({ [field]: reader.result as string });
      toast({ title: "Visual Updated", description: `Your ${field} was refreshed successfully.` });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    updateCurrentUser(editData);
    setIsEditModalOpen(false);
    toast({ title: "Profile Launched", description: "Identity updates are now live." });
  };

  const myPosts = posts.filter(p => p.user.username === currentUser.username);

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
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="font-bold text-lg">My Workspace</h1>
            </div>
            <div className="flex items-center gap-1">
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full" onClick={() => { triggerHaptic(); setEditData({ name: currentUser.name, category: currentUser.category, bio: currentUser.bio, pronouns: currentUser.pronouns }); }}>
                    <Edit2 className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                  <DialogHeader>
                    <DialogTitle className="font-black italic uppercase tracking-tighter text-2xl">Edit Presence</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Display Name</Label>
                      <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="rounded-xl bg-secondary/20 border-none h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Professional Category</Label>
                      <Input value={editData.category} onChange={(e) => setEditData({ ...editData, category: e.target.value })} className="rounded-xl bg-secondary/20 border-none h-12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">The Bio</Label>
                      <Textarea value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} className="rounded-xl bg-secondary/20 border-none min-h-[100px]" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleSaveProfile} className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest h-12 rounded-xl shadow-lg shadow-primary/20">Launch Updates</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
            </div>
          </header>

          <div className="relative">
            <div className="relative h-48 sm:h-64 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 overflow-hidden group">
              <Image 
                src={currentUser.cover || "https://picsum.photos/seed/my_cover/1200/400"} 
                alt="Cover" 
                fill 
                className="object-cover dark:brightness-75 transition-transform duration-700 group-hover:scale-105" 
              />
              <button 
                onClick={() => coverInputRef.current?.click()}
                className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                  <Camera className="h-6 w-6" />
                </div>
              </button>
              <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'cover')} />
            </div>

            <div className="px-4 pb-4">
              <div className="relative inline-block -mt-16 sm:-mt-24 ml-0 sm:ml-2">
                <div className="relative w-32 h-32 sm:w-44 sm:h-44 group">
                  <Avatar className="w-full h-full border-4 border-white dark:border-card shadow-xl ring-2 ring-primary/10">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <button 
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <Camera className="h-8 w-8" />
                  </button>
                  <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'avatar')} />
                </div>
              </div>

              <div className="mt-2 space-y-1 px-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{currentUser.name}</h1>
                  {currentUser.pronouns && <Badge variant="secondary" className="bg-secondary/50 text-[10px] font-bold">{currentUser.pronouns}</Badge>}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "h-7 px-2 rounded-full gap-1.5 font-bold text-[11px] transition-all",
                      isPlayingIntro ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105" : "bg-secondary/40"
                    )}
                    onClick={() => { triggerHaptic(); setIsPlayingIntro(!isPlayingIntro); if (!isPlayingIntro) toast({ title: "Sonic Intro", description: "Playing John's digital signature." }); }}
                  >
                    {isPlayingIntro ? <Volume2 className="h-3.5 w-3.5 animate-pulse" /> : <Play className="h-3.5 w-3.5" />}
                    Intro
                  </Button>
                </div>
                
                <div className="flex items-center gap-6 py-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-none">{currentUser.followers}</span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Fans</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-none">{currentUser.following}</span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Network</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-none">{myPosts.length}</span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Vibes</span>
                  </div>
                </div>

                <div className="mt-3 relative group max-w-2xl">
                   <div className="flex items-start gap-4">
                    <p className="text-[15px] leading-relaxed text-foreground flex-1">
                      {translatedBio || currentUser.bio}
                    </p>
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleCopyBio} title="Copy bio">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className={cn("h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity", translatedBio && "text-primary opacity-100")} onClick={handleTranslateBio} disabled={isTranslating} title="Translate bio">
                        {isTranslating ? <Zap className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button className="flex-1 rounded-lg gap-2 bg-primary hover:bg-primary/90 h-11 font-bold text-white shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                    <LayoutDashboard className="h-5 w-5" /> Workspace
                  </Button>
                  <Button variant="secondary" className="flex-1 rounded-lg gap-2 h-11 font-bold active:scale-95 transition-transform">
                    <Plus className="h-5 w-5" /> Add Story
                  </Button>
                </div>

                <div className="mt-6">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 text-yellow-500" /> Endorsed Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleEndorseSkill(idx)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all active:scale-95",
                          skill.endorsed ? "bg-primary text-white border-primary shadow-md shadow-primary/10" : "bg-white dark:bg-card hover:border-primary/30"
                        )}
                      >
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
                <TabsTrigger value="tagged" className="flex-1 font-bold text-sm">Tagged</TabsTrigger>
                <TabsTrigger value="saved" className="flex-1 font-bold text-sm">Vault</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="p-4 space-y-4">
                {myPosts.length > 0 ? (
                  myPosts.map(post => <PostCard key={post.id} {...post} />)
                ) : (
                  <div className="py-20 text-center text-muted-foreground bg-secondary/10 rounded-[2rem] border-2 border-dashed border-border/50">
                    <Plus className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="font-bold">No active vibes</p>
                    <p className="text-sm">Start curating your thoughts.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tagged" className="p-4 space-y-4">
                 <div className="flex flex-col items-center justify-center py-12 text-center bg-secondary/10 rounded-[2rem] border-2 border-dashed border-border/50">
                    <AtSign className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="font-bold text-lg">Collaboration Network</h3>
                    <p className="text-sm text-muted-foreground max-w-[240px] mt-1">Posts where you've been tagged as a collaborator will appear here.</p>
                 </div>
              </TabsContent>

              <TabsContent value="saved" className="p-4 space-y-4">
                 <div className="flex items-center justify-between px-1 mb-2">
                    <div className="flex items-center gap-2">
                       <Bookmark className="h-5 w-5 text-primary" />
                       <h3 className="font-bold text-lg italic uppercase tracking-tighter">Your Digital Vault</h3>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="aspect-square relative rounded-2xl overflow-hidden bg-secondary shadow-lg group cursor-pointer ring-1 ring-black/5">
                        <Image src={`https://picsum.photos/seed/save_${i}/400/400`} alt="Saved" fill className="object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <span className="text-white text-[10px] font-black uppercase tracking-widest">View Archive</span>
                        </div>
                      </div>
                    ))}
                 </div>
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
    </div>
  );
}
