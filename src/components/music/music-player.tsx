
"use client";

import { useState } from "react";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Maximize2, 
  ChevronDown,
  AudioLines,
  Heart,
  ThumbsDown,
  Download,
  Share2,
  MoreHorizontal,
  X,
  Send,
  MessageCircle,
  Loader2,
  CheckCircle2,
  Gift
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMusic } from "@/context/MusicContext";
import { useNotifications } from "@/context/NotificationContext";
import { usePosts } from "@/context/PostContext";
import { cn, parseFollowerCount } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const QUICK_REACTIONS = ["🔥", "❤️", "🙌", "💯", "🤯", "🚀"];

export function MusicPlayer() {
  const pathname = usePathname();
  const { toast } = useToast();
  const { openGiftHub } = usePosts();
  const { 
    currentTrack, isPlaying, isExpanded, progress, volume, reactions, trackStats,
    togglePlay, nextTrack, prevTrack, setIsExpanded, setProgress, setVolume, addReaction, addComment, clearPlayer, toggleLike, toggleUnlike, isTrackLiked, isTrackUnliked, simulateDownload, isTrackDownloaded, triggerDownloadWithAd, triggerHaptic
  } = useMusic();

  const { addSignal, currentUser } = useNotifications();

  const [commentInput, setCommentInput] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [preMuteVolume, setPreMuteVolume] = useState(80);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!currentTrack) return null;

  const stats = trackStats[currentTrack.id] || { likes: 0, unlikes: 0 };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = (progress / 100) * currentTrack.duration;

  const handleSendComment = () => {
    if (!commentInput.trim()) return;
    addComment(commentInput);
    setCommentInput("");
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(preMuteVolume);
      setIsMuted(false);
    } else {
      setPreMuteVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    if (val > 0) setIsMuted(false);
    else setIsMuted(true);
  };

  const handleDownloadClick = async () => {
    if (isTrackDownloaded(currentTrack.id)) return;
    
    triggerDownloadWithAd('single', async () => {
      setIsDownloading(true);
      toast({ title: "Sonic Download", description: `Fetching high-res audio for ${currentTrack.title}...` });
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      await simulateDownload(currentTrack);
      
      setIsDownloading(false);
      toast({ title: "Music Note Saved", description: "Vibe saved to your identity notes." });

      addSignal({
        type: 'SONIC',
        title: 'Track Available Offline',
        content: `**${currentTrack.title}** by ${currentTrack.artist} has been successfully cached.`,
        image: currentTrack.cover
      });
    });
  };

  const handleGiftClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(30);
    openGiftHub({ name: currentTrack.artist, username: currentTrack.artistUsername || 'artist', avatar: currentTrack.cover } as any);
  };

  const isLiked = isTrackLiked(currentTrack.id);
  const isUnliked = isTrackUnliked(currentTrack.id);
  const isDownloaded = isTrackDownloaded(currentTrack.id);
  const isEligibleForGift = parseFollowerCount(currentTrack.artistFollowers) > 1000;
  const isOwner = currentTrack.artistUsername === currentUser.username;

  if (!isExpanded) {
    const isHome = pathname === "/";
    const isMusic = pathname === "/music";
    let topOffset = "top-[61px]";
    if (isHome) topOffset = "top-[117px]";
    if (isMusic) topOffset = "top-[61px]";

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
          <div className="flex-1 min-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold truncate text-foreground">{currentTrack.title}</p>
              {isDownloaded && <CheckCircle2 className="h-2.5 w-2.5 text-green-500" />}
              <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
                <AudioLines className="h-2 w-2 text-primary animate-pulse" />
                <span className="text-[8px] font-black text-primary uppercase">Live</span>
              </div>
            </div>
            <Link href={`/profile/${currentTrack.artistUsername || 'arivera'}`} onClick={(e) => e.stopPropagation()}>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest truncate hover:text-primary hover:underline">
                {currentTrack.artist}
              </p>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              size="icon" variant="ghost" className="h-10 w-10 text-primary"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
            </Button>
            <Button 
              size="icon" variant="ghost" className="h-10 w-10 text-muted-foreground hidden sm:flex"
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

  return (
    <div className="fixed inset-0 z-[200] bg-background flex flex-col animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
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
          <Button 
            variant="ghost" size="icon" 
            className={cn("rounded-full bg-secondary/20", isDownloaded && "text-green-500")} 
            title="Download"
            onClick={handleDownloadClick}
            disabled={isDownloading}
          >
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : isDownloaded ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4 sm:h-5 sm:w-5" />}
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
        <div className="flex flex-col lg:flex-row items-start justify-center p-6 sm:p-12 gap-8 lg:gap-16 max-w-7xl mx-auto w-full min-h-full">
          <div className="relative w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[500px] aspect-square group shrink-0 lg:sticky lg:top-12 mx-auto lg:mx-0">
            <div className={cn(
              "absolute inset-0 bg-primary/30 blur-[100px] rounded-full transition-opacity duration-1000",
              isPlaying ? "opacity-100" : "opacity-0"
            )} />
            <div className="relative h-full w-full rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-white/10">
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

          <div className="flex-1 w-full max-w-[500px] flex flex-col gap-6 sm:gap-10 mx-auto lg:mx-0">
            <div className="flex items-start justify-between">
              <div className="space-y-1 sm:space-y-2">
                <h2 className="text-3xl sm:text-5xl font-black italic uppercase tracking-tighter leading-tight sm:leading-none">{currentTrack.title}</h2>
                <div className="flex items-center gap-3 relative">
                  {isEligibleForGift && !isOwner && (
                    <button 
                      onClick={handleGiftClick}
                      className="absolute -top-8 left-0 p-1.5 bg-primary rounded-full text-white shadow-lg animate-shake-vibe z-50 border border-white/20"
                    >
                      <Gift className="h-4 w-4" />
                    </button>
                  )}
                  <Link href={`/profile/${currentTrack.artistUsername || 'arivera'}`} onClick={() => setIsExpanded(false)}>
                    <p className="text-xl sm:text-2xl text-primary font-bold hover:underline">{currentTrack.artist}</p>
                  </Link>
                  {isDownloaded && <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] font-black tracking-widest uppercase">Music Note</Badge>}
                </div>
              </div>
              <div className="flex flex-col gap-3 items-center">
                <div className="flex flex-col items-center gap-1">
                  <Button 
                    variant="ghost" size="icon" 
                    className={cn("h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-secondary/20 transition-all", isLiked ? "text-red-500 bg-red-500/10" : "hover:text-red-500")}
                    onClick={() => toggleLike(currentTrack)}
                  >
                    <Heart className={cn("h-5 w-5 sm:h-7 sm:w-7", isLiked && "fill-current")} />
                  </Button>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {(stats.likes / 1000).toFixed(1)}K
                  </span>
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <Button 
                    variant="ghost" size="icon" 
                    className={cn("h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-secondary/20 transition-all", isUnliked ? "text-primary bg-primary/10" : "hover:text-destructive")}
                    onClick={() => toggleUnlike(currentTrack)}
                  >
                    <ThumbsDown className={cn("h-5 w-5 sm:h-7 sm:w-7", isUnliked && "fill-current")} />
                  </Button>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {stats.unlikes}
                  </span>
                </div>

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
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground" onClick={handleMuteToggle}>
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
                <Slider value={[volume]} max={100} onValueChange={(val) => handleVolumeChange(val[0])} className="w-full" />
              </div>
            </div>

            <div className="space-y-4 pt-10 border-t border-white/10">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Fan Reactions</h3>
                </div>
                <span className="text-[10px] font-black text-muted-foreground bg-secondary/20 px-2 py-0.5 rounded-full">{currentTrack.comments?.length || 0}</span>
              </div>

              <ScrollArea className="h-[300px] w-full rounded-2xl bg-black/5 dark:bg-white/5 p-4">
                <div className="space-y-6">
                  {currentTrack.comments && currentTrack.comments.length > 0 ? (
                    currentTrack.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4 group animate-in slide-in-from-bottom-2 duration-300">
                        <Link href={`/profile/${comment.user === 'John Doe' ? 'johndoe_creative' : (comment.user === 'Alex Rivera' ? 'arivera' : (comment.user === 'Sarah Chen' ? 'schen_dev' : 'mstone'))}`} onClick={() => setIsExpanded(false)}>
                          <Avatar className="h-10 w-10 border-2 border-primary/10 shrink-0 hover:scale-105 transition-transform">
                            <AvatarImage src={comment.avatar} />
                            <AvatarFallback>{comment.user[0]}</AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <Link href={`/profile/${comment.user === 'John Doe' ? 'johndoe_creative' : (comment.user === 'Alex Rivera' ? 'arivera' : (comment.user === 'Sarah Chen' ? 'schen_dev' : 'mstone'))}`} onClick={() => setIsExpanded(false)}>
                              <span className="text-xs font-bold hover:underline cursor-pointer">{comment.user}</span>
                            </Link>
                            <span className="text-[9px] text-muted-foreground font-medium">{comment.time}</span>
                          </div>
                          <p className="text-sm text-foreground/80 leading-relaxed bg-white/50 dark:bg-black/20 p-3 rounded-2xl rounded-tl-none border border-white/10">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40">
                      <MessageCircle className="h-12 w-12 mb-2" />
                      <p className="text-xs font-bold uppercase tracking-widest">No reactions yet</p>
                      <p className="text-[10px] font-medium">Be the first to share the vibe!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="relative group pt-4 mb-10 lg:mb-0">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarImage src="https://picsum.photos/seed/me/100/100" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </div>
                <Input 
                  placeholder="Drop a reaction..." 
                  className="pl-16 pr-12 h-14 bg-white/10 border-white/5 rounded-[1.5rem] focus-visible:ring-primary focus-visible:bg-white/20 transition-all text-sm placeholder:text-muted-foreground/60"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                />
                <Button 
                  size="icon" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-primary text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
                  onClick={handleSendComment}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
