"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Paperclip, 
  Smile, 
  Send, 
  Image as ImageIcon,
  Video as VideoIcon,
  Flame,
} from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (text: string, options?: { isViewOnce?: boolean; isWorkspace?: boolean; mediaUrl?: string; mediaType?: 'photo' | 'video'; duration?: string; file?: File }) => void;
}

const VIDEO_UPLOAD_LIMIT = 300;

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isViewOnceEnabled, setIsViewOnceEnabled] = useState(false);
  const { triggerHaptic } = useMusic();
  const { settings } = usePosts();
  const { toast } = useToast();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentFilter, setCurrentFilter] = useState<string>("image/*,video/*");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    triggerHaptic(10);
    onSend(text, { isViewOnce: isViewOnceEnabled });
    setText("");
    setIsViewOnceEnabled(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleMediaTrigger = (filter: string) => {
    if (settings.isFreeMode) {
      toast({ variant: "destructive", title: "Free Mode Active", description: "Media sharing is disabled in Free Mode." });
      return;
    }
    triggerHaptic(5);
    setCurrentFilter(filter);
    setTimeout(() => {
      if (fileInputRef.current) fileInputRef.current.click();
    }, 10);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic(20);
      const isVideo = file.type.startsWith('video');
      const mediaUrl = URL.createObjectURL(file);
      
      if (isVideo) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          if (video.duration > VIDEO_UPLOAD_LIMIT) {
            toast({ 
              variant: "destructive", 
              title: "Clip Too Long", 
              description: "High-velocity sync is capped at 5 minutes per video." 
            });
            URL.revokeObjectURL(mediaUrl);
            e.target.value = "";
            return;
          }
          sendMedia(mediaUrl, 'video', file.name, file);
        };
        video.onerror = () => {
          toast({ variant: "destructive", title: "Format Error", description: "Could not decode video metadata." });
          URL.revokeObjectURL(mediaUrl);
        };
        video.src = mediaUrl;
      } else {
        sendMedia(mediaUrl, 'photo', file.name, file);
      }
      
      e.target.value = "";
    }
  };

  const sendMedia = (url: string, type: 'photo' | 'video', fileName: string, file: File) => {
    onSend("", { 
      isViewOnce: isViewOnceEnabled,
      mediaUrl: url,
      mediaType: type,
      file
    });
    setIsViewOnceEnabled(false);
    toast({
      title: isViewOnceEnabled ? "View-Once Vibe Shared" : "Media Shared",
      description: `Successfully launched ${fileName} to the hub.`
    });
  };

  const toggleViewOnce = () => {
    triggerHaptic(15);
    setIsViewOnceEnabled(!isViewOnceEnabled);
  };

  return (
    <footer className="p-4 sm:p-6 bg-white dark:bg-card border-t border-primary/5 shrink-0 z-20">
      <div className="flex flex-col gap-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleMediaTrigger("image/*,video/*")}
              className="h-10 w-10 rounded-xl bg-secondary/40 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button 
              onClick={toggleViewOnce}
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                isViewOnceEnabled ? "bg-primary text-white shadow-lg" : "bg-secondary/40 text-muted-foreground"
              )}
            >
              <Flame className={cn("h-5 w-5", isViewOnceEnabled && "animate-pulse")} />
            </button>
          </div>
          <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-500", isViewOnceEnabled ? "bg-primary/10 opacity-100" : "opacity-0")}>
            <div className="h-1.5 w-1.5 bg-primary rounded-full animate-ping" />
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Disappearing Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary"><Smile className="h-6 w-6" /></Button>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary" onClick={() => handleMediaTrigger("video/*")}><VideoIcon className="h-6 w-6" /></Button>
          </div>

          <div className="flex-1 relative">
            <Input 
              ref={inputRef}
              placeholder="Type a high-velocity message..." 
              className={cn("h-12 border-none rounded-2xl px-6 pr-12 bg-secondary/30", isViewOnceEnabled && "italic font-bold")}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleMediaTrigger("image/*")}><ImageIcon className="h-5 w-5" /></Button>
              <input type="file" ref={fileInputRef} className="hidden" accept={currentFilter} onChange={handleFileChange} />
            </div>
          </div>

          <div className="shrink-0">
            {text.trim() ? (
              <Button onClick={handleSubmit} className="rounded-full h-12 w-12 bg-primary text-white"><Send className="h-5 w-5 fill-current" /></Button>
            ) : (
              <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-secondary/50" onClick={handleSubmit} disabled>
                <Send className="h-6 w-6 text-muted-foreground" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
