'use client';

/**
 * @fileOverview ViMore Core Context Node (Production Engine)
 * High-Velocity Signaling, Economy, & Governance Protocols Active.
 */

import { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { 
  account, 
  databases, 
  storage, 
  ID, 
  Query, 
  APPWRITE_DATABASE_ID, 
  PROFILES_COLLECTION_ID,
  POSTS_COLLECTION_ID,
  COMMENTS_COLLECTION_ID,
  CONNECTIONS_COLLECTION_ID,
  STORIES_COLLECTION_ID,
  MESSAGES_COLLECTION_ID,
  CAMPAIGNS_COLLECTION_ID,
  AUDIT_LOGS_COLLECTION_ID,
  PAYMENT_REQUESTS_COLLECTION_ID,
  WITHDRAWALS_COLLECTION_ID,
  CALLS_COLLECTION_ID,
  BUCKET_IMAGES,
  BUCKET_REEL,
  BUCKET_STORIES,
  BUCKET_PAYMENTS,
  default as client
} from '@/lib/appwrite';
import { generateAgoraToken } from '@/app/actions/call';

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
  isHardwareEnrolled: boolean;
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
  $id?: string;
  id?: string; 
  name: string;
  username: string;
  email?: string;
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
  isOnline?: boolean;
  lastMessage?: string;
  lastTime?: string;
}

export interface ChatMessage {
  id: string;
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
  id?: string;
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
  createCluster: (name: string, members: any[]) => Promise<void>;
  addMemberToCluster: (clusterId: string, member: any) => Promise<void>;
  leaveCluster: (clusterId: string) => Promise<void>;
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
  theme: 'light', hapticIntensity: 50, isGhostMode: false, playbackQuality: 'standard', fontScale: 1, isAutoFollowEnabled: true, activeSoundSet: 'cyberpunk', isBiometricActive: false, isHardwareEnrolled: false, taggingPrivacy: 'everyone', discoveryVisibility: 'everyone', showReadReceipts: true, legacyContact: null, isSilenceActive: false, silenceStart: "22:00", silenceEnd: "07:00", defaultStream: 'foryou', goldRate: 0.01, diamondRate: 0.25, ldMultiplier: 190, isReelsEnabled: true, isMusicEnabled: true, isGiftingEnabled: true, isAiVerificationActive: true, isSensitivityFilterActive: false, isFreeMode: false
};

const OFFICIAL_GATEWAY = {
  orangeName: "Amos Kortu",
  orangeNumber: "+231778451835",
  mtnName: "Amos Kortu",
  mtnNumber: "+231889322188"
};

export function PostProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const router = useRouter();
  
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [posts, setPostsState] = useState<Post[]>([]);
  const [activeComments, setActiveComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoadingState] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [settings, setSettingsState] = useState<AppSettings>(INITIAL_SETTINGS);
  
  const [clusters, setClustersState] = useState<Cluster[]>([]);
  const [connections, setConnectionsState] = useState<Connection[]>([]);
  const [stories, setStoriesState] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [campaigns, setCampaignsState] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [adStats, setAdStats] = useState<any>({ revenue: 0, handshakes: 0 });
  const [intelligenceMetrics, setIntelligenceMetrics] = useState<any>({});
  
  const [likedPostIds, setLikedPostIdsState] = useState<Set<string>>(new Set());
  const [unlikedPostIds, setUnlikedPostIdsState] = useState<Set<string>>(new Set());
  const [savedPostIds, setSavedPostIdsState] = useState<Set<string>>(new Set());
  const [unlockedPostIds, setUnlockedPostIdsState] = useState<Set<string>>(new Set());
  const [seenPostIds, setSeenPostIdsState] = useState<Set<string>>(new Set());
  
  const [followingUsernames, setFollowingUsernamesState] = useState<Set<string>>(new Set());
  const [followerUsernames, setFollowerUsernamesState] = useState<Set<string>>(new Set());
  const [friendUsernames, setFriendUsernamesState] = useState<Set<string>>(new Set());
  const [sentRequestUsernames, setSentRequestUsernamesState] = useState<Set<string>>(new Set());
  const [receivedRequestUsernames, setReceivedRequestUsernamesState] = useState<Set<string>>(new Set());
  const [acceptedStrangerUsernames, setAcceptedStrangerUsernames] = useState<Set<string>>(new Set());
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

  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);

  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate && settings.hapticIntensity > 0) {
      window.navigator.vibrate((intensity * settings.hapticIntensity) / 50);
    }
  }, [settings.hapticIntensity]);

  // --- DATABASE SYNC ---

  const refreshFeed = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, [Query.orderDesc('timestamp'), Query.limit(100)]);
      setPostsState(response.documents.map((doc: any) => ({
        id: doc.$id, 
        user: { name: doc.creatorName, username: doc.creatorUsername, avatar: doc.creatorAvatar, role: "Creator", isVerified: doc.isVerified, followers: 0 },
        content: doc.content, time: new Date(doc.timestamp).toLocaleDateString(), likes: doc.likes || 0, unlikes: doc.unlikes || 0, comments: doc.commentsCount || 0, shares: doc.shares || 0, views: doc.views || 0,
        image: doc.mediaUrls?.[0], images: doc.mediaUrls, videoUrl: doc.type === 'video' ? doc.mediaUrls?.[0] : undefined, isLocked: doc.isLocked, unlockPrice: doc.unlockPrice, isBoosted: doc.isBoosted,
        boostTargetViews: doc.boostTargetViews, boostCurrentViews: doc.boostCurrentViews
      })));
    } catch (e) {}
  }, []);

  const refreshStories = useCallback(async () => {
    try {
      const now = new Date().toISOString();
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, [Query.greaterThan('expiry', now)]);
      setStoriesState(response.documents.map((doc: any) => ({
        id: doc.$id, user: { name: doc.userName, username: doc.userUsername, avatar: doc.userAvatar },
        segments: JSON.parse(doc.segments), expiry: doc.expiry, isCloseFriends: doc.isCloseFriends, viewCount: doc.viewCount || 0
      })));
    } catch (e) {}
  }, []);

  const refreshAdminData = useCallback(async () => {
    try {
      const campRes = await databases.listDocuments(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, [Query.orderDesc('timestamp')]);
      setCampaignsState(campRes.documents);
      
      const payRes = await databases.listDocuments(APPWRITE_DATABASE_ID, PAYMENT_REQUESTS_COLLECTION_ID, [Query.orderDesc('timestamp'), Query.limit(50)]);
      setPaymentRequests(payRes.documents);
      
      const withRes = await databases.listDocuments(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, [Query.orderDesc('timestamp'), Query.limit(50)]);
      setWithdrawalHistory(withRes.documents);

      const auditRes = await databases.listDocuments(APPWRITE_DATABASE_ID, AUDIT_LOGS_COLLECTION_ID, [Query.orderDesc('timestamp'), Query.limit(100)]);
      setAuditLogs(auditRes.documents);
    } catch (e) {}
  }, []);

  const refreshConnections = useCallback(async () => {
    if (!currentUser) return;
    try {
      const followingRes = await databases.listDocuments(APPWRITE_DATABASE_ID, CONNECTIONS_COLLECTION_ID, [Query.equal('userId', currentUser.id!)]);
      const following = new Set(followingRes.documents.map((d: any) => d.targetUsername));
      setFollowingUsernamesState(following);
      setFriendUsernamesState(following); 
    } catch (e) {}
  }, [currentUser]);

  const checkSession = useCallback(async () => {
    setIsLoadingState(true);
    setInitError(null);
    try {
      const sessionUser = await account.get();
      if (sessionUser) {
        const profileDocs = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('id', sessionUser.$id)]);
        if (profileDocs.documents.length > 0) {
          const profile = profileDocs.documents[0] as any;
          setCurrentUserState({ ...profile, id: profile.id, isEmailVerified: sessionUser.emailVerification });
          refreshFeed(); refreshStories(); refreshConnections(); refreshAdminData();
        } else {
          // Orphaned node logic: Auth user exists but profile doc does not
          setInitError("Identity profile not found in vault. Please log out and re-synchronize.");
          // We don't automatically log out here so user can see error
        }
      }
    } catch (e: any) { 
      setCurrentUserState(null);
      // Not an error, just no session
    }
    finally { setIsLoadingState(false); }
  }, [refreshFeed, refreshStories, refreshConnections, refreshAdminData]);

  useEffect(() => { checkSession(); }, [checkSession]);

  // --- IDENTITY ---

  const login = useCallback(async (identifier: string, p: string) => {
    try {
      const email = identifier.includes('@') ? identifier : `${identifier}@vimore.cfd`;
      await account.createEmailPasswordSession(email, p);
      await checkSession();
      return { success: true };
    } catch (error: any) { return { success: false, message: error.message }; }
  }, [checkSession]);

  const signup = useCallback(async (data: any) => {
    try {
      let isFirstUser = false;
      try {
        const profilesRes = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(1)]);
        isFirstUser = profilesRes.total === 0;
      } catch (e) {
        isFirstUser = true;
      }

      const role = isFirstUser ? 'SUPER' : 'USER';
      const base = data.name.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      const finalUsername = `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
      const email = data.email || `${finalUsername}@vimore.cfd`;
      
      const sessionUser = await account.create(ID.unique(), email, data.password, data.name);
      
      await databases.createDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, sessionUser.$id, {
        id: sessionUser.$id, 
        name: data.name, 
        username: finalUsername, 
        email: email,
        avatar: "https://picsum.photos/seed/" + finalUsername + "/200/200",
        gender: data.gender, 
        nationality: data.nationality, 
        dateOfBirth: data.dob, 
        goldBalance: 0, 
        diamondBalance: 0, 
        starBalance: 0, 
        referralCount: 0,
        isVerified: false, 
        hasEverBeenVerified: false, 
        role, 
        joinDate: new Date().toISOString()
      });

      await login(email, data.password);
      return { success: true };
    } catch (error: any) { 
      return { success: false, message: error.message }; 
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await account.deleteSession('current');
      setCurrentUserState(null);
      setInitError(null);
      setFollowingUsernamesState(new Set());
      setFriendUsernamesState(new Set());
      toast({ title: "Session Purged", description: "Identity node disconnected." });
      router.push("/");
    } catch (e) {}
  }, [router, toast]);

  const updateCurrentUser = useCallback(async (data: Partial<User>) => {
    if (!currentUser?.$id) return;
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.$id, data);
      setCurrentUserState(prev => prev ? { ...prev, ...data } : null);
    } catch (e) {}
  }, [currentUser]);

  const updateSettings = (data: Partial<AppSettings>) => {
    setSettingsState(prev => ({ ...prev, ...data }));
  };

  // --- SOCIAL ---

  const sendFriendRequest = useCallback(async (targetUsername: string) => {
    if (!currentUser) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, CONNECTIONS_COLLECTION_ID, ID.unique(), {
        userId: currentUser.id, targetUsername, status: 'FRIEND', timestamp: new Date().toISOString()
      });
      refreshConnections();
    } catch (e) {}
  }, [currentUser, refreshConnections]);

  const unfriendUser = useCallback(async (targetUsername: string) => {
    if (!currentUser) return;
    try {
      const docs = await databases.listDocuments(APPWRITE_DATABASE_ID, CONNECTIONS_COLLECTION_ID, [Query.equal('userId', currentUser.id!), Query.equal('targetUsername', targetUsername)]);
      if (docs.total > 0) await databases.deleteDocument(APPWRITE_DATABASE_ID, CONNECTIONS_COLLECTION_ID, docs.documents[0].$id);
      refreshConnections();
    } catch (e) {}
  }, [currentUser, refreshConnections]);

  // --- CONTENT ---

  const addPost = async (p: any) => {
    if(!currentUser) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, ID.unique(), {
        ...p, creatorId: currentUser.id, creatorName: currentUser.name, creatorUsername: currentUser.username, creatorAvatar: currentUser.avatar, timestamp: new Date().toISOString(), likes: 0, unlikes: 0, views: 0, commentsCount: 0
      });
      refreshFeed();
    } catch (e) {}
  };

  const deletePost = async (id: string) => {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, id);
      refreshFeed();
    } catch (e) {}
  };

  const toggleLikePost = async (id: string) => {
    setLikedPostIdsState(p => {
      const n = new Set(p);
      if(n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const addComment = async (pId: string, t: string) => {
    if(!currentUser) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, COMMENTS_COLLECTION_ID, ID.unique(), {
        postId: pId, userId: currentUser.id, userName: currentUser.name, userAvatar: currentUser.avatar, text: t, timestamp: new Date().toISOString()
      });
    } catch (e) {}
  };

  const addStory = async (segment: any) => {
    if(!currentUser) return;
    try {
      const segments = [segment];
      const expiry = new Date(Date.now() + 86400000).toISOString();
      await databases.createDocument(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, ID.unique(), {
        userId: currentUser.id, userUsername: currentUser.username, userName: currentUser.name, userAvatar: currentUser.avatar,
        segments: JSON.stringify(segments), expiry, isCloseFriends: false, viewCount: 0
      });
      refreshStories();
    } catch (e) {}
  };

  // --- ECONOMY ---

  const createPaymentRequest = async (s: string) => {
    if(!currentUser) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, PAYMENT_REQUESTS_COLLECTION_ID, ID.unique(), {
        userId: currentUser.id, username: currentUser.username, packageName: pendingTransaction?.packageName || "Node Package",
        amount: pendingTransaction?.amount || "0", currency: pendingTransaction?.currency || "LD", code: pendingTransaction?.code || "VBC-SYNC",
        screenshot: s, status: 'PENDING', timestamp: new Date().toISOString()
      });
    } catch (e) {}
  };

  const recordWithdrawal = async (n: any) => {
    if(!currentUser) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, ID.unique(), {
        ...n, userId: currentUser.id, username: currentUser.username, status: 'PENDING', timestamp: new Date().toISOString()
      });
    } catch (e) {}
  };

  const approvePaymentRequest = async (id: string) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, PAYMENT_REQUESTS_COLLECTION_ID, id, { status: 'APPROVED' });
      refreshAdminData();
    } catch (e) {}
  };

  const rejectPaymentRequest = async (id: string) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, PAYMENT_REQUESTS_COLLECTION_ID, id, { status: 'REJECTED' });
      refreshAdminData();
    } catch (e) {}
  };

  const processWithdrawal = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, id, { status });
      refreshAdminData();
    } catch (e) {}
  };

  // --- GOVERNANCE ---

  const addCampaign = async (d: any) => {
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, ID.unique(), {
        ...d, isActive: true, impressions: 0, clicks: 0, timestamp: new Date().toISOString()
      });
      refreshAdminData();
    } catch (e) {}
  };

  const deleteCampaign = async (id: string) => {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, id);
      refreshAdminData();
    } catch (e) {}
  };

  const toggleCampaignStatus = async (id: string) => {
    const c = campaigns.find(c => c.$id === id);
    if(c) {
      try {
        await databases.updateDocument(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, id, { isActive: !c.isActive });
        refreshAdminData();
      } catch (e) {}
    }
  };

  const promoteUser = async (username: string, role: any) => {
    try {
      const docs = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', username)]);
      if (docs.total > 0) {
        await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, docs.documents[0].$id, { role });
        refreshAdminData();
      }
    } catch (e) {}
  };

  // --- CALL PROTOCOL ---

  const initiateCall = useCallback(async (contact: any, type: 'audio' | 'video') => {
    if (!currentUser) return;
    const channelName = `vimore_call_${ID.unique()}`;
    const token = await generateAgoraToken(channelName, currentUser.id!);
    
    try {
      const callDoc = await databases.createDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, ID.unique(), {
        callerId: currentUser.username, recipientId: contact.username, type, status: 'ringing', channelName, token, timestamp: new Date().toISOString()
      });
      setCallState({ type, status: 'outgoing', contact, channelName, token, id: callDoc.$id });
    } catch (e) {}
  }, [currentUser]);

  const endCall = useCallback(async (duration?: string) => {
    if (!callState.id) return;
    try {
      const status = callState.status === 'active' ? 'ended' : 'missed';
      await databases.updateDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, callState.id, { status, duration });
      setCallState({ type: 'video', status: 'idle', contact: null });
    } catch (e) {}
  }, [callState.id]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = client.subscribe(
      [`databases.${APPWRITE_DATABASE_ID}.collections.${CALLS_COLLECTION_ID}.documents`],
      response => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const payload = response.payload as any;
          if (payload.recipientId === currentUser.username && payload.status === 'ringing') {
            setCallState({
              id: payload.$id,
              type: payload.type,
              status: 'incoming',
              contact: { name: payload.callerId, username: payload.callerId, avatar: "" }, // Placeholder avatar
              channelName: payload.channelName,
              token: payload.token
            });
          }
        }
      }
    );
    return () => unsubscribe();
  }, [currentUser]);

  const acceptCall = async () => {
    if(!callState.id) return;
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, callState.id, { status: 'active' });
      setCallState(prev => ({ ...prev, status: 'active' }));
    } catch (e) {}
  };

  const value = {
    currentUser, isAuthenticated: !!currentUser, posts, activeComments, isLoading, initError, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, seenPostIds, followingUsernames, followerUsernames, friendUsernames, sentRequestUsernames, receivedRequestUsernames, acceptedStrangerUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, selectedVideoUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings: OFFICIAL_GATEWAY, callState, stories, campaigns, reports, tickets, mutedUserNames, connections, clusters, auditLogs, staff, adStats, intelligenceMetrics, withdrawalHistory, paymentRequests, referralLink: "https://www.vimore.cfd/join/" + (currentUser?.username || "guest"), pendingTransaction, activeSubscriptions: new Set<string>(), chatMessages,
    login, signup, logout, checkSession,
    uploadMedia: async (f: File, b: string = BUCKET_IMAGES) => { const up = await storage.createFile(b, ID.unique(), f); return storage.getFileView(b, up.$id).toString(); },
    addPost, deletePost, toggleLikePost, toggleUnlikePost: async () => {}, toggleSavePost: (id: string) => setSavedPostIdsState(p => { const n = new Set(p); if(n.has(id)) n.delete(id); else n.add(id); return n; }), 
    updateCurrentUser, updateSettings, setSearchOpen: setIsSearchOpenState, setSelectedChatId: setSelectedChatIdState, setSelectedPostId: setSelectedPostIdState, setSelectedImageUrl: setSelectedImageUrlState, setSelectedVideoUrl: setSelectedVideoUrlState, openCommentHub: (id: string) => { setActiveCommentPostIdState(id); }, closeCommentHub: () => setActiveCommentPostIdState(null), openGiftHub: (u: any) => { setTargetUserForGiftState(u); setIsGiftHubOpenState(true); }, closeGiftHub: () => setIsGiftHubOpenState(false), setActiveStoryIndex: setActiveStoryIndexState, triggerHaptic, 
    isPostLiked: (id: string) => likedPostIds.has(id), isPostUnliked: (id: string) => unlikedPostIds.has(id), isPostSaved: (id: string) => savedPostIds.has(id), isPostUnlocked: (id: string) => unlockedPostIds.has(id), isFollowing: (u: string) => followingUsernames.has(u), isFriend: (u: string) => friendUsernames.has(u), isRequestSent: (u: string) => sentRequestUsernames.has(u), isRequestReceived: (u: string) => receivedRequestUsernames.has(u), 
    sendFriendRequest, confirmFriendRequest: async () => {}, cancelFriendRequest: async () => {}, unfriendUser, acceptMessageRequest: async () => {}, declineMessageRequest: async () => {}, isSubscribed: () => false, 
    addComment, addReply: async () => {}, addStory, voteOnStoryPoll: async () => {}, voteOnPostPoll: async () => {}, toggleMuteUser: () => {}, togglePinPost: async () => {}, archivePost: async () => {}, addAuditLog: async () => {}, 
    approvePaymentRequest, rejectPaymentRequest, processWithdrawal, addCampaign, deleteCampaign, toggleCampaignStatus, promoteUser, initiateCall, acceptCall, endCall, refreshAdminData, fetchProfileByUsername: async () => null, fetchComments: async () => {}, refreshProfiles: async () => [], refreshClusters: async () => {}, refreshFeed, refreshStories, 
    recordView: async (id: string) => { const p = posts.find(p => p.id === id); if(p) await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, id, { views: (p.views || 0) + 1 }); }, 
    recordStoryView: async (id: string) => { const s = stories.find(s => s.id === id); if(s) await databases.updateDocument(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, id, { viewCount: (s.viewCount || 0) + 1 }); }, 
    updateUserIdentity: async () => {}, handleReportAction: async () => {}, handleTicketAction: async () => {}, sendChatMessage: async () => {}, purgeVibeCache: async () => {}, archiveIdentityNode: async () => {}, boostNode: async () => {}, enrollHardwareBiometrics: async () => true, verifyHardwareBiometrics: async () => true, demoteUser: async () => {}, initiateTransaction: (d: any) => setPendingTransactionState(d), cancelTransaction: () => setPendingTransactionState(null), createPaymentRequest, recordWithdrawal, verifyUser: async () => {}, processGiftTransaction: async () => {}, unlockPost: async () => {}, subscribeToCreator: async () => {}, cancelSubscription: async () => {}, incrementShareCount: async () => {}, createCluster: async () => {}, addMemberToCluster: async () => {}, leaveCluster: async () => {}, recordCampaignClick: async () => {},
    reports, tickets, auditLogs, staff, adStats, intelligenceMetrics, withdrawalHistory, paymentRequests
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) throw new Error('usePosts must be used within a PostProvider');
  return context;
}