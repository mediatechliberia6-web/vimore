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
  Video as VideoIcon,
  MoreHorizontal,
  X,
  Circle,
  Flame,
  LayoutDashboard,
  Square,
  Trash2
} from "lucide-react";
import { useMusic } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatInputProps {
  onSend: (text: string, options?: { isViewOnce?: boolean; isWorkspace?: boolean; mediaUrl?: string; mediaType?: 'photo' | 'video' | 'voice'; duration?: string }) => void;
}

const VIDEO_UPLOAD_LIMIT = 300; // 5 minutes in seconds

export function ChatInput({ onSend }: ChatInputProps) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [isViewOnceEnabled, setIsViewOnceEnabled] = useState(false);
  const { triggerHaptic } = useMusic();
  const { settings } = usePosts();
  const { toast } = useToast();
  
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentFilter, setCurrentFilter] = useState<string>("image/*,video/*");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleMediaTrigger = (filter: string) => {
    if (settings.isFreeMode) {
      const type = filter.startsWith("video") ? "videos" : "photos";
      toast({ title: "Free Mode is On", description: `Turn off Free Mode to send ${type}.` });
      return;
    }
    triggerHaptic(5);
    setCurrentFilter(filter);
    setTimeout(() => {
      if (fileInputRef.current) fileInputRef.current.click();
    }, 10);
  };

  const handleVoiceStart = async () => {
    if (settings.isFreeMode) {
      toast({ title: "Free Mode is On", description: "Turn off Free Mode to send voice messages." });
      return;
    }
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
        stream.getTracks().forEach(track => track.stop());
      };

      triggerHaptic(30);
      setRecordingDuration(0);
      recorder.start();
      setIsRecording(true);
      toast({ title: "Capturing Sonic Note", description: "Vibe live..." });
    } catch (err) {
      toast({ variant: "destructive", title: "Access Denied", description: "Mic required for voice vibes." });
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
      onSend("", { 
        mediaUrl: recordedBlobUrl, 
        mediaType: 'voice',
        duration: formatDuration(recordingDuration)
      });
      resetVoiceState();
    }
  };

  const handleDiscardVoice = () => {
    triggerHaptic(10);
    resetVoiceState();
  };

  const resetVoiceState = () => {
    setIsRecording(false);
    setIsReviewing(false);
    setRecordingDuration(0);
    setRecordedBlobUrl(null);
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
          sendMedia(mediaUrl, 'video', file.name);
        };
        video.onerror = () => {
          toast({ variant: "destructive", title: "Format Error", description: "Could not decode video metadata." });
          URL.revokeObjectURL(mediaUrl);
        };
        video.src = mediaUrl;
      } else {
        sendMedia(mediaUrl, 'photo', file.name);
      }
      
      e.target.value = "";
    }
  };

  const sendMedia = (url: string, type: 'photo' | 'video', fileName: string) => {
    onSend("", { 
      isViewOnce: isViewOnceEnabled,
      mediaUrl: url,
      mediaType: type
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
        {!isRecording && !isReviewing && (
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
        )}

        <div className="flex items-center gap-2 sm:gap-4">
          {!isRecording && !isReviewing && (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary"><Smile className="h-6 w-6" /></Button>
              <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 text-muted-foreground hover:text-primary" onClick={() => handleMediaTrigger("video/*")}><VideoIcon className="h-6 w-6" /></Button>
            </div>
          )}

          <div className="flex-1 relative">
            {isRecording ? (
              <div className="h-12 bg-primary/10 rounded-2xl px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-black text-primary tabular-nums">{formatDuration(recordingDuration)}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleVoiceStop} className="h-8 text-primary font-black uppercase text-[10px] tracking-widest gap-2"><Square className="h-3.5 w-3.5 fill-current" /> STOP</Button>
              </div>
            ) : isReviewing ? (
              <div className="h-12 bg-secondary/30 rounded-2xl px-6 flex items-center justify-between">
                <div className="flex items-center gap-3"><Mic className="h-4 w-4 text-primary" /><span className="text-xs font-black text-muted-foreground uppercase">Review: <span className="text-foreground tabular-nums">{formatDuration(recordingDuration)}</span></span></div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={handleDiscardVoice} className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  <Button onClick={handleSendVoice} className="h-8 px-4 bg-primary text-white rounded-full font-black uppercase text-[10px] tracking-widest">SEND VIBE</Button>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {!isReviewing && (
            <div className="shrink-0">
              {text.trim() ? (
                <Button onClick={handleSubmit} className="rounded-full h-12 w-12 bg-primary text-white"><Send className="h-5 w-5 fill-current" /></Button>
              ) : (
                <Button variant="ghost" size="icon" className={cn("rounded-full h-12 w-12", isRecording ? "bg-primary text-white" : "bg-secondary/50")} onClick={isRecording ? handleVoiceStop : handleVoiceStart}>
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
