"use client";

import { useState, useEffect, use, useMemo, useRef } from "react";
import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { PostCard } from "@/components/post/post-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMusic } from "@/context/MusicContext";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  MoreHorizontal, 
  Volume2, 
  Play, 
  UserPlus, 
  UserMinus, 
  MessageCircle, 
  Zap, 
  Languages, 
  UserCheck, 
  Clapperboard, 
  CheckCircle2,
  Flag,
  Gem,
  Loader2,
  ShieldCheck,
  Share2,
  EyeOff,
  UserRoundPlus,
  UserRoundCheck,
  UserRoundX,
  X,
  Check
} from "lucide-react";
import Link from "next/link";
import { usePosts, User } from "@/context/PostContext";
import { useNotifications } from "@/context/NotificationContext";
import { aiTranslatePostAction } from "@/app/actions/ai";
import Image from "next/image";
import { cn, parseFollowerCount } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTranslation } from "@/context/LanguageContext";

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const { currentUser, posts, connections, isFriend, isRequestSent, isRequestReceived, sendFriendRequest, confirmFriendRequest, cancelFriendRequest, unfriendUser, isSubscribed, subscribeToCreator, cancelSubscription, fetchProfileByUsername, settings, followerUsernames, friendUsernames } = usePosts();
  const { currentTrack, isExpanded, triggerHaptic } = useMusic();
  const { addSignal } = useNotifications();
  const { t } = useTranslation();
  const router = useRouter();
  
  const [displayUser, setDisplayUser] = useState<User | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  const isMe = username === currentUser.username;
  const isPlayerActive = currentTrack && !isExpanded;
  
  const { toast } = useToast();
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [translatedBio, setTranslatedBio] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [deviceLanguage, setDeviceLanguage] = useState<string | null>(null);
  
  const [confirmUser, setConfirmUser] = useState<any | null>(null);
  const [confirmType, setConfirmType] = useState<"unfriend" | "cancel">("unfriend");

  const amIFriend = isFriend(username);
  const sent = isRequestSent(username);
  const received = isRequestReceived(username);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') setDeviceLanguage(window.navigator.language.split('-')[0]);
  }, []);

  useEffect(() => {
    const syncProfile = async () => {
      setIsLoadingProfile(true);
      const profile = await fetchProfileByUsername(username);
      if (profile) setDisplayUser(profile);
      else setDisplayUser(null);
      setIsLoadingProfile(false);
    };
    syncProfile();
  }, [username, fetchProfileByUsername]);

  useEffect(() => { if (isMe) router.replace('/profile'); }, [isMe, router]);

  const isEliteCreator = useMemo(() => {
    if (!displayUser) return false;
    return parseFollowerCount(displayUser.followers) >= 10000;
  }, [displayUser]);

  const handleHandshakeAction = () => {
    if (!displayUser) return;
    if (amIFriend) { 
      triggerHaptic(15); 
      setConfirmType("unfriend"); 
      setConfirmUser(displayUser); 
    } else if (sent) {
      triggerHaptic(10);
      setConfirmType("cancel");
      setConfirmUser(displayUser);
    } else if (received) {
      triggerHaptic(25);
      confirmFriendRequest(username);
    } else {
      triggerHaptic(20);
      sendFriendRequest(username);
    }
  };

  const handleSubscribeHandshake = async () => {
    if (isSubscribing || amISubscribed || !displayUser) return;
    setIsSubscribing(true);
    triggerHaptic(50);

    try {
      await subscribeToCreator(username, 20);
      addSignal({ type: 'SYSTEM', title: 'Premium Pulse Active', content: `You are now subscribed to **${displayUser.name}**. **-20 Diamonds** synced.`, avatar: displayUser.avatar });
      addSignal({ type: 'SOCIAL', title: 'New VIP Node', content: `**${currentUser.name}** just subscribed!`, avatar: currentUser.avatar });
      toast({ title: "Loyalty Loop Active" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Handshake Failed", description: e.message });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleTranslateBio = async () => {
    if (!displayUser?.bio) return;
    if (translatedBio) { setTranslatedBio(null); return; }
    triggerHaptic(); setIsTranslating(true);
    try { const res = await aiTranslatePostAction({ postContent: displayUser.bio, targetLanguage: deviceLanguage || "en" }); setTranslatedBio(res.translation); }
    catch (e) { toast({ variant: "destructive", description: "Translation failed" }); }
    finally { setIsTranslating(false); }
  };

  const togglePlayIntro = () => {
    if (!displayUser?.introUrl) { toast({ title: "No Intro", description: `${displayUser?.name || 'User'} hasn't uploaded a sonic signature yet.` }); return; }
    triggerHaptic(15);
    if (isPlayingIntro) { audioRef.current?.pause(); setIsPlayingIntro(false); return; }
    if (!audioRef.current) { audioRef.current = new Audio(displayUser.introUrl); audioRef.current.onended = () => setIsPlayingIntro(false); }
    audioRef.current.play().catch(e => { toast({ variant: "destructive", description: "Failed to stream sonic signature." }); });
    isPlayingIntro = true;
    setIsPlayingIntro(true);
  };

  const confirmAction = () => {
    if (confirmUser) { 
      triggerHaptic(30); 
      const user = { ...confirmUser }; 
      document.body.style.pointerEvents = 'auto'; 
      setConfirmUser(null); 
      if (confirmType === "unfriend") unfriendUser(user.username);
      else cancelFriendRequest(user.username);
    }
  };

  const userPosts = useMemo(() => posts.filter(p => p.user.username === username), [posts, username]);
  const userReels = useMemo(() => userPosts.filter(p => p.videoUrl), [userPosts]);
  const mediaPosts = useMemo(() => userPosts.filter(p => p.image || p.images?.length), [userPosts]);

  // Unified Pulse Metrics
  const combinedFollowers = useMemo(() => {
    if (!displayUser) return 0;
    return parseFollowerCount(displayUser.followers) + (amIFriend ? 1 : 0);
  }, [displayUser, amIFriend]);

  const combinedFollowing = useMemo(() => {
    if (!displayUser) return 0;
    const base = typeof displayUser.following === 'number' ? displayUser.following : parseFollowerCount(displayUser.following);
    return base + (amIFriend ? 1 : 0);
  }, [displayUser, amIFriend]);

  if (isLoadingProfile) {
    return <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4"><Loader2 className="h-10 w-10 animate-spin text-primary" /><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fetching Node Vault...</p></div>;
  }

  if (!displayUser) {
    return <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-6"><div className="h-20 w-20 bg-secondary/30 rounded-2xl flex items-center justify-center opacity-20"><Zap className="h-10 w-10" /></div><div className="space-y-2"><h2 className="text-2xl font-black italic uppercase tracking-tighter">Node Not Materialized</h2><p className="text-muted-foreground text-sm max-w-xs uppercase font-bold">This identity signature does not exist.</p></div><Link href="/"><Button className="bg-primary rounded-xl font-black uppercase text-[10px] h-12 px-8">Return to Hub</Button></Link></div>;
  }

  const amISubscribed = isSubscribed(username);

  let btnLabel = t('friends_add_friend');
  let Icon = UserRoundPlus;
  let variant: "default" | "secondary" | "outline" = "default";

  if (amIFriend) {
    btnLabel = "Friends";
    Icon = UserRoundCheck;
    variant = "secondary";
  } else if (sent) {
    btnLabel = t('friends_request_sent');
    Icon = Check;
    variant = "outline";
  } else if (received) {
    btnLabel = t('friends_confirm').split(' ')[0];
    Icon = UserPlus;
    variant = "default";
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-background flex justify-center">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_360px] gap-8 px-0 md:px-4">
        <aside className={cn("hidden md:block sticky h-screen border-r border-border/50 transition-all duration-300", isPlayerActive ? "top-16" : "top-0")}><MainNav /></aside>
        <main className={cn("w-full bg-white dark:bg-card min-h-screen shadow-sm transition-all duration-300", isPlayerActive ? "pt-[64px]" : "pt-0")}>
          <header className="sticky top-0 z-50 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-b border-border h-14 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3"><Link href="/"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button></Link><div className="flex items-center gap-1"><span className="font-bold text-lg truncate">{displayUser.name}</span>{displayUser.isVerified && <CheckCircle2 className="h-4 w-4 text-primary fill-primary text-white" />}</div></div>
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="h-5 w-5" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
              {!isMe && <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive" onClick={() => toast({ title: "Report Sent" })}><Flag className="h-4 w-4" /> Report Node</DropdownMenuItem>}
              <DropdownMenuItem className="gap-2" onClick={() => { triggerHaptic(); navigator.clipboard.writeText(window.location.href); toast({ title: "Link Copied" }); }}><Share2 className="h-4 w-4" /> Share Profile</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
          </header>
          <div className="relative">
            <div className="relative h-48 sm:h-64 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 overflow-hidden">
              {settings.isFreeMode ? <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center"><EyeOff className="h-10 w-10 text-muted-foreground/20" /></div> : <Image src={displayUser.cover || `https://picsum.photos/seed/cover_${username}/1200/400`} alt="Cover" fill className="object-cover dark:brightness-75" />}
            </div>
            <div className="px-4 pb-4">
              <div className="relative inline-block -mt-16 sm:-mt-24 ml-0 sm:ml-2"><Avatar className="w-32 h-32 sm:w-44 sm:h-44 border-4 border-white dark:border-card shadow-xl ring-2 ring-primary/5"><AvatarImage src={displayUser.avatar} /><AvatarFallback>{displayUser.name[0]}</AvatarFallback></Avatar></div>
              <div className="mt-2 space-y-1 px-1">
                <div className="flex items-center flex-wrap justify-between gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2"><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{displayUser.name}</h1><Button variant="ghost" size="sm" className={cn("h-7 px-2 rounded-full gap-1.5 font-bold text-[11px] transition-all", isPlayingIntro ? "bg-primary text-white scale-105" : "bg-secondary/40")} onClick={togglePlayIntro}>{isPlayingIntro ? <Volume2 className="h-3.5 w-3.5 animate-pulse" /> : <Play className="h-3.5 w-3.5" />} Intro</Button></div>
                    <div className="flex items-center gap-6 py-2">
                      <div className="flex flex-col items-start"><span className="font-bold text-lg leading-none">{amIFriend ? 1 : 0}</span><span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Friends</span></div>
                      <div className="flex flex-col items-start"><span className="font-bold text-lg leading-none">{combinedFollowers.toLocaleString()}</span><span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Followers</span></div>
                      <div className="flex flex-col items-start"><span className="font-bold text-lg leading-none">{combinedFollowing.toLocaleString()}</span><span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Following</span></div>
                    </div>
                  </div>
                  {isEliteCreator && !isMe && (
                    <Dialog>
                      <DialogTrigger asChild><Button className={cn("rounded-2xl h-14 px-8 font-black italic uppercase tracking-widest text-xs gap-3 shadow-2xl transition-all active:scale-95", amISubscribed ? "bg-cyan-500/10 text-cyan-500" : "bg-gradient-to-br from-cyan-500 to-blue-600 text-white")}>{amISubscribed ? <><CheckCircle2 className="h-5 w-5" /> Subscribed</> : <><Gem className="h-5 w-5 animate-pulse" /> Subscribe</>}</Button></DialogTrigger>
                      <DialogContent className="rounded-[2.5rem] p-0 overflow-hidden border-cyan-500/10 bg-white/95 dark:bg-[#050505]/95 backdrop-blur-3xl sm:max-w-[400px]"><div className="p-8 space-y-8 flex flex-col items-center text-center"><div className="relative"><div className="absolute -inset-4 bg-cyan-500/20 blur-2xl rounded-full animate-pulse" /><div className="h-24 w-24 bg-cyan-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl relative z-10"><Gem className="h-12 w-12" /></div></div><div className="space-y-2"><DialogTitle className="text-3xl font-black italic uppercase tracking-tighter">Premium Loop</DialogTitle><DialogDescription className="text-sm text-muted-foreground font-medium uppercase tracking-widest">Materialize VIP status with **{displayUser.name}**</DialogDescription></div><div className="bg-secondary/40 w-full p-6 rounded-3xl border border-white/5 space-y-4"><div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-muted-foreground">Access Fee</span><span className="text-2xl font-black tabular-nums text-cyan-500">20 D <span className="text-[10px] text-muted-foreground/60">/ Month</span></span></div><div className="h-px bg-white/5" /><ul className="space-y-3 text-left">{["Exclusive vibes", "Direct priority", "Special nodes"].map((benefit, i) => (<li key={i} className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight text-foreground/80"><CheckCircle2 className="h-3.5 w-3.5 text-cyan-500" /> {benefit}</li>))}</ul></div><Button className="w-full h-16 rounded-2xl bg-cyan-600 text-white font-black italic uppercase text-lg shadow-2xl active:scale-95" onClick={handleSubscribeHandshake} disabled={isSubscribing || amISubscribed}>{isSubscribing ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : amISubscribed ? "NODE ACTIVE" : "SYNC PREMIUM"}</Button></div></DialogContent>
                    </Dialog>
                  )}
                </div>
                <div className="flex items-start gap-4 py-2 group"><p className="text-[15px] leading-relaxed flex-1">{translatedBio || displayUser.bio}</p>{(deviceLanguage && displayUser.language && deviceLanguage !== displayUser.language) && <Button variant="ghost" size="icon" className={cn("h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity", translatedBio && "text-primary opacity-100")} onClick={handleTranslateBio} disabled={isTranslating}>{isTranslating ? <Zap className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}</Button>}</div>
                <div className="mt-4 flex gap-2">
                  <Button 
                    onClick={handleHandshakeAction} 
                    variant={variant}
                    className={cn(
                      "flex-1 rounded-lg gap-2 h-11 font-bold transition-all shadow-lg group/btn min-w-[140px]", 
                      variant === "default" && "bg-primary text-white shadow-primary/20",
                      (amIFriend || sent) && "hover:bg-destructive hover:text-white"
                    )}
                  >
                    <span className={cn((amIFriend || sent) && "group-hover/btn:hidden")}>
                      <Icon className="h-5 w-5 inline mr-1" />
                      {btnLabel}
                    </span>
                    {(amIFriend || sent) && (
                      <span className="hidden group-hover/btn:inline flex items-center gap-2">
                        <UserRoundX className="h-5 w-5" /> {amIFriend ? "Unfriend" : "Cancel"}
                      </span>
                    )}
                  </Button>
                  <Link href="/messages" className="flex-1">
                    <Button variant="secondary" className="w-full rounded-lg gap-2 h-11 font-bold active:scale-95 transition-all">
                      <MessageCircle className="h-5 w-5" /> Message
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <Tabs defaultValue="all" className="w-full mt-2"><TabsList className="w-full h-12 bg-white dark:bg-card border-t border-b border-border/50 rounded-none p-0"><TabsTrigger value="all" className="flex-1 font-bold text-sm">Posts</TabsTrigger><TabsTrigger value="reels" className="flex-1 font-bold text-sm">Reels</TabsTrigger><TabsTrigger value="media" className="flex-1 font-bold text-sm">Media</TabsTrigger></TabsList><TabsContent value="all" className="p-4 space-y-4">{userPosts.map(post => <PostCard key={post.id} {...post} />)}</TabsContent><TabsContent value="reels" className="p-4"><div className="grid grid-cols-3 gap-1">{userReels.length > 0 ? userReels.map(reel => <Link key={reel.id} href="/reels" className="aspect-[9/16] relative group overflow-hidden rounded-xl bg-black">{!settings.isFreeMode ? <video src={reel.videoUrl} className="object-cover w-full h-full opacity-80" muted playsInline /> : <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center"><EyeOff className="h-6 w-6 text-white/20" /></div>}<div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" /><div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[10px] font-black"><Clapperboard className="h-3 w-3" />{reel.likes}</div></Link>) : <div className="col-span-3 py-20 text-center text-muted-foreground bg-secondary/10 rounded-[2rem] border-2 border-dashed border-border/50"><Clapperboard className="h-10 w-10 mx-auto mb-2 opacity-20" /><p className="font-bold">No Reels yet</p></div>}</div></TabsContent><TabsContent value="media" className="p-4"><div className="grid grid-cols-3 gap-1">{mediaPosts.length > 0 ? mediaPosts.map(post => <div key={post.id} className={cn("aspect-square relative group overflow-hidden rounded-lg", !settings.isFreeMode ? "cursor-pointer" : "bg-secondary/20 flex items-center justify-center")}>{!settings.isFreeMode ? (<><Image src={post.image || post.images![0]} alt="Media" fill className="object-cover transition-transform group-hover:scale-110" /><div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><Play className="h-6 w-6" /></div></>) : <Zap className="h-6 w-6 text-muted-foreground/20" />}</div>) : <div className="col-span-3 py-20 text-center text-muted-foreground"><p className="font-bold">No media shared yet</p></div>}</div></TabsContent></Tabs>
          </div>
        </main>
        <aside className={cn("hidden lg:block sticky h-screen transition-all duration-300", isPlayerActive ? "top-16" : "top-0")}><RightSidebar /></aside>
      </div>
      <AlertDialog open={!!confirmUser} onOpenChange={(open) => !open && setConfirmUser(null)}><AlertDialogContent className="rounded-[2rem] sm:max-w-[420px] z-[200]"><AlertDialogHeader><AlertDialogTitle className="font-black italic uppercase tracking-tighter text-2xl">{confirmType === "cancel" ? "Cancel Request?" : "Unfriend User?"}</AlertDialogTitle><AlertDialogDescription className="text-base font-medium leading-relaxed">Are you sure you want to {confirmType === "cancel" ? "cancel your friendship request" : "unfriend"} <span className="font-bold text-foreground">@{confirmUser?.username}</span>? This action will adjust your community connection.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="flex-col sm:flex-row gap-2"><AlertDialogCancel className="rounded-xl h-12 font-bold bg-secondary/50 border-none">Cancel</AlertDialogCancel><AlertDialogAction onClick={confirmAction} className="rounded-xl h-12 font-black italic uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-white shadow-lg shadow-destructive/20">Confirm</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </div>
  );
}
