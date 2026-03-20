'use client';

import { createContext, useContext, useState, startTransition, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  MOCK_CURRENT_USER,
  MOCK_POSTS,
  MOCK_CONNECTIONS,
  MOCK_CLUSTERS,
  MOCK_STORIES,
  MOCK_CHAT_MESSAGES,
  MOCK_CAMPAIGNS,
  MOCK_PAYMENT_REQUESTS,
  MOCK_WITHDRAWALS,
  MOCK_AUDIT_LOGS,
  MOCK_USERS,
} from '@/lib/mock-data';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  hapticIntensity: number;
  isGhostMode: boolean;
  playbackQuality: 'standard' | 'pro-hd';
  fontScale: number;
  isAutoFollowEnabled: boolean;
  activeSoundSet: 'cyberpunk' | 'lofi';
  isBiometricActive: boolean;
  isHardwareEnrolled: boolean;
  taggingPrivacy: 'everyone' | 'friends';
  discoveryVisibility: 'everyone' | 'mutual';
  showReadReceipts: boolean;
  legacyContact: string | null;
  isSilenceActive: boolean;
  silenceStart: string;
  silenceEnd: string;
  defaultStream: 'foryou';
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
  $id: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  avatar: string;
  cover?: string;
  isVerified?: boolean;
  followers?: string | number;
  following?: string | number;
  friendsCount?: number;
  posts?: string | number;
  bio?: string;
  category?: string;
  gender?: 'Male' | 'Female';
  nationality?: string;
  dateOfBirth?: string;
  goldBalance?: number;
  diamondBalance?: number;
  starBalance?: number;
  referralCount?: number;
  role?: 'SUPER' | 'FINANCIAL' | 'MODERATOR' | 'USER';
  joinDate?: string;
  isEmailVerified?: boolean;
  hasEverBeenVerified?: boolean;
  language?: string;
}

export interface Post {
  $id: string;
  user: User;
  content: string;
  time: string;
  likes: number;
  unlikes: number;
  comments: number;
  shares: number;
  views: number;
  image?: string;
  images?: string[];
  videoUrl?: string;
  theme?: string;
  isLocked?: boolean;
  unlockPrice?: number;
  isBoosted?: boolean;
  boostTargetViews?: number;
  boostCurrentViews?: number;
  boostExpiry?: number;
  commentNodes?: PostComment[];
}

export interface PostComment {
  $id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  time: string;
  parentId?: string;
  timestamp: number;
}

export interface Cluster {
  $id: string;
  name: string;
  adminUsername: string;
  avatar?: string;
  cover?: string;
  isAddLocked?: boolean;
  members: User[];
  isGroup: true;
}

export interface Connection extends User {
  followsYou?: boolean;
  isGroup: false;
  isOnline?: boolean;
  lastMessage?: string;
  lastTime?: string;
}

export interface ChatMessage {
  $id: string;
  sender: "me" | "them";
  senderName?: string;
  senderAvatar?: string;
  senderId: string;
  text?: string;
  time: string;
  status: "sent" | "delivered" | "read";
  type: "text" | "photo" | "video" | "link" | "voice" | "tag" | "workspace" | "call";
  mediaUrl?: string;
  voiceDuration?: string;
  isViewOnce?: boolean;
  isViewed?: boolean;
  isDownloaded?: boolean;
  reactions?: string[];
  callData?: {
    type: 'audio' | 'video';
    status: 'started' | 'missed' | 'ended';
    duration?: string;
  };
}

export interface CallState {
  $id?: string;
  type: 'audio' | 'video';
  status: 'idle' | 'incoming' | 'outgoing' | 'active' | 'ringing';
  contact: any | null;
  channelName?: string;
  token?: string;
}

interface PostContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  posts: Post[];
  activeComments: PostComment[];
  isLoading: boolean;
  initError: string | null;
  likedPostIds: Set<string>;
  unlikedPostIds: Set<string>;
  savedPostIds: Set<string>;
  unlockedPostIds: Set<string>;
  seenPostIds: Set<string>;
  followingUsernames: Set<string>;
  followerUsernames: Set<string>;
  friendUsernames: Set<string>;
  sentRequestUsernames: Set<string>;
  receivedRequestUsernames: Set<string>;
  acceptedStrangerUsernames: Set<string>;
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
  chatMessages: Record<string, ChatMessage[]>;
  login: (identifier: string, p: string) => Promise<{ success: boolean; message?: string }>;
  signup: (d: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  uploadMedia: (file: File, bucketId?: string) => Promise<string>;
  addPost: (post: any) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleUnlikePost: (postId: string) => Promise<void>;
  toggleSavePost: (postId: string) => void;
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
  isFriend: (username: string) => boolean;
  isRequestSent: (username: string) => boolean;
  isRequestReceived: (username: string) => boolean;
  sendFriendRequest: (username: string) => Promise<void>;
  confirmFriendRequest: (username: string) => Promise<void>;
  cancelFriendRequest: (username: string) => Promise<void>;
  unfriendUser: (username: string) => Promise<void>;
  acceptMessageRequest: (username: string) => Promise<void>;
  declineMessageRequest: (username: string) => Promise<void>;
  isSubscribed: (username: string) => boolean;
  addComment: (postId: string, text: string) => Promise<void>;
  addReply: (postId: string, parentId: string, text: string) => Promise<void>;
  addStory: (segment: any) => Promise<void>;
  voteOnStoryPoll: (storyId: string, segmentId: string, optionIndex: number) => Promise<void>;
  voteOnPostPoll: (postId: string, optionIndex: number) => Promise<void>;
  toggleMuteUser: (username: string) => void;
  togglePinPost: (postId: string) => Promise<void>;
  archivePost: (postId: string) => Promise<void>;
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
  viewedPostIds: Set<string>;
  createCluster: (name: string, members: any[]) => Promise<void>;
  addMemberToCluster: (clusterId: string, member: any) => Promise<void>;
  leaveCluster: (clusterId: string) => Promise<void>;
  updateCluster: (clusterId: string, updates: { name?: string; cover?: string; isAddLocked?: boolean }) => Promise<void>;
  promoteUser: (username: string, role: any) => Promise<void>;
  demoteUser: (username: string) => Promise<void>;
  addCampaign: (data: any) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  toggleCampaignStatus: (id: string) => Promise<void>;
  recordCampaignClick: (id: string) => Promise<void>;
  initiateCall: (contact: any, type: 'audio' | 'video') => Promise<void>;
  acceptCall: () => Promise<void>;
  endCall: (duration?: string) => Promise<void>;
  refreshAdminData: () => Promise<void>;
  fetchProfileByUsername: (username: string) => Promise<User | null>;
  fetchComments: (postId: string) => Promise<void>;
  refreshProfiles: () => Promise<any[]>;
  refreshClusters: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  refreshStories: () => Promise<void>;
  recordView: (postId: string) => Promise<void>;
  recordStoryView: (storyId: string) => Promise<void>;
  updateUserIdentity: (userId: string, data: Partial<User>) => Promise<void>;
  handleReportAction: (reportId: string, action: any) => Promise<void>;
  handleTicketAction: (ticketId: string, status: any) => Promise<void>;
  sendChatMessage: (recipientId: string, message: Partial<ChatMessage>) => Promise<void>;
  purgeVibeCache: () => Promise<void>;
  archiveIdentityNode: () => Promise<void>;
  boostNode: (nodeId: string, promisedViews: number, duration: number, cost: number, currency: 'DIAMOND' | 'STAR', type: 'POST' | 'REEL' | 'SONIC') => Promise<void>;
  enrollHardwareBiometrics: () => Promise<boolean>;
  verifyHardwareBiometrics: () => Promise<boolean>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const INITIAL_SETTINGS: AppSettings = {
  theme: 'light', hapticIntensity: 50, isGhostMode: false, playbackQuality: 'standard',
  fontScale: 1, isAutoFollowEnabled: true, activeSoundSet: 'cyberpunk', isBiometricActive: false,
  isHardwareEnrolled: false, taggingPrivacy: 'everyone', discoveryVisibility: 'everyone',
  showReadReceipts: true, legacyContact: null, isSilenceActive: false, silenceStart: "22:00",
  silenceEnd: "07:00", defaultStream: 'foryou', goldRate: 0.01, diamondRate: 0.25,
  ldMultiplier: 190, isReelsEnabled: true, isMusicEnabled: true, isGiftingEnabled: true,
  isAiVerificationActive: true, isSensitivityFilterActive: false, isFreeMode: false,
};

const OFFICIAL_GATEWAY = {
  orangeName: "Amos Kortu",
  orangeNumber: "+231778451835",
  mtnName: "Amos Kortu",
  mtnNumber: "+231889322188",
};

export function PostProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const router = useRouter();

  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [posts, setPostsState] = useState<Post[]>([]);
  const [activeComments, setActiveComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoadingState] = useState(true);
  const [initError] = useState<string | null>(null);
  const [settings, setSettingsState] = useState<AppSettings>(INITIAL_SETTINGS);

  const [clusters, setClustersState] = useState(MOCK_CLUSTERS);
  const [connections] = useState<Connection[]>(MOCK_CONNECTIONS);
  const [stories, setStoriesState] = useState<any[]>(MOCK_STORIES);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(MOCK_CHAT_MESSAGES);
  const [campaigns, setCampaignsState] = useState<any[]>(MOCK_CAMPAIGNS);
  const [paymentRequests, setPaymentRequests] = useState<any[]>(MOCK_PAYMENT_REQUESTS);
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>(MOCK_WITHDRAWALS);
  const [auditLogs, setAuditLogs] = useState<any[]>(MOCK_AUDIT_LOGS);

  const [likedPostIds, setLikedPostIdsState] = useState<Set<string>>(new Set());
  const [unlikedPostIds, setUnlikedPostIdsState] = useState<Set<string>>(new Set());
  const [viewedPostIds, setViewedPostIdsState] = useState<Set<string>>(new Set());
  const [savedPostIds, setSavedPostIdsState] = useState<Set<string>>(new Set());
  const [unlockedPostIds, setUnlockedPostIdsState] = useState<Set<string>>(new Set());
  const [seenPostIds, setSeenPostIdsState] = useState<Set<string>>(new Set());

  const [followingUsernames, setFollowingUsernamesState] = useState<Set<string>>(
    new Set(['maya_chen', 'jordan_blake', 'priya_sharma'])
  );
  const [followerUsernames] = useState<Set<string>>(
    new Set(['maya_chen', 'leo_martinez', 'sofia_andersen'])
  );
  const [friendUsernames, setFriendUsernamesState] = useState<Set<string>>(
    new Set(['maya_chen', 'jordan_blake'])
  );
  const [sentRequestUsernames, setSentRequestUsernamesState] = useState<Set<string>>(new Set());
  const [receivedRequestUsernames] = useState<Set<string>>(new Set());
  const [acceptedStrangerUsernames] = useState<Set<string>>(new Set());
  const [activeSubscriptions, setActiveSubscriptionsState] = useState<Set<string>>(new Set());

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
  const [mutedUserNames, setMutedUserNames] = useState<string[]>([]);

  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate && settings.hapticIntensity > 0) {
      window.navigator.vibrate((intensity * settings.hapticIntensity) / 50);
    }
  }, [settings.hapticIntensity]);

  const checkSession = useCallback(async () => {
    setIsLoadingState(true);
    await new Promise(r => setTimeout(r, 300));
    setCurrentUserState(MOCK_CURRENT_USER);
    setPostsState(MOCK_POSTS);
    setIsLoadingState(false);
  }, []);

  useEffect(() => { checkSession(); }, [checkSession]);

  const login = useCallback(async (identifier: string, _p: string) => {
    setIsLoadingState(true);
    await new Promise(r => setTimeout(r, 600));
    setCurrentUserState(MOCK_CURRENT_USER);
    setPostsState(MOCK_POSTS);
    setIsLoadingState(false);
    toast({ title: "Welcome back!", description: "You are now signed in." });
    return { success: true };
  }, [toast]);

  const signup = useCallback(async (data: any) => {
    setIsLoadingState(true);
    await new Promise(r => setTimeout(r, 800));
    const newUser: User = {
      ...MOCK_CURRENT_USER,
      name: data.name || MOCK_CURRENT_USER.name,
      username: data.username || MOCK_CURRENT_USER.username,
      email: data.email,
      goldBalance: 0,
      diamondBalance: 0,
      starBalance: 0,
    };
    setCurrentUserState(newUser);
    setPostsState(MOCK_POSTS);
    setIsLoadingState(false);
    toast({ title: "Account created!", description: "Welcome to ViMore." });
    return { success: true };
  }, [toast]);

  const logout = useCallback(async () => {
    setCurrentUserState(null);
    toast({ title: "Signed out", description: "See you next time!" });
    router.push("/");
  }, [router, toast]);

  const updateCurrentUser = useCallback(async (data: Partial<User>) => {
    setCurrentUserState(prev => prev ? { ...prev, ...data } : null);
    toast({ title: "Profile updated" });
  }, [toast]);

  const updateSettings = (data: Partial<AppSettings>) => {
    setSettingsState(prev => ({ ...prev, ...data }));
  };

  const refreshFeed = useCallback(async () => {
    setPostsState([...MOCK_POSTS]);
  }, []);

  const refreshStories = useCallback(async () => {
    setStoriesState([...MOCK_STORIES]);
  }, []);

  const refreshAdminData = useCallback(async () => {}, []);

  const addPost = async (p: any) => {
    if (!currentUser) return;
    const newPost: Post = {
      $id: 'post_' + Date.now(),
      user: currentUser,
      content: p.content || '',
      time: 'Just now',
      likes: 0, unlikes: 0, comments: 0, shares: 0, views: 0,
      image: p.images?.[0] || p.image,
      images: p.images,
      videoUrl: p.videoUrl,
      theme: p.theme,
      imageFilter: p.imageFilter,
      feeling: p.feeling,
      location: p.location,
      commentsDisabled: p.commentsDisabled,
      poll: p.poll ? (typeof p.poll === 'string' ? JSON.parse(p.poll) : p.poll) : undefined,
      isLocked: p.isLocked,
      unlockPrice: p.unlockPrice,
      sharedPost: p.sharedPost,
    };
    setPostsState(prev => [newPost, ...prev]);
    toast({ title: "Post published!" });
  };

  const deletePost = async (id: string) => {
    setPostsState(prev => prev.filter(p => p.$id !== id));
    toast({ title: "Post deleted" });
  };

  const toggleLikePost = async (id: string) => {
    const wasLiked = likedPostIds.has(id);
    const wasUnliked = unlikedPostIds.has(id);
    setLikedPostIdsState(prev => { const n = new Set(prev); if (wasLiked) n.delete(id); else n.add(id); return n; });
    setUnlikedPostIdsState(prev => { const n = new Set(prev); n.delete(id); return n; });
    setPostsState(prev => prev.map(post =>
      post.$id === id ? {
        ...post,
        likes: Math.max(0, post.likes + (wasLiked ? -1 : 1)),
        unlikes: wasUnliked ? Math.max(0, post.unlikes - 1) : post.unlikes,
      } : post
    ));
  };

  const toggleUnlikePost = async (id: string) => {
    const wasUnliked = unlikedPostIds.has(id);
    const wasLiked = likedPostIds.has(id);
    setUnlikedPostIdsState(prev => { const n = new Set(prev); if (wasUnliked) n.delete(id); else n.add(id); return n; });
    setLikedPostIdsState(prev => { const n = new Set(prev); n.delete(id); return n; });
    setPostsState(prev => prev.map(post =>
      post.$id === id ? {
        ...post,
        unlikes: Math.max(0, post.unlikes + (wasUnliked ? -1 : 1)),
        likes: wasLiked ? Math.max(0, post.likes - 1) : post.likes,
      } : post
    ));
  };

  const addComment = async (postId: string, text: string) => {
    if (!currentUser) return;
    const newComment: PostComment = {
      $id: 'comment_' + Date.now(),
      userId: currentUser.$id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text,
      time: 'Just now',
      timestamp: Date.now(),
    };
    setActiveComments(prev => [...prev, newComment]);
    startTransition(() => {
      setPostsState(prev => prev.map(p =>
        p.$id === postId
          ? { ...p, comments: p.comments + 1, commentNodes: [...(p.commentNodes || []), newComment] }
          : p
      ));
    });
  };

  const addReply = async (postId: string, parentId: string, text: string) => {
    if (!currentUser) return;
    const newReply: PostComment = {
      $id: 'reply_' + Date.now(),
      userId: currentUser.$id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      text,
      time: 'Just now',
      timestamp: Date.now(),
      parentId,
    };
    setActiveComments(prev => [...prev, newReply]);
    startTransition(() => {
      setPostsState(prev => prev.map(p =>
        p.$id === postId
          ? { ...p, commentNodes: [...(p.commentNodes || []), newReply] }
          : p
      ));
    });
  };

  const addStory = async (segment: any) => {
    if (!currentUser) return;
    const newStory = {
      $id: 'story_' + Date.now(),
      user: currentUser,
      segments: [segment],
      expiry: new Date(Date.now() + 86400000).toISOString(),
      viewCount: 0,
    };
    setStoriesState(prev => [newStory, ...prev]);
    toast({ title: "Story posted!" });
  };

  const sendFriendRequest = useCallback(async (targetUsername: string) => {
    setSentRequestUsernamesState(p => new Set(p).add(targetUsername));
    toast({ title: "Friend request sent!" });
  }, [toast]);

  const confirmFriendRequest = useCallback(async (username: string) => {
    setFriendUsernamesState(p => new Set(p).add(username));
  }, []);

  const cancelFriendRequest = useCallback(async (username: string) => {
    setSentRequestUsernamesState(p => { const n = new Set(p); n.delete(username); return n; });
  }, []);

  const unfriendUser = useCallback(async (username: string) => {
    setFriendUsernamesState(p => { const n = new Set(p); n.delete(username); return n; });
    toast({ title: "Unfriended" });
  }, [toast]);

  const sendChatMessage = useCallback(async (recipientId: string, message: Partial<ChatMessage>) => {
    if (!currentUser) return;
    const newMsg: ChatMessage = {
      $id: 'msg_' + Date.now(),
      sender: 'me',
      senderId: currentUser.$id,
      text: message.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      type: message.type || 'text',
      ...message,
    };
    setChatMessages(prev => ({
      ...prev,
      [recipientId]: [...(prev[recipientId] || []), newMsg],
    }));
  }, [currentUser]);

  const unlockPost = useCallback(async (postId: string, cost: number) => {
    if (!currentUser) return;
    setUnlockedPostIdsState(p => new Set(p).add(postId));
    setCurrentUserState(prev => prev ? { ...prev, goldBalance: (prev.goldBalance || 0) - cost } : null);
    toast({ title: "Post unlocked!" });
  }, [currentUser, toast]);

  const subscribeToCreator = useCallback(async (username: string, cost: number) => {
    setActiveSubscriptionsState(p => new Set(p).add(username));
    setCurrentUserState(prev => prev ? { ...prev, diamondBalance: (prev.diamondBalance || 0) - cost } : null);
    toast({ title: "Subscribed!", description: `You are now subscribed to ${username}` });
  }, [toast]);

  const cancelSubscription = useCallback(async (username: string) => {
    setActiveSubscriptionsState(p => { const n = new Set(p); n.delete(username); return n; });
    toast({ title: "Subscription cancelled" });
  }, [toast]);

  const processGiftTransaction = useCallback(async (cost: number, currency: 'GOLD' | 'DIAMOND') => {
    setCurrentUserState(prev => {
      if (!prev) return null;
      return currency === 'GOLD'
        ? { ...prev, goldBalance: (prev.goldBalance || 0) - cost }
        : { ...prev, diamondBalance: (prev.diamondBalance || 0) - cost };
    });
    toast({ title: "Gift sent! 🎁" });
  }, [toast]);

  const verifyUser = useCallback(async (cost: number, currency: 'DIAMOND' | 'STAR') => {
    setCurrentUserState(prev => {
      if (!prev) return null;
      return currency === 'DIAMOND'
        ? { ...prev, isVerified: true, diamondBalance: (prev.diamondBalance || 0) - cost }
        : { ...prev, isVerified: true, starBalance: (prev.starBalance || 0) - cost };
    });
    toast({ title: "Verified! ✅" });
  }, [toast]);

  const initiateCall = useCallback(async (contact: any, type: 'audio' | 'video') => {
    const channelName = `vimore_call_${Date.now()}`;
    setCallState({ type, status: 'outgoing', contact, channelName, token: 'mock_token' });
  }, []);

  const acceptCall = useCallback(async () => {
    setCallState(prev => ({ ...prev, status: 'active' }));
  }, []);

  const endCall = useCallback(async (duration?: string) => {
    setCallState({ type: 'video', status: 'idle', contact: null });
  }, []);

  const addCampaign = async (d: any) => {
    const newCamp = { $id: 'camp_' + Date.now(), ...d, isActive: true, impressions: 0, clicks: 0, timestamp: new Date().toISOString() };
    setCampaignsState(prev => [newCamp, ...prev]);
  };

  const deleteCampaign = async (id: string) => {
    setCampaignsState(prev => prev.filter(c => c.$id !== id));
  };

  const toggleCampaignStatus = async (id: string) => {
    setCampaignsState(prev => prev.map(c => c.$id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const approvePaymentRequest = async (id: string) => {
    setPaymentRequests(prev => prev.map(r => r.$id === id ? { ...r, status: 'APPROVED' } : r));
  };

  const rejectPaymentRequest = async (id: string) => {
    setPaymentRequests(prev => prev.map(r => r.$id === id ? { ...r, status: 'REJECTED' } : r));
  };

  const recordWithdrawal = async (n: any) => {
    const wd = { $id: 'wd_' + Date.now(), ...n, status: 'PENDING', timestamp: new Date().toISOString() };
    setWithdrawalHistory(prev => [wd, ...prev]);
  };

  const processWithdrawal = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setWithdrawalHistory(prev => prev.map(w => w.$id === id ? { ...w, status } : w));
  };

  const fetchProfileByUsername = useCallback(async (username: string): Promise<User | null> => {
    if (username === MOCK_CURRENT_USER.username) return MOCK_CURRENT_USER;
    return MOCK_USERS.find(u => u.username === username) || null;
  }, []);

  const fetchComments = useCallback(async (postId: string) => {
    const post = posts.find(p => p.$id === postId);
    setActiveComments(post?.commentNodes || []);
  }, [posts]);

  const createCluster = async (name: string, members: any[]) => {
    const newCluster: Cluster = {
      $id: 'cluster_' + Date.now(),
      name,
      adminUsername: currentUser?.username || '',
      members: [currentUser as User, ...members],
      isGroup: true,
    };
    setClustersState(prev => [...prev, newCluster]);
    toast({ title: "Cluster created!" });
  };

  const addMemberToCluster = async (clusterId: string, member: any) => {
    setClustersState(prev => prev.map(cl =>
      cl.$id === clusterId ? { ...cl, members: [...cl.members, member] } : cl
    ));
  };

  const leaveCluster = async (clusterId: string) => {
    if (!currentUser) return;
    const cluster = clusters.find(cl => cl.$id === clusterId);
    if (!cluster) return;
    if (cluster.adminUsername === currentUser.username) {
      setClustersState(prev => prev.filter(cl => cl.$id !== clusterId));
      toast({ title: "Cluster dissolved" });
    } else {
      setClustersState(prev => prev.map(cl =>
        cl.$id === clusterId
          ? { ...cl, members: cl.members.filter(m => m.username !== currentUser.username) }
          : cl
      ));
      toast({ title: "Left cluster" });
    }
  };

  const updateCluster = async (clusterId: string, updates: { name?: string; cover?: string; isAddLocked?: boolean }) => {
    setClustersState(prev => prev.map(cl =>
      cl.$id === clusterId ? { ...cl, ...updates } : cl
    ));
  };

  const createPaymentRequest = async (screenshot: string) => {
    const req = {
      $id: 'pay_' + Date.now(),
      userId: currentUser?.$id,
      username: currentUser?.username,
      packageName: pendingTransaction?.packageName || 'Package',
      amount: pendingTransaction?.amount || '0',
      currency: pendingTransaction?.currency || 'USD',
      code: pendingTransaction?.code || 'VBC-MOCK',
      status: 'PENDING',
      timestamp: new Date().toISOString(),
    };
    setPaymentRequests(prev => [req, ...prev]);
    toast({ title: "Payment request submitted!" });
  };

  const value: PostContextType = {
    currentUser, isAuthenticated: !!currentUser, posts, activeComments, isLoading, initError,
    likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, seenPostIds, viewedPostIds,
    followingUsernames, followerUsernames, friendUsernames, sentRequestUsernames,
    receivedRequestUsernames, acceptedStrangerUsernames,
    activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, selectedVideoUrl,
    isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId,
    settings, gatewaySettings: OFFICIAL_GATEWAY, callState, stories, campaigns,
    reports: [], tickets: [], mutedUserNames, connections, clusters, auditLogs,
    staff: [], adStats: { revenue: 1240, handshakes: 320 },
    intelligenceMetrics: { sentiment: 88, velocity: 'HIGH' },
    withdrawalHistory, paymentRequests,
    referralLink: "https://www.vimore.app/join/" + (currentUser?.username || "guest"),
    pendingTransaction, activeSubscriptions, chatMessages,

    login, signup, logout, checkSession,
    uploadMedia: async (f: File) => URL.createObjectURL(f),
    addPost, deletePost, toggleLikePost, toggleUnlikePost, 
    toggleSavePost: (id: string) => setSavedPostIdsState(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; }),
    updateCurrentUser, updateSettings,
    setSearchOpen: setIsSearchOpenState,
    setSelectedChatId: setSelectedChatIdState,
    setSelectedPostId: setSelectedPostIdState,
    setSelectedImageUrl: setSelectedImageUrlState,
    setSelectedVideoUrl: setSelectedVideoUrlState,
    openCommentHub: (id: string) => setActiveCommentPostIdState(id),
    closeCommentHub: () => setActiveCommentPostIdState(null),
    openGiftHub: (u: User) => { setTargetUserForGiftState(u); setIsGiftHubOpenState(true); },
    closeGiftHub: () => setIsGiftHubOpenState(false),
    setActiveStoryIndex: setActiveStoryIndexState,
    triggerHaptic,
    isPostLiked: (id: string) => likedPostIds.has(id),
    isPostUnliked: (id: string) => unlikedPostIds.has(id),
    isPostSaved: (id: string) => savedPostIds.has(id),
    isPostUnlocked: (id: string) => unlockedPostIds.has(id),
    isFollowing: (u: string) => followingUsernames.has(u),
    isFriend: (u: string) => friendUsernames.has(u),
    isRequestSent: (u: string) => sentRequestUsernames.has(u),
    isRequestReceived: (u: string) => receivedRequestUsernames.has(u),
    isSubscribed: (u: string) => activeSubscriptions.has(u),
    sendFriendRequest, confirmFriendRequest, cancelFriendRequest, unfriendUser,
    acceptMessageRequest: async () => {}, declineMessageRequest: async () => {},
    addComment, addReply, addStory,
    voteOnStoryPoll: async () => {}, voteOnPostPoll: async () => {},
    toggleMuteUser: (u: string) => setMutedUserNames(p => p.includes(u) ? p.filter(x => x !== u) : [...p, u]),
    togglePinPost: async () => {}, archivePost: async () => {},
    addAuditLog: async (action: string, details: string) => {
      setAuditLogs(prev => [{ $id: 'log_' + Date.now(), action, details, timestamp: new Date().toISOString() }, ...prev]);
    },
    initiateTransaction: (d: any) => setPendingTransactionState(d),
    cancelTransaction: () => setPendingTransactionState(null),
    createPaymentRequest, approvePaymentRequest, rejectPaymentRequest,
    recordWithdrawal, processWithdrawal,
    verifyUser, processGiftTransaction, unlockPost, subscribeToCreator, cancelSubscription,
    incrementShareCount: async (id: string) => {
      setPostsState(prev => prev.map(p => p.$id === id ? { ...p, shares: p.shares + 1 } : p));
    },
    createCluster, addMemberToCluster, leaveCluster, updateCluster,
    promoteUser: async () => {}, demoteUser: async () => {},
    addCampaign, deleteCampaign, toggleCampaignStatus, recordCampaignClick: async () => {},
    initiateCall, acceptCall, endCall, refreshAdminData,
    fetchProfileByUsername, fetchComments,
    refreshProfiles: async () => MOCK_USERS,
    refreshClusters: async () => {},
    refreshFeed, refreshStories,
    recordView: async (id: string) => {
      if (viewedPostIds.has(id)) return;
      setViewedPostIdsState(prev => new Set(prev).add(id));
      setPostsState(prev => prev.map(p => p.$id === id ? { ...p, views: p.views + 1 } : p));
    },
    recordStoryView: async (id: string) => {
      setStoriesState(prev => prev.map(s => s.$id === id ? { ...s, viewCount: (s.viewCount || 0) + 1 } : s));
    },
    updateUserIdentity: async () => {}, handleReportAction: async () => {}, handleTicketAction: async () => {},
    sendChatMessage,
    purgeVibeCache: async () => setSeenPostIdsState(new Set()),
    archiveIdentityNode: async () => {},
    boostNode: async () => {},
    enrollHardwareBiometrics: async () => true,
    verifyHardwareBiometrics: async () => true,
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) throw new Error('usePosts must be used within a PostProvider');
  return context;
}
