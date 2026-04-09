
"use client";

import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from "react";
import { Header } from "@/components/layout/header";
import { SubHeader } from "@/components/layout/sub-header";
import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { NativeAdNode } from "@/components/ad/native-ad-node";
import { databases, DATABASE_ID, COL, Query } from "@/lib/appwrite";
import { 
  Users, 
  UserPlus, 
  Search, 
  MessageCircle,
  WifiOff,
  UserCheck, 
  Zap, 
  Play, 
  Volume2, 
  UserMinus, 
  Heart,
  ArrowRight,
  UserRoundCheck,
  UserRoundPlus,
  ShieldCheck,
  X,
  Users2,
  Check,
  Loader2,
  Rocket,
  Clock,
  Ban
} from "lucide-react";
import Link from "next/link";
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
import { useTranslation } from "@/context/LanguageContext";
import FriendsLoading from "./loading";

type HubTab = "add" | "confirm" | "friends" | "pending";

function FriendsPageContent() {
  const { connections = [], isFriend, isRequestSent, isRequestReceived, sendFriendRequest, confirmFriendRequest, cancelFriendRequest, unfriendUser, currentUser, friendUsernames, followerUsernames, isLoading, isOffline } = usePosts();
  const { currentTrack, isExpanded, triggerHaptic } = useMusic();
  const { t } = useTranslation();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<HubTab>("add");
  const [searchQuery, setSearchQuery] = useState("");
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);

  // Add Friends tab state
  const [discoveryUsers, setDiscoveryUsers] = useState<any[]>([]);
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(false);

  // Confirm tab state
  const [confirmReceivedUsers, setConfirmReceivedUsers] = useState<any[]>([]);
  const [isLoadingConfirm, setIsLoadingConfirm] = useState(false);

  // Pending tab state
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [cancellingUser, setCancellingUser] = useState<string | null>(null);

  const [confirmUser, setConfirmUser] = useState<any | null>(null);
  const [confirmType, setConfirmType] = useState<"unfriend" | "cancel">("unfriend");

  const discoveryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confirmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isPlayerActive = currentTrack && !isExpanded;

  useEffect(() => {
    const tabParam = searchParams.get('tab') as HubTab;
    if (tabParam && ["add", "confirm", "friends", "pending"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // ─── Fetch discovery users (no attribute ordering, just limit) ───
  const fetchDiscoveryBatch = useCallback(async () => {
    if (!currentUser) return;
    try {
      const result = await databases.listDocuments(DATABASE_ID, COL.USERS, [
        Query.limit(50),
      ]);
      const mapped = result.documents.map((doc: any) => ({
        $id: doc.$id,
        username: doc.username,
        name: doc.name || doc.username,
        avatar: doc.avatar || doc.avatar_url || '',
        followers: doc.followers_count || doc.followers || 0,
        category: doc.category || 'CREATOR',
        isVerified: doc.is_verified || false,
        isOnline: doc.is_online || false,
      }));
      setDiscoveryUsers(mapped);
    } catch {
      // silent fail — keep old data
    }
  }, [currentUser]);

  // ─── Fetch pending sent requests ───
  const fetchPendingRequests = useCallback(async () => {
    if (!currentUser) return;
    try {
      const reqResult = await databases.listDocuments(DATABASE_ID, COL.FRIEND_REQUESTS, [
        Query.equal('from_user_id', currentUser.$id),
        Query.equal('status', 'PENDING'),
        Query.limit(25),
      ]);

      if (reqResult.documents.length === 0) {
        setPendingUsers([]);
        return;
      }

      const toIds = reqResult.documents.map((d: any) => d.to_user_id);
      const userResults = await databases.listDocuments(DATABASE_ID, COL.USERS, [
        Query.equal('$id', toIds),
        Query.limit(25),
      ]);

      const mapped = userResults.documents.map((doc: any) => ({
        $id: doc.$id,
        username: doc.username,
        name: doc.name || doc.username,
        avatar: doc.avatar || doc.avatar_url || '',
        followers: doc.followers_count || doc.followers || 0,
        category: doc.category || 'CREATOR',
        isVerified: doc.is_verified || false,
      }));

      setPendingUsers(mapped);
    } catch {
      // silent fail
    }
  }, [currentUser]);

  // ─── Fetch received (confirm) requests ───
  const fetchConfirmRequests = useCallback(async () => {
    if (!currentUser) return;
    try {
      const reqResult = await databases.listDocuments(DATABASE_ID, COL.FRIEND_REQUESTS, [
        Query.equal('to_user_id', currentUser.$id),
        Query.equal('status', 'PENDING'),
        Query.limit(50),
      ]);

      if (reqResult.documents.length === 0) {
        setConfirmReceivedUsers([]);
        return;
      }

      const fromIds = reqResult.documents.map((d: any) => d.from_user_id);
      const userResults = await databases.listDocuments(DATABASE_ID, COL.USERS, [
        Query.equal('$id', fromIds),
        Query.limit(50),
      ]);

      const mapped = userResults.documents.map((doc: any) => ({
        $id: doc.$id,
        username: doc.username,
        name: doc.name || doc.username,
        avatar: doc.avatar || doc.avatar_url || '',
        followers: doc.followers_count || doc.followers || 0,
        category: doc.category || 'CREATOR',
        isVerified: doc.is_verified || false,
      }));

      setConfirmReceivedUsers(mapped);
    } catch {
      // silent fail
    }
  }, [currentUser]);

  // ─── Add Friends tab: initial fetch + 30s interval ───
  useEffect(() => {
    if (activeTab !== 'add') {
      if (discoveryIntervalRef.current) {
        clearInterval(discoveryIntervalRef.current);
        discoveryIntervalRef.current = null;
      }
      return;
    }

    setIsLoadingDiscovery(true);
    fetchDiscoveryBatch().finally(() => setIsLoadingDiscovery(false));

    discoveryIntervalRef.current = setInterval(() => {
      fetchDiscoveryBatch();
    }, 90000);

    return () => {
      if (discoveryIntervalRef.current) {
        clearInterval(discoveryIntervalRef.current);
        discoveryIntervalRef.current = null;
      }
    };
  }, [activeTab, fetchDiscoveryBatch]);

  // ─── Confirm tab: initial fetch + 5s interval ───
  useEffect(() => {
    if (activeTab !== 'confirm') {
      if (confirmIntervalRef.current) {
        clearInterval(confirmIntervalRef.current);
        confirmIntervalRef.current = null;
      }
      return;
    }

    setIsLoadingConfirm(true);
    fetchConfirmRequests().finally(() => setIsLoadingConfirm(false));

    confirmIntervalRef.current = setInterval(() => {
      fetchConfirmRequests();
    }, 5000);

    return () => {
      if (confirmIntervalRef.current) {
        clearInterval(confirmIntervalRef.current);
        confirmIntervalRef.current = null;
      }
    };
  }, [activeTab, fetchConfirmRequests]);

  // ─── Pending tab: initial fetch + 5s interval ───
  useEffect(() => {
    if (activeTab !== 'pending') {
      if (pendingIntervalRef.current) {
        clearInterval(pendingIntervalRef.current);
        pendingIntervalRef.current = null;
      }
      return;
    }

    setIsLoadingPending(true);
    fetchPendingRequests().finally(() => setIsLoadingPending(false));

    pendingIntervalRef.current = setInterval(() => {
      fetchPendingRequests();
    }, 90000);

    return () => {
      if (pendingIntervalRef.current) {
        clearInterval(pendingIntervalRef.current);
        pendingIntervalRef.current = null;
      }
    };
  }, [activeTab, fetchPendingRequests]);

  // ─── Cleanup all intervals on unmount ───
  useEffect(() => {
    return () => {
      if (discoveryIntervalRef.current) clearInterval(discoveryIntervalRef.current);
      if (confirmIntervalRef.current) clearInterval(confirmIntervalRef.current);
      if (pendingIntervalRef.current) clearInterval(pendingIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!confirmUser) {
      document.body.style.pointerEvents = 'auto';
    }
    return () => {
      document.body.style.pointerEvents = 'auto';
    };
  }, [confirmUser]);

  // ─── Filtered lists ───
  const addFriendsUsers = useMemo(() => {
    if (!currentUser) return [];
    return discoveryUsers.filter(u =>
      u.username !== currentUser.username &&
      !isFriend(u.username) &&
      !isRequestSent(u.username) &&
      !isRequestReceived(u.username)
    );
  }, [discoveryUsers, currentUser, isFriend, isRequestSent, isRequestReceived]);

  const confirmUsers = useMemo(() => {
    if (!currentUser) return [];
    return confirmReceivedUsers.filter(u => u.username !== currentUser.username);
  }, [confirmReceivedUsers, currentUser]);

  const friendsList = useMemo(() => {
    if (!currentUser) return [];
    return connections.filter(c =>
      c.username !== currentUser.username && isFriend(c.username)
    );
  }, [connections, currentUser, isFriend]);

  const filteredUsers = useMemo(() => {
    let list: any[] = [];
    if (activeTab === 'add') list = addFriendsUsers;
    else if (activeTab === 'confirm') list = confirmUsers;
    else if (activeTab === 'friends') list = friendsList;
    else if (activeTab === 'pending') list = pendingUsers;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(u =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.username || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTab, addFriendsUsers, confirmUsers, friendsList, pendingUsers, searchQuery]);

  if (isLoading || !currentUser) {
    return <FriendsLoading />;
  }

  const tabs: { id: HubTab; label: string; icon: any }[] = [
    { id: "add", label: t('friends_add'), icon: UserRoundPlus },
    { id: "confirm", label: t('friends_confirm'), icon: UserRoundCheck },
    { id: "pending", label: "Pending", icon: Clock },
    { id: "friends", label: t('friends_my_friends'), icon: Users2 },
  ];

  const handlePreviewSonic = (username: string, name: string) => {
    triggerHaptic(15);
    if (playingPreview === username) {
      setPlayingPreview(null);
    } else {
      setPlayingPreview(username);
      toast({
        title: "Sonic Signature",
        description: `Sampling ${name}'s digital intro...`,
        duration: 3000,
      });
      setTimeout(() => setPlayingPreview(null), 3000);
    }
  };

  const handleAction = (user: any) => {
    const friend = isFriend(user.username);
    const sent = isRequestSent(user.username);
    const received = isRequestReceived(user.username);

    if (friend) {
      triggerHaptic(15);
      setConfirmType("unfriend");
      setConfirmUser(user);
    } else if (sent) {
      triggerHaptic(10);
      setConfirmType("cancel");
      setConfirmUser(user);
    } else if (received) {
      triggerHaptic(25);
      confirmFriendRequest(user.username);
      setConfirmReceivedUsers(prev => prev.filter(u => u.username !== user.username));
    } else {
      triggerHaptic(20);
      sendFriendRequest(user.username);
    }
  };

  const handleCancelPending = async (user: any) => {
    if (cancellingUser === user.username) return;
    triggerHaptic(15);
    setCancellingUser(user.username);
    try {
      await cancelFriendRequest(user.username);
      // Decrement target user follower_count
      await databases.updateDocument(DATABASE_ID, COL.USERS, user.$id, {
        followers_count: Math.max(0, (user.followers || 1) - 1),
      }).catch(() => {});
      setPendingUsers(prev => prev.filter(u => u.username !== user.username));
      toast({ title: "Request cancelled", description: `Request to @${user.username} has been cancelled.`, duration: 2500 });
    } catch {
      toast({ title: "Error", description: "Could not cancel request. Try again.", duration: 2500 });
    } finally {
      setCancellingUser(null);
    }
  };

  const confirmRemoval = () => {
    if (confirmUser) {
      triggerHaptic(30);
      const user = { ...confirmUser };
      document.body.style.pointerEvents = 'auto';
      setConfirmUser(null);
      if (confirmType === "unfriend") {
        unfriendUser(user.username);
      } else {
        cancelFriendRequest(user.username);
      }
    }
  };

  const isTabLoading = (tab: HubTab) => {
    if (tab === 'add') return isLoadingDiscovery;
    if (tab === 'confirm') return isLoadingConfirm;
    if (tab === 'pending') return isLoadingPending;
    return false;
  };

  const emptyMessage = () => {
    if (activeTab === 'add') return "All network nodes synchronized. Share your referral link to attract new connections.";
    if (activeTab === 'confirm') return "No pending friendship pulses detected.";
    if (activeTab === 'pending') return "No outgoing requests pending. Start connecting with new nodes.";
    return "No established friends in vault.";
  };

  return (
    <div className="min-h-screen bg-[#F2ECF7] dark:bg-[#050505] text-foreground flex flex-col transition-colors duration-500 overflow-x-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full pointer-events-none animate-pulse delay-700" />

      <Header />
      <SubHeader />

      {isOffline && (
        <div className="w-full bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-2 relative z-20">
          <WifiOff className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          <span className="text-[11px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">Offline — showing saved connections</span>
        </div>
      )}
      
      <div className={cn(
        "w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-8 px-4 relative z-10 transition-all duration-300",
        isPlayerActive ? "pt-[184px]" : "pt-6"
      )}>
        <aside className={cn(
          "hidden lg:block sticky h-[calc(100vh-132px)] overflow-y-auto transition-all duration-300",
          isPlayerActive ? "top-[196px]" : "top-[132px]"
        )}>
          <MainNav />
        </aside>

        <main className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
          
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter flex items-center gap-3 font-headline text-primary">
                  COMMUNITY
                  <div className="bg-primary/20 p-2 rounded-xl shadow-lg shadow-primary/10">
                    <Users className="h-6 w-6 text-primary fill-primary" />
                  </div>
                </h1>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">
                    {t('friends_total')}: {friendUsernames.size} / 7,000
                  </span>
                  <div className="h-1 w-1 rounded-full bg-primary/40" />
                  <span className="text-primary text-[10px] font-black uppercase tracking-widest">
                    {filteredUsers.length} Nodes in view
                  </span>
                </div>
              </div>

              <div className="relative group w-full sm:max-w-xs">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder={t('chat_query_nodes')} 
                  className="pl-11 h-12 bg-white/40 dark:bg-white/5 backdrop-blur-md border-primary/10 rounded-2xl focus-visible:ring-primary/30 transition-all placeholder:text-muted-foreground/40"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <NativeAdNode type="banner-468" id="friends-top-pulse" />

            {/* Horizontally scrollable tab bar */}
            <div className="relative">
              <div className="flex overflow-x-auto scrollbar-hide gap-1.5 p-1.5 bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2rem] shadow-xl shadow-black/5 snap-x snap-mandatory">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const loading = isTabLoading(tab.id);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { triggerHaptic(5); setActiveTab(tab.id); }}
                      className={cn(
                        "flex-shrink-0 snap-start flex items-center justify-center gap-2 py-4 px-5 rounded-full text-[10px] sm:text-xs font-black italic uppercase tracking-widest transition-all relative overflow-hidden group min-w-max",
                        isActive 
                          ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105" 
                          : "text-muted-foreground hover:text-foreground hover:bg-white/10"
                      )}
                    >
                      {loading && isActive ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <tab.icon className={cn("h-4 w-4", isActive && "fill-current")} />
                      )}
                      <span>{tab.label}</span>
                      {isActive && (
                        <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-white/40 rounded-t-full blur-sm" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Loading state for discovery */}
          {isLoadingDiscovery && activeTab === "add" && discoveryUsers.length === 0 && (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm font-bold uppercase tracking-widest">Scanning network nodes...</span>
            </div>
          )}

          {/* Loading state for confirm */}
          {isLoadingConfirm && activeTab === "confirm" && confirmReceivedUsers.length === 0 && (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm font-bold uppercase tracking-widest">Syncing incoming requests...</span>
            </div>
          )}

          {/* Loading state for pending */}
          {isLoadingPending && activeTab === "pending" && pendingUsers.length === 0 && (
            <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm font-bold uppercase tracking-widest">Syncing pending requests...</span>
            </div>
          )}

          {/* Pending Tab UI */}
          {activeTab === 'pending' && (!isLoadingPending || pendingUsers.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredUsers.length > 0 ? filteredUsers.map((user, i) => (
                <div
                  key={user.username}
                  className="group relative bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-6 transition-all hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                >
                  <div className="relative space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className="relative shrink-0">
                          <Avatar className="h-20 w-20 border-4 border-primary/30 transition-all duration-500 shadow-xl group-hover:border-primary/60">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>{(user.name || '?')[0]}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full border-2 border-white dark:border-[#050505] shadow-lg">
                            Pending
                          </div>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <Link href={`/profile/${user.username}`} className="flex flex-col gap-0.5">
                            <span className="font-headline font-black text-xl italic uppercase tracking-tighter truncate hover:text-primary transition-colors">{user.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">@{user.username}</span>
                              {user.isVerified && <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black h-4 px-2">VERIFIED</Badge>}
                            </div>
                          </Link>
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="text-[9px] font-black uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md">Request Sent</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="rounded-[1.25rem] h-11 px-5 font-black italic uppercase tracking-widest text-[10px] transition-all min-w-[130px] shadow-lg bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white"
                          onClick={() => handleCancelPending(user)}
                          disabled={cancellingUser === user.username}
                        >
                          {cancellingUser === user.username ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <><X className="h-3.5 w-3.5 inline mr-1.5" /> Cancel Request</>
                          )}
                        </Button>
                        <Link href={`/messages?open=${user.username}`} className="w-full">
                          <Button variant="ghost" className="w-full rounded-xl bg-white/40 dark:bg-white/5 h-10 text-muted-foreground hover:text-primary transition-all font-bold text-[10px] uppercase">
                            Message
                          </Button>
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                      <div className="flex items-center gap-2 text-muted-foreground opacity-40">
                        <Zap className="h-3.5 w-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          {user.followers || 0} Spatial Nodes
                        </span>
                      </div>
                      <Link href={`/profile/${user.username}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-3 rounded-full text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10">
                          View Workspace <ArrowRight className="ml-1 h-2.5 w-2.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="col-span-full py-32 text-center space-y-6 opacity-60 animate-in fade-in zoom-in-95 duration-500">
                  <div className="h-24 w-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-dashed border-primary/20">
                    <Clock className="h-10 w-10 text-primary/40 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">No Pending Pulses</h3>
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest max-w-xs mx-auto">
                      {emptyMessage()}
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab('add')} variant="outline" className="rounded-full border-primary text-primary font-black uppercase text-[10px] h-12 px-10 shadow-lg">
                    Discover New Nodes
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* All other tabs (add, confirm, friends) */}
          {activeTab !== 'pending' && (!isLoadingDiscovery || activeTab !== 'add' || discoveryUsers.length > 0) && (!isLoadingConfirm || activeTab !== 'confirm' || confirmReceivedUsers.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredUsers.length > 0 ? filteredUsers.map((user, i) => {
                const friend = isFriend(user.username);
                const sent = isRequestSent(user.username);
                const isPlaying = playingPreview === user.username;

                return (
                  <div 
                    key={user.username} 
                    className="group relative bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-6 transition-all hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 animate-in fade-in slide-in-from-bottom-4"
                    style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
                  >
                    <div className="relative space-y-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                          <div className="relative shrink-0">
                            <div className={cn(
                              "absolute -inset-2 rounded-full blur-md opacity-0 transition-all duration-700 ring-2 ring-primary/40",
                              user.isOnline && "opacity-100 animate-pulse scale-110"
                            )} />
                            
                            <div className="relative">
                              <Avatar className={cn(
                                "h-20 w-20 border-4 transition-all duration-500 shadow-xl",
                                user.isOnline ? "border-primary" : "border-white/20 group-hover:border-primary/50"
                              )}>
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{(user.name || '?')[0]}</AvatarFallback>
                              </Avatar>
                              
                              <button 
                                onClick={() => handlePreviewSonic(user.username, user.name)}
                                className={cn(
                                  "absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity",
                                  isPlaying && "opacity-100 bg-primary/40"
                                )}
                              >
                                {isPlaying ? <Volume2 className="h-8 w-8 text-white animate-bounce" /> : <Play className="h-8 w-8 text-white fill-current" />}
                              </button>
                            </div>
                            {friend && (
                              <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[8px] font-black uppercase px-2 py-1 rounded-full border-2 border-white dark:border-[#050505] shadow-lg">
                                Friend
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <Link href={`/profile/${user.username}`} className="flex flex-col gap-0.5">
                              <span className="font-headline font-black text-xl italic uppercase tracking-tighter truncate hover:text-primary transition-colors">{user.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">@{user.username}</span>
                                {user.isVerified && <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black h-4 px-2">VERIFIED</Badge>}
                              </div>
                            </Link>
                            <div className="mt-2 flex wrap gap-1">
                              <span className="text-[9px] font-black uppercase bg-primary/5 text-primary/70 px-2 py-0.5 rounded-md">{user.category || "CREATOR"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          <Button 
                            size="sm"
                            className={cn(
                              "rounded-[1.25rem] h-11 px-6 font-black italic uppercase tracking-widest text-[10px] transition-all group/btn min-w-[120px] shadow-lg",
                              friend ? "bg-white/10 dark:bg-white/5 text-foreground hover:bg-destructive hover:text-white" :
                              sent ? "bg-primary/10 text-primary border border-primary/20 hover:bg-destructive hover:text-white" :
                              "bg-primary text-white shadow-primary/20 hover:scale-105"
                            )}
                            onClick={() => handleAction(user)}
                          >
                            <span className={cn((friend || sent) && "group-hover/btn:hidden")}>
                              {friend ? <><UserCheck className="h-3.5 w-3.5 inline mr-1.5" /> Friends</> : 
                               sent ? <><Check className="h-3.5 w-3.5 inline mr-1.5" /> Sent</> : 
                               activeTab === 'confirm' ? t('friends_confirm').split(' ')[0] : t('friends_add_friend')}
                            </span>
                            {(friend || sent) && (
                              <span className="hidden group-hover/btn:inline flex items-center gap-1.5">
                                {friend ? <><UserMinus className="h-3.5 w-3.5" /> Unfriend</> : <><X className="h-3.5 w-3.5" /> Cancel</>}
                              </span>
                            )}
                          </Button>
                          <Link href={`/messages?open=${user.username}`} className="w-full">
                            <Button variant="ghost" className="w-full rounded-xl bg-white/40 dark:bg-white/5 h-10 text-muted-foreground hover:text-primary transition-all font-bold text-[10px] uppercase">
                              Message
                            </Button>
                          </Link>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                        <div className="flex items-center gap-2 text-muted-foreground opacity-40">
                          <Zap className="h-3.5 w-3.5" />
                          <span className="text-[9px] font-black uppercase tracking-widest">
                            {user.followers || 0} Spatial Nodes
                          </span>
                        </div>
                        <Link href={`/profile/${user.username}`}>
                          <Button variant="ghost" size="sm" className="h-7 px-3 rounded-full text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10">
                            View Workspace <ArrowRight className="ml-1 h-2.5 w-2.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="col-span-full py-32 text-center space-y-6 opacity-60 animate-in fade-in zoom-in-95 duration-500">
                  <div className="h-24 w-24 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-dashed border-primary/20">
                    <Heart className="h-10 w-10 text-primary/40 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Node Cluster Silent</h3>
                    <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest max-w-xs mx-auto">
                      {emptyMessage()}
                    </p>
                  </div>
                  <Link href={activeTab === 'add' ? "/referrals" : "/explore"}>
                    <Button variant="outline" className="rounded-full border-primary text-primary font-black uppercase text-[10px] h-12 px-10 shadow-lg">
                      {activeTab === 'add' ? "Expand Star Network" : "Discover New Nodes"}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}

          <NativeAdNode type="banner-468" id="friends-mid-pulse" />

          {filteredUsers.length > 6 && (
            <div className="w-full py-10 flex flex-col items-center gap-6">
              <NativeAdNode type="banner-468" id="friends-bottom-pulse" />
              <Link href="/referrals">
                <Button className="rounded-full bg-primary text-white font-black italic uppercase tracking-widest h-14 px-12 shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  <Rocket className="mr-2 h-5 w-5" /> Expand Network
                </Button>
              </Link>
            </div>
          )}
        </main>

        <aside className={cn(
          "hidden lg:block sticky h-[calc(100vh-132px)] overflow-y-auto transition-all duration-300",
          isPlayerActive ? "top-[196px]" : "top-[132px]"
        )}>
          <RightSidebar />
        </aside>
      </div>

      <AlertDialog open={!!confirmUser} onOpenChange={(open) => !open && setConfirmUser(null)}>
        <AlertDialogContent className="rounded-[2.5rem] sm:max-w-[420px] z-[300] bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-2xl border-primary/10 text-foreground shadow-2xl">
          <AlertDialogHeader>
            <div className="mx-auto h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-4">
              <UserMinus className="h-8 w-8" />
            </div>
            <AlertDialogTitle className="font-headline font-black italic uppercase tracking-tighter text-3xl text-center">
              Sever Handshake?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base font-medium leading-relaxed text-center px-4">
              {confirmType === "unfriend" 
                ? `You'll no longer be established friends with @${confirmUser?.username}. This pulse will be purged.`
                : `Are you sure you want to cancel your friendship request to @${confirmUser?.username}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6 px-4 pb-2">
            <AlertDialogCancel className="rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] bg-secondary/50 border-none hover:bg-secondary transition-all">Abort</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoval}
              className="rounded-2xl h-14 font-black italic uppercase tracking-[0.2em] text-[10px] bg-destructive hover:bg-destructive/90 text-white shadow-xl shadow-destructive/20 transition-all active:scale-95"
            >
              Confirm Severance
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function FriendsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F2ECF7] dark:bg-[#050505] flex items-center justify-center"><Zap className="h-10 w-10 text-primary animate-spin" /></div>}>
      <FriendsPageContent />
    </Suspense>
  );
}
