
"use client";

import Link from "next/link";
import { 
  Home, 
  Users, 
  Clapperboard, 
  Search, 
  Music2,
  Coins,
  Gem,
  Star,
  User,
  Wallet,
  TrendingUp,
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useNotifications, PulseCategory } from "@/context/NotificationContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const navItems: { icon: any; label: string; id: string; href: string; category: PulseCategory }[] = [
  { icon: Home, label: "Home", id: "home", href: "/", category: "HOME" },
  { icon: Users, label: "Friends", id: "friends", href: "/friends", category: "FRIENDS" },
  { icon: Music2, label: "Music", id: "music", href: "/music", category: "MUSIC" },
  { icon: Clapperboard, label: "Reels", id: "reels", href: "/reels", category: "REELS" },
];

const PulseBadge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <div className="absolute -top-1 -right-1 bg-primary text-white text-[7px] font-black h-3.5 w-3.5 min-w-[14px] rounded-full flex items-center justify-center border border-white dark:border-background shadow-sm animate-in zoom-in duration-300">
      {count > 9 ? '9+' : count}
    </div>
  );
};

export function SubHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { setSearchOpen, currentUser } = usePosts();
  const { triggerHaptic } = useMusic();
  const { categoryPulses, clearPulse } = useNotifications();

  const handleNav = (href: string) => {
    triggerHaptic(5);
    router.push(href);
  };

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
                onClick={() => { triggerHaptic(5); clearPulse(item.category); }}
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div 
                className="shrink-0 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-all group active:scale-95"
                onClick={() => triggerHaptic(5)}
              >
                <div className="hidden lg:block text-right">
                  <p className="text-xs font-bold leading-none group-hover:text-primary transition-colors">{currentUser.name}</p>
                  <p className="text-[10px] text-muted-foreground">Pulse Wallet</p>
                </div>
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-primary/10 transition-transform group-hover:scale-105 shadow-sm">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-[1.5rem] p-2 shadow-2xl border-primary/10 animate-in zoom-in-95 duration-200">
              <DropdownMenuLabel className="p-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity Node</span>
                  <div className="flex items-center gap-2">
                    <span className="font-black italic uppercase tracking-tighter text-lg">{currentUser.name}</span>
                    {currentUser.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-primary fill-primary text-white" />}
                  </div>
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator className="bg-primary/5" />
              
              <div className="p-2 space-y-1">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/20 border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Stars</span>
                  </div>
                  <span className="text-sm font-black tabular-nums">{(currentUser.starBalance || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/20 border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Gold</span>
                  </div>
                  <span className="text-sm font-black tabular-nums">{currentUser.goldBalance || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary/20 border border-transparent hover:border-primary/10 transition-all">
                  <div className="flex items-center gap-2">
                    <Gem className="h-4 w-4 text-cyan-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Diamonds</span>
                  </div>
                  <span className="text-sm font-black tabular-nums">{currentUser.diamondBalance || 0}</span>
                </div>
              </div>

              <DropdownMenuSeparator className="bg-primary/5" />

              <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer group" onClick={() => handleNav('/profile')}>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold">My Profile</span>
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Workspace Node</span>
                </div>
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-40" />
              </DropdownMenuItem>

              <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer group" onClick={() => handleNav('/currency')}>
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                  <Wallet className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold">Buy Currency</span>
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Purchase Energy</span>
                </div>
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-40" />
              </DropdownMenuItem>

              <DropdownMenuItem className="gap-3 p-3 rounded-xl cursor-pointer group" onClick={() => handleNav('/earnings')}>
                <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-green-600">Earnings Portal</span>
                  <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter">Withdraw Assets</span>
                </div>
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground opacity-40" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
