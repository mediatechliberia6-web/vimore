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
  MoreHorizontal
} from "lucide-react";
import { useMusic } from "@/context/MusicContext";

interface ChatInputProps {
  onSend: (text: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");
  const { triggerHaptic } = useMusic();
  const inputRef = useRef<HTMLInputElement>(null);

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
            >
              <ImageIcon className="h-5 w-5" />
            </Button>
          </div>
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
              className="rounded-full h-12 w-12 bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            >
              <Mic className="h-6 w-6" />
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}
