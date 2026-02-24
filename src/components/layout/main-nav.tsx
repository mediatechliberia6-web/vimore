"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, MessageCircle, Search, Bell, Settings, LogOut, PlusSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Explore", href: "/explore" },
  { icon: Bell, label: "Notifications", href: "/notifications" },
  { icon: MessageCircle, label: "Messages", href: "/messages" },
  { icon: User, label: "Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function MainNav() {
  const pathname = usePathname();

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
                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-secondary text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive ? "scale-110" : "group-hover:scale-110 transition-transform")} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
        
        <Button className="w-full mt-4 rounded-xl py-6 gap-2 font-headline text-lg bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20">
          <PlusSquare className="w-5 h-5" />
          <span>Post</span>
        </Button>
      </nav>

      <div className="pt-6 border-t border-border">
        <button className="flex items-center gap-4 px-4 py-3 w-full rounded-xl hover:bg-destructive/10 text-destructive transition-colors group">
          <LogOut className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
