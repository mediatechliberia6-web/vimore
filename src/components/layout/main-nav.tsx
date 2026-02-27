"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, MessageCircle, PlusSquare, Compass, Menu, Music2, Clapperboard, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/NotificationContext";

export function MainNav() {
  const pathname = usePathname();
  const { unreadCount } = useNotifications();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Compass, label: "Explore", href: "/explore" },
    { icon: Clapperboard, label: "Reels", href: "/reels" },
    { icon: Music2, label: "Music", href: "/music" },
    { icon: Bell, label: "Notifications", href: "/notifications", badge: unreadCount },
    { icon: MessageCircle, label: "Messages", href: "/messages" },
    { icon: User, label: "Profile", href: "/profile" },
    { icon: Menu, label: "Menu", href: "/menu" },
  ];

  return (
    <div className="flex flex-col h-full py-6 px-4 space-y-8">
      <div className="px-2">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground transition-transform group-hover:scale-110">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
              <path d="M3 7L10 19L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 15L17 7L21 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-headline font-bold text-2xl tracking-tight">ViMore</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                  : "hover:bg-secondary text-muted-foreground hover:text-primary"
              )}
            >
              <div className="flex items-center gap-4">
                <item.icon className={cn("w-6 h-6", isActive ? "scale-110" : "group-hover:scale-110 transition-transform")} />
                <span className="font-bold text-sm">{item.label}</span>
              </div>
              {item.badge && item.badge > 0 && !isActive && (
                <div className="bg-primary text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center shadow-lg shadow-primary/20">
                  {item.badge}
                </div>
              )}
            </Link>
          );
        })}
        
        <div className="pt-4">
          <Button className="w-full rounded-2xl py-6 gap-2 font-black italic uppercase tracking-tighter text-lg bg-accent hover:bg-accent/90 shadow-xl shadow-accent/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <PlusSquare className="w-6 h-6" />
            <span>Post</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}
