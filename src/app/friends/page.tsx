
"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { Header } from "@/components/layout/header";
import { SubHeader } from "@/components/layout/sub-header";
import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { SocialBarNode } from "@/components/ad/social-bar-node";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { 
  Users, 
  UserPlus, 
  Search, 
  MessageCircle, 
  UserCheck, 
  Sparkles,
  Zap,
  Calendar,
  Layers,
  Music2,
  Filter,
  Play,
  Bookmark,
  Volume2,
  UserMinus,
  X,
  Heart
} from "lucide-react";
import Link from "next/link";
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

type HubTab = "all" | "followers" | "following" | "suggestions";

const FILTER_CHIPS = [
  { id: "all", label: "All Categories" },
  { id: "Designer", label: "Designers" },
  { id: "Developer", label: "Developers" },
  { id: "Creator", label: "Creators" },
  { id: "Photographer", label: "Photographers" },
];

function FriendsPageContent() {
  const { connections, isFollowing, toggleFollowUser } = usePosts();
  const { currentTrack, isExpanded, triggerHaptic } = useMusic();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<HubTab>("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  const [confirmUser, setConfirmUser] = useState<any | null>(null);
  const [confirmType, setConfirmType] = useState<"unfollow" | "unfriend">("unfollow");

  const isPlayerActive = currentTrack && !isExpanded;

  useEffect(() => {
    const tabParam = searchParams.get('tab') as HubTab;
    if (tabParam && ["all", "followers", "following", "suggestions"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!confirmUser) {
      document.body.style.pointerEvents = 'auto';
    }
    return () => {
      document.body.style.pointerEvents = 'auto';
    };
  }, [confirmUser]);

  const filteredUsers = useMemo(() => {
    let list = [...connections];

    if (activeTab === "all") {
      list = connections.filter(c => c.followsYou && isFollowing(c.username));
    } else if (activeTab === "followers") {
      list = connections.filter(c => c.followsYou && !isFollowing(c.username));
    } else if (activeTab === "following") {
      list = connections.filter(c => !c.followsYou && isFollowing(c.username));
    } else if (activeTab === "suggestions") {
      list = connections.filter(c => !c.followsYou && !isFollowing(c.username));
    }

    if (activeCategory !== "all") {
      list = list.filter(u => u.category.includes(activeCategory));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(u => 
        u.name.toLowerCase().includes(q) || 
        u.username.toLowerCase().includes(q) ||
        u.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeTab, activeCategory, connections, isFollowing, searchQuery]);

  const tabs: { id: HubTab; label: string; icon: any }[] = [
    { id: "all", label: "Friends", icon: Heart },
    { id: "followers", label: "Followers", icon: UserPlus },
    { id: "following", label: "Following", icon: UserCheck },
    { id: "suggestions", label: "Discover", icon: Sparkles },
  ];

  const handlePreviewSonic = (username: string, name: string) => {
    triggerHaptic(15);
    if (playingPreview === username) {
      setPlayingPreview(null);
    } else {
      setPlayingPreview(username);
      toast({
        title: "Sonic Signature",
        description: `Sampling ${name}'s digital intro...`,
        duration: 3000,
      });
      setTimeout(() => setPlayingPreview(null), 3000);
    }
  };

  const handleAction = (user: any) => {
    const following = isFollowing(user.username);
    const followsYou = user.followsYou;

    if (following) {
      triggerHaptic(15);
      setConfirmType(followsYou ? "unfriend" : "unfollow");
      setConfirmUser(user);
    } else {
      triggerHaptic(25);
      toggleFollowUser(user.username);
      toast({ 
        title: followsYou ? "Mutual Connection!" : "Following", 
        description: `You are now connected with ${user.name} ✨` 
      });
    }
  };

  const confirmRemoval = () => {
    if (confirmUser) {
      triggerHaptic(30);
      const user = { ...confirmUser };
      document.body.style.pointerEvents = 'auto';
      setConfirmUser(null);
      toggleFollowUser(user.username);
      toast({ 
        title: "Network Adjusted", 
        description: `You no longer follow ${user.name}` 
      });
    }
  };

  const handleVaultUser = (username: string) => {
    triggerHaptic(5);
    toast({
      title: "Noted",
      description: `@${username} noted in your workspace collection.`
    });
  };

  return (
    <div className="min-h-screen bg-[#F2ECF7] dark:bg-[#050505] text-foreground flex flex-col transition-colors duration-500 overflow-x-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full pointer-events-none animate-pulse delay-700" />

      <Header />
      <SubHeader />
      
      <div className={cn(
        "w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-8 px-4 relative z-10 transition-all duration-300",
        isPlayerActive ? "pt-[184px]" : "pt-6"
      )}>
        <aside className={cn(
          "hidden lg:block sticky h-[calc(100vh-132px)] overflow-y-auto transition-all duration-300",
          isPlayerActive ? "top-[196px]" : "top-[132px]"
        )}>
          <MainNav />
        </aside>

        <main className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
          
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3 font-headline">
                  Community Hub
                  <div className="bg-primary/20 p-2 rounded-xl shadow-lg shadow-primary/10">
                    <Zap className="h-6 w-6 text-primary fill-primary" />
                  </div>
                </h1>
                <p className="text-muted-foreground text-sm font-medium">Managing {connections.length} specialized nodes in your network</p>
              </div>

              <div className="relative group w-full sm:max-w-xs">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Query your network..." 
                  className="pl-11 h-12 bg-white/40 dark:bg-white/5 backdrop-blur-md border-primary/10 rounded-2xl focus-visible:ring-primary/30 transition-all placeholder:text-muted-foreground/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Social Bar Node - Top Placement */}
            <SocialBarNode />

            {/* Floating Tab Bar */}
            <div className="flex p-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2rem] overflow-x-auto scrollbar-hide shadow-xl shadow-black/5">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { triggerHaptic(5); setActiveTab(tab.id); }}
                    className={cn(
                      "flex items-center gap-2 px-8 py-3 rounded-full text-sm font-black italic uppercase tracking-widest transition-all shrink-0 relative overflow-hidden group",
                      isActive 
                        ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105" 
                        : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                    )}
                  >
                    <tab.icon className={cn("h-4 w-4", isActive && "fill-current")} />
                    {tab.label}
                    {isActive && (
                      <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-white/40 rounded-t-full blur-sm" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Smart Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
              <div className="flex items-center gap-2 px-3 border-r border-primary/10 mr-2 text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Niche</span>
              </div>
              {FILTER_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => { triggerHaptic(5); setActiveCategory(chip.id); }}
                  className={cn(
                    "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2",
                    activeCategory === chip.id
                      ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                      : "bg-transparent border-primary/10 text-muted-foreground hover:border-primary/30 hover:bg-primary/5"
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredUsers.length > 0 ? filteredUsers.map((user, i) => {
              const following = isFollowing(user.username);
              const isMutual = user.followsYou && following;
              const isPlaying = playingPreview === user.username;

              let label = "Follow";
              let hoverLabel = "Follow";
              let btnVariant: "default" | "secondary" = "default";

              if (activeTab === "all" || isMutual) {
                label = "Friend";
                hoverLabel = "Unfriend";
                btnVariant = "secondary";
              } else if (activeTab === "followers") {
                label = "Follow Back";
                hoverLabel = "Follow Back";
                btnVariant = "default";
              } else if (following) {
                label = "Following";
                hoverLabel = "Unfollow";
                btnVariant = "secondary";
              }

              return (
                <div 
                  key={user.username} 
                  className="group relative bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-6 transition-all hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                >
                  <div className="relative space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className="relative shrink-0">
                          <div className={cn(
                            "absolute -inset-2 rounded-full blur-md opacity-0 transition-all duration-700 ring-2 ring-primary/40",
                            user.isOnline && "opacity-100 animate-pulse scale-110"
                          )} />
                          
                          <div className="relative">
                            <Avatar className={cn(
                              "h-20 w-20 border-4 transition-all duration-500 shadow-xl",
                              user.isOnline ? "border-primary" : "border-white/20 group-hover:border-primary/50"
                            )}>
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>{user.name[0]}</AvatarFallback>
                            </Avatar>
                            
                            <button 
                              onClick={() => handlePreviewSonic(user.username, user.name)}
                              className={cn(
                                "absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity",
                                isPlaying && "opacity-100 bg-primary/40"
                              )}
                            >
                              {isPlaying ? <Volume2 className="h-8 w-8 text-white animate-bounce" /> : <Play className="h-8 w-8 text-white fill-current" />}
                            </button>
                          </div>
                          {user.followsYou && (
                            <div className="absolute -bottom-1 -right-1 bg-accent text-white text-[8px] font-black uppercase px-2 py-1 rounded-full border-2 border-white dark:border-[#050505] shadow-lg">
                              Mutual
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Link href={`/profile/${user.username}`} className="flex flex-col gap-0.5">
                            <span className="font-headline font-black text-xl italic uppercase tracking-tighter truncate hover:text-primary transition-colors">{user.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">@{user.username}</span>
                              {activeTab === 'suggestions' && (
                                <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black h-4 px-2">
                                  94% MATCH
                                </Badge>
                              )}
                            </div>
                          </Link>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {user.category.split(',').map(cat => (
                              <span key={cat} className="text-[9px] font-black uppercase bg-primary/5 text-primary/70 px-2 py-0.5 rounded-md">{cat.trim()}</span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <Button 
                          variant={btnVariant}
                          size="sm"
                          className={cn(
                            "rounded-[1.25rem] h-11 px-6 font-black italic uppercase tracking-widest text-[10px] transition-all group/btn min-w-[120px] shadow-lg",
                            !following ? "bg-primary text-white shadow-primary/20 hover:scale-105" : "bg-white/10 dark:bg-white/5 text-foreground hover:bg-destructive hover:text-white"
                          )}
                          onClick={() => handleAction(user)}
                        >
                          <span className={cn(following && "group-hover/btn:hidden")}>
                            {label}
                          </span>
                          {following && (
                            <span className="hidden group-hover/btn:inline flex items-center gap-1.5">
                              <UserMinus className="h-3.5 w-3.5" /> {hoverLabel}
                            </span>
                          )}
                        </Button>
                        <div className="flex gap-2">
                          <Link href="/messages" className="flex-1">
                            <Button variant="ghost" size="icon" className="w-full rounded-xl bg-white/40 dark:bg-white/5 h-10 text-muted-foreground hover:text-primary transition-all">
                              <MessageCircle className="h-5 w-5" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-xl bg-white/40 dark:bg-white/5 h-10 w-10 text-muted-foreground hover:text-accent transition-all"
                            onClick={() => handleVaultUser(user.username)}
                          >
                            <Bookmark className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                      {user.mutualFriends && user.mutualFriends.length > 0 ? (
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-3">
                            {user.mutualFriends.slice(0, 3).map((avatar, idx) => (
                              <Avatar key={idx} className="h-7 w-7 border-2 border-white dark:border-[#0A0A0A] shadow-md">
                                <AvatarImage src={avatar} />
                                <AvatarFallback>?</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                            {user.mutualFriends.length}+ Shared Circles
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground opacity-40">
                          <Layers className="h-3.5 w-3.5" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Primary Connection</span>
                        </div>
                      )}

                      {activeTab === 'suggestions' ? (
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                          <Music2 className="h-3 w-3 text-primary animate-pulse" />
                          <span className="text-[8px] font-black uppercase tracking-widest text-primary">Simulating Taste...</span>
                        </div>
                      ) : user.connectionDate && (
                        <div className="flex items-center gap-2 bg-white/40 dark:bg-white/5 px-3 py-1.5 rounded-full border border-white/20 dark:border-white/10 shadow-sm">
                          <Calendar className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[8px] font-black uppercase tracking-widest text-primary/80">Since {user.connectionDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-24 text-center space-y-6 opacity-60 animate-in fade-in zoom-in-95 duration-500">
                <div className="h-24 w-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-dashed border-primary/20">
                  <Search className="h-10 w-10 text-primary/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">No nodes matched</h3>
                  <p className="text-muted-foreground text-sm font-medium">Try adjusting your community filters or search query</p>
                </div>
                <Button variant="outline" className="rounded-full border-primary text-primary" onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}>Reset Filters</Button>
              </div>
            )}
          </div>
        </main>

        <aside className={cn(
          "hidden lg:block sticky h-[calc(100vh-132px)] overflow-y-auto transition-all duration-300",
          isPlayerActive ? "top-[196px]" : "top-[132px]"
        )}>
          <RightSidebar />
        </aside>
      </div>

      <AlertDialog open={!!confirmUser} onOpenChange={(open) => !open && setConfirmUser(null)}>
        <AlertDialogContent className="rounded-[2.5rem] sm:max-w-[420px] z-[300] bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-2xl border-primary/10 text-foreground shadow-2xl">
          <AlertDialogHeader>
            <div className="mx-auto h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-4">
              <UserMinus className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="font-headline font-black italic uppercase tracking-tighter text-3xl text-center">
              {confirmType === "unfriend" ? "Unfriend Creator?" : "Unfollow Creator?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium leading-relaxed text-center px-4">
              {confirmType === "unfriend" 
                ? `You'll no longer be mutual friends with @${confirmUser?.username}. This shifts them to your standard followers.`
                : `You'll stop receiving updates and digital pulses from @${confirmUser?.username}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6 px-4 pb-2">
            <AlertDialogCancel className="rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] bg-secondary/50 border-none hover:bg-secondary transition-all">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoval}
              className="rounded-2xl h-14 font-black italic uppercase tracking-[0.2em] text-[10px] bg-destructive hover:bg-destructive/90 text-white shadow-xl shadow-destructive/20 transition-all active:scale-95"
            >
              Confirm Removal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function FriendsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F2ECF7] dark:bg-[#050505] flex items-center justify-center"><Zap className="h-10 w-10 text-primary animate-pulse" /></div>}>
      <FriendsPageContent />
    </Suspense>
  );
}
