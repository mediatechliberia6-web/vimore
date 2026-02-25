
"use client";

import { Compass, Plus, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MusicNavProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function MusicNav({ activeTab, onTabChange }: MusicNavProps) {
  const items = [
    { id: "discover", icon: Compass, label: "Discover" },
    { id: "upload", icon: Plus, label: "Upload", isSpecial: true },
    { id: "chart", icon: BarChart3, label: "Chart" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] px-4 pb-6 flex justify-center pointer-events-none">
      <nav className="flex items-center gap-1 sm:gap-4 bg-background/60 dark:bg-card/60 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-full px-6 py-2.5 shadow-2xl pointer-events-auto">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          
          if (item.isSpecial) {
            return (
              <button
                key={item.id}
                className="relative -top-1 w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/30 transition-transform active:scale-90 hover:scale-110"
                onClick={() => onTabChange(item.id)}
              >
                <item.icon className="h-6 w-6" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-all duration-300",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "animate-pulse")} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
