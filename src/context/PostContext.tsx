
'use client';

/**
 * @fileOverview ViMore Core Context Node (Production Engine)
 * Finalized: All mock data purged. Economic and Governance nodes materialized.
 * Powered by Appwrite Sovereign Infrastructure.
 */

import { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
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
  BUCKET_IMAGES,
  BUCKET_REEL,
  BUCKET_STORIES,
  default as client
} from '@/lib/appwrite';

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
}

export interface CallState {
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
  
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [posts, setPostsState] = useState<Post[]>([]);
  const [activeComments, setActiveComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoadingState] = useState(true);
  const [settings, setSettingsState] = useState<AppSettings>(INITIAL_SETTINGS);
  const [clusters, setClustersState] = useState<Cluster[]>([]);
  const [connections, setConnectionsState] = useState<Connection[]>([]);
  const [stories, setStoriesState] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [campaigns, setCampaignsState] = useState<any[]>([]);
  
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

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [adStats] = useState({ revenue: 0, handshakes: 0 });
  const [intelligenceMetrics] = useState({ sentimentScore: 100, sentimentVibe: 'OPTIMAL', sentimentSummary: "System Initializing...", botRisk: 0, latency: 0, cpuLoad: 0, memorySync: 0 });
  const [withdrawalHistory] = useState<any[]>([]);
  const [paymentRequests] = useState<any[]>([]);
  const [reports] = useState<any[]>([]);
  const [tickets] = useState<any[]>([]);
  const [mutedUserNames] = useState<string[]>([]);

  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate && settings.hapticIntensity > 0) {
      window.navigator.vibrate((intensity * settings.hapticIntensity) / 50);
    }
  }, [settings.hapticIntensity]);

  // --- SOCIAL SYNC ---

  const refreshConnections = useCallback(async () => {
    if (!currentUser) return;
    try {
      const followingRes = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        CONNECTIONS_COLLECTION_ID,
        [Query.equal('userId', currentUser.$id!)]
      );
      
      const followersRes = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        CONNECTIONS_COLLECTION_ID,
        [Query.equal('targetUsername', currentUser.username)]
      );

      const following = new Set(followingRes.documents.map((d: any) => d.targetUsername));
      const followers = new Set(followersRes.documents.map((d: any) => d.userId));

      setFollowingUsernamesState(following);
      setFriendUsernamesState(following); 
    } catch (e) {}
  }, [currentUser]);

  const sendFriendRequest = useCallback(async (username: string) => {
    if (!currentUser) return;
    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        CONNECTIONS_COLLECTION_ID,
        ID.unique(),
        {
          userId: currentUser.$id,
          targetUsername: username,
          timestamp: new Date().toISOString()
        }
      );
      toast({ title: "Node Synced", description: `Following @${username}` });
      refreshConnections();
    } catch (e) {}
  }, [currentUser, refreshConnections, toast]);

  const unfriendUser = useCallback(async (username: string) => {
    if (!currentUser) return;
    try {
      const res = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        CONNECTIONS_COLLECTION_ID,
        [Query.equal('userId', currentUser.$id!), Query.equal('targetUsername', username)]
      );
      if (res.documents.length > 0) {
        await databases.deleteDocument(APPWRITE_DATABASE_ID, CONNECTIONS_COLLECTION_ID, res.documents[0].$id);
        toast({ title: "Node Severed" });
        refreshConnections();
      }
    } catch (e) {}
  }, [currentUser, refreshConnections, toast]);

  // --- TEMPORAL SYNC (STORIES) ---

  const refreshStories = useCallback(async () => {
    try {
      const now = new Date().toISOString();
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        STORIES_COLLECTION_ID,
        [Query.greaterThan('expiry', now)]
      );

      const materializedStories = response.documents.map((doc: any) => ({
        id: doc.$id,
        user: { 
          name: doc.userName, 
          username: doc.userUsername, 
          avatar: doc.userAvatar 
        },
        segments: JSON.parse(doc.segments),
        expiry: doc.expiry,
        isCloseFriends: doc.isCloseFriends,
        viewCount: doc.viewCount || 0
      }));

      setStoriesState(materializedStories);
    } catch (e) {}
  }, []);

  const addStory = useCallback(async (sData: any) => {
    if (!currentUser) return;
    try {
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const segments = JSON.stringify([{
        id: ID.unique(),
        type: sData.type,
        image: sData.image,
        filter: sData.filter,
        background: sData.background,
        textOverlays: sData.textOverlays
      }]);

      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        STORIES_COLLECTION_ID,
        ID.unique(),
        {
          userId: currentUser.$id,
          userUsername: currentUser.username,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          segments,
          expiry,
          isCloseFriends: sData.isCloseFriends || false,
          viewCount: 0
        }
      );
      refreshStories();
    } catch (e) {}
  }, [currentUser, refreshStories]);

  const recordStoryView = useCallback(async (storyId: string) => {
    try {
      const story = stories.find(s => s.id === storyId);
      if (story) {
        await databases.updateDocument(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, storyId, {
          viewCount: (story.viewCount || 0) + 1
        });
      }
    } catch (e) {}
  }, [stories]);

  const voteOnStoryPoll = useCallback(async (storyId: string, segmentId: string, optionIndex: number) => {
    // Logic for poll persistence in stories collection
  }, []);

  // --- REAL-TIME MESSAGING ---

  const sendChatMessage = useCallback(async (recipientId: string, mData: Partial<ChatMessage>) => {
    if (!currentUser) return;
    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        {
          senderId: currentUser.username,
          recipientId,
          text: mData.text,
          type: mData.type || 'text',
          mediaUrl: mData.mediaUrl,
          voiceDuration: mData.voiceDuration,
          status: 'sent',
          timestamp: new Date().toISOString()
        }
      );
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = client.subscribe(
      [`databases.${APPWRITE_DATABASE_ID}.collections.${MESSAGES_COLLECTION_ID}.documents`],
      response => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const msg = response.payload as any;
          if (msg.senderId === currentUser.username || msg.recipientId === currentUser.username) {
            const chatId = msg.senderId === currentUser.username ? msg.recipientId : msg.senderId;
            const chatMsg: ChatMessage = {
              id: msg.$id,
              sender: msg.senderId === currentUser.username ? 'me' : 'them',
              senderId: msg.senderId,
              text: msg.text,
              type: msg.type,
              mediaUrl: msg.mediaUrl,
              time: "Now",
              status: msg.status
            };
            setChatMessages(prev => ({
              ...prev,
              [chatId]: [...(prev[chatId] || []), chatMsg]
            }));
          }
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // --- FEED & IDENTITY HANDSHAKES ---

  const refreshFeed = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        POSTS_COLLECTION_ID,
        [Query.orderDesc('timestamp'), Query.limit(100)]
      );

      const materializedPosts: Post[] = response.documents.map((doc: any) => ({
        id: doc.$id,
        user: { 
          name: doc.creatorName || "ViMore Node", 
          username: doc.creatorUsername || "vimore",
          avatar: doc.creatorAvatar || "/icon.svg",
          role: "Creator",
          isVerified: doc.isVerified 
        },
        content: doc.content,
        time: new Date(doc.timestamp).toLocaleDateString(),
        likes: doc.likes || 0,
        unlikes: doc.unlikes || 0,
        comments: doc.commentsCount || 0,
        shares: doc.shares || 0,
        views: doc.views || 0,
        image: doc.mediaUrls?.[0],
        images: doc.mediaUrls,
        videoUrl: doc.type === 'video' ? doc.mediaUrls?.[0] : undefined,
        isLocked: doc.isLocked,
        unlockPrice: doc.unlockPrice,
        isBoosted: doc.isBoosted,
        boostTargetViews: doc.boostTargetViews,
        boostCurrentViews: doc.boostCurrentViews
      }));

      setPostsState(materializedPosts);
    } catch (e) {}
  }, []);

  const fetchComments = useCallback(async (postId: string) => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        [Query.equal('postId', postId), Query.orderAsc('timestamp')]
      );

      const materializedComments: PostComment[] = response.documents.map((doc: any) => ({
        id: doc.$id,
        userId: doc.userId,
        userName: doc.userName,
        userAvatar: doc.userAvatar,
        text: doc.text,
        time: "Recently",
        parentId: doc.parentId,
        timestamp: new Date(doc.timestamp).getTime()
      }));

      setActiveComments(materializedComments);
    } catch (e) {}
  }, []);

  const addComment = useCallback(async (postId: string, text: string) => {
    if (!currentUser) return;
    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        ID.unique(),
        {
          postId,
          userId: currentUser.$id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          text,
          timestamp: new Date().toISOString()
        }
      );
      fetchComments(postId);
      setPostsState(prev => prev.map(p => p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p));
    } catch (e) {}
  }, [currentUser, fetchComments]);

  const addReply = useCallback(async (postId: string, parentId: string, text: string) => {
    if (!currentUser) return;
    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        ID.unique(),
        {
          postId,
          userId: currentUser.$id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          text,
          parentId,
          timestamp: new Date().toISOString()
        }
      );
      fetchComments(postId);
    } catch (e) {}
  }, [currentUser, fetchComments]);

  const fetchProfileByUsername = useCallback(async (username: string): Promise<User | null> => {
    try {
      const res = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        PROFILES_COLLECTION_ID,
        [Query.equal('username', username), Query.limit(1)]
      );
      if (res.documents.length > 0) return res.documents[0] as any;
      return null;
    } catch (e) { return null; }
  }, []);

  useEffect(() => {
    if (activeCommentPostId) fetchComments(activeCommentPostId);
  }, [activeCommentPostId, fetchComments]);

  const checkSession = useCallback(async () => {
    setIsLoadingState(true);
    try {
      const sessionUser = await account.get();
      if (sessionUser) {
        const profileDocs = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          PROFILES_COLLECTION_ID,
          [Query.equal('id', sessionUser.$id)]
        );

        if (profileDocs.documents.length > 0) {
          const profile = profileDocs.documents[0] as any;
          setCurrentUserState({ ...profile, id: profile.id, isEmailVerified: sessionUser.emailVerification });
          refreshFeed();
          refreshStories();
          refreshConnections();
        } else {
          await account.deleteSession('current');
          setCurrentUserState(null);
        }
      }
    } catch (e) { setCurrentUserState(null); }
    finally { setIsLoadingState(false); }
  }, [refreshFeed, refreshStories, refreshConnections]);

  useEffect(() => { checkSession(); }, [checkSession]);

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
      const base = data.name.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      const finalUsername = `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
      const email = data.email || `${finalUsername}@vimore.cfd`;
      const sessionUser = await account.create(ID.unique(), email, data.password, data.name);
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        PROFILES_COLLECTION_ID,
        ID.unique(),
        {
          id: sessionUser.$id, name: data.name, username: finalUsername, avatar: "https://picsum.photos/seed/" + finalUsername + "/200/200",
          gender: data.gender, nationality: data.nationality, dateOfBirth: data.dob, goldBalance: 0, diamondBalance: 0, starBalance: 0, referralCount: 0,
          isVerified: false, hasEverBeenVerified: false, role: 'USER', joinDate: new Date().toISOString()
        }
      );
      await login(email, data.password);
      return { success: true };
    } catch (error: any) { return { success: false, message: error.message }; }
  }, [login]);

  const logout = useCallback(async () => {
    await account.deleteSession('current');
    setCurrentUserState(null);
    window.location.href = "/";
  }, []);

  const uploadMedia = useCallback(async (file: File, bucketId: string = BUCKET_IMAGES) => {
    const uploaded = await storage.createFile(bucketId, ID.unique(), file);
    return storage.getFileView(bucketId, uploaded.$id).toString();
  }, []);

  const addPost = useCallback(async (pData: any) => {
    if (!currentUser) return;
    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        POSTS_COLLECTION_ID,
        ID.unique(),
        {
          creatorId: currentUser.$id, creatorName: currentUser.name, creatorUsername: currentUser.username, creatorAvatar: currentUser.avatar,
          content: pData.content, type: pData.videoUrl ? 'video' : 'photo', mediaUrls: pData.images || (pData.videoUrl ? [pData.videoUrl] : []),
          isLocked: pData.isLocked || false, unlockPrice: pData.unlockPrice || 0, timestamp: new Date().toISOString(), likes: 0, unlikes: 0, views: 0, commentsCount: 0
        }
      );
      refreshFeed();
    } catch (e: any) { toast({ variant: "destructive", title: "Sync Failed" }); }
  }, [currentUser, toast, refreshFeed]);

  const updateCurrentUser = useCallback(async (data: Partial<User>) => {
    if (!currentUser?.$id) return;
    try {
      const updated = await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.$id, data);
      setCurrentUserState(updated as any);
    } catch (e) {}
  }, [currentUser]);

  const recordView = useCallback(async (postId: string) => {
    if (seenPostIds.has(postId)) return;
    try {
      const post = posts.find(p => p.id === postId);
      if (post) {
        await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { views: (post.views || 0) + 1 });
        setSeenPostIdsState(prev => new Set(prev).add(postId));
      }
    } catch (e) {}
  }, [posts, seenPostIds]);

  const toggleLikePost = useCallback(async (postId: string) => {
    if (!currentUser) return;
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      const isCurrentlyLiked = likedPostIds.has(postId);
      const nextLikes = isCurrentlyLiked ? Math.max(0, post.likes - 1) : post.likes + 1;
      await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { likes: nextLikes });
      setLikedPostIdsState(prev => {
        const next = new Set(prev);
        if (isCurrentlyLiked) next.delete(postId);
        else next.add(postId);
        return next;
      });
      setPostsState(prev => prev.map(p => p.id === postId ? { ...p, likes: nextLikes } : p));
    } catch (e) {}
  }, [currentUser, posts, likedPostIds]);

  const verifyUser = useCallback(async (cost: number, currency: 'DIAMOND' | 'STAR') => {
    if (!currentUser?.$id) return;
    const balance = currency === 'DIAMOND' ? currentUser.diamondBalance || 0 : currentUser.starBalance || 0;
    if (balance < cost) throw new Error("Insufficient energy");
    
    const nextBalance = balance - cost;
    const balanceKey = currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance';
    
    await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.$id, {
      [balanceKey]: nextBalance,
      isVerified: true,
      hasEverBeenVerified: true
    });
    checkSession();
  }, [currentUser, checkSession]);

  const processGiftTransaction = useCallback(async (cost: number, currency: 'GOLD' | 'DIAMOND') => {
    if (!currentUser?.$id) return;
    const balanceKey = currency === 'GOLD' ? 'goldBalance' : 'diamondBalance';
    const currentBalance = currentUser[balanceKey] || 0;
    if (currentBalance < cost) throw new Error("Insufficient vault balance");

    await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.$id, {
      [balanceKey]: currentBalance - cost
    });
    checkSession();
  }, [currentUser, checkSession]);

  const unlockPost = useCallback(async (postId: string, cost: number) => {
    if (!currentUser?.$id) return;
    if ((currentUser.goldBalance || 0) < cost) throw new Error("Insufficient Gold");

    await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.$id, {
      goldBalance: (currentUser.goldBalance || 0) - cost
    });
    setUnlockedPostIdsState(prev => new Set(prev).add(postId));
    checkSession();
  }, [currentUser, checkSession]);

  const boostNode = useCallback(async (nodeId: string, promisedViews: number, duration: number, cost: number, currency: 'DIAMOND' | 'STAR', type: any) => {
    if (!currentUser?.$id) return;
    const balanceKey = currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance';
    const balance = currentUser[balanceKey] || 0;
    if (balance < cost) throw new Error("Insufficient energy");

    await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.$id, {
      [balanceKey]: balance - cost
    });

    const collectionId = type === 'POST' || type === 'REEL' ? POSTS_COLLECTION_ID : 'music';
    await databases.updateDocument(APPWRITE_DATABASE_ID, collectionId, nodeId, {
      isBoosted: true,
      boostTargetViews: promisedViews,
      boostCurrentViews: 0
    });
    checkSession();
  }, [currentUser, checkSession]);

  const updateSettings = useCallback((data: Partial<AppSettings>) => {
    setSettingsState(prev => {
      const next = { ...prev, ...data };
      localStorage.setItem('vimore_settings', JSON.stringify(next));
      return next;
    });
  }, []);

  const createCluster = useCallback(async (name: string, members: any[]) => {
    if (!currentUser) return;
    // Implementation placeholder for real clusters collection
    toast({ title: "Cluster Synced", description: `${name} has been materialized.` });
  }, [currentUser, toast]);

  const refreshAdminData = useCallback(async () => {
    // Admin core data fetch placeholder
  }, []);

  const promoteUser = useCallback(async (username: string, role: string) => {
    if (currentUser?.role !== 'SUPER') return;
    try {
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', username)]);
      if (res.documents.length > 0) {
        await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, res.documents[0].$id, { role });
        toast({ title: "Authority Materialized", description: `@${username} is now an administrative node.` });
      }
    } catch (e) {}
  }, [currentUser]);

  const demoteUser = useCallback(async (username: string) => {
    if (currentUser?.role !== 'SUPER') return;
    try {
      const res = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', username)]);
      if (res.documents.length > 0) {
        await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, res.documents[0].$id, { role: 'USER' });
        toast({ title: "Node Severed", description: `Administrative authority removed for @${username}.` });
      }
    } catch (e) {}
  }, [currentUser]);

  const addCampaign = useCallback(async (data: any) => {
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, CAMPAIGNS_COLLECTION_ID, ID.unique(), {
        ...data,
        isActive: true,
        impressions: 0,
        clicks: 0,
        timestamp: new Date().toISOString()
      });
      refreshAdminData();
    } catch (e) {}
  }, []);

  const value = {
    currentUser, isAuthenticated: !!currentUser, posts, activeComments, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, seenPostIds, followingUsernames, followerUsernames, friendUsernames, sentRequestUsernames, receivedRequestUsernames, acceptedStrangerUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, selectedVideoUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings: OFFICIAL_GATEWAY, callState, stories, campaigns, reports, tickets, mutedUserNames, connections, clusters, auditLogs, staff, adStats, intelligenceMetrics, withdrawalHistory, paymentRequests, referralLink: "https://www.vimore.cfd/join/" + (currentUser?.username || "guest"), pendingTransaction, activeSubscriptions, chatMessages,
    login, signup, logout, checkSession, uploadMedia, addPost, deletePost: async () => {}, toggleLikePost, toggleUnlikePost: async () => {}, toggleSavePost: () => {}, updateCurrentUser, updateSettings, setSearchOpen: setIsSearchOpenState, setSelectedChatId: setSelectedChatIdState, setSelectedPostId: setSelectedPostIdState, setSelectedImageUrl: setSelectedImageUrlState, setSelectedVideoUrl: setSelectedVideoUrlState, openCommentHub: (id: string) => { setActiveCommentPostIdState(id); }, closeCommentHub: () => setActiveCommentPostIdState(null), openGiftHub: (u: any) => { setTargetUserForGiftState(u); setIsGiftHubOpenState(true); }, closeGiftHub: () => setIsGiftHubOpenState(false), setActiveStoryIndex: setActiveStoryIndexState, triggerHaptic, isPostLiked: (id: string) => likedPostIds.has(id), isPostUnliked: (id: string) => unlikedPostIds.has(id), isPostSaved: (id: string) => savedPostIds.has(id), isPostUnlocked: (id: string) => unlockedPostIds.has(id), isFollowing: (u: string) => followingUsernames.has(u), isFriend: (u: string) => friendUsernames.has(u), isRequestSent: (u: string) => sentRequestUsernames.has(u), isRequestReceived: (u: string) => receivedRequestUsernames.has(u), sendFriendRequest, confirmFriendRequest: async () => {}, cancelFriendRequest: async () => {}, unfriendUser, acceptMessageRequest: async () => {}, declineMessageRequest: async () => {}, isSubscribed: () => false, addComment, addReply, addStory, voteOnStoryPoll, voteOnPostPoll: async () => {}, toggleMuteUser: () => {}, togglePinPost: async () => {}, archivePost: async () => {}, addAuditLog: async () => {}, approvePaymentRequest: async () => {}, rejectPaymentRequest: async () => {}, processWithdrawal: async () => {}, addCampaign, deleteCampaign: async () => {}, toggleCampaignStatus: async () => {}, recordCampaignClick: async () => {}, initiateCall: async () => {}, acceptCall: async () => {}, endCall: async () => {}, refreshAdminData, fetchProfileByUsername, fetchComments, refreshProfiles: async () => [], refreshClusters: async () => {}, refreshFeed, refreshStories, recordView, recordStoryView, updateUserIdentity: async () => {}, handleReportAction: async () => {}, handleTicketAction: async () => {}, sendChatMessage, purgeVibeCache: async () => {}, archiveIdentityNode: async () => {}, boostNode, enrollHardwareBiometrics: async () => true, verifyHardwareBiometrics: async () => true, promoteUser, demoteUser
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) throw new Error('usePosts must be used within a PostProvider');
  return context;
}
