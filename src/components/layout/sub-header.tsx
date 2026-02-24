
"use client";

import { Home, Users, Clapperboard, Music, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { icon: Home, label: "Home", id: "home" },
  { icon: Users, label: "Friends", id: "friends" },
  { icon: Clapperboard, label: "Reels", id: "reels" },
  { icon: Music, label: "Music", id: "music" },
];

const USER_PROFILE = {
  name: "John Doe",
  avatar: "https://picsum.photos/seed/me/200/200",
};

export function SubHeader() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="w-full bg-white dark:bg-card border-b border-primary/5 sticky top-[61px] z-40 shadow-sm transition-all duration-300">
      <div className="max-w-[1440px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <nav className="flex items-center h-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-2 px-4 h-full relative transition-colors group",
                activeTab === item.id 
                  ? "text-primary font-bold" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "scale-110" : "group-hover:scale-110 transition-transform")} />
              <span className="hidden sm:inline text-sm">{item.label}</span>
              {activeTab === item.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Search and Profile Section */}
        <div className="flex items-center gap-4 flex-1 max-w-md justify-end">
          <div className="relative group w-full hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Find friends or music..." 
              className="pl-10 rounded-xl bg-secondary/30 border-none focus-visible:ring-primary h-9 text-sm" 
            />
          </div>
          
          <div className="shrink-0 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="hidden lg:block text-right">
              <p className="text-xs font-bold leading-none">{USER_PROFILE.name}</p>
              <p className="text-[10px] text-muted-foreground">My Profile</p>
            </div>
            <Avatar className="h-9 w-9 border-2 border-primary/10">
              <AvatarImage src={USER_PROFILE.avatar} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
}
