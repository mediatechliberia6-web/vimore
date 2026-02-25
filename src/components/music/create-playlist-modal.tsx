"use client";

import { useState, useRef } from "react";
import { 
  X, 
  Plus, 
  Upload, 
  Lock, 
  Globe, 
  Music2, 
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function CreatePlaylistModal() {
  const { isCreatePlaylistOpen, closeCreatePlaylist, confirmCreatePlaylist, trackForNewPlaylist, triggerHaptic } = useMusic();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [coverArt, setCoverArt] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isCreatePlaylistOpen) return null;

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic(10);
      const reader = new FileReader();
      reader.onloadend = () => setCoverArt(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    confirmCreatePlaylist({
      title,
      description,
      isPrivate,
      cover: coverArt || undefined
    });
    // Reset local state
    setTitle("");
    setDescription("");
    setIsPrivate(false);
    setCoverArt(null);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={closeCreatePlaylist} />
      
      <div className="relative w-full max-w-lg bg-background border border-border shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
        
        <header className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Plus className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Playlist Studio</h2>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={closeCreatePlaylist}>
            <X className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Cover Art Slot */}
            <div 
              className="relative w-40 h-40 shrink-0 rounded-2xl bg-secondary/30 border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer group hover:border-primary transition-colors overflow-hidden mx-auto sm:mx-0"
              onClick={() => fileInputRef.current?.click()}
            >
              {coverArt || trackForNewPlaylist ? (
                <>
                  <Image 
                    src={coverArt || trackForNewPlaylist!.cover} 
                    alt="Playlist Cover" 
                    fill 
                    className="object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Upload className="h-6 w-6" />
                  </div>
                </>
              ) : (
                <>
                  <Music2 className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-2">Add Cover</span>
                </>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
            </div>

            <div className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Playlist Title</Label>
                <Input 
                  placeholder="My Sonic Journey..." 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 rounded-xl bg-secondary/20 border-none font-bold text-lg focus-visible:ring-primary/20"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Vibe Description</Label>
                <Textarea 
                  placeholder="Tell the community what this vibe is about..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-20 rounded-xl bg-secondary/20 border-none resize-none text-sm placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-secondary/10 rounded-2xl border border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", isPrivate ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600")}>
                {isPrivate ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">{isPrivate ? "Private Vibe" : "Public Showcase"}</span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {isPrivate ? "Only you can see this collection" : "Visible to everyone on your ViMore profile"}
                </span>
              </div>
            </div>
            <Switch checked={isPrivate} onCheckedChange={(val) => { triggerHaptic(5); setIsPrivate(val); }} />
          </div>

          {trackForNewPlaylist && (
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                <Sparkles className="h-3 w-3 text-primary" /> Initial Track Added
              </Label>
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                <div className="relative h-10 w-10 rounded-md overflow-hidden shrink-0">
                  <Image src={trackForNewPlaylist.cover} alt="Track" fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{trackForNewPlaylist.title}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">{trackForNewPlaylist.artist}</p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
            </div>
          )}
        </main>

        <footer className="p-6 bg-secondary/5 border-t border-border mt-auto">
          <Button 
            className={cn(
              "w-full h-14 rounded-2xl font-black italic uppercase tracking-widest text-lg transition-all",
              title.trim() ? "bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02]" : "bg-secondary text-muted-foreground cursor-not-allowed"
            )}
            onClick={handleSubmit}
            disabled={!title.trim()}
          >
            Launch Playlist
          </Button>
        </footer>
      </div>
    </div>
  );
}
