
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
import { Progress } from "@/components/ui/progress";
import { useMusic, ALL_SONGS, Track } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { useToast } from "@/hooks/use-toast";
import { cn, formatBytes } from "@/lib/utils";
import Image from "next/image";

const FILTERS = [
  { id: "none", label: "Pure", class: "" },
  { id: "cyberpunk", label: "Cyber", class: "hue-rotate-90 saturate-200 contrast-125" },
  { id: "golden", label: "Golden", class: "sepia-[0.4] brightness-110 saturate-150" },
  { id: "noir", label: "Noir", class: "grayscale brightness-75 contrast-125" },
  { id: "vivid", label: "Vivid", class: "saturate-200 contrast-110" },
  { id: "arctic", label: "Arctic", class: "hue-rotate-[180deg] saturate-125 brightness-110" },
];

const RECORDING_LIMIT = 300; 
const FILE_SIZE_LIMIT = 50 * 1024 * 1024; 

export function CaptureStudio() {
  const { isCaptureStudioOpen, closeCaptureStudio, captureTrack, setCaptureTrack, triggerHaptic } = useMusic();
  const { addPost, currentUser, uploadMedia } = usePosts();
  const { toast } = useToast();

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [caption, setCaption] = useState("");
  const [cameraMode, setCameraMode] = useState<"user" | "environment">("user");
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [timeLeft, setTimeLeft] = useState(RECORDING_LIMIT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Compression State
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);

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
        audio: { echoCancellation: true, noiseSuppression: true }
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error("Studio source error:", error);
      closeCaptureStudio();
    }
  }, [cameraMode, closeCaptureStudio]);

  useEffect(() => {
    if (isCaptureStudioOpen && !recordedUrl) {
      startCamera();
    }
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [isCaptureStudioOpen, cameraMode, recordedUrl]);

  const resetStudio = () => {
    setIsRecording(false);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl(null);
    setRecordedBlob(null);
    setCaption("");
    setTimeLeft(RECORDING_LIMIT);
    setIsProcessing(false);
    setIsCompressing(false);
    setCompressionProgress(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startRecording = () => {
    if (!stream) return;
    triggerHaptic(30);
    chunksRef.current = [];
    
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/mp4';
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setRecordedBlob(blob);
      setRecordedUrl(url);
      setIsProcessing(false);
      stopStream();
    };

    recorder.start();
    setIsRecording(true);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { stopRecording(); return 0; }
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
    }
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRecordedBlob(file);
    setRecordedUrl(URL.createObjectURL(file));
    stopStream();
  };

  const handlePublish = async () => {
    if (!recordedBlob) return;
    setIsProcessing(true);
    triggerHaptic(100);
    
    try {
      // Identity Node Fetch: Materialize the blob as a file signature
      const file = new File([recordedBlob], `reel_${Date.now()}.mp4`, { type: recordedBlob.type });
      const vaultUrl = await uploadMedia(file);

      addPost({
        user: currentUser,
        content: caption || "New high-fidelity reel node synchronized. #ViMore",
        videoUrl: vaultUrl,
        language: 'en'
      });
      toast({ title: "Vibe Launched", description: "Node permanently synced to the spatial vault." });
      closeCaptureStudio();
      resetStudio();
    } catch (e) {
      toast({ variant: "destructive", title: "Vault Handshake Failed" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isCaptureStudioOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] bg-black flex flex-col animate-in fade-in duration-500 overflow-hidden">
      <div className="relative flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden">
        {recordedUrl ? (
          <video src={recordedUrl} className={cn("w-full h-full object-cover", activeFilter.class)} autoPlay loop playsInline />
        ) : (
          <video ref={videoRef} autoPlay muted playsInline className={cn("w-full h-full object-cover transition-transform duration-500", cameraMode === "user" && "scale-x-[-1]", activeFilter.class)} />
        )}

        <div className="absolute top-6 left-0 right-0 z-50 flex items-center justify-between px-6">
          <Button variant="ghost" size="icon" className="text-white bg-black/20 backdrop-blur-md rounded-full" onClick={closeCaptureStudio}><X className="h-6 w-6" /></Button>
          <div className="flex items-center gap-2 bg-black/40 px-4 py-1.5 rounded-full text-white">
            <span className="text-xs font-black tracking-widest">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
          {recordedUrl ? <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] rounded-full px-6" onClick={handlePublish} disabled={isProcessing}>{isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Launch"}</Button> : <div className="w-10" />}
        </div>

        <div className="absolute bottom-10 left-0 right-0 z-50 px-8 flex items-center justify-between">
          {!recordedUrl ? (
            <>
              <button className="flex flex-col items-center gap-2" onClick={() => fileInputRef.current?.click()}><ImageIcon className="h-6 w-6 text-white/60" /><span className="text-[8px] font-black text-white uppercase">Upload</span></button>
              <button className="h-20 w-20 rounded-full border-4 border-white flex items-center justify-center" onClick={isRecording ? stopRecording : startRecording}><div className={cn("rounded-full transition-all", isRecording ? "h-10 w-10 bg-destructive rounded-lg" : "h-16 w-16 bg-white")} /></button>
              <button className="flex flex-col items-center gap-2" onClick={handleFlipCamera}><RefreshCw className="h-6 w-6 text-white/60" /><span className="text-[8px] font-black text-white uppercase">Flip</span></button>
            </>
          ) : (
            <div className="w-full flex gap-4"><Button variant="ghost" className="flex-1 bg-white/10 text-white rounded-2xl h-14 font-black uppercase text-xs" onClick={resetStudio}><Trash2 className="mr-2 h-4 w-4" /> Discard</Button><Button className="flex-1 bg-primary text-white rounded-2xl h-14 font-black uppercase text-xs shadow-xl" onClick={handlePublish} disabled={isProcessing}>{isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sync Vault"}</Button></div>
          )}
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleUpload} />
      </div>
    </div>
  );
}
