
'use client';

/**
 * @fileOverview ViMore Core Context Node (Prototype Edition)
 * Manages local identity, content, and economy without external database dependencies.
 */

import { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

// --- TYPES ---

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  hapticIntensity: number;
  isGhostMode: boolean;
  playbackQuality: 'standard' | 'pro-hd';
  fontScale: number;
  isAutoFollowEnabled: boolean;
  activeSoundSet: 'cyberpunk' | 'lofi';
  isBiometricActive: boolean;
  taggingPrivacy: 'everyone' | 'friends';
  discoveryVisibility: 'everyone' | 'mutual';
  showReadReceipts: boolean;
  legacyContact: string | null;
  isSilenceActive: boolean;
  silenceStart: string;
  silenceEnd: string;
  defaultStream: 'following' | 'foryou';
  goldRate: number;
  diamondRate: number;
  ldMultiplier: number;
  isReelsEnabled: boolean;
  isMusicEnabled: boolean;
  isGiftingEnabled: boolean;
  isAiVerificationActive: boolean;
  isSensitivityFilterActive: boolean;
  isFreeMode: boolean;
}

export interface User {
  id?: string;
  name: string;
  username: string;
  avatar: string;
  cover?: string;
  isVerified?: boolean;
  followers?: string | number;
  following?: string | number;
  posts?: string | number;
  bio?: string;
  category?: string;
  gender?: 'Male' | 'Female';
  goldBalance?: number;
  diamondBalance?: number;
  starBalance?: number;
  referralCount?: number;
  role?: 'SUPER' | 'FINANCIAL' | 'MODERATOR' | 'USER';
  joinDate?: string;
  isEmailVerified?: boolean;
  hasEverBeenVerified?: boolean;
}

export interface Post {
  id: string;
  user: User;
  content: string;
  time: string;
  likes: number;
  unlikes: number;
  comments: number;
  shares: number;
  views: number;
  image?: string;
  videoUrl?: string; 
  theme?: string;
  isLocked?: boolean;
  unlockPrice?: number;
  isBoosted?: boolean;
  boostTargetViews?: number;
  boostCurrentViews?: number;
}

export interface PostComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  time: string;
  parentId?: string;
  timestamp: number;
}

export interface Cluster {
  id: string;
  name: string;
  adminUsername: string;
  avatar?: string;
  members: User[];
  isGroup: true;
}

export interface Connection extends User {
  followsYou?: boolean;
  isGroup: false;
}

export type CallType = 'video' | 'audio';
export type CallStatus = 'idle' | 'incoming' | 'outgoing' | 'active' | 'ringing';

export interface CallState {
  type: CallType;
  status: CallStatus;
  contact: any | null;
  channelName?: string;
}

interface PostContextType {
  currentUser: User;
  posts: Post[];
  activeComments: PostComment[];
  isLoading: boolean;
  likedPostIds: Set<string>;
  unlikedPostIds: Set<string>;
  savedPostIds: Set<string>;
  unlockedPostIds: Set<string>;
  followingUsernames: Set<string>;
  followerUsernames: Set<string>;
  activeStoryIndex: number | null;
  selectedPostId: string | null;
  selectedChatId: string | null;
  selectedImageUrl: string | null;
  selectedVideoUrl: string | null;
  isSearchOpen: boolean;
  isGiftHubOpen: boolean;
  targetUserForGift: User | null;
  activeCommentPostId: string | null;
  settings: AppSettings;
  gatewaySettings: any;
  callState: CallState;
  stories: any[];
  campaigns: any[];
  reports: any[];
  tickets: any[];
  mutedUserNames: string[];
  connections: Connection[];
  clusters: Cluster[];
  auditLogs: any[];
  staff: any[];
  adStats: any;
  intelligenceMetrics: any;
  withdrawalHistory: any[];
  paymentRequests: any[];
  referralLink: string;
  pendingTransaction: any;
  activeSubscriptions: Set<string>;
  login: (identifier: string, p: string) => Promise<{ success: boolean; message?: string }>;
  signup: (d: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  uploadMedia: (file: File, bucketId: string) => Promise<string>;
  addPost: (post: any) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleUnlikePost: (postId: string) => Promise<void>;
  toggleSavePost: (postId: string) => void;
  toggleFollowUser: (username: string) => Promise<void>;
  updateCurrentUser: (data: Partial<User>) => Promise<void>;
  updateSettings: (data: Partial<AppSettings>) => void;
  setSearchOpen: (open: boolean) => void;
  setSelectedChatId: (id: string | null) => void;
  setSelectedPostId: (id: string | null) => void;
  setSelectedImageUrl: (url: string | null) => void;
  setSelectedVideoUrl: (url: string | null) => void;
  openCommentHub: (postId: string) => void;
  closeCommentHub: () => void;
  openGiftHub: (user: User) => void;
  closeGiftHub: () => void;
  setActiveStoryIndex: (index: number | null) => void;
  triggerHaptic: (intensity?: number) => void;
  isPostLiked: (postId: string) => boolean;
  isPostUnliked: (postId: string) => boolean;
  isPostSaved: (postId: string) => boolean;
  isPostUnlocked: (postId: string) => boolean;
  isFollowing: (username: string) => boolean;
  isSubscribed: (username: string) => boolean;
  addComment: (postId: string, text: string) => Promise<void>;
  addReply: (postId: string, parentId: string, text: string) => Promise<void>;
  addStory: (segment: any) => Promise<void>;
  voteOnStoryPoll: (storyId: string, segmentId: string, optionIndex: number) => Promise<void>;
  voteOnPostPoll: (postId: string, optionIndex: number) => Promise<void>;
  toggleMuteUser: (username: string) => void;
  togglePinPost: (postId: string) => Promise<void>;
  archivePost: (postId: string) => Promise<void>;
  updateGatewaySettings: (data: any) => Promise<void>;
  addAuditLog: (action: string, details: string) => Promise<void>;
  initiateTransaction: (data: any) => void;
  cancelTransaction: () => void;
  createPaymentRequest: (screenshot: string) => Promise<void>;
  approvePaymentRequest: (id: string) => Promise<void>;
  rejectPaymentRequest: (id: string) => Promise<void>;
  recordWithdrawal: (node: any) => Promise<void>;
  processWithdrawal: (id: string, status: 'APPROVED' | 'REJECTED') => Promise<void>;
  verifyUser: (cost: number, currency: 'DIAMOND' | 'STAR') => Promise<void>;
  processGiftTransaction: (cost: number, currency: 'GOLD' | 'DIAMOND') => Promise<void>;
  unlockPost: (postId: string, cost: number) => Promise<void>;
  subscribeToCreator: (username: string, cost: number) => Promise<void>;
  cancelSubscription: (username: string) => Promise<void>;
  incrementShareCount: (postId: string) => Promise<void>;
  createCluster: (name: string, members: any[]) => Promise<void>;
  addMemberToCluster: (clusterId: string, member: any) => Promise<void>;
  leaveCluster: (clusterId: string) => Promise<void>;
  promoteUser: (username: string, role: any) => Promise<void>;
  demoteUser: (username: string) => Promise<void>;
  addCampaign: (data: any) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  toggleCampaignStatus: (id: string) => Promise<void>;
  recordCampaignClick: (id: string) => Promise<void>;
  initiateCall: (contact: any, type: CallType) => Promise<void>;
  acceptCall: () => Promise<void>;
  endCall: (duration?: string) => Promise<void>;
  refreshAdminData: () => Promise<void>;
  fetchProfileByUsername: (username: string) => Promise<User | null>;
  fetchComments: (postId: string) => Promise<void>;
  refreshProfiles: () => Promise<any[]>;
  refreshClusters: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  recordView: (postId: string) => Promise<void>;
  recordStoryView: (storyId: string) => Promise<void>;
  updateUserIdentity: (userId: string, data: Partial<User>) => Promise<void>;
  handleReportAction: (reportId: string, action: any) => Promise<void>;
  handleTicketAction: (ticketId: string, status: any) => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

// --- MOCK DATA NODES ---

const MOCK_USERS: User[] = [
  { id: 'u1', name: "Alex Rivera", username: "arivera", avatar: "https://picsum.photos/seed/1/400/400", isVerified: true, role: 'USER', followers: "12.5k", following: 450, category: "Digital Creator", bio: "Building the next generation of spatial vibes. 🚀" },
  { id: 'u2', name: "Sarah Chen", username: "schen_dev", avatar: "https://picsum.photos/seed/2/400/400", isVerified: true, role: 'USER', followers: "8.2k", following: 120, category: "Product Architect", bio: "Code, Coffee, and High-Velocity design." },
  { id: 'u3', name: "Marcus Stone", username: "mstone", avatar: "https://picsum.photos/seed/3/400/400", isVerified: false, role: 'USER', followers: "4.1k", following: 800, category: "Visual Storyteller", bio: "Capturing the network pulse through pixels." }
];

const MASTER_USER: User = {
  id: 'u-master', 
  name: "Amos B. Kortu", 
  username: "amos_mtl", 
  avatar: "https://picsum.photos/seed/amos/400/400", 
  isVerified: true, 
  role: 'SUPER', 
  goldBalance: 12500, 
  diamondBalance: 450, 
  starBalance: 85000,
  followers: "1.2M",
  following: 12,
  posts: 142,
  category: "Network Architect",
  bio: "Master Node at ViMore Network. Synchronizing spatial logic."
};

const INITIAL_SETTINGS: AppSettings = {
  theme: 'light', hapticIntensity: 50, isGhostMode: false, playbackQuality: 'standard', fontScale: 1, isAutoFollowEnabled: true, activeSoundSet: 'cyberpunk', isBiometricActive: false, taggingPrivacy: 'everyone', discoveryVisibility: 'everyone', showReadReceipts: true, legacyContact: null, isSilenceActive: false, silenceStart: "22:00", silenceEnd: "07:00", defaultStream: 'foryou', goldRate: 0.01, diamondRate: 0.25, ldMultiplier: 190, isReelsEnabled: true, isMusicEnabled: true, isGiftingEnabled: true, isAiVerificationActive: true, isSensitivityFilterActive: false, isFreeMode: false
};

export function PostProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const [currentUser, setCurrentUserState] = useState<User>(MASTER_USER);
  const [posts, setPostsState] = useState<Post[]>([]);
  const [activeComments, setActiveComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoadingState] = useState(true);
  const [settings, setSettingsState] = useState<AppSettings>(INITIAL_SETTINGS);
  const [gatewaySettings] = useState({ orangeName: "Prototype Admin", orangeNumber: "+23100000000", mtnName: "Prototype Admin", mtnNumber: "+23100000000" });
  const [clusters, setClustersState] = useState<Cluster[]>([]);
  const [connections, setConnectionsState] = useState<Connection[]>([]);
  const [stories, setStoriesState] = useState<any[]>([]);
  
  const [auditLogs] = useState<any[]>([]);
  const [staff] = useState<any[]>([]);
  const [adStats] = useState({ revenue: 142.50, handshakes: 1204 });
  const [intelligenceMetrics] = useState({ sentimentScore: 88, sentimentVibe: 'POSITIVE', sentimentSummary: "System optimal. Prototype pulse active.", botRisk: 2, latency: 5, cpuLoad: 8, memorySync: 45 });
  const [withdrawalHistory, setWithdrawalHistoryState] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequestsState] = useState<any[]>([]);
  const [campaigns] = useState<any[]>([]);
  const [reports] = useState<any[]>([]);
  const [tickets] = useState<any[]>([]);
  
  const [mutedUserNames, setMutedUserNamesState] = useState<string[]>([]);
  const [likedPostIds, setLikedPostIdsState] = useState<Set<string>>(new Set());
  const [unlikedPostIds, setUnlikedPostIdsState] = useState<Set<string>>(new Set());
  const [savedPostIds, setSavedPostIdsState] = useState<Set<string>>(new Set());
  const [unlockedPostIds, setUnlockedPostIdsState] = useState<Set<string>>(new Set());
  const [followingUsernames, setFollowingUsernamesState] = useState<Set<string>>(new Set(['arivera', 'schen_dev']));
  const [followerUsernames] = useState<Set<string>>(new Set(['mstone']));
  
  const [selectedPostId, setSelectedPostIdState] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatIdState] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrlState] = useState<string | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrlState] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpenState] = useState(false);
  const [activeStoryIndex, setActiveStoryIndexState] = useState<number | null>(null);
  const [isGiftHubOpen, setIsGiftHubOpenState] = useState(false);
  const [targetUserForGift, setTargetUserForGiftState] = useState<User | null>(null);
  const [activeCommentPostId, setActiveCommentPostIdState] = useState<string | null>(null);
  const [callState, setCallState] = useState<CallState>({ type: 'video', status: 'idle', contact: null });
  const [pendingTransaction, setPendingTransactionState] = useState<any>(null);

  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(intensity);
    }
  }, []);

  const refreshFeed = useCallback(async () => {
    const mockPosts: Post[] = [
      { id: 'p1', user: MOCK_USERS[0], content: "Synchronizing the latest spatial nodes in the West Africa cluster. 🌍⚡", time: "2h", likes: 1420, unlikes: 12, comments: 45, shares: 88, views: 5200, image: "https://picsum.photos/seed/p1/800/600" },
      { id: 'p2', user: MOCK_USERS[1], content: "Check out the new high-velocity reel editor! #ViMore #Creation", time: "5h", likes: 890, unlikes: 2, comments: 12, shares: 34, views: 2100, videoUrl: "https://cloud.appwrite.io/v1/storage/buckets/reel/files/67cf0660001006660ea3/view?project=vimore" },
      { id: 'p3', user: MOCK_USERS[2], content: "The network pulse is strongest at midnight. 🌙✨", time: "12h", likes: 450, unlikes: 0, comments: 8, shares: 12, views: 1200, theme: "bg-gradient-to-br from-indigo-900 to-slate-900 text-white" }
    ];
    setPostsState(mockPosts);
  }, []);

  const refreshStories = useCallback(async () => {
    const mockStories = [
      { id: 's1', user: MOCK_USERS[0], segments: [{ id: 'seg1', image: "https://picsum.photos/seed/s1/400/800", type: 'image' }], viewCount: 1204 },
      { id: 's2', user: MOCK_USERS[1], segments: [{ id: 'seg2', image: "https://picsum.photos/seed/s2/400/800", type: 'image' }], viewCount: 845 }
    ];
    setStoriesState(mockStories);
  }, []);

  const checkSession = useCallback(async () => {
    setConnectionsState(MOCK_USERS.map(u => ({ ...u, isGroup: false } as Connection)));
    setClustersState([{ id: 'c1', name: 'Design Hub', adminUsername: 'arivera', members: MOCK_USERS, isGroup: true }]);
    await refreshFeed();
    await refreshStories();
    setIsLoadingState(false);
  }, [refreshFeed, refreshStories]);

  useEffect(() => { checkSession(); }, [checkSession]);

  const login = useCallback(async (identifier: string, p: string) => {
    return { success: true };
  }, []);

  const signup = useCallback(async (data: any) => {
    return { success: true };
  }, []);

  const logout = useCallback(async () => {
    window.location.reload();
  }, []);

  const uploadMedia = useCallback(async (file: File) => {
    return URL.createObjectURL(file);
  }, []);

  const addPost = useCallback(async (pData: any) => {
    const newPost: Post = {
      id: 'p-' + Date.now(),
      user: currentUser,
      time: "Now",
      likes: 0, unlikes: 0, comments: 0, shares: 0, views: 0,
      ...pData
    };
    setPostsState(prev => [newPost, ...prev]);
  }, [currentUser]);

  const deletePost = useCallback(async (id: string) => {
    setPostsState(prev => prev.filter(p => p.id !== id));
  }, []);

  const toggleLikePost = useCallback(async (id: string) => {
    triggerHaptic(20);
    setLikedPostIdsState(prev => {
      const isLiked = prev.has(id);
      const newLiked = new Set(prev);
      
      if (isLiked) {
        newLiked.delete(id);
        setPostsState(posts => posts.map(p => p.id === id ? { ...p, likes: p.likes - 1 } : p));
      } else {
        newLiked.add(id);
        setPostsState(posts => posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
        // Mutual exclusion: Clear unlike
        setUnlikedPostIdsState(uPrev => {
          const un = new Set(uPrev);
          un.delete(id);
          return un;
        });
      }
      return newLiked;
    });
  }, [triggerHaptic]);

  const toggleUnlikePost = useCallback(async (id: string) => {
    triggerHaptic(10);
    setUnlikedPostIdsState(prev => {
      const isUnliked = prev.has(id);
      const newUnliked = new Set(prev);
      
      if (isUnliked) {
        newUnliked.delete(id);
      } else {
        newUnliked.add(id);
        // Mutual exclusion: Clear like and decrement count
        setLikedPostIdsState(lPrev => {
          if (lPrev.has(id)) {
            const nl = new Set(lPrev);
            nl.delete(id);
            setPostsState(posts => posts.map(p => p.id === id ? { ...p, likes: p.likes - 1 } : p));
            return nl;
          }
          return lPrev;
        });
      }
      return newUnliked;
    });
  }, [triggerHaptic]);

  const toggleFollowUser = useCallback(async (username: string) => {
    setFollowingUsernamesState(prev => { const n = new Set(prev); if(n.has(username)) n.delete(username); else n.add(username); return n; });
  }, []);

  const initiateCall = useCallback(async (contact: any, type: CallType) => {
    setCallState({ type, status: 'outgoing', contact });
    setTimeout(() => setCallState(prev => ({ ...prev, status: 'ringing' })), 1000);
    setTimeout(() => setCallState(prev => ({ ...prev, status: 'active' })), 3000);
  }, []);

  const acceptCall = useCallback(async () => { setCallState(prev => ({ ...prev, status: 'active' })); }, []);
  const endCall = useCallback(async () => { setCallState({ type: 'audio', status: 'idle', contact: null }); }, []);

  const contextValue = useMemo(() => ({
    currentUser, posts, activeComments, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, followerUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, selectedVideoUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings, callState, stories, campaigns, reports, tickets, mutedUserNames, connections, clusters, auditLogs, staff, adStats, intelligenceMetrics, withdrawalHistory, paymentRequests, referralLink: "http://vimore.network/join/" + currentUser.username, pendingTransaction, activeSubscriptions: new Set(),
    login, signup, logout, checkSession, uploadMedia, addPost, deletePost, toggleLikePost, toggleUnlikePost, toggleSavePost: (id: string) => setSavedPostIdsState(prev => { const n = new Set(prev); if(n.has(id)) n.delete(id); else n.add(id); return n; }), toggleFollowUser, 
    updateCurrentUser: async (d: any) => { setCurrentUserState(prev => ({...prev, ...d})); }, 
    updateSettings: (d: any) => setSettingsState(prev => ({...prev, ...d})), 
    setSearchOpen: setIsSearchOpenState, setSelectedChatId: setSelectedChatIdState, setSelectedPostId: setSelectedPostIdState, setSelectedImageUrl: setSelectedImageUrlState, setSelectedVideoUrl: setSelectedVideoUrlState, 
    openCommentHub: (id: string) => { setActiveCommentPostIdState(id); setActiveComments([]); }, 
    closeCommentHub: () => setActiveCommentPostIdState(null), 
    openGiftHub: (u: any) => { setTargetUserForGiftState(u); setIsGiftHubOpenState(true); }, 
    closeGiftHub: () => setIsGiftHubOpenState(false), 
    setActiveStoryIndex: setActiveStoryIndexState, triggerHaptic, 
    isPostLiked: (id: string) => likedPostIds.has(id), isPostUnliked: (id: string) => unlikedPostIds.has(id), isPostSaved: (id: string) => savedPostIds.has(id), isPostUnlocked: (id: string) => unlockedPostIds.has(id), isFollowing: (u: string) => followingUsernames.has(u), isSubscribed: (u: string) => false,
    addComment: async (pid: string, text: string) => { setActiveComments(prev => [{ id: Date.now().toString(), userId: 'me', userName: currentUser.name, userAvatar: currentUser.avatar, text, time: "Just now", timestamp: Date.now() }, ...prev]); },
    addReply: async (pid: string, paid: string, text: string) => { setActiveComments(prev => [{ id: Date.now().toString(), userId: 'me', userName: currentUser.name, userAvatar: currentUser.avatar, text, parentId: paid, time: "Just now", timestamp: Date.now() }, ...prev]); },
    addStory: async (seg: any) => { setStoriesState(prev => [{ id: Date.now().toString(), user: currentUser, segments: [seg], viewCount: 0 }, ...prev]); },
    boostNode: async () => { toast({ title: "Boost Materialized" }); },
    recordView: async () => {}, recordStoryView: async () => {}, createCluster: async (name: string, members: any[]) => { setClustersState(prev => [{ id: Date.now().toString(), name, adminUsername: currentUser.username, members, isGroup: true }, ...prev]); }, 
    addMemberToCluster: async () => {}, leaveCluster: async () => {}, initiateTransaction: (d: any) => setPendingTransactionState(d), cancelTransaction: () => setPendingTransactionState(null), createPaymentRequest: async () => { setPendingTransactionState(null); }, recordWithdrawal: async () => {}, verifyUser: async () => { setCurrentUserState(prev => ({...prev, isVerified: true})); }, processGiftTransaction: async (cost: number) => { setCurrentUserState(prev => ({...prev, goldBalance: (prev.goldBalance || 0) - cost})); }, unlockPost: async (id: string) => { setUnlockedPostIdsState(prev => new Set(prev).add(id)); }, subscribeToCreator: async () => {}, fetchComments: async () => {}, refreshFeed, refreshStories, refreshProfiles: async () => [], refreshClusters: async () => {}, fetchProfileByUsername: async (u: string) => MOCK_USERS.find(user => user.username === u) || null, promoteUser: async () => {}, demoteUser: async () => {}, voteOnPostPoll: async () => {}, cancelSubscription: async () => {}, incrementShareCount: async () => {}, toggleMuteUser: (u: string) => setMutedUserNamesState(prev => prev.includes(u) ? prev.filter(n => n !== u) : [...prev, u]), togglePinPost: async () => {}, archivePost: async () => {}, addAuditLog: async () => {}, approvePaymentRequest: async () => {}, rejectPaymentRequest: async () => {}, processWithdrawal: async () => {}, addCampaign: async () => {}, deleteCampaign: async () => {}, toggleCampaignStatus: async () => {}, recordCampaignClick: async () => {}, initiateCall, acceptCall, endCall, refreshAdminData: async () => {}, updateUserIdentity: async () => {}, handleReportAction: async () => {}, handleTicketAction: async () => {}, voteOnStoryPoll: async () => {}, updateGatewaySettings: async () => {}
  }), [currentUser, posts, activeComments, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, followerUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, selectedVideoUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings, callState, stories, campaigns, reports, tickets, mutedUserNames, connections, clusters, auditLogs, staff, adStats, intelligenceMetrics, withdrawalHistory, paymentRequests, pendingTransaction, triggerHaptic, refreshFeed, refreshStories, initiateCall, acceptCall, endCall, toast]);

  return <PostContext.Provider value={contextValue}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) throw new Error('usePosts must be used within a PostProvider');
  return context;
}
