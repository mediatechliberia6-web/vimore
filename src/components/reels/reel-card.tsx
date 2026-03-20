
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  CheckCircle2, 
  Plus, 
  Sparkles,
  Volume2,
  VolumeX,
  Download,
  Loader2,
  Gift,
  Rocket,
  Zap,
  EyeOff,
  Eye,
  Gauge,
  Play,
  Pause
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, parseFollowerCount, saveFileToDevice } from "@/lib/utils";
import Link from "next/link";
import { useMusic } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import { useTranslation } from "@/context/LanguageContext";
import { ShareHub } from "@/components/post/share-hub";
import { BoostPortal } from "@/components/post/boost-portal";
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
  views: number;
  music: {
    id: string | number;
    title: string;
    artist: string;
    cover: string;
  };
  isActive: boolean;
  isBoosted?: boolean;
  boostTargetViews?: number;
  boostCurrentViews?: number;
}

export function ReelCard({ id, videoUrl, user, caption, likes, comments, shares, views = 0, music, isActive, isBoosted, boostTargetViews, boostCurrentViews }: ReelCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { triggerHaptic, triggerDownloadWithAd } = useMusic();
  const { currentUser, openCommentHub, openGiftHub, settings, recordView } = usePosts();
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showPlayPauseIndicator, setShowPlayPauseIndicator] = useState<'play' | 'pause' | null>(null);
  const [showMuteIndicator, setShowMuteIndicator] = useState(false);
  const [localLikes, setLocalLikes] = useState(likes);
  const [isShareHubOpen, setIsShareHubOpen] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setIsPlaying(false);
    }
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl || settings.isFreeMode) return;
    if (isPlaying) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          video.load();
          video.play().catch(() => {});
        });
      }
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isPlaying, videoUrl, settings.isFreeMode]);

  const handleStartPlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(10);
    setIsMuted(false);
    setIsPlaying(true);
  }, [triggerHaptic]);

  const handleVideoTap = useCallback(() => {
    if (!isPlaying) return;
    triggerHaptic(5);
    setIsPlaying(false);
    setShowPlayPauseIndicator('pause');
    setTimeout(() => setShowPlayPauseIndicator(null), 700);
  }, [isPlaying, triggerHaptic]);

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
    e.stopPropagation();
    if (!isPlaying) setIsPlaying(true);
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
    setIsMuted(prev => !prev);
    setShowMuteIndicator(true);
    setTimeout(() => setShowMuteIndicator(false), 900);
  };

  const handleDownload = () => {
    triggerDownloadWithAd('reel', async () => {
      setIsDownloading(true);
      toast({ title: "Archiving Vibe", description: "Preparing high-fidelity reel node..." });
      try {
        await saveFileToDevice(videoUrl, `vimore_reel_${id}.mp4`);
        toast({ title: "Reel Saved", description: "Vibe archived to your device library." });
      } catch (e) {
        console.error("Binary Archival Failure", e);
      } finally {
        setIsDownloading(false);
      }
    });
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(10);
    setIsShareHubOpen(true);
  };

  const handleGiftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(30);
    openGiftHub(user as any);
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
    <div className="relative h-[100dvh] w-full flex items-center justify-center select-none bg-black overflow-hidden">
      {settings.isFreeMode ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-12 bg-zinc-950">
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full animate-pulse" />
            <Avatar className="h-32 w-32 border-4 border-primary shadow-2xl relative z-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <EyeOff className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Free Mode Active</span>
            </div>
            <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Video Node Suppressed</h3>
            <p className="text-xs text-white/40 uppercase font-bold tracking-widest max-w-xs">Text-only pulse active to conserve spatial energy.</p>
          </div>
        </div>
      ) : (
        <>
          <video
            key={videoUrl}
            ref={videoRef}
            src={videoUrl}
            className="h-full w-full object-cover"
            loop
            muted={isMuted}
            playsInline
            onClick={handleVideoTap}
            onDoubleClick={handleDoubleClick}
          />
          {!isPlaying && (
            <button
              onClick={handleStartPlay}
              className="absolute inset-0 z-40 flex items-center justify-center"
              aria-label="Play"
            >
              <div className="bg-black/40 backdrop-blur-sm rounded-full p-6 border border-white/20 shadow-2xl animate-in zoom-in duration-300">
                <Play className="h-14 w-14 text-white fill-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
              </div>
            </button>
          )}
        </>
      )}

      {settings.playbackQuality === 'pro-hd' && !settings.isFreeMode && (
        <div className="absolute top-20 right-6 z-[60] flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 shadow-lg animate-in fade-in zoom-in duration-500">
          <Gauge className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-[8px] font-black text-white uppercase tracking-widest">Pro-HD Active</span>
        </div>
      )}

      {isBoosted && (
        <div className="absolute top-20 left-6 z-[60] flex items-center gap-2 bg-gradient-to-r from-primary/80 to-accent/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-xl animate-in fade-in slide-in-from-left-4">
          <Zap className="h-3.5 w-3.5 text-white animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('boost_active')}</span>
        </div>
      )}

      {showPlayPauseIndicator && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in zoom-in fade-in duration-200 pointer-events-none z-[60]">
          <div className="bg-black/50 rounded-full p-5">
            {showPlayPauseIndicator === 'pause'
              ? <Pause className="h-10 w-10 text-white fill-white" />
              : <Play className="h-10 w-10 text-white fill-white" />
            }
          </div>
        </div>
      )}

      {showHeartAnimation && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in zoom-in fade-in duration-300 pointer-events-none z-[60]">
          <Heart className="h-24 w-24 text-primary fill-primary drop-shadow-[0_0_20px_rgba(153,64,229,0.8)] animate-pulse" />
        </div>
      )}

      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md p-4 rounded-full transition-all duration-300 pointer-events-none z-[60]",
        showMuteIndicator ? "opacity-100 scale-100" : "opacity-0 scale-50"
      )}>
        {isMuted ? <VolumeX className="h-8 w-8 text-white" /> : <Volume2 className="h-8 w-8 text-white" />}
      </div>

      <div className="absolute right-3 bottom-6 z-50 flex flex-col items-center gap-4">
        <div className="relative mb-1">
          <Link href={profileHref}>
            <Avatar className="h-11 w-11 border-2 border-white shadow-lg transition-transform active:scale-95">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
          </Link>
          <button className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary text-white rounded-full p-0.5 shadow-lg hover:scale-110 transition-transform ring-1 ring-black">
            <Plus className="h-2.5 w-2.5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button onClick={toggleLike} className="active:scale-90 transition-transform">
            <Heart className={cn("h-7 w-7 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]", isLiked ? "text-primary fill-primary" : "text-white")} />
          </button>
          <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{formatCount(localLikes)}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); openCommentHub(id); }}
            className="active:scale-90 transition-transform"
          >
            <MessageCircle className="h-7 w-7 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
          </button>
          <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{formatCount(comments)}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button className="active:scale-90 transition-transform">
            <Eye className="h-7 w-7 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
          </button>
          <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{formatCount(views)}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button onClick={handleDownload} disabled={isDownloading} className="active:scale-90 transition-transform">
            {isDownloading
              ? <Loader2 className="h-7 w-7 text-white animate-spin drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
              : <Download className="h-7 w-7 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
            }
          </button>
          <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Save</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <button onClick={handleShareClick} className="active:scale-90 transition-transform">
            <Share2 className="h-7 w-7 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
          </button>
          <span className="text-[11px] font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Share</span>
        </div>

        <button onClick={toggleMute} className="active:scale-90 transition-transform">
          {isMuted
            ? <VolumeX className="h-6 w-6 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
            : <Volume2 className="h-6 w-6 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
          }
        </button>

        {isMe && !isBoosted && (
          <BoostPortal nodeId={id} type="REEL">
            <button className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
              <Rocket className="h-6 w-6 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
            </button>
          </BoostPortal>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 pt-20 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none">
        <div className="max-w-[75%] space-y-3">
          {isMe && isBoosted && (
            <div className="bg-primary/20 backdrop-blur-md rounded-2xl p-3 border border-primary/20 space-y-2 pointer-events-auto">
              <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-white">
                <span className="flex items-center gap-1"><Rocket className="h-2 w-2" /> Reach Hub</span>
                <span>{boostCurrentViews?.toLocaleString() || 0} / {boostTargetViews?.toLocaleString()}</span>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(((boostCurrentViews || 0) / (boostTargetViews || 1)) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5 pointer-events-auto">
            <div className="flex items-center gap-2 relative">
              {isEligibleForGift && !isMe && (
                <button
                  onClick={handleGiftClick}
                  className="absolute -top-8 left-0 p-1.5 bg-primary rounded-full text-white shadow-lg z-50 border border-white/20 active:scale-90 transition-transform"
                >
                  <Gift className="h-3.5 w-3.5" />
                </button>
              )}
              <Link href={profileHref} className="text-lg font-black italic uppercase tracking-tighter text-white hover:text-primary transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center gap-1">
                @{user.username}
                {user.isVerified && <CheckCircle2 className="h-3.5 w-3.5 text-primary fill-primary" />}
              </Link>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
                <Sparkles className="h-2.5 w-2.5 text-accent fill-accent" />
                <span className="text-[8px] font-black text-white uppercase tracking-widest">{user.role}</span>
              </div>
            </div>
            <p className="text-[13px] sm:text-sm text-white/90 leading-tight line-clamp-2 font-medium drop-shadow-md">{caption}</p>
          </div>
        </div>
      </div>

      <ShareHub isOpen={isShareHubOpen} onClose={() => setIsShareHubOpen(false)} post={{ id, user, content: caption, image: music.cover }} />
    </div>
  );
}
