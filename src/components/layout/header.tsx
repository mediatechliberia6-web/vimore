"use client";

import Link from "next/link";
import { Search, Plus, Menu, Bell, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreatePostModal } from "@/components/post/create-post-modal";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-primary/10 px-4 py-2 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-105">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
              <path d="M3 7L10 19L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 15L17 7L21 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-headline font-bold text-xl tracking-tight text-primary">ViMore</span>
        </Link>
        <div className="hidden sm:block relative group max-w-[160px] sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary" />
          <Input 
            placeholder="Search ViMore" 
            className="pl-10 rounded-full bg-secondary/50 border-none focus-visible:ring-primary h-9 text-sm" 
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <CreatePostModal>
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50">
            <Plus className="h-5 w-5" />
          </Button>
        </CreatePostModal>
        <Link href="/messages">
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50">
            <MessageCircle className="h-5 w-5" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50 relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-destructive text-white text-[10px] flex items-center justify-center rounded-full font-bold">2</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
