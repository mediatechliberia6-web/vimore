
"use client";

import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  Maximize2, 
  ChevronDown,
  AudioLines,
  Zap,
  Share2,
  Heart,
  Users,
  Sparkles,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const QUICK_REACTIONS = ["🔥", "❤️", "🙌", "💯", "🤯", "🚀"];

export function MusicPlayer() {
  const { 
    currentTrack, 
    isPlaying, 
    isExpanded, 
    isSpatial,
    isSmartShuffle,
    progress,
    volume,
    listeners,
    reactions,
    togglePlay, 
    nextTrack,
    prevTrack,
    setIsExpanded,
    setIsSpatial,
    setIsSmartShuffle,
    setProgress,
    setVolume,
    addReaction
  } = useMusic();

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = (progress / 100) * currentTrack.duration;

  const handleSmartShuffleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSmartShuffle(!isSmartShuffle);
  };

  if (!isExpanded) {
    return (
      <div 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[900px] h-20 bg-card/70 backdrop-blur-2xl border border-border shadow-2xl rounded-[2rem] flex items-center px-6 gap-6 animate-in slide-in-from-bottom-12 z-[70] cursor-pointer group hover:bg-card/90 transition-all duration-500"
        onClick={() => setIsExpanded(true)}
      >
        <div className="relative h-12 w-12 rounded-[1rem] overflow-hidden shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500">
          <Image 
            src={currentTrack.cover} 
            alt={currentTrack.title} 
            fill 
            className="object-cover" 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate text-foreground">{currentTrack.title}</p>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate">{currentTrack.artist}</p>
            {isSmartShuffle && (
              <span className="flex items-center gap-1 bg-primary/10 text-primary px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase">
                <Sparkles className="h-2.5 w-2.5" /> Smart
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-muted-foreground/60 mr-2">
            <Users className="h-3 w-3" />
            {listeners.length}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            >
              {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="rounded-full text-muted-foreground hover:text-primary group-hover:scale-110 transition-all"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-8 right-8 h-1 bg-secondary/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-background text-foreground flex flex-col animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
      {/* Immersive Background Glow */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-20 dark:opacity-40">
           <Image src={currentTrack.cover} alt="Blur" fill className="object-cover blur-[150px] scale-125" />
        </div>
        <div className="absolute inset-0 bg-background/40" />
      </div>

      <header className="p-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-secondary/50 hover:bg-primary/10 hover:text-primary active:scale-90 transition-all"
          onClick={() => setIsExpanded(false)}
        >
          <ChevronDown className="h-6 w-6" />
        </Button>
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mb-1">Now Playing</p>
          <div className="flex items-center gap-2 justify-center bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
            <Users className="h-3.5 w-3.5 text-primary" />
            <p className="text-[11px] font-bold text-primary uppercase tracking-wider">{listeners.length} Joined Hub</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50 hover:bg-primary/10 hover:text-primary">
          <Share2 className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-8 gap-12 lg:gap-24 max-w-7xl mx-auto w-full">
        <div className="w-full max-w-[420px] lg:max-w-[550px] aspect-square relative group">
          <div className={cn(
            "absolute inset-0 bg-primary/30 blur-[80px] rounded-full transition-opacity duration-1000",
            isPlaying ? "opacity-100 animate-pulse" : "opacity-0"
          )} />
          
          <div className="relative w-full h-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/20 dark:border-white/5 transition-transform duration-700 group-hover:scale-[1.02]">
            <Image 
              src={currentTrack.cover} 
              alt={currentTrack.title} 
              fill 
              className="object-cover" 
            />

            {reactions.map((r) => (
              <div
                key={r.id}
                className="absolute bottom-10 text-5xl animate-out fade-out slide-out-to-top-[500px] pointer-events-none z-50 select-none"
                style={{ left: `${r.x}%`, animationDuration: '2500ms' }}
              >
                {r.emoji}
              </div>
            ))}
          </div>

          {/* Social Presence Stack */}
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4">
             <TooltipProvider>
                {listeners.map((listener, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-12 w-12 border-4 border-background shadow-xl cursor-help transition-all hover:scale-125 hover:rotate-6">
                        <AvatarImage src={listener.avatar} />
                        <AvatarFallback>{listener.name[0]}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="font-bold text-xs">{listener.name} is vibing</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-primary text-white shadow-xl hover:bg-primary/90 transition-all hover:scale-110">
                   <Users className="h-5 w-5" />
                </Button>
             </TooltipProvider>
          </div>
        </div>

        <div className="flex-1 w-full max-w-[500px] flex flex-col gap-10">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-5xl lg:text-6xl font-bold tracking-tighter leading-none">
                {currentTrack.title}
              </h2>
              <p className="text-2xl text-primary font-bold tracking-tight opacity-90">
                {currentTrack.artist}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full bg-secondary/30 hover:bg-red-500/10 hover:text-red-500 active:scale-90 transition-all">
                <Heart className="h-8 w-8" />
              </Button>
              <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full bg-secondary/30 hover:bg-primary/10 hover:text-primary active:scale-90 transition-all">
                <MoreHorizontal className="h-8 w-8" />
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Slider 
              value={[progress]} 
              max={100} 
              step={0.1} 
              onValueChange={(val) => setProgress(val[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between px-6">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("transition-all active:scale-90 rounded-full h-12 w-12", isSmartShuffle ? "bg-primary/10 text-primary scale-110 shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-secondary/50")}
                onClick={handleSmartShuffleToggle}
              >
                <Shuffle className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-10">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-16 w-16 rounded-full bg-secondary/50 hover:bg-primary/10 hover:text-primary active:scale-90 transition-all"
                  onClick={prevTrack}
                >
                  <SkipBack className="h-8 w-8 fill-current" />
                </Button>
                <Button 
                  className="h-28 w-28 rounded-full bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/40 transition-all active:scale-90 hover:scale-105"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="h-12 w-12 fill-current" /> : <Play className="h-12 w-12 fill-current ml-2" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-16 w-16 rounded-full bg-secondary/50 hover:bg-primary/10 hover:text-primary active:scale-90 transition-all"
                  onClick={nextTrack}
                >
                  <SkipForward className="h-8 w-8 fill-current" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-secondary/50 rounded-full h-12 w-12 active:scale-90">
                <Repeat className="h-6 w-6" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-8 pt-6 border-t border-border/50">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <AudioLines className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Send a Hub Reaction</span>
                </div>
                <div className="flex items-center justify-between px-2 bg-secondary/20 p-4 rounded-3xl border border-border/50">
                  {QUICK_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addReaction(emoji)}
                      className="text-3xl hover:scale-150 transition-all active:scale-90 hover:drop-shadow-[0_0_12px_rgba(153,64,229,0.5)]"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  className={cn(
                    "rounded-2xl gap-2 font-bold uppercase tracking-widest text-[11px] h-12 px-6 transition-all active:scale-95 shadow-sm",
                    isSpatial ? "bg-primary text-white border-primary shadow-primary/20" : "bg-card border-border text-muted-foreground hover:border-primary/50"
                  )}
                  onClick={() => setIsSpatial(!isSpatial)}
                >
                  <Zap className={cn("h-4 w-4", isSpatial && "animate-pulse")} />
                  Spatial Vibe
                </Button>
                
                <div className="flex items-center gap-4 flex-1 max-w-[200px] ml-10">
                  <Volume2 className="h-5 w-5 text-muted-foreground" />
                  <Slider 
                    value={[volume]} 
                    max={100} 
                    onValueChange={(val) => setVolume(val[0])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-10 flex flex-col items-center gap-3 bg-gradient-to-t from-background via-background/80 to-transparent">
        <div className="h-1.5 w-16 bg-muted rounded-full" />
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground">Up Next: {currentTrack.artist}</p>
      </footer>
    </div>
  );
}
