
"use client";

import { 
  ArrowLeft, 
  Search, 
  Home, 
  MessageCircle, 
  ChevronRight,
  Settings,
  ShieldCheck,
  Smartphone,
  Info,
  Sparkles,
  Music2,
  Bell,
  Coins,
  Users,
  Star,
  Gem,
  TrendingUp,
  Activity,
  ShieldAlert,
  LogOut,
  Languages,
  UserCog,
  BookOpen,
  FileText,
  Scale,
  Film
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { useMusic } from "@/context/MusicContext";
import { useNotifications, PulseCategory } from "@/context/NotificationContext";
import { usePosts } from "@/context/PostContext";
import { useTranslation } from "@/context/LanguageContext";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { NativeAdNode } from "@/components/ad/native-ad-node";

export default function MenuPage() {
  const { currentTrack, isExpanded } = useMusic();
  const { unreadCount, categoryPulses, clearPulse } = useNotifications();
  const { currentUser, triggerHaptic, logout, chatMessages, receivedRequestUsernames } = usePosts();
  const { t } = useTranslation();
  const { toast } = useToast();
  const isPlayerActive = currentTrack && !isExpanded;

  const isAdmin = currentUser?.role && currentUser.role !== 'USER';

  const unseenMsgCount = Object.values(chatMessages || {}).reduce((total, msgs) => {
    return total + msgs.filter((m: any) => m.sender === "them" && m.status !== "read").length;
  }, 0);

  const pendingFriendRequests = receivedRequestUsernames?.size || 0;

  const handleLogout = async () => {
    triggerHaptic(100);
    if (confirm("Initiate Log Out Protocol? Your local session cache will be purged.")) {
      await logout();
    }
  };

  const menuGrid: { label: string; icon: any; color: string; bg: string; href: string; badge?: number; category?: PulseCategory; isHidden?: boolean; dotOnly?: boolean }[] = [
    { label: t('menu_home_feed'), icon: Home, color: "text-primary", bg: "bg-primary/10", href: "/", category: "HOME" },
    { label: t('nav_reels'), icon: Film, color: "text-rose-500", bg: "bg-rose-50", href: "/reels", dotOnly: true },
    { label: t('menu_signals'), icon: Bell, color: "text-red-500", bg: "bg-red-50", href: "/notifications", badge: unreadCount },
    { label: t('menu_music_hub'), icon: Music2, color: "text-purple-500", bg: "bg-purple-50", href: "/music", dotOnly: true },
    { label: t('menu_currency_hub'), icon: Coins, color: "text-amber-500", bg: "bg-amber-50", href: "/currency" },
    { label: t('menu_earnings_hub'), icon: TrendingUp, color: "text-green-500", bg: "bg-green-50", href: "/earnings" },
    { label: t('menu_star_network'), icon: Star, color: "text-yellow-500", bg: "bg-yellow-50", href: "/referrals" },
    { label: t('menu_community'), icon: Users, color: "text-emerald-500", bg: "bg-emerald-50", href: "/friends", badge: pendingFriendRequests },
    { label: t('menu_messages'), icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-50", href: "/messages", badge: unseenMsgCount },
    { label: t('menu_how_it_works'), icon: BookOpen, color: "text-rose-500", bg: "bg-rose-50", href: "/how-it-works" },
    { label: t('menu_command_core'), icon: Activity, color: "text-indigo-500", bg: "bg-indigo-50", href: "/admin", isHidden: !isAdmin },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#050505] transition-colors duration-300">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/80 active:scale-90 transition-all">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold font-headline tracking-tight text-foreground">{t('nav_menu')}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50 dark:bg-white/5">
            <Search className="h-5 w-5" />
          </Button>
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50 dark:bg-white/5" onClick={() => triggerHaptic(5)}>
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className={cn(
        "max-w-xl mx-auto p-4 sm:p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-all",
        isPlayerActive ? "pt-[80px]" : "pt-4"
      )}>
        <Link href="/profile" className="block group">
          <div className="bg-white dark:bg-card rounded-[2rem] p-5 shadow-xl shadow-black/5 border border-border flex items-center justify-between transition-all hover:shadow-2xl active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16 border-4 border-white dark:border-card ring-2 ring-primary/20">
                  <AvatarImage src={currentUser?.avatar} />
                  <AvatarFallback>V</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full border-2 border-white dark:border-card">
                  <Sparkles className="h-3 w-3" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-bold text-xl tracking-tight text-foreground">{currentUser?.name || "Guest"}</span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                    <Coins className="h-3 w-3 text-amber-500" />
                    {currentUser?.goldBalance || 0} GD
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                    <Gem className="h-3 w-3 text-cyan-500" />
                    {currentUser?.diamondBalance || 0} D
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    {currentUser?.starBalance || 0} STAR
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 p-3 rounded-full group-hover:bg-primary/10 transition-colors">
              <ChevronRight className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Link>

        <NativeAdNode type="banner-468" id="menu-top-pulse" />

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{t('menu_shortcuts')}</h2>
            <Button variant="link" className="text-xs font-bold p-0 h-auto">{t('menu_edit')}</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {menuGrid.filter(i => !i.isHidden).map((item) => {
              const displayBadge = item.badge ?? (item.category ? categoryPulses[item.category] : 0);
              
              return (
                <Link 
                  key={item.label}
                  href={item.href}
                  onClick={() => item.category && clearPulse(item.category)}
                  className="bg-white dark:bg-card p-5 rounded-[1.75rem] border border-border/50 shadow-lg shadow-black/5 flex flex-col items-start gap-4 transition-all hover:-translate-y-1 active:scale-95 group relative"
                >
                  <div className={cn("p-3.5 rounded-2xl transition-all group-hover:rotate-6", item.bg)}>
                    <item.icon className={cn("h-6 w-6", item.color)} />
                  </div>
                  <span className="font-bold text-[15px] tracking-tight text-foreground">{item.label}</span>
                  {item.dotOnly && (
                    <div className="absolute top-4 right-4 h-2.5 w-2.5 bg-primary rounded-full shadow-[0_0_8px_rgba(153,64,229,0.8)]" />
                  )}
                  {!item.dotOnly && displayBadge > 0 && (
                    <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-black h-6 w-6 min-w-[24px] rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                      {displayBadge > 9 ? '9+' : displayBadge}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        <NativeAdNode type="banner-468" id="menu-mid-pulse" />

        <div className="bg-white dark:bg-card rounded-[2rem] border border-border/50 shadow-xl shadow-black/5 overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="settings" className="border-b border-border/50">
              <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-secondary/10 group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                    <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-bold text-lg tracking-tight text-foreground">{t('menu_settings_privacy')}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 space-y-1">
                <Link href="/settings" className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-secondary/50 transition-colors font-semibold text-[15px] text-left">
                  <Settings className="h-4 w-4 text-slate-500" />
                  {t('settings_title')}
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-indigo-500/10 transition-colors font-semibold text-[15px] text-left text-indigo-600">
                    <ShieldCheck className="h-4 w-4" />
                    {t('menu_command_core')}
                  </Link>
                )}
                <Link href="/settings/privacy-checkup" className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-green-500/10 transition-colors font-semibold text-[15px] text-left text-green-600">
                  <ShieldCheck className="h-4 w-4" />
                  {t('privacy_checkup')}
                </Link>
                <Link href="/settings/account" className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-blue-500/10 transition-colors font-semibold text-[15px] text-left text-blue-600">
                  <UserCog className="h-4 w-4" />
                  {t('account_center')}
                </Link>
                <Link href="/settings/language" className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-orange-500/10 transition-colors font-semibold text-[15px] text-left text-orange-600">
                  <Languages className="h-4 w-4" />
                  {t('language_hub')}
                </Link>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="legal" className="border-none">
              <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-secondary/10 group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                    <BookOpen className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-bold text-lg tracking-tight text-foreground">Legal & Support</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 space-y-1">
                <Link href="/privacy" className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-secondary/50 transition-colors font-semibold text-[15px] text-left">
                  <FileText className="h-4 w-4 text-slate-500" />
                  Privacy Policy
                </Link>
                <Link href="/terms" className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-secondary/50 transition-colors font-semibold text-[15px] text-left">
                  <Scale className="h-4 w-4 text-slate-500" />
                  Terms of Service
                </Link>
                <Link href="/how-it-works" className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-secondary/50 transition-colors font-semibold text-[15px] text-left">
                  <Info className="h-4 w-4 text-slate-500" />
                  How ViMore Works
                </Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="pt-6 space-y-6">
          <NativeAdNode type="banner-468" id="menu-bottom-pulse" />
          <Button 
            variant="ghost" 
            className="w-full h-14 rounded-2xl bg-white dark:bg-card border border-border/50 text-destructive font-bold flex items-center justify-center gap-3 shadow-lg shadow-black/5 hover:bg-destructive hover:text-white transition-all active:scale-95 mt-4"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            {t('logout')}
          </Button>

          <div className="flex flex-col items-center gap-2 py-8 opacity-40">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground">ViMore Network</p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-primary italic">{t('branding_mtl')}</p>
          </div>
        </div>
      </main>
      <div className="h-20 lg:hidden" />
    </div>
  );
}
