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
  ThumbsDown,
  Download,
  Share2,
  MoreHorizontal,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { usePathname } from "next/navigation";

const QUICK_REACTIONS = ["🔥", "❤️", "🙌", "💯", "🤯", "🚀"];

export function MusicPlayer() {
  const pathname = usePathname();
  const { 
    currentTrack, isPlaying, isExpanded, progress, volume, reactions,
    togglePlay, nextTrack, prevTrack, setIsExpanded, setProgress, setVolume, addReaction, clearPlayer
  } = useMusic();

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = (progress / 100) * currentTrack.duration;

  // Mini Player View
  if (!isExpanded) {
    const isHome = pathname === "/";
    const topOffset = isHome ? "top-[117px]" : "top-[61px]";

    return (
      <div 
        className={cn(
          "fixed left-0 right-0 h-16 bg-white/95 dark:bg-card/95 backdrop-blur-xl border-b border-primary/10 shadow-sm flex items-center px-4 gap-4 animate-in slide-in-from-top-4 z-[45] cursor-pointer group transition-all duration-300",
          topOffset
        )}
        onClick={() => setIsExpanded(true)}
      >
        <div className="max-w-[1440px] mx-auto w-full flex items-center gap-4">
          <div className="relative h-10 w-10 rounded-lg overflow-hidden shrink-0 shadow-lg ring-1 ring-primary/10">
            <Image src={currentTrack.cover} alt={currentTrack.title} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold truncate text-foreground">{currentTrack.title}</p>
              <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
                <AudioLines className="h-2 w-2 text-primary animate-pulse" />
                <span className="text-[8px] font-black text-primary uppercase">Live</span>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest truncate">{currentTrack.artist}</p>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              size="icon" variant="ghost" className="h-10 w-10 text-primary"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
            </Button>
            <Button 
              size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground"
              onClick={(e) => { e.stopPropagation(); setIsExpanded(true); }}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button 
              size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); clearPlayer(); }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary/30">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    );
  }

  // Expanded Full Screen View
  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
      {/* Immersive Orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/20 blur-[120px] rounded-full animate-pulse duration-1000" />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-3xl" />
      </div>

      <header className="p-4 sm:p-6 flex items-center justify-between shrink-0">
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/20" onClick={() => setIsExpanded(false)}>
          <ChevronDown className="h-6 w-6" />
        </Button>
        <div className="text-center">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-1">Now Playing</p>
          <div className="flex items-center gap-2 justify-center bg-primary/10 px-3 sm:px-4 py-1 rounded-full">
            <AudioLines className="h-3 w-3 text-primary animate-bounce" />
            <span className="text-[9px] sm:text-[10px] font-black text-primary uppercase">Sonic Immersive</span>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/20" title="Download">
            <Download className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/20" title="Share">
            <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/20 hover:text-destructive" onClick={clearPlayer} title="Close Player">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-center p-6 sm:p-12 gap-8 lg:gap-16 max-w-7xl mx-auto w-full min-h-full">
          {/* Artwork Container */}
          <div className="relative w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[500px] aspect-square group shrink-0">
            <div className={cn(
              "absolute inset-0 bg-primary/30 blur-[100px] rounded-full transition-opacity duration-1000",
              isPlaying ? "opacity-100" : "opacity-0"
            )} />
            <div className="relative h-full w-full rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-white/20">
              <Image src={currentTrack.cover} alt={currentTrack.title} fill className="object-cover" />
              {reactions.map((r) => (
                <div
                  key={r.id}
                  className="absolute bottom-10 text-4xl sm:text-5xl animate-out fade-out slide-out-to-top-[500px] pointer-events-none z-50"
                  style={{ left: `${r.x}%`, animationDuration: '2500ms' }}
                >
                  {r.emoji}
                </div>
              ))}
            </div>
          </div>

          {/* Controls and Track Info */}
          <div className="flex-1 w-full max-w-[500px] flex flex-col gap-6 sm:gap-10">
            <div className="flex items-start justify-between">
              <div className="space-y-1 sm:space-y-2">
                <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter leading-tight sm:leading-none">{currentTrack.title}</h2>
                <p className="text-xl sm:text-2xl text-primary font-bold">{currentTrack.artist}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-secondary/20 hover:text-red-500">
                  <Heart className="h-5 w-5 sm:h-7 sm:w-7" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-secondary/20 hover:text-destructive">
                  <ThumbsDown className="h-5 w-5 sm:h-7 sm:w-7" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-secondary/20">
                  <MoreHorizontal className="h-5 w-5 sm:h-7 sm:w-7" />
                </Button>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <Slider value={[progress]} max={100} step={0.1} onValueChange={(val) => setProgress(val[0])} />
              <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentTrack.duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 sm:gap-10">
              <Button variant="ghost" size="icon" className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-secondary/20" onClick={prevTrack}>
                <SkipBack className="h-6 w-6 sm:h-8 sm:w-8 fill-current" />
              </Button>
              <Button 
                className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-primary text-white shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-transform"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-8 w-8 sm:h-10 sm:w-10 fill-current" /> : <Play className="h-8 w-8 sm:h-10 sm:w-10 fill-current ml-1 sm:ml-2" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-secondary/20" onClick={nextTrack}>
                <SkipForward className="h-6 w-6 sm:h-8 sm:w-8 fill-current" />
              </Button>
            </div>

            <div className="space-y-4 sm:space-y-6 pt-6 sm:pt-10 border-t border-white/10">
              <div className="flex items-center justify-between bg-secondary/10 p-3 sm:p-4 rounded-[1.5rem] sm:rounded-[2rem]">
                {QUICK_REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addReaction(emoji)}
                    className="text-2xl sm:text-3xl hover:scale-150 transition-all active:scale-90 px-1 sm:px-2"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <Slider value={[volume]} max={100} onValueChange={(val) => setVolume(val[0])} className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}