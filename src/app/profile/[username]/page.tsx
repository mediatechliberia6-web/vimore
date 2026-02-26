"use client";

import { useState, useEffect, use, useMemo } from "react";
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
  MoreHorizontal, 
  Volume2,
  Play,
  Star,
  Check,
  UserPlus,
  UserMinus,
  MessageCircle,
  Zap,
  Languages,
  Search,
  X,
  UserCheck
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
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const MOCK_USERS: Record<string, any> = {
  "arivera": {
    name: "Alex Rivera",
    username: "arivera",
    bio: "Product Designer & Coffee Enthusiast. Living life one pixel at a time. ☕️🎨",
    avatar: "https://picsum.photos/seed/1/400/400",
    cover: "https://picsum.photos/seed/cover_arivera/1200/400",
    followers: "12.2k",
    following: "890",
    posts: "342",
    category: "Product Designer",
    isVerified: true
  },
  "schen_dev": {
    name: "Sarah Chen",
    username: "schen_dev",
    bio: "Fullstack Dev | Building the future of social. Loves React and SF vibes. 💻🌉",
    avatar: "https://picsum.photos/seed/2/400/400",
    cover: "https://picsum.photos/seed/cover_schen/1200/400",
    followers: "4.2k",
    following: "450",
    posts: "128",
    category: "Fullstack Developer",
    isVerified: true
  },
  "mstone": {
    name: "Marcus Stone",
    username: "mstone",
    bio: "Photography & Travel. Capturing the world through a wide lens. 📸✈️",
    avatar: "https://picsum.photos/seed/3/400/400",
    cover: "https://picsum.photos/seed/cover_mstone/1200/400",
    followers: "25.1k",
    following: "1.1k",
    posts: "892",
    category: "Photographer",
    isVerified: false
  }
};

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const { currentUser, posts, connections, isFollowing, toggleFollowUser } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const isMe = username === currentUser.username;
  const isPlayerActive = currentTrack && !isExpanded;
  
  const { toast } = useToast();
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [translatedBio, setTranslatedBio] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [hubTab, setHubTab] = useState<"followers" | "following">("followers");
  const [hubSearch, setHubSearch] = useState("");

  const [confirmUser, setConfirmUser] = useState<any | null>(null);
  const [confirmType, setConfirmType] = useState<"unfollow" | "unfriend">("unfollow");

  const amIFollowing = isFollowing(username);

  // Pointer-event cleanup to prevent UI locks
  useEffect(() => {
    if (!isHubOpen && !confirmUser) {
      document.body.style.pointerEvents = 'auto';
    }
  }, [isHubOpen, confirmUser]);

  // Get user data or fallback
  const displayUser = MOCK_USERS[username] || {
    name: username.charAt(0).toUpperCase() + username.slice(1),
    username: username,
    bio: "Digital creator and explorer of the ViMore community. 🎨 ✨",
    avatar: `https://picsum.photos/seed/${username}/400/400`,
    cover: `https://picsum.photos/seed/cover_${username}/1200/400`,
    followers: "1.2k",
    following: "400",
    posts: "12",
    category: "ViMore Member",
    isVerified: false,
    followsYou: connections.find(c => c.username === username)?.followsYou || false
  };

  const [skills, setSkills] = useState([
    { name: "Content Strategy", count: 12, endorsed: false },
    { name: "Creative Thinking", count: 8, endorsed: false },
  ]);

  const triggerHaptic = (intensity = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(intensity);
    }
  };

  const handleFollowAction = () => {
    if (amIFollowing) {
      triggerHaptic(15);
      setConfirmType(displayUser.followsYou ? "unfriend" : "unfollow");
      setConfirmUser(displayUser);
    } else {
      triggerHaptic(20);
      toggleFollowUser(username);
      toast({ 
        title: displayUser.followsYou ? "Mutual Connected!" : "Connected!",
        description: `You are now following ${displayUser.name} ✨` 
      });
    }
  };

  const handleTranslateBio = async () => {
    if (translatedBio) {
      setTranslatedBio(null);
      return;
    }
    triggerHaptic();
    setIsTranslating(true);
    try {
      const res = await aiTranslatePost({ postContent: displayUser.bio, targetLanguage: "Spanish" });
      setTranslatedBio(res.translation);
    } catch (e) {
      toast({ variant: "destructive", description: "Translation failed" });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleEndorse = (idx: number) => {
    triggerHaptic(15);
    const newSkills = [...skills];
    if (newSkills[idx].endorsed) {
      newSkills[idx].count--;
      newSkills[idx].endorsed = false;
    } else {
      newSkills[idx].count++;
      newSkills[idx].endorsed = true;
      toast({ title: "Endorsement Sent", description: `You verified ${displayUser.name}'s expertise in ${newSkills[idx].name}.` });
    }
    setSkills(newSkills);
  };

  const openHub = (tab: "followers" | "following") => {
    triggerHaptic(5);
    setHubTab(tab);
    setIsHubOpen(true);
  };

  const filteredConnections = useMemo(() => {
    const base = connections.filter(c => 
      hubTab === "followers" ? c.followsYou : isFollowing(c.username)
    );
    return base.filter(c => 
      c.name.toLowerCase().includes(hubSearch.toLowerCase()) || 
      c.username.toLowerCase().includes(hubSearch.toLowerCase())
    );
  }, [hubSearch, hubTab, connections, isFollowing]);

  const handleConnectionAction = (user: any) => {
    const following = isFollowing(user.username);
    const followsYou = user.followsYou;

    if (following) {
      triggerHaptic(15);
      setConfirmType(followsYou ? "unfriend" : "unfollow");
      setConfirmUser(user);
    } else {
      triggerHaptic(25);
      toggleFollowUser(user.username);
      toast({ title: "Connected!", description: `You are now following ${user.name}` });
    }
  };

  const confirmUnfollow = () => {
    if (confirmUser) {
      triggerHaptic(30);
      toggleFollowUser(confirmUser.username);
      toast({ 
        title: "Network Adjusted", 
        description: `You no longer follow ${confirmUser.name}` 
      });
      setConfirmUser(null);
      setTimeout(() => { document.body.style.pointerEvents = 'auto'; }, 100);
    }
  };

  const userPosts = useMemo(() => posts.filter(p => p.user.username === username), [posts, username]);
  const mediaPosts = useMemo(() => userPosts.filter(p => p.image || p.images?.length), [userPosts]);

  if (isMe) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-primary font-bold animate-pulse gap-4"><Zap className="h-10 w-10" /><span>Redirecting to your workspace...</span></div>;
  }

  // Action Labels for the main profile button
  let mainLabel = "Connect";
  let mainHoverLabel = "Connect";
  if (amIFollowing) {
    mainLabel = displayUser.followsYou ? "Friend" : "Following";
    mainHoverLabel = displayUser.followsYou ? "Unfriend" : "Unfollow";
  } else if (displayUser.followsYou) {
    mainLabel = "Follow Back";
    mainHoverLabel = "Follow Back";
  }

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
              <div className="flex items-center gap-1">
                <span className="font-bold text-lg truncate">{displayUser.name}</span>
                {displayUser.isVerified && <Check className="h-4 w-4 text-primary fill-primary text-white" />}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
          </header>

          <div className="relative">
            <div className="relative h-48 sm:h-64 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 overflow-hidden">
              <Image 
                src={displayUser.cover || `https://picsum.photos/seed/cover_${username}/1200/400`} 
                alt="Cover" fill className="object-cover dark:brightness-75" 
              />
            </div>

            <div className="px-4 pb-4">
              <div className="relative inline-block -mt-16 sm:-mt-24 ml-0 sm:ml-2">
                <Avatar className="w-32 h-32 sm:w-44 sm:h-44 border-4 border-white dark:border-card shadow-xl ring-2 ring-primary/5">
                  <AvatarImage src={displayUser.avatar} />
                  <AvatarFallback>{displayUser.name[0]}</AvatarFallback>
                </Avatar>
              </div>

              <div className="mt-2 space-y-1 px-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{displayUser.name}</h1>
                  <Button 
                    variant="ghost" size="sm" 
                    className={cn("h-7 px-2 rounded-full gap-1.5 font-bold text-[11px] transition-all", isPlayingIntro ? "bg-primary text-white scale-105 shadow-lg" : "bg-secondary/40")}
                    onClick={() => { triggerHaptic(15); setIsPlayingIntro(!isPlayingIntro); if (!isPlayingIntro) toast({ title: "Sonic Intro", description: `Streaming ${displayUser.name}'s digital signature...` }); }}
                  >
                    {isPlayingIntro ? <Volume2 className="h-3.5 w-3.5 animate-pulse" /> : <Play className="h-3.5 w-3.5" />} Intro
                  </Button>
                </div>
                
                <div className="flex items-center gap-6 py-2">
                  <button 
                    onClick={() => openHub('followers')}
                    className="flex flex-col items-start hover:bg-secondary/30 p-2 -m-2 rounded-xl transition-colors group"
                  >
                    <span className="font-bold text-lg leading-none group-hover:text-primary transition-colors">{displayUser.followers}</span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Followers</span>
                  </button>
                  <button 
                    onClick={() => openHub('following')}
                    className="flex flex-col items-start hover:bg-secondary/30 p-2 -m-2 rounded-xl transition-colors group"
                  >
                    <span className="font-bold text-lg leading-none group-hover:text-primary transition-colors">{displayUser.following}</span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Following</span>
                  </button>
                  <div className="flex flex-col"><span className="font-bold text-lg leading-none">{userPosts.length || displayUser.posts}</span><span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Posts</span></div>
                </div>

                <div className="flex items-start gap-4 py-2 group">
                  <p className="text-[15px] leading-relaxed flex-1">{translatedBio || displayUser.bio}</p>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleTranslateBio} disabled={isTranslating}>
                    {isTranslating ? <Zap className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}
                  </Button>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={handleFollowAction}
                    className={cn(
                      "flex-1 rounded-lg gap-2 h-11 font-bold transition-all shadow-lg group/btn min-w-[120px]",
                      amIFollowing ? "bg-secondary text-foreground hover:bg-destructive hover:text-white" : "bg-primary text-white shadow-primary/20"
                    )}
                  >
                    <span className={cn(amIFollowing && "group-hover/btn:hidden")}>
                      {amIFollowing ? (displayUser.followsYou ? <UserCheck className="h-5 w-5 inline mr-1" /> : <UserCheck className="h-5 w-5 inline mr-1" />) : <UserPlus className="h-5 w-5 inline mr-1" />}
                      {mainLabel}
                    </span>
                    {amIFollowing && (
                      <span className="hidden group-hover/btn:inline flex items-center gap-2">
                        <UserMinus className="h-5 w-5" /> {mainHoverLabel}
                      </span>
                    )}
                  </Button>
                  <Link href="/messages" className="flex-1">
                    <Button variant="secondary" className="w-full rounded-lg gap-2 h-11 font-bold active:scale-95 transition-all">
                      <MessageCircle className="h-5 w-5" /> Message
                    </Button>
                  </Link>
                </div>

                <div className="mt-6">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2"><Star className="h-3.5 w-3.5 text-yellow-500" /> Endorsed Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <button key={idx} onClick={() => handleEndorse(idx)} className={cn("px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all active:scale-95", skill.endorsed ? "bg-primary text-white border-primary shadow-md" : "bg-white dark:bg-card hover:border-primary/30")}>
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
                <TabsTrigger value="media" className="flex-1 font-bold text-sm">Media</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="p-4 space-y-4">
                {userPosts.map(post => <PostCard key={post.id} {...post} />)}
              </TabsContent>

              <TabsContent value="media" className="p-4">
                <div className="grid grid-cols-3 gap-1">
                  {mediaPosts.length > 0 ? mediaPosts.map(post => (
                    <div key={post.id} className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg">
                      <Image src={post.image || post.images![0]} alt="Media" fill className="object-cover transition-transform group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><Play className="h-6 w-6" /></div>
                    </div>
                  )) : (
                    <div className="col-span-3 py-20 text-center text-muted-foreground"><p className="font-bold">No media shared yet</p></div>
                  )}
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

      {/* Connection Hub Dialog */}
      <Dialog open={isHubOpen} onOpenChange={setIsHubOpen}>
        <DialogContent className="sm:max-w-[480px] h-[80vh] flex flex-col p-0 rounded-[2rem] overflow-hidden gap-0">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle className="font-black italic uppercase tracking-tighter text-2xl text-center">
              {hubTab === "followers" ? "Followers" : "Following"}
            </DialogTitle>
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder={`Search ${hubTab}...`} 
                className="pl-10 h-11 bg-secondary/20 border-none rounded-xl focus-visible:ring-primary/20"
                value={hubSearch}
                onChange={(e) => setHubSearch(e.target.value)}
              />
              {hubSearch && (
                <button onClick={() => setHubSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="h-4 w-4" /></button>
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 pb-6 mt-2">
            <div className="space-y-4">
              {filteredConnections.length > 0 ? filteredConnections.map((user, i) => {
                const following = isFollowing(user.username);
                const isMutual = user.followsYou && following;

                // Action Labels
                let label = "Follow";
                let hoverLabel = "Follow";
                if (following) {
                  label = isMutual ? "Friend" : "Following";
                  hoverLabel = isMutual ? "Unfriend" : "Unfollow";
                } else if (user.followsYou) {
                  label = "Follow Back";
                  hoverLabel = "Follow Back";
                }

                return (
                  <div key={i} className="flex items-center justify-between group animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                    <Link href={`/profile/${user.username}`} onClick={() => setIsHubOpen(false)} className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-12 w-12 border-2 border-primary/5 transition-transform group-hover:scale-105">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm truncate group-hover:underline">{user.name}</span>
                          {user.followsYou && hubTab === "followers" && <Badge variant="secondary" className="bg-secondary/50 text-[8px] h-4 px-1.5 font-bold uppercase">Follows You</Badge>}
                        </div>
                        <span className="text-[10px] text-muted-foreground truncate">{user.category}</span>
                      </div>
                    </Link>
                    
                    <Button 
                      variant={following ? "secondary" : "default"} 
                      size="sm" 
                      className={cn(
                        "rounded-lg h-8 px-4 font-bold text-[11px] transition-all min-w-[90px] group/btn",
                        !following ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/10" : "bg-secondary/80 text-foreground hover:bg-destructive hover:text-white"
                      )}
                      onClick={() => handleConnectionAction(user)}
                    >
                      <span className={cn(following && "group-hover/btn:hidden")}>
                        {following && isMutual && <UserCheck className="h-3 w-3 mr-1 inline" />}
                        {label}
                      </span>
                      {following && (
                        <span className="hidden group-hover/btn:inline flex items-center gap-1">
                          <UserMinus className="h-3 w-3" /> {hoverLabel}
                        </span>
                      )}
                    </Button>
                  </div>
                );
              }) : (
                <div className="py-20 text-center space-y-3 opacity-40">
                  <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center mx-auto"><Search className="h-6 w-6" /></div>
                  <p className="text-sm font-bold">No results found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Unfollow/Unfriend Confirmation */}
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
    </div>
  );
}