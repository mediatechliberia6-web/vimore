
"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MainNav } from "@/components/layout/main-nav";
import { ChatList } from "@/components/chat/chat-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { useMusic } from "@/context/MusicContext";
import { usePosts, Connection, Cluster } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import { MessageSquare, Zap, Layers, Loader2 } from "lucide-react";
import { BiometricGate } from "@/components/layout/biometric-gate";
import { DiagnosticErrorBoundary } from "@/components/layout/diagnostic-error-boundary";
import MessagesLoading from "./loading";

function MessagesInner() {
  const { currentTrack, isExpanded } = useMusic();
  const { connections, clusters, currentUser, isLoading, allUsers, setSelectedChatId: setContextChatId } = usePosts();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const searchParams = useSearchParams();

  const isPlayerActive = currentTrack && !isExpanded;

  useEffect(() => {
    const open = searchParams.get('open');
    if (open) { setSelectedChatId(open); setContextChatId(open); }
  }, [searchParams, setContextChatId]);

  useEffect(() => {
    if (selectedChatId) {
      setShowMobileChat(true);
    } else {
      setShowMobileChat(false);
    }
  }, [selectedChatId]);

  const selectedContact = useMemo(() => {
    if (!selectedChatId || !currentUser) return null;
    
    const conn = connections.find(c => c.username === selectedChatId);
    if (conn) return { ...conn, isGroup: false } as Connection;
    
    const cluster = clusters.find(cl => cl.$id === selectedChatId);
    if (cluster) return { ...cluster, isGroup: true } as Cluster;

    const fallbackUser = allUsers.find(u => u.username === selectedChatId);
    if (fallbackUser) {
      return {
        $id: fallbackUser.$id,
        name: fallbackUser.name,
        username: fallbackUser.username,
        email: fallbackUser.vimoreId || '',
        avatar: fallbackUser.avatar,
        isVerified: fallbackUser.isVerified,
        isGroup: false,
        isOnline: false,
        followsYou: false,
      } as Connection;
    }
    
    return null;
  }, [connections, clusters, selectedChatId, currentUser, allUsers]);

  if (isLoading || !currentUser) {
    return <MessagesLoading />;
  }

  return (
    <BiometricGate title="Direct Messages">
      <div className="h-[100dvh] bg-background flex justify-center overflow-hidden">
        <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-[280px_1fr] h-full overflow-hidden">
          <aside className="hidden md:block border-r border-primary/5 bg-white dark:bg-card h-full">
            <div className="sticky top-0 h-full">
              <MainNav />
            </div>
          </aside>

          <main className="relative flex flex-col bg-white dark:bg-[#050505] h-full overflow-hidden">
            
            {isPlayerActive && <div className="h-16 shrink-0 transition-all duration-300" />}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[400px_1fr] min-h-0 overflow-hidden">
              <div className={cn(
                "h-full border-r border-primary/5 flex flex-col transition-all duration-300 min-h-0",
                showMobileChat ? "hidden lg:flex" : "flex"
              )}>
                <ChatList 
                  selectedId={selectedChatId} 
                  onSelect={(id) => { setSelectedChatId(id); setContextChatId(id); }} 
                />
              </div>

              <div className={cn(
                "h-full flex flex-col relative transition-all duration-300 min-h-0",
                !showMobileChat ? "hidden lg:flex" : "flex"
              )}>
                <DiagnosticErrorBoundary title="Chat Hub">
                  {selectedContact ? (
                    <div className="relative h-full flex flex-col min-0">
                      <ChatWindow 
                        contact={selectedContact} 
                        onBack={() => { setSelectedChatId(null); setContextChatId(null); }} 
                      />
                    </div>
                  ) : (
                    <div className="flex-1 hidden lg:flex flex-col items-center justify-center text-center p-12 bg-[#FAFAFF] dark:bg-[#080808]">
                      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500">
                        <Layers className="h-10 w-10 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">ViMore Cluster Hub</h3>
                        <div className="flex justify-center">
                          <div className="bg-primary/5 px-3 py-1 rounded-full flex items-center gap-2 border border-primary/10">
                            <Zap className="h-3 w-3 text-primary animate-pulse" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Focused Collaboration</span>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm max-w-xs mt-4">
                          Select a node or materialize a new cluster to begin collective synchronization.
                        </p>
                      </div>
                    </div>
                  )}
                </DiagnosticErrorBoundary>
              </div>
            </div>
          </main>
        </div>
      </div>
    </BiometricGate>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesLoading />}>
      <MessagesInner />
    </Suspense>
  );
}
