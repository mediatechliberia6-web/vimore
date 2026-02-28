"use client";

import { useRef, useState, useEffect } from "react";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Music2, 
  CheckCircle2, 
  Plus, 
  Sparkles,
  Volume2,
  VolumeX,
  Download,
  Loader2,
  Gift
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, parseFollowerCount } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useMusic } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { ShareHub } from "@/components/post/share-hub";
import { useToast } from "@/hooks/use-toast";

interface ReelCardProps {
  id: string;
  videoUrl: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    role: string;
    isVerified?: boolean;
    followers?: string | number;
  };
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  music: {
    id: string | number;
    title: string;
    artist: string;
    cover: string;
  };
  isActive: boolean;
}

export function ReelCard({ id, videoUrl, user, caption, likes, comments, shares, music, isActive }: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { triggerHaptic, openCaptureStudio, triggerDownloadWithAd } = useMusic();
  const { currentUser, openCommentHub } = usePosts();
  const { toast } = useToast();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showMuteIndicator, setShowMuteIndicator] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);
  const [isShareHubOpen, setIsShareHubOpen] = useState(false);

  useEffect(() => {
    if (isActive && videoRef.current && videoUrl) {
      videoRef.current.play().catch((err) => {
        console.warn("Reel playback failed:", err);
      });
    } else {
      videoRef.current?.pause();
      if (videoRef.current) videoRef.current.currentTime = 0;
    }
  }, [isActive, videoUrl]);

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

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(5);
    setIsMuted(!isMuted);
    setShowMuteIndicator(true);
    setTimeout(() => setShowMuteIndicator(false), 1000);
  };

  const handleDownload = () => {
    triggerDownloadWithAd('reel', async () => {
      setIsDownloading(true);
      toast({ title: "Archiving Vibe", description: "Preparing high-fidelity reel node..." });
      await new Promise(r => setTimeout(r, 2500));
      setIsDownloading(false);
      toast({ title: "Reel Noted", description: "Video saved to your identity notes." });
    });
  };

  const handleSonicClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openCaptureStudio({
      id: music.id,
      title: music.title,
      artist: music.artist,
      cover: music.cover,
      duration: 180
    });
  };

  const handleShareClick = () => {
    triggerHaptic(10);
    setIsShareHubOpen(true);
  };

  const handleGiftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(30);
    toast({
      title: "Network Appreciation",
      description: `Sending a gift handshake to @${user.username}...`,
    });
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + "M";
    if (count >= 1000) return (count / 1000).toFixed(1) + "K";
    return count.toString();
  };

  const isMe = user.username === currentUser.username;
  const profileHref = isMe ? "/profile" : `/profile/${user.username}`;
  const isEligibleForGift = parseFollowerCount(user.followers) > 1000;

  return (
    <div className="relative h-[100dvh] w-full flex items-center justify-center group select-none bg-black overflow-hidden">
      <video
        key={videoUrl}
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full object-cover"
        loop
        muted={isMuted}
        playsInline
        onClick={toggleMute}
        onDoubleClick={handleDoubleClick}
      />

      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md p-4 rounded-full transition-all duration-300 pointer-events-none z-[60]",
        showMuteIndicator ? "opacity-100 scale-100" : "opacity-0 scale-50"
      )}>
        {isMuted ? <VolumeX className="h-8 w-8 text-white" /> : <Volume2 className="h-8 w-8 text-white" />}
      </div>

      {showHeartAnimation && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in zoom-in fade-in duration-300 pointer-events-none z-[60]">
          <Heart className="h-24 w-24 text-primary fill-primary drop-shadow-[0_0_20px_rgba(153,64,229,0.8)] animate-pulse" />
        </div>
      )}

      <div className={cn(
        "absolute right-3 bottom-20 z-50 flex flex-col items-center gap-4 transition-all duration-700 delay-300",
        isActive ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"
      )}>
        <div className="relative group/avatar">
          <Link href={profileHref}>
            <div className="relative">
              <div className="absolute -inset-1 bg-primary/40 blur-sm rounded-full animate-pulse opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
              <Avatar className="h-11 w-11 border-[1.5px] border-white/80 ring-2 ring-primary/10 transition-all group-hover/avatar:scale-105 active:scale-95 shadow-xl">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
            </div>
          </Link>
          <button className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 bg-primary text-white rounded-full p-0.5 shadow-lg hover:scale-110 transition-transform ring-1 ring-black">
            <Plus className="h-2 w-2" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button onClick={toggleLike} className="group/btn relative">
            <div className={cn(
              "p-2.5 rounded-full backdrop-blur-xl border border-white/10 transition-all active:scale-75 shadow-lg",
              isLiked ? "bg-primary/20 text-primary border-primary/30" : "bg-black/20 text-white hover:bg-black/40"
            )}>
              <Heart className={cn("h-5 w-5 transition-all", isLiked && "fill-current animate-bounce")} />
            </div>
          </button>
          <span className="text-[9px] font-black text-white drop-shadow-md uppercase tracking-widest">{formatCount(localLikes)}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); openCommentHub(id); }}
            className="p-2.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white hover:bg-black/40 transition-all active:scale-75 shadow-lg"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          <span className="text-[9px] font-black text-white drop-shadow-md uppercase tracking-widest">{formatCount(comments)}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button onClick={handleDownload} className="group/btn relative" disabled={isDownloading}>
            <div className={cn(
              "p-2.5 rounded-full backdrop-blur-xl border border-white/10 transition-all active:scale-75 shadow-lg",
              isDownloading ? "bg-primary/20 text-primary animate-pulse" : "bg-black/20 text-white hover:bg-black/40"
            )}>
              {isDownloading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
            </div>
          </button>
          <span className="text-[9px] font-black text-white drop-shadow-md uppercase tracking-widest">Note</span>
        </div>

        <button 
          onClick={handleShareClick}
          className="p-2.5 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-white hover:bg-black/40 transition-all active:scale-75 shadow-lg"
        >
          <Share2 className="h-5 w-5" />
        </button>

        <div 
          onClick={handleSonicClick}
          className="mt-4 relative group/music cursor-pointer"
        >
          <div className="absolute inset-0 bg-primary/40 blur-xl rounded-full animate-pulse opacity-0 group-hover/music:opacity-100 transition-opacity" />
          <div className="relative h-10 w-10 rounded-full border-[3px] border-white/10 overflow-hidden animate-[spin_6s_linear_infinite] shadow-[0_0_15px_rgba(0,0,0,0.5)] ring-1 ring-black/50">
            <Image src={music.cover} alt="Music" fill className="object-cover" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 bg-white rounded-full p-1 shadow-lg ring-1 ring-black">
            <Music2 className="h-2 w-2 text-primary" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 pt-20 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none">
        <div className={cn(
          "max-w-[75%] space-y-3 transition-all duration-700",
          isActive ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        )}>
          <div className="flex flex-col gap-1.5 pointer-events-auto">
            <div className="flex items-center gap-2 relative">
              {isEligibleForGift && (
                <button 
                  onClick={handleGiftClick}
                  className="absolute -top-8 left-0 p-1.5 bg-primary rounded-full text-white shadow-lg animate-shake-vibe z-50 border border-white/20"
                >
                  <Gift className="h-3.5 w-3.5" />
                </button>
              )}
              <Link href={profileHref} className="text-lg font-black italic uppercase tracking-tighter text-white hover:text-primary transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center gap-1">
                @{user.username}
                {user.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-primary fill-primary text-white" />}
              </Link>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                <Sparkles className="h-2.5 w-2.5 text-accent fill-accent" />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">{user.role}</span>
              </div>
            </div>
            <p className="text-[13px] sm:text-sm text-white/90 leading-tight line-clamp-2 font-medium drop-shadow-md">{caption}</p>
          </div>

          <div 
            onClick={handleSonicClick}
            className="flex items-center gap-2.5 bg-white/5 backdrop-blur-2xl rounded-xl p-2 w-fit border border-white/5 pointer-events-auto hover:bg-white/10 transition-all cursor-pointer group/audio shadow-xl group-active:scale-95"
          >
            <div className="h-8 w-8 rounded-lg overflow-hidden relative shrink-0 shadow-lg ring-1 ring-white/10">
              <Image src={music.cover} alt="Audio" fill className="object-cover" />
              <div className="absolute inset-0 bg-primary/30 flex items-center justify-center opacity-0 group-hover/audio:opacity-100 transition-opacity">
                <Music2 className="h-4 w-4 text-white animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col min-w-0 pr-4 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap flex gap-10">
                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{music.title} — {music.artist}</span>
                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">{music.title} — {music.artist}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="flex gap-0.5">
                  {[1, 2, 3].map(i => <div key={i} className={cn("w-0.5 bg-primary/60 rounded-full animate-bounce", i === 1 ? "h-1.5" : i === 2 ? "h-2 delay-75" : "h-1.5 delay-150")} />)}
                </div>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Sonic ID</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShareHub isOpen={isShareHubOpen} onClose={() => setIsShareHubOpen(false)} post={{ id, user, content: caption, image: music.cover }} />

      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 8s linear infinite; }
      `}</style>
    </div>
  );
}
