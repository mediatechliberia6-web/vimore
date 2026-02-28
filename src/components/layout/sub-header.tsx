"use client";

import Link from "next/link";
import { Home, Users, Clapperboard, Search, Music2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { usePosts } from "@/context/PostContext";
import { useNotifications, PulseCategory } from "@/context/NotificationContext";

const navItems: { icon: any; label: string; id: string; href: string; category: PulseCategory }[] = [
  { icon: Home, label: "Home", id: "home", href: "/", category: "HOME" },
  { icon: Users, label: "Friends", id: "friends", href: "/friends", category: "FRIENDS" },
  { icon: Music2, label: "Music", id: "music", href: "/music", category: "MUSIC" },
  { icon: Clapperboard, label: "Reels", id: "reels", href: "/reels", category: "REELS" },
];

const USER_PROFILE = {
  name: "John Doe",
  avatar: "https://picsum.photos/seed/me/200/200",
};

const PulseBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <div className="absolute top-1.5 right-1 bg-primary text-white text-[7px] font-black h-3.5 w-3.5 min-w-[14px] rounded-full flex items-center justify-center border border-white dark:border-background shadow-sm animate-in zoom-in duration-300">
      {count > 9 ? '9+' : count}
    </div>
  );
};

export function SubHeader() {
  const pathname = usePathname();
  const { setSearchOpen } = usePosts();
  const { categoryPulses, clearPulse } = useNotifications();

  return (
    <div className="w-full bg-white dark:bg-card border-b border-primary/5 sticky top-[61px] z-40 shadow-sm transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-4 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Navigation Tabs */}
        <nav className="flex items-center h-full shrink-0">
          {navItems.map((item) => {
            const isLinkActive = pathname === item.href;
            const isHomeActive = item.href === "/" && pathname === "/";
            const isActive = isLinkActive || isHomeActive;
            const pulseCount = categoryPulses[item.category];

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => clearPulse(item.category)}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 h-full relative transition-colors group",
                  isActive 
                    ? "text-primary font-bold" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <item.icon className={cn("w-5 h-5", isActive ? "scale-110" : "group-hover:scale-110 transition-transform")} />
                  {!isActive && <PulseBadge count={pulseCount} />}
                </div>
                <span className="hidden sm:inline text-sm">{item.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Search and Profile Section */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 justify-end min-w-0">
          <div className="relative group w-full max-w-[120px] xs:max-w-[160px] sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search..." 
              className="pl-8 pr-2 rounded-xl bg-secondary/30 border-none focus-visible:ring-primary h-8 sm:h-9 text-xs sm:text-sm cursor-pointer" 
              readOnly
              onClick={() => setSearchOpen(true)}
            />
          </div>
          
          <Link href="/profile" className="shrink-0 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity group">
            <div className="hidden lg:block text-right">
              <p className="text-xs font-bold leading-none group-hover:underline">{USER_PROFILE.name}</p>
              <p className="text-[10px] text-muted-foreground">My Profile</p>
            </div>
            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-primary/10 transition-transform group-hover:scale-105">
              <AvatarImage src={USER_PROFILE.avatar} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </div>
  );
}
