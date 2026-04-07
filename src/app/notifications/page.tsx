
"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { SubHeader } from "@/components/layout/sub-header";
import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { useNotifications, NotificationNode } from "@/context/NotificationContext";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { NativeAdNode } from "@/components/ad/native-ad-node";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  UserPlus, 
  Music2, 
  Zap, 
  BellOff,
  MoreHorizontal,
  Check,
  Download,
  ShieldCheck,
  Trash2,
  ChevronRight,
  Filter,
  Users2,
  TrendingUp,
  Star,
  UserCheck
} from "lucide-react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const FILTERS = [
  { id: "all", label: "All Signals" },
  { id: "SOCIAL", label: "Social" },
  { id: "POST", label: "Content" },
  { id: "SONIC", label: "Music" },
];

export default function NotificationsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { notifications, markAsRead, markAllAsRead, purgeSignal } = useNotifications();
  const { setSelectedPostId, isFollowing, toggleFollowUser, currentUser } = usePosts();
  const { setTrack, currentTrack, isExpanded, triggerHaptic, globalSongs } = useMusic();
  
  const [activeFilter, setActiveFilter] = useState("all");

  const isPlayerActive = currentTrack && !isExpanded;

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return notifications;
    return notifications.filter(n => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const handleNotificationClick = (node: NotificationNode) => {
    triggerHaptic(10);
    markAsRead(node.id);

    // DEEP-LINK DISPATCHER
    if (node.postId) {
      // Content Pulse: Materialize the Post Portal
      setSelectedPostId(node.postId);
      toast({ title: "Opening Pulse", description: "Navigating to high-velocity content node." });
    } else if (node.trackId) {
      // Sonic Pulse: Navigate to Music and play track
      const track = globalSongs.find(s => String(s.id) === String(node.trackId));
      if (track) {
        setTrack(track);
        router.push('/music');
      }
    } else if (node.targetUsername) {
      // Social Pulse: Jump to User Workspace
      router.push(`/profile/${node.targetUsername}`);
    } else if (node.actionHref) {
      router.push(node.actionHref);
    }
  };

  const handleActionClick = (e: React.MouseEvent, node: NotificationNode) => {
    e.stopPropagation(); // Prevents card click (portal) from firing
    triggerHaptic(25);
    
    if (node.type === 'SOCIAL' && node.targetUsername) {
      // Social handshakes always navigate to the profile
      router.push(`/profile/${node.targetUsername}`);
    } else if (node.trackId) {
      const track = globalSongs.find(s => String(s.id) === String(node.trackId));
      if (track) {
        setTrack(track);
        router.push('/music');
      }
    } else if (node.postId) {
      setSelectedPostId(node.postId);
      toast({ title: "Opening Pulse", description: "Navigating to content node." });
    } else if (node.actionHref) {
      router.push(node.actionHref);
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'SOCIAL': return <UserPlus className="h-3.5 w-3.5 text-blue-500 fill-current" />;
      case 'POST': return <Heart className="h-3.5 w-3.5 text-primary fill-current" />;
      case 'SONIC': return <Music2 className="h-3.5 w-3.5 text-purple-500 fill-current" />;
      case 'SYSTEM': return <ShieldCheck className="h-3.5 w-3.5 text-green-500 fill-current" />;
      default: return <Zap className="h-3.5 w-3.5 text-primary" />;
    }
  };

  const renderContent = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="font-black text-foreground">{part.slice(2, -2)}</span>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808] transition-colors duration-300">
      <Header />
      <SubHeader />

      <div className={cn(
        "max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-8 px-4 transition-all duration-300",
        isPlayerActive ? "pt-[184px]" : "pt-6"
      )}>
        <aside className={cn(
          "hidden lg:block sticky h-[calc(100vh-132px)] overflow-y-auto transition-all duration-300",
          isPlayerActive ? "top-[196px]" : "top-[132px]"
        )}>
          <MainNav />
        </aside>

        <main className="w-full space-y-6 pb-24">
          <div className="bg-white dark:bg-card rounded-[2.5rem] p-6 sm:p-8 shadow-xl border border-primary/5">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  Signals
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black h-5">
                    {notifications.filter(n => !n.isRead).length} NEW
                  </Badge>
                </h1>
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest">High-Velocity Network Pulse</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 text-primary" onClick={markAllAsRead}>
                  Clear All
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 bg-secondary/40"><MoreHorizontal className="h-5 w-5" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl p-2 w-56">
                    <DropdownMenuItem className="gap-2 font-bold"><BellOff className="h-4 w-4" /> Mute Signal Audio</DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 font-bold text-destructive focus:text-destructive" onClick={markAllAsRead}><Check className="h-4 w-4" /> Clear Signal Cache</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-6 scrollbar-hide">
              <div className="flex items-center gap-2 pr-2 border-r border-primary/10 mr-2 text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Niche</span>
              </div>
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { triggerHaptic(5); setActiveFilter(f.id); }}
                  className={cn(
                    "px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2",
                    activeFilter === f.id 
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105" 
                      : "bg-transparent border-primary/5 text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <NativeAdNode type="banner-468" id="notif-top-pulse" />

            <div className="space-y-3">
              {filteredNotifications.length > 0 ? filteredNotifications.map((node, i) => {
                const isUnread = !node.isRead;
                const amFollowing = node.targetUsername ? isFollowing(node.targetUsername) : false;

                return (
                  <React.Fragment key={node.id}>
                    <div 
                      onClick={() => handleNotificationClick(node)}
                      className={cn(
                        "group relative flex items-start gap-4 p-5 rounded-[2rem] transition-all cursor-pointer border-2 animate-in fade-in slide-in-from-bottom-2",
                        isUnread 
                          ? "bg-primary/[0.03] border-primary/10 shadow-sm" 
                          : "bg-transparent border-transparent hover:bg-secondary/20"
                      )}
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {/* Delete button — always visible on mobile, hover-reveal on desktop */}
                      <button
                        onClick={(e) => { e.stopPropagation(); triggerHaptic(10); purgeSignal(node.id); }}
                        className="absolute top-3 right-3 z-10 h-7 w-7 flex items-center justify-center rounded-full bg-secondary/60 text-muted-foreground opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                        aria-label="Delete notification"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div className="relative shrink-0 pt-1">
                        <div className="relative">
                          <Avatar className={cn(
                            "h-14 w-14 border-2 transition-all duration-500",
                            isUnread ? "border-primary" : "border-white/20 group-hover:border-primary/40"
                          )}>
                            <AvatarImage src={node.avatar || (node.type !== 'SYSTEM' ? node.image : undefined) || (node.type === 'SYSTEM' ? '/icon.svg' : undefined)} />
                            <AvatarFallback>V</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 bg-white dark:bg-card p-1.5 rounded-full shadow-lg border border-primary/10">
                            {renderIcon(node.type)}
                          </div>
                        </div>
                        {isUnread && (
                          <div className="absolute top-0 -left-1 w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(153,64,229,0.8)]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pt-1 pr-6 sm:pr-0">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {renderContent(node.content)}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className={cn("text-[10px] font-black uppercase tracking-tighter", isUnread ? "text-primary" : "text-muted-foreground/40")}>
                              {node.time}
                            </span>
                            <div className="h-1 w-1 bg-muted-foreground/20 rounded-full" />
                            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">{node.type} SIGNAL</span>
                          </div>
                        </div>

                        {(node.actionLabel || node.postId || node.trackId || node.targetUsername) && (
                          <div className="mt-4 flex items-center gap-2">
                            <Button 
                              size="sm" 
                              className={cn(
                                "h-9 px-6 rounded-xl font-black italic uppercase tracking-widest text-[9px] transition-all shadow-lg",
                                isUnread ? "bg-primary text-white shadow-primary/20" : "bg-secondary text-foreground hover:bg-primary hover:text-white"
                              )}
                              onClick={(e) => handleActionClick(e, node)}
                            >
                              {node.type === 'SOCIAL' 
                                ? (amFollowing ? <><UserCheck className="h-3 w-3 mr-1.5" /> Friend</> : "Follow Back") 
                                : (node.actionLabel || "View Vibe")}
                            </Button>
                          </div>
                        )}
                      </div>

                      {(node.image || node.postId) && !node.avatar && (
                        <div className="hidden sm:block relative h-16 w-16 rounded-2xl overflow-hidden shrink-0 border border-primary/10 shadow-lg transition-transform group-hover:scale-105">
                          <Image src={node.image || '/icon.svg'} alt="Context" fill className="object-cover" />
                          {node.type === 'SONIC' && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <Music2 className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    {i === 4 && <NativeAdNode type="banner-468" id="notif-mid-pulse" />}
                  </React.Fragment>
                );
              }) : (
                <div className="py-32 text-center space-y-6 animate-in fade-in zoom-in-95 duration-700">
                  <div className="h-24 w-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-dashed border-primary/20">
                    <Zap className="h-10 w-10 text-primary/40" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Cluster Empty</h3>
                    <p className="text-muted-foreground text-sm font-medium">Your network cluster is currently silent. No new pulses detected.</p>
                  </div>
                  <Button variant="outline" className="rounded-full border-primary text-primary font-black uppercase tracking-widest text-[10px]" onClick={() => router.push('/')}>Back to Cluster</Button>
                </div>
              )}
            </div>
            
            {filteredNotifications.length > 0 && (
              <div className="pt-10 flex justify-center">
                <NativeAdNode type="banner-468" id="notif-bottom-pulse" />
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
