"use client";

import { useState, useMemo } from "react";
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
import { 
  Users, 
  UserPlus, 
  Search, 
  MessageCircle, 
  UserCheck, 
  Sparkles,
  Zap,
  Calendar,
  Layers
} from "lucide-react";
import Link from "next/link";

type HubTab = "all" | "followers" | "following" | "suggestions";

export default function FriendsPage() {
  const { connections, isFollowing, toggleFollowUser } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const [activeTab, setActiveTab] = useState<HubTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const isPlayerActive = currentTrack && !isExpanded;

  const filteredUsers = useMemo(() => {
    let list = connections;

    if (activeTab === "all") {
      list = connections.filter(c => c.followsYou && isFollowing(c.username));
    } else if (activeTab === "followers") {
      list = connections.filter(c => c.followsYou && !isFollowing(c.username));
    } else if (activeTab === "following") {
      list = connections.filter(c => !c.followsYou && isFollowing(c.username));
    } else if (activeTab === "suggestions") {
      list = connections.filter(c => !c.followsYou && !isFollowing(c.username));
    }

    if (searchQuery) {
      list = list.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return list;
  }, [activeTab, connections, isFollowing, searchQuery]);

  const tabs: { id: HubTab; label: string; icon: any }[] = [
    { id: "all", label: "All Friends", icon: Users },
    { id: "followers", label: "Followers", icon: UserPlus },
    { id: "following", label: "Following", icon: UserCheck },
    { id: "suggestions", label: "Suggestions", icon: Sparkles },
  ];

  const triggerHaptic = (intensity = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(intensity);
    }
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
                <p className="text-muted-foreground text-sm font-medium">Manage your network and discover new creators</p>
              </div>

              <div className="relative group w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Find connections..." 
                  className="pl-10 h-11 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary/20 transition-all"
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.length > 0 ? filteredUsers.map((user, i) => {
              const following = isFollowing(user.username);
              const isMutual = user.followsYou && following;

              return (
                <div 
                  key={user.username} 
                  className="group relative bg-[#0A0A0A] border border-white/5 rounded-[2rem] p-6 transition-all hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-accent/20 rounded-[2.1rem] blur-2xl opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none" />
                  
                  <div className="relative space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <Link href={`/profile/${user.username}`} className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative shrink-0">
                          <div className={cn(
                            "absolute -inset-1 rounded-full blur-sm opacity-0 transition-opacity",
                            user.isOnline && "bg-green-500/40 opacity-100 animate-pulse"
                          )} />
                          <Avatar className={cn(
                            "h-16 w-16 border-2 transition-transform group-hover:scale-105",
                            user.isOnline ? "border-green-500" : "border-white/5 group-hover:border-primary/50"
                          )}>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          {user.followsYou && (
                            <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border-2 border-[#0A0A0A] shadow-lg">
                              Mutual
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-lg tracking-tight truncate group-hover:text-primary transition-colors">{user.name}</span>
                          <span className="text-xs text-muted-foreground font-medium truncate">{user.category}</span>
                          {isMutual && <span className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Direct Friend</span>}
                        </div>
                      </Link>

                      <div className="flex flex-col gap-2">
                        <Button 
                          variant={following ? "secondary" : "default"}
                          size="sm"
                          className={cn(
                            "rounded-xl h-10 px-5 font-bold transition-all",
                            !following ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white/5 text-white hover:bg-destructive hover:text-white"
                          )}
                          onClick={() => { triggerHaptic(15); toggleFollowUser(user.username); }}
                        >
                          {following ? "Following" : "Connect"}
                        </Button>
                        <Link href="/messages">
                          <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 h-10 w-10 text-muted-foreground hover:text-primary transition-colors">
                            <MessageCircle className="h-5 w-5" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      {user.mutualFriends && user.mutualFriends.length > 0 ? (
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {user.mutualFriends.slice(0, 3).map((avatar, idx) => (
                              <Avatar key={idx} className="h-6 w-6 border-2 border-[#0A0A0A] ring-1 ring-white/5">
                                <AvatarImage src={avatar} />
                                <AvatarFallback>?</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {user.mutualFriends.length} Mutual Friends
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground opacity-40">
                          <Layers className="h-3 w-3" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">No shared circle</span>
                        </div>
                      )}

                      {user.connectionDate && (
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
                  <h3 className="text-xl font-bold">No connections found</h3>
                  <p className="text-sm">Try adjusting your filters or search terms</p>
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
    </div>
  );
}
