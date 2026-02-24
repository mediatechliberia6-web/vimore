
"use client";

import { useState, useRef, useEffect } from "react";
import { X, Camera, Check, Palette, Type, Filter, Send, RotateCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const FILTERS = [
  { id: "none", label: "None", class: "" },
  { id: "grayscale", label: "Mono", class: "grayscale" },
  { id: "sepia", label: "Sepia", class: "sepia" },
  { id: "brightness", label: "Lume", class: "brightness-125 contrast-110" },
  { id: "vivid", label: "Vivid", class: "saturate-150" },
  { id: "noir", label: "Noir", class: "invert brightness-75 grayscale" },
];

const COLORS = ["#FFFFFF", "#000000", "#9940E5", "#6E96FF", "#FF4B4B", "#FACC15", "#4ADE80"];

export function CreateStoryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addStory } = usePosts();
  const { toast } = useToast();
  const [step, setStep] = useState<'capture' | 'edit'>('capture');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Text Overlay State
  const [textOverlays, setTextOverlays] = useState<Array<{ text: string, x: number, y: number, color: string }>>([]);
  const [activeTextIndex, setActiveTextIndex] = useState<number | null>(null);
  const [inputText, setInputText] = useState("");
  const [selectedColor, setSelectedColor] = useState("#FFFFFF");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && step === 'capture') {
      const getCameraPermission = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user", aspectRatio: 9/16 } 
          });
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions to use stories.',
          });
        }
      };
      getCameraPermission();
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, step, toast]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setStep('edit');
      }
    }
  };

  const handleAddText = () => {
    if (!inputText.trim()) return;
    setTextOverlays([...textOverlays, { 
      text: inputText, 
      x: 50, 
      y: 50, 
      color: selectedColor 
    }]);
    setInputText("");
    setActiveTextIndex(null);
  };

  const handleDrag = (e: React.MouseEvent | React.TouchEvent, index: number) => {
    if (!editContainerRef.current) return;
    
    const rect = editContainerRef.current.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const relX = ((x - rect.left) / rect.width) * 100;
    const relY = ((y - rect.top) / rect.height) * 100;

    const newOverlays = [...textOverlays];
    newOverlays[index] = { ...newOverlays[index], x: relX, y: relY };
    setTextOverlays(newOverlays);
  };

  const handleShare = () => {
    if (!capturedImage) return;
    
    addStory({
      image: capturedImage,
      type: 'image',
      filter: selectedFilter.class,
      textOverlays: textOverlays
    });

    toast({ title: "Story Shared!", description: "Your story is now live." });
    onClose();
    resetState();
  };

  const resetState = () => {
    setStep('capture');
    setCapturedImage(null);
    setTextOverlays([]);
    setSelectedFilter(FILTERS[0]);
    setShowFilters(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black flex items-center justify-center">
      <div className="relative w-full max-w-[500px] h-full sm:h-[90vh] bg-zinc-900 sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header Actions */}
        <div className="absolute top-6 left-0 right-0 z-50 px-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="text-white bg-black/20 backdrop-blur-md rounded-full" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>

          {step === 'edit' && (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("text-white bg-black/20 backdrop-blur-md rounded-full", activeTextIndex !== null && "bg-primary")}
                onClick={() => setActiveTextIndex(activeTextIndex === null ? 999 : null)}
              >
                <Type className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("text-white bg-black/20 backdrop-blur-md rounded-full", showFilters && "bg-primary")}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Media Content */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden" ref={editContainerRef}>
          {step === 'capture' ? (
            <>
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover" 
                autoPlay 
                muted 
                playsInline 
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {hasCameraPermission === false && (
                <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                  <Alert variant="destructive" className="bg-black/60 backdrop-blur-md border-destructive/50">
                    <Camera className="h-4 w-4" />
                    <AlertTitle>Camera Required</AlertTitle>
                    <AlertDescription>
                      Please allow camera access in your browser settings to create stories.
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </>
          ) : (
            <div className="relative w-full h-full">
              <Image 
                src={capturedImage!} 
                alt="Captured" 
                fill 
                className={cn("object-cover", selectedFilter.class)} 
              />
              
              {/* Render Draggable Text Overlays */}
              {textOverlays.map((overlay, i) => (
                <div 
                  key={i}
                  className="absolute cursor-move select-none p-2 animate-in zoom-in-50"
                  style={{ 
                    top: `${overlay.y}%`, 
                    left: `${overlay.x}%`, 
                    transform: 'translate(-50%, -50%)',
                    color: overlay.color,
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                  }}
                  onMouseDown={() => {}} // Simple visual drag
                  onTouchMove={(e) => handleDrag(e, i)}
                  onMouseMove={(e) => { if(e.buttons === 1) handleDrag(e, i); }}
                >
                  <span className="text-2xl font-black italic uppercase tracking-tighter bg-black/20 px-3 py-1 rounded-lg backdrop-blur-sm">
                    {overlay.text}
                  </span>
                  <button 
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-lg"
                    onClick={() => setTextOverlays(textOverlays.filter((_, idx) => idx !== i))}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Text Input Overlay */}
          {activeTextIndex !== null && (
            <div className="absolute inset-0 bg-black/60 z-[60] flex flex-col items-center justify-center p-6 gap-6">
              <input 
                autoFocus
                type="text"
                placeholder="Type something..."
                className="bg-transparent border-none text-4xl text-center font-black italic uppercase text-white focus:ring-0 w-full"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{ color: selectedColor }}
              />
              <div className="flex flex-wrap justify-center gap-3">
                {COLORS.map(c => (
                  <button 
                    key={c} 
                    className={cn("h-8 w-8 rounded-full border-2", selectedColor === c ? "border-white scale-125" : "border-transparent")}
                    style={{ backgroundColor: c }}
                    onClick={() => setSelectedColor(c)}
                  />
                ))}
              </div>
              <div className="flex gap-4">
                <Button variant="ghost" className="text-white" onClick={() => setActiveTextIndex(null)}>Cancel</Button>
                <Button className="bg-white text-black font-bold px-8" onClick={handleAddText}>Done</Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-8 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-6">
          {step === 'capture' ? (
            <div className="flex items-center justify-center gap-12">
              <Button variant="ghost" size="icon" className="text-white h-12 w-12 rounded-full bg-white/10">
                <RotateCw className="h-6 w-6" />
              </Button>
              <button 
                className="h-20 w-20 rounded-full border-[6px] border-white flex items-center justify-center group"
                onClick={handleCapture}
                disabled={hasCameraPermission !== true}
              >
                <div className="h-14 w-14 bg-white rounded-full group-hover:scale-90 transition-transform" />
              </button>
              <Button variant="ghost" size="icon" className="text-white h-12 w-12 rounded-full bg-white/10" onClick={onClose}>
                <Trash2 className="h-6 w-6" />
              </Button>
            </div>
          ) : (
            <>
              {showFilters && (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {FILTERS.map(f => (
                    <button
                      key={f.id}
                      className={cn(
                        "flex flex-col items-center gap-2 shrink-0 group",
                        selectedFilter.id === f.id ? "text-white" : "text-white/40"
                      )}
                      onClick={() => setSelectedFilter(f)}
                    >
                      <div className={cn("h-14 w-14 rounded-xl border-2 overflow-hidden bg-zinc-800 transition-all", selectedFilter.id === f.id ? "border-primary scale-110" : "border-transparent")}>
                        <div className={cn("w-full h-full bg-zinc-700", f.class)} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">{f.label}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between gap-4">
                <Button variant="ghost" className="text-white font-bold" onClick={resetState}>Discard</Button>
                <Button 
                  className="flex-1 h-14 bg-white text-black font-bold text-lg rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200"
                  onClick={handleShare}
                >
                  <Send className="h-5 w-5" />
                  Share Story
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
