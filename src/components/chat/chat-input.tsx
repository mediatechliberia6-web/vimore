"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Paperclip, 
  Smile, 
  Send, 
  Mic, 
  Image as ImageIcon,
  MoreHorizontal,
  X,
  Circle,
  Flame,
  LayoutDashboard
} from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatInputProps {
  onSend: (text: string, options?: { isViewOnce?: boolean; isWorkspace?: boolean; mediaUrl?: string; mediaType?: 'photo' | 'video' }) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isViewOnceEnabled, setIsViewOnceEnabled] = useState(false);
  const { triggerHaptic } = useMusic();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageClick = () => {
    triggerHaptic(5);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleVoiceStart = () => {
    triggerHaptic(30);
    setIsRecording(true);
    toast({
      title: "Recording Sonic Note",
      description: "Speak into the hub...",
    });
  };

  const handleVoiceStop = () => {
    triggerHaptic(15);
    setIsRecording(false);
    toast({
      title: "Note Recorded",
      description: "Voice signature added to queue.",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic(20);
      
      const isVideo = file.type.startsWith('video');
      const reader = new FileReader();
      
      reader.onloadend = () => {
        const mediaUrl = reader.result as string;
        onSend("", { 
          isViewOnce: isViewOnceEnabled,
          mediaUrl: mediaUrl,
          mediaType: isVideo ? 'video' : 'photo'
        });
        setIsViewOnceEnabled(false);
      };
      
      reader.readAsDataURL(file);

      toast({
        title: isViewOnceEnabled ? "View-Once Vibe Prepared" : "Uploading Assets",
        description: isViewOnceEnabled ? "Media will explode after one view." : `Preparing ${file.name} for transfer...`,
      });
      
      // Reset input
      e.target.value = "";
    }
  };

  const toggleViewOnce = () => {
    triggerHaptic(15);
    setIsViewOnceEnabled(!isViewOnceEnabled);
    if (!isViewOnceEnabled) {
      toast({
        title: "Disappearing Mode",
        description: "Your next media share will explode after one view. 💥",
      });
    }
  };

  const handleWorkspaceShare = () => {
    triggerHaptic(25);
    onSend("", { isWorkspace: true });
    toast({
      title: "Workspace Synced",
      description: "Your live hub preview has been shared."
    });
  };

  return (
    <footer className="p-4 sm:p-6 bg-white dark:bg-card border-t border-primary/5 shrink-0 z-20">
      <div className="flex flex-col gap-4 max-w-5xl mx-auto">
        {/* Attachment & Privacy Toggles */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={handleWorkspaceShare}
                    className="h-10 w-10 rounded-xl bg-secondary/40 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-primary text-white font-bold text-[10px] uppercase tracking-widest border-none">Sync Workspace</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={toggleViewOnce}
                    className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center transition-all active:scale-90",
                      isViewOnceEnabled ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-secondary/40 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    <Flame className={cn("h-5 w-5", isViewOnceEnabled && "animate-pulse")} />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-primary text-white font-bold text-[10px] uppercase tracking-widest border-none">View-Once Vibe</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-500",
            isViewOnceEnabled ? "bg-primary/10 opacity-100" : "opacity-0"
          )}>
            <div className="h-1.5 w-1.5 bg-primary rounded-full animate-ping" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Disappearing Mode Active</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary transition-colors">
              <Smile className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary transition-colors">
              <Paperclip className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-1 relative group">
            {isRecording ? (
              <div className="h-12 bg-primary/10 border-none rounded-2xl px-6 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
                  <span className="text-xs font-black uppercase tracking-widest text-primary">Recording Voice Signature...</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsRecording(false)} className="h-8 text-primary hover:bg-primary/10 rounded-full font-bold">
                  <X className="h-4 w-4 mr-1" /> CANCEL
                </Button>
              </div>
            ) : (
              <>
                <Input 
                  ref={inputRef}
                  placeholder="Type a high-velocity message..." 
                  className={cn(
                    "h-12 border-none rounded-2xl px-6 pr-12 transition-all",
                    isViewOnceEnabled ? "bg-primary/5 focus-visible:ring-primary/40 text-primary italic font-bold" : "bg-secondary/30 focus-visible:ring-primary/20"
                  )}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-full h-8 w-8 transition-colors",
                      isViewOnceEnabled ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:text-primary"
                    )}
                    onClick={handleImageClick}
                  >
                    <ImageIcon className="h-5 w-5" />
                  </Button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*,video/*" 
                    onChange={handleFileChange} 
                  />
                </div>
              </>
            )}
          </div>

          <div className="shrink-0">
            {text.trim() ? (
              <Button 
                onClick={handleSubmit}
                className="rounded-full h-12 w-12 p-0 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 scale-110 transition-transform active:scale-95"
              >
                <Send className="h-5 w-5 fill-current" />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  "rounded-full h-12 w-12 transition-all",
                  isRecording ? "bg-primary text-white shadow-xl scale-125" : "bg-secondary/50 text-muted-foreground hover:text-primary"
                )}
                onClick={isRecording ? handleVoiceStop : handleVoiceStart}
              >
                {isRecording ? <Circle className="h-6 w-6 fill-current animate-pulse" /> : <Mic className="h-6 w-6" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
