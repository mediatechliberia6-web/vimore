
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { SubHeader } from "@/components/layout/sub-header";
import { PostCard } from "@/components/post/post-card";
import { Stories } from "@/components/feed/stories";
import { SuggestedFollows } from "@/components/feed/suggested-follows";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { MainNav } from "@/components/layout/main-nav";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import { Rocket, Loader2, Mail, ChevronUp, WifiOff } from "lucide-react";
import { account } from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import { CreateStoryModal } from "@/components/feed/create-story-modal";
import { useFeedSignal } from "@/context/FeedSignalContext";

function EmailVerificationGate({ email }: { email?: string }) {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const { logout } = usePosts();

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const verifyUrl = window.location.origin + '/auth/verify';
      await account.createVerification(verifyUrl);
      setResendSent(true);
    } catch { /* ignore */ } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="h-24 w-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border-2 border-amber-500/20">
          <Mail className="h-12 w-12 text-amber-400" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Verify Your Email</h2>
          <p className="text-white/60 font-medium text-sm leading-relaxed">
            Your account is not verified yet.{email && <> Check <span className="font-bold text-white">{email}</span> for</>} the verification link we sent when you signed up.
          </p>
          <p className="text-white/30 text-xs font-medium">Check your spam folder if you don't see it.</p>
        </div>
        {resendSent ? (
          <div className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-sm font-bold text-green-400">Verification email sent! Check your inbox.</span>
          </div>
        ) : (
          <Button
            onClick={handleResend}
            disabled={resendLoading}
            className="w-full h-12 rounded-2xl bg-primary text-white font-black italic uppercase tracking-widest text-sm"
          >
            {resendLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Resend Verification Email"}
          </Button>
        )}
        <button
          onClick={() => logout()}
          className="w-full text-sm font-bold text-white/30 hover:text-white/60 transition-colors py-1"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { posts, campaigns, isLoading, initError, followingUsernames, friendUsernames, seenPostIds, isAuthenticated, isOffline, currentUser, triggerHaptic, loadMoreFeed, hasMoreFeed, isFeedLoading } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const { newFollowingPostsCount, clearNewPosts } = useFeedSignal();
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  const loadTriggerRef = useRef<HTMLDivElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const feedTopRef = useRef<HTMLDivElement | null>(null);
  const weights = useRef<Record<string, number>>({});
  const sessionSeen = useRef<Set<string>>(new Set());
  const isLoadingMoreRef = useRef(false);

  const isPlayerActive = currentTrack && !isExpanded;

  useEffect(() => {
    if (!isLoading && sessionSeen.current.size === 0) {
      seenPostIds.forEach(id => sessionSeen.current.add(id));
    }
  }, [isLoading, seenPostIds]);

  const organicSorted = useMemo(() => {
    const regular = posts.filter(p => !p.isBoosted);
    regular.forEach(p => { if (!(p.$id in weights.current)) weights.current[p.$id] = Math.random(); });

    const freshPosts = regular.filter(p => p.time === 'Just now');
    const freshIds = new Set(freshPosts.map(p => p.$id));

    const stableSort = (arr: any[]) => [...arr].sort((a, b) => weights.current[a.$id] - weights.current[b.$id]);

    // Unseen posts from users the current user follows OR is friends with
    const followingFriendUnseen = regular.filter(p =>
      !freshIds.has(p.$id) &&
      (followingUsernames.has(p.user.username) || friendUsernames.has(p.user.username) || p.user.username === currentUser?.username) &&
      !sessionSeen.current.has(p.$id)
    );
    const followingFriendIds = new Set(followingFriendUnseen.map(p => p.$id));

    // Unseen public posts (not from following/friends)
    const publicUnseen = regular.filter(p =>
      !freshIds.has(p.$id) &&
      !followingFriendIds.has(p.$id) &&
      !sessionSeen.current.has(p.$id)
    );

    // Already-seen posts (shown last)
    const seenNodes = regular.filter(p =>
      !freshIds.has(p.$id) &&
      sessionSeen.current.has(p.$id)
    );

    return [...freshPosts, ...stableSort(followingFriendUnseen), ...stableSort(publicUnseen), ...stableSort(seenNodes)];
  }, [posts, followingUsernames, friendUsernames, currentUser]);

  const feedItems = useMemo(() => {
    if (posts.length === 0) return [];
    const boostedPosts = posts.filter(p => p.isBoosted);
    const activeCampaigns = campaigns.filter((c: any) => c.is_active && c.placement === 'feed');
    const result: any[] = [];
    let organicCount = 0;
    let boostedIdx = 0;
    let campaignIdx = 0;
    let loadTriggerInserted = false;
    let suggestionsInserted = false;

    for (let i = 0; i < organicSorted.length; i++) {
      result.push({ type: 'post', data: organicSorted[i] });
      organicCount++;

      // Suggested follows after 8th organic post
      if (organicCount === 8 && !suggestionsInserted) {
        result.push({ type: 'suggestions', id: 'suggested-follows-8' });
        suggestionsInserted = true;
      }

      // Load-more trigger after the 14th organic post
      if (organicCount === 14 && !loadTriggerInserted) {
        result.push({ type: 'load-trigger', id: 'load-trigger-14' });
        loadTriggerInserted = true;
      }

      // After every 3 organic posts → campaign ad (independent slot)
      if (organicCount % 3 === 0 && activeCampaigns.length > 0) {
        result.push({ type: 'campaign', data: activeCampaigns[campaignIdx % activeCampaigns.length] });
        campaignIdx++;
      }

      // After every 5 organic posts → boost post (independent slot)
      if (organicCount % 5 === 0 && boostedIdx < boostedPosts.length) {
        result.push({ type: 'boost', data: boostedPosts[boostedIdx] });
        boostedIdx++;
      }
    }

    return result;
  }, [organicSorted, posts, campaigns]);

  // Observe the load-trigger element (fires when user reaches the 14th post)
  useEffect(() => {
    const el = loadTriggerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMoreFeed && !isFeedLoading && !isLoadingMoreRef.current) {
        isLoadingMoreRef.current = true;
        triggerHaptic(5);
        loadMoreFeed().finally(() => { isLoadingMoreRef.current = false; });
      }
    }, { threshold: 0.1, rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [feedItems, hasMoreFeed, isFeedLoading, loadMoreFeed, triggerHaptic]);

  // Redirect unauthenticated users to login once loading finishes
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isOffline) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, isOffline, router]);

  // MANDATORY HANDSHAKE: Do not materialize feed if profile fetch is pending or failed
  if (isLoading) {
    return null; // Let the AppLoadingGate handle the kinetic splash
  }

  // If a critical vault error occurred, the AppLoadingGate will show it.
  if (initError) {
    return null;
  }

  // Not authenticated and not in offline mode — redirect handled by effect above
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808] flex flex-col items-center transition-colors duration-300">
      <Header />
      <SubHeader />

      {isOffline && (
        <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-2">
          <WifiOff className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
            You&apos;re offline — showing saved posts
          </span>
        </div>
      )}
      
      <div className={cn(
        "w-full max-w-[1440px] grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-8 px-4 transition-all duration-300",
        isPlayerActive ? "pt-[184px]" : "pt-6"
      )}>
        <aside className={cn(
          "hidden lg:block sticky h-[calc(100vh-132px)] overflow-y-auto transition-all duration-300",
          isPlayerActive ? "top-[196px]" : "top-[132px]"
        )}>
          <MainNav />
        </aside>

        <main className="flex flex-col gap-4 w-full max-w-[680px] mx-auto">
          <div ref={feedTopRef} />
          <Stories onOpenCreate={() => setIsStoryModalOpen(true)} />

          {/* New Posts floating pill */}
          {newFollowingPostsCount > 0 && (
            <div className="sticky top-[76px] z-30 flex justify-center pointer-events-none">
              <button
                className="pointer-events-auto flex items-center gap-2 bg-primary text-white text-[11px] font-black uppercase tracking-[0.15em] px-5 py-2.5 rounded-full shadow-xl shadow-primary/30 animate-badge-pop hover:scale-105 active:scale-95 transition-transform"
                onClick={() => {
                  clearNewPosts();
                  feedTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                <ChevronUp className="h-3.5 w-3.5" />
                {newFollowingPostsCount} New {newFollowingPostsCount === 1 ? 'Post' : 'Posts'}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {posts.length > 0 ? (
              <>
                {feedItems.map((item, idx) => {
                  if (item.type === 'suggestions') return <SuggestedFollows key={item.id} />;

                  if (item.type === 'load-trigger') {
                    return <div key={item.id} ref={loadTriggerRef} className="h-1" />;
                  }

                  if (item.type === 'campaign') {
                    return (
                      <PostCard
                        key={`campaign-${item.data.$id}-${idx}`}
                        $id={item.data.$id}
                        isCampaign={true}
                        user={{ name: "ViMore Official", username: "vimore", avatar: "/icon.svg", isVerified: true, role: "Global Node" }}
                        content={item.data.content}
                        image={item.data.type === 'photo' ? item.data.media_url : undefined}
                        videoUrl={item.data.type === 'video' ? item.data.media_url : undefined}
                        campaignTitle={item.data.title}
                        actionUrl={item.data.action_url}
                        actionLabel={item.data.action_label}
                        likes={1420}
                        unlikes={0}
                        comments={0}
                        views={0}
                        time="Now"
                      />
                    );
                  }

                  if (item.type === 'boost') {
                    return <PostCard key={`boost-${item.data.$id}-${idx}`} {...item.data} />;
                  }

                  return <PostCard key={`post-${item.data.$id}`} {...item.data} />;
                })}
                <div ref={endRef} className="h-20 flex items-center justify-center p-8">
                  {isFeedLoading ? (
                    <div className="flex items-center gap-2 text-muted-foreground/40 font-black uppercase text-[10px] tracking-[0.3em]">
                      <Loader2 className="h-4 w-4 animate-spin" /> Materializing...
                    </div>
                  ) : !hasMoreFeed ? (
                    <div className="text-muted-foreground/20 text-[8px] font-black uppercase tracking-[0.5em]">Network End</div>
                  ) : null}
                </div>
              </>
            ) : !isLoading && (
              <div className="py-32 text-center bg-white dark:bg-card rounded-[2.5rem] border border-dashed border-primary/10 shadow-sm flex flex-col items-center justify-center space-y-6 px-12 animate-in fade-in zoom-in duration-700">
                <div className="h-24 w-24 bg-primary/5 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-primary/20">
                  <Rocket className="h-10 w-10 text-primary/40 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Cluster Initialized</h3>
                  <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest">Feed silent. Materialize a vibe to sync.</p>
                </div>
              </div>
            )}
          </div>
        </main>

        <aside className={cn(
          "hidden lg:block sticky h-[calc(100vh-132px)] overflow-y-auto transition-all duration-300",
          isPlayerActive ? "top-[196px]" : "top-[132px]"
        )}>
          <RightSidebar />
        </aside>
      </div>

      <CreateStoryModal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} />
    </div>
  );
}
