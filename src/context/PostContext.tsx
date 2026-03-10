
'use client';

/**
 * @fileOverview ViMore Core Context Node (Self-Hosted Master)
 * Manages identity, content, economy, and communication handshakes.
 * Finalized for project: vimore | db: vimoreprod | buckets: 6 specialized.
 */

import { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import client, { 
  account, 
  ID, 
  databases,
  BUCKET_VOICENOTE,
  BUCKET_MUSIC,
  BUCKET_STORIES,
  BUCKET_PAYMENTS,
  BUCKET_REEL,
  BUCKET_IMAGES,
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
  AUDIT_LOGS_COLLECTION_ID,
  Query,
  storage,
  endpoint,
  project
} from '@/lib/appwrite';
import { useToast } from "@/hooks/use-toast";
import { signupServerAction, loginServerAction, sendVerificationCodeAction, verifyCodeAction } from '@/app/actions/auth';
import { dataURLtoFile } from '@/lib/utils';

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
  email?: string;
  phone?: string;
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
  commentNodes?: PostComment[];
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
  login: (identifier: string, p: string) => Promise<{ success: boolean; message?: string }>;
  signup: (d: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  sendVerificationCode: (identifier: string, type: 'EMAIL' | 'PHONE') => Promise<{ success: boolean; message?: string }>;
  verifyCode: (identifier: string, code: string) => Promise<boolean>;
  checkSession: () => Promise<void>;
  resendVerification: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (userId: string, secret: string, password: string) => Promise<void>;
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

const INITIAL_USER: User = {
  name: "Guest Node", username: "guest_node", avatar: "https://picsum.photos/seed/guest/400/400", isVerified: false, role: 'USER', goldBalance: 0, diamondBalance: 0, starBalance: 0
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

  // --- LOGIC NODES ---

  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(intensity);
    }
  }, []);

  const uploadMedia = useCallback(async (file: File, bucketId: string) => {
    try {
      const response = await storage.createFile(bucketId, ID.unique(), file);
      return `${endpoint}/storage/buckets/${bucketId}/files/${response.$id}/view?project=${project}`;
    } catch (e: any) { throw new Error(e.message); }
  }, []);

  const refreshFeed = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(100)]);
      setPostsState(response.documents.map(doc => ({
        id: doc.$id, 
        user: typeof doc.user === 'string' ? JSON.parse(doc.user) : doc.user, 
        content: doc.content, 
        image: doc.image, 
        images: doc.images ? JSON.parse(doc.images) : [], 
        videoUrl: doc.videoUrl, 
        time: new Date(doc.$createdAt).toLocaleDateString(), 
        likes: doc.likes || 0, 
        unlikes: doc.unlikes || 0, 
        comments: doc.comments || 0, 
        shares: doc.shares || 0, 
        views: doc.views || 0, 
        viewers: doc.viewers ? JSON.parse(doc.viewers) : [], 
        isLocked: doc.isLocked, 
        unlockPrice: doc.unlockPrice, 
        isBoosted: doc.isBoosted, 
        boostTargetViews: doc.boostTargetViews, 
        boostCurrentViews: doc.boostCurrentViews, 
        boostExpiry: doc.boostExpiry, 
        poll: doc.poll ? JSON.parse(doc.poll) : undefined,
        collaborator: doc.collaborator ? JSON.parse(doc.collaborator) : undefined
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
        viewCount: doc.viewCount || 0, 
        viewers: doc.viewers ? JSON.parse(doc.viewers) : []
      })));
    } catch (e) {}
  }, []);

  const refreshProfiles = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(100)]);
      const profiles = response.documents.map(doc => ({ ...doc, id: doc.$id, isGroup: false } as any));
      setConnectionsState(profiles);
      setStaffState(profiles.filter(p => p.role !== 'USER'));
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

  const refreshAdminData = useCallback(async () => {
    try {
      const threeDaysAgo = Date.now() - (72 * 60 * 60 * 1000);
      const [camps, reps, tix, logs, pays, withs] = await Promise.all([
        databases.listDocuments(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID),
        databases.listDocuments(APPWRITE_DATABASE_ID, REPORTS_COLLECTION_ID),
        databases.listDocuments(APPWRITE_DATABASE_ID, TICKETS_COLLECTION_ID),
        databases.listDocuments(APPWRITE_DATABASE_ID, AUDIT_LOGS_COLLECTION_ID, [Query.orderDesc('timestamp'), Query.limit(50)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, [Query.greaterThan('timestamp', threeDaysAgo)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, [Query.orderDesc('timestamp')])
      ]);
      setCampaignsState(camps.documents);
      setReportsState(reps.documents);
      setTicketsState(tix.documents);
      setAuditLogsState(logs.documents);
      setPaymentRequestsState(pays.documents);
      setWithdrawalHistoryState(withs.documents);
    } catch (e) {}
  }, []);

  const checkSession = useCallback(async () => {
    try {
      const user = await account.get();
      const profile = await databases.getDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, user.$id);
      setCurrentUserState({ id: user.$id, ...profile, isEmailVerified: user.emailVerification } as any);
      
      const history = await databases.listDocuments(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, [Query.equal('userId', user.$id)]);
      const pReqs = await databases.listDocuments(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, [Query.equal('userId', user.$id)]);
      
      const followingRes = await databases.listDocuments(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, [Query.equal('followerId', user.$id)]);
      const followersRes = await databases.listDocuments(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, [Query.equal('followingUsername', profile.username)]);
      
      setWithdrawalHistoryState(history.documents);
      setPaymentRequestsState(pReqs.documents);
      setFollowingUsernamesState(new Set(followingRes.documents.map(f => f.followingUsername)));
      setFollowerUsernamesState(new Set(followersRes.documents.map(f => f.followerUsername)));
      
      await Promise.all([refreshFeed(), refreshStories(), refreshProfiles(), refreshClusters()]);
    } catch (error) { 
      setCurrentUserState(INITIAL_USER); 
    } finally { 
      setIsLoadingState(false); 
    }
  }, [refreshFeed, refreshStories, refreshProfiles, refreshClusters]);

  const login = useCallback(async (identifier: string, p: string) => {
    try {
      const res = await loginServerAction(identifier, p);
      if (!res.success) return { success: false, message: res.message };
      await account.createEmailPasswordSession(res.email!, p);
      await checkSession();
      return { success: true };
    } catch (e: any) { 
      return { success: false, message: String(e.message || e) };
    }
  }, [checkSession]);

  const sendVerificationCode = useCallback(async (identifier: string, type: 'EMAIL' | 'PHONE') => {
    try {
      const res = await sendVerificationCodeAction(identifier, type);
      return res; // Returns result object directly
    } catch (e: any) { 
      return { success: false, message: String(e.message || e) };
    }
  }, []);

  const signup = useCallback(async (d: any) => { 
    try {
      // 1. Materialize Account & Profile
      const res = await signupServerAction({ ...d, referredBy: localStorage.getItem("vimore_referrer") });
      if (!res.success) return { success: false, message: res.message };
      
      // 2. Establish Session
      await account.createEmailPasswordSession(res.email!, d.password);
      
      // 3. Emit OTP Pulse via Brevo
      const identifier = d.email || d.phone;
      const type = d.email ? 'EMAIL' : 'PHONE';
      const otpRes = await sendVerificationCode(identifier, type);
      
      // 4. Final Handshake
      await checkSession();
      return { 
        success: otpRes.success, 
        message: otpRes.success ? undefined : `Identity Created, but OTP failed: ${otpRes.message}` 
      };
    } catch (e: any) {
      return { success: false, message: String(e.message || e) };
    }
  }, [checkSession, sendVerificationCode]);

  const logout = useCallback(async () => {
    try { 
      await account.deleteSession('current'); 
      setCurrentUserState(INITIAL_USER); 
      window.location.href = "/"; 
    } catch (e) {}
  }, []);

  const verifyCode = useCallback(async (identifier: string, code: string) => {
    try {
      const res = await verifyCodeAction(identifier, code);
      return res.success;
    } catch (e) { return false; }
  }, []);

  const addPost = useCallback(async (pData: any) => {
    if (!currentUser.id) return;
    try {
      const minimalUser = { name: currentUser.name, username: currentUser.username, avatar: currentUser.avatar, isVerified: currentUser.isVerified, followers: currentUser.followers };
      const docData = { 
        ...pData, 
        user: JSON.stringify(minimalUser), 
        images: JSON.stringify(pData.images || []),
        poll: pData.poll ? JSON.stringify(pData.poll) : undefined,
        collaborator: pData.collaborator ? JSON.stringify(pData.collaborator) : undefined,
        likes: 0, unlikes: 0, comments: 0, shares: 0, views: 0, viewers: JSON.stringify([]) 
      };
      await databases.createDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, ID.unique(), docData);
      await refreshFeed();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, refreshFeed]);

  const deletePost = useCallback(async (postId: string) => {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId);
      await refreshFeed();
    } catch (e) {}
  }, [refreshFeed]);

  const toggleLikePost = useCallback(async (postId: string) => {
    if (!currentUser.id) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const isLiked = likedPostIds.has(postId);
    try {
      const newLikes = isLiked ? Math.max(0, post.likes - 1) : post.likes + 1;
      await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { likes: newLikes });
      setLikedPostIdsState(prev => { const n = new Set(prev); if(n.has(postId)) n.delete(postId); else n.add(postId); return n; });
      await refreshFeed();
    } catch (e) {}
  }, [currentUser.id, posts, likedPostIds, refreshFeed]);

  const toggleUnlikePost = useCallback(async (postId: string) => {
    if (!currentUser.id) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const isUnliked = unlikedPostIds.has(postId);
    try {
      const newUnlikes = isUnliked ? Math.max(0, post.unlikes - 1) : post.unlikes + 1;
      await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { unlikes: newUnlikes });
      setUnlikedPostIdsState(prev => { const n = new Set(prev); if(n.has(postId)) n.delete(postId); else n.add(postId); return n; });
      await refreshFeed();
    } catch (e) {}
  }, [currentUser.id, posts, unlikedPostIds, refreshFeed]);

  const toggleSavePost = useCallback((id: string) => {
    setSavedPostIdsState(prev => { const n = new Set(prev); if(n.has(id)) n.delete(id); else n.add(id); return n; });
  }, []);

  const fetchComments = useCallback(async (postId: string) => {
    try {
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, COMMENTS_COLLECTION_ID, [Query.equal('postId', postId), Query.orderAsc('timestamp')]);
      setActiveComments(res.documents.map(d => ({ id: d.$id, userId: d.userId, userName: d.userName, userAvatar: d.userAvatar, text: d.text, parentId: d.parentId, timestamp: d.timestamp, time: new Date(d.timestamp).toLocaleTimeString() } as PostComment)));
    } catch (e) {}
  }, []);

  const addComment = useCallback(async (postId: string, text: string) => {
    if (!currentUser.id) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, COMMENTS_COLLECTION_ID, ID.unique(), {
        postId, userId: currentUser.id, userName: currentUser.name, userAvatar: currentUser.avatar, text, timestamp: Date.now()
      });
      const post = posts.find(p => p.id === postId);
      if (post) await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { comments: (post.comments || 0) + 1 });
      await fetchComments(postId);
      await refreshFeed();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, posts, refreshFeed, fetchComments]);

  const addReply = useCallback(async (postId: string, parentId: string, text: string) => {
    if (!currentUser.id) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, COMMENTS_COLLECTION_ID, ID.unique(), {
        postId, userId: currentUser.id, userName: currentUser.name, userAvatar: currentUser.avatar, text, parentId, timestamp: Date.now()
      });
      const post = posts.find(p => p.id === postId);
      if (post) await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { comments: (post.comments || 0) + 1 });
      await fetchComments(postId);
      await refreshFeed();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, posts, refreshFeed, fetchComments]);

  const addStory = useCallback(async (segment: any) => {
    if (!currentUser.id) return;
    try {
      const expiresAt = Date.now() + (48 * 60 * 60 * 1000);
      const minimalUser = { name: currentUser.name, username: currentUser.username, avatar: currentUser.avatar };
      await databases.createDocument(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, ID.unique(), { 
        user: JSON.stringify(minimalUser), segments: JSON.stringify([segment]), expiresAt, viewCount: 0, viewers: JSON.stringify([]) 
      });
      await refreshStories();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, refreshStories]);

  const toggleFollowUser = useCallback(async (username: string) => {
    if (!currentUser.id || !currentUser.username) return;
    triggerHaptic(20);
    const following = followingUsernames.has(username);
    try {
      if (following) {
        const res = await databases.listDocuments(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, [Query.equal('followerId', currentUser.id), Query.equal('followingUsername', username)]);
        if (res.total > 0) await databases.deleteDocument(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, res.documents[0].$id);
        setFollowingUsernamesState(prev => { const n = new Set(prev); n.delete(username); return n; });
      } else {
        await databases.createDocument(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, ID.unique(), { followerId: currentUser.id, followerUsername: currentUser.username, followingUsername: username, timestamp: Date.now() });
        setFollowingUsernamesState(prev => new Set(prev).add(username));
      }
      await refreshProfiles();
    } catch (e) {}
  }, [currentUser, followingUsernames, triggerHaptic, refreshProfiles]);

  const createCluster = useCallback(async (name: string, members: any[]) => {
    if (!currentUser.username) return;
    try {
      const memberList = [...members.map(m => ({ name: m.name, username: m.username, avatar: m.avatar })), { name: currentUser.name, username: currentUser.username, avatar: currentUser.avatar }];
      await databases.createDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, ID.unique(), { name, adminUsername: currentUser.username, members: JSON.stringify(memberList) });
      await refreshClusters();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, refreshClusters]);

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

  const initiateTransaction = useCallback((data: any) => { setPendingTransactionState(data); }, []);
  const cancelTransaction = useCallback(() => { setPendingTransactionState(null); }, []);

  const createPaymentRequest = useCallback(async (screenshot: string) => {
    if (!currentUser.id || !pendingTransaction) return;
    try {
      const file = dataURLtoFile(screenshot, `payment_${Date.now()}.jpg`);
      const vaultUrl = await uploadMedia(file, BUCKET_PAYMENTS);
      await databases.createDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, ID.unique(), {
        userId: currentUser.id, username: currentUser.username, packageName: pendingTransaction.packageName, amount: pendingTransaction.amount, currency: pendingTransaction.currency, screenshot: vaultUrl, code: pendingTransaction.code, status: 'PENDING', timestamp: Date.now()
      });
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, pendingTransaction, uploadMedia]);

  const approvePaymentRequest = useCallback(async (id: string) => {
    try {
      const req = await databases.getDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, id);
      const userProfile = await databases.getDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, req.userId);
      const amount = parseFloat(req.amount);
      const balanceKey = req.packageName.toLowerCase().includes('diamond') ? 'diamondBalance' : 'goldBalance';
      const currentBalance = userProfile[balanceKey] || 0;
      await Promise.all([
        databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, req.userId, { [balanceKey]: currentBalance + amount }),
        databases.updateDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, id, { status: 'APPROVED' })
      ]);
      await refreshAdminData();
    } catch (e) {}
  }, [refreshAdminData]);

  const rejectPaymentRequest = useCallback(async (id: string) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, id, { status: 'REJECTED' });
      await refreshAdminData();
    } catch (e) {}
  }, [refreshAdminData]);

  const recordWithdrawal = useCallback(async (node: any) => {
    if (!currentUser.id) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, ID.unique(), { userId: currentUser.id, ...node });
      setWithdrawalHistoryState(prev => [node, ...prev]);
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser]);

  const processWithdrawal = useCallback(async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, id, { status });
      await refreshAdminData();
    } catch (e) {}
  }, [refreshAdminData]);

  const verifyUser = useCallback(async (cost: number, currency: 'DIAMOND' | 'STAR') => {
    if (!currentUser.id) return;
    try {
      const balanceKey = currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance';
      const currentBalance = (currentUser as any)[balanceKey] || 0;
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, { [balanceKey]: currentBalance - cost, isVerified: true, hasEverBeenVerified: true });
      setCurrentUserState(prev => ({ ...prev, [balanceKey]: currentBalance - cost, isVerified: true, hasEverBeenVerified: true }));
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser]);

  const processGiftTransaction = useCallback(async (cost: number, currency: 'GOLD' | 'DIAMOND') => {
    if (!currentUser.id) return;
    try {
      const balanceKey = currency === 'GOLD' ? 'goldBalance' : 'diamondBalance';
      const currentBalance = (currentUser as any)[balanceKey] || 0;
      if (currentBalance < cost) throw new Error("Insufficient balance");
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, { [balanceKey]: currentBalance - cost });
      setCurrentUserState(prev => ({ ...prev, [balanceKey]: currentBalance - cost }));
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser]);

  const unlockPost = useCallback(async (postId: string, cost: number) => {
    await processGiftTransaction(cost, 'GOLD');
    setUnlockedPostIdsState(prev => new Set(prev).add(postId));
  }, [processGiftTransaction]);

  const subscribeToCreator = useCallback(async (username: string, cost: number) => {
    if (!currentUser.id) return;
    try {
      const currentDiamonds = currentUser.diamondBalance || 0;
      if (currentDiamonds < cost) throw new Error("Insufficient diamonds");
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, { diamondBalance: currentDiamonds - cost });
      setActiveSubscriptionsState(prev => new Set(prev).add(username));
      setCurrentUserState(prev => ({ ...prev, diamondBalance: currentDiamonds - cost }));
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser]);

  const cancelSubscription = useCallback((u: string) => {
    setActiveSubscriptionsState(prev => { const n = new Set(prev); n.delete(u); return n; });
  }, []);

  const boostNode = useCallback(async (nodeId: string, targetViews: number, durationDays: number, cost: number, currency: 'DIAMOND' | 'STAR', type: 'POST' | 'REEL' | 'SONIC') => {
    if (!currentUser.id) return;
    try {
      const balanceKey = currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance';
      const currentBalance = (currentUser as any)[balanceKey] || 0;
      if (currentBalance < cost) throw new Error("Insufficient energy");
      const collId = type === 'SONIC' ? SONGS_COLLECTION_ID : POSTS_COLLECTION_ID;
      const boostExpiry = Date.now() + (durationDays * 24 * 60 * 60 * 1000);
      await Promise.all([
        databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, { [balanceKey]: currentBalance - cost }),
        databases.updateDocument(APPWRITE_DATABASE_ID, collId, nodeId, { isBoosted: true, boostTargetViews: targetViews, boostCurrentViews: 0, boostExpiry })
      ]);
      await refreshFeed();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, refreshFeed]);

  const recordView = useCallback(async (postId: string) => {
    if (!currentUser.id) return;
    const post = posts.find(p => p.id === postId);
    if (!post || (post.viewers || []).includes(currentUser.id)) return;
    try {
      const updatedViewers = [...(post.viewers || []), currentUser.id];
      await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { 
        views: (post.views || 0) + 1, viewers: JSON.stringify(updatedViewers) 
      });
    } catch (e) {}
  }, [currentUser.id, posts]);

  const recordStoryView = useCallback(async (storyId: string) => {
    if (!currentUser.id) return;
    const story = stories.find(s => s.id === storyId);
    if (!story || (story.viewers || []).includes(currentUser.id)) return;
    try {
      const updatedViewers = [...(story.viewers || []), currentUser.id];
      await databases.updateDocument(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, storyId, { 
        viewCount: (story.viewCount || 0) + 1, viewers: JSON.stringify(updatedViewers) 
      });
      await refreshStories();
    } catch (e) {}
  }, [currentUser.id, stories, refreshStories]);

  const promoteUser = useCallback(async (username: string, role: any) => {
    const profiles = await refreshProfiles();
    const userNode = profiles.find(p => p.username === username);
    if(userNode) await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userNode.$id, { role });
    await refreshProfiles();
  }, [refreshProfiles]);

  const demoteUser = useCallback(async (username: string) => {
    const profiles = await refreshProfiles();
    const userNode = profiles.find(p => p.username === username);
    if(userNode) await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userNode.$id, { role: 'USER' });
    await refreshProfiles();
  }, [refreshProfiles]);

  const addCampaign = useCallback(async (data: any) => {
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, ID.unique(), { ...data, impressions: 0, clicks: 0, isActive: true, timestamp: Date.now() });
      await refreshAdminData();
    } catch (e) {}
  }, [refreshAdminData]);

  const deleteCampaign = useCallback(async (id: string) => {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, id);
      await refreshAdminData();
    } catch (e) {}
  }, [refreshAdminData]);

  const toggleCampaignStatus = useCallback(async (id: string) => {
    const camp = campaigns.find(c => c.id === id);
    if(camp) await databases.updateDocument(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, id, { isActive: !camp.isActive });
    await refreshAdminData();
  }, [campaigns, refreshAdminData]);

  const recordCampaignClick = useCallback(async (id: string) => {
    const camp = campaigns.find(c => c.id === id);
    if(camp) await databases.updateDocument(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, id, { clicks: (camp.clicks || 0) + 1 });
  }, [campaigns]);

  const initiateCall = useCallback(async (contact: any, type: CallType) => {
    setCallState({ type, status: 'outgoing', contact, channelName: `call_${Date.now()}` });
  }, []);

  const acceptCall = useCallback(async () => { setCallState(prev => ({ ...prev, status: 'active' })); }, []);
  const endCall = useCallback(async () => { setCallState({ type: 'audio', status: 'idle', contact: null }); }, []);

  const togglePinPost = useCallback(async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if(!post) return;
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { isPinned: !post.isPinned });
      await refreshFeed();
    } catch (e) {}
  }, [posts, refreshFeed]);

  const archivePost = useCallback(async (postId: string) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { isArchived: true });
      await refreshFeed();
    } catch (e) {}
  }, [refreshFeed]);

  const voteOnPostPoll = useCallback(async (postId: string, optionIndex: number) => {
    const post = posts.find(p => p.id === postId);
    if(!post || !post.poll) return;
    const newPoll = { ...post.poll };
    newPoll.options[optionIndex].votes += 1;
    newPoll.totalVotes += 1;
    newPoll.voters = { ...(newPoll.voters || {}), [currentUser.username]: optionIndex };
    await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { poll: JSON.stringify(newPoll) });
    await refreshFeed();
  }, [posts, currentUser.username, refreshFeed]);

  const fetchProfileByUsername = useCallback(async (username: string) => {
    try {
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', username)]);
      return res.total > 0 ? (res.documents[0] as any) : null;
    } catch (e) { return null; }
  }, []);

  const updateCurrentUser = useCallback(async (d: any) => { 
    if(currentUser.id) { 
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, d); 
      setCurrentUserState(prev => ({...prev, ...d})); 
    } 
  }, [currentUser.id]);

  const updateSettings = useCallback((d: Partial<AppSettings>) => { setSettingsState(prev => ({...prev, ...d})); }, []);
  const updateGatewaySettings = useCallback(async (d: any) => { setGatewaySettingsState(d); }, []);

  const updateUserIdentity = useCallback(async (userId: string, data: Partial<User>) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userId, data);
      await refreshProfiles();
    } catch (e) {}
  }, [refreshProfiles]);

  const handleReportAction = useCallback(async (reportId: string, action: any) => {
    try {
      if (action === 'DELETE') await databases.deleteDocument(APPWRITE_DATABASE_ID, REPORTS_COLLECTION_ID, reportId);
      toast({ title: "Audit Action Logged" });
      await refreshAdminData();
    } catch (e) {}
  }, [toast, refreshAdminData]);

  const handleTicketAction = useCallback(async (ticketId: string, status: any) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, TICKETS_COLLECTION_ID, ticketId, { status });
      toast({ title: "Status Synchronized" });
      await refreshAdminData();
    } catch (e) {}
  }, [toast, refreshAdminData]);

  const addAuditLog = useCallback(async (action: string, details: string) => {
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, AUDIT_LOGS_COLLECTION_ID, ID.unique(), {
        admin: currentUser.username, action, details, timestamp: Date.now()
      });
    } catch (e) {}
  }, [currentUser.username]);

  const incrementShareCount = useCallback(async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if(post) await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { shares: (post.shares || 0) + 1 });
    await refreshFeed();
  }, [posts, refreshFeed]);

  const toggleMuteUser = useCallback((u: string) => {
    setMutedUserNamesState(prev => prev.includes(u) ? prev.filter(n => n !== u) : [...prev, u]);
  }, []);

  const resendVerification = useCallback(async () => { await account.createVerification(window.location.origin + '/auth/verify'); }, []);
  const forgotPassword = useCallback(async (email: string) => { await account.createRecovery(email, window.location.origin + '/auth/recovery'); }, []);
  const resetPassword = useCallback(async (u: string, s: string, p: string) => { await account.updateRecovery(u, s, p, p); }, []);

  const openCommentHub = useCallback((id: string) => { setActiveCommentPostIdState(id); fetchComments(id); }, [fetchComments]);
  const closeCommentHub = useCallback(() => { setActiveCommentPostIdState(null); }, []);
  const openGiftHub = useCallback((u: any) => { setTargetUserForGiftState(u); setIsGiftHubOpenState(true); }, []);
  const closeGiftHub = useCallback(() => { setIsGiftHubOpenState(false); }, []);
  const setActiveStoryIndex = useCallback((idx: number | null) => { setActiveStoryIndexState(idx); }, []);

  const voteOnStoryPoll = useCallback(async (storyId: string, segmentId: string, optionIndex: number) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;
    const segments = [...story.segments];
    const segmentIdx = segments.findIndex(seg => seg.id === segmentId);
    if (segmentIdx === -1 || !segments[segmentIdx].poll) return;
    
    segments[segmentIdx].poll.options[optionIndex].votes += 1;
    await databases.updateDocument(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, storyId, { segments: JSON.stringify(segments) });
    await refreshStories();
  }, [stories, refreshStories]);

  // --- CONTEXT PROVIDER VALUE ---

  const contextValue = useMemo(() => ({
    currentUser, posts, activeComments, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, followerUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, selectedVideoUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings, callState, stories, campaigns, reports, tickets, mutedUserNames, connections, clusters, auditLogs, staff, adStats, intelligenceMetrics, withdrawalHistory, paymentRequests, referralLink: "http://vimore.network/join/" + currentUser.username, pendingTransaction, activeSubscriptions,
    login, signup, logout, sendVerificationCode, verifyCode, checkSession, resendVerification, forgotPassword, resetPassword, uploadMedia, addPost, deletePost, toggleLikePost, toggleUnlikePost, toggleSavePost, toggleFollowUser, updateCurrentUser, updateSettings, updateGatewaySettings, setSearchOpen: setIsSearchOpenState, setSelectedChatId: setSelectedChatIdState, setSelectedPostId: setSelectedPostIdState, setSelectedImageUrl: setSelectedImageUrlState, setSelectedVideoUrl: setSelectedVideoUrlState, openCommentHub, closeCommentHub, openGiftHub, closeGiftHub, setActiveStoryIndex, triggerHaptic, isPostLiked: (id: string) => likedPostIds.has(id), isPostUnliked: (id: string) => unlikedPostIds.has(id), isPostSaved: (id: string) => savedPostIds.has(id), isPostUnlocked: (id: string) => unlockedPostIds.has(id), isFollowing: (u: string) => followingUsernames.has(u), isSubscribed: (u: string) => activeSubscriptions.has(u), addComment, addReply, addStory, boostNode, recordView, recordStoryView, createCluster, addMemberToCluster, leaveCluster, initiateTransaction, cancelTransaction, createPaymentRequest, recordWithdrawal, verifyUser, processGiftTransaction, unlockPost, subscribeToCreator, fetchComments, refreshFeed, refreshStories, refreshProfiles, refreshClusters, fetchProfileByUsername, promoteUser, demoteUser, voteOnPostPoll, cancelSubscription, incrementShareCount, toggleMuteUser, togglePinPost, archivePost, addAuditLog, approvePaymentRequest, rejectPaymentRequest, processWithdrawal, addCampaign, deleteCampaign, toggleCampaignStatus, recordCampaignClick, initiateCall, acceptCall, endCall, refreshAdminData, updateUserIdentity, handleReportAction, handleTicketAction, voteOnStoryPoll
  }), [currentUser, posts, activeComments, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, followerUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, selectedVideoUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings, callState, stories, campaigns, reports, tickets, mutedUserNames, connections, clusters, auditLogs, staff, adStats, intelligenceMetrics, withdrawalHistory, paymentRequests, login, signup, logout, checkSession, resendVerification, forgotPassword, resetPassword, uploadMedia, addPost, deletePost, toggleLikePost, toggleUnlikePost, toggleSavePost, toggleFollowUser, updateCurrentUser, updateSettings, updateGatewaySettings, openCommentHub, closeCommentHub, openGiftHub, closeGiftHub, triggerHaptic, addComment, addReply, addStory, boostNode, recordView, recordStoryView, createCluster, addMemberToCluster, leaveCluster, initiateTransaction, cancelTransaction, createPaymentRequest, recordWithdrawal, verifyUser, processGiftTransaction, unlockPost, subscribeToCreator, fetchComments, refreshFeed, refreshStories, refreshProfiles, refreshClusters, fetchProfileByUsername, promoteUser, demoteUser, voteOnPostPoll, cancelSubscription, incrementShareCount, toggleMuteUser, togglePinPost, archivePost, addAuditLog, approvePaymentRequest, rejectPaymentRequest, processWithdrawal, addCampaign, deleteCampaign, toggleCampaignStatus, recordCampaignClick, initiateCall, acceptCall, endCall, refreshAdminData, updateUserIdentity, handleReportAction, handleTicketAction, setActiveStoryIndex, voteOnStoryPoll]);

  useEffect(() => { checkSession(); }, [checkSession]);

  return <PostContext.Provider value={contextValue}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) throw new Error('usePosts must be used within a PostProvider');
  return context;
}
