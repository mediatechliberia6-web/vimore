"use client";

import { useState, useRef, useEffect } from "react";
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
  LayoutDashboard,
  Square,
  Trash2
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
  onSend: (text: string, options?: { isViewOnce?: boolean; isWorkspace?: boolean; mediaUrl?: string; mediaType?: 'photo' | 'video' | 'voice' }) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [isViewOnceEnabled, setIsViewOnceEnabled] = useState(false);
  const { triggerHaptic } = useMusic();
  const { toast } = useToast();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Audio Recording Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer Effect
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleVoiceStart = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedBlobUrl(audioUrl);
        setIsReviewing(true);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      triggerHaptic(30);
      setRecordingDuration(0);
      recorder.start();
      setIsRecording(true);
      toast({
        title: "Recording Sonic Note",
        description: "Speak into the hub...",
      });
    } catch (err) {
      console.error("Microphone access denied", err);
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Please enable microphone permissions to send voice notes.",
      });
    }
  };

  const handleVoiceStop = () => {
    if (mediaRecorderRef.current && isRecording) {
      triggerHaptic(20);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendVoice = () => {
    if (recordedBlobUrl) {
      triggerHaptic(25);
      onSend("", { mediaUrl: recordedBlobUrl, mediaType: 'voice' });
      resetVoiceState();
      toast({
        title: "Note Launched",
        description: "Voice signature added to conversation.",
      });
    }
  };

  const handleDiscardVoice = () => {
    triggerHaptic(10);
    resetVoiceState();
    toast({
      description: "Recording discarded.",
    });
  };

  const resetVoiceState = () => {
    setIsRecording(false);
    setIsReviewing(false);
    setRecordingDuration(0);
    if (recordedBlobUrl) URL.revokeObjectURL(recordedBlobUrl);
    setRecordedBlobUrl(null);
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
        {!isRecording && !isReviewing && (
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
        )}

        <div className="flex items-center gap-2 sm:gap-4">
          {!isRecording && !isReviewing && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary transition-colors">
                <Smile className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary transition-colors">
                <Paperclip className="h-6 w-6" />
              </Button>
            </div>
          )}

          <div className="flex-1 relative group">
            {isRecording ? (
              <div className="h-12 bg-primary/10 border-none rounded-2xl px-6 flex items-center justify-between animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-black text-primary tabular-nums">{formatDuration(recordingDuration)}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-2 hidden sm:inline">Capturing Sonic ID...</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleVoiceStop} 
                  className="h-8 text-primary hover:bg-primary/10 rounded-full font-black uppercase text-[10px] tracking-widest gap-2"
                >
                  <Square className="h-3.5 w-3.5 fill-current" /> STOP
                </Button>
              </div>
            ) : isReviewing ? (
              <div className="h-12 bg-secondary/30 border-none rounded-2xl px-6 flex items-center justify-between animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center gap-3">
                  <Mic className="h-4 w-4 text-primary" />
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Final: <span className="text-foreground tabular-nums">{formatDuration(recordingDuration)}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleDiscardVoice} 
                    className="h-8 w-8 text-muted-foreground hover:text-destructive rounded-full"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={handleSendVoice}
                    className="h-8 px-4 bg-primary text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20"
                  >
                    SEND VIBE
                  </Button>
                </div>
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

          {!isReviewing && (
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
                  {isRecording ? <Square className="h-6 w-6 fill-current animate-pulse" /> : <Mic className="h-6 w-6" />}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}