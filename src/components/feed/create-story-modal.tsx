"use client";

import { useState, useRef, useCallback } from "react";
import {
  Image as ImageIcon,
  Clapperboard,
  ArrowLeft,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import { BUCKET_STORIES, storage, ID, getFileUrl } from "@/lib/appwrite";

const FILTERS = [
  { id: "none",       label: "None",  class: "" },
  { id: "grayscale",  label: "Mono",  class: "grayscale" },
  { id: "sepia",      label: "Sepia", class: "sepia" },
  { id: "brightness", label: "Lume",  class: "brightness-125 contrast-110" },
  { id: "vivid",      label: "Vivid", class: "saturate-150" },
  { id: "noir",       label: "Noir",  class: "invert brightness-75 grayscale" },
];

const GRADIENTS = [
  { id: "vimore",   label: "ViMore",   class: "bg-gradient-to-br from-primary to-accent" },
  { id: "sunset",   label: "Sunset",   class: "bg-gradient-to-br from-orange-500 to-rose-500" },
  { id: "ocean",    label: "Ocean",    class: "bg-gradient-to-br from-blue-400 to-emerald-400" },
  { id: "midnight", label: "Midnight", class: "bg-gradient-to-br from-indigo-900 to-slate-900" },
  { id: "carbon",   label: "Carbon",   class: "bg-zinc-900" },
];

const CSS_TO_CANVAS_FILTER: Record<string, string> = {
  "":                              "none",
  "grayscale":                     "grayscale(100%)",
  "sepia":                         "sepia(100%)",
  "brightness-125 contrast-110":   "brightness(1.25) contrast(1.1)",
  "saturate-150":                  "saturate(1.5)",
  "invert brightness-75 grayscale":"invert(1) brightness(0.75) grayscale(100%)",
};

export function CreateStoryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addStory, triggerHaptic } = usePosts();
  const { toast } = useToast();

  const [step, setStep] = useState<"choice" | "edit" | "text">("choice");
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);
  const [storyText, setStoryText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // ── Interactive editor state ──────────────────────────────────────────────
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [naturalSize, setNaturalSize] = useState({ w: 1, h: 1 });

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const lastPinchDistRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  const getContainerSize = () => {
    const el = containerRef.current;
    if (!el) return { cw: 1, ch: 1 };
    return { cw: el.clientWidth, ch: el.clientHeight };
  };

  const calcFitZoom = useCallback(() => {
    const { cw, ch } = getContainerSize();
    if (!naturalSize.w || !naturalSize.h) return 1;
    return Math.min(cw / naturalSize.w, ch / naturalSize.h);
  }, [naturalSize]);

  const calcFillZoom = useCallback(() => {
    const { cw, ch } = getContainerSize();
    if (!naturalSize.w || !naturalSize.h) return 1;
    return Math.max(cw / naturalSize.w, ch / naturalSize.h);
  }, [naturalSize]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    setNaturalSize({ w: nw, h: nh });
    const { cw, ch } = getContainerSize();
    setZoom(Math.max(cw / nw, ch / nh));
    setOffset({ x: 0, y: 0 });
  };

  const handleFit = () => { setZoom(calcFitZoom()); setOffset({ x: 0, y: 0 }); };
  const handleFill = () => { setZoom(calcFillZoom()); setOffset({ x: 0, y: 0 }); };

  // ── Pointer events (covers both mouse and touch) ──────────────────────────
  const handlePointerDown = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 1) {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
    }
    lastPinchDistRef.current = null;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (lastPinchDistRef.current !== null) {
        const ratio = dist / lastPinchDistRef.current;
        setZoom(z => Math.min(5, Math.max(0.15, z * ratio)));
      }
      lastPinchDistRef.current = dist;
      isDraggingRef.current = false;
    } else if (isDraggingRef.current && pointersRef.current.size === 1) {
      setOffset({
        x: dragStartRef.current.ox + (e.clientX - dragStartRef.current.x),
        y: dragStartRef.current.oy + (e.clientY - dragStartRef.current.y),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) lastPinchDistRef.current = null;
    if (pointersRef.current.size === 0) isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.93;
    setZoom(z => Math.min(5, Math.max(0.15, z * factor)));
  };

  // ── Canvas export (bakes transform + filter into a 1080×1920 JPEG) ────────
  const exportCanvas = (): Promise<Blob> =>
    new Promise((resolve, reject) => {
      if (!containerRef.current || !previewUrl) return reject(new Error("No source"));
      const el = containerRef.current;
      const { cw, ch } = { cw: el.clientWidth, ch: el.clientHeight };
      const W = 1080, H = 1920;
      const canvas = document.createElement("canvas");
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No 2d context"));
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      const img = new window.Image();
      img.onload = () => {
        try {
          ctx.filter = CSS_TO_CANVAS_FILTER[selectedFilter.class] ?? "none";
          ctx.save();
          ctx.translate(W / 2 + offset.x * (W / cw), H / 2 + offset.y * (H / ch));
          ctx.scale(zoom, zoom);
          ctx.drawImage(img, -naturalSize.w / 2, -naturalSize.h / 2);
          ctx.restore();
          canvas.toBlob(b => b ? resolve(b) : reject(new Error("Blob null")), "image/jpeg", 0.92);
        } catch (err) { reject(err); }
      };
      img.onerror = () => reject(new Error("Image load failed for export"));
      img.src = previewUrl;
    });

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;
    triggerHaptic(10);
    if (type === "video") {
      const objUrl = URL.createObjectURL(file);
      const tempVid = document.createElement("video");
      tempVid.src = objUrl;
      await new Promise<void>(r => { tempVid.onloadedmetadata = () => r(); tempVid.load(); });
      URL.revokeObjectURL(objUrl);
      if (tempVid.duration > 80) {
        toast({ title: "Video Too Long", description: "Story videos must be 1 minute 20 seconds or shorter." });
        e.target.value = "";
        return;
      }
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMediaType(type);
    setStep("edit");
    setZoom(1); setOffset({ x: 0, y: 0 }); setNaturalSize({ w: 1, h: 1 });
  };

  const handleShare = async () => {
    if (step === "text" && !storyText.trim()) return;
    if (step === "edit" && !selectedFile) return;
    setIsProcessing(true);
    triggerHaptic(30);
    try {
      let finalFileId = "";
      let finalImageUrl = "";

      if (selectedFile) {
        let toUpload: File = selectedFile;
        if (mediaType === "image") {
          try {
            const blob = await exportCanvas();
            toUpload = new File([blob], "story.jpg", { type: "image/jpeg" });
          } catch { /* fallback to original */ }
        }
        const fileId = ID.unique();
        const res = await storage.createFile(BUCKET_STORIES, fileId, toUpload);
        finalFileId = res.$id;
        finalImageUrl = getFileUrl(BUCKET_STORIES, finalFileId);
      }

      await addStory({
        image: finalImageUrl,
        fileId: finalFileId || undefined,
        type: mediaType || "image",
        filter: "",
        textOverlays: step === "text" ? [{ text: storyText, x: 50, y: 50, color: "#FFFFFF" }] : [],
        background: step === "text" ? selectedGradient.class : undefined,
      });

      toast({ title: "Story Synchronized", description: "Node materialized in the cluster rail." });
      onClose();
      resetState();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Vault Sync Error", description: e.message || "Upload failed." });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setStep("choice"); setSelectedFile(null); setPreviewUrl(null);
    setMediaType(null); setStoryText(""); setIsProcessing(false);
    setZoom(1); setOffset({ x: 0, y: 0 }); setNaturalSize({ w: 1, h: 1 });
    pointersRef.current.clear(); lastPinchDistRef.current = null; isDraggingRef.current = false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black flex items-center justify-center">
      <div className="relative w-full max-w-[500px] h-full sm:h-[90vh] bg-zinc-950 sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="absolute top-6 left-0 right-0 z-50 px-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="text-white bg-black/30 backdrop-blur-md rounded-full" onClick={step === "choice" ? onClose : resetState}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          {step !== "choice" && (
            <Button className="bg-primary text-white font-bold rounded-full px-6 h-9 gap-2" onClick={handleShare} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Sync"}
            </Button>
          )}
        </div>

        <div className="flex-1 flex flex-col min-h-0">

          {/* ── Choice step ── */}
          {step === "choice" && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in duration-500">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Share a Vibe</h2>
              <div className="grid grid-cols-1 w-full gap-4">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-6 p-6 bg-zinc-900 border border-white/5 rounded-[2rem] hover:bg-zinc-800 transition-all group">
                  <div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform"><ImageIcon className="h-7 w-7" /></div>
                  <div className="text-left"><p className="text-lg font-bold text-white">Photo</p><p className="text-xs text-zinc-500">Pinch to zoom · drag to reframe</p></div>
                </button>
                <button onClick={() => videoInputRef.current?.click()} className="flex items-center gap-6 p-6 bg-zinc-900 border border-white/5 rounded-[2rem] hover:bg-zinc-800 transition-all group">
                  <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform"><Clapperboard className="h-7 w-7" /></div>
                  <div className="text-left"><p className="text-lg font-bold text-white">Video</p><p className="text-xs text-zinc-500">Max 1 min 20 sec clip</p></div>
                </button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => handleMediaUpload(e, "image")} />
              <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={e => handleMediaUpload(e, "video")} />
            </div>
          )}

          {/* ── Text story step ── */}
          {step === "text" && (
            <div className={cn("flex-1 flex flex-col items-center justify-center relative p-8 transition-all duration-500", selectedGradient.class)}>
              <textarea autoFocus placeholder="Start typing..." className="w-full bg-transparent border-none focus:ring-0 text-4xl text-center font-black italic uppercase text-white placeholder:text-white/30 resize-none" value={storyText} onChange={e => setStoryText(e.target.value)} />
            </div>
          )}

          {/* ── Image / Video edit step ── */}
          {step === "edit" && (
            <div className="flex-1 flex flex-col min-h-0">

              {/* Interactive canvas area */}
              <div
                ref={containerRef}
                className="flex-1 relative bg-black overflow-hidden select-none"
                style={{ touchAction: "none", cursor: "grab" }}
                onPointerDown={mediaType === "image" ? handlePointerDown : undefined}
                onPointerMove={mediaType === "image" ? handlePointerMove : undefined}
                onPointerUp={mediaType === "image" ? handlePointerUp : undefined}
                onPointerCancel={mediaType === "image" ? handlePointerUp : undefined}
                onWheel={mediaType === "image" ? handleWheel : undefined}
              >
                {isProcessing ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                ) : mediaType === "video" ? (
                  <video src={previewUrl!} className="w-full h-full object-cover" autoPlay loop playsInline muted />
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl!}
                      alt="Story preview"
                      onLoad={handleImageLoad}
                      draggable={false}
                      className={cn("absolute pointer-events-none max-w-none", selectedFilter.class)}
                      style={{
                        top: "50%", left: "50%",
                        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                        transformOrigin: "center center",
                        willChange: "transform",
                        userSelect: "none",
                      }}
                    />
                    {/* Frame guide */}
                    <div className="absolute inset-0 pointer-events-none border border-white/10" />
                    {/* Hint */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
                      <span className="bg-black/50 text-white/50 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm">
                        Drag to reframe · Pinch to zoom
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Controls — only for images */}
              {mediaType === "image" && (
                <div className="bg-zinc-900 border-t border-white/5 px-4 py-3 space-y-3 shrink-0">

                  {/* Zoom row */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleFit}
                      className="shrink-0 flex items-center gap-1 text-white/60 hover:text-white text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 rounded-lg px-3 py-1.5 transition-all"
                    >
                      <Maximize2 className="h-3 w-3" /> Fit
                    </button>

                    <div className="flex-1 flex items-center gap-2">
                      <ZoomOut className="h-3.5 w-3.5 text-white/30 shrink-0" />
                      <input
                        type="range" min="0.15" max="5" step="0.01" value={zoom}
                        onChange={e => setZoom(parseFloat(e.target.value))}
                        className="flex-1 accent-primary h-1"
                      />
                      <ZoomIn className="h-3.5 w-3.5 text-white/30 shrink-0" />
                    </div>

                    <button
                      onClick={handleFill}
                      className="shrink-0 flex items-center gap-1 text-white/60 hover:text-white text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 rounded-lg px-3 py-1.5 transition-all"
                    >
                      <Minimize2 className="h-3 w-3" /> Fill
                    </button>
                  </div>

                  {/* Filter strip */}
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {FILTERS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFilter(f)}
                        className={cn(
                          "shrink-0 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all",
                          selectedFilter.id === f.id ? "bg-primary text-white" : "bg-white/5 text-white/50 hover:text-white"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Gradient picker — text stories only */}
        {step === "text" && (
          <div className="bg-zinc-900/80 backdrop-blur-md border-t border-white/5 px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide shrink-0">
            {GRADIENTS.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGradient(g)}
                className={cn("h-8 w-8 rounded-xl shrink-0 transition-all", g.class, selectedGradient.id === g.id ? "ring-2 ring-white scale-110" : "opacity-60 hover:opacity-90")}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
