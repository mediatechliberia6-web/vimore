'use client';

import { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback, useRef } from 'react';
import client, { 
  account, 
  ID, 
  databases,
  APPWRITE_BUCKET_ID, 
  APPWRITE_DATABASE_ID, 
  POSTS_COLLECTION_ID, 
  LIKES_COLLECTION_ID, 
  UNLIKES_COLLECTION_ID,
  COMMENTS_COLLECTION_ID, 
  FOLLOWS_COLLECTION_ID, 
  CLUSTERS_COLLECTION_ID,
  PROFILES_COLLECTION_ID,
  WITHDRAWALS_COLLECTION_ID,
  PAYMENTS_COLLECTION_ID,
  STORIES_COLLECTION_ID,
  NOTIFICATIONS_COLLECTION_ID,
  MESSAGES_COLLECTION_ID,
  SONGS_COLLECTION_ID,
  ALBUMS_COLLECTION_ID,
  PLAYLISTS_COLLECTION_ID,
  REPORTS_COLLECTION_ID,
  TICKETS_COLLECTION_ID,
  Query,
  storage,
  endpoint,
  project
} from '@/lib/appwrite';
import { useToast } from "@/hooks/use-toast";

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
  $id?: string;
  name: string;
  username: string;
  avatar: string;
  cover?: string;
  isVerified?: boolean;
  isOnline?: boolean;
  followers?: string | number;
  following?: string | number;
  posts?: string | number;
  bio?: string;
  category?: string;
  profession?: string;
  school?: string;
  relationshipStatus?: string;
  dateOfBirth?: string;
  nationality?: string;
  gender?: 'Male' | 'Female';
  lastModifiedName?: number;
  lastModifiedDob?: number;
  pronouns?: string;
  joinDate?: string;
  introUrl?: string; 
  language?: string;
  goldBalance?: number;
  diamondBalance?: number;
  starBalance?: number;
  referralCount?: number;
  verificationExpiry?: number;
  hasEverBeenVerified?: boolean;
  role?: 'SUPER' | 'FINANCIAL' | 'MODERATOR' | 'USER';
  isEmailVerified?: boolean;
  referredBy?: string;
}

export interface Post {
  id: string;
  user: User;
  collaborator?: User;
  content: string;
  time: string;
  likes: number;
  unlikes: number;
  comments: number;
  shares: number;
  views: number;
  viewers?: string[];
  images?: string[];
  image?: string;
  videoUrl?: string; 
  imageFilter?: string;
  theme?: string;
  language?: string;
  commentsDisabled?: boolean;
  isPinned?: boolean;
  isLocked?: boolean;
  unlockPrice?: number;
  poll?: any;
  sharedPost?: any;
  isCampaign?: boolean;
  actionUrl?: string;
  actionLabel?: string;
  isBoosted?: boolean;
  boostTargetViews?: number;
  boostCurrentViews?: number;
  boostExpiry?: number;
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
  lastMessage?: string;
  lastTime?: string;
}

export interface Connection extends User {
  followsYou?: boolean;
  isGroup: false;
  lastMessage?: string;
  lastTime?: string;
}

export type CallType = 'video' | 'audio';
export type CallStatus = 'idle' | 'incoming' | 'outgoing' | 'active' | 'ringing';

export interface CallState {
  type: CallType;
  status: CallStatus;
  contact: any | null;
  channelName?: string;
  token?: string;
  startTime?: number;
  callId?: string;
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
  selectedChatId: string | null;
  selectedPostId: string | null;
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
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string, password: string, name: string, username: string, dob: string, nationality: string, gender: 'Male' | 'Female' }) => Promise<void>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  checkSession: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (userId: string, secret: string, password: string) => Promise<void>;
  uploadMedia: (file: File) => Promise<string>;
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
  triggerReferralPulse: (referralCode?: string) => void;
  verifyUser: (cost: number, currency: 'DIAMOND' | 'STAR') => Promise<void>;
  processGiftTransaction: (cost: number, currency: 'GOLD' | 'DIAMOND') => Promise<void>;
  unlockPost: (postId: string, cost: number) => Promise<void>;
  subscribeToCreator: (username: string, cost: number) => Promise<void>;
  cancelSubscription: (username: string) => Promise<void>;
  recordAdMaterialization: () => void;
  recordAdHandshake: (revenue: number) => void;
  updateIntelligence: (data: any) => void;
  incrementShareCount: (postId: string) => Promise<void>;
  createCluster: (name: string, members: any[]) => Promise<void>;
  addMemberToCluster: (clusterId: string, member: any) => Promise<void>;
  leaveCluster: (clusterId: string) => Promise<void>;
  promoteUser: (username: string, role: 'FINANCIAL' | 'MODERATOR') => Promise<void>;
  demoteUser: (username: string) => Promise<void>;
  addCampaign: (data: any) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  toggleCampaignStatus: (id: string) => Promise<void>;
  recordCampaignClick: (id: string) => Promise<void>;
  boostNode: (nodeId: string, targetViews: number, durationDays: number, cost: number, currency: 'DIAMOND' | 'STAR', type: 'POST' | 'REEL' | 'SONIC') => Promise<void>;
  initiateCall: (contact: any, type: CallType) => Promise<void>;
  receiveCall: (contact: any, type: CallType, channelName: string, token: string, callId: string) => void;
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
  handleReportAction: (reportId: string, action: 'BAN' | 'DELETE' | 'DISMISS') => Promise<void>;
  handleTicketAction: (ticketId: string, status: 'PENDING' | 'RESOLVED') => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const INITIAL_USER: User = {
  name: "Guest Node",
  username: "guest_node",
  avatar: "https://picsum.photos/seed/guest/400/400",
  bio: "Digital explorer of the ViMore network.",
  isOnline: true,
  isVerified: false,
  role: 'USER',
  goldBalance: 0,
  diamondBalance: 0,
  starBalance: 0,
  referralCount: 0
};

const INITIAL_SETTINGS: AppSettings = {
  theme: 'light',
  hapticIntensity: 50,
  isGhostMode: false,
  playbackQuality: 'standard',
  fontScale: 1,
  isAutoFollowEnabled: true,
  activeSoundSet: 'cyberpunk',
  isBiometricActive: false,
  taggingPrivacy: 'everyone',
  discoveryVisibility: 'everyone',
  showReadReceipts: true,
  legacyContact: null,
  isSilenceActive: false,
  silenceStart: "22:00",
  silenceEnd: "07:00",
  defaultStream: 'foryou',
  goldRate: 0.01,
  diamondRate: 0.25,
  ldMultiplier: 190, 
  isReelsEnabled: true,
  isMusicEnabled: true,
  isGiftingEnabled: true,
  isAiVerificationActive: true,
  isSensitivityFilterActive: false,
  isFreeMode: false
};

export function PostProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // --- STATE NODES ---
  const [currentUser, setCurrentUserState] = useState<User>(INITIAL_USER);
  const [posts, setPostsState] = useState<Post[]>([]);
  const [activeComments, setActiveComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoadingState] = useState(true);
  const [settings, setSettingsState] = useState<AppSettings>(INITIAL_SETTINGS);
  
  const [gatewaySettings, setGatewaySettingsState] = useState({ 
    orangeName: "Amos Kortu", orangeNumber: "+231778451835", mtnName: "Amos Kortu", mtnNumber: "+231889322188" 
  });

  const [clusters, setClustersState] = useState<Cluster[]>([]);
  const [connections, setConnectionsState] = useState<Connection[]>([]);
  const [stories, setStoriesState] = useState<any[]>([]);
  const [staff, setStaffState] = useState<any[]>([]);
  const [auditLogs, setAuditLogsState] = useState<any[]>([]);
  const [campaigns, setCampaignsState] = useState<any[]>([]);
  const [reports, setReportsState] = useState<any[]>([]);
  const [tickets, setTicketsState] = useState<any[]>([]);
  const [mutedUserNames, setMutedUserNamesState] = useState<string[]>([]);
  const [activeSubscriptions, setActiveSubscriptionsState] = useState<Set<string>>(new Set());
  const [adStats, setAdStatsState] = useState({ revenue: 0, handshakes: 0 });
  const [intelligenceMetrics, setIntelligenceMetricsState] = useState({ sentimentScore: 75, sentimentVibe: 'POSITIVE', sentimentSummary: "System optimal.", botRisk: 5, latency: 45, cpuLoad: 12, memorySync: 84 });
  
  const [likedPostIds, setLikedPostIdsState] = useState<Set<string>>(new Set());
  const [unlikedPostIds, setUnlikedPostIdsState] = useState<Set<string>>(new Set());
  const [savedPostIds, setSavedPostIdsState] = useState<Set<string>>(new Set());
  const [unlockedPostIds, setUnlockedPostIdsState] = useState<Set<string>>(new Set());
  const [followingUsernames, setFollowingUsernamesState] = useState<Set<string>>(new Set());
  const [followerUsernames, setFollowerUsernamesState] = useState<Set<string>>(new Set());
  
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
  const [withdrawalHistory, setWithdrawalHistoryState] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequestsState] = useState<any[]>([]);
  const [pendingTransaction, setPendingTransactionState] = useState<any>(null);

  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(intensity);
    }
  }, []);

  // --- REFRESH NODES (Phase 3 Prep) ---
  const refreshFeed = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(50)]);
      setPostsState(response.documents.map(doc => ({
        id: doc.$id, user: typeof doc.user === 'string' ? JSON.parse(doc.user) : doc.user, content: doc.content, image: doc.image,
        images: doc.images ? JSON.parse(doc.images) : [], videoUrl: doc.videoUrl,
        time: new Date(doc.$createdAt).toLocaleDateString(), likes: doc.likes || 0, unlikes: doc.unlikes || 0,
        comments: doc.comments || 0, shares: doc.shares || 0, views: doc.views || 0, viewers: doc.viewers || [],
        theme: doc.theme, language: doc.language, isLocked: doc.isLocked, unlockPrice: doc.unlockPrice,
        isBoosted: doc.isBoosted, boostTargetViews: doc.boostTargetViews, boostCurrentViews: doc.boostCurrentViews,
        boostExpiry: doc.boostExpiry, poll: doc.poll ? JSON.parse(doc.poll) : undefined
      } as Post)));
    } catch (error) {}
  }, []);

  const refreshProfiles = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(100)]);
      const profiles = response.documents.map(doc => ({ ...doc, id: doc.$id, isGroup: false } as any));
      setConnectionsState(profiles);
      return profiles;
    } catch (e) { return []; }
  }, []);

  const refreshClusters = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID);
      setClustersState(response.documents.map(doc => ({
        id: doc.$id, name: doc.name, adminUsername: doc.adminUsername,
        members: JSON.parse(doc.members || '[]'), isGroup: true
      } as Cluster)));
    } catch (e) {}
  }, []);

  const refreshStories = useCallback(async () => {
    try {
      const now = Date.now();
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, [Query.greaterThan('expiresAt', now)]);
      setStoriesState(response.documents.map(doc => ({
        id: doc.$id, user: typeof doc.user === 'string' ? JSON.parse(doc.user) : doc.user,
        segments: typeof doc.segments === 'string' ? JSON.parse(doc.segments) : doc.segments,
        isCloseFriends: doc.isCloseFriends, viewCount: doc.viewCount || 0, viewers: doc.viewers || []
      })));
    } catch (e) {}
  }, []);

  const fetchComments = useCallback(async (postId: string) => {
    try {
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, COMMENTS_COLLECTION_ID, [Query.equal('postId', postId), Query.orderAsc('timestamp'), Query.limit(100)]);
      setActiveComments(res.documents.map(doc => ({
        id: doc.$id, userId: doc.userId, userName: doc.userName, userAvatar: doc.userAvatar, text: doc.text,
        time: new Date(doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        parentId: doc.parentId, timestamp: doc.timestamp
      })));
    } catch (e) {}
  }, []);

  // --- AUTH NODES (PHASE 2 MATERIALIZATION) ---
  const checkSession = useCallback(async () => {
    try {
      const user = await account.get();
      let profile;
      try { 
        profile = await databases.getDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, user.$id); 
      } catch (e) { 
        // Fallback Handshake: Profile Node missing
        profile = { name: user.name, username: user.email.split('@')[0], avatar: INITIAL_USER.avatar, role: 'USER' }; 
      }
      
      setCurrentUserState({ 
        id: user.$id, 
        name: profile.name, 
        username: profile.username, 
        avatar: profile.avatar || INITIAL_USER.avatar, 
        cover: profile.cover,
        isOnline: true, 
        isVerified: profile.isVerified || false, 
        role: profile.role || 'USER', 
        goldBalance: profile.goldBalance || 0, 
        diamondBalance: profile.diamondBalance || 0, 
        starBalance: profile.starBalance || 0, 
        referralCount: profile.referralCount || 0, 
        hasEverBeenVerified: profile.hasEverBeenVerified || false, 
        dateOfBirth: profile.dateOfBirth, 
        nationality: profile.nationality, 
        gender: profile.gender, 
        isEmailVerified: user.emailVerification,
        followers: profile.followers || 0, 
        following: profile.following || 0,
        referredBy: profile.referredBy
      });
      
      await Promise.all([refreshFeed(), refreshStories(), refreshProfiles(), refreshClusters()]);
    } catch (error) { 
      setCurrentUserState(INITIAL_USER); 
    } finally { 
      setIsLoadingState(false); 
    }
  }, [refreshFeed, refreshStories, refreshProfiles, refreshClusters]);

  const login = useCallback(async (email: string, password: string) => {
    try { 
      await account.createEmailPasswordSession(email, password); 
      await checkSession(); 
    } catch (e: any) { 
      throw new Error(e.message); 
    }
  }, [checkSession]);

  const signup = useCallback(async (data: any) => {
    try {
      const userId = ID.unique();
      const referrer = typeof window !== 'undefined' ? localStorage.getItem("vimore_referrer") : null;

      await account.create(userId, data.email, data.password, data.name);
      
      // Materialize Profile Document
      await databases.createDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userId, {
        name: data.name, 
        username: data.username, 
        avatar: INITIAL_USER.avatar, 
        dateOfBirth: data.dob,
        nationality: data.nationality, 
        gender: data.gender, 
        role: 'USER', 
        goldBalance: 0,
        diamondBalance: 0, 
        starBalance: 0, 
        referralCount: 0, 
        isVerified: false,
        referredBy: referrer || undefined
      });

      await login(data.email, data.password);
      
      // Identity Pulse: Emit verification link
      await account.createVerification(window.location.origin + '/auth/verify');
      
      if (referrer) localStorage.removeItem("vimore_referrer");
    } catch (e: any) { 
      throw new Error(e.message); 
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await account.deleteSession('current');
      setCurrentUserState(INITIAL_USER);
      window.location.href = "/";
    } catch (e: any) {}
  }, []);

  const resendVerification = useCallback(async () => {
    try {
      await account.createVerification(window.location.origin + '/auth/verify');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }, []);

  const updateCurrentUser = useCallback(async (data: Partial<User>) => {
    if (!currentUser.id) return;
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, data);
      setCurrentUserState(prev => ({ ...prev, ...data }));
    } catch (e: any) {
      throw new Error(e.message);
    }
  }, [currentUser.id]);

  const uploadMedia = useCallback(async (file: File) => {
    try {
      const response = await storage.createFile(APPWRITE_BUCKET_ID, ID.unique(), file);
      return `${endpoint}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${response.$id}/view?project=${project}`;
    } catch (e: any) { throw new Error(e.message); }
  }, []);

  // --- LOGIC HANDSHAKES (Phase 2 Skeletons) ---
  const toggleLikePost = useCallback(async (postId: string) => {}, []);
  const toggleUnlikePost = useCallback(async (postId: string) => {}, []);
  const toggleSavePost = useCallback((postId: string) => {}, []);
  const toggleFollowUser = useCallback(async (username: string) => {}, []);
  const addPost = useCallback(async (post: any) => {}, []);
  const deletePost = useCallback(async (postId: string) => {}, []);
  const addComment = useCallback(async (postId: string, text: string) => {}, []);
  const addReply = useCallback(async (postId: string, parentId: string, text: string) => {}, []);
  const addStory = useCallback(async (segment: any) => {}, []);
  const recordView = useCallback(async (postId: string) => {}, []);

  const contextValue = useMemo(() => ({
    currentUser, posts, activeComments, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, followerUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, selectedVideoUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings, callState, stories, campaigns, reports, tickets, mutedUserNames, connections, clusters, auditLogs, staff, adStats, intelligenceMetrics, withdrawalHistory, paymentRequests, referralLink: "http://vimore.network/join/" + currentUser.username, pendingTransaction, activeSubscriptions,
    login, signup, logout, resendVerification, checkSession, forgotPassword: async (e: string) => {}, resetPassword: async (u: string, s: string, p: string) => {}, uploadMedia,
    addPost, deletePost, toggleLikePost, toggleUnlikePost, toggleSavePost, toggleFollowUser, updateCurrentUser,
    updateSettings: (d: any) => { setSettingsState(prev => ({ ...prev, ...d })); },
    setSearchOpen: setIsSearchOpenState, setSelectedChatId: setSelectedChatIdState, setSelectedPostId: setSelectedPostIdState, setSelectedImageUrl: setSelectedImageUrlState, setSelectedVideoUrl: setSelectedVideoUrlState,
    openCommentHub: (id: string) => { setActiveCommentPostIdState(id); fetchComments(id); }, closeCommentHub: () => setActiveCommentPostIdState(null), openGiftHub: (u: User) => { setTargetUserForGiftState(u); setIsGiftHubOpenState(true); }, closeGiftHub: () => setIsGiftHubOpenState(false), setActiveStoryIndex: setActiveStoryIndexState, triggerHaptic, 
    isPostLiked: (id: string) => likedPostIds.has(id), isPostUnliked: (id: string) => unlikedPostIds.has(id), isPostSaved: (id: string) => savedPostIds.has(id), isPostUnlocked: (id: string) => unlockedPostIds.has(id), 
    isFollowing: (u: string) => followingUsernames.has(u), isSubscribed: (u: string) => activeSubscriptions.has(u), 
    addComment, addReply, addStory, voteOnStoryPoll: async (s: string, seg: string, o: number) => {}, voteOnPostPoll: async (p: string, o: number) => {}, toggleMuteUser: (u: string) => {}, togglePinPost: async (id: string) => {}, archivePost: async (id: string) => {},
    updateGatewaySettings: async (d: any) => {}, addAuditLog: async (a: string, d: string) => {}, approvePaymentRequest: async (id: string) => {}, rejectPaymentRequest: async (id: string) => {}, createPaymentRequest: async (s: string) => {}, initiateCall: async (c: any, t: CallType) => {}, acceptCall: async () => {}, endCall: async () => {}, refreshAdminData: async () => {}, promoteUser: async (u: string, r: any) => {}, demoteUser: async (u: string) => {}, addCampaign: async (d: any) => {}, deleteCampaign: async (id: string) => {}, toggleCampaignStatus: async (id: string) => {}, recordCampaignClick: async (id: string) => {}, boostNode: async (n: string, t: number, d: number, c: number, cur: any, type: any) => {}, verifyUser: async (c: number, cur: any) => {}, processGiftTransaction: async (c: number, cur: any) => {}, unlockPost: async (id: string, c: number) => {}, subscribeToCreator: async (u: string, c: number) => {}, cancelSubscription: (u: string) => {}, recordView, recordStoryView: async (id: string) => {}, updateUserIdentity: async (id: string, d: any) => {}, handleReportAction: async (id: string, a: any) => {}, handleTicketAction: async (id: string, s: any) => {},
    fetchProfileByUsername: async (u: string) => { return null; }, fetchComments, refreshProfiles, refreshClusters, refreshFeed, recordWithdrawal: async (n: any) => {}, receiveCall: (c: any, t: CallType, ch: string, tk: string, id: string) => {}, initiateTransaction: (d: any) => {}, cancelTransaction: () => {}
  }), [currentUser, posts, activeComments, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, followerUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, selectedVideoUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings, callState, stories, campaigns, reports, tickets, mutedUserNames, connections, clusters, auditLogs, staff, adStats, intelligenceMetrics, withdrawalHistory, paymentRequests, login, signup, logout, checkSession, uploadMedia, toggleLikePost, toggleUnlikePost, triggerHaptic, fetchComments, addComment, addReply, recordView, resendVerification, updateCurrentUser, addPost, deletePost, toggleSavePost, toggleFollowUser]);

  useEffect(() => { checkSession(); }, [checkSession]);

  return <PostContext.Provider value={contextValue}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) throw new Error('usePosts must be used within a PostProvider');
  return context;
}
