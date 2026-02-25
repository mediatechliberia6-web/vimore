
"use client";

import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Maximize2, 
  ChevronDown,
  AudioLines,
  Heart,
  Share2,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Image from "next/image";

const QUICK_REACTIONS = ["🔥", "❤️", "🙌", "💯", "🤯", "🚀"];

export function MusicPlayer() {
  const { 
    currentTrack, isPlaying, isExpanded, progress, volume, reactions,
    togglePlay, nextTrack, prevTrack, setIsExpanded, setProgress, setVolume, addReaction
  } = useMusic();

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = (progress / 100) * currentTrack.duration;

  if (!isExpanded) {
    return (
      <div 
        className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[95%] max-w-[800px] h-16 bg-background/60 dark:bg-card/60 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-2xl rounded-2xl flex items-center px-4 gap-4 animate-in slide-in-from-bottom-12 z-[70] cursor-pointer group"
        onClick={() => setIsExpanded(true)}
      >
        <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0 shadow-lg">
          <Image src={currentTrack.cover} alt={currentTrack.title} fill className="object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold truncate text-foreground">{currentTrack.title}</p>
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest truncate">{currentTrack.artist}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="icon" variant="ghost" className="h-10 w-10"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          >
            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-secondary/50 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
      {/* Immersive Orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/20 blur-[120px] rounded-full animate-pulse duration-1000" />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-3xl" />
      </div>

      <header className="p-6 flex items-center justify-between">
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/20" onClick={() => setIsExpanded(false)}>
          <ChevronDown className="h-6 w-6" />
        </Button>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">Now Playing</p>
          <div className="flex items-center gap-2 justify-center bg-primary/10 px-4 py-1 rounded-full">
            <AudioLines className="h-3 w-3 text-primary animate-bounce" />
            <span className="text-[10px] font-black text-primary uppercase">Sonic Immersive</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/20">
          <Share2 className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-8 gap-12 max-w-7xl mx-auto w-full">
        <div className="relative w-full max-w-[400px] lg:max-w-[500px] aspect-square group">
          <div className={cn(
            "absolute inset-0 bg-primary/30 blur-[100px] rounded-full transition-opacity duration-1000",
            isPlaying ? "opacity-100" : "opacity-0"
          )} />
          <div className="relative h-full w-full rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-white/20">
            <Image src={currentTrack.cover} alt={currentTrack.title} fill className="object-cover" />
            {reactions.map((r) => (
              <div
                key={r.id}
                className="absolute bottom-10 text-5xl animate-out fade-out slide-out-to-top-[500px] pointer-events-none z-50"
                style={{ left: `${r.x}%`, animationDuration: '2500ms' }}
              >
                {r.emoji}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 w-full max-w-[500px] flex flex-col gap-10">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-none">{currentTrack.title}</h2>
              <p className="text-2xl text-primary font-bold">{currentTrack.artist}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full bg-secondary/20 hover:text-red-500">
                <Heart className="h-7 w-7" />
              </Button>
              <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full bg-secondary/20">
                <MoreHorizontal className="h-7 w-7" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <Slider value={[progress]} max={100} step={0.1} onValueChange={(val) => setProgress(val[0])} />
            <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-10">
            <Button variant="ghost" size="icon" className="h-16 w-16 rounded-full bg-secondary/20" onClick={prevTrack}>
              <SkipBack className="h-8 w-8 fill-current" />
            </Button>
            <Button 
              className="h-24 w-24 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-transform"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current ml-2" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-16 w-16 rounded-full bg-secondary/20" onClick={nextTrack}>
              <SkipForward className="h-8 w-8 fill-current" />
            </Button>
          </div>

          <div className="space-y-6 pt-10 border-t border-white/10">
            <div className="flex items-center justify-between bg-secondary/10 p-4 rounded-[2rem]">
              {QUICK_REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addReaction(emoji)}
                  className="text-3xl hover:scale-150 transition-all active:scale-90"
                >
                  {emoji}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              <Slider value={[volume]} max={100} onValueChange={(val) => setVolume(val[0])} className="w-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
