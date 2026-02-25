"use client";

import { useState, useRef } from "react";
import { 
  Music, 
  Disc3, 
  Upload, 
  X, 
  Plus, 
  Calendar, 
  Hash, 
  Users, 
  CheckCircle2, 
  Trash2, 
  Play, 
  Pause,
  AlertCircle,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Settings2,
  Mic2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface TrackSlot {
  id: number;
  title: string;
  file: string | null;
  fileName: string | null;
  collaborator: string;
  isExplicit: boolean;
  credits: string;
  isExpanded: boolean;
}

const GENRES = ["Afrobeats", "Amapiano", "Hip-Hop", "R&B", "Trap", "Jazz", "Lo-Fi", "Gospel"];

export function MusicUpload({ onCancel }: { onCancel: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState<"choice" | "single" | "album">("choice");
  const [coverArt, setCoverArt] = useState<string | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  
  // Album specific state
  const [tracks, setTracks] = useState<TrackSlot[]>(
    Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      title: "",
      file: null,
      fileName: null,
      collaborator: "",
      isExplicit: false,
      credits: "",
      isExpanded: false
    }))
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverArt(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const updateTrack = (id: number, data: Partial<TrackSlot>) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const handleTrackFileUpload = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateTrack(id, { 
        fileName: file.name, 
        file: "simulated_blob_url", 
        title: file.name.split('.')[0] 
      });
    }
  };

  const handlePublish = () => {
    // Validation
    if (!coverArt || !projectTitle || !selectedGenre) {
      toast({ 
        variant: "destructive", 
        title: "Missing Metadata", 
        description: "Please provide cover art, title, and genre before publishing." 
      });
      return;
    }

    const uploadedCount = tracks.filter(t => t.file).length;
    if (step === "album" && uploadedCount < 2) {
      toast({ 
        variant: "destructive", 
        title: "Incomplete Album", 
        description: "An album must have at least 2 tracks." 
      });
      return;
    }

    toast({ 
      title: "Project Published!", 
      description: `${projectTitle} is now live on ViMore.` 
    });
    onCancel();
  };

  if (step === "choice") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Studio Entrance</h2>
          <p className="text-muted-foreground font-medium">Select your project type to begin the curation process</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <button 
            onClick={() => setStep("single")}
            className="group relative bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-10 text-left transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />
            <div className="relative z-10 space-y-6">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Music className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Drop a Single</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Perfect for a quick release. One cover, one track, immediate impact.</p>
              </div>
              <div className="pt-4 flex items-center text-[10px] font-black uppercase tracking-widest text-primary">
                Enter Single Flow <Plus className="ml-2 h-3 w-3" />
              </div>
            </div>
          </button>

          <button 
            onClick={() => setStep("album")}
            className="group relative bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-10 text-left transition-all hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />
            <div className="relative z-10 space-y-6">
              <div className="h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                <Disc3 className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Curate an Album</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Build your masterpiece. Up to 12 tracks with full metadata control.</p>
              </div>
              <div className="pt-4 flex items-center text-[10px] font-black uppercase tracking-widest text-accent">
                Enter Album Flow <Plus className="ml-2 h-3 w-3" />
              </div>
            </div>
          </button>
        </div>

        <Button variant="ghost" className="text-muted-foreground font-bold hover:text-foreground" onClick={onCancel}>
          Cancel and Return to Hub
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0A0A0A] min-h-screen animate-in slide-in-from-bottom-8 duration-700">
      {/* Studio Header */}
      <header className="sticky top-[61px] lg:top-[125px] z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5" onClick={() => setStep("choice")}>
            <X className="h-6 w-6" />
          </Button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">ViMore Studio Console</span>
            <h2 className="text-xl font-black italic uppercase tracking-tighter">
              {step === "single" ? "Single Workspace" : "Album Workspace"}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="hidden sm:inline-flex text-muted-foreground hover:text-white font-bold" onClick={onCancel}>Discard</Button>
          <Button className="bg-primary text-white font-black italic uppercase tracking-widest rounded-xl h-11 px-8 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all" onClick={handlePublish}>
            Publish Project
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 lg:p-12 space-y-12 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 items-start">
          
          {/* Global Metadata Column */}
          <aside className="space-y-8 sticky top-[220px]">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Project Visual</Label>
              <div 
                className="relative aspect-square w-full rounded-[2.5rem] bg-[#111] border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer group hover:border-primary/50 transition-colors overflow-hidden"
                onClick={() => coverInputRef.current?.click()}
              >
                {coverArt ? (
                  <>
                    <Image src={coverArt} alt="Cover Preview" fill className="object-cover transition-transform group-hover:scale-110 duration-700" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="h-10 w-10 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors mb-4" />
                    <span className="text-xs font-bold text-muted-foreground group-hover:text-white">Upload High-Res Cover</span>
                    <span className="text-[9px] text-muted-foreground/50 mt-1 uppercase font-black">1:1 Square Format Required</span>
                  </>
                )}
                <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Project Title</Label>
                <Input 
                  placeholder="Enter title..." 
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="h-14 bg-[#111] border-white/5 rounded-2xl focus-visible:ring-primary/20 text-lg font-bold" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Primary Genre</Label>
                  <select 
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    className="w-full h-14 bg-[#111] border-white/5 rounded-2xl px-4 text-sm font-bold text-white focus:ring-2 ring-primary/20 outline-none appearance-none"
                  >
                    <option value="" disabled>Select...</option>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Release Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      type="date" 
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                      className="h-14 pl-12 bg-[#111] border-white/5 rounded-2xl focus-visible:ring-primary/20 text-sm font-bold" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Track Rack Column */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                {step === "single" ? "The Track" : "The 12-Slot Rack"}
              </Label>
              <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase">
                <CheckCircle2 className="h-3 w-3" /> 
                {tracks.filter(t => t.file).length} / {step === "single" ? 1 : 12} Uploaded
              </div>
            </div>

            <div className="space-y-4">
              {(step === "single" ? tracks.slice(0, 1) : tracks).map((track, idx) => (
                <div 
                  key={track.id}
                  className={cn(
                    "bg-[#111] border rounded-3xl transition-all overflow-hidden",
                    track.file ? "border-primary/20 shadow-lg shadow-primary/5" : "border-white/5",
                    track.isExpanded && "ring-2 ring-primary/30"
                  )}
                >
                  <div className="p-4 flex items-center gap-4">
                    <div className="h-10 w-10 bg-black rounded-xl flex items-center justify-center text-[10px] font-black italic text-muted-foreground border border-white/5 shrink-0">
                      {track.id.toString().padStart(2, '0')}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {track.file ? (
                        <div className="flex flex-col">
                          <input 
                            value={track.title}
                            onChange={(e) => updateTrack(track.id, { title: e.target.value })}
                            className="bg-transparent border-none p-0 text-sm font-bold text-white focus:ring-0 placeholder:text-muted-foreground/50"
                            placeholder="Track Title"
                          />
                          <span className="text-[9px] text-primary font-black uppercase tracking-widest flex items-center gap-1 mt-0.5">
                            <Mic2 className="h-2 w-2" /> {track.fileName}
                          </span>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            const input = document.getElementById(`file-${track.id}`) as HTMLInputElement;
                            input?.click();
                          }}
                          className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
                        >
                          <Upload className="h-4 w-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">Select Audio File</span>
                        </button>
                      )}
                      <input 
                        type="file" 
                        id={`file-${track.id}`} 
                        className="hidden" 
                        accept="audio/*" 
                        onChange={(e) => handleTrackFileUpload(track.id, e)} 
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {track.file && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl hover:bg-white/5 text-muted-foreground"
                            onClick={() => updateTrack(track.id, { isExpanded: !track.isExpanded })}
                          >
                            <Settings2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-destructive"
                            onClick={() => updateTrack(track.id, { file: null, fileName: null, title: "" })}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {track.isExpanded && track.file && (
                    <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <Users className="h-3 w-3" /> Featured Collaborator
                          </Label>
                          <Input 
                            placeholder="@username" 
                            value={track.collaborator}
                            onChange={(e) => updateTrack(track.id, { collaborator: e.target.value })}
                            className="h-10 bg-black border-white/5 rounded-xl text-xs" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            <Mic2 className="h-3 w-3" /> Writer/Producer Credits
                          </Label>
                          <Input 
                            placeholder="Full Name" 
                            value={track.credits}
                            onChange={(e) => updateTrack(track.id, { credits: e.target.value })}
                            className="h-10 bg-black border-white/5 rounded-xl text-xs" 
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-black rounded-2xl border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">Explicit Content</span>
                          <span className="text-[9px] text-muted-foreground uppercase font-medium">Contains offensive language</span>
                        </div>
                        <Switch 
                          checked={track.isExplicit}
                          onCheckedChange={(val) => updateTrack(track.id, { isExplicit: val })}
                        />
                      </div>

                      <div className="flex items-center gap-4 pt-2">
                        <Button variant="outline" className="h-10 border-white/5 bg-transparent rounded-xl text-xs font-bold flex-1 gap-2">
                          <Play className="h-3 w-3 fill-current" /> Waveform Verification
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="text-[10px] font-black uppercase tracking-widest"
                          onClick={() => updateTrack(track.id, { isExpanded: false })}
                        >
                          Minimize
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pre-Flight Checklist */}
            <div className="p-8 rounded-[2.5rem] bg-black border border-white/5 space-y-6">
              <h4 className="text-lg font-black italic uppercase tracking-tighter">Pre-Flight Check</h4>
              <div className="space-y-3">
                <div className={cn("flex items-center gap-3 text-xs font-bold transition-colors", coverArt ? "text-green-500" : "text-muted-foreground")}>
                  {coverArt ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  High-Resolution Art Attached
                </div>
                <div className={cn("flex items-center gap-3 text-xs font-bold transition-colors", (step === "single" ? tracks[0].file : tracks.filter(t => t.file).length >= 2) ? "text-green-500" : "text-muted-foreground")}>
                  {(step === "single" ? tracks[0].file : tracks.filter(t => t.file).length >= 2) ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {step === "single" ? "Audio Track Uploaded" : "Album Threshold Met (2+ Tracks)"}
                </div>
                <div className={cn("flex items-center gap-3 text-xs font-bold transition-colors", projectTitle && selectedGenre ? "text-green-500" : "text-muted-foreground")}>
                  {projectTitle && selectedGenre ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  Global Metadata Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
