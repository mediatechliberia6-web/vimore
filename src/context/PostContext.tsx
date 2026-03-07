'use server-only';

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
  ALBUMS_COLLECTION_ID,
  PLAYLISTS_COLLECTION_ID,
  VERIFICATION_NODES_COLLECTION_ID,
  REPORTS_COLLECTION_ID,
  TICKETS_COLLECTION_ID,
  PLATFORM_SETTINGS_COLLECTION_ID,
  Query,
  storage,
  endpoint,
  project
} from '@/lib/appwrite';
import { useToast } from "@/hooks/use-toast";
import { dataURLtoFile } from '@/lib/utils';
import { generateAgoraToken } from '@/app/actions/call';

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

const GLOBAL_CONFIG_ID = 'master_config';

export function PostProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [currentUser, setCurrentUserState] = useState<User>(INITIAL_USER);
  const [posts, setPostsState] = useState<Post[]>([]);
  const [activeComments, setActiveComments] = useState<PostComment[]>([]);
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

  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(intensity);
    }
  }, []);

  // 1. REFRESH HANDSHAKES (Definition First)
  const refreshGlobalSettings = useCallback(async () => {
    try {
      const doc = await databases.getDocument(APPWRITE_DATABASE_ID, PLATFORM_SETTINGS_COLLECTION_ID, GLOBAL_CONFIG_ID);
      setGatewaySettingsState({ orangeName: doc.orangeName, orangeNumber: doc.orangeNumber, mtnName: doc.mtnName, mtnNumber: doc.mtnNumber });
    } catch (e) {}
  }, []);

  const refreshFeed = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(50)]);
      setPostsState(response.documents.map(doc => {
        let parsedUser;
        try { parsedUser = typeof doc.user === 'string' ? JSON.parse(doc.user) : doc.user; }
        catch (e) { parsedUser = { id: "archived", name: "Archived Node", username: "vimore_user", avatar: INITIAL_USER.avatar }; }
        return {
          id: doc.$id, user: parsedUser, content: doc.content, image: doc.image,
          images: doc.images ? JSON.parse(doc.images) : [], videoUrl: doc.videoUrl,
          time: new Date(doc.$createdAt).toLocaleDateString(), likes: doc.likes || 0, unlikes: doc.unlikes || 0,
          comments: doc.comments || 0, shares: doc.shares || 0, views: doc.views || 0,
          theme: doc.theme, language: doc.language, isLocked: doc.isLocked, unlockPrice: doc.unlockPrice,
          isBoosted: doc.isBoosted, boostTargetViews: doc.boostTargetViews, boostCurrentViews: doc.boostCurrentViews,
          boostExpiry: doc.boostExpiry, poll: doc.poll ? JSON.parse(doc.poll) : undefined
        } as Post;
      }));
    } catch (error) {}
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

  const refreshProfiles = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(100)]);
      const profiles = response.documents.map(doc => ({ ...doc, id: doc.$id, isGroup: false } as any));
      setConnectionsState(profiles);
      return profiles;
    } catch (e) { return []; }
  }, []);

  const refreshSocialGraph = useCallback(async (userId: string, username: string) => {
    try {
      const [followingRes, followersRes] = await Promise.all([
        databases.listDocuments(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, [Query.equal('followerId', userId)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, [Query.or([Query.equal('followingUsername', username), Query.equal('followingId', userId)])])
      ]);
      setFollowingUsernamesState(new Set(followingRes.documents.map(d => d.followingUsername)));
      const followers = new Set<string>();
      followersRes.documents.forEach(d => { if (d.followerUsername) followers.add(d.followerUsername); if (d.followerId) followers.add(d.followerId); });
      setFollowerUsernamesState(followers);
    } catch (e) {}
  }, []);

  const refreshLikes = useCallback(async (userId: string) => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, [Query.equal('userId', userId), Query.limit(100)]);
      setLikedPostIdsState(new Set(response.documents.map(d => d.postId)));
    } catch (e) {}
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

  const refreshAdminData = useCallback(async () => {
    try {
      const [withdraws, payments, profiles, logs, campaignsRes, safetyRes, ticketsRes] = await Promise.all([
        databases.listDocuments(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(100)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(100)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(100)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, AUDIT_LOGS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(100)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, [Query.limit(50)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, REPORTS_COLLECTION_ID, [Query.orderDesc('$createdAt')]),
        databases.listDocuments(APPWRITE_DATABASE_ID, TICKETS_COLLECTION_ID, [Query.orderDesc('$createdAt')])
      ]);
      setWithdrawalHistoryState(withdraws.documents);
      setPaymentRequestsState(payments.documents);
      setStaffState(profiles.documents.filter(p => p.role && p.role !== 'USER'));
      setAuditLogsState(logs.documents);
      setCampaignsState(campaignsRes.documents);
      setReportsState(safetyRes.documents);
      setTicketsState(ticketsRes.documents);
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

  // 2. CORE UTILITY NODES
  const uploadMedia = useCallback(async (file: File) => {
    try {
      const response = await storage.createFile(APPWRITE_BUCKET_ID, ID.unique(), file);
      return `${endpoint}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${response.$id}/view?project=${project}`;
    } catch (e: any) {
      throw new Error(e.message);
    }
  }, []);

  // 3. AUTH & SESSION NODES
  const checkSession = useCallback(async () => {
    try {
      const user = await account.get();
      let profile;
      try { profile = await databases.getDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, user.$id); }
      catch (e) { profile = { name: user.name, username: user.email.split('@')[0], avatar: INITIAL_USER.avatar, role: 'USER' }; }
      
      setCurrentUserState({ 
        id: user.$id, name: profile.name, username: profile.username, avatar: profile.avatar, cover: profile.cover,
        isOnline: true, isVerified: profile.isVerified || false, role: profile.role || 'USER', 
        goldBalance: profile.goldBalance || 0, diamondBalance: profile.diamondBalance || 0, 
        starBalance: profile.starBalance || 0, referralCount: profile.referralCount || 0, 
        hasEverBeenVerified: profile.hasEverBeenVerified || false, dateOfBirth: profile.dateOfBirth, 
        nationality: profile.nationality, gender: profile.gender, isEmailVerified: user.emailVerification,
        followers: profile.followers, following: profile.following
      });
      
      await Promise.all([refreshGlobalSettings(), refreshFeed(), refreshStories(), refreshProfiles(), refreshSocialGraph(user.$id, profile.username), refreshLikes(user.$id), refreshClusters(), refreshEconomy(user.$id)]);
      if (profile.role && profile.role !== 'USER') await refreshAdminData();
    } catch (error) { setCurrentUserState(INITIAL_USER); }
    finally { setIsLoadingState(false); }
  }, [refreshGlobalSettings, refreshFeed, refreshStories, refreshProfiles, refreshSocialGraph, refreshLikes, refreshClusters, refreshEconomy, refreshAdminData]);

  const login = useCallback(async (email: string, password: string) => {
    try { await account.createEmailPasswordSession(email, password); await checkSession(); }
    catch (e: any) { throw new Error(e.message); }
  }, [checkSession]);

  const signup = useCallback(async (data: any) => {
    try {
      const userId = ID.unique();
      await account.create(userId, data.email, data.password, data.name);
      const referrer = typeof window !== 'undefined' ? localStorage.getItem('vimore_referrer') : null;
      await databases.createDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userId, {
        name: data.name, username: data.username, avatar: INITIAL_USER.avatar, dateOfBirth: data.dob,
        nationality: data.nationality, gender: data.gender, role: 'USER', goldBalance: 0,
        diamondBalance: 0, starBalance: 0, referralCount: 0, isVerified: false, referredBy: referrer || undefined
      });
      await login(data.email, data.password);
      await account.createVerification(window.location.origin + '/auth/verify');
    } catch (e: any) { throw new Error(e.message); }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await account.deleteSession('current');
      setCurrentUserState(INITIAL_USER);
      localStorage.removeItem('vimore_last_track');
      localStorage.removeItem('vimore_sonic_position');
      window.location.href = "/";
    } catch (e: any) {
      console.error("Logout failure:", e.message);
    }
  }, []);

  const resendVerification = useCallback(async () => {
    try {
      await account.createVerification(window.location.origin + '/auth/verify');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await account.createRecovery(email, window.location.origin + '/auth/recovery');
    } catch (e: any) {
      throw new Error(e.message);
    }
  }, []);

  const resetPassword = useCallback(async (userId: string, secret: string, password: string) => {
    try {
      await account.updateRecovery(userId, secret, password, password);
    } catch (e: any) {
      throw new Error(e.message);
    }
  }, []);

  // 4. BUSINESS LOGIC HANDSHAKES
  const addPost = useCallback(async (data: any) => {
    try {
      const tinyUser = { id: currentUser.id, name: currentUser.name, username: currentUser.username, avatar: currentUser.avatar, isVerified: currentUser.isVerified };
      await databases.createDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, ID.unique(), {
        content: data.content, user: JSON.stringify(tinyUser), image: data.image, images: JSON.stringify(data.images || []),
        videoUrl: data.videoUrl, theme: data.theme, language: data.language, isLocked: data.isLocked || false,
        unlockPrice: data.unlockPrice || 0, poll: data.poll ? JSON.stringify(data.poll) : null,
        likes: 0, unlikes: 0, comments: 0, shares: 0, views: 0, isBoosted: false, viewers: []
      });
      await refreshFeed();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, refreshFeed]);

  const deletePost = useCallback(async (postId: string) => {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId);
      await refreshFeed();
    } catch (e: any) { throw new Error(e.message); }
  }, [refreshFeed]);

  const toggleLikePost = useCallback(async (postId: string) => {
    if (!currentUser.id) return;
    const isLiked = likedPostIds.has(postId);
    try {
      if (isLiked) {
        const likeDoc = await databases.listDocuments(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, [Query.equal('postId', postId), Query.equal('userId', currentUser.id)]);
        if (likeDoc.total > 0) await databases.deleteDocument(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, likeDoc.documents[0].$id);
        setLikedPostIdsState(prev => { const n = new Set(prev); n.delete(postId); return n; });
      } else {
        await databases.createDocument(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, ID.unique(), { postId, userId: currentUser.id });
        setLikedPostIdsState(prev => { const n = new Set(prev); n.add(postId); return n; });
      }
      await refreshFeed();
    } catch (e) {}
  }, [currentUser.id, likedPostIds, refreshFeed]);

  const toggleUnlikePost = useCallback(async (postId: string) => {
    if (!currentUser.id) return;
    const isUnliked = unlikedPostIds.has(postId);
    setUnlikedPostIdsState(prev => { const n = new Set(prev); if(isUnliked) n.delete(postId); else n.add(postId); return n; });
    await refreshFeed();
  }, [currentUser.id, unlikedPostIds, refreshFeed]);

  const toggleFollowUser = useCallback(async (username: string) => {
    if (!currentUser.id) return;
    const isFollowing = followingUsernames.has(username);
    try {
      if (isFollowing) {
        const followDoc = await databases.listDocuments(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, [Query.equal('followerId', currentUser.id), Query.equal('followingUsername', username)]);
        if (followDoc.total > 0) await databases.deleteDocument(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, followDoc.documents[0].$id);
        setFollowingUsernamesState(prev => { const n = new Set(prev); n.delete(username); return n; });
      } else {
        await databases.createDocument(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, ID.unique(), { followerId: currentUser.id, followerUsername: currentUser.username, followingUsername: username });
        setFollowingUsernamesState(prev => { const n = new Set(prev); n.add(username); return n; });
      }
    } catch (e) {}
  }, [currentUser.id, currentUser.username, followingUsernames]);

  const addStory = useCallback(async (segment: any) => {
    if (!currentUser.id) return;
    try {
      const tinyUser = { id: currentUser.id, name: currentUser.name, username: currentUser.username, avatar: currentUser.avatar, isVerified: currentUser.isVerified };
      await databases.createDocument(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, ID.unique(), {
        user: JSON.stringify(tinyUser), segments: JSON.stringify([{ id: ID.unique(), ...segment, timestamp: Date.now() }]),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), viewCount: 0, viewers: []
      });
      await refreshStories();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, refreshStories]);

  const voteOnStoryPoll = useCallback(async (storyId: string, segmentId: string, optionIndex: number) => {
    const story = stories.find(s => s.id === storyId);
    if (!story || !currentUser.username) return;
    const updated = [...story.segments].map(seg => {
      if (seg.id !== segmentId || !seg.poll) return seg;
      const poll = { ...seg.poll };
      const voters = poll.voters || {};
      const prev = voters[currentUser.username];
      if (prev === optionIndex) { poll.options[optionIndex].votes = Math.max(0, poll.options[optionIndex].votes - 1); delete voters[currentUser.username]; }
      else {
        if (prev !== undefined) poll.options[prev].votes = Math.max(0, poll.options[prev].votes - 1);
        poll.options[optionIndex].votes += 1;
        voters[currentUser.username] = optionIndex;
      }
      poll.voters = voters;
      return { ...seg, poll };
    });
    await databases.updateDocument(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, storyId, { segments: JSON.stringify(updated) });
    setStoriesState(prev => prev.map(s => s.id === storyId ? { ...s, segments: updated } : s));
  }, [stories, currentUser.username]);

  const voteOnPostPoll = useCallback(async (postId: string, optionIndex: number) => {
    if (!currentUser.username) return;
    const p = posts.find(x => x.id === postId);
    if (!p || !p.poll) return;
    const poll = { ...p.poll };
    const voters = poll.voters || {};
    const prev = voters[currentUser.username];
    if (prev === optionIndex) { poll.options[optionIndex].votes = Math.max(0, poll.options[optionIndex].votes - 1); delete voters[currentUser.username]; }
    else {
      if (prev !== undefined) poll.options[prev].votes = Math.max(0, poll.options[prev].votes - 1);
      poll.options[optionIndex].votes += 1;
      voters[currentUser.username] = optionIndex;
    }
    poll.voters = voters;
    poll.totalVotes = Object.keys(voters).length;
    await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { poll: JSON.stringify(poll) });
    await refreshFeed();
  }, [posts, currentUser.username, refreshFeed]);

  const updateGatewaySettings = useCallback(async (data: any) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, PLATFORM_SETTINGS_COLLECTION_ID, GLOBAL_CONFIG_ID, data);
      setGatewaySettingsState(prev => ({ ...prev, ...data }));
    } catch (e: any) { throw new Error(e.message); }
  }, []);

  const addAuditLog = useCallback(async (action: string, details: string) => {
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, AUDIT_LOGS_COLLECTION_ID, ID.unique(), {
        admin: currentUser.username, action, details, timestamp: Date.now()
      });
      await refreshAdminData();
    } catch (e) {}
  }, [currentUser.username, refreshAdminData]);

  const approvePaymentRequest = useCallback(async (id: string) => {
    try {
      const pay = await databases.getDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, id);
      const userProf = await databases.getDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, pay.userId);
      let amount = 0;
      if (pay.packageId === 'g1') amount = 200; else if (pay.packageId === 'g2') amount = 500;
      else if (pay.packageId === 'g3') amount = 1000; else if (pay.packageId === 'g4') amount = 3000;
      else if (pay.packageId === 'd1') amount = 25; else if (pay.packageId === 'd2') amount = 50;
      else if (pay.packageId === 'd3') amount = 100;
      const key = pay.type === 'Gold' ? 'goldBalance' : 'diamondBalance';
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, pay.userId, { [key]: (userProf[key] || 0) + amount });
      await databases.updateDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, id, { status: 'APPROVED' });
      await refreshAdminData();
    } catch (e) {}
  }, [refreshAdminData]);

  const createPaymentRequest = useCallback(async (screenshot: string) => {
    if (!currentUser.id || !pendingTransaction) return;
    try {
      let finalUrl = screenshot;
      if (screenshot.startsWith('data:')) {
        finalUrl = await uploadMedia(dataURLtoFile(screenshot, 'receipt.jpg'));
      }
      await databases.createDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, ID.unique(), {
        userId: currentUser.id, username: currentUser.username, packageName: pendingTransaction.packageName,
        packageId: pendingTransaction.packageId, amount: parseFloat(pendingTransaction.amount),
        currency: pendingTransaction.currency, code: pendingTransaction.code, screenshot: finalUrl,
        status: 'PENDING', timestamp: Date.now(), type: pendingTransaction.type
      });
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser.id, currentUser.username, pendingTransaction, uploadMedia]);

  const initiateCall = useCallback(async (contact: any, type: CallType) => {
    if (!currentUser.id) return;
    try {
      const channelName = `call_${currentUser.username}_${contact.username}_${Date.now()}`;
      const token = await generateAgoraToken(channelName, currentUser.id);
      const callId = ID.unique();
      await databases.createDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, callId, {
        callerId: currentUser.username, callerName: currentUser.name, callerAvatar: currentUser.avatar,
        recipientId: contact.username, type, status: 'ringing', channelName, token, timestamp: Date.now()
      });
      setCallState({ type, status: 'outgoing', contact, channelName, token, callId });
      activeCallIdRef.current = callId;
    } catch (e) { toast({ variant: "destructive", title: "Call Failed" }); }
  }, [currentUser, toast]);

  const acceptCall = useCallback(async () => {
    if (!activeCallIdRef.current) return;
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, activeCallIdRef.current, { status: 'active' });
      setCallState(prev => ({ ...prev, status: 'active' }));
    } catch (e) {}
  }, []);

  const endCall = useCallback(async (duration?: string) => {
    if (!activeCallIdRef.current) { setCallState({ type: 'audio', status: 'idle', contact: null }); return; }
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, activeCallIdRef.current, { status: 'ended', duration: duration || "0:00" });
    } catch (e) {}
    setCallState({ type: 'audio', status: 'idle', contact: null });
    activeCallIdRef.current = null;
  }, []);

  const boostNode = useCallback(async (nodeId: string, targetViews: number, durationDays: number, cost: number, currency: 'DIAMOND' | 'STAR', type: 'POST' | 'REEL' | 'SONIC') => {
    try {
      const coll = type === 'SONIC' ? SONGS_COLLECTION_ID : POSTS_COLLECTION_ID;
      await databases.updateDocument(APPWRITE_DATABASE_ID, coll, nodeId, {
        isBoosted: true, boostTargetViews: targetViews, boostCurrentViews: 0,
        boostExpiry: Date.now() + (durationDays * 24 * 60 * 60 * 1000)
      });
      const key = currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance';
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id!, { [key]: (currentUser[key] || 0) - cost });
      await refreshFeed();
    } catch (e) {}
  }, [currentUser, refreshFeed]);

  const promoteUser = useCallback(async (username: string, role: 'FINANCIAL' | 'MODERATOR') => {
    try {
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', username)]);
      if (res.total > 0) {
        await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, res.documents[0].$id, { role });
        await refreshAdminData();
      }
    } catch (e) {}
  }, [refreshAdminData]);

  const demoteUser = useCallback(async (username: string) => {
    try {
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', username)]);
      if (res.total > 0) {
        await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, res.documents[0].$id, { role: 'USER' });
        await refreshAdminData();
      }
    } catch (e) {}
  }, [refreshAdminData]);

  const addCampaign = useCallback(async (data: any) => {
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, ID.unique(), {
        ...data, impressions: 0, clicks: 0, isActive: true, timestamp: Date.now()
      });
      await refreshAdminData();
    } catch (e: any) { throw new Error(e.message); }
  }, [refreshAdminData]);

  const deleteCampaign = useCallback(async (id: string) => {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, id);
      await refreshAdminData();
    } catch (e) {}
  }, [refreshAdminData]);

  const toggleCampaignStatus = useCallback(async (id: string) => {
    try {
      const c = campaigns.find(x => x.$id === id);
      await databases.updateDocument(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, id, { isActive: !c?.isActive });
      await refreshAdminData();
    } catch (e) {}
  }, [campaigns, refreshAdminData]);

  const recordCampaignClick = useCallback(async (id: string) => {
    try {
      const c = campaigns.find(x => x.$id === id);
      if (c) await databases.updateDocument(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, id, { clicks: (c.clicks || 0) + 1 });
    } catch (e) {}
  }, [campaigns]);

  const recordView = useCallback(async (postId: string) => {
    try {
      const p = posts.find(x => x.id === postId);
      if (p) await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { views: (p.views || 0) + 1 });
    } catch (e) {}
  }, [posts]);

  const recordStoryView = useCallback(async (storyId: string) => {
    try {
      const s = stories.find(x => x.id === storyId);
      if (s) await databases.updateDocument(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, storyId, { viewCount: (s.viewCount || 0) + 1 });
    } catch (e) {}
  }, [stories]);

  const updateUserIdentity = useCallback(async (userId: string, data: Partial<User>) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userId, data);
      await refreshAdminData();
    } catch (e) {}
  }, [refreshAdminData]);

  const handleReportAction = useCallback(async (reportId: string, action: 'BAN' | 'DELETE' | 'DISMISS') => {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, REPORTS_COLLECTION_ID, reportId);
      await refreshAdminData();
    } catch (e) {}
  }, [refreshAdminData]);

  const handleTicketAction = useCallback(async (ticketId: string, status: 'PENDING' | 'RESOLVED') => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, TICKETS_COLLECTION_ID, ticketId, { status });
      await refreshAdminData();
    } catch (e) {}
  }, [refreshAdminData]);

  const verifyUser = useCallback(async (cost: number, currency: 'DIAMOND' | 'STAR') => {
    try {
      const key = currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance';
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id!, {
        [key]: (currentUser[key] || 0) - cost, isVerified: true, hasEverBeenVerified: true,
        verificationExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000)
      });
      await checkSession();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, checkSession]);

  const processGiftTransaction = useCallback(async (cost: number, currency: 'GOLD' | 'DIAMOND') => {
    try {
      const key = currency === 'GOLD' ? 'goldBalance' : 'diamondBalance';
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id!, { [key]: (currentUser[key] || 0) - cost });
      await checkSession();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, checkSession]);

  const unlockPost = useCallback(async (postId: string, cost: number) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id!, { goldBalance: (currentUser.goldBalance || 0) - cost });
      setUnlockedPostIdsState(prev => new Set(prev).add(postId));
      await checkSession();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, checkSession]);

  const subscribeToCreator = useCallback(async (username: string, cost: number) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id!, { diamondBalance: (currentUser.diamondBalance || 0) - cost });
      setActiveSubscriptionsState(prev => new Set(prev).add(username));
      await checkSession();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser, checkSession]);

  const cancelSubscription = useCallback(async (username: string) => {
    setActiveSubscriptionsState(prev => { const n = new Set(prev); n.delete(username); return n; });
  }, []);

  const incrementShareCount = useCallback(async (id: string) => {
    const p = posts.find(x => x.id === id);
    if(p) await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, id, { shares: (p.shares || 0) + 1 });
    await refreshFeed();
  }, [posts, refreshFeed]);

  const createCluster = useCallback(async (name: string, members: any[]) => {
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, ID.unique(), {
        name, adminUsername: currentUser.username, members: JSON.stringify(members)
      });
      await refreshClusters();
    } catch (e: any) { throw new Error(e.message); }
  }, [currentUser.username, refreshClusters]);

  const addMemberToCluster = useCallback(async (clusterId: string, member: any) => {
    try {
      const c = clusters.find(x => x.id === clusterId);
      if (c) {
        const updated = [...c.members, member];
        await databases.updateDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, clusterId, { members: JSON.stringify(updated) });
        await refreshClusters();
      }
    } catch (e) {}
  }, [clusters, refreshClusters]);

  const leaveCluster = useCallback(async (clusterId: string) => {
    try {
      const c = clusters.find(x => x.id === clusterId);
      if (c) {
        const updated = c.members.filter(m => m.username !== currentUser.username);
        if (updated.length === 0) await databases.deleteDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, clusterId);
        else await databases.updateDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, clusterId, { members: JSON.stringify(updated) });
        await refreshClusters();
      }
    } catch (e) {}
  }, [clusters, currentUser.username, refreshClusters]);

  // UI SETTERS
  const triggerReferralPulse = useCallback(() => {}, []);
  const recordAdMaterialization = useCallback(() => {}, []);
  const recordAdHandshake = useCallback(() => {}, []);
  const updateIntelligence = useCallback((data: any) => setIntelligenceMetricsState(p => ({...p, ...data})), []);

  const contextValue = useMemo(() => ({
    currentUser, posts, activeComments, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, 
    followingUsernames, followerUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, 
    selectedVideoUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, 
    gatewaySettings, callState, stories, campaigns, reports, tickets, mutedUserNames, connections, clusters, 
    auditLogs, staff, adStats, intelligenceMetrics, withdrawalHistory, paymentRequests, referralLink: "http://vimore.network/join/" + currentUser.username, 
    pendingTransaction, activeSubscriptions,
    login, signup, logout, resendVerification, checkSession, forgotPassword, resetPassword, uploadMedia,
    addPost, deletePost, toggleLikePost, toggleUnlikePost, toggleSavePost: (id: string) => setSavedPostIdsState(p => { const n = new Set(p); if(n.has(id)) n.delete(id); else n.add(id); return n; }), 
    toggleFollowUser, updateCurrentUser, updateSettings: (d: any) => setSettingsState(p => ({ ...p, ...d })), 
    setSearchOpen: (o: boolean) => { triggerHaptic(5); setIsSearchOpenState(o); }, 
    setSelectedChatId: (id: string | null) => { triggerHaptic(5); setSelectedChatIdState(id); },
    setSelectedPostId: (id: string | null) => { triggerHaptic(5); setSelectedPostIdState(id); },
    setSelectedImageUrl: (u: string | null) => { triggerHaptic(5); setSelectedImageUrlState(u); },
    setSelectedVideoUrl: (u: string | null) => { triggerHaptic(5); setSelectedVideoUrlState(u); },
    openCommentHub: (id: string) => { triggerHaptic(5); setActiveCommentPostIdState(id); fetchComments(id); },
    closeCommentHub: () => { triggerHaptic(5); setActiveCommentPostIdState(null); setActiveComments([]); },
    openGiftHub: (u: User) => { triggerHaptic(10); setTargetUserForGiftState(u); setIsGiftHubOpenState(true); },
    closeGiftHub: () => { triggerHaptic(5); setIsGiftHubOpenState(false); setTargetUserForGiftState(null); },
    setActiveStoryIndex: (i: number | null) => setActiveStoryIndexState(i), triggerHaptic, 
    isPostLiked: (id: string) => likedPostIds.has(id), isPostUnliked: (id: string) => unlikedPostIds.has(id), 
    isPostSaved: (id: string) => savedPostIds.has(id), isPostUnlocked: (id: string) => unlockedPostIds.has(id), 
    isFollowing: (u: string) => followingUsernames.has(u), isSubscribed: (u: string) => activeSubscriptions.has(u), 
    addComment, addReply, addStory, voteOnStoryPoll, voteOnPostPoll, toggleMuteUser: () => {}, togglePinPost: async () => {}, archivePost: async () => {},
    updateGatewaySettings, addAuditLog, approvePaymentRequest, createPaymentRequest, initiateCall, acceptCall, endCall, refreshAdminData, promoteUser, demoteUser, addCampaign, deleteCampaign, toggleCampaignStatus, recordCampaignClick, boostNode, verifyUser, processGiftTransaction, unlockPost, subscribeToCreator, cancelSubscription, recordView, recordStoryView, updateUserIdentity, handleReportAction, handleTicketAction,
    triggerReferralPulse, recordAdMaterialization, recordAdHandshake, updateIntelligence, incrementShareCount, createCluster, addMemberToCluster, leaveCluster,
    fetchProfileByUsername: async (u: string) => { const res = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', u)]); return res.total > 0 ? res.documents[0] as any : null; },
    fetchComments, refreshProfiles, refreshClusters, refreshFeed, receiveCall: (c: any, t: CallType, ch: string, tk: string, id: string) => { setCallState({ contact: c, type: t, channelName: ch, token: tk, status: 'incoming', callId: id }); activeCallIdRef.current = id; },
    initiateTransaction: (d: any) => setPendingTransactionState(d), cancelTransaction: () => setPendingTransactionState(null), processWithdrawal: async () => {}, recordWithdrawal: async () => {}
  }), [currentUser, posts, activeComments, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, followerUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, selectedVideoUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings, callState, stories, campaigns, reports, tickets, mutedUserNames, connections, clusters, auditLogs, staff, adStats, intelligenceMetrics, withdrawalHistory, paymentRequests, pendingTransaction, activeSubscriptions, login, signup, checkSession, uploadMedia, addPost, deletePost, toggleLikePost, toggleUnlikePost, toggleFollowUser, updateCurrentUser, triggerHaptic, fetchComments, addComment, addReply, addStory, voteOnStoryPoll, voteOnPostPoll, updateGatewaySettings, addAuditLog, approvePaymentRequest, createPaymentRequest, initiateCall, acceptCall, endCall, refreshAdminData, refreshProfiles, refreshClusters, refreshFeed, updateUserIdentity, handleReportAction, handleTicketAction]);

  useEffect(() => { checkSession(); }, [checkSession]);

  return <PostContext.Provider value={contextValue}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) throw new Error('usePosts must be used within a PostProvider');
  return context;
}
