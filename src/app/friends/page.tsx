"use client";

import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { SubHeader } from "@/components/layout/sub-header";
import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  CheckCircle2,
  UserMinus,
  X
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

export default function FriendsPage() {
  const { connections, isFollowing, toggleFollowUser } = usePosts();
  const { currentTrack, isExpanded, triggerHaptic } = useMusic();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<HubTab>("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  // Confirmation States
  const [confirmUser, setConfirmUser] = useState<any | null>(null);
  const [confirmType, setConfirmType] = useState<"unfollow" | "unfriend">("unfollow");

  const isPlayerActive = currentTrack && !isExpanded;

  // Pointer-event cleanup to prevent UI locks
  useEffect(() => {
    if (!confirmUser) {
      document.body.style.pointerEvents = 'auto';
    }
  }, [confirmUser]);

  const filteredUsers = useMemo(() => {
    let list = [...connections];

    // 1. Tab Filtering
    if (activeTab === "all") {
      list = connections.filter(c => c.followsYou && isFollowing(c.username));
    } else if (activeTab === "followers") {
      list = connections.filter(c => c.followsYou && !isFollowing(c.username));
    } else if (activeTab === "following") {
      list = connections.filter(c => !c.followsYou && isFollowing(c.username));
    } else if (activeTab === "suggestions") {
      list = connections.filter(c => !c.followsYou && !isFollowing(c.username));
    }

    // 2. Category Chip Filtering
    if (activeCategory !== "all") {
      list = list.filter(u => u.category.includes(activeCategory));
    }

    // 3. Advanced Search Filtering
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
    { id: "all", label: "Friends", icon: Users },
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
        title: followsYou ? "Mutual Connection!" : "Connected", 
        description: `You are now following ${user.name}` 
      });
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

  const handleVaultUser = (username: string) => {
    triggerHaptic(5);
    toast({
      title: "Vaulted",
      description: `@${username} added to your workspace collection.`
    });
  };

  const getMatchPercentage = (category: string) => {
    if (category.includes("Designer")) return 94;
    if (category.includes("Developer")) return 88;
    return 72;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col transition-colors duration-300">
      <Header />
      <SubHeader />
      
      <div className={cn(
        "w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-8 px-4 transition-all duration-300",
        isPlayerActive ? "pt-[184px]" : "pt-6"
      )}>
        <aside className={cn(
          "hidden lg:block sticky h-[calc(100vh-132px)] overflow-y-auto transition-all duration-300",
          isPlayerActive ? "top-[196px]" : "top-[132px]"
        )}>
          <MainNav />
        </aside>

        <main className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
          
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  Community Hub
                  <div className="bg-primary/20 p-1.5 rounded-lg">
                    <Zap className="h-5 w-5 text-primary fill-primary" />
                  </div>
                </h1>
                <p className="text-muted-foreground text-sm font-medium">Managing {connections.length} nodes in your network</p>
              </div>

              <div className="relative group w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Filter nodes..." 
                  className="pl-10 h-11 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary/20 transition-all placeholder:text-muted-foreground/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { triggerHaptic(5); setActiveTab(tab.id); }}
                    className={cn(
                      "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0",
                      isActive 
                        ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    )}
                  >
                    <tab.icon className={cn("h-4 w-4", isActive && "fill-current")} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
              <div className="flex items-center gap-2 px-2 border-r border-white/10 mr-2 text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Filter</span>
              </div>
              {FILTER_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => { triggerHaptic(5); setActiveCategory(chip.id); }}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border",
                    activeCategory === chip.id
                      ? "bg-white/10 border-primary text-primary"
                      : "bg-transparent border-white/5 text-muted-foreground hover:border-white/20"
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.length > 0 ? filteredUsers.map((user, i) => {
              const following = isFollowing(user.username);
              const isMutual = user.followsYou && following;
              const isPlaying = playingPreview === user.username;

              // Action Logic
              let label = "Follow";
              let hoverLabel = "Follow";
              let btnVariant: "default" | "secondary" = "default";

              if (following) {
                if (isMutual) {
                  label = "Friend";
                  hoverLabel = "Unfriend";
                } else {
                  label = "Following";
                  hoverLabel = "Unfollow";
                }
                btnVariant = "secondary";
              } else if (user.followsYou) {
                label = "Follow Back";
                hoverLabel = "Follow Back";
              }

              return (
                <div 
                  key={user.username} 
                  className="group relative bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-6 transition-all hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                >
                  <div className="relative space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative shrink-0">
                          <div className={cn(
                            "absolute -inset-1.5 rounded-full blur-md opacity-0 transition-opacity",
                            user.isOnline && "bg-green-500/40 opacity-100 animate-pulse"
                          )} />
                          <div className="relative">
                            <Avatar className={cn(
                              "h-16 w-16 border-2 transition-all duration-500",
                              user.isOnline ? "border-green-500" : "border-white/5 group-hover:border-primary/50"
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
                              {isPlaying ? <Volume2 className="h-6 w-6 text-white animate-bounce" /> : <Play className="h-6 w-6 text-white fill-current" />}
                            </button>
                          </div>
                          {user.followsYou && (
                            <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border-2 border-[#0A0A0A]">
                              Mutual
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Link href={`/profile/${user.username}`} className="flex items-center gap-2">
                            <span className="font-bold text-lg tracking-tight truncate hover:text-primary transition-colors">{user.name}</span>
                            {activeTab === 'suggestions' && (
                              <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black h-4 px-1.5">
                                {getMatchPercentage(user.category)}% MATCH
                              </Badge>
                            )}
                          </Link>
                          <span className="text-xs text-muted-foreground font-medium truncate">{user.category}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button 
                          variant={btnVariant}
                          size="sm"
                          className={cn(
                            "rounded-xl h-10 px-5 font-bold transition-all group/btn min-w-[110px]",
                            !following ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 text-white hover:bg-destructive hover:text-white"
                          )}
                          onClick={() => handleAction(user)}
                        >
                          <span className={cn(following && "group-hover/btn:hidden")}>
                            {following && isMutual && <UserCheck className="h-3.5 w-3.5 mr-1.5 inline" />}
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
                            <Button variant="ghost" size="icon" className="w-full rounded-xl bg-white/5 h-10 text-muted-foreground hover:text-primary transition-colors">
                              <MessageCircle className="h-5 w-5" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="rounded-xl bg-white/5 h-10 w-10 text-muted-foreground hover:text-accent transition-colors"
                            onClick={() => handleVaultUser(user.username)}
                          >
                            <Bookmark className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      {user.mutualFriends && user.mutualFriends.length > 0 ? (
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {user.mutualFriends.slice(0, 3).map((avatar, idx) => (
                              <Avatar key={idx} className="h-6 w-6 border-2 border-[#0A0A0A]">
                                <AvatarImage src={avatar} />
                                <AvatarFallback>?</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {user.mutualFriends.length} Shared Circles
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground opacity-40">
                          <Layers className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">No shared circle</span>
                        </div>
                      )}

                      {activeTab === 'suggestions' ? (
                        <div className="flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                          <Music2 className="h-3 w-3 text-primary animate-pulse" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary">Simulating Taste...</span>
                        </div>
                      ) : user.connectionDate && (
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                          <Calendar className="h-3 w-3 text-primary" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-primary/80">Since {user.connectionDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-20 text-center space-y-4 opacity-40">
                <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">No results found</h3>
                  <p className="text-sm">Try adjusting your community filters</p>
                </div>
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
        <AlertDialogContent className="rounded-[2rem] sm:max-w-[400px] z-[200] bg-[#0A0A0A] border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black italic uppercase tracking-tighter text-2xl">
              {confirmType === "unfriend" ? "Unfriend Creator?" : "Unfollow Creator?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium leading-relaxed text-zinc-400">
              {confirmType === "unfriend" 
                ? `You'll no longer be mutual friends with @${confirmUser?.username}, but they will still follow you.`
                : `You'll stop receiving updates from @${confirmUser?.username}.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 pt-4">
            <AlertDialogCancel className="rounded-xl h-12 font-bold bg-white/5 border-none text-white hover:bg-white/10">Cancel</AlertDialogCancel>
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