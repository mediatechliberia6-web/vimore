
"use client";

import { 
  ArrowLeft, 
  Search, 
  Home, 
  MessageCircle, 
  Clapperboard, 
  ChevronRight,
  Settings,
  ShieldCheck,
  Smartphone,
  Info,
  Sparkles,
  Music2,
  Bell
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
import { useNotifications } from "@/context/NotificationContext";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MenuPage() {
  const { currentTrack, isExpanded } = useMusic();
  const { unreadCount } = useNotifications();
  const isPlayerActive = currentTrack && !isExpanded;

  const menuGrid = [
    { label: "Home feed", icon: Home, color: "text-primary", bg: "bg-primary/10", href: "/" },
    { label: "Signals", icon: Bell, color: "text-red-500", bg: "bg-red-50", href: "/notifications", badge: unreadCount },
    { label: "Music Hub", icon: Music2, color: "text-purple-500", bg: "bg-purple-50", href: "/music" },
    { label: "Messages", icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-50", href: "/messages" },
    { label: "Reels", icon: Clapperboard, color: "text-orange-500", bg: "bg-orange-50", href: "/reels" },
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
          <h1 className="text-xl font-bold font-headline tracking-tight text-foreground">Menu</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50 dark:bg-white/5">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50 dark:bg-white/5">
            Settings
          </Button>
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
                  <AvatarImage src="https://picsum.photos/seed/me/200/200" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full border-2 border-white dark:border-card">
                  <Sparkles className="h-3 w-3" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-foreground">John Doe</span>
                <span className="text-sm text-muted-foreground font-medium">View your digital workspace</span>
              </div>
            </div>
            <div className="bg-primary/5 p-3 rounded-full group-hover:bg-primary/10 transition-colors">
              <ChevronRight className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Link>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Shortcuts</h2>
            <Button variant="link" className="text-xs font-bold p-0 h-auto">Edit</Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {menuGrid.map((item) => (
              <Link 
                key={item.label}
                href={item.href}
                className="bg-white dark:bg-card p-5 rounded-[1.75rem] border border-border/50 shadow-lg shadow-black/5 flex flex-col items-start gap-4 transition-all hover:-translate-y-1 active:scale-95 group relative"
              >
                <div className={cn("p-3.5 rounded-2xl transition-all group-hover:rotate-6", item.bg)}>
                  <item.icon className={cn("h-6 w-6", item.color)} />
                </div>
                <span className="font-bold text-[15px] tracking-tight text-foreground">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-black h-6 w-6 rounded-full flex items-center justify-center shadow-lg">
                    {item.badge}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-card rounded-[2rem] border border-border/50 shadow-xl shadow-black/5 overflow-hidden">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="settings" className="border-b border-border/50">
              <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-secondary/10 group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:scale-110 transition-transform">
                    <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="font-bold text-lg tracking-tight text-foreground">Settings & Privacy</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 space-y-1">
                {[
                  { label: "Privacy Checkup", icon: ShieldCheck, color: "text-green-500" },
                  { label: "Account Center", icon: Smartphone, color: "text-blue-500" },
                  { label: "Language", icon: Info, color: "text-orange-500" }
                ].map((sub) => (
                  <button key={sub.label} className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-secondary/50 transition-colors font-semibold text-[15px] text-left">
                    <sub.icon className={cn("h-4 w-4", sub.color)} />
                    {sub.label}
                  </button>
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
      <div className="h-20 lg:hidden" />
    </div>
  );
}
