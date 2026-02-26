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
  Plus
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

  useEffect(() => {
    if (isActive) {
      videoRef.current?.play().catch(() => {});
    } else {
      videoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
  }, [isActive]);

  const toggleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 800);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (!isLiked) toggleLike();
    else {
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 800);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count.toString();
  };

  const renderCaption = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>;
      if (part.startsWith('#')) return <span key={i} className="text-primary font-bold hover:underline cursor-pointer ml-1">{part}</span>;
      return part;
    });
  };

  return (
    <div className="relative h-[100dvh] w-full flex items-center justify-center group select-none">
      {/* Video Foundation */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onClick={() => setIsMuted(!isMuted)}
        onDoubleClick={handleDoubleClick}
      />

      {/* Mute Indicator Overlay */}
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 p-4 rounded-full transition-opacity duration-300 pointer-events-none",
        isActive ? "opacity-0" : "opacity-100"
      )}>
        {isMuted ? <VolumeX className="h-10 w-10 text-white" /> : <Volume2 className="h-10 w-10 text-white" />}
      </div>

      {/* Double Tap Heart Animation */}
      {showHeartAnimation && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping pointer-events-none">
          <Heart className="h-24 w-24 text-primary fill-primary drop-shadow-[0_0_20px_rgba(153,64,229,0.8)]" />
        </div>
      )}

      {/* Right Interaction Sidebar */}
      <div className="absolute right-4 bottom-24 z-50 flex flex-col items-center gap-6 animate-in slide-in-from-right-4 duration-700 delay-300">
        <div className="relative group/avatar">
          <Link href={`/profile/${user.username}`}>
            <Avatar className="h-12 w-12 border-2 border-white ring-2 ring-primary/20 transition-transform group-hover/avatar:scale-110">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
          </Link>
          <button className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-white rounded-full p-0.5 shadow-lg hover:scale-110 transition-transform">
            <Plus className="h-3 w-3" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={toggleLike}
            className="group/btn"
          >
            <div className={cn(
              "p-3 rounded-full backdrop-blur-md transition-all active:scale-75",
              isLiked ? "bg-primary/20 text-primary" : "bg-black/20 text-white hover:bg-black/40"
            )}>
              <Heart className={cn("h-7 w-7", isLiked && "fill-current animate-bounce")} />
            </div>
          </button>
          <span className="text-[10px] font-black text-white drop-shadow-md uppercase tracking-widest">{formatCount(likes)}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button className="p-3 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-all active:scale-75">
            <MessageCircle className="h-7 w-7" />
          </button>
          <span className="text-[10px] font-black text-white drop-shadow-md uppercase tracking-widest">{formatCount(comments)}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={cn(
              "p-3 rounded-full backdrop-blur-md transition-all active:scale-75",
              isBookmarked ? "bg-accent/20 text-accent" : "bg-black/20 text-white hover:bg-black/40"
            )}
          >
            <Bookmark className={cn("h-7 w-7", isBookmarked && "fill-current")} />
          </button>
          <span className="text-[10px] font-black text-white drop-shadow-md uppercase tracking-widest">Vault</span>
        </div>

        <button className="p-3 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-all active:scale-75">
          <Share2 className="h-7 w-7" />
        </button>

        <button className="p-3 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-all">
          <MoreHorizontal className="h-7 w-7" />
        </button>

        {/* Rotating Music Disc */}
        <div className="mt-4 relative group/music cursor-pointer">
          <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full animate-pulse opacity-0 group-hover/music:opacity-100 transition-opacity" />
          <div className="relative h-12 w-12 rounded-full border-2 border-white/20 overflow-hidden animate-[spin_4s_linear_infinite] shadow-2xl">
            <Image src={music.cover} alt="Music" fill className="object-cover" />
          </div>
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-lg">
            <Music2 className="h-2 w-2 text-primary" />
          </div>
        </div>
      </div>

      {/* Bottom Info Slate */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pt-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
        <div className="max-w-[80%] space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex flex-col gap-1 pointer-events-auto">
            <div className="flex items-center gap-2">
              <Link href={`/profile/${user.username}`} className="text-lg font-black italic uppercase tracking-tighter text-white hover:underline drop-shadow-md">
                @{user.username}
              </Link>
              {user.isVerified && <CheckCircle2 className="h-4 w-4 text-primary fill-primary text-white" />}
              <div className="bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                <span className="text-[8px] font-black text-white uppercase tracking-widest">{user.role}</span>
              </div>
            </div>
            <p className="text-sm text-white/90 leading-relaxed line-clamp-3 font-medium drop-shadow-sm">
              {renderCaption(caption)}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md rounded-xl p-2.5 w-fit border border-white/10 pointer-events-auto hover:bg-white/10 transition-colors cursor-pointer group/audio">
            <div className="h-8 w-8 rounded-lg overflow-hidden relative shrink-0">
              <Image src={music.cover} alt="Audio" fill className="object-cover" />
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover/audio:opacity-100 transition-opacity">
                <Music2 className="h-4 w-4 text-white animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 pr-4">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="animate-[scroll_10s_linear_infinite] whitespace-nowrap flex gap-4">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{music.title} — {music.artist}</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{music.title} — {music.artist}</span>
                </div>
              </div>
              <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Original Sonic signature</span>
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