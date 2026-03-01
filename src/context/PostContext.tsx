"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback, useRef } from 'react';
import client, { 
  account, 
  ID, 
  databases, 
  storage, 
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
  CALLS_COLLECTION_ID
} from '@/lib/appwrite';
import { Query } from 'appwrite';
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
}

export interface User {
  id?: string;
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
  links?: Array<{ label: string; url: string; icon: any }>;
  profilePictureHistory?: string[];
  coverPhotoHistory?: string[];
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
  hashtags?: string[];
  images?: string[];
  image?: string;
  videoUrl?: string; 
  imageFilter?: string;
  feeling?: { emoji: string; text: string };
  location?: string;
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
}

export interface PostComment {
  id: string;
  user: User;
  text: string;
  time: string;
  likes: number;
  replies: PostComment[];
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
export type CallStatus = 'idle' | 'incoming' | 'outgoing' | 'active';

export interface CallState {
  type: CallType;
  status: CallStatus;
  contact: any | null;
  channelName?: string;
  token?: string;
  startTime?: number;
  callId?: string;
}

export interface StorySegment {
  id: string;
  image: string;
  type: 'image' | 'video';
  filter?: string;
  textOverlays?: any[];
  background?: string;
  poll?: any;
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
  activeStoryIndex: number | null;
  selectedChatId: string | null;
  selectedPostId: string | null;
  selectedImageUrl: string | null;
  isSearchOpen: boolean;
  isGiftHubOpen: boolean;
  targetUserForGift: User | null;
  activeCommentPostId: string | null;
  settings: AppSettings;
  gatewaySettings: any;
  callState: CallState;
  stories: any[];
  campaigns: any[];
  mutedUserNames: string[];
  connections: Connection[];
  clusters: Cluster[];
  auditLogs: any[];
  disputes: any[];
  staff: any[];
  adStats: any;
  intelligenceMetrics: any;
  withdrawalHistory: any[];
  paymentRequests: any[];
  referralLink: string;
  pendingTransaction: any;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, username: string) => Promise<void>;
  uploadMedia: (file: File) => Promise<string>;
  addPost: (post: any) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleUnlikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  toggleFollowUser: (username: string) => Promise<void>;
  updateCurrentUser: (data: Partial<User>) => void;
  updateSettings: (data: Partial<AppSettings>) => void;
  setSearchOpen: (open: boolean) => void;
  setSelectedChatId: (id: string | null) => void;
  setSelectedPostId: (id: string | null) => void;
  setSelectedImageUrl: (url: string | null) => void;
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
  addComment: (postId: string, text: string) => Promise<void>;
  addReply: (postId: string, commentId: string, text: string) => void;
  addStory: (segment: any) => Promise<void>;
  voteOnStoryPoll: (storyId: string, segmentId: string, optionIndex: number) => Promise<void>;
  toggleMuteUser: (username: string) => void;
  togglePinPost: (postId: string) => void;
  archivePost: (postId: string) => void;
  updateGatewaySettings: (data: any) => void;
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
  unlockPost: (postId: string, cost: number) => void;
  subscribeToCreator: (username: string, cost: number) => void;
  cancelSubscription: (username: string) => void;
  recordAdMaterialization: () => void;
  recordAdHandshake: (revenue: number) => void;
  updateIntelligence: (data: any) => void;
  incrementShareCount: (postId: string) => void;
  createCluster: (name: string, members: any[]) => Promise<void>;
  addMemberToCluster: (clusterId: string, member: any) => Promise<void>;
  leaveCluster: (clusterId: string) => Promise<void>;
  resolveDispute: (id: string, action: any) => void;
  promoteUser: (username: string, role: 'FINANCIAL' | 'MODERATOR') => Promise<void>;
  demoteUser: (username: string) => Promise<void>;
  addCampaign: (data: any) => void;
  deleteCampaign: (id: string) => void;
  toggleCampaignStatus: (id: string) => void;
  recordCampaignClick: (id: string) => void;
  boostNode: (nodeId: string, targetViews: number, durationDays: number, cost: number, currency: 'DIAMOND' | 'STAR') => void;
  initiateCall: (contact: any, type: CallType) => Promise<void>;
  receiveCall: (contact: any, type: CallType, channelName: string, token: string, callId: string) => void;
  acceptCall: () => Promise<void>;
  endCall: (duration?: string) => Promise<void>;
  refreshAdminData: () => Promise<void>;
  fetchProfileByUsername: (username: string) => Promise<User | null>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const INITIAL_USER: User = {
  name: "Guest Node",
  username: "johndoe_creative",
  avatar: "https://picsum.photos/seed/me/400/400",
  bio: "Digital creator and explorer of the ViMore network. 🎨 ✨",
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
  isSensitivityFilterActive: false
};

export function PostProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [mutedUserNames, setMutedUserNames] = useState<string[]>([]);
  
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [unlikedPostIds, setUnlikedPostIds] = useState<Set<string>>(new Set());
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [unlockedPostIds, setUnlockedPostIds] = useState<Set<string>>(new Set());
  const [followingUsernames, setFollowingUsernames] = useState<Set<string>>(new Set());
  
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isGiftHubOpen, setIsGiftHubOpen] = useState(false);
  const [targetUserForGift, setTargetUserForGift] = useState<User | null>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const [callState, setCallState] = useState<CallState>({ type: 'video', status: 'idle', contact: null });
  const activeCallIdRef = useRef<string | null>(null);

  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [pendingTransaction, setPendingTransaction] = useState<any>(null);

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
    } catch (e) {
      console.error("Audit log failed to materialize:", e);
    }
  }, [currentUser.username]);

  const refreshStories = useCallback(async () => {
    try {
      const now = Date.now();
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        STORIES_COLLECTION_ID,
        [Query.greaterThan('expiresAt', now)]
      );
      
      const liveStories = response.documents.map(doc => ({
        id: doc.$id,
        user: typeof doc.user === 'string' ? JSON.parse(doc.user) : doc.user,
        segments: typeof doc.segments === 'string' ? JSON.parse(doc.segments) : doc.segments,
        isCloseFriends: doc.isCloseFriends,
        viewCount: doc.viewCount || 0
      }));
      
      setStories(liveStories);
    } catch (e) {
      console.error("Story sync failure:", e);
    }
  }, []);

  const refreshFeed = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        POSTS_COLLECTION_ID,
        [Query.orderDesc('$createdAt'), Query.limit(50)]
      );
      
      const livePosts = response.documents.map(doc => ({
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
        theme: doc.theme,
        language: doc.language,
        isLocked: doc.isLocked,
        unlockPrice: doc.unlockPrice
      }));
      
      setPosts(livePosts as Post[]);

      try {
        const user = await account.get();
        const likeResponse = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          LIKES_COLLECTION_ID,
          [Query.equal('userId', user.$id)]
        );
        const likedIds = new Set(likeResponse.documents.map(d => d.postId));
        setLikedPostIds(likedIds);
      } catch (e) {}

    } catch (error) {
      console.error("Feed Synchronization Failed:", error);
    }
  }, []);

  const refreshSocialGraph = useCallback(async () => {
    try {
      const user = await account.get();
      const followResponse = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        FOLLOWS_COLLECTION_ID,
        [Query.equal('followerId', user.$id)]
      );
      const following = new Set(followResponse.documents.map(d => d.followingUsername));
      setFollowingUsernames(following);
    } catch (e) {
      console.error("Social Graph Sync Failed:", e);
    }
  }, []);

  const refreshProfiles = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        PROFILES_COLLECTION_ID,
        [Query.limit(100)]
      );
      setConnections(response.documents.map(doc => ({
        ...doc,
        isGroup: false as const
      }) as any));
    } catch (e) {
      console.error("Discovery profiles sync failed:", e);
    }
  }, []);

  const refreshClusters = useCallback(async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        CLUSTERS_COLLECTION_ID
      );
      const liveClusters = response.documents.map(doc => ({
        id: doc.$id,
        name: doc.name,
        adminUsername: doc.adminUsername,
        avatar: doc.avatar,
        members: JSON.parse(doc.members || '[]'),
        isGroup: true as const
      }));
      setClusters(liveClusters);
    } catch (e) {
      console.error("Cluster Sync Failed:", e);
    }
  }, []);

  const refreshEconomy = useCallback(async (userId: string) => {
    try {
      const [withdraws, payments] = await Promise.all([
        databases.listDocuments(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, [Query.equal('userId', userId)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, [Query.equal('userId', userId)])
      ]);
      setWithdrawalHistory(withdraws.documents);
      setPaymentRequests(payments.documents);
    } catch (e) {
      console.error("Economy Archival Sync Failed:", e);
    }
  }, []);

  const fetchProfileByUsername = useCallback(async (username: string): Promise<User | null> => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        PROFILES_COLLECTION_ID,
        [Query.equal('username', username)]
      );
      if (response.documents.length === 0) return null;
      const profile = response.documents[0];
      return {
        id: profile.$id,
        name: profile.name,
        username: profile.username,
        avatar: profile.avatar,
        isVerified: profile.isVerified,
        followers: profile.followers,
        following: profile.following,
        posts: profile.posts,
        bio: profile.bio,
        category: profile.category,
        role: profile.role,
        goldBalance: profile.goldBalance,
        diamondBalance: profile.diamondBalance,
        starBalance: profile.starBalance,
        referralCount: profile.referralCount,
        hasEverBeenVerified: profile.hasEverBeenVerified
      } as User;
    } catch (e) {
      console.error("Individual profile fetch failed:", e);
      return null;
    }
  }, []);

  const refreshAdminData = useCallback(async () => {
    if (!currentUser.role || currentUser.role === 'USER') return;
    try {
      const [withdraws, payments, profiles, logs] = await Promise.all([
        databases.listDocuments(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(100)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(100)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(100)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, AUDIT_LOGS_COLLECTION_ID, [Query.orderDesc('timestamp'), Query.limit(100)])
      ]);
      setWithdrawalHistory(withdraws.documents);
      setPaymentRequests(payments.documents);
      setStaff(profiles.documents.filter(p => p.role && p.role !== 'USER'));
      setConnections(profiles.documents.map(p => ({ ...p, isGroup: false } as any)));
      setAuditLogs(logs.documents);
    } catch (e) {
      console.error("Command Core Admin sync failure:", e);
    }
  }, [currentUser.role]);

  const receiveCall = useCallback((contact: any, type: CallType, channelName: string, token: string, callId: string) => {
    activeCallIdRef.current = callId;
    setCallState({ type, status: 'incoming', contact, channelName, token, callId });
  }, []);

  const endCall = useCallback(async (duration?: string) => {
    const callId = activeCallIdRef.current;
    const contactName = callState.contact?.name || 'Unknown';
    if (callId) {
      try {
        await databases.updateDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, callId, {
          status: 'ended'
        });
        await addAuditLog("SPATIAL_HANDSHAKE_ENDED", `Call with ${contactName} ended. Duration: ${duration || 'N/A'}. Node purged.`);
      } catch (e) {}
    }
    activeCallIdRef.current = null;
    setCallState({ type: 'audio', status: 'idle', contact: null });
  }, [callState.contact, addAuditLog]);

  const checkSession = useCallback(async () => {
    try {
      const user = await account.get();
      let profile;
      try {
        profile = await databases.getDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, user.$id);
      } catch (e) {
        profile = await databases.createDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, user.$id, {
          userId: user.$id,
          name: user.name,
          username: user.email.split('@')[0],
          avatar: INITIAL_USER.avatar,
          goldBalance: 0,
          diamondBalance: 0,
          starBalance: 0,
          role: 'USER'
        });
      }

      setCurrentUser({
        id: user.$id,
        name: profile.name,
        username: profile.username,
        avatar: profile.avatar,
        isOnline: true,
        isVerified: profile.isVerified || false,
        role: profile.role || 'USER',
        goldBalance: profile.goldBalance || 0,
        diamondBalance: profile.diamondBalance || 0,
        starBalance: profile.starBalance || 0,
        referralCount: profile.referralCount || 0,
        hasEverBeenVerified: profile.hasEverBeenVerified || false
      });

      await Promise.all([
        refreshFeed(), 
        refreshStories(), 
        refreshSocialGraph(), 
        refreshProfiles(),
        refreshClusters(), 
        refreshEconomy(user.$id)
      ]);
      
      client.subscribe(`databases.${APPWRITE_DATABASE_ID}.collections.${CALLS_COLLECTION_ID}.documents`, response => {
        const payload = response.payload as any;
        const currentId = activeCallIdRef.current;
        if (payload.calleeId === user.$id && payload.status === 'ringing') {
          receiveCall(payload.caller, payload.type, payload.channelName, payload.token, payload.$id);
        } else if (payload.callerId === user.$id && payload.status === 'active' && payload.$id === currentId) {
          setCallState(prev => ({ ...prev, status: 'active', startTime: Date.now() }));
        } else if (payload.status === 'ended' && payload.$id === currentId) {
          endCall();
        }
      });

      if (profile.role && profile.role !== 'USER') await refreshAdminData();
    } catch (error) {
      console.log("No active signature node.");
    } finally {
      setIsLoading(false);
    }
  }, [refreshFeed, refreshStories, refreshSocialGraph, refreshProfiles, refreshClusters, refreshEconomy, refreshAdminData, receiveCall, endCall]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const syncUserBalance = async (updates: Partial<User>) => {
    if (!currentUser.id) return;
    try {
      const updatedProfile = await databases.updateDocument(
        APPWRITE_DATABASE_ID, 
        PROFILES_COLLECTION_ID, 
        currentUser.id, 
        updates
      );
      setCurrentUser(prev => ({
        ...prev,
        goldBalance: updatedProfile.goldBalance,
        diamondBalance: updatedProfile.diamondBalance,
        starBalance: updatedProfile.starBalance,
        referralCount: updatedProfile.referralCount
      }));
    } catch (e) {
      console.error("Balance synchronization failed:", e);
    }
  };

  const login = async (email: string, pass: string) => {
    await account.createEmailPasswordSession(email, pass);
    await checkSession();
  };

  const signup = async (email: string, pass: string, name: string, username: string) => {
    const user = await account.create(ID.unique(), email, pass, name);
    await account.createEmailPasswordSession(email, pass);
    await databases.createDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, user.$id, {
      userId: user.$id,
      name,
      username,
      avatar: INITIAL_USER.avatar,
      goldBalance: 0,
      diamondBalance: 0,
      starBalance: 0,
      role: 'USER'
    });
    await checkSession();
  };

  const uploadMedia = async (file: File): Promise<string> => {
    const response = await storage.createFile(APPWRITE_BUCKET_ID, ID.unique(), file);
    return `${client.config.endpoint}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${response.$id}/view?project=${client.config.project}`;
  };

  const addPost = async (newPostData: any) => {
    try {
      const docData = {
        content: newPostData.content,
        user: JSON.stringify(newPostData.user),
        image: newPostData.image,
        images: JSON.stringify(newPostData.images || []),
        videoUrl: newPostData.videoUrl,
        theme: newPostData.theme,
        language: newPostData.language,
        isLocked: newPostData.isLocked || false,
        unlockPrice: newPostData.unlockPrice || 0,
        likes: 0,
        unlikes: 0,
        comments: 0,
        shares: 0
      };
      await databases.createDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, ID.unique(), docData);
      await refreshFeed();
    } catch (error) {
      console.error("Post materialization failed:", error);
      throw error;
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error("Node purge failed:", error);
    }
  };

  const toggleLikePost = async (postId: string) => {
    const isCurrentlyLiked = likedPostIds.has(postId);
    const user = await account.get();
    setLikedPostIds(prev => {
      const next = new Set(prev);
      if (isCurrentlyLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      if (isCurrentlyLiked) {
        const response = await databases.listDocuments(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, [Query.equal('postId', postId), Query.equal('userId', user.$id)]);
        if (response.documents.length > 0) await databases.deleteDocument(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, response.documents[0].$id);
        await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { likes: Math.max(0, post.likes - 1) });
      } else {
        await databases.createDocument(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, ID.unique(), { postId, userId: user.$id });
        await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { likes: post.likes + 1 });
      }
      refreshFeed();
    } catch (e) {
      console.error("Like handshake failed:", e);
    }
  };

  const approvePaymentRequest = async (id: string) => {
    try {
      const request = paymentRequests.find(p => p.$id === id);
      if (!request) return;
      await databases.updateDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, id, { status: 'APPROVED' });
      const profile = await databases.getDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, request.userId);
      const updates: any = {};
      if (request.packageName.includes('Gold') || request.packageName.includes('Starter')) {
        updates.goldBalance = (profile.goldBalance || 0) + request.amount;
      } else {
        updates.diamondBalance = (profile.diamondBalance || 0) + request.amount;
      }
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, request.userId, updates);
      await addAuditLog("PAYMENT_APPROVED", `Authorized ${request.amount} for @${request.username}`);
      await refreshAdminData();
    } catch (e) {
      console.error("Payment approval handshake failed:", e);
    }
  };

  const rejectPaymentRequest = async (id: string) => {
    try {
      const request = paymentRequests.find(p => p.$id === id);
      await databases.updateDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, id, { status: 'REJECTED' });
      await addAuditLog("PAYMENT_REJECTED", `Denied request from @${request?.username}`);
      await refreshAdminData();
    } catch (e) {
      console.error("Payment rejection handshake failed:", e);
    }
  };

  const processWithdrawal = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const request = withdrawalHistory.find(w => w.$id === id);
      await databases.updateDocument(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, id, { status });
      await addAuditLog(`WITHDRAWAL_${status}`, `Handshake for ${request?.payoutAmount} ${request?.payoutCurrency} by @${request?.username}`);
      await refreshAdminData();
    } catch (e) {
      console.error("Withdrawal audit failure:", e);
    }
  };

  const promoteUser = async (username: string, role: 'FINANCIAL' | 'MODERATOR') => {
    try {
      const profileResponse = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', username)]);
      if (profileResponse.documents.length === 0) return;
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, profileResponse.documents[0].$id, { role });
      await addAuditLog("USER_PROMOTED", `Identity @${username} materialized as ${role}`);
      await refreshAdminData();
    } catch (e) {
      console.error("Authority materialization failure:", e);
    }
  };

  const demoteUser = async (username: string) => {
    try {
      const profileResponse = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', username)]);
      if (profileResponse.documents.length === 0) return;
      await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, profileResponse.documents[0].$id, { role: 'USER' });
      await addAuditLog("USER_DEMOTED", `Node @${username} role detached.`);
      await refreshAdminData();
    } catch (e) {
      console.error("Node role detachment failure:", e);
    }
  };

  const verifyUser = async (cost: number, currency: 'DIAMOND' | 'STAR') => {
    if (!currentUser.id) return;
    const balanceKey = currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance';
    const currentBalance = (currentUser as any)[balanceKey] || 0;
    
    await syncUserBalance({ 
      [balanceKey]: Math.max(0, currentBalance - cost),
      isVerified: true,
      hasEverBeenVerified: true,
      verificationExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000)
    });
    
    await addAuditLog("AI_VERIFICATION", `Identity @${currentUser.username} verified via ${currency} pulse.`);
  };

  const toggleFollowUser = async (username: string) => {
    triggerHaptic(20);
    const isCurrentlyFollowing = followingUsernames.has(username);
    setFollowingUsernames(prev => {
      const next = new Set(prev);
      if (isCurrentlyFollowing) next.delete(username);
      else next.add(username);
      return next;
    });
    
    try {
      const user = await account.get();
      if (isCurrentlyFollowing) {
        const response = await databases.listDocuments(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, [
          Query.equal('followerId', user.$id),
          Query.equal('followingUsername', username)
        ]);
        if (response.documents.length > 0) {
          await databases.deleteDocument(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, response.documents[0].$id);
        }
      } else {
        await databases.createDocument(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, ID.unique(), {
          followerId: user.$id,
          followingUsername: username
        });
      }
    } catch (e) {
      console.error("Follow handshake failed:", e);
    }
  };

  const addComment = async (postId: string, text: string) => {
    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        COMMENTS_COLLECTION_ID,
        ID.unique(),
        {
          postId,
          userId: currentUser.id,
          userName: currentUser.name,
          userAvatar: currentUser.avatar,
          text,
          likes: 0
        }
      );
      const post = posts.find(p => p.id === postId);
      if (post) {
        await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          POSTS_COLLECTION_ID,
          postId,
          { comments: (post.comments || 0) + 1 }
        );
      }
      await refreshFeed();
    } catch (e) {
      console.error("Comment failed:", e);
    }
  };

  const addStory = async (segmentData: any) => {
    try {
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
      const docData = {
        user: JSON.stringify(currentUser),
        segments: JSON.stringify([{
          id: ID.unique(),
          ...segmentData
        }]),
        isCloseFriends: false,
        viewCount: 0,
        expiresAt
      };
      await databases.createDocument(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, ID.unique(), docData);
      await refreshStories();
    } catch (e) {
      console.error("Story materialization failed:", e);
    }
  };

  const voteOnStoryPoll = async (storyId: string, segmentId: string, optionIndex: number) => {
    try {
      const story = stories.find(s => s.id === storyId);
      if (!story) return;
      const newSegments = story.segments.map((s: any) => {
        if (s.id === segmentId && s.poll) {
          const newOptions = [...s.poll.options];
          newOptions[optionIndex].votes += 1;
          return { ...s, poll: { ...s.poll, options: newOptions } };
        }
        return s;
      });
      await databases.updateDocument(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, storyId, {
        segments: JSON.stringify(newSegments)
      });
      await refreshStories();
    } catch (e) {
      console.error("Poll handshake failed:", e);
    }
  };

  const recordWithdrawal = async (node: any) => {
    if (!currentUser.id) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, ID.unique(), {
        userId: currentUser.id,
        username: node.username,
        amount: node.amount,
        currency: node.currency,
        payoutAmount: node.payoutAmount,
        payoutCurrency: node.payoutCurrency,
        method: node.method,
        status: 'PENDING',
        accountName: node.accountName,
        accountNumber: node.accountNumber
      });
      await addAuditLog("WITHDRAWAL_REQUEST", `New energy exit pulse from @${node.username}`);
      await refreshEconomy(currentUser.id);
    } catch (e) {
      console.error("Withdrawal archival failed:", e);
    }
  };

  const processGiftTransaction = async (cost: number, currency: 'GOLD' | 'DIAMOND') => {
    if (!currentUser.id) return;
    const balanceKey = currency === 'GOLD' ? 'goldBalance' : 'diamondBalance';
    const currentBalance = (currentUser as any)[balanceKey] || 0;
    await syncUserBalance({ [balanceKey]: Math.max(0, currentBalance - cost) });
    await addAuditLog("GIFT_SENT", `Creator support pulse from @${currentUser.username} (${cost} ${currency})`);
  };

  const boostNode = (nodeId: string, targetViews: number, durationDays: number, cost: number, currency: 'DIAMOND' | 'STAR') => {
    const balanceKey = currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance';
    const currentBalance = (currentUser as any)[balanceKey] || 0;
    syncUserBalance({ [balanceKey]: Math.max(0, currentBalance - cost) });
    addAuditLog("NODE_BOOSTED", `Node ${nodeId} amplified for ${durationDays} days (@${currentUser.username})`);
  };

  const initiateCall = async (contact: any, type: CallType) => {
    if (!currentUser.id) return;
    const channelName = `vimore_${currentUser.id}_${contact.id || contact.username}`;
    
    try {
      const token = await generateAgoraToken(channelName, 0); 
      const callDoc = await databases.createDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, ID.unique(), {
        caller: JSON.stringify(currentUser),
        callerId: currentUser.id,
        calleeId: contact.id || contact.username,
        channelName,
        token,
        type,
        status: 'ringing'
      });

      activeCallIdRef.current = callDoc.$id;
      setCallState({ type, status: 'outgoing', contact, channelName, token, callId: callDoc.$id });
    } catch (e) {
      console.error("Call initiation pulse failed:", e);
    }
  };

  const acceptCall = async () => {
    const callId = activeCallIdRef.current;
    if (!callId) return;
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, callId, {
        status: 'active'
      });
      setCallState(prev => ({ ...prev, status: 'active', startTime: Date.now() }));
    } catch (e) {
      console.error("Call acceptance failed:", e);
    }
  };

  const updateCurrentUser = (data: Partial<User>) => {
    if (!currentUser.id) return;
    databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, data)
      .then(res => setCurrentUser(prev => ({ ...prev, ...data })))
      .catch(e => console.error("Profile sync failed:", e));
  };

  const updateSettings = (data: Partial<AppSettings>) => setSettings(prev => ({ ...prev, ...data }));
  
  const isPostLiked = (postId: string) => likedPostIds.has(postId);
  const isPostUnliked = (postId: string) => unlikedPostIds.has(postId);
  const isPostSaved = (postId: string) => savedPostIds.has(postId);
  const isPostUnlocked = (postId: string) => unlockedPostIds.has(postId);
  const isFollowing = (username: string) => followingUsernames.has(username);

  const contextValue = useMemo(() => ({ 
    currentUser, posts, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings: {}, callState, stories, campaigns: [], mutedUserNames, connections, clusters, auditLogs, disputes: [], staff, adStats: { revenue: 0, handshakes: 0 }, intelligenceMetrics: { sentimentScore: 75, sentimentVibe: 'POSITIVE', sentimentSummary: "System optimal.", botRisk: 5, latency: 45 }, withdrawalHistory, paymentRequests, referralLink: "", pendingTransaction,
    login, signup, uploadMedia, setSearchOpen: (open: boolean) => { triggerHaptic(5); setIsSearchOpen(open); }, setSelectedChatId: (id: string | null) => setSelectedChatId(id), setSelectedPostId: (id: string | null) => setSelectedPostId(id), setSelectedImageUrl: (url: string | null) => setSelectedImageUrl(url), openCommentHub: (id: string) => { triggerHaptic(5); setActiveCommentPostId(id); }, closeCommentHub: () => { triggerHaptic(5); setActiveCommentPostId(null); }, openGiftHub: (u: User) => { setTargetUserForGift(u); setIsGiftHubOpen(true); }, closeGiftHub: () => { setTargetUserForGift(null); setIsGiftHubOpen(false); }, setActiveStoryIndex: (idx: number | null) => setActiveStoryIndex(idx), addPost, deletePost, addStory, addComment, addReply: () => {}, incrementShareCount: () => {}, voteOnStoryPoll, toggleMuteUser: (uname: string) => setMutedUserNames(prev => [...prev, uname]), togglePinPost: () => {}, archivePost: () => {}, updateCurrentUser, updateSettings, updateGatewaySettings: () => {}, addAuditLog, toggleLikePost, toggleUnlikePost: () => {}, toggleSavePost: () => {}, toggleFollowUser, initiateTransaction: (d: any) => setPendingTransaction(d), cancelTransaction: () => setPendingTransaction(null), createPaymentRequest: (s: string) => Promise.resolve(), approvePaymentRequest, rejectPaymentRequest, recordWithdrawal, processWithdrawal, triggerReferralPulse: () => {}, verifyUser, processGiftTransaction, unlockPost: (id: string) => setUnlockedPostIds(prev => new Set(prev).add(id)), subscribeToCreator: () => {}, cancelSubscription: (u: string) => {}, recordAdMaterialization: () => {}, recordAdHandshake: () => {}, updateIntelligence: (data: any) => {}, isPostLiked, isPostUnliked, isPostSaved, isPostUnlocked, isFollowing, isSubscribed: () => false, triggerHaptic, createCluster: (n: string, m: any[]) => Promise.resolve(), addMemberToCluster: (c: string, m: any) => Promise.resolve(), leaveCluster: (c: string) => Promise.resolve(), resolveDispute: () => {}, addCampaign: () => {}, deleteCampaign: () => {}, toggleCampaignStatus: () => {}, recordCampaignClick: () => {}, boostNode, promoteUser, demoteUser, initiateCall, receiveCall, acceptCall, endCall, refreshAdminData, fetchProfileByUsername
  }), [currentUser, posts, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, callState, stories, auditLogs, withdrawalHistory, paymentRequests, pendingTransaction, triggerHaptic, approvePaymentRequest, rejectPaymentRequest, recordWithdrawal, processWithdrawal, promoteUser, demoteUser, verifyUser, processGiftTransaction, boostNode, refreshAdminData, receiveCall, endCall, fetchProfileByUsername, updateCurrentUser, mutedUserNames]);

  return (
    <PostContext.Provider value={contextValue}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) throw new Error('usePosts must be used within a PostProvider');
  return context;
}
