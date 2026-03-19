
"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/header";
import { SubHeader } from "@/components/layout/sub-header";
import { PostCard } from "@/components/post/post-card";
import { NativeAdNode } from "@/components/ad/native-ad-node";
import { Stories } from "@/components/feed/stories";
import { SuggestedFollows } from "@/components/feed/suggested-follows";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { MainNav } from "@/components/layout/main-nav";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import { Rocket, Zap, Sparkles, Loader2, ShieldCheck, Globe, ArrowRight, Lock, CheckCircle2, FileText, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateStoryModal } from "@/components/feed/create-story-modal";
import { AuthModal } from "@/components/auth/auth-modal";
import Link from "next/link";

function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#F2ECF7] dark:bg-[#050505] flex flex-col relative overflow-hidden selection:bg-primary/30">
      {/* High-Velocity Aurora Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/15 blur-[120px] rounded-full animate-pulse delay-1000" />
      </div>

      {/* Branded Header */}
      <header className="h-20 px-6 sm:px-12 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2/3 h-2/3">
              <path d="M3 7L10 19L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 15L17 7L21 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-headline font-black text-2xl tracking-tighter text-foreground italic uppercase">ViMore</span>
        </div>
        <Button 
          variant="outline" 
          className="rounded-xl h-11 px-6 border-primary/20 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all"
          onClick={() => setShowAuth(true)}
        >
          Login Node
        </Button>
      </header>

      {/* High-Fidelity Hero & Manifesto */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 text-center space-y-12">
        <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">The Borderless Network</Badge>
          <h1 className="text-5xl sm:text-8xl font-black italic uppercase tracking-tighter leading-[0.9] text-foreground">
            Digital Sovereignty <br />
            <span className="text-primary">Materialized.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Archive human expression, synchronize spatial vibes, and own your digital signature in the highest fidelity cluster ever engineered.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
          <Button 
            className="w-full h-16 rounded-2xl bg-primary text-white font-black italic uppercase tracking-[0.2em] text-lg shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all group"
            onClick={() => setShowAuth(true)}
          >
            Enter the Hub <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* The Privacy Manifesto Card */}
        <section className="max-w-2xl w-full bg-white/40 dark:bg-white/5 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl space-y-8 text-left animate-in fade-in zoom-in-95 duration-1000 delay-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-xl font-black italic uppercase tracking-widest text-foreground">Privacy Manifesto</h3>
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.4em]">MTL Command Core</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/privacy"><Button variant="ghost" size="sm" className="rounded-full text-[9px] font-black uppercase tracking-widest text-primary gap-2"><FileText className="h-3.5 w-3.5" /> Policy</Button></Link>
              <Link href="/terms"><Button variant="ghost" size="sm" className="rounded-full text-[9px] font-black uppercase tracking-widest text-primary gap-2"><Scale className="h-3.5 w-3.5" /> Terms</Button></Link>
            </div>
          </div>

          <div className="space-y-6 text-muted-foreground leading-relaxed font-medium">
            <p className="text-lg italic font-bold text-foreground/80">
              "Under the architectural leadership of <span className="text-primary">Amos B. Kortu, Founder and CEO of Media Tech Liberia</span>, ViMore is built on a foundation of absolute digital sovereignty."
            </p>
            <p>
              We don't just store data; we archive human expression. Your digital signature is protected by the ironclad logic of our private high-velocity clusters. No external tracking, no data leakage, only pure synchronization.
            </p>
          </div>

          <div className="pt-6 border-t border-primary/5 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Global Sovereign Node</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="p-12 flex flex-col items-center gap-6 relative z-10">
        <div className="flex items-center gap-6 opacity-40">
          <Link href="/privacy" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Privacy</Link>
          <Link href="/terms" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Terms</Link>
          <Link href="/how-it-works" className="text-[10px] font-black uppercase tracking-widest hover:text-primary transition-colors">Manual</Link>
        </div>
        
        <div className="flex items-center gap-3 opacity-30">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-1">Amos B. Kortu</span>
            <span className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground">Founder & CEO</span>
          </div>
          <div className="w-px h-6 bg-primary/20" />
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase text-primary tracking-widest checkbox-none leading-none mb-1">Aaron M. Tulay</span>
            <span className="text-[8px] font-bold uppercase tracking-tighter text-muted-foreground">Co-founder & President</span>
          </div>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.5em] text-foreground opacity-20">ViMore Node v1.5.0-SYNC • FROM MEDIA TECH LIBERIA</p>
      </footer>

      {showAuth && <AuthModal />}
    </div>
  );
}

export default function Home() {
  const { posts, campaigns, isLoading, initError, followingUsernames, seenPostIds, isAuthenticated, currentUser, triggerHaptic } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  
  const [displayLimit, setDisplayLimit] = useState(16);
  const observerTarget = useRef(null);
  const weights = useRef<Record<string, number>>({});
  const sessionSeen = useRef<Set<string>>(new Set());

  const isPlayerActive = currentTrack && !isExpanded;

  useEffect(() => {
    if (!isLoading && sessionSeen.current.size === 0) {
      seenPostIds.forEach(id => sessionSeen.current.add(id));
    }
  }, [isLoading, seenPostIds]);

  const organicSorted = useMemo(() => {
    const regular = posts.filter(p => !p.isBoosted);
    regular.forEach(p => { if (!(p.$id in weights.current)) weights.current[p.$id] = Math.random(); });
    const followingUnseen = regular.filter(p => followingUsernames.has(p.user.username) && !sessionSeen.current.has(p.$id));
    const publicUnseen = regular.filter(p => !followingUsernames.has(p.user.username) && !sessionSeen.current.has(p.$id));
    const seenNodes = regular.filter(p => sessionSeen.current.has(p.$id));
    const stableSort = (arr: any[]) => [...arr].sort((a, b) => weights.current[a.$id] - weights.current[b.$id]);
    return [...stableSort(followingUnseen), ...stableSort(publicUnseen), ...stableSort(seenNodes)];
  }, [posts, followingUsernames]);

  const feedItems = useMemo(() => {
    if (posts.length === 0) return [];
    const boostedPosts = posts.filter(p => p.isBoosted);
    const activeCampaigns = campaigns.filter(c => c.isActive);
    const result: (any)[] = [];
    let organicIdx = 0; let boostedIdx = 0; let campaignIdx = 0;
    while (organicIdx < organicSorted.length) {
      for (let i = 0; i < 2 && organicIdx < organicSorted.length; i++) {
        result.push({ type: 'post', data: organicSorted[organicIdx] });
        organicIdx++;
        if (activeCampaigns.length > 0 && (organicIdx === 1 || organicIdx % 10 === 0)) {
          result.push({ type: 'campaign', data: activeCampaigns[campaignIdx % activeCampaigns.length] });
          campaignIdx++;
        }
        if (organicIdx === 3) result.push({ type: 'ad', id: `ad-init-${organicIdx}` });
        if (organicIdx === 5) result.push({ type: 'suggestions', id: `suggested-follows-${organicIdx}` });
      }
      if (boostedIdx < boostedPosts.length) {
        result.push({ type: 'post', data: boostedPosts[boostedIdx] });
        boostedIdx++;
      } else if (organicIdx % 5 === 0) {
        result.push({ type: 'ad', id: `ad-seq-${organicIdx}` });
      }
    }
    return result.slice(0, displayLimit);
  }, [organicSorted, posts, campaigns, displayLimit]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading && feedItems.length >= displayLimit) {
        triggerHaptic(5);
        setDisplayLimit(prev => prev + 16);
      }
    }, { threshold: 0.1, rootMargin: '100px' });
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [isLoading, feedItems.length, displayLimit, triggerHaptic]);

  // MANDATORY HANDSHAKE: Do not materialize feed if profile fetch is pending or failed
  if (isLoading) {
    return null; // Let the AppLoadingGate handle the kinetic splash
  }

  // If a critical vault error occurred, the AppLoadingGate will show it.
  // We return null here to ensure no "broken" feed content is rendered behind the gate.
  if (initError) {
    return null;
  }

  // If not authenticated (no session and profile fetch finished with null), show Landing
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808] flex flex-col items-center transition-colors duration-300">
      <Header />
      <SubHeader />
      
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
          <Stories onOpenCreate={() => setIsStoryModalOpen(true)} />
          
          <div className="flex flex-col gap-1">
            {posts.length > 0 ? (
              <>
                {feedItems.map((item, idx) => {
                  if (item.type === 'ad') return <NativeAdNode key={item.id} type="banner" />;
                  if (item.type === 'suggestions') return <SuggestedFollows key={item.id} />;
                  if (item.type === 'campaign') {
                    return (
                      <PostCard 
                        key={item.data.$id}
                        $id={item.data.$id}
                        isCampaign={true}
                        user={{ name: "ViMore Official", username: "vimore", avatar: "/icon.svg", isVerified: true, role: "Global Node" }}
                        content={item.data.content}
                        image={item.data.type === 'photo' ? item.data.mediaUrl : undefined}
                        videoUrl={item.data.type === 'video' ? item.data.mediaUrl : undefined}
                        actionUrl={item.data.actionUrl}
                        actionLabel={item.data.actionLabel}
                        likes={1420}
                        unlikes={0}
                        comments={0}
                        views={0}
                        time="Now"
                      />
                    );
                  }
                  return <PostCard key={item.data.$id} {...item.data} />;
                })}
                <div ref={observerTarget} className="h-20 flex items-center justify-center p-8">
                  {feedItems.length < (posts.length + campaigns.length) ? (
                    <div className="flex items-center gap-2 text-muted-foreground/40 font-black uppercase text-[10px] tracking-[0.3em]">
                      <Loader2 className="h-4 w-4 animate-spin" /> Materializing...
                    </div>
                  ) : (
                    <div className="text-muted-foreground/20 text-[8px] font-black uppercase tracking-[0.5em]">Network End</div>
                  )}
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
