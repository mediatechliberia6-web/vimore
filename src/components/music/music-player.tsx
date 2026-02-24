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
  Sparkles
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
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[800px] h-20 bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex items-center px-4 gap-4 animate-in slide-in-from-bottom-8 z-[70] cursor-pointer group hover:bg-zinc-800/90 transition-all duration-300"
        onClick={() => setIsExpanded(true)}
      >
        <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 shadow-lg">
          <Image 
            src={currentTrack.cover} 
            alt={currentTrack.title} 
            fill 
            className="object-cover" 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate text-white">{currentTrack.title}</p>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate">{currentTrack.artist}</p>
        </div>

        <div className="flex items-center gap-2">
          {isSmartShuffle && (
            <div className="hidden sm:flex items-center gap-1 bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/30">
              <Sparkles className="h-3 w-3" />
              <span className="text-[8px] font-black italic uppercase">Smart</span>
            </div>
          )}
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full text-white hover:bg-white/10 active:scale-90 transition-all"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          >
            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current" />}
          </Button>
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full text-zinc-400 group-hover:text-white"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 transition-all duration-300" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-30">
        <Image 
          src={currentTrack.cover} 
          alt="Background Blur" 
          fill 
          className="object-cover blur-[100px]" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black" />
      </div>

      <header className="p-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white/5 hover:bg-white/10 active:scale-90"
          onClick={() => setIsExpanded(false)}
        >
          <ChevronDown className="h-6 w-6" />
        </Button>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-1">Collaborative Hub</p>
          <div className="flex items-center gap-2 justify-center">
            <Users className="h-3 w-3 text-orange-500" />
            <p className="text-sm font-bold italic uppercase tracking-tighter">{listeners.length} Listening Now</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/10 active:scale-90">
          <Share2 className="h-5 w-5" />
        </Button>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-8 gap-12 max-w-7xl mx-auto w-full">
        <div className="w-full max-w-[400px] lg:max-w-[500px] aspect-square relative group">
          <div className={cn(
            "absolute inset-0 bg-orange-500/20 blur-[60px] rounded-full transition-opacity duration-1000",
            isPlaying ? "opacity-100 animate-pulse" : "opacity-0"
          )} />
          
          <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 transition-transform duration-700 group-hover:scale-[1.02]">
            <Image 
              src={currentTrack.cover} 
              alt={currentTrack.title} 
              fill 
              className="object-cover" 
            />

            {reactions.map((r) => (
              <div
                key={r.id}
                className="absolute bottom-4 text-4xl animate-out fade-out slide-out-to-top-[400px] pointer-events-none z-50 select-none"
                style={{ left: `${r.x}%`, animationDuration: '2000ms' }}
              >
                {r.emoji}
              </div>
            ))}
          </div>

          <div className="absolute -right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3">
             <TooltipProvider>
                {listeners.map((listener, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <Avatar className="h-10 w-10 border-2 border-orange-500 shadow-xl cursor-help transition-transform hover:scale-110">
                        <AvatarImage src={listener.avatar} />
                        <AvatarFallback>{listener.name[0]}</AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="font-bold text-xs">{listener.name} is listening</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
             </TooltipProvider>
          </div>
        </div>

        <div className="flex-1 w-full max-w-[500px] flex flex-col gap-8">
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <h2 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-none">
                {currentTrack.title}
              </h2>
              <p className="text-xl text-orange-500 font-bold italic uppercase tracking-widest opacity-80">
                {currentTrack.artist}
              </p>
            </div>
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-zinc-400 hover:text-orange-500 active:scale-90 transition-all">
              <Heart className="h-7 w-7" />
            </Button>
          </div>

          <div className="space-y-4">
            <Slider 
              value={[progress]} 
              max={100} 
              step={0.1} 
              onValueChange={(val) => setProgress(val[0])}
              className="py-4"
            />
            <div className="flex justify-between text-[11px] font-black italic text-zinc-500 uppercase tracking-widest">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between px-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn("transition-all active:scale-90", isSmartShuffle ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(153,64,229,0.5)]" : "text-zinc-500 hover:text-white")}
                onClick={handleSmartShuffleToggle}
              >
                <Shuffle className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-8">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-14 w-14 rounded-full text-white hover:bg-white/10 active:scale-90 transition-all"
                  onClick={prevTrack}
                >
                  <SkipBack className="h-8 w-8 fill-current" />
                </Button>
                <Button 
                  className="h-24 w-24 rounded-full bg-orange-500 hover:bg-orange-400 text-black shadow-2xl shadow-orange-500/40 transition-transform active:scale-90"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current ml-1" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-14 w-14 rounded-full text-white hover:bg-white/10 active:scale-90 transition-all"
                  onClick={nextTrack}
                >
                  <SkipForward className="h-8 w-8 fill-current" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white active:scale-90">
                <Repeat className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-8">
              <div className="flex flex-col gap-4 w-full">
                <div className="flex items-center gap-3">
                  <AudioLines className="h-4 w-4 text-orange-500" />
                  <span className="text-[10px] font-black italic uppercase text-zinc-500">Live Reactions</span>
                </div>
                <div className="flex items-center justify-between px-2">
                  {QUICK_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => addReaction(emoji)}
                      className="text-2xl hover:scale-125 transition-all active:scale-90 hover:drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-8">
               <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  className={cn(
                    "rounded-xl gap-2 font-black italic uppercase tracking-widest text-[10px] h-10 px-4 border-white/10 transition-all active:scale-95",
                    isSpatial ? "bg-orange-500 text-black border-orange-500" : "bg-white/5 text-zinc-400"
                  )}
                  onClick={() => setIsSpatial(!isSpatial)}
                >
                  <Zap className="h-4 w-4" />
                  Spatial Hub
                </Button>
                {isSpatial && (
                   <div className="flex gap-0.5 items-end h-6">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-orange-500 rounded-full animate-bounce" 
                          style={{ 
                            height: isPlaying ? `${Math.random() * 80 + 20}%` : '20%',
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '0.6s'
                          }} 
                        />
                      ))}
                   </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 flex-1 max-w-[180px] ml-8">
                <Volume2 className="h-4 w-4 text-zinc-500" />
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
      </main>

      <footer className="p-8 text-center bg-gradient-to-t from-black to-transparent">
        <button className="group flex flex-col items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-white transition-colors">Up Next: {isSmartShuffle ? "Smart Recommendation" : "Next in Queue"}</span>
          <div className="h-1 w-12 bg-zinc-800 rounded-full group-hover:bg-orange-500 transition-colors" />
        </button>
      </footer>
    </div>
  );
}
