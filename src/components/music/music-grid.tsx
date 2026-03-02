"use client";

import { Play, Pause, MoreVertical, Heart, ThumbsDown, TrendingUp, Music2, Share2, Plus, Download, User, ListPlus, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMusic, Track, Album, Playlist } from "@/context/MusicContext";
import { usePosts } from "@/context/PostContext";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface MusicGridProps {
  type: "song" | "album" | "playlist" | "artist" | "hero";
  title?: string;
  items?: any[];
}

export function MusicGrid({ type, items = [], title }: MusicGridProps) {
  const { currentTrack, isPlaying, setTrack, togglePlay, setSelectedAlbum, setSelectedPlaylist, toggleLike, toggleUnlike, isTrackLiked, isTrackUnliked, isTrackDownloaded, simulateDownload, addToQueue, userPlaylists, openCreatePlaylist, addTrackToPlaylist, trackStats, playCollection, triggerDownloadWithAd } = useMusic();
  const { settings } = usePosts();
  const { toast } = useToast();
  const [downloadingIds, setDownloadingIds] = useState<Set<string | number>>(new Set());

  const handleShare = (item: any) => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/music/${type}/${item.id}` : '';
    navigator.clipboard.writeText(url);
    toast({ title: "Link Copied!", description: "Share the vibe with your community." });
  };

  const handleDownload = async (track: Track) => {
    if (isTrackDownloaded(track.id)) return;
    
    triggerDownloadWithAd('single', async () => {
      setDownloadingIds(prev => new Set(prev).add(track.id));
      toast({ title: "Sonic Download", description: `Fetching high-res audio for ${track.title}...` });
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      await simulateDownload(track);
      
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
      toast({ title: "Download Complete", description: `${track.title} is now available offline.` });
    });
  };

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const renderCard = (item: any, idx: number) => {
    if (!item) return null;
    
    const isCurrent = currentTrack?.id === item.id;
    const isLiked = isTrackLiked(item.id);
    const isUnliked = isTrackUnliked(item.id);
    const isDownloaded = isTrackDownloaded(item.id);
    const isDownloading = downloadingIds.has(item.id);
    const stats = trackStats[item.id] || { likes: item.likes || 0, unlikes: item.unlikes || 0 };
    
    const stableKey = `${type}-${item.id || idx}-${idx}`;

    if (type === "hero") {
      return (
        <div key={stableKey} className="relative w-full max-w-4xl aspect-video sm:h-[400px] rounded-[2rem] sm:rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl ring-1 ring-white/10">
          {!settings.isFreeMode ? (
            <Image src={item.cover} alt={item.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-105" />
          ) : (
            <div className="absolute inset-0 bg-secondary/20" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 sm:bottom-10 sm:left-10 sm:right-10 space-y-2 sm:space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-black text-white uppercase tracking-widest animate-pulse">#1 Trending Now</span>
              {isDownloaded && <CheckCircle2 className="h-3 w-3 text-green-400" />}
            </div>
            <h1 className="text-2xl sm:text-5xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg leading-none">{item.title}</h1>
            <Link href={`/profile/${item.artistUsername || 'arivera'}`} onClick={(e) => e.stopPropagation()}>
              <p className="text-sm sm:text-xl text-white/70 font-bold hover:text-white transition-colors underline-offset-4 hover:underline">{item.artist}</p>
            </Link>
            <div className="flex items-center gap-4 mt-2 sm:mt-4">
              <Button 
                size="lg" 
                className="rounded-full bg-white text-primary font-black px-6 sm:px-10 h-10 sm:h-14 hover:scale-105 transition-transform text-xs sm:base"
                onClick={() => { triggerHaptic(); isCurrent ? togglePlay() : setTrack(item); }}
              >
                {isCurrent && isPlaying ? <Pause className="mr-1 sm:mr-2 h-4 w-4 sm:h-6 sm:w-6 fill-current" /> : <Play className="mr-1 sm:mr-2 h-4 w-4 sm:h-6 sm:w-6 fill-current ml-1 sm:ml-2" />}
                {isCurrent && isPlaying ? "PAUSE" : "PLAY NOW"}
              </Button>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-white/10 text-white", isLiked && "text-red-500")}
                  onClick={(e) => { e.stopPropagation(); triggerHaptic(); toggleLike(item); }}
                >
                  <Heart className={cn("h-5 w-5 sm:h-7 sm:w-7", isLiked && "fill-current")} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn("h-10 w-10 sm:h-14 sm:w-14 rounded-full bg-white/10 text-white", isUnliked && "text-primary")}
                  onClick={(e) => { e.stopPropagation(); triggerHaptic(); toggleUnlike(item); }}
                >
                  <ThumbsDown className={cn("h-5 w-5 sm:h-7 sm:w-7", isUnliked && "fill-current")} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (type === "artist") {
      return (
        <Link key={stableKey} href={`/profile/${item.username || 'arivera'}`} className="inline-block w-[120px] sm:w-[160px] text-center space-y-3 group cursor-pointer shrink-0 snap-start">
          <div className="relative mx-auto h-24 w-24 sm:h-32 sm:w-32">
            <div className={cn(
              "absolute inset-0 bg-primary/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
              item.isLive && "opacity-100 animate-pulse bg-red-500/20"
            )} />
            <div className={cn(
              "relative h-full w-full rounded-full overflow-hidden border-2 sm:border-4 border-background transition-all duration-500",
              item.isLive ? "border-red-500" : "group-hover:border-primary"
            )}>
              <Image src={item.avatar} alt={item.name} fill className="object-cover" />
            </div>
            {item.isLive && (
              <span className="absolute -top-1 right-1 sm:right-2 bg-red-500 text-white text-[6px] sm:text-[8px] font-black uppercase px-1.5 sm:px-2 py-0.5 rounded-full ring-2 ring-background">LIVE</span>
            )}
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <h3 className="font-bold text-xs sm:text-sm truncate group-hover:text-primary transition-colors">{item.name}</h3>
            <p className="text-[8px] sm:text-[9px] text-muted-foreground font-black uppercase tracking-widest">{item.role}</p>
          </div>
        </Link>
      );
    }

    const cardWidth = type === "playlist" ? "w-[200px] sm:w-[240px]" : "w-[160px] sm:w-[200px]";
    
    const handleCardClick = () => {
      triggerHaptic();
      if (type === "album") {
        setSelectedAlbum(item as Album);
      } else if (type === "playlist") {
        setSelectedPlaylist(item as Playlist);
      } else if (type === "song") {
        setTrack(item as Track);
      }
    };

    return (
      <div 
        key={stableKey} 
        className={cn("inline-block group cursor-pointer shrink-0 snap-mandatory snap-start", cardWidth)}
        onClick={handleCardClick}
      >
        <div className="relative aspect-square mb-3 sm:mb-4">
          <div className="absolute -left-1 sm:-left-2 top-2 bottom-2 w-2 sm:w-3 bg-white/20 backdrop-blur-md rounded-l-lg z-10 border-r border-white/30" />
          
          <div className="relative h-full w-full rounded-[0.75rem] sm:rounded-[1rem] overflow-hidden shadow-xl ring-1 ring-white/10 group-hover:-translate-y-1 sm:group-hover:-translate-y-2 transition-transform duration-500">
            {!settings.isFreeMode ? (
              <Image src={item.cover} alt={item.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            ) : (
              <div className="absolute inset-0 bg-secondary/30 flex items-center justify-center">
                <Music2 className="h-10 w-10 text-muted-foreground/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
            
            {isDownloaded && !isDownloading && (
              <div className="absolute top-2 left-2 bg-green-500 text-white p-1 rounded-full shadow-lg z-20">
                <CheckCircle2 className="h-3 w-3" />
              </div>
            )}

            <div className={cn(
              "absolute inset-0 bg-primary/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center",
              (isCurrent || (type === 'playlist' && item.songs?.some((s: Track) => s.id === currentTrack?.id))) && "opacity-100"
            )}>
              <Button 
                size="icon" 
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary text-white shadow-2xl transition-transform active:scale-90"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic();
                  if (type === 'playlist') {
                    playCollection(item.songs);
                  } else {
                    isCurrent ? togglePlay() : setTrack(item);
                  }
                }}
              >
                {isCurrent && isPlaying ? <Pause className="h-5 w-5 sm:h-6 sm:w-6 fill-current" /> : <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current ml-1" />}
              </Button>
            </div>

            <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {type !== "album" && type !== "playlist" && (
                <>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-8 w-8 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40", isLiked && "text-red-500")}
                    onClick={(e) => { e.stopPropagation(); triggerHaptic(); toggleLike(item); }}
                  >
                    <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn("h-8 w-8 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40", isUnliked && "text-primary")}
                    onClick={(e) => { e.stopPropagation(); triggerHaptic(); toggleUnlike(item); }}
                  >
                    <ThumbsDown className={cn("h-4 w-4", isUnliked && "fill-current")} />
                  </Button>
                </>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                  {type === "song" && (
                    <>
                      <DropdownMenuItem className="gap-2 cursor-pointer font-bold" onClick={(e) => { e.stopPropagation(); triggerHaptic(); addToQueue(item); toast({ title: "Added", description: "Added to your playback queue." }); }}>
                        <Plus className="h-4 w-4" /> Add to Queue
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2 cursor-pointer font-bold" onClick={(e) => { e.stopPropagation(); triggerHaptic(); toggleLike(item); toast({ title: "Saved", description: "Saved to your library." }); }}>
                        <Heart className="h-4 w-4" /> Save to Library
                      </DropdownMenuItem>
                      
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="gap-2 cursor-pointer font-bold">
                          <ListPlus className="h-4 w-4" /> Add to Playlist
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="w-56 rounded-xl p-2">
                          <DropdownMenuItem className="gap-2 cursor-pointer font-bold text-primary" onClick={(e) => { e.stopPropagation(); openCreatePlaylist(item); }}>
                            <Plus className="h-4 w-4" /> Create New Playlist
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {userPlaylists.map(p => (
                            <DropdownMenuItem key={p.id} className="cursor-pointer font-medium" onClick={(e) => { e.stopPropagation(); addTrackToPlaylist(p.id, item); toast({ title: "Added to " + p.title }); }}>
                              {p.title}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  
                  {type === 'playlist' && (
                    <DropdownMenuItem className="gap-2 cursor-pointer font-bold" onClick={(e) => { e.stopPropagation(); playCollection(item.songs); }}>
                      <Play className="h-4 w-4" /> Play All
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem 
                    className="gap-2 cursor-pointer font-bold" 
                    disabled={isDownloading || isDownloaded || type === 'playlist'}
                    onClick={(e) => { e.stopPropagation(); triggerHaptic(); handleDownload(item); }}
                  >
                    {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : isDownloaded ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Download className="h-4 w-4 sm:h-5 sm:w-5" />}
                    {isDownloaded ? "Downloaded" : "Download"}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer font-bold" onClick={(e) => { e.stopPropagation(); triggerHaptic(); handleShare(item); }}>
                    <Share2 className="h-4 w-4" /> Share
                  </DropdownMenuItem>
                  <DropdownMenuItem className="gap-2 cursor-pointer font-bold" onClick={(e) => { e.stopPropagation(); toast({ title: "Navigation", description: "Taking you to details." }); }}>
                    <User className="h-4 w-4" /> View Details
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        
        <div className="space-y-0.5 sm:space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-xs sm:text-sm truncate group-hover:text-primary transition-colors">{item.title}</h3>
            {type === "song" && (
              <span className="text-[9px] font-black text-primary/60 shrink-0">{(stats.likes / 1000).toFixed(1)}K</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] text-muted-foreground font-black uppercase tracking-widest">
            {type === "song" && (
              <>
                <Link href={`/profile/${item.artistUsername || 'arivera'}`} onClick={(e) => e.stopPropagation()} className="hover:text-primary transition-colors truncate max-w-[80px]">
                  {item.artist}
                </Link>
                <span>•</span>
                <span>{item.streams}</span>
              </>
            )}
            {type === "album" && (
              <>
                <Link href={`/profile/${item.artistUsername || 'arivera'}`} onClick={(e) => e.stopPropagation()} className="hover:text-primary transition-colors truncate max-w-[80px]">
                  {item.artist}
                </Link>
                <span>•</span>
                <span>{item.tracks} Tracks</span>
              </>
            )}
            {type === "playlist" && (
              <>
                <span className="truncate max-w-[120px]">By <Link href={`/profile/${item.creator || 'arivera'}`} onClick={(e) => e.stopPropagation()} className="text-primary hover:underline">@{item.creator || 'vimore'}</Link></span>
                <span>•</span>
                <span>{item.songs?.length || '0'} Tracks</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-4 sm:space-y-6">
      {title && (
        <div className="flex items-center justify-between px-1 sm:px-2">
          <h2 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter">{title}</h2>
          <Button variant="ghost" className="text-primary font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-primary/5 rounded-full h-8 px-3">See All</Button>
        </div>
      )}
      <div className={cn(
        "pb-4 sm:pb-6 px-1 sm:px-2",
        type === "hero" ? "flex justify-center" : "flex gap-4 sm:gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory whitespace-nowrap"
      )}>
        {items.map((item, idx) => renderCard(item, idx))}
      </div>
    </section>
  );
}
