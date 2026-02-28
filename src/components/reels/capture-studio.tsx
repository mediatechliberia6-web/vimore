"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { 
  X, 
  Zap, 
  RefreshCw, 
  Music2, 
  Check, 
  ChevronRight,
  Filter,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  Trash2,
  ArrowLeft,
  Circle,
  ZoomIn,
  ZoomOut,
  Search,
  Play,
  Pause,
  AlignLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { useMusic, ALL_SONGS, Track } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";

const FILTERS = [
  { id: "none", label: "Pure", class: "" },
  { id: "cyberpunk", label: "Cyber", class: "hue-rotate-90 saturate-200 contrast-125" },
  { id: "golden", label: "Golden", class: "sepia-[0.4] brightness-110 saturate-150" },
  { id: "noir", label: "Noir", class: "grayscale brightness-75 contrast-125" },
  { id: "vivid", label: "Vivid", class: "saturate-200 contrast-110" },
  { id: "arctic", label: "Arctic", class: "hue-rotate-[180deg] saturate-125 brightness-110" },
];

const RECORDING_LIMIT = 300; // 5 minutes standard

export function CaptureStudio() {
  const { isCaptureStudioOpen, closeCaptureStudio, captureTrack, setCaptureTrack, triggerHaptic } = useMusic();
  const { addPost, currentUser } = usePosts();
  const { toast } = useToast();

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [cameraMode, setCameraMode] = useState<"user" | "environment">("user");
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [timeLeft, setTimeLeft] = useState(RECORDING_LIMIT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Sound Search State
  const [isSearchingSound, setIsSearchingSound] = useState(false);
  const [soundSearchQuery, setSoundSearchQuery] = useState("");
  const [previewTrackId, setPreviewTrackId] = useState<string | number | null>(null);

  // Zoom State
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [isZoomSupported, setIsZoomSupported] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }

    try {
      const constraints = {
        video: { 
          facingMode: cameraMode,
          width: { ideal: 1080 },
          height: { ideal: 1920 },
          aspectRatio: { ideal: 9/16 },
          frameRate: { ideal: 60, min: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      const videoTrack = newStream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities() as any;
      
      const advanced: any[] = [];
      if (capabilities.focusMode?.includes('continuous')) advanced.push({ focusMode: 'continuous' });
      if (capabilities.exposureMode?.includes('continuous')) advanced.push({ exposureMode: 'continuous' });
      
      if (capabilities.zoom) {
        setIsZoomSupported(true);
        const minVal = capabilities.zoom.min || 1;
        const maxVal = capabilities.zoom.max || 1;
        setMinZoom(minVal);
        setMaxZoom(maxVal);
        setZoom(minVal);
        
        try {
          await videoTrack.applyConstraints({ advanced: [{ zoom: minVal }] } as any);
        } catch (e) {
          console.warn("Could not force initial zoom", e);
        }
      } else {
        setIsZoomSupported(false);
      }

      if (advanced.length > 0) {
        try {
          await videoTrack.applyConstraints({ advanced } as any);
        } catch (e) {
          console.warn("Advanced lens handshake bypassed", e);
        }
      }

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error("Studio source error:", error);
      toast({ 
        variant: "destructive", 
        title: "Hardware Conflict", 
        description: "Could not start video source. Please ensure other camera apps are closed." 
      });
      closeCaptureStudio();
    }
  }, [cameraMode, closeCaptureStudio, toast]);

  useEffect(() => {
    if (isCaptureStudioOpen && !recordedUrl) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isCaptureStudioOpen, cameraMode, recordedUrl]);

  useEffect(() => {
    if (!isRecording && !recordedUrl) {
      const initialLimit = captureTrack ? Math.min(captureTrack.duration, RECORDING_LIMIT) : RECORDING_LIMIT;
      setTimeLeft(initialLimit);
    }
  }, [captureTrack, isRecording, recordedUrl]);

  const resetStudio = () => {
    setIsRecording(false);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setCaption("");
    const initialLimit = captureTrack ? Math.min(captureTrack.duration, RECORDING_LIMIT) : RECORDING_LIMIT;
    setTimeLeft(initialLimit);
    setIsProcessing(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setZoom(minZoom);
    setIsSearchingSound(false);
    stopPreview();
  };

  const handleZoomChange = async (value: number) => {
    if (!stream || !isZoomSupported) return;
    const track = stream.getVideoTracks()[0];
    try {
      await track.applyConstraints({ advanced: [{ zoom: value }] } as any);
      setZoom(value);
      if (value === minZoom || value === maxZoom) triggerHaptic(10);
    } catch (e) {
      console.error("Zoom lock failure", e);
    }
  };

  const handleToggleFlash = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities() as any;
    
    if (capabilities.torch) {
      triggerHaptic(5);
      try {
        await track.applyConstraints({ advanced: [{ torch: !isFlashOn }] } as any);
        setIsFlashOn(!isFlashOn);
      } catch (e) {
        console.error("Flash handshake failure", e);
      }
    } else {
      toast({ description: "Flash not supported on this lens." });
    }
  };

  const handleFlipCamera = () => {
    triggerHaptic(15);
    setCameraMode(prev => prev === "user" ? "environment" : "user");
  };

  const startRecording = () => {
    if (!stream) return;
    triggerHaptic(30);
    chunksRef.current = [];
    
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') 
      ? 'video/webm;codecs=vp9,opus' 
      : 'video/mp4';

    const recorder = new MediaRecorder(stream, { 
      mimeType,
      videoBitsPerSecond: 8000000 
    });
    mediaRecorderRef.current = recorder;

    if (captureTrack && audioPreviewRef.current) {
      audioPreviewRef.current.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'; 
      audioPreviewRef.current.currentTime = 0;
      audioPreviewRef.current.play().catch(e => console.error("Sonic Playback Error", e));
    }

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setRecordedUrl(url);
      setIsProcessing(false);
      stopStream();
      
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current.currentTime = 0;
      }
    };

    recorder.start();
    setIsRecording(true);

    const initialLimit = captureTrack ? Math.min(captureTrack.duration, RECORDING_LIMIT) : RECORDING_LIMIT;
    setTimeLeft(initialLimit);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          stopRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      triggerHaptic(20);
      setIsProcessing(true);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const video = document.createElement('video');
    video.preload = 'metadata';
    const tempUrl = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(tempUrl);
      if (video.duration > RECORDING_LIMIT) {
        toast({ variant: "destructive", title: "Clip Too Long", description: "Reels are capped at 5 minutes." });
        return;
      }
      triggerHaptic(10);
      setRecordedUrl(URL.createObjectURL(file));
      stopStream();
    };
    video.src = tempUrl;
  };

  const handlePublish = () => {
    if (!recordedUrl) return;
    triggerHaptic(100);
    
    const finalContent = caption.trim() 
      ? caption 
      : `High-fidelity session with **${captureTrack?.title || 'Original Audio'}** ⚡️ #ViMore #Launch`;

    addPost({
      user: currentUser,
      content: finalContent,
      videoUrl: recordedUrl,
      language: 'en'
    });
    toast({ title: "Vibe Launched", description: "Your vibe is now live in the stream." });
    closeCaptureStudio();
    setCaption("");
  };

  const filteredSongs = useMemo(() => {
    if (!soundSearchQuery) return ALL_SONGS;
    const q = soundSearchQuery.toLowerCase();
    return ALL_SONGS.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q));
  }, [soundSearchQuery]);

  const toggleSoundPreview = (track: Track) => {
    if (previewTrackId === track.id) {
      stopPreview();
    } else {
      triggerHaptic(10);
      setPreviewTrackId(track.id);
      if (!audioPreviewRef.current) {
        audioPreviewRef.current = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); 
      }
      audioPreviewRef.current.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
      audioPreviewRef.current.play().catch(() => {});
    }
  };

  const stopPreview = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current.currentTime = 0;
    }
    setPreviewTrackId(null);
  };

  if (!isCaptureStudioOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-black flex flex-col animate-in fade-in duration-500 overflow-hidden">
      <audio ref={audioPreviewRef} className="hidden" />
      
      <div className="relative flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden">
        {recordedUrl ? (
          <div className="relative w-full h-full animate-in zoom-in-95 duration-500">
            <video 
              src={recordedUrl} 
              className={cn("w-full h-full object-cover", activeFilter.class)} 
              autoPlay 
              loop 
              playsInline 
            />
          </div>
        ) : (
          <video 
            ref={videoRef}
            autoPlay 
            muted 
            playsInline 
            className={cn(
              "w-full h-full object-cover transition-transform duration-500", 
              cameraMode === "user" && "scale-x-[-1]", 
              activeFilter.class
            )}
          />
        )}

        <div className="absolute top-6 left-0 right-0 z-50 flex flex-col items-center gap-4 px-6">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" size="icon" className="text-white bg-black/20 backdrop-blur-md rounded-full" onClick={closeCaptureStudio}>
              <X className="h-6 w-6" />
            </Button>
            
            <div className="flex-1 flex justify-center">
              <button 
                onClick={() => { triggerHaptic(5); setIsSearchingSound(true); }}
                className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 max-w-[200px] group hover:bg-black/60 transition-all active:scale-95"
              >
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center animate-pulse shrink-0">
                  <Music2 className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">
                    {captureTrack ? `${captureTrack.title} — ${captureTrack.artist}` : "Add Sounds"}
                  </p>
                </div>
              </button>
            </div>

            {recordedUrl ? (
              <Button 
                className="bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest text-[10px] rounded-full px-6 h-9 shadow-lg shadow-primary/20"
                onClick={handlePublish}
              >
                Launch
              </Button>
            ) : <div className="w-10" />}
          </div>

          <div className={cn(
            "bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-white flex items-center gap-2 shadow-2xl transition-all",
            isRecording && "bg-destructive/80 animate-pulse"
          )}>
            {isRecording && <div className="h-2 w-2 bg-white rounded-full animate-ping" />}
            <span className="text-xs font-black tracking-widest">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {recordedUrl && (
          <div className="absolute bottom-32 left-0 right-0 px-6 z-[60] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-2 px-1">
                <AlignLeft className="h-3 w-3 text-primary" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Reel Caption</span>
              </div>
              <textarea 
                placeholder="Add a high-velocity caption..."
                className="w-full bg-transparent border-none focus:ring-0 text-sm font-medium text-white placeholder:text-white/30 resize-none min-h-[80px]"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={500}
              />
              <div className="flex justify-end pt-2 border-t border-white/5">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  caption.length > 450 ? "text-primary" : "text-white/20"
                )}>
                  {caption.length} / 500
                </span>
              </div>
            </div>
          </div>
        )}

        {!recordedUrl && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-6">
            <button className="flex flex-col items-center gap-1.5 group" onClick={handleFlipCamera}>
              <div className="h-11 w-11 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white group-active:scale-90 transition-all"><RefreshCw className="h-5 w-5" /></div>
              <span className="text-[8px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">Flip</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 group" onClick={handleToggleFlash}>
              <div className={cn("h-11 w-11 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all", isFlashOn ? "bg-primary text-white border-primary shadow-lg" : "bg-black/30 text-white border-white/10")}><Zap className={cn("h-5 w-5", isFlashOn && "fill-current")} /></div>
              <span className="text-[8px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">Flash</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 group" onClick={() => setShowFilters(!showFilters)}>
              <div className={cn("h-11 w-11 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all", showFilters ? "bg-accent text-white border-accent" : "bg-black/30 text-white border-white/10")}><Filter className="h-5 w-5" /></div>
              <span className="text-[8px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">Filters</span>
            </button>

            {isZoomSupported && !isRecording && (
              <div className="flex flex-col items-center gap-4 py-4 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
                <ZoomIn className="h-4 w-4 text-white/60" />
                <div className="h-32 flex flex-col items-center">
                  <Slider orientation="vertical" min={minZoom} max={maxZoom} step={0.1} value={[zoom]} onValueChange={(val) => handleZoomChange(val[0])} className="h-full" />
                </div>
                <ZoomOut className="h-4 w-4 text-white/60" />
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-10 left-0 right-0 z-50 px-8 flex items-center justify-between">
          {!recordedUrl ? (
            <>
              <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-transform group-hover:scale-110 active:scale-90"><ImageIcon className="h-6 w-6 text-white/60" /></div>
                <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Upload</span>
                <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleUpload} />
              </div>
              <div className="relative">
                <div className={cn("absolute inset-0 rounded-full blur-xl transition-all duration-500", isRecording ? "bg-destructive/40 scale-150" : "bg-primary/20 scale-110")} />
                <button className="relative h-20 w-20 rounded-full border-4 border-white flex items-center justify-center transition-all duration-300 active:scale-90 shadow-2xl" onClick={isRecording ? stopRecording : startRecording}>
                  <div className={cn("rounded-full transition-all duration-300", isRecording ? "h-10 w-10 bg-destructive rounded-lg" : "h-16 w-16 bg-white")} />
                </button>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center"><span className="text-[8px] font-black text-primary leading-none">PRO</span><span className="text-[10px] font-black text-white">HD</span></div>
                <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Cinematic</span>
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-4">
              <Button variant="ghost" className="flex-1 bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-2xl h-14 font-black uppercase text-xs" onClick={resetStudio}><Trash2 className="mr-2 h-4 w-4" /> Discard</Button>
              <Button className="flex-1 bg-primary text-white border border-primary/20 rounded-2xl h-14 font-black uppercase text-xs shadow-xl" onClick={handlePublish}>Launch Vibe <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </div>
          )}
        </div>

        {showFilters && !recordedUrl && (
          <div className="absolute bottom-36 left-0 right-0 z-[60] px-6">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {FILTERS.map((f) => (
                <button key={f.id} onClick={() => { triggerHaptic(5); setActiveFilter(f); }} className={cn("flex flex-col items-center gap-2 shrink-0 group", activeFilter.id === f.id ? "scale-110" : "opacity-60")}>
                  <div className={cn("h-16 w-16 rounded-2xl border-2 overflow-hidden transition-all", activeFilter.id === f.id ? "border-primary shadow-lg" : "border-white/20")}><div className={cn("w-full h-full bg-zinc-800", f.class)} /></div>
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">{f.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" /><p className="text-sm font-black uppercase italic text-white">Finalizing Vibe...</p>
          </div>
        )}

        {isSearchingSound && (
          <div className="absolute inset-0 z-[200] bg-black/80 backdrop-blur-2xl flex flex-col animate-in slide-in-from-bottom-full duration-500">
            <header className="px-6 py-8 flex items-center justify-between shrink-0">
              <Button variant="ghost" size="icon" className="text-white rounded-full bg-white/5" onClick={() => { triggerHaptic(5); setIsSearchingSound(false); stopPreview(); }}><ArrowLeft className="h-6 w-6" /></Button>
              <div className="flex flex-col items-center"><h2 className="text-sm font-black italic uppercase tracking-[0.2em] text-white">Sonic Picker</h2><span className="text-[10px] font-bold text-primary uppercase">Synchronize Vibe</span></div>
              <div className="w-10" />
            </header>
            <div className="px-6 pb-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary" />
                <Input placeholder="Search vibes..." className="pl-11 h-12 bg-white/5 border-white/10 rounded-2xl text-white" value={soundSearchQuery} onChange={(e) => setSoundSearchQuery(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-32">
              <div className="space-y-6">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{soundSearchQuery ? "Results" : "Trending"}</p>
                <div className="grid grid-cols-1 gap-3">
                  {filteredSongs.map((track) => (
                    <div key={track.id} className={cn("flex items-center justify-between p-3 rounded-[1.5rem] transition-all group border", captureTrack?.id === track.id ? "bg-primary/10 border-primary/20" : "bg-white/5 border-transparent hover:border-white/10")}>
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 shadow-lg">
                          <Image src={track.cover} alt={track.title} fill className="object-cover" />
                          <button onClick={() => toggleSoundPreview(track)} className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">{previewTrackId === track.id ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}</button>
                        </div>
                        <div className="flex flex-col min-w-0"><span className="font-bold text-sm text-white truncate">{track.title}</span><span className="text-[10px] text-muted-foreground font-medium truncate">{track.artist}</span></div>
                      </div>
                      <Button size="sm" className={cn("rounded-xl h-9 px-5 font-black uppercase italic text-[9px]", captureTrack?.id === track.id ? "bg-primary text-white" : "bg-white/10 text-white hover:bg-primary")} onClick={() => { triggerHaptic(25); setCaptureTrack(track); setIsSearchingSound(false); stopPreview(); }}>{captureTrack?.id === track.id ? "SYNCED" : "USE"}</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}