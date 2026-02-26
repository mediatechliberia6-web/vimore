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
  Circle
} from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (text: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const { triggerHaptic } = useMusic();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim()) return;
    
    triggerHaptic(10);
    onSend(text);
    setText("");
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
    // In real app, this would send a voice message
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic(20);
      toast({
        title: "Uploading Assets",
        description: `Preparing ${file.name} for high-velocity transfer...`,
      });
    }
  };

  return (
    <footer className="p-4 sm:p-6 bg-white dark:bg-card border-t border-primary/5 shrink-0 z-20">
      <div className="flex items-center gap-2 sm:gap-4 max-w-5xl mx-auto">
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
                className="h-12 bg-secondary/30 border-none rounded-2xl px-6 pr-12 focus-visible:ring-2 ring-primary/20 text-sm sm:text-base transition-all"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-8 w-8 text-muted-foreground hover:text-primary"
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
    </footer>
  );
}
