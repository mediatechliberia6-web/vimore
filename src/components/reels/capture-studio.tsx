"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
  ZoomOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useMusic } from "@/context/MusicContext";
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

const RECORDING_LIMIT = 300; // 5 minutes in seconds

export function CaptureStudio() {
  const { isCaptureStudioOpen, closeCaptureStudio, captureTrack, triggerHaptic } = useMusic();
  const { addPost, currentUser } = usePosts();
  const { toast } = useToast();

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<"user" | "environment">("user");
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [timeLeft, setTimeLeft] = useState(RECORDING_LIMIT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: { 
          facingMode: cameraMode,
          width: { ideal: 1080, min: 720 },
          height: { ideal: 1920, min: 1280 },
          frameRate: { ideal: 60, min: 30 },
          aspectRatio: { ideal: 0.5625 }, 
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000, 
        }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      const track = newStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities() as any;
      
      // Hardware Optimization
      const advanced: any[] = [];
      if (capabilities.focusMode?.includes('continuous')) {
        advanced.push({ focusMode: 'continuous' });
      }
      if (capabilities.exposureMode?.includes('continuous')) {
        advanced.push({ exposureMode: 'continuous' });
      }
      
      // Detect Zoom Support
      if (capabilities.zoom) {
        setIsZoomSupported(true);
        setMinZoom(capabilities.zoom.min || 1);
        setMaxZoom(capabilities.zoom.max || 1);
        setZoom(track.getSettings().zoom || 1);
      } else {
        setIsZoomSupported(false);
      }

      if (advanced.length > 0) {
        try {
          await track.applyConstraints({ advanced } as any);
        } catch (e) {
          console.warn("Advanced hardware handshake bypassed", e);
        }
      }

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error("Studio entrance blocked", error);
      toast({ 
        variant: "destructive", 
        title: "Lens Access Error", 
        description: "Please check your browser permissions to enter the creation studio." 
      });
      closeCaptureStudio();
    }
  }, [cameraMode, closeCaptureStudio, stream, toast]);

  useEffect(() => {
    if (isCaptureStudioOpen) {
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      resetStudio();
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isCaptureStudioOpen, cameraMode]);

  const resetStudio = () => {
    setIsRecording(false);
    setRecordedBlob(null);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setTimeLeft(RECORDING_LIMIT);
    setIsProcessing(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setZoom(1);
  };

  const handleZoomChange = async (value: number) => {
    if (!stream || !isZoomSupported) return;
    const track = stream.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ zoom: value }]
      } as any);
      setZoom(value);
      if (value === minZoom || value === maxZoom) {
        triggerHaptic(10);
      }
    } catch (e) {
      console.error("Zoom constraint failed", e);
    }
  };

  const handleToggleFlash = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities() as any;
    
    if (capabilities.torch) {
      triggerHaptic(5);
      try {
        await track.applyConstraints({
          advanced: [{ torch: !isFlashOn }]
        } as any);
        setIsFlashOn(!isFlashOn);
      } catch (e) {
        console.error("Flash relay failure", e);
      }
    } else {
      toast({ description: "Flash not supported on this sensor." });
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

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/mp4' });
      setRecordedBlob(blob);
      setRecordedUrl(URL.createObjectURL(blob));
      setIsProcessing(false);
    };

    recorder.start();
    setIsRecording(true);
    setIsProcessing(false);

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
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      if (timerRef.current) clearInterval(timerRef.current);
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
        toast({ 
          variant: "destructive", 
          title: "Clip Too Long", 
          description: "Reels are capped at 5 minutes for high-velocity streaming." 
        });
        return;
      }
      
      triggerHaptic(10);
      setRecordedBlob(file);
      setRecordedUrl(URL.createObjectURL(file));
    };
    video.src = tempUrl;
  };

  const handlePublish = () => {
    if (!recordedUrl) return;
    triggerHaptic(100);
    
    addPost({
      user: currentUser,
      content: `Captured a vibe with **${captureTrack?.title || 'Original Audio'}** ⚡️ #CaptureStudio #HighFidelity`,
      videoUrl: recordedUrl,
      language: 'en'
    });

    toast({ title: "Launch Successful", description: "Your high-fidelity vibe is now live." });
    closeCaptureStudio();
  };

  if (!isCaptureStudioOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-black flex flex-col animate-in fade-in duration-500 overflow-hidden">
      
      <div className="relative flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden">
        {recordedUrl ? (
          <video 
            src={recordedUrl} 
            className={cn("w-full h-full object-cover", activeFilter.class)} 
            autoPlay 
            loop 
            playsInline 
          />
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
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 max-w-[200px] group cursor-pointer hover:bg-black/60 transition-all">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center animate-pulse">
                  <Music2 className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap animate-marquee">
                    {captureTrack ? `${captureTrack.title} — ${captureTrack.artist}` : "Add Sounds"}
                  </p>
                </div>
              </div>
            </div>

            {recordedUrl ? (
              <Button 
                className="bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest text-[10px] rounded-full px-6 h-9 shadow-lg shadow-primary/20"
                onClick={handlePublish}
              >
                Launch
              </Button>
            ) : (
              <div className="w-10" /> 
            )}
          </div>

          {isRecording && (
            <div className="bg-destructive/80 backdrop-blur-md px-4 py-1.5 rounded-full text-white flex items-center gap-2 animate-pulse shadow-2xl">
              <div className="h-2 w-2 bg-white rounded-full animate-ping" />
              <span className="text-xs font-black tracking-widest">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {!recordedUrl && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-6">
            <button 
              className="flex flex-col items-center gap-1.5 group"
              onClick={handleFlipCamera}
            >
              <div className="h-11 w-11 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white group-active:scale-90 transition-all">
                <RefreshCw className="h-5 w-5" />
              </div>
              <span className="text-[8px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">Flip</span>
            </button>

            <button 
              className="flex flex-col items-center gap-1.5 group"
              onClick={handleToggleFlash}
            >
              <div className={cn(
                "h-11 w-11 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all",
                isFlashOn ? "bg-primary text-white border-primary shadow-[0_0_15px_rgba(153,64,229,0.5)]" : "bg-black/30 text-white border-white/10"
              )}>
                <Zap className={cn("h-5 w-5", isFlashOn && "fill-current")} />
              </div>
              <span className="text-[8px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">Flash</span>
            </button>

            <button 
              className="flex flex-col items-center gap-1.5 group"
              onClick={() => { triggerHaptic(5); setShowFilters(!showFilters); }}
            >
              <div className={cn(
                "h-11 w-11 rounded-full backdrop-blur-xl border flex items-center justify-center transition-all",
                showFilters ? "bg-accent text-white border-accent shadow-[0_0_15px_rgba(110,150,255,0.5)]" : "bg-black/30 text-white border-white/10"
              )}>
                <Filter className="h-5 w-5" />
              </div>
              <span className="text-[8px] font-black text-white uppercase tracking-[0.2em] drop-shadow-md">Filters</span>
            </button>

            {/* Manual Zoom Control */}
            {isZoomSupported && !isRecording && (
              <div className="flex flex-col items-center gap-4 py-4 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
                <ZoomIn className="h-4 w-4 text-white/60" />
                <div className="h-32 flex flex-col items-center">
                  <Slider
                    orientation="vertical"
                    min={minZoom}
                    max={maxZoom}
                    step={0.1}
                    value={[zoom]}
                    onValueChange={(val) => handleZoomChange(val[0])}
                    className="h-full"
                  />
                </div>
                <ZoomOut className="h-4 w-4 text-white/60" />
              </div>
            )}
          </div>
        )}

        <div className="absolute bottom-10 left-0 right-0 z-50 px-8 flex items-center justify-between">
          {!recordedUrl ? (
            <>
              <div 
                className="flex flex-col items-center gap-2 cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110 active:scale-90">
                  <ImageIcon className="h-6 w-6 text-white/60" />
                </div>
                <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Upload</span>
                <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleUpload} />
              </div>

              <div className="relative">
                <div className={cn(
                  "absolute inset-0 rounded-full blur-xl transition-all duration-500",
                  isRecording ? "bg-destructive/40 scale-150" : "bg-primary/20 scale-110"
                )} />
                <button 
                  className={cn(
                    "relative h-20 w-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 active:scale-90 shadow-2xl",
                    isRecording ? "border-white p-1" : "border-white"
                  )}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  <div className={cn(
                    "rounded-full transition-all duration-300",
                    isRecording ? "h-10 w-10 bg-destructive rounded-lg" : "h-16 w-16 bg-white"
                  )} />
                </button>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-xl border border-primary/20 bg-primary/5 flex flex-col items-center justify-center">
                  <span className="text-[8px] font-black text-primary leading-none">PRO</span>
                  <span className="text-[10px] font-black text-white">HD</span>
                </div>
                <span className="text-[8px] font-black text-white uppercase tracking-[0.2em]">Cinematic</span>
              </div>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-4">
              <Button 
                variant="ghost" 
                className="flex-1 bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-2xl h-14 font-black uppercase italic tracking-widest text-xs"
                onClick={resetStudio}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Discard
              </Button>
              <Button 
                className="flex-1 bg-primary text-white border border-primary/20 rounded-2xl h-14 font-black uppercase italic tracking-widest text-xs shadow-xl shadow-primary/20"
                onClick={handlePublish}
              >
                Launch Vibe <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {showFilters && !recordedUrl && (
          <div className="absolute bottom-36 left-0 right-0 z-[60] animate-in slide-in-from-bottom-4 duration-300 px-6">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => { triggerHaptic(5); setActiveFilter(f); }}
                  className={cn(
                    "flex flex-col items-center gap-2 shrink-0 group",
                    activeFilter.id === f.id ? "scale-110" : "opacity-60"
                  )}
                >
                  <div className={cn(
                    "h-16 w-16 rounded-2xl border-2 overflow-hidden transition-all",
                    activeFilter.id === f.id ? "border-primary shadow-[0_0_15px_rgba(153,64,229,0.5)]" : "border-white/20"
                  )}>
                    <div className={cn("w-full h-full bg-zinc-800", f.class)} />
                  </div>
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">{f.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-sm font-black uppercase italic tracking-widest text-white">Processing Cinematic Vibe...</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 10s linear infinite;
        }
      `}</style>
    </div>
  );
}