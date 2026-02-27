'use client';

import { useState, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { SubHeader } from "@/components/layout/sub-header";
import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { useNotifications, SignalType, NotificationNode } from "@/context/NotificationContext";
import { useMusic } from "@/context/MusicContext";
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
  Inbox
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type FilterTab = "ALL" | SignalType;

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, purgeSignal, requestPushPermission, hasPushPermission } = useNotifications();
  const { currentTrack, isExpanded, triggerHaptic } = useMusic();
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  const isPlayerActive = currentTrack && !isExpanded;

  const filteredNotifications = useMemo(() => {
    if (activeTab === "ALL") return notifications;
    return notifications.filter(n => n.type === activeTab);
  }, [notifications, activeTab]);

  const handleAction = (node: NotificationNode) => {
    triggerHaptic(5);
    markAsRead(node.id);
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
        return <strong key={i} className="text-foreground">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808] flex flex-col transition-colors duration-300 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-40 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 blur-[150px] rounded-full animate-pulse delay-1000" />
      </div>

      <Header />
      <SubHeader />

      <div className={cn(
        "w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-8 px-4 transition-all duration-300",
        isPlayerActive ? "pt-[184px]" : "pt-6"
      )}>
        {/* Left Sidebar */}
        <aside className={cn(
          "hidden lg:block sticky h-[calc(100vh-132px)] overflow-y-auto transition-all duration-300",
          isPlayerActive ? "top-[196px]" : "top-[132px]"
        )}>
          <MainNav />
        </aside>

        {/* Notification Stream */}
        <main className="flex flex-col gap-6 w-full max-w-[680px] mx-auto pb-32">
          
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between px-2">
              <div className="space-y-1">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  Signal Hub
                  {unreadCount > 0 && (
                    <div className="bg-primary px-3 py-1 rounded-full text-white text-[10px] font-black shadow-lg shadow-primary/20 animate-pulse">
                      +{unreadCount}
                    </div>
                  )}
                </h1>
                <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Digital activity stream</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" size="icon" 
                  className="rounded-full bg-white/50 dark:bg-card/50 hover:bg-primary/10 hover:text-primary transition-all"
                  onClick={() => { triggerHaptic(5); markAllAsRead(); }}
                  title="Mark all as read"
                >
                  <CheckCheck className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" size="icon" 
                  className={cn("rounded-full bg-white/50 dark:bg-card/50 transition-all", !hasPushPermission && "text-primary animate-pulse")}
                  onClick={() => { triggerHaptic(5); requestPushPermission(); }}
                  title="Push Settings"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Floating Filter Bar */}
            <div className="flex p-1.5 bg-white/60 dark:bg-card/60 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-2xl overflow-x-auto scrollbar-hide shadow-xl shadow-black/5 sticky top-[132px] sm:top-[132px] z-30">
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
                      "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black italic uppercase tracking-widest transition-all shrink-0 relative",
                      isActive 
                        ? "bg-primary text-white shadow-lg shadow-primary/30" 
                        : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                    )}
                  >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Notification Nodes */}
            <div className="flex flex-col gap-3">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((node, i) => (
                  <div 
                    key={node.id}
                    onClick={() => handleAction(node)}
                    className={cn(
                      "group relative bg-white/40 dark:bg-card/40 backdrop-blur-xl border rounded-[2rem] p-5 flex items-start gap-4 transition-all hover:shadow-2xl hover:scale-[1.01] cursor-pointer animate-in fade-in slide-in-from-bottom-2",
                      !node.isRead ? "border-primary/30 bg-primary/[0.02]" : "border-white/20 opacity-70"
                    )}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {!node.isRead && (
                      <div className="absolute top-6 right-6 h-2 w-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(153,64,229,0.8)]" />
                    )}

                    <div className="relative shrink-0 pt-1">
                      {node.avatar ? (
                        <Avatar className="h-12 w-12 border-2 border-white dark:border-[#0A0A0A] shadow-xl">
                          <AvatarImage src={node.avatar} />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className={cn(
                          "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg",
                          node.type === 'SONIC' ? "bg-accent/20 text-accent" : node.type === 'SYSTEM' ? "bg-green-500/20 text-green-500" : "bg-primary/20 text-primary"
                        )}>
                          {node.type === 'SONIC' ? <Music2 className="h-6 w-6" /> : node.type === 'SYSTEM' ? <ShieldCheck className="h-6 w-6" /> : <Users className="h-6 w-6" />}
                        </div>
                      )}
                      <div className={cn(
                        "absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white dark:border-[#0A0A0A] flex items-center justify-center shadow-md",
                        node.type === 'SONIC' ? "bg-accent" : node.type === 'SYSTEM' ? "bg-green-500" : "bg-primary"
                      )}>
                        {node.type === 'SONIC' ? <Music2 className="h-2.5 w-2.5 text-white" /> : node.type === 'SYSTEM' ? <Zap className="h-2.5 w-2.5 text-white" /> : <Users className="h-2.5 w-2.5 text-white" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className={cn(
                            "font-black italic uppercase tracking-tighter text-lg leading-none",
                            !node.isRead ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {node.title}
                          </h3>
                          <span className="text-[9px] font-black text-muted-foreground uppercase whitespace-nowrap">{node.time}</span>
                        </div>
                        <p className="text-[13px] leading-relaxed text-muted-foreground font-medium">
                          {renderContent(node.content)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {node.actionLabel && (
                          <Button size="sm" className="rounded-xl h-8 px-4 font-black uppercase text-[9px] italic tracking-widest bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                            {node.actionLabel}
                          </Button>
                        )}
                        {node.image && (
                          <div className="h-10 w-10 rounded-lg overflow-hidden border border-white/10 shrink-0 shadow-lg">
                            <Image src={node.image} alt="Ref" width={40} height={40} className="object-cover" />
                          </div>
                        )}
                        <Button 
                          variant="ghost" size="icon" 
                          className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ml-auto hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => handlePurge(e, node.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-24 text-center space-y-6 opacity-40 animate-in fade-in zoom-in-95 duration-500">
                  <div className="h-24 w-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto border-2 border-dashed border-primary/20">
                    <Bell className="h-10 w-10 text-primary/40" />
                  </div>
                  <div className="space-y-2 px-12">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Absolute Quiet</h3>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">No signals detected in this cluster. New pulses will materialize here as the network grows.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="rounded-full border-primary text-primary hover:bg-primary hover:text-white transition-all font-black uppercase tracking-widest text-[9px]"
                    onClick={() => setActiveTab("ALL")}
                  >
                    Sync All Channels
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
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
