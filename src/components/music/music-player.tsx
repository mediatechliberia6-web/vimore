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
  Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function MusicPlayer() {
  const { 
    currentTrack, 
    isPlaying, 
    isExpanded, 
    isSpatial,
    progress,
    volume,
    togglePlay, 
    setIsExpanded,
    setIsSpatial,
    setProgress,
    setVolume
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
    return (
      <div 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-[800px] h-20 bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex items-center px-4 gap-4 animate-in slide-in-from-bottom-8 z-[70] cursor-pointer group"
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
          {isSpatial && (
            <div className="hidden sm:flex items-center gap-1 bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full border border-orange-500/30 animate-pulse">
              <Zap className="h-3 w-3" />
              <span className="text-[8px] font-black italic uppercase">Spatial</span>
            </div>
          )}
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full text-white hover:bg-white/10"
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
        
        {/* Simple Progress Bar for Mini Player */}
        <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 transition-all duration-300" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    );
  }

  // Expanded Full-Screen Player View
  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col animate-in fade-in zoom-in-95 duration-300">
      {/* Immersive Background Blur */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <Image 
          src={currentTrack.cover} 
          alt="Background Blur" 
          fill 
          className="object-cover blur-[100px]" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black" />
      </div>

      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white/5 hover:bg-white/10"
          onClick={() => setIsExpanded(false)}
        >
          <ChevronDown className="h-6 w-6" />
        </Button>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-1">Playing from Discover</p>
          <p className="text-sm font-bold italic uppercase tracking-tighter">Audiomark Elite</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/10">
          <Share2 className="h-5 w-5" />
        </Button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center p-8 gap-12 max-w-7xl mx-auto w-full">
        
        {/* Cover Art Section */}
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
          </div>
        </div>

        {/* Controls & Metadata Section */}
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
            <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full text-zinc-400 hover:text-orange-500">
              <Heart className="h-7 w-7" />
            </Button>
          </div>

          {/* Progress Slider */}
          <div className="space-y-4">
            <Slider 
              value={[progress]} 
              max={100} 
              step={1} 
              onValueChange={(val) => setProgress(val[0])}
              className="py-4"
            />
            <div className="flex justify-between text-[11px] font-black italic text-zinc-500 uppercase tracking-widest">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between px-4">
              <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                <Shuffle className="h-6 w-6" />
              </Button>
              <div className="flex items-center gap-8">
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full text-white hover:bg-white/10">
                  <SkipBack className="h-8 w-8 fill-current" />
                </Button>
                <Button 
                  className="h-24 w-24 rounded-full bg-orange-500 hover:bg-orange-400 text-black shadow-2xl shadow-orange-500/40 transition-transform active:scale-90"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="h-10 w-10 fill-current" /> : <Play className="h-10 w-10 fill-current ml-1" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-14 w-14 rounded-full text-white hover:bg-white/10">
                  <SkipForward className="h-8 w-8 fill-current" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white">
                <Repeat className="h-6 w-6" />
              </Button>
            </div>

            {/* Feature Controls (Spatial & Visualizer) */}
            <div className="flex items-center justify-between border-t border-white/5 pt-8">
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  className={cn(
                    "rounded-xl gap-2 font-black italic uppercase tracking-widest text-[10px] h-10 px-4 border-white/10 transition-all",
                    isSpatial ? "bg-orange-500 text-black border-orange-500" : "bg-white/5 text-zinc-400"
                  )}
                  onClick={() => setIsSpatial(!isSpatial)}
                >
                  <AudioLines className="h-4 w-4" />
                  Spatial Hub
                </Button>
                {isSpatial && (
                   <div className="flex gap-0.5 items-end h-6">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div 
                          key={i} 
                          className="w-1 bg-orange-500 rounded-full animate-bounce" 
                          style={{ 
                            height: isPlaying ? `${Math.random() * 100}%` : '20%',
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '0.8s'
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

      {/* Footer / Up Next Hint */}
      <footer className="p-8 text-center">
        <button className="group flex flex-col items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-white transition-colors">Up Next</span>
          <div className="h-1 w-12 bg-zinc-800 rounded-full group-hover:bg-orange-500 transition-colors" />
        </button>
      </footer>
    </div>
  );
}
