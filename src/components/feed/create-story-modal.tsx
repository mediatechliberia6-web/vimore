
"use client";

import { useState, useRef, useEffect } from "react";
import { X, Image as ImageIcon, Clapperboard, Type, Check, Palette, Filter, Send, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { usePosts } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import Image from "next/image";

const FILTERS = [
  { id: "none", label: "None", class: "" },
  { id: "grayscale", label: "Mono", class: "grayscale" },
  { id: "sepia", label: "Sepia", class: "sepia" },
  { id: "brightness", label: "Lume", class: "brightness-125 contrast-110" },
  { id: "vivid", label: "Vivid", class: "saturate-150" },
  { id: "noir", label: "Noir", class: "invert brightness-75 grayscale" },
];

const GRADIENTS = [
  { id: "vimore", label: "ViMore", class: "bg-gradient-to-br from-primary to-accent" },
  { id: "sunset", label: "Sunset", class: "bg-gradient-to-br from-orange-500 to-rose-500" },
  { id: "ocean", label: "Ocean", class: "bg-gradient-to-br from-blue-400 to-emerald-400" },
  { id: "midnight", label: "Midnight", class: "bg-gradient-to-br from-indigo-900 to-slate-900" },
  { id: "carbon", label: "Carbon", class: "bg-zinc-900" },
];

export function CreateStoryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { addStory, uploadMedia, triggerHaptic } = usePosts();
  const { toast } = useToast();
  const [step, setStep] = useState<'choice' | 'edit' | 'text'>('choice');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0]);
  const [storyText, setStoryStory] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;
    triggerHaptic(10);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMediaType(type);
    setStep('edit');
  };

  const handleShare = async () => {
    if (step === 'text' && !storyText.trim()) return;
    if (step === 'edit' && !selectedFile) return;

    setIsProcessing(true);
    triggerHaptic(30);

    try {
      let finalImageUrl = "";
      if (selectedFile) {
        finalImageUrl = await uploadMedia(selectedFile);
      }

      addStory({
        image: finalImageUrl, 
        type: mediaType || 'image',
        filter: selectedFilter.class,
        textOverlays: step === 'text' ? [{ text: storyText, x: 50, y: 50, color: "#FFFFFF" }] : [],
        background: step === 'text' ? selectedGradient.class : undefined
      });

      toast({ title: "Story Synchronized", description: "Node materialized in the cluster rail." });
      onClose();
      resetState();
    } catch (e) {
      toast({ variant: "destructive", title: "Vault Sync Error" });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setStep('choice');
    setSelectedFile(null);
    setPreviewUrl(null);
    setMediaType(null);
    setStoryStory("");
    setIsProcessing(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black flex items-center justify-center">
      <div className="relative w-full max-w-[500px] h-full sm:h-[90vh] bg-zinc-950 sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        <div className="absolute top-6 left-0 right-0 z-50 px-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="text-white bg-black/20 backdrop-blur-md rounded-full" onClick={step === 'choice' ? onClose : resetState}><ArrowLeft className="h-6 w-6" /></Button>
          {step !== 'choice' && <Button className="bg-primary text-white font-bold rounded-full px-6 h-9 gap-2" onClick={handleShare} disabled={isProcessing}>{isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Sync"}</Button>}
        </div>

        <div className="flex-1 flex flex-col">
          {step === 'choice' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in duration-500">
              <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Share a Vibe</h2>
              <div className="grid grid-cols-1 w-full gap-4">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-6 p-6 bg-zinc-900 border border-white/5 rounded-[2rem] hover:bg-zinc-800 transition-all group"><div className="h-14 w-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform"><ImageIcon className="h-7 w-7" /></div><div className="text-left"><p className="text-lg font-bold text-white">Photo</p><p className="text-xs text-zinc-500">Share your best moments</p></div></button>
                <button onClick={() => videoInputRef.current?.click()} className="flex items-center gap-6 p-6 bg-zinc-900 border border-white/5 rounded-[2rem] hover:bg-zinc-800 transition-all group"><div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform"><Clapperboard className="h-7 w-7" /></div><div className="text-left"><p className="text-lg font-bold text-white">Video</p><p className="text-xs text-zinc-500">Max 1 minute clip</p></div></button>
                <button onClick={() => setStep('text')} className="flex items-center gap-6 p-6 bg-zinc-900 border border-white/5 rounded-[2rem] hover:bg-zinc-800 transition-all group"><div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"><Type className="h-7 w-7" /></div><div className="text-left"><p className="text-lg font-bold text-white">Text Story</p><p className="text-xs text-zinc-500">Type what's on your mind</p></div></button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleMediaUpload(e, 'image')} />
              <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => handleMediaUpload(e, 'video')} />
            </div>
          ) : step === 'text' ? (
            <div className={cn("flex-1 flex-col flex items-center justify-center relative p-8 transition-all duration-500", selectedGradient.class)}><textarea autoFocus placeholder="Start typing..." className="w-full bg-transparent border-none focus:ring-0 text-4xl text-center font-black italic uppercase text-white placeholder:text-white/30 resize-none" value={storyText} onChange={(e) => setStoryStory(e.target.value)} /></div>
          ) : (
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">{isProcessing ? <Loader2 className="h-10 w-10 animate-spin text-primary" /> : (mediaType === 'video' ? <video src={previewUrl!} className="w-full h-full object-cover" autoPlay muted loop playsInline /> : <Image src={previewUrl!} alt="Story" fill className={cn("object-cover", selectedFilter.class)} />)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
