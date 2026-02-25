"use client";

import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Heart, 
  ThumbsDown, 
  Download, 
  MoreHorizontal,
  Plus,
  Share2,
  Clock,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function PlaylistDetail() {
  const { selectedPlaylist, setSelectedPlaylist, currentTrack, setTrack } = useMusic();

  if (!selectedPlaylist) return null;

  const handleClose = () => setSelectedPlaylist(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[120] bg-background flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500 overflow-hidden">
      {/* Dynamic Background Blur */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-primary/10 blur-[150px] opacity-40" />
        <Image 
          src={selectedPlaylist.cover} 
          alt="Playlist Blur" 
          fill 
          className="object-cover blur-[100px] opacity-20"
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-3xl" />
      </div>

      {/* Header */}
      <header className="p-6 flex items-center justify-between sticky top-0 z-10">
        <Button variant="ghost" size="icon" className="rounded-full bg-secondary/20" onClick={handleClose}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/20">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full bg-secondary/20">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-40">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12 pt-8">
          
          {/* Playlist Info Section */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 lg:w-1/3">
            <div className="relative w-full aspect-square max-w-[320px] rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/10">
              <Image src={selectedPlaylist.cover} alt={selectedPlaylist.title} fill className="object-cover" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter leading-none">{selectedPlaylist.title}</h1>
              <Link href={`/profile/${selectedPlaylist.creator}`} onClick={handleClose}>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-primary font-bold hover:underline transition-all">
                  <User className="h-4 w-4" />
                  <span>@{selectedPlaylist.creator}</span>
                </div>
              </Link>
              <div className="flex items-center justify-center lg:justify-start gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground pt-2">
                <span>Playlist</span>
                <span>•</span>
                <span>{selectedPlaylist.songs.length} Tracks</span>
                <span>•</span>
                <span>{selectedPlaylist.totalStreams} Total Plays</span>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full">
              <Button 
                className="flex-1 h-14 rounded-2xl bg-primary text-white font-black text-lg gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                onClick={() => setTrack(selectedPlaylist.songs[0])}
              >
                <Play className="h-6 w-6 fill-current" />
                PLAY ALL
              </Button>
              <Button variant="secondary" className="h-14 w-14 rounded-2xl">
                <Download className="h-6 w-6" />
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-8 pt-4">
              <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 bg-secondary/20 rounded-full group-hover:bg-primary/10 transition-colors">
                  <Heart className="h-6 w-6 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Like</span>
              </button>
              <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 bg-secondary/20 rounded-full group-hover:bg-destructive/10 transition-colors">
                  <ThumbsDown className="h-6 w-6 group-hover:text-destructive transition-colors" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Dislike</span>
              </button>
            </div>
          </div>

          {/* Track List Section */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Tracks</h2>
              <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <span># TITLE</span>
                <Clock className="h-3 w-3" />
              </div>
            </div>

            <div className="space-y-1">
              {selectedPlaylist.songs.map((song, idx) => {
                const isCurrent = currentTrack?.id === song.id;
                
                return (
                  <div 
                    key={song.id} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl transition-all group cursor-pointer",
                      isCurrent ? "bg-primary/10" : "hover:bg-secondary/10"
                    )}
                    onClick={() => setTrack(song)}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className={cn(
                        "w-4 text-[10px] font-black text-muted-foreground",
                        isCurrent && "text-primary"
                      )}>
                        {idx + 1}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className={cn(
                          "font-bold text-sm truncate",
                          isCurrent ? "text-primary" : "text-foreground"
                        )}>
                          {song.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium hover:text-primary transition-colors">
                          {song.artist}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="text-[10px] font-black text-muted-foreground">{formatDuration(song.duration)}</span>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                            <DropdownMenuItem className="gap-2 cursor-pointer font-bold">
                              <Download className="h-4 w-4" /> Download Single
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
