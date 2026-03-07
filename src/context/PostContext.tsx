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
  COMMENTS_COLLECTION_ID, 
  FOLLOWS_COLLECTION_ID, 
  CLUSTERS_COLLECTION_ID,
  PROFILES_COLLECTION_ID,
  WITHDRAWALS_COLLECTION_ID,
  PAYMENTS_COLLECTION_ID,
  AUDIT_LOGS_COLLECTION_ID,
  STORIES_COLLECTION_ID,
  CALLS_COLLECTION_ID,
  NOTIFICATIONS_COLLECTION_ID,
  MESSAGES_COLLECTION_ID,
  SONGS_COLLECTION_ID,
  CAMPAIGNS_COLLECTION_ID,
  REPORTS_COLLECTION_ID,
  TICKETS_COLLECTION_ID,
  PLATFORM_SETTINGS_COLLECTION_ID,
  Query,
  storage
} from '@/lib/appwrite';
import { generateAgoraToken } from '@/app/actions/call';
import { useToast } from "@/hooks/use-toast";
import { dataURLtoFile } from '@/lib/utils';

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
  commentNodes?: PostComment[];
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
  user: User;
  text: string;
  time: string;
  likes: number;
  replies: PostComment[];
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
  addReply: (postId: string, commentId: string, text: string) => Promise<void>;
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

const GLOBAL_CONFIG_ID = 'master_config';

export function PostProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User>(INITIAL_USER);
  const [posts, setPostsState] = useState<Post[]>([]);
  const [isLoading, setIsLoadingState] = useState(true);
  const [settings, setSettingsState] = useState<AppSettings>(INITIAL_SETTINGS);
  
  const [gatewaySettings, setGatewaySettingsState] = useState({ 
    orangeName: "Amos Kortu", 
    orangeNumber: "+231778451835", 
    mtnName: "Amos Kortu", 
    mtnNumber: "+231889322188" 
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
  
  const [viewedNodeIds, setViewedNodeIds] = useState<Set<string>>(new Set());
  
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
  const activeCallIdRef = useRef<string | null>(null);

  const [withdrawalHistory, setWithdrawalHistoryState] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequestsState] = useState<any[]>([]);
  const [pendingTransaction, setPendingTransactionState] = useState<any>(null);

  const { toast } = useToast();

  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(intensity);
    }
  }, []);

  const addAuditLog = useCallback(async (action: string, details: string) => {
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, AUDIT_LOGS_COLLECTION_ID, ID.unique(), {
        admin: currentUser.username,
        action,
        details,
        timestamp: Date.now()
      });
    } catch (e: any) { console.error("Audit log failed:", e.message); }
  }, [currentUser.username]);

  const executeVaultTransaction = useCallback(async (options: {
    cost: number;
    currency: 'GOLD' | 'DIAMOND' | 'STAR';
    recipientUsername?: string;
    isPlatformService?: boolean;
    description: string;
  }) => {
    if (!currentUser.id) throw new Error("Identity signature missing.");

    const balanceKey = options.currency === 'GOLD' ? 'goldBalance' : options.currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance';
    const currentBalance = currentUser[balanceKey] || 0;

    if (currentBalance < options.cost) {
      throw new Error(`Insufficient ${options.currency}. Available pulse: ${currentBalance}`);
    }

    try {
      const updatedSenderBalance = currentBalance - options.cost;
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, {
        [balanceKey]: updatedSenderBalance
      });

      if (options.recipientUsername && !options.isPlatformService) {
        const recipientRes = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [
          Query.equal('username', options.recipientUsername)
        ]);

        if (recipientRes.documents.length > 0) {
          const recipient = recipientRes.documents[0];
          const creditAmount = Math.floor(options.cost * 0.7);
          const platformFee = options.cost - creditAmount;

          await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, recipient.$id, {
            [balanceKey]: (recipient[balanceKey] || 0) + creditAmount
          });

          await addAuditLog('PLATFORM_FEE_LOG', `Collected ${platformFee} ${options.currency} from ${options.description} transaction between @${currentUser.username} and @${options.recipientUsername}.`);
        }
      } else if (options.isPlatformService) {
        await addAuditLog('PLATFORM_SERVICE_LOG', `Collected ${options.cost} ${options.currency} for ${options.description} from @${currentUser.username}.`);
      }

      setCurrentUserState(prev => ({ ...prev, [balanceKey]: updatedSenderBalance }));
      return true;
    } catch (e: any) {
      console.error("Vault Handshake Failure:", e.message);
      throw new Error("Financial synchronization aborted.");
    }
  }, [currentUser, addAuditLog]);

  const refreshGlobalSettings = useCallback(async () => {
    try {
      const doc = await databases.getDocument(
        APPWRITE_DATABASE_ID,
        PLATFORM_SETTINGS_COLLECTION_ID,
        GLOBAL_CONFIG_ID
      );
      setGatewaySettingsState({
        orangeName: doc.orangeName,
        orangeNumber: doc.orangeNumber,
        mtnName: doc.mtnName,
        mtnNumber: doc.mtnNumber
      });
    } catch (e) {
      console.warn("Global settings node silent. Using fallback frequency.");
    }
  }, []);

  const refreshStories = useCallback(async () => {
    try {
      const now = Date.now();
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, [Query.greaterThan('expiresAt', now)]);
      setStoriesState(response.documents.map(doc => ({
        id: doc.$id,
        user: typeof doc.user === 'string' ? JSON.parse(doc.user) : doc.user,
        segments: typeof doc.segments === 'string' ? JSON.parse(doc.segments) : doc.segments,
        isCloseFriends: doc.isCloseFriends,
        viewCount: doc.viewCount || 0,
        viewers: doc.viewers || []
      })));
    } catch (e) {}
  }, []);

  const refreshCampaigns = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, [Query.limit(50)]);
      setCampaignsState(response.documents.map(doc => ({
        id: doc.$id,
        title: doc.title,
        content: doc.content,
        type: doc.type,
        mediaUrl: doc.mediaUrl,
        actionUrl: doc.actionUrl,
        actionLabel: doc.actionLabel,
        isActive: doc.isActive,
        clicks: doc.clicks || 0,
        impressions: doc.impressions || 0,
        timestamp: doc.$createdAt
      })));
    } catch (e) {}
  }, []);

  const refreshSafety = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, REPORTS_COLLECTION_ID, [Query.orderDesc('$createdAt')]);
      setReportsState(response.documents);
    } catch (e) {}
  }, []);

  const refreshResolution = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, TICKETS_COLLECTION_ID, [Query.orderDesc('$createdAt')]);
      setTicketsState(response.documents);
    } catch (e) {}
  }, []);

  const recordStoryView = useCallback(async (storyId: string) => {
    if (!currentUser.id || viewedNodeIds.has(storyId)) return;

    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    const viewers = story.viewers || [];
    if (viewers.includes(currentUser.id)) {
      setViewedNodeIds(prev => new Set(prev).add(storyId));
      return;
    }

    try {
      const newViews = (story.viewCount || 0) + 1;
      const updatedViewers = [...viewers, currentUser.id];
      
      await databases.updateDocument(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, storyId, {
        viewCount: newViews,
        viewers: updatedViewers
      });
      
      setViewedNodeIds(prev => new Set(prev).add(storyId));
      setStoriesState(prev => prev.map(s => s.id === storyId ? { ...s, viewCount: newViews, viewers: updatedViewers } : s));
    } catch (e) {
      console.warn("Story view pulse rejection in vault.");
    }
  }, [stories, currentUser.id, viewedNodeIds]);

  const fetchComments = useCallback(async (postId: string) => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        [Query.equal('postId', postId), Query.limit(100), Query.orderAsc('timestamp')]
      );
      
      const mappedComments: PostComment[] = response.documents.map(doc => ({
        id: doc.$id,
        user: typeof doc.user === 'string' ? JSON.parse(doc.user) : doc.user,
        text: doc.text,
        time: new Date(doc.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        likes: doc.likes || 0,
        replies: [],
        parentId: doc.parentId,
        timestamp: doc.timestamp || 0
      }));

      const topLevel = mappedComments.filter(c => !c.parentId);
      topLevel.forEach(parent => {
        parent.replies = mappedComments.filter(c => c.parentId === parent.id);
      });

      setPostsState(prev => prev.map(p => p.id === postId ? { ...p, commentNodes: topLevel } : p));
    } catch (e) {
      console.warn("Linguistic sync for comments failed. Index may be missing.");
    }
  }, []);

  const refreshFeed = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(50)]);
      const now = Date.now();
      
      setPostsState(prevPosts => {
        const commentCache = new Map(prevPosts.map(p => [p.id, p.commentNodes]));
        
        return response.documents.map(doc => {
          let isBoosted = doc.isBoosted || false;
          
          if (isBoosted) {
            const hasExpired = doc.boostExpiry && doc.boostExpiry < now;
            const hasReachedLimit = doc.boostCurrentViews >= (doc.boostTargetViews || 1);
            if (hasExpired || hasReachedLimit) {
              isBoosted = false;
              databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, doc.$id, { isBoosted: false });
            }
          }

          return {
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
            viewers: doc.viewers || [],
            theme: doc.theme,
            language: doc.language,
            isLocked: doc.isLocked,
            unlockPrice: doc.unlockPrice,
            isBoosted,
            boostTargetViews: doc.boostTargetViews,
            boostCurrentViews: doc.boostCurrentViews,
            boostExpiry: doc.boostExpiry,
            poll: doc.poll ? JSON.parse(doc.poll) : undefined,
            commentNodes: commentCache.get(doc.$id) || []
          } as Post;
        });
      });
    } catch (error) {}
  }, []);

  const recordView = useCallback(async (postId: string) => {
    if (!currentUser.id || viewedNodeIds.has(postId)) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const viewers = post.viewers || [];
    if (viewers.includes(currentUser.id)) {
      setViewedNodeIds(prev => new Set(prev).add(postId));
      return;
    }

    try {
      const newTotalViews = (post.views || 0) + 1;
      const updatedViewers = [...viewers, currentUser.id];
      const updates: any = { 
        views: newTotalViews,
        viewers: updatedViewers
      };

      if (post.isBoosted) {
        const newBoostViews = (post.boostCurrentViews || 0) + 1;
        updates.boostCurrentViews = newBoostViews;
        if (newBoostViews >= (post.boostTargetViews || 1)) {
          updates.isBoosted = false;
        }
      }

      await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, updates);
      setViewedNodeIds(prev => new Set(prev).add(postId));
      
      setPostsState(prev => prev.map(p => p.id === postId ? { 
        ...p, 
        views: newTotalViews, 
        viewers: updatedViewers,
        boostCurrentViews: updates.boostCurrentViews || p.boostCurrentViews,
        isBoosted: updates.isBoosted !== undefined ? updates.isBoosted : p.isBoosted
      } : p));
    } catch (e) {
      console.warn("View pulse rejection in vault.");
    }
  }, [posts, currentUser.id, viewedNodeIds]);

  const refreshLikes = useCallback(async (userId: string) => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        LIKES_COLLECTION_ID,
        [Query.equal('userId', userId), Query.limit(100)]
      );
      setLikedPostIdsState(new Set(response.documents.map(d => d.postId)));
    } catch (e: any) {
      console.warn("Likes hydration failed:", e.message);
    }
  }, []);

  const refreshSocialGraph = useCallback(async (userId: string, username: string) => {
    try {
      const [followingRes, followersRes] = await Promise.all([
        databases.listDocuments(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, [Query.equal('followerId', userId)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, [
          Query.or([
            Query.equal('followingUsername', username),
            Query.equal('followingId', userId)
          ])
        ])
      ]);
      
      const following = new Set(followingRes.documents.map(d => d.followingUsername));
      const followers = new Set<string>();
      
      followersRes.documents.forEach(d => {
        if (d.followerUsername) followers.add(d.followerUsername);
        if (d.followerId) followers.add(d.followerId);
      });
      
      setFollowingUsernamesState(following);
      setFollowerUsernamesState(followers);

      setConnectionsState(prev => prev.map(conn => ({
        ...conn,
        followsYou: followers.has(conn.username) || followers.has(conn.id) || followers.has(conn.$id)
      })));
    } catch (e: any) {
      console.warn("Social graph hydration failed:", e.message);
    }
  }, []);

  const refreshProfiles = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(100)]);
      const profiles = response.documents.map(doc => ({ ...doc, id: doc.$id, isGroup: false } as any));
      
      const profilesWithLastMsg = await Promise.all(profiles.map(async (p) => {
        const convId = [currentUser.username, p.username].sort().join('_');
        const lastMsgRes = await databases.listDocuments(APPWRITE_DATABASE_ID, MESSAGES_COLLECTION_ID, [
          Query.equal('conversationId', convId),
          Query.orderDesc('$createdAt'),
          Query.limit(1)
        ]);
        const lastMsg = lastMsgRes.documents[0];
        return {
          ...p,
          lastMessage: lastMsg?.text || (lastMsg?.type === 'photo' ? 'Sent a visual' : lastMsg?.type === 'voice' ? 'Sent a sonic note' : ''),
          lastTime: lastMsg ? new Date(lastMsg.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        };
      }));

      setConnectionsState(profilesWithLastMsg);
      return profilesWithLastMsg;
    } catch (e) { return []; }
  }, [currentUser.username]);

  const refreshClusters = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID);
      const mapped = await Promise.all(response.documents.map(async (doc) => {
        const lastMsgRes = await databases.listDocuments(APPWRITE_DATABASE_ID, MESSAGES_COLLECTION_ID, [
          Query.equal('conversationId', doc.$id),
          Query.orderDesc('$createdAt'),
          Query.limit(1)
        ]);
        const lastMsg = lastMsgRes.documents[0];
        return {
          id: doc.$id,
          name: doc.name,
          adminUsername: doc.adminUsername,
          avatar: doc.avatar,
          members: JSON.parse(doc.members || '[]'),
          isGroup: true,
          lastMessage: lastMsg?.text || (lastMsg?.type === 'photo' ? 'Sent a visual' : ''),
          lastTime: lastMsg ? new Date(lastMsg.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        } as Cluster;
      }));
      setClustersState(mapped);
    } catch (e) {}
  }, []);

  const refreshEconomy = useCallback(async (userId: string) => {
    try {
      const [withdraws, payments] = await Promise.all([
        databases.listDocuments(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, [Query.equal('userId', userId)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, [Query.equal('userId', userId)])
      ]);
      setWithdrawalHistoryState(withdraws.documents);
      setPaymentRequestsState(payments.documents);
    } catch (e) {}
  }, []);

  const fetchProfileByUsername = useCallback(async (username: string): Promise<User | null> => {
    try {
      const normalizedUsername = username.toLowerCase().trim();
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', normalizedUsername)]);
      if (response.documents.length === 0) return null;
      const profile = response.documents[0];
      return { id: profile.$id, name: profile.name, username: profile.username, avatar: profile.avatar, isVerified: profile.isVerified, followers: profile.followers, following: profile.following, posts: profile.posts, bio: profile.bio, category: profile.category, role: profile.role, goldBalance: profile.goldBalance, diamondBalance: profile.diamondBalance, starBalance: profile.starBalance, referralCount: profile.referralCount, hasEverBeenVerified: profile.hasEverBeenVerified, dateOfBirth: profile.dateOfBirth, nationality: profile.nationality, gender: profile.gender } as User;
    } catch (e) { return null; }
  }, []);

  const refreshAdminData = useCallback(async () => {
    if (!currentUser.role || currentUser.role === 'USER') return;
    try {
      const [withdraws, payments, profiles, logs] = await Promise.all([
        databases.listDocuments(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(100)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(100)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(100)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, AUDIT_LOGS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(100)])
      ]);
      setWithdrawalHistoryState(withdraws.documents);
      setPaymentRequestsState(payments.documents);
      setStaffState(profiles.documents.filter(p => p.role && p.role !== 'USER'));
      setAuditLogsState(logs.documents);
      await Promise.all([refreshCampaigns(), refreshSafety(), refreshResolution()]);
    } catch (e) {}
  }, [currentUser.role, refreshCampaigns, refreshSafety, refreshResolution]);

  const checkSession = useCallback(async () => {
    try {
      const user = await account.get();
      let profile;
      try { profile = await databases.getDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, user.$id); }
      catch (e) { 
        profile = { name: user.name, username: user.email.split('@')[0], avatar: INITIAL_USER.avatar, role: 'USER' };
      }
      
      setCurrentUserState({ 
        id: user.$id, 
        name: profile.name, 
        username: profile.username, 
        avatar: profile.avatar, 
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
        followers: profile.followers,
        following: profile.following
      });
      
      await Promise.all([
        refreshGlobalSettings(),
        refreshFeed(), 
        refreshStories(), 
        refreshProfiles(),
        refreshCampaigns(),
        refreshSocialGraph(user.$id, profile.username), 
        refreshLikes(user.$id),
        refreshClusters(), 
        refreshEconomy(user.$id)
      ]);
      
      if (profile.role && profile.role !== 'USER') await refreshAdminData();
    } catch (error) {
      setCurrentUserState(INITIAL_USER);
    }
    finally { setIsLoadingState(false); }
  }, [refreshGlobalSettings, refreshFeed, refreshStories, refreshProfiles, refreshCampaigns, refreshSocialGraph, refreshLikes, refreshClusters, refreshEconomy, refreshAdminData]);

  useEffect(() => { 
    checkSession();
    const savedSettings = localStorage.getItem('vimore_settings');
    if (savedSettings) {
      try {
        setSettingsState(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      } catch (e) {}
    }
  }, [checkSession]);

  const login = useCallback(async (email: string, password: string) => { 
    try {
      await account.createEmailPasswordSession(email, password); 
      await checkSession(); 
    } catch (e: any) {
      throw new Error(e.message);
    }
  }, [checkSession]);

  const logout = useCallback(async () => {
    triggerHaptic(50);
    try {
      await account.deleteSession('current');
      localStorage.clear();
      sessionStorage.clear();
      setCurrentUserState(INITIAL_USER);
      window.location.href = "/";
    } catch (e) {
      console.error("Logout failed:", e);
    }
  }, [triggerHaptic]);
  
  const signup = useCallback(async (data: { email: string, password: string, name: string, username: string, dob: string, nationality: string, gender: 'Male' | 'Female' }) => {
    try {
      const normalizedUsername = data.username.toLowerCase().trim().replace(/\s+/g, '_');
      const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [
        Query.equal('username', normalizedUsername)
      ]);
      if (existing.total > 0) throw new Error("This spatial ID (username) is already taken.");
      const profilesCount = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(1)]);
      const assignedRole = profilesCount.total === 0 ? 'SUPER' : 'USER';
      const user = await account.create(ID.unique(), data.email, data.password, data.name);
      await account.createEmailPasswordSession(data.email, data.password);
      let referrerId = null;
      const storedReferrer = localStorage.getItem('vimore_referrer');
      if (storedReferrer) {
        try {
          const referrerProfileRes = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', storedReferrer)]);
          if (referrerProfileRes.documents.length > 0) {
            const referrer = referrerProfileRes.documents[0];
            referrerId = referrer.$id;
            await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, referrer.$id, { starBalance: (referrer.starBalance || 0) + 5000, referralCount: (referrer.referralCount || 0) + 1 });
            try { await databases.createDocument(APPWRITE_DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, ID.unique(), { type: 'SOCIAL', title: 'Referral Reward!', content: `**${data.name}** joined via your node. **+5,000 Stars** synced to your vault.`, recipientId: referrer.$id, targetUsername: normalizedUsername, isRead: false, timestamp: Date.now() }); } catch (notifErr) {}
          }
        } catch (err) { console.warn("Referral handshake failed."); }
      }
      try {
        await databases.createDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, user.$id, { name: data.name, username: normalizedUsername, avatar: INITIAL_USER.avatar, goldBalance: 0, diamondBalance: 0, starBalance: 0, role: assignedRole, dateOfBirth: data.dob, nationality: data.nationality, gender: data.gender, referralCount: 0, isEmailVerified: false, followers: 0, following: 0, referredBy: referrerId });
        if (referrerId && storedReferrer && settings.isAutoFollowEnabled) {
           await databases.createDocument(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, ID.unique(), { followerId: user.$id, followerUsername: normalizedUsername, followingUsername: storedReferrer, followingId: referrerId });
        }
      } catch (profileError: any) { throw new Error(profileError.message); }
      localStorage.removeItem('vimore_referrer');
      await account.createVerification(`${window.location.origin}/auth/verify`);
      await checkSession();
    } catch (error: any) { throw new Error(error.message); }
  }, [checkSession, settings.isAutoFollowEnabled]);

  const resendVerification = useCallback(async () => {
    try { await account.createVerification(`${window.location.origin}/auth/verify`); } catch (e: any) { throw new Error(e.message); }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try { await account.createRecovery(email, `${window.location.origin}/auth/recovery`); } catch (e: any) { throw new Error(e.message); }
  }, []);

  const resetPassword = useCallback(async (userId: string, secret: string, password: string) => {
    try { await account.updateRecovery(userId, secret, password, password); } catch (e: any) { throw new Error(e.message); }
  }, []);

  const uploadMedia = useCallback(async (file: File): Promise<string> => {
    try {
      const response = await storage.createFile(APPWRITE_BUCKET_ID, ID.unique(), file);
      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
      const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore';
      return `${endpoint}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${response.$id}/view?project=${project}`;
    } catch (e: any) { throw new Error(e.message); }
  }, []);

  const updateCurrentUser = useCallback(async (data: Partial<User>) => {
    if (!currentUser.id) throw new Error("Identity signature missing.");
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, data);
      setCurrentUserState(prev => ({ ...prev, ...data }));
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser.id]);

  const addPost = useCallback(async (newPostData: any) => {
    try {
      const docData = { content: newPostData.content, user: JSON.stringify(newPostData.user), image: newPostData.image, images: JSON.stringify(newPostData.images || []), videoUrl: newPostData.videoUrl, theme: newPostData.theme, language: newPostData.language, isLocked: newPostData.isLocked || false, unlockPrice: newPostData.unlockPrice || 0, poll: newPostData.poll ? JSON.stringify(newPostData.poll) : null, likes: 0, unlikes: 0, comments: 0, shares: 0, views: 0, isBoosted: false, viewers: [] };
      await databases.createDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, ID.unique(), docData);
      await refreshFeed();
    } catch (e: any) { throw new Error(e.message); }
  }, [refreshFeed]);

  const deletePost = useCallback(async (postId: string) => { 
    try { await databases.deleteDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId); await refreshFeed(); } catch (e: any) { throw new Error(e.message); }
  }, [refreshFeed]);
  
  const toggleLikePost = useCallback(async (postId: string) => {
    const userId = currentUser.id;
    if (!userId) return;
    const isCurrentlyLiked = likedPostIds.has(postId);
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    triggerHaptic(20);
    setLikedPostIdsState(prev => { const next = new Set(prev); if (isCurrentlyLiked) next.delete(postId); else next.add(postId); return next; });
    setPostsState(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, likes: isCurrentlyLiked ? Math.max(0, p.likes - 1) : p.likes + 1 };
    }));
    try {
      if (isCurrentlyLiked) {
        const response = await databases.listDocuments(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, [Query.equal('postId', postId), Query.equal('userId', userId)]);
        if (response.documents.length > 0) await databases.deleteDocument(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, response.documents[0].$id);
        await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { likes: Math.max(0, post.likes - 1) });
      } else {
        await databases.createDocument(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, ID.unique(), { postId, userId });
        await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { likes: post.likes + 1 });
        const recipientId = post.user.id || (post.user as any).$id;
        if (recipientId && recipientId !== currentUser.id) {
          try { await databases.createDocument(APPWRITE_DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, ID.unique(), { type: 'POST', title: 'New Vibe Pulse', content: `**${currentUser.name}** liked your post: "${post.content.slice(0, 30)}..."`, recipientId, avatar: currentUser.avatar, postId: postId, isRead: false, timestamp: Date.now() }); } catch (notifErr) {}
        }
      }
    } catch (e: any) { refreshFeed(); }
  }, [currentUser.id, currentUser.name, currentUser.avatar, likedPostIds, posts, triggerHaptic, refreshFeed]);

  const toggleUnlikePost = useCallback(async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const isCurrentlyUnliked = unlikedPostIds.has(postId);
    triggerHaptic(15);
    setUnlikedPostIdsState(prev => { const next = new Set(prev); if (isCurrentlyUnliked) next.delete(postId); else next.add(postId); return next; });
    setPostsState(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, unlikes: isCurrentlyUnliked ? Math.max(0, p.unlikes - 1) : p.unlikes + 1 };
    }));
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { unlikes: isCurrentlyUnliked ? Math.max(0, post.unlikes - 1) : post.unlikes + 1 });
    } catch (e: any) { refreshFeed(); }
  }, [unlikedPostIds, posts, triggerHaptic, refreshFeed]);

  const toggleSavePost = useCallback((postId: string) => {
    triggerHaptic(5);
    setSavedPostIdsState(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
    });
  }, [triggerHaptic]);

  const toggleFollowUser = useCallback(async (username: string) => {
    const userId = currentUser.id;
    if (!userId || username === currentUser.username) return;
    const isCurrentlyFollowing = followingUsernames.has(username);
    triggerHaptic(15);
    setFollowingUsernamesState(prev => { const next = new Set(prev); if (isCurrentlyFollowing) next.delete(username); else next.add(username); return next; });
    try {
      const targetUser = connections.find(c => c.username === username);
      const targetUserId = targetUser?.$id || targetUser?.id;
      if (isCurrentlyFollowing) {
        const response = await databases.listDocuments(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, [Query.equal('followerId', userId), Query.equal('followingUsername', username)]);
        if (response.documents.length > 0) await databases.deleteDocument(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, response.documents[0].$id);
        if (targetUserId) {
          const currentFollowers = typeof targetUser?.followers === 'string' ? parseInt(targetUser.followers) : (targetUser?.followers || 0);
          await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, targetUserId, { followers: Math.max(0, currentFollowers - 1) });
        }
        await updateCurrentUser({ following: Math.max(0, (typeof currentUser.following === 'string' ? parseInt(currentUser.following) : (currentUser.following || 0)) - 1) });
      } else {
        await databases.createDocument(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, ID.unique(), { followerId: userId, followerUsername: currentUser.username, followingUsername: username, followingId: targetUserId });
        if (targetUserId) {
          const currentFollowers = typeof targetUser?.followers === 'string' ? parseInt(targetUser.followers) : (targetUser?.followers || 0);
          await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, targetUserId, { followers: currentFollowers + 1 });
          try { await databases.createDocument(APPWRITE_DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, ID.unique(), { type: 'SOCIAL', title: 'New Handshake', content: `**${currentUser.name}** is now following your pulse.`, recipientId: targetUserId, avatar: currentUser.avatar, targetUsername: currentUser.username, isRead: false, timestamp: Date.now() }); } catch (notifErr) {}
        }
        await updateCurrentUser({ following: (typeof currentUser.following === 'string' ? parseInt(currentUser.following) : (currentUser.following || 0)) + 1 });
      }
      await refreshSocialGraph(userId, currentUser.username);
    } catch (e: any) { setFollowingUsernamesState(prev => { const next = new Set(prev); if (isCurrentlyFollowing) next.add(username); else next.delete(username); return next; }); }
  }, [currentUser, followingUsernames, connections, triggerHaptic, updateCurrentUser, refreshSocialGraph]);

  const addComment = useCallback(async (postId: string, text: string) => { 
    if (!currentUser.id) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, COMMENTS_COLLECTION_ID, ID.unique(), { postId, userId: currentUser.id, user: JSON.stringify(currentUser), text, timestamp: Date.now() }); 
      const post = posts.find(p => p.id === postId);
      if (post) {
        await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { comments: (post.comments || 0) + 1 });
        const recipientId = post.user.id || (post.user as any).$id;
        if (recipientId && recipientId !== currentUser.id) {
          try { await databases.createDocument(APPWRITE_DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, ID.unique(), { type: 'POST', title: 'New Comment', content: `**${currentUser.name}** commented on your vibe: "${text.slice(0, 30)}..."`, recipientId, avatar: currentUser.avatar, postId: postId, isRead: false, timestamp: Date.now() }); } catch (notifErr) {}
        }
      }
      await fetchComments(postId);
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, posts, fetchComments]);

  const addReply = useCallback(async (postId: string, commentId: string, text: string) => { 
    if (!currentUser.id) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, COMMENTS_COLLECTION_ID, ID.unique(), { postId, userId: currentUser.id, user: JSON.stringify(currentUser), text, parentId: commentId, timestamp: Date.now() }); 
      const post = posts.find(p => p.id === postId);
      if (post) await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { comments: (post.comments || 0) + 1 });
      await fetchComments(postId);
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, posts, fetchComments]);

  const setSearchOpen = useCallback((open: boolean) => { triggerHaptic(5); setIsSearchOpenState(open); }, [triggerHaptic]);
  const setSelectedChatId = useCallback((id: string | null) => { triggerHaptic(5); setSelectedChatIdState(id); }, [triggerHaptic]);
  const setSelectedPostId = useCallback((id: string | null) => { triggerHaptic(5); setSelectedPostIdState(id); }, [triggerHaptic]);
  const setSelectedImageUrl = useCallback((url: string | null) => { triggerHaptic(5); setSelectedImageUrlState(url); }, [triggerHaptic]);
  const setSelectedVideoUrl = useCallback((url: string | null) => { triggerHaptic(5); setSelectedVideoUrlState(url); }, [triggerHaptic]);
  const openCommentHub = useCallback((id: string) => { triggerHaptic(5); setActiveCommentPostIdState(id); fetchComments(id); }, [triggerHaptic, fetchComments]);
  const closeCommentHub = useCallback(() => { triggerHaptic(5); setActiveCommentPostIdState(null); }, [triggerHaptic]);
  const openGiftHub = useCallback((user: User) => { triggerHaptic(10); setTargetUserForGiftState(user); setIsGiftHubOpenState(true); }, [triggerHaptic]);
  const closeGiftHub = useCallback(() => { triggerHaptic(5); setIsGiftHubOpenState(false); setTargetUserForGiftState(null); }, [triggerHaptic]);
  const setActiveStoryIndex = useCallback((index: number | null) => { setActiveStoryIndexState(index); }, []);

  const updateSettings = useCallback((data: Partial<AppSettings>) => {
    setSettingsState(prev => { const next = { ...prev, ...data }; localStorage.setItem('vimore_settings', JSON.stringify(next)); return next; });
  }, []);

  const addStory = useCallback(async (segment: any) => {
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, ID.unique(), { user: JSON.stringify(currentUser), segments: JSON.stringify([segment]), expiresAt: Date.now() + (24 * 60 * 60 * 1000), viewers: [] });
      await refreshStories();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, refreshStories]);

  const voteOnStoryPoll = useCallback(async (storyId: string, segmentId: string, optionIndex: number) => {}, []);

  const voteOnPostPoll = useCallback(async (postId: string, optionIndex: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post || !post.poll || !currentUser.username) return;
    const poll = { ...post.poll };
    const voters = poll.voters || {};
    const previousVote = voters[currentUser.username];
    if (previousVote === optionIndex) {
      poll.options[optionIndex].votes = Math.max(0, poll.options[optionIndex].votes - 1);
      delete voters[currentUser.username];
      poll.totalVotes = Math.max(0, poll.totalVotes - 1);
    } else {
      if (previousVote !== undefined) {
        poll.options[previousVote].votes = Math.max(0, poll.options[previousVote].votes - 1);
        poll.totalVotes -= 1;
      }
      poll.options[optionIndex].votes += 1;
      voters[currentUser.username] = optionIndex;
      poll.totalVotes += 1;
    }
    poll.voters = voters;
    try {
      setPostsState(prev => prev.map(p => p.id === postId ? { ...p, poll } : p));
      await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { poll: JSON.stringify(poll) });
      triggerHaptic(20);
    } catch (e) { refreshFeed(); }
  }, [posts, currentUser.username, refreshFeed, triggerHaptic]);

  const toggleMuteUser = useCallback((username: string) => { setMutedUserNamesState(prev => { if (prev.includes(username)) return prev.filter(u => u !== username); return [...prev, username]; }); }, []);
  const togglePinPost = useCallback(async (postId: string) => {}, []);
  const archivePost = useCallback(async (postId: string) => {}, []);
  
  const updateGatewaySettings = useCallback(async (data: any) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, PLATFORM_SETTINGS_COLLECTION_ID, GLOBAL_CONFIG_ID, data);
      setGatewaySettingsState(data);
    } catch (e) {
      try {
        await databases.createDocument(APPWRITE_DATABASE_ID, PLATFORM_SETTINGS_COLLECTION_ID, GLOBAL_CONFIG_ID, data);
        setGatewaySettingsState(data);
      } catch (err) { console.error("Gateway sync failed:", err); }
    }
  }, []);
  
  const initiateTransaction = useCallback((data: any) => { setPendingTransactionState(data); }, []);
  const cancelTransaction = useCallback(() => { setPendingTransactionState(null); }, []);
  
  const createPaymentRequest = useCallback(async (screenshot: string) => {
    if (!pendingTransaction || !currentUser.id) return;
    try {
      const file = dataURLtoFile(screenshot, `payment_${Date.now()}.jpg`);
      const screenshotUrl = await uploadMedia(file);
      await databases.createDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, ID.unique(), { userId: currentUser.id, username: currentUser.username, packageName: pendingTransaction.packageName, packageId: pendingTransaction.packageId, amount: parseFloat(pendingTransaction.amount), currency: pendingTransaction.currency, code: pendingTransaction.code, screenshot: screenshotUrl, status: 'PENDING', timestamp: Date.now(), type: pendingTransaction.type });
      setPendingTransactionState(null);
      if (currentUser.role && currentUser.role !== 'USER') await refreshAdminData();
    } catch (e: any) { throw new Error("Could not transmit payment pulse."); }
  }, [pendingTransaction, currentUser, uploadMedia, refreshAdminData]);

  const approvePaymentRequest = useCallback(async (id: string) => {
    try {
      const payment = paymentRequests.find(p => p.$id === id);
      if (!payment) return;
      await databases.updateDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, id, { status: 'APPROVED' });
      const userRes = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', payment.username)]);
      if (userRes.documents.length > 0) {
        const userDoc = userRes.documents[0];
        const isGold = payment.type === 'Gold';
        const field = isGold ? 'goldBalance' : 'diamondBalance';
        const creditValue = payment.packageId === 'g1' ? 200 : payment.packageId === 'g2' ? 500 : payment.packageId === 'g3' ? 1000 : payment.packageId === 'g4' ? 3000 : payment.packageId === 'd1' ? 25 : payment.packageId === 'd2' ? 50 : 100;
        await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userDoc.$id, { [field]: (userDoc[field] || 0) + creditValue });
        await databases.createDocument(APPWRITE_DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, ID.unique(), { type: 'SYSTEM', title: 'Vault Sync Complete', content: `Your deposit for **${payment.packageName}** is confirmed. **+${creditValue} ${isGold ? 'Gold' : 'Diamonds'}** materialized in your vault.`, recipientId: userDoc.$id, isRead: false, timestamp: Date.now() });
      }
      await refreshAdminData();
    } catch (e: any) { toast({ variant: "destructive", title: "Handshake Failed", description: e.message }); }
  }, [paymentRequests, refreshAdminData, toast]);

  const rejectPaymentRequest = useCallback(async (id: string) => {
    try {
      const payment = paymentRequests.find(p => p.$id === id);
      if (!payment) return;
      await databases.updateDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, id, { status: 'REJECTED' });
      const userRes = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', payment.username)]);
      if (userRes.documents.length > 0) {
        const userDoc = userRes.documents[0];
        await databases.createDocument(APPWRITE_DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, ID.unique(), { type: 'SYSTEM', title: 'Handshake Rejected', content: `Your deposit proof for **${payment.packageName}** was rejected.`, recipientId: userDoc.$id, isRead: false, timestamp: Date.now() });
      }
      await refreshAdminData();
    } catch (e: any) { toast({ variant: "destructive", title: "Audit Error", description: e.message }); }
  }, [paymentRequests, refreshAdminData, toast]);

  const recordWithdrawal = useCallback(async (node: any) => {
    try { await databases.createDocument(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, ID.unique(), { ...node, userId: currentUser.id }); } catch (e: any) { console.error("Withdrawal record failed:", e.message); }
  }, [currentUser.id]);

  const processWithdrawal = useCallback(async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const withdrawal = withdrawalHistory.find(w => w.$id === id);
      if (!withdrawal) return;
      await databases.updateDocument(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, id, { status });
      const userRes = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', withdrawal.username)]);
      if (userRes.documents.length > 0) {
        const userDoc = userRes.documents[0];
        if (status === 'REJECTED') {
          const balanceKey = withdrawal.currency === 'GOLD' ? 'goldBalance' : 'diamondBalance';
          await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userDoc.$id, { [balanceKey]: (userDoc[balanceKey] || 0) + withdrawal.amount });
        }
        await databases.createDocument(APPWRITE_DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, ID.unique(), { type: 'SYSTEM', title: status === 'APPROVED' ? 'Withdrawal Materialized' : 'Withdrawal Aborted', content: status === 'APPROVED' ? `Your withdrawal of **${withdrawal.payoutCurrency} ${withdrawal.payoutAmount.toFixed(2)}** has been processed.` : `Your withdrawal request was rejected.`, recipientId: userDoc.$id, isRead: false, timestamp: Date.now() });
      }
      await refreshAdminData();
    } catch (e: any) { toast({ variant: "destructive", title: "Process Error", description: e.message }); }
  }, [withdrawalHistory, refreshAdminData, toast]);

  const triggerReferralPulse = useCallback((referralCode?: string) => {}, []);
  
  const verifyUser = useCallback(async (cost: number, currency: 'DIAMOND' | 'STAR') => {
    try {
      await executeVaultTransaction({ cost, currency, isPlatformService: true, description: 'Verification Signature Upgrade' });
      const expiry = Date.now() + (30 * 24 * 60 * 60 * 1000);
      await updateCurrentUser({ isVerified: true, hasEverBeenVerified: true, verificationExpiry: expiry });
      toast({ title: "Signature Materialized", description: "Badge active for 30 days." });
    } catch (e: any) { toast({ variant: "destructive", title: "Vault Sync Error", description: e.message }); }
  }, [executeVaultTransaction, updateCurrentUser, toast]);

  const processGiftTransaction = useCallback(async (cost: number, currency: 'GOLD' | 'DIAMOND') => {
    if (!targetUserForGift) return;
    try { await executeVaultTransaction({ cost, currency, recipientUsername: targetUserForGift.username, description: `Digital Gift Pulse to @${targetUserForGift.username}` }); } catch (e: any) { toast({ variant: "destructive", title: "Vault Sync Error", description: e.message }); }
  }, [executeVaultTransaction, targetUserForGift, toast]);

  const unlockPost = useCallback(async (postId: string, cost: number) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    try { await executeVaultTransaction({ cost, currency: 'GOLD', recipientUsername: post.user.username, description: `Locked Post Handshake — Post Node: ${postId}` }); setUnlockedPostIdsState(prev => new Set(prev).add(postId)); } catch (e: any) { toast({ variant: "destructive", title: "Vault Sync Error", description: e.message }); }
  }, [executeVaultTransaction, posts, toast]);

  const subscribeToCreator = useCallback(async (username: string, cost: number) => {
    try { await executeVaultTransaction({ cost, currency: 'DIAMOND', recipientUsername: username, description: `Premium Loop Subscription to @${username}` }); setActiveSubscriptionsState(prev => new Set(prev).add(username)); } catch (e: any) { toast({ variant: "destructive", title: "Vault Sync Error", description: e.message }); }
  }, [executeVaultTransaction, toast]);

  const cancelSubscription = useCallback(async (username: string) => { setActiveSubscriptionsState(prev => { const next = new Set(prev); next.delete(username); return next; }); }, []);
  const recordAdMaterialization = useCallback(() => {}, []);
  const recordAdHandshake = useCallback((revenue: number) => {}, []);
  const updateIntelligence = useCallback((data: any) => { setIntelligenceMetricsState(prev => ({ ...prev, ...data })); }, []);
  const incrementShareCount = useCallback(async (postId: string) => {}, []);
  const createCluster = useCallback(async (name: string, members: any[]) => { try { await databases.createDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, ID.unique(), { name, adminUsername: currentUser.username, members: JSON.stringify(members) }); await refreshClusters(); } catch (e: any) { throw new Error(e.message); } }, [currentUser.username, refreshClusters]);
  const addMemberToCluster = useCallback(async (clusterId: string, member: any) => {}, []);
  const leaveCluster = useCallback(async (clusterId: string) => {}, []);
  
  const promoteUser = useCallback(async (username: string, role: 'FINANCIAL' | 'MODERATOR') => {
    const user = connections.find(c => c.username === username);
    if (!user) return;
    try { await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, user.$id || user.id!, { role }); await refreshAdminData(); } catch (e) {}
  }, [connections, refreshAdminData]);

  const demoteUser = useCallback(async (username: string) => {
    const user = connections.find(c => c.username === username);
    if (!user) return;
    try { await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, user.$id || user.id!, { role: 'USER' }); await refreshAdminData(); } catch (e) {}
  }, [connections, refreshAdminData]);

  const initiateCall = useCallback(async (contact: any, type: CallType) => {
    const channelName = `call_${currentUser.username}_${contact.username}_${Date.now()}`;
    const token = await generateAgoraToken(channelName, currentUser.id!);
    try {
      const doc = await databases.createDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, ID.unique(), { callerId: currentUser.username, callerName: currentUser.name, callerAvatar: currentUser.avatar, receiverId: contact.username, type, status: 'ringing', channelName, token, startTime: Date.now() });
      activeCallIdRef.current = doc.$id;
      setCallState({ type, status: 'outgoing', contact, channelName, token, startTime: Date.now(), callId: doc.$id });
    } catch (e) { toast({ variant: "destructive", title: "Handshake Failed" }); }
  }, [currentUser, toast]);

  const receiveCall = useCallback((contact: any, type: CallType, channelName: string, token: string, callId: string) => { activeCallIdRef.current = callId; setCallState({ type, status: 'incoming', contact, channelName, token, callId }); }, []);
  const acceptCall = useCallback(async () => { 
    if (!activeCallIdRef.current) return;
    try { await databases.updateDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, activeCallIdRef.current, { status: 'active' }); setCallState(prev => ({ ...prev, status: 'active', startTime: Date.now() })); } catch (e) {}
  }, []);

  const endCall = useCallback(async (duration?: string) => { 
    if (activeCallIdRef.current) {
      try {
        await databases.updateDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, activeCallIdRef.current, { status: 'ended' });
        setTimeout(() => { if (activeCallIdRef.current) databases.deleteDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, activeCallIdRef.current); activeCallIdRef.current = null; }, 2000);
      } catch (e) {}
    }
    setCallState({ type: 'video', status: 'idle', contact: null }); 
  }, []);

  const addCampaign = useCallback(async (data: any) => {
    try { await databases.createDocument(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, ID.unique(), { ...data, isActive: true, clicks: 0, impressions: 0 }); await refreshCampaigns(); } catch (e: any) { throw new Error(e.message); }
  }, [refreshCampaigns]);

  const deleteCampaign = useCallback(async (id: string) => { try { await databases.deleteDocument(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, id); await refreshCampaigns(); } catch (e: any) { throw new Error(e.message); } }, [refreshCampaigns]);
  const toggleCampaignStatus = useCallback(async (id: string) => { const campaign = campaigns.find(c => c.id === id); if (!campaign) return; try { await databases.updateDocument(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, id, { isActive: !campaign.isActive }); await refreshCampaigns(); } catch (e: any) { throw new Error(e.message); } }, [campaigns, refreshCampaigns]);
  const recordCampaignClick = useCallback(async (id: string) => { const campaign = campaigns.find(c => c.id === id); if (!campaign) return; try { await databases.updateDocument(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, id, { clicks: (campaign.clicks || 0) + 1 }); await refreshCampaigns(); } catch (e) {} }, [campaigns, refreshCampaigns]);
  
  const boostNode = useCallback(async (nodeId: string, targetViews: number, durationDays: number, cost: number, currency: 'DIAMOND' | 'STAR', type: 'POST' | 'REEL' | 'SONIC') => {
    try {
      await executeVaultTransaction({ cost, currency, isPlatformService: true, description: `Content Boost Pulse for ${type}` });
      const collectionId = type === 'SONIC' ? SONGS_COLLECTION_ID : POSTS_COLLECTION_ID;
      await databases.updateDocument(APPWRITE_DATABASE_ID, collectionId, nodeId, { isBoosted: true, boostTargetViews: targetViews, boostCurrentViews: 0, boostExpiry: Date.now() + (durationDays * 24 * 60 * 60 * 1000) });
      if (type !== 'SONIC') await refreshFeed();
      toast({ title: "Boost Materialized" });
    } catch (e: any) { toast({ variant: "destructive", title: "Boost Error", description: e.message }); }
  }, [executeVaultTransaction, refreshFeed, toast]);

  const updateUserIdentity = useCallback(async (userId: string, data: Partial<User>) => { try { await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userId, data); await refreshAdminData(); toast({ title: "Identity Re-calibrated" }); } catch (e: any) { toast({ variant: "destructive", title: "Sync Failed" }); } }, [refreshAdminData, toast]);
  const handleReportAction = useCallback(async (reportId: string, action: 'BAN' | 'DELETE' | 'DISMISS') => { try { const report = reports.find(r => r.$id === reportId); if (!report) return; if (action === 'DELETE') await databases.deleteDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, report.postId); if (action === 'BAN') await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, report.targetUserId, { role: 'USER', isVerified: false }); await databases.deleteDocument(APPWRITE_DATABASE_ID, REPORTS_COLLECTION_ID, reportId); await refreshAdminData(); toast({ title: `Node Neutralized` }); } catch (e: any) { toast({ variant: "destructive", title: "Sync Failed" }); } }, [reports, refreshAdminData, toast]);
  const handleTicketAction = useCallback(async (ticketId: string, status: 'PENDING' | 'RESOLVED') => { try { await databases.updateDocument(APPWRITE_DATABASE_ID, TICKETS_COLLECTION_ID, ticketId, { status }); await refreshAdminData(); toast({ title: "Ticket Status Synchronized" }); } catch (e: any) { toast({ variant: "destructive", title: "Sync Failed" }); } }, [refreshAdminData, toast]);

  const isPostLiked = useCallback((postId: string) => likedPostIds.has(postId), [likedPostIds]);
  const isPostUnliked = useCallback((postId: string) => unlikedPostIds.has(postId), [unlikedPostIds]);
  const isPostSaved = useCallback((postId: string) => savedPostIds.has(postId), [savedPostIds]);
  const isPostUnlocked = useCallback((postId: string) => unlockedPostIds.has(postId), [unlockedPostIds]);
  const isFollowing = useCallback((username: string) => followingUsernames.has(username), [followingUsernames]);
  const isSubscribed = useCallback((username: string) => activeSubscriptions.has(username), [activeSubscriptions]);

  const contextValue = useMemo(() => ({ 
    currentUser, posts, connections, clusters, staff, auditLogs, campaigns, reports, tickets, adStats, intelligenceMetrics, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, followerUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, selectedVideoUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings, callState, stories, withdrawalHistory, paymentRequests, referralLink: "http://vimore.appwrite.network/join/" + currentUser.username, pendingTransaction, activeSubscriptions, mutedUserNames,
    login, signup, logout, resendVerification, checkSession, forgotPassword, resetPassword, uploadMedia, setSearchOpen, setSelectedChatId, setSelectedPostId, setSelectedImageUrl, setSelectedVideoUrl, openCommentHub, closeCommentHub, openGiftHub, closeGiftHub, setActiveStoryIndex, addPost, deletePost, addStory, addComment, addReply, voteOnStoryPoll, voteOnPostPoll, toggleMuteUser, togglePinPost, archivePost, updateGatewaySettings, addAuditLog, toggleLikePost, toggleUnlikePost, toggleSavePost, toggleFollowUser, updateCurrentUser, updateSettings, initiateTransaction, cancelTransaction, createPaymentRequest, approvePaymentRequest, rejectPaymentRequest, recordWithdrawal, processWithdrawal, triggerReferralPulse, verifyUser, processGiftTransaction, unlockPost, subscribeToCreator, cancelSubscription, recordAdMaterialization, recordAdHandshake, updateIntelligence, incrementShareCount, createCluster, addMemberToCluster, leaveCluster, promoteUser, demoteUser, initiateCall, receiveCall, acceptCall, endCall, refreshAdminData, fetchProfileByUsername, addCampaign, deleteCampaign, toggleCampaignStatus, recordCampaignClick, boostNode, triggerHaptic, isPostLiked, isPostUnliked, isPostSaved, isPostUnlocked, isFollowing, isSubscribed, fetchComments, refreshProfiles, refreshClusters, refreshFeed, recordView, recordStoryView, updateUserIdentity, handleReportAction, handleTicketAction
  }), [currentUser, posts, connections, clusters, staff, auditLogs, campaigns, reports, tickets, adStats, intelligenceMetrics, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, followerUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, selectedVideoUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings, callState, stories, withdrawalHistory, paymentRequests, pendingTransaction, activeSubscriptions, mutedUserNames, login, signup, logout, resendVerification, checkSession, forgotPassword, resetPassword, uploadMedia, setSearchOpen, setSelectedChatId, setSelectedPostId, setSelectedImageUrl, setSelectedVideoUrl, openCommentHub, closeCommentHub, openGiftHub, closeGiftHub, setActiveStoryIndex, addPost, deletePost, addStory, addComment, addReply, voteOnStoryPoll, voteOnPostPoll, toggleMuteUser, togglePinPost, archivePost, updateGatewaySettings, addAuditLog, toggleLikePost, toggleUnlikePost, toggleSavePost, toggleFollowUser, updateCurrentUser, updateSettings, initiateTransaction, cancelTransaction, createPaymentRequest, approvePaymentRequest, rejectPaymentRequest, recordWithdrawal, processWithdrawal, triggerReferralPulse, verifyUser, processGiftTransaction, unlockPost, subscribeToCreator, cancelSubscription, recordAdMaterialization, recordAdHandshake, updateIntelligence, incrementShareCount, createCluster, addMemberToCluster, leaveCluster, promoteUser, demoteUser, initiateCall, receiveCall, acceptCall, endCall, refreshAdminData, fetchProfileByUsername, addCampaign, deleteCampaign, toggleCampaignStatus, recordCampaignClick, boostNode, triggerHaptic, isPostLiked, isPostUnliked, isPostSaved, isPostUnlocked, isFollowing, isSubscribed, fetchComments, refreshProfiles, refreshClusters, refreshFeed, recordView, recordStoryView, updateUserIdentity, handleReportAction, handleTicketAction]);

  return <PostContext.Provider value={contextValue}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) throw new Error('usePosts must be used within a PostProvider');
  return context;
}
