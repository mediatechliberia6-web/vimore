"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { saveCache, loadCache, pinMediaInSW, OFFLINE_KEYS } from "@/lib/offline-cache";
import { useRouter } from "next/navigation";
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
  Play,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNetwork } from "@/context/NetworkContext";
import { getAdaptivePreview } from "@/lib/adaptive-media";
import { Input } from "@/components/ui/input";
import { cn, saveFileToDevice } from "@/lib/utils";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/context/LanguageContext";
import type { Post } from "@/context/PostContext";

type ReelFeedItem = Post & {
  isCampaignReel?: boolean;
  campaignTitle?: string;
  actionUrl?: string;
  actionLabel?: string;
};

/* ── Effect ID → CSS filter map (mirrors create/page.tsx EFFECTS array) ── */
const EFFECT_FILTERS: Record<string, { filter: string; special?: 'mirror' | 'vignette' }> = {
  none:      { filter: 'none' },
  grayscale: { filter: 'grayscale(100%)' },
  noir:      { filter: 'grayscale(100%) contrast(160%) brightness(0.75)' },
  sepia:     { filter: 'sepia(100%)' },
  warm:      { filter: 'sepia(50%) saturate(160%) hue-rotate(-10deg)' },
  cool:      { filter: 'saturate(130%) hue-rotate(200deg) brightness(1.1)' },
  beauty:    { filter: 'blur(0.6px) brightness(1.1) saturate(1.08) contrast(0.92)' },
  film:      { filter: 'sepia(15%) contrast(145%) brightness(0.88) saturate(75%)' },
  mirror:    { filter: 'none', special: 'mirror' },
  vignette:  { filter: 'none', special: 'vignette' },
  natural:   { filter: 'brightness(1.05) contrast(1.08) saturate(1.12)' },
  smooth:    { filter: 'blur(0.6px) brightness(1.08) contrast(0.9) saturate(1.05)' },
  glow:      { filter: 'brightness(1.25) contrast(0.85) saturate(1.15) blur(0.4px)' },
  hdr:       { filter: 'contrast(1.4) saturate(1.5) brightness(0.95)' },
  sunset:    { filter: 'sepia(0.2) hue-rotate(-15deg) saturate(1.5) brightness(1.1)' },
  citynight: { filter: 'brightness(0.85) contrast(1.25) saturate(1.2) hue-rotate(200deg)' },
  rosegold:  { filter: 'sepia(0.3) hue-rotate(-20deg) saturate(1.4) brightness(1.08)' },
  arctic:    { filter: 'hue-rotate(180deg) saturate(0.9) brightness(1.15) contrast(1.05)' },
  candy:     { filter: 'saturate(1.8) brightness(1.1) hue-rotate(330deg) contrast(1.1)' },
  moody:     { filter: 'brightness(0.78) contrast(1.35) saturate(0.9)' },
  dewy:      { filter: 'brightness(1.18) saturate(1.1) contrast(0.88) blur(0.3px)' },
  studio:    { filter: 'brightness(1.1) contrast(1.15) saturate(0.95)' },
  classic:   { filter: 'sepia(0.12) contrast(1.1) saturate(0.9) brightness(1.02)' },
  deep:      { filter: 'contrast(1.5) brightness(0.82) saturate(1.25)' },
  grunge:    { filter: 'contrast(1.45) saturate(0.55) brightness(0.78)' },
  peach:     { filter: 'sepia(0.12) hue-rotate(340deg) saturate(1.35) brightness(1.06)' },
  frozen:    { filter: 'hue-rotate(185deg) saturate(1.3) brightness(1.18) contrast(1.08)' },
  pop:       { filter: 'contrast(1.25) saturate(2.0) brightness(1.05)' },
  haze:      { filter: 'brightness(1.28) contrast(0.75) saturate(0.8) blur(0.5px)' },
  chrome:    { filter: 'grayscale(0.3) contrast(1.3) brightness(1.05) saturate(0.7)' },
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
  const { t } = useTranslation();
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
          <h3 className="text-white font-black flex-1">{t('reel_share_title')}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder={t('reel_search_people')}
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
              <p className="text-center text-white/30 text-sm">{t('reel_no_friends')}</p>
              <p className="text-center text-white/20 text-xs">{t('reel_no_friends_desc')}</p>
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
  const { tier: netTier } = useNetwork();
  const { toast } = useToast();
  const { t } = useTranslation();
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
    const link = `https://vimore.cfd/reels/${reel.$id}`;
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
    const link = `https://vimore.cfd/reels/${reel.$id}`;
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
          <h3 className="text-white font-black text-base">{t('reel_share_title')}</h3>
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
              <Image src={getAdaptivePreview(reel.image, 'thumb', netTier) || reel.image} alt="" fill className="object-cover" sizes="56px" />
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
          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-3">{t('reel_share_to')}</p>
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
            <span className="text-white/70 text-[10px] font-bold">{t('reel_message_btn')}</span>
          </button>

          <button
            onClick={handleShareToStory}
            className="flex flex-col items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <PlusSquare className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-white/70 text-[10px] font-bold">{t('reel_story_btn')}</span>
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
            <span className="text-white/70 text-[10px] font-bold">{t('reel_download_btn')}</span>
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
              {copiedLink ? t('reel_link_copied') : t('reel_copy_link')}
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
  const router = useRouter();
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
  const { tier: netTier } = useNetwork();
  const { triggerHaptic } = useMusic();
  const { toast } = useToast();
  const [showHeart, setShowHeart] = useState(false);
  const [showSoundSheet, setShowSoundSheet] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  // On Lite, default to paused so the Play overlay shows (tap-to-stream)
  const [isPlaying, setIsPlaying] = useState(() => netTier !== 'lite');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seekFlash, setSeekFlash] = useState<'left' | 'right' | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  // Bug 3 fix: local optimistic like count so tapping like is instant
  const [localLikes, setLocalLikes] = useState(reel.likes);
  const lastTapRef = useRef(0);
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bug 2 fix: audio element for selected-sound playback
  const soundAudioRef = useRef<HTMLAudioElement | null>(null);

  const combinedVideoRef = useCallback((el: HTMLVideoElement | null) => {
    setVideoElement(el);
    onVideoRef(el);
  }, [onVideoRef]);

  useEffect(() => {
    if (!videoElement) return;
    const handleTimeUpdate = () => setCurrentTime(videoElement.currentTime);
    const handleLoadedMetadata = () => setDuration(videoElement.duration || 0);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    return () => {
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
    };
  }, [videoElement]);

  const isLiked = isPostLiked(reel.$id);
  const isOwn = currentUser?.username === reel.user.username;
  const isFollowing = followingUsernames.has(reel.user.username);
  const soundId = (reel as Record<string, unknown>).sound_id as string | undefined;
  const soundTitle = (reel as Record<string, unknown>).sound_title as string | undefined;
  const soundArtist = (reel as Record<string, unknown>).sound_artist as string | undefined;
  const soundStartTime = Number((reel as Record<string, unknown>).sound_start_time ?? 0);

  // Bug 1 fix: read stored effect and build CSS filter/transform for playback
  const rawEffects = (reel as Record<string, unknown>).effects_applied as string[] | undefined;
  const effectId = rawEffects?.[0] ?? 'none';
  const effectDef = EFFECT_FILTERS[effectId] ?? EFFECT_FILTERS.none;
  const videoFilter = effectDef.filter !== 'none' ? effectDef.filter : undefined;
  const videoMirror = effectDef.special === 'mirror';
  const showVignetteOverlay = effectDef.special === 'vignette';

  // Bug 2 fix: play/pause selected-sound audio in sync with the active reel
  useEffect(() => {
    if (!soundId) return;
    // Build the sound file URL — same pattern as the recording studio
    const isReelMedia = soundId.startsWith('reel_media:');
    const soundUrl = isReelMedia
      ? `/api/file/${encodeURIComponent('reel_media')}/${encodeURIComponent(soundId.replace('reel_media:', ''))}`
      : `/api/file/${encodeURIComponent('sounds')}/${encodeURIComponent(soundId)}`;

    if (isActive) {
      const audio = new Audio(soundUrl);
      audio.currentTime = soundStartTime;
      audio.muted = isMuted;
      audio.loop = true;
      audio.play().catch(() => {});
      soundAudioRef.current = audio;
    } else {
      if (soundAudioRef.current) {
        soundAudioRef.current.pause();
        soundAudioRef.current = null;
      }
    }

    return () => {
      if (soundAudioRef.current) {
        soundAudioRef.current.pause();
        soundAudioRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, soundId]);

  // Sync sound audio mute state with global mute toggle
  useEffect(() => {
    if (soundAudioRef.current) soundAudioRef.current.muted = isMuted;
  }, [isMuted]);

  // Sync sound audio play/pause with the video element's play/pause
  useEffect(() => {
    if (!soundAudioRef.current) return;
    if (isPlaying) soundAudioRef.current.play().catch(() => {});
    else soundAudioRef.current.pause();
  }, [isPlaying]);

  const handleDownload = async () => {
    if (isDownloading || !reel.videoUrl) return;
    triggerHaptic(20);
    setIsDownloading(true);
    try {
      await saveFileToDevice(reel.videoUrl, `vimore_reel_${reel.$id}.mp4`);
      toast({ title: 'Reel saved to device' });
    } catch {
      toast({ title: 'Download failed', variant: 'destructive' });
    } finally {
      setIsDownloading(false);
    }
  };
  const isFriendWith = isFriend(reel.user.username);
  const requestSent = isRequestSent(reel.user.username);

  const handleTap = (e: React.MouseEvent) => {
    const now = Date.now();
    const x = e.clientX;
    const width = (e.currentTarget as HTMLElement).clientWidth;

    if (now - lastTapRef.current < 300) {
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }
      if (x < width * 0.35) {
        triggerHaptic(20);
        if (videoElement) {
          videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
        }
        setSeekFlash('left');
        setTimeout(() => setSeekFlash(null), 700);
      } else if (x > width * 0.65) {
        triggerHaptic(20);
        if (videoElement) {
          videoElement.currentTime = Math.min(videoElement.duration || 0, videoElement.currentTime + 10);
        }
        setSeekFlash('right');
        setTimeout(() => setSeekFlash(null), 700);
      } else {
        triggerHaptic(30);
        if (!isLiked) {
          setLocalLikes(prev => prev + 1);
          toggleLikePost(reel.$id);
        }
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 900);
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
      singleTapTimerRef.current = setTimeout(() => {
        if (videoElement) {
          if (videoElement.paused) {
            videoElement.play().catch(() => {});
          } else {
            videoElement.pause();
          }
        }
        singleTapTimerRef.current = null;
      }, 300);
    }
  };

  const handleFollowToggle = () => {
    triggerHaptic(20);
    if (requestSent) cancelFriendRequest(reel.user.username);
    else sendFriendRequest(reel.user.username);
  };

  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString());

  return (
    <div
      ref={onContainerRef}
      data-index={index}
      className="relative w-full h-full flex-shrink-0 snap-start bg-black overflow-hidden"
      style={{ height: "100svh" }}
    >
      <video
        ref={combinedVideoRef}
        src={reel.videoUrl}
        poster={getAdaptivePreview(reel.image, 'fullscreen', netTier) || reel.image}
        loop
        playsInline
        muted={isMuted}
        preload="none"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: videoFilter,
          transform: videoMirror ? 'scaleX(-1)' : undefined,
        }}
      />

      {/* Bug 1 fix: vignette effect overlay */}
      {showVignetteOverlay && (
        <div
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.72) 100%)' }}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-black/30 pointer-events-none" />

      <div className="absolute inset-0 z-10" onClick={handleTap} />

      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <Heart className="w-32 h-32 text-white fill-white drop-shadow-2xl animate-in zoom-in-50 fade-in duration-200" />
        </div>
      )}

      {seekFlash === 'left' && (
        <div className="absolute left-0 top-0 bottom-0 w-1/3 z-20 flex items-center justify-center pointer-events-none animate-in fade-in duration-100">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-1.5">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
            <span className="text-white text-xs font-black">10s</span>
          </div>
        </div>
      )}
      {seekFlash === 'right' && (
        <div className="absolute right-0 top-0 bottom-0 w-1/3 z-20 flex items-center justify-center pointer-events-none animate-in fade-in duration-100">
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-1.5">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
            <span className="text-white text-xs font-black">10s</span>
          </div>
        </div>
      )}

      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center animate-in zoom-in-75 fade-in duration-200">
            <Play className="w-8 h-8 text-white fill-white ml-1" />
          </div>
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
              <AvatarImage src={getAdaptivePreview(reel.user.avatar, 'avatar', netTier) || reel.user.avatar} />
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
                // Bug 3 fix: update local count immediately so the UI is instant
                setLocalLikes(prev => Math.max(0, prev + (isLiked ? -1 : 1)));
                toggleLikePost(reel.$id);
              }}
              className="flex flex-col items-center gap-0.5 active:scale-75 transition-transform"
            >
              <Heart
                className={cn(
                  "w-7 h-7",
                  isLiked ? "text-rose-500 fill-rose-500" : "text-white"
                )}
              />
              <span className="text-white text-xs font-bold drop-shadow">{fmt(localLikes)}</span>
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

            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex flex-col items-center gap-0.5 active:scale-90 transition-transform disabled:opacity-50"
            >
              {isDownloading
                ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                : <Download className="w-6 h-6 text-white" />}
              <span className="text-white text-xs font-bold drop-shadow">Save</span>
            </button>
          </>
        )}

        <button
          onClick={() => {
            triggerHaptic(15);
            if (soundId) {
              setShowSoundSheet(true);
            } else {
              router.push('/reels/create');
            }
          }}
          className={cn(
            "w-9 h-9 rounded-full bg-black border-[3px] border-white/40 flex items-center justify-center shadow-lg active:scale-90 transition-transform",
            isActive && "animate-spin [animation-duration:4s]"
          )}
        >
          <Music2 className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="absolute bottom-10 left-3 right-16 z-30 pointer-events-none">
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
            <button
              className="flex items-center gap-1.5 mt-2 pointer-events-auto active:opacity-70"
              onClick={() => { triggerHaptic(10); if (soundId) setShowSoundSheet(true); }}
            >
              <Music2 className="w-3 h-3 text-white/60 flex-shrink-0 animate-spin [animation-duration:6s]" />
              <p className="text-white/60 text-xs truncate">
                {soundTitle ? `${soundTitle} · ${soundArtist || reel.user.name}` : `Original Sound · ${reel.user.name}`}
              </p>
            </button>
          </>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-30 px-3 pb-2 pt-1">
        <div className="flex items-center gap-2 mb-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (videoElement) {
                if (videoElement.paused) videoElement.play().catch(() => {});
                else videoElement.pause();
              }
            }}
            className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
          >
            {isPlaying ? (
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            ) : (
              <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
            )}
          </button>
          <div
            className="flex-1 h-1 bg-white/30 rounded-full relative cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              if (!videoElement || !duration) return;
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              videoElement.currentTime = ratio * duration;
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              const bar = e.currentTarget as HTMLElement;
              bar.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (e.buttons !== 1) return;
              e.stopPropagation();
              if (!videoElement || !duration) return;
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              videoElement.currentTime = ratio * duration;
            }}
          >
            <div
              className="h-full bg-white rounded-full transition-none"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md -translate-x-1/2"
              style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <span className="text-white/60 text-[9px] font-bold tabular-nums flex-shrink-0">
            {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* ── Use This Sound sheet ── */}
      {showSoundSheet && soundId && (
        <div
          className="fixed inset-0 z-[300] flex flex-col justify-end"
          onClick={() => setShowSoundSheet(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-[#0d0d1a] rounded-t-[2rem] px-6 pt-4 pb-10 animate-in slide-in-from-bottom duration-300"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-6" />
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/40 to-purple-800/40 flex items-center justify-center animate-spin [animation-duration:6s]">
                <Music2 className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-black text-base truncate">{soundTitle || 'Original Sound'}</p>
                <p className="text-white/50 text-sm truncate">{soundArtist || reel.user.name}</p>
                <p className="text-white/30 text-xs mt-0.5">Tap to use in your reel</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowSoundSheet(false);
                router.push(`/reels/create?sound_id=${encodeURIComponent(soundId)}`);
              }}
              className="w-full py-4 bg-primary rounded-2xl text-white font-black text-base flex items-center justify-center gap-3 active:scale-95 transition-transform"
            >
              <Music2 className="w-5 h-5" />
              Use this sound
            </button>
            <button
              onClick={() => setShowSoundSheet(false)}
              className="w-full py-3 mt-2 text-white/40 text-sm font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ReelsPage() {
  const { campaigns, posts, openCommentHub, fetchComments, friendUsernames, followingUsernames, followingUserIds, settings, isOffline, fetchReels, postCountOverrides } = usePosts();
  const { tier: pageTier } = useNetwork();

  const [cachedReels] = useState<Post[]>(() => loadCache<Post>(OFFLINE_KEYS.REELS));
  const [reelsList, setReelsList] = useState<Post[]>([]);
  const [reelsPhase, setReelsPhase] = useState<'connections' | 'global'>('connections');
  const [reelsConnCursor, setReelsConnCursor] = useState<string | null>(null);
  const [reelsGlobalCursor, setReelsGlobalCursor] = useState<string | null>(null);
  const [hasMoreReels, setHasMoreReels] = useState(true);
  const [isLoadingReels, setIsLoadingReels] = useState(false);
  const isLoadingReelsRef = useRef(false);
  const reelsPhaseRef = useRef<'connections' | 'global'>('connections');
  const reelsConnCursorRef = useRef<string | null>(null);
  const reelsGlobalCursorRef = useRef<string | null>(null);

  useEffect(() => {
    if (isLoadingReelsRef.current) return;
    isLoadingReelsRef.current = true;
    setIsLoadingReels(true);
    const connIds = [...followingUserIds].slice(0, 100);
    fetchReels({ phase: 'connections', connIds, connCursor: null, globalCursor: null })
      .then(({ posts, phase, connCursor, globalCursor, hasMore }) => {
        setReelsList(posts);
        setReelsPhase(phase);
        setReelsConnCursor(connCursor);
        setReelsGlobalCursor(globalCursor);
        setHasMoreReels(hasMore);
        reelsPhaseRef.current = phase;
        reelsConnCursorRef.current = connCursor;
        reelsGlobalCursorRef.current = globalCursor;
      })
      .catch(() => {
        // Network failed — fall back to cached reels if offline
        if (isOffline && cachedReels.length > 0) setReelsList(cachedReels);
      })
      .finally(() => {
        setIsLoadingReels(false);
        isLoadingReelsRef.current = false;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchReels]);

  // When offline with no live reels, inject cached reels
  useEffect(() => {
    if (isOffline && reelsList.length === 0 && !isLoadingReels && cachedReels.length > 0) {
      setReelsList(cachedReels);
    }
  }, [isOffline, reelsList.length, isLoadingReels, cachedReels]);

  // Save live reels to cache + pin video URLs as reels are loaded / watched
  useEffect(() => {
    if (isOffline || reelsList.length === 0) return;
    const toCache = reelsList.slice(0, 15).map(r => ({
      $id: r.$id, user: r.user, content: r.content,
      videoUrl: r.videoUrl, image: r.image,
      likes: r.likes, unlikes: r.unlikes,
      comments: r.comments, views: r.views, time: r.time,
    }));
    saveCache(OFFLINE_KEYS.REELS, toCache, 15);
  }, [reelsList, isOffline]);

  const reels = useMemo(() => reelsList.map(r => {
    const ov = postCountOverrides[r.$id];
    if (!ov) return r;
    return { ...r, ...(ov.likes !== undefined ? { likes: ov.likes } : {}), ...(ov.unlikes !== undefined ? { unlikes: ov.unlikes } : {}), ...(ov.comments !== undefined ? { comments: ov.comments } : {}), ...(ov.shares !== undefined ? { shares: ov.shares } : {}) };
  }), [reelsList, postCountOverrides]);

  const reelFeed = useMemo<ReelFeedItem[]>(() => {
    const videoCampaignsRaw = campaigns
      .filter((c: any) => c.is_active && c.placement === 'reel' && c.type === "video" && c.media_url)
      .sort(() => Math.random() - 0.5);
    const videoCampaigns = videoCampaignsRaw.map((c) => ({
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

    // Boosted reels — shuffled randomly each session so users see different ones
    const boostedReels: ReelFeedItem[] = [...(posts || [])
      .filter((p: any) => p.isBoosted && p.type === 'reel')]
      .sort(() => Math.random() - 0.5) as ReelFeedItem[];

    if (videoCampaigns.length === 0 && boostedReels.length === 0) return reels as ReelFeedItem[];

    const result: ReelFeedItem[] = [];
    let reelIdx = 0;
    let campIdx = 0;
    let boostedIdx = 0;
    let countSinceLast = 0;

    // First 2 reels, then first campaign slot
    for (let i = 0; i < 2 && reelIdx < reels.length; i++) {
      result.push(reels[reelIdx++] as ReelFeedItem);
    }
    if (reelIdx > 0 && videoCampaigns.length > 0) {
      result.push(videoCampaigns[campIdx++ % videoCampaigns.length]);
    }

    // Subsequent: after every 5 reels → campaign + boosted reel (both randomized)
    while (reelIdx < reels.length) {
      result.push(reels[reelIdx++] as ReelFeedItem);
      countSinceLast++;

      if (countSinceLast >= 5) {
        countSinceLast = 0;
        if (videoCampaigns.length > 0) {
          result.push(videoCampaigns[campIdx++ % videoCampaigns.length]);
        }
        if (boostedReels.length > 0) {
          result.push(boostedReels[boostedIdx % boostedReels.length]);
          boostedIdx++;
        }
      }
    }
    return result;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reels, campaigns, posts]);

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
            // Lite Mode: do NOT auto-stream the reel. Show poster + Play button.
            if (pageTier !== 'lite') {
              video.play().catch(() => {});
            } else {
              try { video.pause(); } catch {}
            }
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
  }, [activeFeed.length, isMuted, pageTier]);

  useEffect(() => {
    const video = videoRefs.current[activeIndex];
    if (video) video.muted = isMuted;
  }, [isMuted, activeIndex]);

  // Pin the current reel's video in SW for offline playback
  useEffect(() => {
    if (isOffline) return;
    const reel = activeFeed[activeIndex];
    if (reel?.videoUrl) pinMediaInSW([reel.videoUrl]);
    // Also pre-pin the next reel
    const next = activeFeed[activeIndex + 1];
    if (next?.videoUrl) pinMediaInSW([next.videoUrl]);
  }, [activeIndex, activeFeed, isOffline]);

  useEffect(() => {
    const feedLength = activeFeed.filter(r => !r.isCampaignReel).length;
    if (activeIndex >= feedLength - 3 && hasMoreReels && !isLoadingReelsRef.current) {
      isLoadingReelsRef.current = true;
      setIsLoadingReels(true);
      const connIds = [...followingUserIds].slice(0, 100);
      fetchReels({
        phase: reelsPhaseRef.current,
        connIds,
        connCursor: reelsConnCursorRef.current,
        globalCursor: reelsGlobalCursorRef.current,
      }).then(({ posts, phase, connCursor, globalCursor, hasMore }) => {
        setReelsList(prev => {
          const existingIds = new Set(prev.map(r => r.$id));
          return [...prev, ...posts.filter(r => !existingIds.has(r.$id))];
        });
        setReelsPhase(phase);
        setReelsConnCursor(connCursor);
        setReelsGlobalCursor(globalCursor);
        setHasMoreReels(hasMore);
        reelsPhaseRef.current = phase;
        reelsConnCursorRef.current = connCursor;
        reelsGlobalCursorRef.current = globalCursor;
      }).finally(() => {
        setIsLoadingReels(false);
        isLoadingReelsRef.current = false;
      });
    }
  }, [activeIndex, activeFeed, hasMoreReels, fetchReels, followingUserIds]);

  const handleOpenComment = useCallback(
    (postId: string) => {
      openCommentHub(postId);
      fetchComments(postId);
    },
    [openCommentHub, fetchComments]
  );

  if (isLoadingReels && reelsList.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-4">
        <Link href="/" className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <Loader2 className="w-12 h-12 text-white/40 animate-spin" />
        <p className="text-white/40 font-bold text-sm uppercase tracking-widest">Loading Reels</p>
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
          <>
            {activeFeed.map((reel, index) => (
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
            ))}
            {isLoadingReels && reelsList.length > 0 && (
              <div className="h-[100svh] w-full flex-shrink-0 snap-start bg-black flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-white/30 animate-spin" />
              </div>
            )}
          </>
        )}
      </div>

      {shareReel && (
        <ReelShareSheet reel={shareReel} onClose={() => setShareReel(null)} />
      )}
    </div>
  );
}
