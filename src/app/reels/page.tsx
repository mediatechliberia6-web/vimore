"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  ArrowLeft,
  UserPlus,
  Check,
  Download,
  Link as LinkIcon,
  Search,
  Music2,
  ChevronRight,
  Send,
  Loader2,
  Film,
  PlusSquare,
  X,
  Users,
  WifiOff,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn, saveFileToDevice } from "@/lib/utils";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useToast } from "@/hooks/use-toast";
import type { Post } from "@/context/PostContext";

type ReelFeedItem = Post & {
  isCampaignReel?: boolean;
  campaignTitle?: string;
  actionUrl?: string;
  actionLabel?: string;
};

const SHARE_PLATFORMS = [
  { id: "facebook", label: "Facebook", bg: "bg-[#1877F2]", emoji: "📘" },
  { id: "messenger", label: "Messenger", bg: "bg-gradient-to-br from-blue-600 to-purple-500", emoji: "💬" },
  { id: "whatsapp", label: "WhatsApp", bg: "bg-[#25D366]", emoji: "📱" },
  { id: "instagram", label: "Instagram", bg: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400", emoji: "📸" },
  { id: "tiktok", label: "TikTok", bg: "bg-black border border-white/20", emoji: "🎵" },
  { id: "twitter", label: "X / Twitter", bg: "bg-black border border-white/20", emoji: "🐦" },
  { id: "telegram", label: "Telegram", bg: "bg-[#2CA5E0]", emoji: "✈️" },
];

function MessagePickerSheet({
  reel,
  onClose,
  onBack,
}: {
  reel: Post;
  onClose: () => void;
  onBack: () => void;
}) {
  const { connections, sendChatMessage, incrementShareCount, friendUsernames } = usePosts();
  const { triggerHaptic } = useMusic();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sharingTo, setSharingTo] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());

  const filteredConnections = useMemo(
    () =>
      connections.filter(
        (c) =>
          !("isGroup" in c && c.isGroup) &&
          friendUsernames.has(c.username) &&
          (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.username.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [connections, searchQuery, friendUsernames]
  );

  const handleSend = async (recipientId: string, recipientName: string) => {
    if (sharingTo || sentTo.has(recipientId)) return;
    triggerHaptic(20);
    setSharingTo(recipientId);
    await sendChatMessage(recipientId, {
      type: "video",
      mediaUrl: reel.videoUrl,
      text: `Shared a reel from @${reel.user.username}: ${reel.content.slice(0, 80)}${reel.content.length > 80 ? "..." : ""}`,
    });
    incrementShareCount?.(reel.$id);
    setSentTo((prev) => new Set(prev).add(recipientId));
    setSharingTo(null);
    toast({ title: "Reel sent", description: `To ${recipientName}` });
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[210] flex items-end animate-in fade-in duration-200">
      <div className="w-full bg-[#141414] rounded-t-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/10">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h3 className="text-white font-black flex-1">Share to Message</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white/10 border-white/10 text-white placeholder:text-white/40 rounded-xl focus-visible:ring-primary/50"
            />
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {filteredConnections.map((conn) => {
            const isSent = sentTo.has(conn.$id);
            const isSending = sharingTo === conn.$id;
            return (
              <button
                key={conn.$id}
                onClick={() => handleSend(conn.$id, conn.name)}
                disabled={isSending}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/8 transition-colors text-left"
              >
                <Avatar className="h-11 w-11 border-2 border-white/10 flex-shrink-0">
                  <AvatarImage src={conn.avatar} />
                  <AvatarFallback>{conn.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{conn.name}</p>
                  <p className="text-white/50 text-xs truncate">@{conn.username}</p>
                </div>
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all",
                    isSent
                      ? "bg-green-500/20"
                      : "bg-primary/20 hover:bg-primary/40"
                  )}
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : isSent ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Send className="w-4 h-4 text-primary" />
                  )}
                </div>
              </button>
            );
          })}
          {filteredConnections.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10">
              <p className="text-center text-white/30 text-sm">No friends found</p>
              <p className="text-center text-white/20 text-xs">You can only share to friends</p>
            </div>
          )}
        </div>
        {sentTo.size > 0 && (
          <div className="p-4 border-t border-white/10">
            <button
              onClick={onClose}
              className="w-full py-3 bg-primary rounded-2xl text-white font-black text-sm"
            >
              Done · Sent to {sentTo.size} {sentTo.size === 1 ? "person" : "people"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ReelShareSheet({ reel, onClose }: { reel: Post; onClose: () => void }) {
  const { addStory, incrementShareCount } = usePosts();
  const { triggerHaptic, triggerDownloadWithAd } = useMusic();
  const { toast } = useToast();
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showMessagePicker, setShowMessagePicker] = useState(false);

  const handleShareToStory = () => {
    triggerHaptic(25);
    addStory({
      type: "video",
      videoUrl: reel.videoUrl,
      image: reel.image || reel.user.avatar,
      background: "bg-black",
      textOverlays: [
        {
          text: `@${reel.user.username}`,
          x: 50,
          y: 85,
          color: "#FFFFFF",
        },
      ],
    });
    incrementShareCount?.(reel.$id);
    toast({ title: "Added to your story" });
    onClose();
  };

  const handleDownload = async () => {
    if (isDownloading || !reel.videoUrl) return;
    triggerHaptic(20);
    setIsDownloading(true);
    try {
      await saveFileToDevice(reel.videoUrl, `vimore_reel_${reel.$id}.mp4`);
      toast({ title: "Reel downloaded" });
    } catch {
      toast({ title: "Download failed", variant: "destructive" });
    } finally {
      setIsDownloading(false);
      onClose();
    }
  };

  const handleCopyLink = async () => {
    triggerHaptic(10);
    const link = `https://vimore.app/reels/${reel.$id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({ title: "Link copied" });
    } catch {
      toast({ title: "Could not copy link", variant: "destructive" });
    }
  };

  const handleExternalShare = (platform: (typeof SHARE_PLATFORMS)[0]) => {
    triggerHaptic(15);
    const link = `https://vimore.app/reels/${reel.$id}`;
    const text = encodeURIComponent(
      `Check this out on ViMore: ${reel.content.slice(0, 60)}`
    );
    const encodedLink = encodeURIComponent(link);

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`,
      messenger: `fb-messenger://share?link=${encodedLink}`,
      whatsapp: `https://wa.me/?text=${text}%20${encodedLink}`,
      instagram: `https://www.instagram.com/`,
      tiktok: `https://www.tiktok.com/`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedLink}`,
      telegram: `https://t.me/share/url?url=${encodedLink}&text=${text}`,
    };

    const url = urls[platform.id];
    if (url) window.open(url, "_blank");
    incrementShareCount?.(reel.$id);
  };

  if (showMessagePicker) {
    return (
      <MessagePickerSheet
        reel={reel}
        onClose={onClose}
        onBack={() => setShowMessagePicker(false)}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[200] flex items-end animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full bg-[#141414] rounded-t-3xl animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-4 py-2">
          <h3 className="text-white font-black text-base">Share Reel</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="mx-4 mb-4 flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
          <div className="w-14 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 relative">
            {reel.image ? (
              <Image src={reel.image} alt="" fill className="object-cover" sizes="56px" />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center">
                <Music2 className="w-5 h-5 text-white/40" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                <Film className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm">@{reel.user.username}</p>
            <p className="text-white/50 text-xs mt-0.5 line-clamp-2">{reel.content}</p>
          </div>
        </div>

        <div className="px-4 pb-3">
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">Share to</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {SHARE_PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handleExternalShare(platform)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-xl",
                    platform.bg
                  )}
                >
                  <span role="img">{platform.emoji}</span>
                </div>
                <span className="text-white/50 text-[9px] font-bold w-12 text-center truncate">
                  {platform.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 pb-3 grid grid-cols-3 gap-2">
          <button
            onClick={() => setShowMessagePicker(true)}
            className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <span className="text-white/70 text-[10px] font-bold">Message</span>
          </button>

          <button
            onClick={handleShareToStory}
            className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <PlusSquare className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-white/70 text-[10px] font-bold">Your Story</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              {isDownloading ? (
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
              ) : (
                <Download className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <span className="text-white/70 text-[10px] font-bold">Download</span>
          </button>
        </div>

        <div className="px-4 pb-8">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              {copiedLink ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <LinkIcon className="w-4 h-4 text-white/60" />
              )}
            </div>
            <span className="text-white/80 text-sm font-bold flex-1 text-left">
              {copiedLink ? "Link copied!" : "Copy link"}
            </span>
            <ChevronRight className="w-4 h-4 text-white/20" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ReelItem({
  reel,
  index,
  isMuted,
  isActive,
  onVideoRef,
  onContainerRef,
  onToggleMute,
  onOpenShare,
  onOpenComment,
}: {
  reel: ReelFeedItem;
  index: number;
  isMuted: boolean;
  isActive: boolean;
  onVideoRef: (el: HTMLVideoElement | null) => void;
  onContainerRef: (el: HTMLDivElement | null) => void;
  onToggleMute: () => void;
  onOpenShare: () => void;
  onOpenComment: () => void;
}) {
  const {
    currentUser,
    isPostLiked,
    toggleLikePost,
    isFriend,
    isRequestSent,
    sendFriendRequest,
    cancelFriendRequest,
    followingUsernames,
  } = usePosts();
  const { triggerHaptic } = useMusic();
  const [showHeart, setShowHeart] = useState(false);
  const lastTapRef = useRef(0);

  const isLiked = isPostLiked(reel.$id);
  const isOwn = currentUser?.username === reel.user.username;
  const isFollowing = followingUsernames.has(reel.user.username);
  const isFriendWith = isFriend(reel.user.username);
  const requestSent = isRequestSent(reel.user.username);

  const handleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      triggerHaptic(30);
      if (!isLiked) toggleLikePost(reel.$id);
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 900);
    }
    lastTapRef.current = now;
  };

  const handleFollowToggle = () => {
    triggerHaptic(20);
    if (requestSent) cancelFriendRequest(reel.user.username);
    else sendFriendRequest(reel.user.username);
  };

  const displayLikes = reel.likes;
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString());

  return (
    <div
      ref={onContainerRef}
      data-index={index}
      className="relative w-full h-full flex-shrink-0 snap-start bg-black overflow-hidden"
      style={{ height: "100svh" }}
    >
      <video
        ref={onVideoRef}
        src={reel.videoUrl}
        poster={reel.image}
        loop
        playsInline
        muted={isMuted}
        preload="metadata"
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/30 pointer-events-none" />

      <div className="absolute inset-0 z-10" onClick={handleTap} />

      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <Heart className="w-32 h-32 text-white fill-white drop-shadow-2xl animate-in zoom-in-50 fade-in duration-200" />
        </div>
      )}

      <button
        onClick={onToggleMute}
        className="absolute top-20 right-4 z-30 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-white" />
        ) : (
          <Volume2 className="w-4 h-4 text-white" />
        )}
      </button>

      {reel.isCampaignReel && (
        <div className="absolute top-20 left-4 z-30">
          <span className="bg-primary/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full">
            Sponsored
          </span>
        </div>
      )}

      <div className="absolute right-3 bottom-28 z-30 flex flex-col items-center gap-5">
        <div className="relative">
          <Link href={reel.isCampaignReel ? "/" : `/profile/${reel.user.username}`}>
            <Avatar className="h-11 w-11 border-2 border-white shadow-xl">
              <AvatarImage src={reel.user.avatar} />
              <AvatarFallback>{reel.user.name[0]}</AvatarFallback>
            </Avatar>
          </Link>
          {!isOwn && !reel.isCampaignReel && (
            <button
              onClick={handleFollowToggle}
              className={cn(
                "absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90",
                isFriendWith || isFollowing
                  ? "bg-white"
                  : requestSent
                  ? "bg-white/60"
                  : "bg-primary"
              )}
            >
              {isFriendWith || isFollowing ? (
                <Check className="w-2.5 h-2.5 text-primary" />
              ) : (
                <UserPlus className="w-2.5 h-2.5 text-white" />
              )}
            </button>
          )}
        </div>

        {!reel.isCampaignReel && (
          <>
            <button
              onClick={() => {
                triggerHaptic(20);
                toggleLikePost(reel.$id);
              }}
              className="flex flex-col items-center gap-0.5 active:scale-75 transition-transform"
            >
              <Heart
                className={cn(
                  "w-7 h-7 transition-all",
                  isLiked ? "text-rose-500 fill-rose-500" : "text-white"
                )}
              />
              <span className="text-white text-xs font-bold drop-shadow">{fmt(displayLikes)}</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic(10);
                onOpenComment();
              }}
              className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
            >
              <MessageCircle className="w-7 h-7 text-white" />
              <span className="text-white text-xs font-bold drop-shadow">{fmt(reel.comments)}</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic(10);
                onOpenShare();
              }}
              className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform"
            >
              <Share2 className="w-6 h-6 text-white" />
              <span className="text-white text-xs font-bold drop-shadow">{fmt(reel.shares)}</span>
            </button>
          </>
        )}

        <div
          className={cn(
            "w-9 h-9 rounded-full bg-black border-[3px] border-white/40 flex items-center justify-center shadow-lg",
            isActive && "animate-spin [animation-duration:4s]"
          )}
        >
          <Music2 className="w-4 h-4 text-white" />
        </div>
      </div>

      <div className="absolute bottom-6 left-3 right-16 z-30 pointer-events-none">
        {reel.isCampaignReel ? (
          <>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">
              ViMore Official
            </p>
            <p className="text-white font-black text-base drop-shadow mb-1">
              {reel.campaignTitle}
            </p>
            <p className="text-white/80 text-sm leading-snug line-clamp-2 drop-shadow-sm mb-3">
              {reel.content}
            </p>
            {reel.actionUrl && reel.actionLabel && (
              <a
                href={reel.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="pointer-events-auto inline-flex items-center gap-2 bg-primary text-white text-sm font-black px-4 py-2 rounded-full shadow-lg active:scale-95 transition-transform"
              >
                {reel.actionLabel}
              </a>
            )}
          </>
        ) : (
          <>
            <Link
              href={`/profile/${reel.user.username}`}
              className="flex items-center gap-2 mb-1.5 pointer-events-auto w-fit"
            >
              <span className="text-white font-black text-sm drop-shadow">@{reel.user.username}</span>
              {reel.user.isVerified && (
                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-2.5 h-2.5 text-white" />
                </div>
              )}
            </Link>
            <p className="text-white/90 text-sm leading-snug line-clamp-2 drop-shadow-sm">
              {reel.content}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <Music2 className="w-3 h-3 text-white/60 flex-shrink-0" />
              <p className="text-white/60 text-xs truncate">Original Sound · {reel.user.name}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ReelsPage() {
  const { posts, campaigns, openCommentHub, fetchComments, friendUsernames, followingUsernames, settings, isOffline } = usePosts();

  const reels = useMemo(() => posts.filter((p) => p.videoUrl), [posts]);

  const reelFeed = useMemo<ReelFeedItem[]>(() => {
    const videoCampaigns = campaigns
      .filter((c: any) => c.is_active && c.placement === 'reel' && c.type === "video" && c.media_url)
      .map((c) => ({
        $id: c.$id,
        user: {
          name: "ViMore Official",
          username: "vimore",
          avatar: "/icon.svg",
          isVerified: true,
          role: "Global Node",
        },
        content: c.content || c.title,
        time: c.timestamp || "Now",
        likes: c.impressions || 0,
        unlikes: 0,
        comments: 0,
        shares: c.clicks || 0,
        views: c.impressions || 0,
        videoUrl: c.media_url,
        isCampaignReel: true,
        campaignTitle: c.title,
        actionUrl: c.action_url,
        actionLabel: c.action_label,
      } as ReelFeedItem));

    if (videoCampaigns.length === 0) return reels as ReelFeedItem[];

    const result: ReelFeedItem[] = [];
    let reelIdx = 0;
    let campIdx = 0;

    // First ad: after the first 2 reels
    for (let i = 0; i < 2 && reelIdx < reels.length; i++) {
      result.push(reels[reelIdx++] as ReelFeedItem);
    }
    if (reelIdx > 0) {
      result.push(videoCampaigns[campIdx++ % videoCampaigns.length]);
    }

    // Subsequent ads: after every 5 reels
    while (reelIdx < reels.length) {
      for (let i = 0; i < 5 && reelIdx < reels.length; i++) {
        result.push(reels[reelIdx++] as ReelFeedItem);
      }
      result.push(videoCampaigns[campIdx++ % videoCampaigns.length]);
    }
    return result;
  }, [reels, campaigns]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [shareReel, setShareReel] = useState<Post | null>(null);
  const [reelTab, setReelTab] = useState<"foryou" | "following">("foryou");

  const followingReelFeed = useMemo<ReelFeedItem[]>(() => {
    const friendSet = new Set([...(friendUsernames || []), ...(followingUsernames || [])]);
    return reels
      .filter((r) => friendSet.has(r.user.username))
      .map((r) => r as ReelFeedItem);
  }, [reels, friendUsernames, followingUsernames]);

  const activeFeed = reelTab === "following" ? followingReelFeed : reelFeed;

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setVideoRef = useCallback(
    (index: number) => (el: HTMLVideoElement | null) => {
      videoRefs.current[index] = el;
    },
    []
  );

  const setContainerRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      containerRefs.current[index] = el;
    },
    []
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const idx = parseInt(target.dataset.index || "0", 10);
          const video = videoRefs.current[idx];
          if (!video) return;
          if (entry.isIntersecting) {
            setActiveIndex(idx);
            video.muted = isMuted;
            video.play().catch(() => {});
          } else {
            video.pause();
            video.currentTime = 0;
          }
        });
      },
      { threshold: 0.6 }
    );

    containerRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [activeFeed.length, isMuted]);

  useEffect(() => {
    const video = videoRefs.current[activeIndex];
    if (video) video.muted = isMuted;
  }, [isMuted, activeIndex]);

  const handleOpenComment = useCallback(
    (postId: string) => {
      openCommentHub(postId);
      fetchComments(postId);
    },
    [openCommentHub, fetchComments]
  );

  if (settings.isFreeMode) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-8 text-center z-50">
        <Link href="/" className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div className="h-20 w-20 bg-white/5 rounded-[2rem] flex items-center justify-center border border-dashed border-white/20 mb-6">
          <Film className="h-10 w-10 text-white/30" />
        </div>
        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-3">Page Unavailable</h2>
        <p className="text-white/50 text-sm font-medium max-w-xs leading-relaxed">
          Can&apos;t access this page because Free Mode is on. Turn off Free Mode in settings to watch Reels.
        </p>
      </div>
    );
  }

  if (activeFeed.length === 0 && reelTab === "foryou") {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4">
        <Link
          href="/"
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <Film className="w-16 h-16 text-white/20" />
        <p className="text-white/60 font-bold text-lg">No reels yet</p>
        <p className="text-white/30 text-sm">Videos posted by creators will appear here</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {isOffline && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-amber-500/20 backdrop-blur-sm border-b border-amber-500/30 px-4 py-1.5 flex items-center justify-center gap-2 pointer-events-none">
          <WifiOff className="h-3 w-3 text-amber-400 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Offline — showing saved reels</span>
        </div>
      )}
      <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
        <div className="flex items-center justify-between px-4 pt-12 pb-3">
          <Link
            href="/"
            className="pointer-events-auto w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex items-center gap-5 pointer-events-auto">
            <button
              onClick={() => { setReelTab("foryou"); setActiveIndex(0); }}
              className={cn("font-black text-sm pb-0.5 border-b-2 transition-all", reelTab === "foryou" ? "text-white border-white" : "text-white/40 border-transparent")}
            >
              For You
            </button>
            <button
              onClick={() => { setReelTab("following"); setActiveIndex(0); }}
              className={cn("font-black text-sm pb-0.5 border-b-2 transition-all", reelTab === "following" ? "text-white border-white" : "text-white/40 border-transparent")}
            >
              Following
            </button>
          </div>
          <div className="w-9" />
        </div>
      </div>

      <div
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {activeFeed.length === 0 && reelTab === "following" ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-8">
            <Users className="w-16 h-16 text-white/20" />
            <p className="text-white/60 font-bold text-lg">No reels from friends yet</p>
            <p className="text-white/30 text-sm">Add friends or follow people to see their reels here</p>
          </div>
        ) : (
          activeFeed.map((reel, index) => (
            <ReelItem
              key={`${reel.$id}-${index}`}
              reel={reel}
              index={index}
              isMuted={isMuted}
              isActive={activeIndex === index}
              onVideoRef={setVideoRef(index)}
              onContainerRef={setContainerRef(index)}
              onToggleMute={() => setIsMuted((m) => !m)}
              onOpenShare={() => !reel.isCampaignReel && setShareReel(reel)}
              onOpenComment={() => !reel.isCampaignReel && handleOpenComment(reel.$id)}
            />
          ))
        )}
      </div>

      {shareReel && (
        <ReelShareSheet reel={shareReel} onClose={() => setShareReel(null)} />
      )}
    </div>
  );
}
