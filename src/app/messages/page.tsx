"use client";

import { MainNav } from "@/components/layout/main-nav";
import { DirectMessageList } from "@/components/chat/direct-message-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Phone, Video, Info, Paperclip, Smile } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const { currentTrack, isExpanded } = useMusic();
  const isPlayerActive = currentTrack && !isExpanded;

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-[280px_1fr] h-screen overflow-hidden">
        {/* Left Navigation */}
        <aside className="hidden md:block border-r border-primary/5">
          <MainNav />
        </aside>

        {/* Messaging Area */}
        <main className={cn(
          "grid grid-cols-1 lg:grid-cols-[380px_1fr] bg-white overflow-hidden shadow-2xl transition-all duration-300",
          isPlayerActive ? "pt-[64px]" : "pt-0"
        )}>
          <DirectMessageList />

          <div className="flex flex-col h-full bg-[#FAFAFF]">
            {/* Chat Header */}
            <header className="h-[76px] px-6 border-b border-primary/10 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-primary/10">
                  <AvatarImage src="https://picsum.photos/seed/1/100/100" />
                  <AvatarFallback>AR</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-bold text-sm">Alex Rivera</span>
                  <span className="text-[10px] text-green-500 font-medium">Online</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Info className="h-5 w-5" />
                </Button>
              </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
              <div className="self-center py-4">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest bg-white/50 px-3 py-1 rounded-full">Today</span>
              </div>

              <div className="max-w-[80%] self-start bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-primary/5 text-sm">
                Hey! Did you check out the new design trends I posted about?
              </div>
              <div className="max-w-[80%] self-end bg-primary text-white p-4 rounded-2xl rounded-tr-none shadow-lg shadow-primary/20 text-sm">
                I did! The ViMore aesthetic is really setting a new standard.
              </div>
              <div className="max-w-[80%] self-start bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-primary/5 text-sm">
                Exactly what I thought! See you at the event later today?
              </div>
            </div>

            {/* Chat Input */}
            <footer className="p-6 bg-white border-t border-primary/10">
              <div className="flex items-center gap-3 bg-secondary/30 rounded-2xl p-2 px-4 focus-within:ring-2 ring-primary/20 transition-all">
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input 
                  placeholder="Type a message..." 
                  className="border-none bg-transparent shadow-none focus-visible:ring-0 text-sm"
                />
                <Button variant="ghost" size="icon" className="text-muted-foreground">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button className="rounded-xl h-10 w-10 p-0 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
