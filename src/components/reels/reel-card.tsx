"use client";

import { useRef, useState, useEffect } from "react";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Music2, 
  CheckCircle2, 
  MoreVertical,
  Volume2,
  VolumeX,
  Plus,
  Sparkles
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface ReelCardProps {
  id: string;
  videoUrl: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    role: string;
    isVerified?: boolean;
  };
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  music: {
    title: string;
    artist: string;
    cover: string;
  };
  isActive: boolean;
}

export function ReelCard({ id, videoUrl, user, caption, likes, comments, shares, music, isActive }: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const triggerHaptic = (intensity = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(intensity);
    }
  };

  const toggleLike = () => {
    triggerHaptic(20);
    const newState = !isLiked;
    setIsLiked(newState);
    setLocalLikes(prev => newState ? prev + 1 : prev - 1);
    if (newState) {
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 800);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!isLiked) toggleLike();
    else {
      triggerHaptic(15);
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 800);
    }
  };

  const toggleBookmark = () => {
    triggerHaptic(30);
    setIsBookmarked(!isBookmarked);
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count.toString();
  };

  const renderCaption = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-white font-black">{part.slice(2, -2)}</strong>;
      if (part.startsWith('#')) return <span key={i} className="text-primary font-black hover:underline cursor-pointer transition-colors"> {part}</span>;
      return part;
    });
  };

  return (
    <div className="relative h-[100dvh] w-full flex items-center justify-center group select-none bg-black">
      {/* Video Foundation */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onClick={() => { triggerHaptic(5); setIsMuted(!isMuted); }}
        onDoubleClick={handleDoubleClick}
      />

      {/* Mute Indicator Overlay */}
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md p-6 rounded-full transition-all duration-300 pointer-events-none z-50",
        isActive ? "opacity-0 scale-50" : "opacity-100 scale-100"
      )}>
        {isMuted ? <VolumeX className="h-12 w-12 text-white" /> : <Volume2 className="h-12 w-12 text-white" />}
      </div>

      {/* Double Tap Heart Animation */}
      {showHeartAnimation && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in zoom-in fade-in duration-300 pointer-events-none z-50">
          <Heart className="h-32 w-32 text-primary fill-primary drop-shadow-[0_0_30px_rgba(153,64,229,0.8)] animate-pulse" />
        </div>
      )}

      {/* Right Interaction Rail - Glassmorphic Sidebar */}
      <div className="absolute right-4 bottom-24 z-50 flex flex-col items-center gap-6 animate-in slide-in-from-right-8 duration-700 delay-300">
        
        {/* Profile Pulse */}
        <div className="relative group/avatar">
          <Link href={`/profile/${user.username}`}>
            <div className="relative">
              <div className="absolute -inset-1.5 bg-primary/40 blur-md rounded-full animate-pulse opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
              <Avatar className="h-14 w-14 border-2 border-white/80 ring-4 ring-primary/10 transition-all group-hover/avatar:scale-110 active:scale-95 shadow-2xl">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
            </div>
          </Link>
          <button className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-white rounded-full p-1 shadow-xl hover:scale-125 transition-transform ring-2 ring-black">
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Interaction Buttons */}
        <div className="flex flex-col items-center gap-1.5">
          <button 
            onClick={toggleLike}
            className="group/btn relative"
          >
            <div className={cn(
              "p-3.5 rounded-full backdrop-blur-xl border border-white/10 transition-all active:scale-75 shadow-2xl",
              isLiked ? "bg-primary/20 text-primary border-primary/30" : "bg-black/20 text-white hover:bg-black/40"
            )}>
              <Heart className={cn("h-7 w-7 transition-all", isLiked && "fill-current animate-bounce")} />
            </div>
            {isLiked && <div className="absolute -inset-2 bg-primary/20 blur-xl rounded-full animate-pulse -z-10" />}
          </button>
          <span className="text-[11px] font-black text-white drop-shadow-md uppercase tracking-widest">{formatCount(localLikes)}</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <button className="p-3.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white hover:bg-black/40 transition-all active:scale-75 shadow-2xl">
            <MessageCircle className="h-7 w-7" />
          </button>
          <span className="text-[11px] font-black text-white drop-shadow-md uppercase tracking-widest">{formatCount(comments)}</span>
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <button 
            onClick={toggleBookmark}
            className="group/btn relative"
          >
            <div className={cn(
              "p-3.5 rounded-full backdrop-blur-xl border border-white/10 transition-all active:scale-75 shadow-2xl",
              isBookmarked ? "bg-accent/20 text-accent border-accent/30" : "bg-black/20 text-white hover:bg-black/40"
            )}>
              <Bookmark className={cn("h-7 w-7", isBookmarked && "fill-current")} />
            </div>
            {isBookmarked && <div className="absolute -inset-2 bg-accent/20 blur-xl rounded-full animate-pulse -z-10" />}
          </button>
          <span className="text-[11px] font-black text-white drop-shadow-md uppercase tracking-widest">Vault</span>
        </div>

        <button className="p-3.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white hover:bg-black/40 transition-all active:scale-75 shadow-2xl">
          <Share2 className="h-7 w-7" />
        </button>

        <button className="p-3.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white hover:bg-black/40 transition-all shadow-2xl">
          <MoreHorizontal className="h-7 w-7" />
        </button>

        {/* Rotating Music Disc */}
        <div className="mt-6 relative group/music cursor-pointer animate-in fade-in zoom-in duration-700 delay-500">
          <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-full animate-pulse opacity-0 group-hover/music:opacity-100 transition-opacity" />
          <div className="relative h-14 w-14 rounded-full border-4 border-white/10 overflow-hidden animate-[spin_6s_linear_infinite] shadow-[0_0_20px_rgba(0,0,0,0.5)] ring-2 ring-black/50">
            <Image src={music.cover} alt="Music" fill className="object-cover" />
          </div>
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-1.5 shadow-xl ring-2 ring-black">
            <Music2 className="h-2.5 w-2.5 text-primary" />
          </div>
        </div>
      </div>

      {/* Bottom Info Slate - The Content Hero */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pt-24 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none">
        <div className="max-w-[85%] space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* Creator & Professional Proof */}
          <div className="flex flex-col gap-2 pointer-events-auto">
            <div className="flex items-center gap-2.5">
              <Link href={`/profile/${user.username}`} className="text-xl font-black italic uppercase tracking-tighter text-white hover:text-primary transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center gap-1.5">
                @{user.username}
                {user.isVerified && <CheckCircle2 className="h-4.5 w-4.5 text-primary fill-primary text-white" />}
              </Link>
              
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-xl">
                <Sparkles className="h-3 w-3 text-accent fill-accent" />
                <span className="text-[9px] font-black text-white uppercase tracking-[0.15em]">{user.role}</span>
              </div>
            </div>
            
            <p className="text-sm sm:text-base text-white/90 leading-relaxed line-clamp-3 font-medium drop-shadow-md">
              {renderCaption(caption)}
            </p>
          </div>

          {/* Sonic Experience Ribbon */}
          <div className="flex items-center gap-3.5 bg-white/5 backdrop-blur-2xl rounded-2xl p-3 w-fit border border-white/10 pointer-events-auto hover:bg-white/10 transition-all cursor-pointer group/audio shadow-2xl group-active:scale-95">
            <div className="h-10 w-10 rounded-xl overflow-hidden relative shrink-0 shadow-lg ring-1 ring-white/20">
              <Image src={music.cover} alt="Audio" fill className="object-cover" />
              <div className="absolute inset-0 bg-primary/30 flex items-center justify-center opacity-0 group-hover/audio:opacity-100 transition-opacity">
                <Music2 className="h-5 w-5 text-white animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 pr-6">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="animate-[scroll_12s_linear_infinite] whitespace-nowrap flex gap-6">
                  <span className="text-[11px] font-black text-white uppercase tracking-widest leading-none">{music.title} — {music.artist}</span>
                  <span className="text-[11px] font-black text-white uppercase tracking-widest leading-none">{music.title} — {music.artist}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3].map(i => <div key={i} className={cn("w-0.5 bg-primary/60 rounded-full animate-bounce", i === 1 ? "h-2" : i === 2 ? "h-3 delay-75" : "h-2 delay-150")} />)}
                </div>
                <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Original Sonic signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
