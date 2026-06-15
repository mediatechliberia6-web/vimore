"use client";

import { useState, useRef, useEffect } from "react";
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
  Mic2,
  ArrowLeft,
  Loader2,
  Lock,
  Unlock,
  DollarSign,
  ShieldCheck,
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
import { useMusic, Track, Album } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { BUCKET_MUSIC, BUCKET_IMAGES, BUCKET } from "@/lib/appwrite";
import { parseFollowerCount } from "@/lib/utils";

interface TrackSlot {
  id: number;
  title: string;
  file: File | null;
  fileName: string | null;
  collaborator: string;
  isExplicit: boolean;
  credits: string;
  isExpanded: boolean;
  duration: number;
}

const readAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => { resolve(Math.round(audio.duration)); URL.revokeObjectURL(audio.src); };
    audio.onerror = () => resolve(0);
    audio.src = URL.createObjectURL(file);
  });
};

const GENRES = ["Afrobeats", "Amapiano", "Hip-Hop", "R&B", "Trap", "Jazz", "Lo-Fi", "Gospel"];

export function MusicUpload({ onCancel }: { onCancel: () => void }) {
  const { toast } = useToast();
  const { triggerHaptic, publishTrack, publishAlbum } = useMusic();
  const { uploadMedia, currentUser } = usePosts();
  
  const [step, setStep] = useState<"choice" | "studio">("choice");
  const [projectType, setProjectType] = useState<"single" | "album">("single");
  const [coverArt, setCoverArt] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [isLocked, setIsLocked] = useState(false);
  const [unlockPrice, setUnlockPrice] = useState(1.0);

  const [tracks, setTracks] = useState<TrackSlot[]>(
    Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      title: "",
      file: null,
      fileName: null,
      collaborator: "",
      isExplicit: false,
      credits: "",
      isExpanded: false,
      duration: 0,
    }))
  );

  const followerCount = parseFollowerCount(currentUser?.followers);
  const isPaywallEligible = followerCount >= 10000;

  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedDraft = localStorage.getItem('vimore_studio_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setProjectTitle(draft.projectTitle || "");
        setSelectedGenre(draft.selectedGenre || "");
        setReleaseDate(draft.releaseDate || "");
        if (draft.projectType) {
          setProjectType(draft.projectType);
          setStep("studio");
        }
      } catch (e) { console.error("Draft failed to load", e); }
    }
  }, []);

  const handleChoice = (type: "single" | "album") => {
    triggerHaptic(15);
    setProjectType(type);
    setStep("studio");
    if (type === "single") {
      setTracks(prev => prev.slice(0, 1));
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic(10);
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverArt(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const updateTrack = (id: number, data: Partial<TrackSlot>) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
  };

  const handleTrackFileUpload = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic(10);
      updateTrack(id, { fileName: file.name, file: file, title: file.name.split('.')[0] });
      const dur = await readAudioDuration(file);
      updateTrack(id, { duration: dur });
    }
  };

  const calculateProgress = () => {
    let totalFields = 3; 
    let completedFields = 0;
    if (coverArt) completedFields++;
    if (projectTitle.trim()) completedFields++;
    if (selectedGenre) completedFields++;

    const uploadedTracks = tracks.filter(t => t.file).length;
    const requiredTracks = projectType === "single" ? 1 : 2;
    
    totalFields += requiredTracks;
    completedFields += Math.min(uploadedTracks, requiredTracks);

    return (completedFields / totalFields) * 100;
  };

  const isReadyToPublish = calculateProgress() === 100;

  const handlePublish = async () => {
    if (!isReadyToPublish || isPublishing) {
      triggerHaptic(50);
      return;
    }

    setIsPublishing(true);
    triggerHaptic(100);
    toast({ title: "Vault Archival Initiated", description: "Materializing high-fidelity sonic nodes..." });
    
    try {
      if (!currentUser) return;
      const coverUrl = coverFile ? await uploadMedia(coverFile, BUCKET.ALBUM_COVERS) : "https://picsum.photos/seed/single/600/600";

      if (projectType === "single") {
        const slot = tracks[0];
        const audioUrl = slot.file ? await uploadMedia(slot.file, BUCKET_MUSIC) : "";

        await publishTrack({
          title: projectTitle,
          artist: currentUser.name,
          artistUsername: currentUser.username,
          cover: coverUrl,
          audioUrl: audioUrl,
          duration: slot.duration || 0,
          artistFollowers: currentUser.followers,
          isLocked: isLocked && isPaywallEligible,
          unlockPrice: isLocked && isPaywallEligible ? unlockPrice : 0,
        });
      } else {
        const albumSongs: Track[] = [];
        for (const slot of tracks.filter(t => t.file)) {
          const audioUrl = await uploadMedia(slot.file!, BUCKET_MUSIC);
          albumSongs.push({
            id: `song-${Date.now()}-${slot.id}`,
            title: slot.title,
            artist: currentUser.name,
            artistUsername: currentUser.username,
            cover: coverUrl,
            audioUrl: audioUrl,
            duration: slot.duration || 0,
            streams: "0",
            likes: 0,
            unlikes: 0,
          });
        }
        
        await publishAlbum({
          id: `album-${Date.now()}`,
          title: projectTitle,
          artist: currentUser.name,
          artistUsername: currentUser.username,
          cover: coverUrl,
          year: new Date().getFullYear().toString(),
          tracks: albumSongs.length,
          totalStreams: "0",
          songs: albumSongs,
          isLocked: isLocked && isPaywallEligible,
          unlockPrice: isLocked && isPaywallEligible ? unlockPrice : 0,
        });
      }

      toast({ 
        title: "Project Published!", 
        description: `${projectTitle} is now live on the ViMore global cluster.` 
      });
      localStorage.removeItem('vimore_studio_draft');
      onCancel();
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sonic Sync Error", description: e.message });
    } finally {
      setIsPublishing(false);
    }
  };

  if (step === "choice") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-12 animate-in fade-in zoom-in-95 duration-500 min-h-[80vh]">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Studio Entrance</h2>
          <p className="text-muted-foreground font-medium">Select your project type to begin the curation process</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          <button 
            onClick={() => handleChoice("single")}
            className="group relative bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 sm:p-10 text-left transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10"
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
            onClick={() => handleChoice("album")}
            className="group relative bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 sm:p-10 text-left transition-all hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/10"
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
    <div className="flex-1 bg-[#050505] min-h-screen text-white flex flex-col relative animate-in slide-in-from-bottom-4 duration-500">
      
      <header className="sticky top-0 z-[100] bg-[#0A0A0A]/90 backdrop-blur-xl border-b border-white/5 px-4 h-16 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 text-white" onClick={() => { triggerHaptic(5); setStep("choice"); }}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h2 className="text-sm font-black italic uppercase tracking-tighter">Studio Console</h2>
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">
              {projectType === "single" ? "Single Release" : "Album Curation"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            className={cn(
              "h-9 px-6 rounded-full font-black italic uppercase tracking-widest text-[10px] transition-all",
              isReadyToPublish && !isPublishing ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-white/10 text-white/40"
            )}
            onClick={handlePublish}
            disabled={!isReadyToPublish || isPublishing}
          >
            {isPublishing ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
            {isPublishing ? "Syncing..." : "Publish"}
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
          <div 
            className="h-full bg-primary transition-all duration-500 shadow-[0_0_8px_rgba(153,64,229,0.5)]" 
            style={{ width: `${calculateProgress()}%` }} 
          />
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full pb-40">
        
        <section className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Project Visual</Label>
            {coverArt && <Badge variant="outline" className="text-[8px] font-black border-primary/20 text-primary">COMPLETE</Badge>}
          </div>
          <div 
            className="relative aspect-square w-full rounded-[2rem] bg-[#0A0A0A] border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer group hover:border-primary/50 transition-colors overflow-hidden shadow-2xl"
            onClick={() => coverInputRef.current?.click()}
          >
            {coverArt ? (
              <>
                <Image src={coverArt} alt="Cover Preview" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="h-10 w-10 text-white" />
                </div>
              </>
            ) : (
              <>
                <div className="p-6 rounded-3xl bg-white/5 mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs font-bold text-muted-foreground group-hover:text-white">Upload Cover Art</span>
                <span className="text-[9px] text-muted-foreground/50 mt-1 uppercase font-black">High-Res 1:1 Square</span>
              </>
            )}
            <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
          </div>
        </section>

        <section className="p-4 sm:p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Project Title</Label>
              <Input 
                placeholder="The name of your masterpiece..." 
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="h-14 bg-[#0A0A0A] border-white/5 rounded-2xl focus-visible:ring-primary/20 text-lg font-bold placeholder:text-muted-foreground/30 shadow-inner" 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Genre</Label>
                <div className="relative">
                  <select 
                    value={selectedGenre}
                    onChange={(e) => { triggerHaptic(5); setSelectedGenre(e.target.value); }}
                    className="w-full h-14 bg-[#0A0A0A] border border-white/5 rounded-2xl px-4 text-sm font-bold text-white focus:ring-2 ring-primary/20 outline-none appearance-none shadow-inner"
                  >
                    <option value="" disabled>Choose Vibe...</option>
                    {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Release Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input 
                    type="date" 
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="h-14 pl-12 bg-[#0A0A0A] border-white/5 rounded-2xl focus-visible:ring-primary/20 text-sm font-bold shadow-inner" 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
              {projectType === "single" ? "The Track" : "The Tracklist"}
            </Label>
            <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase">
              <CheckCircle2 className="h-3 w-3" /> 
              {tracks.filter(t => t.file).length} / {tracks.length} READY
            </div>
          </div>

          <div className="space-y-3">
            {tracks.map((track, idx) => (
              <div 
                key={track.id}
                className={cn(
                  "bg-[#0A0A0A] border rounded-[1.75rem] transition-all overflow-hidden",
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
                          className="bg-transparent border-none p-0 text-sm font-bold text-white focus:ring-0 placeholder:text-muted-foreground/20"
                          placeholder="Untitled Track"
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
                        <span className="text-[10px] font-black uppercase tracking-widest">Add Audio</span>
                      </button>
                    )}
                    <input 
                      type="file" 
                      id={`file-${track.id}`} 
                      className="hidden" 
                      accept="audio/*" 
                      onChange={(e) => { handleTrackFileUpload(track.id, e); }} 
                    />
                  </div>

                  {track.file && (
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={cn("h-9 w-9 rounded-full", track.isExpanded ? "bg-primary text-white" : "text-muted-foreground")}
                        onClick={() => { triggerHaptic(5); updateTrack(track.id, { isExpanded: !track.isExpanded }); }}
                      >
                        {track.isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive"
                        onClick={() => { triggerHaptic(5); updateTrack(track.id, { file: null, fileName: null, title: "" }); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {track.isExpanded && track.file && (
                  <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-6 animate-in slide-in-from-top-2 duration-300 bg-black/40">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
                          <Users className="h-3 w-3 text-primary" /> Collaborator
                        </Label>
                        <Input 
                          placeholder="@username" 
                          value={track.collaborator}
                          onChange={(e) => updateTrack(track.id, { collaborator: e.target.value })}
                          className="h-11 bg-black border-white/5 rounded-xl text-xs font-bold" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 ml-1">
                          <Settings2 className="h-3 w-3 text-primary" /> Credits
                        </Label>
                        <Input 
                          placeholder="Producers, Writers..." 
                          value={track.credits}
                          onChange={(e) => updateTrack(track.id, { credits: e.target.value })}
                          className="h-11 bg-black border-white/5 rounded-xl text-xs font-bold" 
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black rounded-2xl border border-white/5">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-wider">Explicit Content</span>
                        <span className="text-[9px] text-muted-foreground font-medium">Toggle for parental advisory</span>
                      </div>
                      <Switch 
                        checked={track.isExplicit}
                        onCheckedChange={(val) => { triggerHaptic(5); updateTrack(track.id, { isExplicit: val }); }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {isPaywallEligible && (
          <section className="p-4 sm:p-6">
            <div className="bg-gradient-to-br from-cyan-950/60 to-[#0A0A0A] rounded-[2.5rem] p-8 border border-cyan-500/20 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                  <Lock className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-lg font-black italic uppercase tracking-tighter text-white">Exclusive Access</h4>
                  <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Paywall · Verified 10K+ Creators</p>
                </div>
                <div className="ml-auto">
                  <Switch
                    checked={isLocked}
                    onCheckedChange={(val) => { triggerHaptic(10); setIsLocked(val); }}
                  />
                </div>
              </div>

              {isLocked && (
                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    Fans must pay <span className="text-cyan-400 font-black">◆ {unlockPrice.toFixed(2)} Diamonds</span> once to unlock this {projectType}. You receive {currentUser?.isVerified ? '90%' : '80%'} of each payment.
                  </p>
                  <div className="space-y-3">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-cyan-400/70 ml-1">Price in Diamonds (◆ 0.50 – 8.00)</Label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={0.5}
                        max={8}
                        step={0.5}
                        value={unlockPrice}
                        onChange={(e) => setUnlockPrice(parseFloat(e.target.value))}
                        className="flex-1 accent-cyan-500 h-2 rounded-full cursor-pointer"
                      />
                      <div className="shrink-0 bg-black border border-cyan-500/30 rounded-xl px-4 py-2 min-w-[80px] text-center">
                        <span className="text-lg font-black text-cyan-400">◆ {unlockPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-white/30 px-1">
                      <span>◆ 0.50</span>
                      <span>◆ 4.00</span>
                      <span>◆ 8.00</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">You Receive</p>
                      <p className="text-xl font-black text-cyan-400">◆ {(unlockPrice * (currentUser?.isVerified ? 0.9 : 0.8)).toFixed(2)}</p>
                      <p className="text-[8px] text-white/30 mt-0.5">{currentUser?.isVerified ? '90%' : '80%'} share</p>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center">
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Platform Fee</p>
                      <p className="text-xl font-black text-white/40">◆ {(unlockPrice * (currentUser?.isVerified ? 0.1 : 0.2)).toFixed(2)}</p>
                      <p className="text-[8px] text-white/30 mt-0.5">{currentUser?.isVerified ? '10%' : '20%'} fee</p>
                    </div>
                  </div>
                  {currentUser?.isVerified && (
                    <div className="flex items-center gap-2 bg-green-500/5 border border-green-500/20 rounded-2xl p-3">
                      <ShieldCheck className="h-4 w-4 text-green-400 shrink-0" />
                      <p className="text-[10px] font-bold text-green-400">Verified creator bonus — you keep 90% of every unlock</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="p-4 sm:p-6 mb-20">
          <div className="bg-[#0A0A0A] rounded-[2.5rem] p-8 border border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full" />
            
            <h4 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" />
              Pre-Flight Check
            </h4>
            
            <div className="space-y-4">
              <div className={cn("flex items-center justify-between p-3 rounded-2xl transition-all border", coverArt ? "bg-green-500/5 border-green-500/20 text-green-500" : "bg-white/5 border-transparent text-muted-foreground")}>
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider">
                  {coverArt ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  Cover Art Attached
                </div>
                {!coverArt && <button className="text-[9px] font-black underline" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>FIX</button>}
              </div>

              <div className={cn("flex items-center justify-between p-3 rounded-2xl transition-all border", projectTitle && selectedGenre ? "bg-green-500/5 border-green-500/20 text-green-500" : "bg-white/5 border-transparent text-muted-foreground")}>
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider">
                  {projectTitle && selectedGenre ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  Global Metadata Set
                </div>
                {!(projectTitle && selectedGenre) && <button className="text-[9px] font-black underline" onClick={() => window.scrollTo({top: 200, behavior: 'smooth'})}>FIX</button>}
              </div>

              <div className={cn("flex items-center justify-between p-3 rounded-2xl transition-all border", (tracks.filter(t => t.file).length >= (projectType === "single" ? 1 : 2)) ? "bg-green-500/5 border-green-500/20 text-green-500" : "bg-white/5 border-transparent text-muted-foreground")}>
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider">
                  {(tracks.filter(t => t.file).length >= (projectType === "single" ? 1 : 2)) ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {projectType === "single" ? "Audio Track Uploaded" : `Audio Threshold Met (${tracks.filter(t => t.file).length}/2)`}
                </div>
                {!(tracks.filter(t => t.file).length >= (projectType === "single" ? 1 : 2)) && <button className="text-[9px] font-black underline" onClick={() => window.scrollTo({top: 500, behavior: 'smooth'})}>FIX</button>}
              </div>
            </div>

            <Button 
              className={cn(
                "w-full h-14 rounded-2xl font-black italic uppercase tracking-widest text-lg transition-all",
                isReadyToPublish && !isPublishing ? "bg-primary text-white hover:scale-[1.02] shadow-xl shadow-primary/30" : "bg-white/5 text-white/20 cursor-not-allowed"
              )}
              onClick={handlePublish}
              disabled={!isReadyToPublish || isPublishing}
            >
              {isPublishing ? "Syncing Nodes..." : "Publish Project"}
            </Button>
          </div>
        </section>

      </main>
    </div>
  );
}
