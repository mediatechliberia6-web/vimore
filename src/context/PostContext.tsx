
'use client';

/**
 * @fileOverview ViMore Core Context Node
 * Manages identity, content, economy, and communication handshakes.
 * Synchronized with Self-Hosted IP: 46.225.183.141
 */

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
  CAMPAIGNS_COLLECTION_ID,
  REPORTS_COLLECTION_ID,
  TICKETS_COLLECTION_ID,
  SONGS_COLLECTION_ID,
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
  signup: (data: any) => Promise<void>;
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
  boostNode: (nodeId: string, targetViews: number, durationDays: number, cost: number, currency: 'DIAMOND' | 'STAR', type: any) => Promise<void>;
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

const INITIAL_USER: User = {
  name: "Guest Node",
  username: "guest_node",
  avatar: "https://picsum.photos/seed/guest/400/400",
  isVerified: false,
  role: 'USER',
  goldBalance: 0,
  diamondBalance: 0,
  starBalance: 0
};

const INITIAL_SETTINGS: AppSettings = {
  theme: 'light', hapticIntensity: 50, isGhostMode: false, playbackQuality: 'standard', fontScale: 1, isAutoFollowEnabled: true, activeSoundSet: 'cyberpunk', isBiometricActive: false, taggingPrivacy: 'everyone', discoveryVisibility: 'everyone', showReadReceipts: true, legacyContact: null, isSilenceActive: false, silenceStart: "22:00", silenceEnd: "07:00", defaultStream: 'foryou', goldRate: 0.01, diamondRate: 0.25, ldMultiplier: 190, isReelsEnabled: true, isMusicEnabled: true, isGiftingEnabled: true, isAiVerificationActive: true, isSensitivityFilterActive: false, isFreeMode: false
};

export function PostProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // --- STATE NODES ---
  const [currentUser, setCurrentUserState] = useState<User>(INITIAL_USER);
  const [posts, setPostsState] = useState<Post[]>([]);
  const [activeComments, setActiveComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoadingState] = useState(true);
  const [settings, setSettingsState] = useState<AppSettings>(INITIAL_SETTINGS);
  const [gatewaySettings, setGatewaySettingsState] = useState({ orangeName: "Amos Kortu", orangeNumber: "+231778451835", mtnName: "Amos Kortu", mtnNumber: "+231889322188" });
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

  // --- LOGIC FUNCTIONS (Ordered for Initialization) ---

  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) window.navigator.vibrate(intensity);
  }, []);

  const uploadMedia = useCallback(async (file: File) => {
    try {
      const response = await storage.createFile(APPWRITE_BUCKET_ID, ID.unique(), file);
      return `${endpoint}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${response.$id}/view?project=${project}`;
    } catch (e: any) { throw new Error(e.message); }
  }, []);

  const refreshFeed = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(50)]);
      setPostsState(response.documents.map(doc => ({
        id: doc.$id, 
        user: typeof doc.user === 'string' ? JSON.parse(doc.user) : doc.user, 
        content: doc.content, 
        image: doc.image,
        images: doc.images ? JSON.parse(doc.images) : [], 
        videoUrl: doc.videoUrl,
        time: new Date(doc.$createdAt).toLocaleDateString(), 
        likes: doc.likes || 0, unlikes: doc.unlikes || 0, comments: doc.comments || 0, 
        shares: doc.shares || 0, views: doc.views || 0, viewers: doc.viewers || [],
        isLocked: doc.isLocked, unlockPrice: doc.unlockPrice,
        isBoosted: doc.isBoosted, boostTargetViews: doc.boostTargetViews, boostCurrentViews: doc.boostCurrentViews, boostExpiry: doc.boostExpiry,
        poll: doc.poll ? JSON.parse(doc.poll) : undefined
      } as Post)));
    } catch (e) {}
  }, []);

  const refreshStories = useCallback(async () => {
    try {
      const now = Date.now();
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, [Query.greaterThan('expiresAt', now)]);
      setStoriesState(response.documents.map(doc => ({ 
        id: doc.$id, 
        user: typeof doc.user === 'string' ? JSON.parse(doc.user) : doc.user, 
        segments: typeof doc.segments === 'string' ? JSON.parse(doc.segments) : doc.segments, 
        viewCount: doc.viewCount || 0 
      })));
    } catch (e) {}
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
        id: doc.$id, name: doc.name, adminUsername: doc.adminUsername, members: JSON.parse(doc.members || '[]'), isGroup: true 
      } as Cluster)));
    } catch (e) {}
  }, []);

  const fetchComments = useCallback(async (postId: string) => {
    try {
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, COMMENTS_COLLECTION_ID, [Query.equal('postId', postId), Query.orderAsc('timestamp'), Query.limit(100)]);
      setActiveComments(res.documents.map(doc => ({ id: doc.$id, userId: doc.userId, userName: doc.userName, userAvatar: doc.userAvatar, text: doc.text, time: new Date(doc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), parentId: doc.parentId, timestamp: doc.timestamp })));
    } catch (e) {}
  }, []);

  const refreshUserReactions = useCallback(async (userId: string) => {
    try {
      const [likesRes, unlikesRes] = await Promise.all([
        databases.listDocuments(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, [Query.equal('userId', userId)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, UNLIKES_COLLECTION_ID, [Query.equal('userId', userId)])
      ]);
      setLikedPostIdsState(new Set(likesRes.documents.map(d => d.postId)));
      setUnlikedPostIdsState(new Set(unlikesRes.documents.map(d => d.postId)));
    } catch (e) {}
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const user = await account.get();
      const profile = await databases.getDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, user.$id);
      setCurrentUserState({ id: user.$id, ...profile, isEmailVerified: user.emailVerification } as any);
      
      // Sync Admin Nodes
      const history = await databases.listDocuments(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, [Query.equal('userId', user.$id)]);
      setWithdrawalHistoryState(history.documents);

      await Promise.all([refreshFeed(), refreshStories(), refreshProfiles(), refreshClusters(), refreshUserReactions(user.$id)]);
    } catch (error) { setCurrentUserState(INITIAL_USER); }
    finally { setIsLoadingState(false); }
  }, [refreshFeed, refreshStories, refreshProfiles, refreshClusters, refreshUserReactions]);

  const addPost = useCallback(async (pData: any) => {
    if (!currentUser.id) return;
    try {
      const minimalUser = { name: currentUser.name, username: currentUser.username, avatar: currentUser.avatar, isVerified: currentUser.isVerified, followers: currentUser.followers };
      await databases.createDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, ID.unique(), {
        ...pData,
        user: JSON.stringify(minimalUser),
        likes: 0, unlikes: 0, comments: 0, shares: 0, views: 0, viewers: []
      });
      await refreshFeed();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, refreshFeed]);

  const recordView = useCallback(async (postId: string) => {
    if (!currentUser.id) return;
    const post = posts.find(p => p.id === postId);
    if (!post || (post.viewers || []).includes(currentUser.id)) return;
    try {
      const updatedViewers = [...(post.viewers || []), currentUser.id];
      const updates: any = { views: (post.views || 0) + 1, viewers: updatedViewers };
      if (post.isBoosted) {
        updates.boostCurrentViews = (post.boostCurrentViews || 0) + 1;
        if (updates.boostCurrentViews >= (post.boostTargetViews || 1)) updates.isBoosted = false;
      }
      await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, updates);
      setPostsState(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
    } catch (e) {}
  }, [currentUser.id, posts]);

  const recordStoryView = useCallback(async (storyId: string) => {
    if (!currentUser.id) return;
    const story = stories.find(s => s.id === storyId);
    if (!story || (story.viewers || []).includes(currentUser.id)) return;
    try {
      const updatedViewers = [...(story.viewers || []), currentUser.id];
      await databases.updateDocument(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, storyId, {
        viewCount: (story.viewCount || 0) + 1,
        viewers: updatedViewers
      });
      await refreshStories();
    } catch (e) {}
  }, [currentUser.id, stories, refreshStories]);

  const toggleLikePost = useCallback(async (postId: string) => {
    if (!currentUser.id) return;
    triggerHaptic(20);
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const isLiked = likedPostIds.has(postId);
    const isUnliked = unlikedPostIds.has(postId);
    try {
      let finalLikes = post.likes;
      let finalUnlikes = post.unlikes;
      if (isLiked) {
        const res = await databases.listDocuments(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, [Query.equal('postId', postId), Query.equal('userId', currentUser.id)]);
        for (const doc of res.documents) await databases.deleteDocument(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, doc.$id);
        finalLikes = Math.max(0, finalLikes - 1);
        setLikedPostIdsState(prev => { const n = new Set(prev); n.delete(postId); return n; });
      } else {
        await databases.createDocument(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, ID.unique(), { postId, userId: currentUser.id });
        finalLikes += 1;
        setLikedPostIdsState(prev => { const n = new Set(prev); n.add(postId); return n; });
        if (isUnliked) {
          const res = await databases.listDocuments(APPWRITE_DATABASE_ID, UNLIKES_COLLECTION_ID, [Query.equal('postId', postId), Query.equal('userId', currentUser.id)]);
          for (const doc of res.documents) await databases.deleteDocument(APPWRITE_DATABASE_ID, UNLIKES_COLLECTION_ID, doc.$id);
          finalUnlikes = Math.max(0, finalUnlikes - 1);
          setUnlikedPostIdsState(prev => { const n = new Set(prev); n.delete(postId); return n; });
        }
      }
      await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { likes: finalLikes, unlikes: finalUnlikes });
      setPostsState(prev => prev.map(p => p.id === postId ? { ...p, likes: finalLikes, unlikes: finalUnlikes } : p));
    } catch (e) { toast({ variant: "destructive", title: "Sync Failed" }); }
  }, [currentUser.id, posts, likedPostIds, unlikedPostIds, triggerHaptic, toast]);

  const toggleUnlikePost = useCallback(async (postId: string) => {
    if (!currentUser.id) return;
    triggerHaptic(15);
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const isLiked = likedPostIds.has(postId);
    const isUnliked = unlikedPostIds.has(postId);
    try {
      let finalLikes = post.likes;
      let finalUnlikes = post.unlikes;
      if (isUnliked) {
        const res = await databases.listDocuments(APPWRITE_DATABASE_ID, UNLIKES_COLLECTION_ID, [Query.equal('postId', postId), Query.equal('userId', currentUser.id)]);
        for (const doc of res.documents) await databases.deleteDocument(APPWRITE_DATABASE_ID, UNLIKES_COLLECTION_ID, doc.$id);
        finalUnlikes = Math.max(0, finalUnlikes - 1);
        setUnlikedPostIdsState(prev => { const n = new Set(prev); n.delete(postId); return n; });
      } else {
        await databases.createDocument(APPWRITE_DATABASE_ID, UNLIKES_COLLECTION_ID, ID.unique(), { postId, userId: currentUser.id });
        finalUnlikes += 1;
        setUnlikedPostIdsState(prev => { const n = new Set(prev); n.add(postId); return n; });
        if (isLiked) {
          const res = await databases.listDocuments(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, [Query.equal('postId', postId), Query.equal('userId', currentUser.id)]);
          for (const doc of res.documents) await databases.deleteDocument(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, doc.$id);
          finalLikes = Math.max(0, finalLikes - 1);
          setLikedPostIdsState(prev => { const n = new Set(prev); n.delete(postId); return n; });
        }
      }
      await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { likes: finalLikes, unlikes: finalUnlikes });
      setPostsState(prev => prev.map(p => p.id === postId ? { ...p, likes: finalLikes, unlikes: finalUnlikes } : p));
    } catch (e) { toast({ variant: "destructive", title: "Sync Failed" }); }
  }, [currentUser.id, posts, likedPostIds, unlikedPostIds, triggerHaptic, toast]);

  const addComment = useCallback(async (postId: string, text: string) => {
    if (!currentUser.id) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, COMMENTS_COLLECTION_ID, ID.unique(), { 
        postId, userId: currentUser.id, userName: currentUser.name, userAvatar: currentUser.avatar, text, timestamp: Date.now() 
      });
      const post = posts.find(p => p.id === postId);
      if (post) await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { comments: (post.comments || 0) + 1 });
      await Promise.all([refreshFeed(), fetchComments(postId)]);
    } catch (e: any) { toast({ variant: "destructive", title: "Handshake Failed", description: e.message }); }
  }, [currentUser, posts, refreshFeed, fetchComments, toast]);

  const addReply = useCallback(async (postId: string, parentId: string, text: string) => {
    if (!currentUser.id) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, COMMENTS_COLLECTION_ID, ID.unique(), { 
        postId, userId: currentUser.id, userName: currentUser.name, userAvatar: currentUser.avatar, text, parentId, timestamp: Date.now() 
      });
      await fetchComments(postId);
    } catch (e: any) { toast({ variant: "destructive", title: "Sync Error", description: e.message }); }
  }, [currentUser, fetchComments, toast]);

  const boostNode = useCallback(async (nodeId: string, targetViews: number, durationDays: number, cost: number, currency: 'DIAMOND' | 'STAR', type: 'POST' | 'REEL' | 'SONIC') => {
    if (!currentUser.id) return;
    try {
      const balanceKey = currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance';
      const currentBalance = currentUser[balanceKey] || 0;
      if (currentBalance < cost) throw new Error("Insufficient energy");
      const collId = type === 'SONIC' ? SONGS_COLLECTION_ID : POSTS_COLLECTION_ID;
      const boostExpiry = Date.now() + (durationDays * 24 * 60 * 60 * 1000);
      await Promise.all([
        databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, { [balanceKey]: currentBalance - cost }),
        databases.updateDocument(APPWRITE_DATABASE_ID, collId, nodeId, { isBoosted: true, boostTargetViews: targetViews, boostCurrentViews: 0, boostExpiry })
      ]);
      setCurrentUserState(prev => ({ ...prev, [balanceKey]: currentBalance - cost }));
      await refreshFeed();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, refreshFeed]);

  const createCluster = useCallback(async (name: string, members: any[]) => {
    if (!currentUser.username) return;
    try {
      const memberList = [...members.map(m => ({ name: m.name, username: m.username, avatar: m.avatar })), { name: currentUser.name, username: currentUser.username, avatar: currentUser.avatar }];
      await databases.createDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, ID.unique(), { name, adminUsername: currentUser.username, members: JSON.stringify(memberList) });
      await refreshClusters();
    } catch (e: any) { toast({ variant: "destructive", title: "Cluster Forge Failed" }); }
  }, [currentUser, refreshClusters, toast]);

  const addMemberToCluster = useCallback(async (clusterId: string, member: any) => {
    const cluster = clusters.find(c => c.id === clusterId);
    if (!cluster) return;
    try {
      const updatedMembers = [...cluster.members, { name: member.name, username: member.username, avatar: member.avatar }];
      await databases.updateDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, clusterId, { members: JSON.stringify(updatedMembers) });
      await refreshClusters();
    } catch (e) {}
  }, [clusters, refreshClusters]);

  const leaveCluster = useCallback(async (clusterId: string) => {
    if (!currentUser.username) return;
    const cluster = clusters.find(c => c.id === clusterId);
    if (!cluster) return;
    try {
      if (cluster.adminUsername === currentUser.username) await databases.deleteDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, clusterId);
      else {
        const updatedMembers = cluster.members.filter(m => m.username !== currentUser.username);
        await databases.updateDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, clusterId, { members: JSON.stringify(updatedMembers) });
      }
      await refreshClusters();
    } catch (e) {}
  }, [currentUser.username, clusters, refreshClusters]);

  // --- PHASE 8 FUNCTIONS ---

  const initiateTransaction = useCallback((data: any) => {
    triggerHaptic(15);
    setPendingTransactionState(data);
  }, [triggerHaptic]);

  const cancelTransaction = useCallback(() => {
    triggerHaptic(5);
    setPendingTransactionState(null);
  }, [triggerHaptic]);

  const createPaymentRequest = useCallback(async (screenshot: string) => {
    if (!currentUser.id || !pendingTransaction) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, ID.unique(), {
        userId: currentUser.id,
        username: currentUser.username,
        packageName: pendingTransaction.packageName,
        amount: pendingTransaction.amount,
        currency: pendingTransaction.currency,
        screenshot,
        status: 'PENDING',
        code: pendingTransaction.code,
        timestamp: Date.now()
      });
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, pendingTransaction]);

  const recordWithdrawal = useCallback(async (node: any) => {
    if (!currentUser.id) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, ID.unique(), {
        ...node, userId: currentUser.id
      });
      const balanceKey = node.currency === 'GOLD' ? 'goldBalance' : 'diamondBalance';
      const currentBalance = currentUser[balanceKey] || 0;
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, {
        [balanceKey]: currentBalance - node.amount
      });
      await checkSession();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, checkSession]);

  const verifyUser = useCallback(async (cost: number, currency: 'DIAMOND' | 'STAR') => {
    if (!currentUser.id) return;
    try {
      const balanceKey = currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance';
      const currentBalance = currentUser[balanceKey] || 0;
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, {
        [balanceKey]: currentBalance - cost,
        isVerified: true,
        verificationExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000),
        hasEverBeenVerified: true
      });
      await checkSession();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, checkSession]);

  const processGiftTransaction = useCallback(async (cost: number, currency: 'GOLD' | 'DIAMOND') => {
    if (!currentUser.id) return;
    try {
      const balanceKey = currency === 'GOLD' ? 'goldBalance' : 'diamondBalance';
      const currentBalance = currentUser[balanceKey] || 0;
      if (currentBalance < cost) throw new Error("Insufficient energy");
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, {
        [balanceKey]: currentBalance - cost
      });
      await checkSession();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, checkSession]);

  const unlockPost = useCallback(async (postId: string, cost: number) => {
    if (!currentUser.id) return;
    try {
      const currentGold = currentUser.goldBalance || 0;
      if (currentGold < cost) throw new Error("Insufficient Gold");
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, {
        goldBalance: currentGold - cost
      });
      setUnlockedPostIdsState(prev => new Set(prev).add(postId));
      await checkSession();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, checkSession]);

  const subscribeToCreator = useCallback(async (username: string, cost: number) => {
    if (!currentUser.id) return;
    try {
      const currentDiamonds = currentUser.diamondBalance || 0;
      if (currentDiamonds < cost) throw new Error("Insufficient Diamonds");
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, {
        diamondBalance: currentDiamonds - cost
      });
      setActiveSubscriptionsState(prev => new Set(prev).add(username));
      await checkSession();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, checkSession]);

  const login = useCallback(async (e: string, p: string) => {
    await account.createEmailPasswordSession(e, p);
    await checkSession();
  }, [checkSession]);

  const signup = useCallback(async (d: any) => { 
    const userId = ID.unique(); 
    await account.create(userId, d.email, d.password, d.name);
    await databases.createDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userId, { 
      name: d.name, username: d.username, avatar: INITIAL_USER.avatar, dateOfBirth: d.dob, nationality: d.nationality, gender: d.gender, role: 'USER', goldBalance: 0, diamondBalance: 0, starBalance: 0, referralCount: 0, isVerified: false, referredBy: localStorage.getItem("vimore_referrer") || undefined 
    });
    await account.createEmailPasswordSession(d.email, d.password);
    await account.createVerification(window.location.origin + '/auth/verify');
    await checkSession();
  }, [checkSession]);

  const logout = useCallback(async () => {
    try { await account.deleteSession('current'); setCurrentUserState(INITIAL_USER); window.location.href = "/"; } catch (e) {}
  }, []);

  const contextValue = useMemo(() => ({
    currentUser, posts, activeComments, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, followerUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, selectedVideoUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings, callState, stories, campaigns, reports, tickets, mutedUserNames, connections, clusters, auditLogs, staff, adStats, intelligenceMetrics, withdrawalHistory, paymentRequests, referralLink: "http://vimore.network/join/" + currentUser.username, pendingTransaction, activeSubscriptions,
    login, signup, logout, resendVerification: async () => { await account.createVerification(window.location.origin + '/auth/verify'); }, checkSession, forgotPassword: async (e: string) => {}, resetPassword: async (u: string, s: string, p: string) => {}, uploadMedia,
    addPost, deletePost: async (id: string) => { await databases.deleteDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, id); await refreshFeed(); }, toggleLikePost, toggleUnlikePost, toggleSavePost: (id: string) => setSavedPostIdsState(prev => { const n = new Set(prev); if(n.has(id)) n.delete(id); else n.add(id); return n; }), toggleFollowUser: async (u: string) => {}, updateCurrentUser: async (d: any) => { if(currentUser.id) { await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, d); setCurrentUserState(prev => ({...prev, ...d})); } },
    updateSettings: (d: any) => setSettingsState(prev => ({...prev, ...d})),
    setSearchOpen: setIsSearchOpenState, setSelectedChatId: setSelectedChatIdState, setSelectedPostId: setSelectedPostIdState, setSelectedImageUrl: setSelectedImageUrlState, setSelectedVideoUrl: setSelectedVideoUrlState,
    openCommentHub: (id: string) => { setActiveCommentPostIdState(id); fetchComments(id); }, closeCommentHub: () => setActiveCommentPostIdState(null), openGiftHub: (u: any) => { setTargetUserForGiftState(u); setIsGiftHubOpenState(true); }, closeGiftHub: () => setIsGiftHubOpenState(false), setActiveStoryIndex: setActiveStoryIndexState, triggerHaptic, 
    isPostLiked: (id: string) => likedPostIds.has(id), isPostUnliked: (id: string) => unlikedPostIds.has(id), isPostSaved: (id: string) => savedPostIds.has(id), isPostUnlocked: (id: string) => unlockedPostIds.has(id), isFollowing: (u: string) => followingUsernames.has(u), isSubscribed: (u: string) => activeSubscriptions.has(u),
    addComment, addReply, addStory, voteOnStoryPoll: async (sid: string, seg: string, o: number) => {}, voteOnPostPoll: async (id: string, idx: number) => {}, toggleMuteUser: (u: string) => {}, togglePinPost: async (id: string) => {}, archivePost: async (id: string) => {},
    updateGatewaySettings: async (d: any) => {}, addAuditLog: async (a: string, d: string) => {}, approvePaymentRequest: async (id: string) => {}, rejectPaymentRequest: async (id: string) => {}, createPaymentRequest, recordWithdrawal, initiateTransaction, cancelTransaction, boostNode, verifyUser, processGiftTransaction, unlockPost, subscribeToCreator, cancelSubscription: (u: string) => {}, recordView, recordStoryView, updateUserIdentity: async (id: string, d: any) => {}, handleReportAction: async (id: string, a: any) => {}, handleTicketAction: async (id: string, s: any) => {},
    fetchProfileByUsername: async (u: string) => { const res = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', u)]); return res.total > 0 ? (res.documents[0] as any) : null; }, fetchComments, refreshProfiles, refreshClusters, refreshFeed, incrementShareCount: async (id: string) => {}, createCluster, addMemberToCluster, leaveCluster, initiateCall: async (c: any, t: any) => {}, acceptCall: async () => {}, endCall: async () => {}, refreshAdminData: async () => {}
  }), [currentUser, posts, activeComments, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, followerUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, selectedVideoUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings, callState, stories, campaigns, reports, tickets, mutedUserNames, connections, clusters, auditLogs, staff, adStats, intelligenceMetrics, withdrawalHistory, paymentRequests, login, signup, logout, checkSession, uploadMedia, toggleLikePost, toggleUnlikePost, addComment, addReply, addStory, boostNode, recordView, recordStoryView, createCluster, addMemberToCluster, leaveCluster, initiateTransaction, cancelTransaction, createPaymentRequest, recordWithdrawal, verifyUser, processGiftTransaction, unlockPost, subscribeToCreator, triggerHaptic, fetchComments, refreshFeed, refreshStories, refreshProfiles, refreshClusters]);

  useEffect(() => { checkSession(); }, [checkSession]);

  return <PostContext.Provider value={contextValue}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) throw new Error('usePosts must be used within a PostProvider');
  return context;
}
