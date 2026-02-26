"use client";

import { useState, useEffect } from "react";
import { MainNav } from "@/components/layout/main-nav";
import { ChatList } from "@/components/chat/chat-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { useMusic } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MessagesPage() {
  const { currentTrack, isExpanded } = useMusic();
  const { connections } = usePosts();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);

  const isPlayerActive = currentTrack && !isExpanded;

  // Handle mobile view state
  useEffect(() => {
    if (selectedChatId) {
      setShowMobileChat(true);
    } else {
      setShowMobileChat(false);
    }
  }, [selectedChatId]);

  const selectedContact = connections.find(c => c.username === selectedChatId) || null;

  return (
    <div className="h-[100dvh] bg-background flex justify-center overflow-hidden">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-[280px_1fr] h-full">
        {/* Rail 1: Navigation (Desktop) */}
        <aside className="hidden md:block border-r border-primary/5 bg-white dark:bg-card">
          <MainNav />
        </aside>

        {/* Messaging Ecosystem */}
        <main className={cn(
          "relative grid grid-cols-1 lg:grid-cols-[400px_1fr] bg-white dark:bg-[#050505] transition-all duration-300",
          isPlayerActive ? "pt-[64px]" : "pt-0"
        )}>
          
          {/* Rail 2: Chat List */}
          <div className={cn(
            "h-full border-r border-primary/5 flex flex-col transition-all duration-300",
            showMobileChat ? "hidden lg:flex" : "flex"
          )}>
            <ChatList 
              selectedId={selectedChatId} 
              onSelect={(id) => setSelectedChatId(id)} 
            />
          </div>

          {/* Rail 3: Chat Window */}
          <div className={cn(
            "h-full flex flex-col relative transition-all duration-300",
            !showMobileChat ? "hidden lg:flex" : "flex"
          )}>
            {selectedContact ? (
              <ChatWindow 
                contact={selectedContact} 
                onBack={() => setSelectedChatId(null)} 
              />
            ) : (
              <div className="flex-1 hidden lg:flex flex-col items-center justify-center text-center p-12 bg-[#FAFAFF] dark:bg-[#080808]">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">ViMore Connect</h3>
                <p className="text-muted-foreground text-sm max-w-xs mt-2">
                  Select a creator to start a high-velocity conversation.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
