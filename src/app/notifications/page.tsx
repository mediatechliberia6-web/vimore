'use client';

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { SubHeader } from "@/components/layout/sub-header";
import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { useNotifications, SignalType, NotificationNode } from "@/context/NotificationContext";
import { useMusic } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Settings, 
  CheckCheck, 
  Trash2, 
  Zap, 
  Users, 
  Music2, 
  ShieldCheck, 
  ChevronRight,
  MoreHorizontal,
  X,
  Sparkles,
  Inbox,
  Ghost
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type FilterTab = "ALL" | SignalType;

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, purgeSignal, requestPushPermission, hasPushPermission } = useNotifications();
  const { currentTrack, isExpanded, triggerHaptic } = useMusic();
  const { setSelectedPostId } = usePosts();
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  const isPlayerActive = currentTrack && !isExpanded;

  const filteredNotifications = useMemo(() => {
    if (activeTab === "ALL") return notifications;
    return notifications.filter(n => n.type === activeTab);
  }, [notifications, activeTab]);

  const handleAction = (node: NotificationNode) => {
    triggerHaptic(15);
    markAsRead(node.id);
    
    // Portal Transition logic: If the signal is anchored to a post, materialize the portal
    if (node.postId) {
      setSelectedPostId(node.postId);
    }
  };

  const handlePurge = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    triggerHaptic(30);
    purgeSignal(id);
  };

  const renderContent = (text: string) => {
    const boldRegex = /(\*\*.*?\*\*)/g;
    const parts = text.split(boldRegex);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-foreground font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#020202] flex flex-col transition-colors duration-500 overflow-x-hidden">
      {/* Immersive Aurora Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/5 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      <Header />
      <SubHeader />

      <div className={cn(
        "w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-8 px-4 transition-all duration-300",
        isPlayerActive ? "pt-[184px]" : "pt-6"
      )}>
        {/* Rail 1: Navigation */}
        <aside className={cn(
          "hidden lg:block sticky h-[calc(100vh-132px)] overflow-y-auto transition-all duration-300",
          isPlayerActive ? "top-[196px]" : "top-[132px]"
        )}>
          <MainNav />
        </aside>

        {/* Center: Signal Hub */}
        <main className="flex flex-col gap-8 w-full max-w-[720px] mx-auto pb-32">
          
          <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-end justify-between px-2">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-5xl font-black italic uppercase tracking-tighter font-headline">
                    Signals
                  </h1>
                  {unreadCount > 0 && (
                    <Badge className="bg-primary text-white text-[10px] font-black h-6 px-3 rounded-full shadow-lg shadow-primary/30 animate-bounce">
                      {unreadCount} NEW
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] ml-1">Real-time Network Pulse</p>
              </div>
              <div className="flex items-center gap-2 pb-1">
                <Button 
                  variant="ghost" size="icon" 
                  className="rounded-2xl bg-white/50 dark:bg-white/5 border border-primary/5 hover:bg-primary/10 hover:text-primary transition-all shadow-sm"
                  onClick={() => { triggerHaptic(5); markAllAsRead(); }}
                  title="Mark all as read"
                >
                  <CheckCheck className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" size="icon" 
                  className={cn("rounded-2xl bg-white/50 dark:bg-white/5 border border-primary/5 transition-all shadow-sm", !hasPushPermission && "text-primary border-primary/20 animate-pulse")}
                  onClick={() => { triggerHaptic(5); requestPushPermission(); }}
                  title="Signal Settings"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* High-Velocity Filter Pill */}
            <div className="sticky top-[132px] z-40 px-1">
              <div className="flex p-1.5 bg-white/80 dark:bg-card/80 backdrop-blur-3xl border border-white dark:border-white/5 rounded-[2rem] overflow-x-auto scrollbar-hide shadow-2xl shadow-black/5">
                {[
                  { id: "ALL", label: "All Pulses", icon: Inbox },
                  { id: "SOCIAL", label: "Social", icon: Users },
                  { id: "SONIC", label: "Sonic", icon: Music2 },
                  { id: "SYSTEM", label: "System", icon: ShieldCheck }
                ].map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { triggerHaptic(5); setActiveTab(tab.id as FilterTab); }}
                      className={cn(
                        "flex items-center gap-2 px-8 py-3 rounded-[1.5rem] text-[10px] font-black italic uppercase tracking-widest transition-all shrink-0 relative overflow-hidden group",
                        isActive 
                          ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105" 
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      )}
                    >
                      <tab.icon className={cn("h-3.5 w-3.5", isActive && "fill-current")} />
                      {tab.label}
                      {isActive && (
                        <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-white/40 rounded-full blur-[1px]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification Stream */}
            <div className="flex flex-col gap-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((node, i) => (
                  <div 
                    key={node.id}
                    onClick={() => handleAction(node)}
                    className={cn(
                      "group relative bg-white/60 dark:bg-white/5 backdrop-blur-2xl border rounded-[2.5rem] p-6 flex items-start gap-5 transition-all hover:shadow-2xl hover:-translate-y-1 cursor-pointer animate-in fade-in slide-in-from-bottom-4",
                      !node.isRead 
                        ? "border-primary/30 bg-gradient-to-br from-primary/[0.03] to-transparent ring-1 ring-primary/10 shadow-lg shadow-primary/5" 
                        : "border-white dark:border-white/5 opacity-80 hover:opacity-100"
                    )}
                    style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
                  >
                    {/* Unread Glow Pulse */}
                    {!node.isRead && (
                      <div className="absolute top-8 right-8 h-2.5 w-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_12px_rgba(153,64,229,1)]" />
                    )}

                    {/* Left: Identity Node */}
                    <div className="relative shrink-0">
                      <div className={cn(
                        "absolute -inset-2 rounded-[2rem] blur-md opacity-0 transition-opacity duration-700",
                        !node.isRead && "bg-primary/20 opacity-100"
                      )} />
                      
                      <div className="relative">
                        {node.avatar ? (
                          <Avatar className="h-16 w-16 border-4 border-white dark:border-[#0A0A0A] shadow-2xl">
                            <AvatarImage src={node.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary font-black uppercase">{node.title[0]}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className={cn(
                            "h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-xl border-2 border-white dark:border-white/5",
                            node.type === 'SONIC' ? "bg-accent/20 text-accent" : node.type === 'SYSTEM' ? "bg-green-500/20 text-green-500" : "bg-primary/20 text-primary"
                          )}>
                            {node.type === 'SONIC' ? <Music2 className="h-8 w-8" /> : node.type === 'SYSTEM' ? <ShieldCheck className="h-8 w-8" /> : <Users className="h-8 w-8" />}
                          </div>
                        )}
                        
                        <div className={cn(
                          "absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white dark:border-[#0A0A0A] flex items-center justify-center shadow-lg",
                          node.type === 'SONIC' ? "bg-accent" : node.type === 'SYSTEM' ? "bg-green-500" : "bg-primary"
                        )}>
                          {node.type === 'SONIC' ? <Music2 className="h-3 w-3 text-white" /> : node.type === 'SYSTEM' ? <Zap className="h-3 w-3 text-white" /> : <Users className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Content Context */}
                    <div className="flex-1 min-w-0 flex flex-col gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className={cn(
                            "font-black italic uppercase tracking-tighter text-xl leading-none font-headline",
                            !node.isRead ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {node.title}
                          </h3>
                          <span className="text-[10px] font-black text-muted-foreground uppercase whitespace-nowrap bg-secondary/30 px-2 py-1 rounded-lg tabular-nums">{node.time}</span>
                        </div>
                        <p className="text-[14px] leading-relaxed text-muted-foreground font-medium pr-4">
                          {renderContent(node.content)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {node.actionLabel && (
                          <Button size="sm" className="rounded-2xl h-10 px-6 font-black italic uppercase text-[10px] tracking-[0.2em] bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-95">
                            {node.actionLabel}
                          </Button>
                        )}
                        {node.postId && (
                          <Button size="sm" variant="ghost" className="rounded-2xl h-10 px-6 font-black italic uppercase text-[10px] tracking-[0.2em] bg-primary/5 hover:bg-primary/10 text-primary transition-all active:scale-95">
                            View Vibe
                          </Button>
                        )}
                        {node.image && (
                          <div className="h-12 w-12 rounded-[1rem] overflow-hidden border-2 border-white dark:border-white/10 shrink-0 shadow-2xl relative group/img">
                            <Image src={node.image} alt="Ref" fill className="object-cover transition-transform group-hover/img:scale-110" />
                          </div>
                        )}
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-10 w-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-all ml-auto bg-destructive/5 hover:bg-destructive hover:text-white"
                          onClick={(e) => handlePurge(e, node.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-32 text-center space-y-8 opacity-60 animate-in fade-in zoom-in-95 duration-1000">
                  <div className="relative mx-auto w-32 h-32">
                    <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse" />
                    <div className="relative h-full w-full bg-white dark:bg-white/5 rounded-[3rem] flex items-center justify-center border-2 border-dashed border-primary/20">
                      <Ghost className="h-14 w-14 text-primary/30 animate-bounce" />
                    </div>
                  </div>
                  <div className="space-y-3 px-16">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter font-headline">Zero Signals</h3>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-sm mx-auto">
                      Your node is currently operating in silent mode. New pulses from the network will materialize here as they sync.
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-[1.5rem] border-primary text-primary hover:bg-primary hover:text-white transition-all font-black uppercase tracking-[0.2em] text-[10px] h-12 px-10 shadow-lg shadow-primary/5"
                    onClick={() => setActiveTab("ALL")}
                  >
                    Sync All Channels
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Rail 3: Contextual Sidebar */}
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
