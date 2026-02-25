"use client";

import { useState, useEffect } from "react";
import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { PostCard } from "@/components/post/post-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useMusic } from "@/context/MusicContext";
import { 
  ArrowLeft, 
  Camera, 
  Edit2, 
  MoreHorizontal, 
  LayoutDashboard,
  Plus,
  Globe,
  ExternalLink,
  Volume2,
  Play,
  Star,
  Zap,
  Check,
  BriefcaseBusiness,
  Languages,
  Copy,
  Gift,
  AtSign,
  Bookmark
} from "lucide-react";
import Link from "next/link";
import { usePosts } from "@/context/PostContext";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { aiTranslatePost } from "@/app/actions/ai";

export default function MyProfilePage() {
  const { currentUser, posts, highlights } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedBio, setTranslatedBio] = useState<string | null>(null);
  
  const isPlayerActive = currentTrack && !isExpanded;

  const [skills, setSkills] = useState([
    { name: "UI/UX Design", count: 42, endorsed: false },
    { name: "Mobile Photography", count: 28, endorsed: false },
    { name: "Brand Strategy", count: 15, endorsed: false },
    { name: "React Development", count: 33, endorsed: false }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handleCopyBio = () => {
    triggerHaptic();
    navigator.clipboard.writeText(currentUser.bio || "");
    toast({ description: "Bio copied to clipboard!" });
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
      toast({ description: `Endorsed ${newSkills[idx].name}!` });
    }
    setSkills(newSkills);
  };

  // Filter posts belonging to the current user
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
          isPlayerActive ? "mt-16" : "mt-0"
        )}>
          <header className="sticky top-0 z-50 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-b border-border h-14 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="font-bold text-lg">My Profile</h1>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="rounded-full"><Edit2 className="h-5 w-5" /></Button>
              <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
            </div>
          </header>

          <div className="relative">
            <div className="relative h-48 sm:h-64 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 overflow-hidden">
              <Image 
                src="https://picsum.photos/seed/my_cover/1200/400" 
                alt="Cover" 
                fill 
                className="object-cover dark:brightness-75" 
              />
            </div>

            <div className="px-4 pb-4">
              <div className="relative inline-block -mt-16 sm:-mt-24 ml-0 sm:ml-2">
                <div className="relative w-32 h-32 sm:w-44 sm:h-44">
                  <Avatar className="w-full h-full border-4 border-white dark:border-card shadow-xl">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="mt-2 space-y-1 px-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{currentUser.name}</h1>
                  <Badge variant="secondary" className="bg-secondary/50 text-[10px] font-bold">{currentUser.pronouns}</Badge>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "h-7 px-2 rounded-full gap-1.5 font-bold text-[11px]",
                      isPlayingIntro ? "bg-primary text-white" : "bg-secondary/40"
                    )}
                    onClick={() => { triggerHaptic(); setIsPlayingIntro(!isPlayingIntro); }}
                  >
                    {isPlayingIntro ? <Volume2 className="h-3.5 w-3.5 animate-pulse" /> : <Play className="h-3.5 w-3.5" />}
                    Intro
                  </Button>
                </div>
                
                <div className="flex items-center gap-6 py-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-none">{currentUser.followers}</span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Followers</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-none">{currentUser.following}</span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Following</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-none">{myPosts.length}</span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Posts</span>
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
                  <Button className="flex-1 rounded-lg gap-2 bg-primary hover:bg-primary/90 h-11 font-bold text-white shadow-lg shadow-primary/20">
                    <LayoutDashboard className="h-5 w-5" /> Dashboard
                  </Button>
                  <Button variant="secondary" className="flex-1 rounded-lg gap-2 h-11 font-bold">
                    <Plus className="h-5 w-5" /> Add to story
                  </Button>
                </div>

                <div className="mt-6">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 text-yellow-500" /> Professional Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleEndorseSkill(idx)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all",
                          skill.endorsed ? "bg-primary text-white" : "bg-white dark:bg-card"
                        )}
                      >
                        {skill.name} <span className="bg-black/10 px-1.5 rounded">{skill.count}</span>
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
                <TabsTrigger value="saved" className="flex-1 font-bold text-sm">Media</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="p-4 space-y-4">
                {myPosts.length > 0 ? (
                  myPosts.map(post => <PostCard key={post.id} {...post} />)
                ) : (
                  <div className="py-20 text-center text-muted-foreground">
                    <Plus className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="font-bold">No posts yet</p>
                    <p className="text-sm">Start sharing your thoughts!</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tagged" className="p-4 space-y-4">
                 <div className="flex flex-col items-center justify-center py-12 text-center bg-secondary/10 rounded-2xl border-2 border-dashed border-border/50">
                    <AtSign className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-bold text-lg">Posts you're tagged in</h3>
                    <p className="text-sm text-muted-foreground max-w-[240px] mt-1">When people tag you in photos or videos, they'll appear here.</p>
                 </div>
              </TabsContent>

              <TabsContent value="saved" className="p-4 space-y-4">
                 <div className="flex items-center justify-between px-1 mb-2">
                    <div className="flex items-center gap-2">
                       <Bookmark className="h-5 w-5 text-primary" />
                       <h3 className="font-bold text-lg">Your Saved Items</h3>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="aspect-square relative rounded-xl overflow-hidden bg-secondary">
                        <Image src={`https://picsum.photos/seed/save_${i}/300/300`} alt="Saved" fill className="object-cover" />
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
