
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback, useRef } from 'react';
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
  Query,
  storage
} from '@/lib/appwrite';
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
}

export interface PostComment {
  id: string;
  user: User;
  text: string;
  time: string;
  likes: number;
  replies: PostComment[];
  parentId?: string;
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
  toggleUnlikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  toggleFollowUser: (username: string) => Promise<void>;
  updateCurrentUser: (data: Partial<User>) => Promise<void>;
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
  isSubscribed: (username: string) => boolean;
  addComment: (postId: string, text: string) => Promise<void>;
  addReply: (postId: string, commentId: string, text: string) => Promise<void>;
  addStory: (segment: any) => Promise<void>;
  voteOnStoryPoll: (storyId: string, segmentId: string, optionIndex: number) => Promise<void>;
  toggleMuteUser: (username: string) => void;
  togglePinPost: (postId: string) => Promise<void>;
  archivePost: (postId: string) => Promise<void>;
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
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [gatewaySettings, setGatewaySettings] = useState({ orangeName: "MTL Official", orangeNumber: "+231778451835", mtnName: "MTL Official", mtnNumber: "+231881234567" });
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [mutedUserNames, setMutedUserNames] = useState<string[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<Set<string>>(new Set());
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [adStats, setAdStats] = useState({ revenue: 0, handshakes: 0 });
  const [intelligenceMetrics, setIntelligenceMetrics] = useState({ sentimentScore: 75, sentimentVibe: 'POSITIVE', sentimentSummary: "System optimal.", botRisk: 5, latency: 45 });
  
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
    } catch (e: any) { console.error("Audit log failed:", e.message); }
  }, [currentUser.username]);

  const refreshStories = useCallback(async () => {
    try {
      const now = Date.now();
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, [Query.greaterThan('expiresAt', now)]);
      setStories(response.documents.map(doc => ({
        id: doc.$id,
        user: typeof doc.user === 'string' ? JSON.parse(doc.user) : doc.user,
        segments: typeof doc.segments === 'string' ? JSON.parse(doc.segments) : doc.segments,
        isCloseFriends: doc.isCloseFriends,
        viewCount: doc.viewCount || 0
      })));
    } catch (e) {}
  }, []);

  const refreshFeed = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(50)]);
      setPosts(response.documents.map(doc => ({
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
        unlockPrice: doc.unlockPrice,
        isBoosted: doc.isBoosted,
        boostTargetViews: doc.boostTargetViews,
        boostCurrentViews: doc.boostCurrentViews
      })) as Post[]);
    } catch (error) {}
  }, []);

  const refreshSocialGraph = useCallback(async (userId: string) => {
    try {
      const followResponse = await databases.listDocuments(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, [Query.equal('followerId', userId)]);
      setFollowingUsernames(new Set(followResponse.documents.map(d => d.followingUsername)));
    } catch (e) {}
  }, []);

  const refreshProfiles = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(100)]);
      setConnections(response.documents.map(doc => ({ ...doc, id: doc.$id, isGroup: false } as any)));
    } catch (e) {}
  }, []);

  const refreshClusters = useCallback(async () => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID);
      setClusters(response.documents.map(doc => ({
        id: doc.$id,
        name: doc.name,
        adminUsername: doc.adminUsername,
        avatar: doc.avatar,
        members: JSON.parse(doc.members || '[]'),
        isGroup: true
      })));
    } catch (e) {}
  }, []);

  const refreshEconomy = useCallback(async (userId: string) => {
    try {
      const [withdraws, payments] = await Promise.all([
        databases.listDocuments(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, [Query.equal('userId', userId)]),
        databases.listDocuments(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, [Query.equal('userId', userId)])
      ]);
      setWithdrawalHistory(withdraws.documents);
      setPaymentRequests(payments.documents);
    } catch (e) {}
  }, []);

  const fetchProfileByUsername = useCallback(async (username: string): Promise<User | null> => {
    try {
      const response = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', username)]);
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
      setWithdrawalHistory(withdraws.documents);
      setPaymentRequests(payments.documents);
      setStaff(profiles.documents.filter(p => p.role && p.role !== 'USER'));
      setConnections(profiles.documents.map(p => ({ ...p, id: p.$id, isGroup: false } as any)));
      setAuditLogs(logs.documents);
    } catch (e) {}
  }, [currentUser.role]);

  const checkSession = useCallback(async () => {
    try {
      const user = await account.get();
      let profile;
      try { profile = await databases.getDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, user.$id); }
      catch (e) { 
        profile = { name: user.name, username: user.email.split('@')[0], avatar: INITIAL_USER.avatar, role: 'USER' };
      }
      
      setCurrentUser({ 
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
        isEmailVerified: user.emailVerification
      });
      
      await Promise.all([
        refreshFeed(), 
        refreshStories(), 
        refreshSocialGraph(user.$id), 
        refreshProfiles(), 
        refreshClusters(), 
        refreshEconomy(user.$id)
      ]);
      
      if (profile.role && profile.role !== 'USER') await refreshAdminData();
    } catch (error) {
      console.warn("Session pulse silent.");
      setCurrentUser(INITIAL_USER);
    }
    finally { setIsLoading(false); }
  }, [refreshFeed, refreshStories, refreshSocialGraph, refreshProfiles, refreshClusters, refreshEconomy, refreshAdminData]);

  useEffect(() => { 
    checkSession();
    const savedSettings = localStorage.getItem('vimore_settings');
    if (savedSettings) {
      try {
        setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      } catch (e) {}
    }
  }, [checkSession]);

  const login = async (email: string, password: string) => { 
    try {
      await account.createEmailPasswordSession(email, password); 
      await checkSession(); 
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  const logout = async () => {
    triggerHaptic(50);
    try {
      await account.deleteSession('current');
      localStorage.clear();
      sessionStorage.clear();
      setCurrentUser(INITIAL_USER);
      window.location.href = "/";
    } catch (e) {
      console.error("Logout failed:", e);
    }
  };
  
  const signup = async (data: { email: string, password: string, name: string, username: string, dob: string, nationality: string, gender: 'Male' | 'Female' }) => {
    try {
      const existing = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [
        Query.equal('username', data.username)
      ]);
      
      if (existing.total > 0) {
        throw new Error("This spatial ID (username) is already taken.");
      }

      const profilesCount = await databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(1)]);
      const assignedRole = profilesCount.total === 0 ? 'SUPER' : 'USER';

      const user = await account.create(ID.unique(), data.email, data.password, data.name);
      await account.createEmailPasswordSession(data.email, data.password);
      
      try {
        await databases.createDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, user.$id, { 
          name: data.name, 
          username: data.username, 
          avatar: INITIAL_USER.avatar, 
          goldBalance: 0, 
          diamondBalance: 0, 
          starBalance: 0, 
          role: assignedRole,
          dateOfBirth: data.dob,
          nationality: data.nationality,
          gender: data.gender,
          referralCount: 0,
          isEmailVerified: false 
        });
      } catch (profileError: any) {
        throw new Error(profileError.message);
      }

      await account.createVerification(`${window.location.origin}/auth/verify`);
      await checkSession();
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const resendVerification = async () => {
    try {
      await account.createVerification(`${window.location.origin}/auth/verify`);
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await account.createRecovery(email, `${window.location.origin}/auth/recovery`);
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  const resetPassword = async (userId: string, secret: string, password: string) => {
    try {
      await account.updateRecovery(userId, secret, password, password);
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  const uploadMedia = async (file: File): Promise<string> => {
    try {
      const response = await storage.createFile(APPWRITE_BUCKET_ID, ID.unique(), file);
      return `${client.client.config.endpoint}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${response.$id}/view?project=${client.client.config.project}`;
    } catch (e: any) {
      throw new Error(e.message);
    }
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
        likes: 0, unlikes: 0, comments: 0, shares: 0 
      };
      await databases.createDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, ID.unique(), docData);
      await refreshFeed();
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  const deletePost = async (postId: string) => { 
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId); 
      await refreshFeed(); 
    } catch (e: any) {
      throw new Error(e.message);
    }
  };
  
  const toggleLikePost = async (postId: string) => {
    const isCurrentlyLiked = likedPostIds.has(postId);
    const user = await account.get();
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      if (isCurrentlyLiked) {
        const response = await databases.listDocuments(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, [Query.equal('postId', postId), Query.equal('userId', user.$id)]);
        if (response.documents.length > 0) await databases.deleteDocument(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, response.documents[0].$id);
        await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { likes: Math.max(0, post.likes - 1) });
        setLikedPostIds(prev => { const n = new Set(prev); n.delete(postId); return n; });
      } else {
        await databases.createDocument(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, ID.unique(), { postId, userId: user.$id });
        await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { likes: post.likes + 1 });
        setLikedPostIds(prev => { const n = new Set(prev); n.add(postId); return n; });
      }
      await refreshFeed();
    } catch (e) {}
  };

  const createPaymentRequest = async (screenshot: string) => {
    if (!currentUser.id) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, ID.unique(), {
        userId: currentUser.id,
        username: currentUser.username,
        packageName: pendingTransaction?.packageName || "Unknown",
        amount: parseFloat(pendingTransaction?.amount || "0"),
        currency: pendingTransaction?.type || "Gold",
        screenshot,
        status: 'PENDING',
        timestamp: Date.now()
      });
      await refreshEconomy(currentUser.id);
    } catch (e: any) { throw new Error(e.message); }
  };

  const approvePaymentRequest = async (id: string) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, id, { status: 'APPROVED' });
      const request = paymentRequests.find(p => p.$id === id);
      if (request) {
        const field = request.currency.toLowerCase() === 'gold' ? 'goldBalance' : 'diamondBalance';
        const currentBalance = (currentUser as any)[field] || 0;
        await updateCurrentUser({ [field]: currentBalance + request.amount });
        await addAuditLog("PAYMENT_AUTHORIZED", `Payment node ${id} approved. +${request.amount} ${request.currency} synced to @${request.username}.`);
      }
      await refreshAdminData();
    } catch (e: any) { throw new Error(e.message); }
  };

  const rejectPaymentRequest = async (id: string) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, id, { status: 'REJECTED' });
      await addAuditLog("PAYMENT_REJECTED", `Payment node ${id} was rejected during audit.`);
      await refreshAdminData();
    } catch (e: any) { throw new Error(e.message); }
  };

  const recordWithdrawal = async (node: any) => {
    if (!currentUser.id) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, ID.unique(), {
        ...node,
        userId: currentUser.id
      });
      await refreshEconomy(currentUser.id);
    } catch (e: any) { throw new Error(e.message); }
  };

  const processWithdrawal = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, id, { status });
      await addAuditLog("WITHDRAWAL_PROCESSED", `Withdrawal node ${id} set to ${status}.`);
      await refreshAdminData();
    } catch (e: any) { throw new Error(e.message); }
  };

  const receiveCall = useCallback((contact: any, type: CallType, channelName: string, token: string, callId: string) => {
    setCallState({ type, status: 'incoming', contact, channelName, token, callId });
    activeCallIdRef.current = callId;
  }, []);

  const initiateCall = async (contact: any, type: CallType) => {
    try {
      const channelName = `vimore_${currentUser.id}_${contact.id || contact.username}`;
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
    } catch (e: any) { throw new Error(e.message); }
  };

  const acceptCall = async () => {
    if (activeCallIdRef.current) {
      await databases.updateDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, activeCallIdRef.current, { status: 'active' });
      setCallState(prev => ({ ...prev, status: 'active', startTime: Date.now() }));
    }
  };

  const endCall = async (duration?: string) => {
    const callId = activeCallIdRef.current;
    if (callId) {
      try {
        await databases.updateDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, callId, { status: 'ended' });
        await addAuditLog("SPATIAL_HANDSHAKE_ENDED", `Call with ${callState.contact?.name || 'Unknown'} ended. Duration: ${duration || 'N/A'}.`);
      } catch (e) {}
    }
    activeCallIdRef.current = null;
    setCallState({ type: 'audio', status: 'idle', contact: null });
  };

  useEffect(() => {
    if (!currentUser.id) return;
    const unsubscribe = client.subscribe(
      `databases.${APPWRITE_DATABASE_ID}.collections.${CALLS_COLLECTION_ID}.documents`,
      (response) => {
        const payload = response.payload as any;
        if (payload.calleeId === currentUser.id && payload.status === 'ringing') {
          const caller = typeof payload.caller === 'string' ? JSON.parse(payload.caller) : payload.caller;
          receiveCall(caller, payload.type, payload.channelName, payload.token, payload.$id);
        }
        if (payload.status === 'ended' && payload.$id === activeCallIdRef.current) {
          setCallState({ type: 'audio', status: 'idle', contact: null });
          activeCallIdRef.current = null;
        }
      }
    );
    return () => unsubscribe();
  }, [currentUser.id, receiveCall]);

  const boostNode = async (nodeId: string, targetViews: number, durationDays: number, cost: number, currency: 'DIAMOND' | 'STAR') => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, nodeId, {
        isBoosted: true,
        boostTargetViews: targetViews,
        boostCurrentViews: 0
      });
      const field = currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance';
      const newBalance = (currentUser as any)[field] - cost;
      await updateCurrentUser({ [field]: newBalance });
      await addAuditLog("NODE_BOOSTED", `Content node ${nodeId} promoted for ${durationDays} days. Cost: ${cost} ${currency}.`);
      await refreshFeed();
    } catch (e: any) { throw new Error(e.message); }
  };

  const updateCurrentUser = async (data: Partial<User>) => {
    if (currentUser.id) {
      try {
        await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, data);
        setCurrentUser(prev => ({ ...prev, ...data }));
      } catch (e: any) { throw new Error(e.message); }
    }
  };

  const updateSettings = (data: Partial<AppSettings>) => { 
    triggerHaptic(10); 
    setSettings(prev => {
      const next = { ...prev, ...data };
      if (typeof window !== 'undefined') {
        localStorage.setItem('vimore_settings', JSON.stringify(next));
      }
      return next;
    }); 
  };

  const toggleFollowUser = async (username: string) => {
    const isCurrentlyFollowing = followingUsernames.has(username);
    const userId = currentUser.id;
    if (!userId) return;

    try {
      if (isCurrentlyFollowing) {
        const response = await databases.listDocuments(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, [
          Query.equal('followerId', userId),
          Query.equal('followingUsername', username)
        ]);
        if (response.documents.length > 0) await databases.deleteDocument(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, response.documents[0].$id);
        setFollowingUsernames(prev => { const n = new Set(prev); n.delete(username); return n; });
      } else {
        await databases.createDocument(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, ID.unique(), {
          followerId: userId,
          followingUsername: username
        });
        setFollowingUsernames(prev => { const n = new Set(prev); n.add(username); return n; });
      }
    } catch (e) {}
  };

  const addStory = async (newStoryData: any) => {
    if (!currentUser.id) return;
    try {
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000); 
      await databases.createDocument(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, ID.unique(), {
        user: JSON.stringify(currentUser),
        userId: currentUser.id,
        segments: JSON.stringify([{
          id: `seg-${Date.now()}`,
          image: newStoryData.image,
          type: newStoryData.type,
          filter: newStoryData.filter,
          background: newStoryData.background,
          textOverlays: newStoryData.textOverlays || []
        }]),
        isCloseFriends: newStoryData.isCloseFriends || false,
        expiresAt,
        viewCount: 0
      });
      await refreshStories();
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  const createCluster = async (name: string, members: any[]) => {
    if (!currentUser.id) return;
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, ID.unique(), {
        name,
        adminUsername: currentUser.username,
        members: JSON.stringify([currentUser, ...members]),
        timestamp: Date.now()
      });
      await refreshClusters();
    } catch (e: any) { throw new Error(e.message); }
  };

  const addMemberToCluster = async (clusterId: string, member: any) => {
    const cluster = clusters.find(c => c.id === clusterId);
    if (!cluster) return;
    try {
      const updatedMembers = [...cluster.members, member];
      await databases.updateDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, clusterId, {
        members: JSON.stringify(updatedMembers)
      });
      await refreshClusters();
    } catch (e: any) { throw new Error(e.message); }
  };

  const leaveCluster = async (clusterId: string) => {
    const cluster = clusters.find(c => c.id === clusterId);
    if (!cluster) return;
    try {
      if (cluster.adminUsername === currentUser.username) {
        await databases.deleteDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, clusterId);
      } else {
        const updatedMembers = cluster.members.filter(m => m.username !== currentUser.username);
        await databases.updateDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, clusterId, {
          members: JSON.stringify(updatedMembers)
        });
      }
      await refreshClusters();
    } catch (e: any) { throw new Error(e.message); }
  };

  const togglePinPost = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, {
        isPinned: !post.isPinned
      });
      await refreshFeed();
    } catch (e: any) { throw new Error(e.message); }
  };

  const archivePost = async (postId: string) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, {
        isArchived: true
      });
      await refreshFeed();
    } catch (e: any) { throw new Error(e.message); }
  };

  const incrementShareCount = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, {
        shares: (post.shares || 0) + 1
      });
      await refreshFeed();
    } catch (e: any) { throw new Error(e.message); }
  };

  const subscribeToCreator = async (username: string, cost: number) => {
    if (!currentUser.id) return;
    try {
      const newDiamondBalance = (currentUser.diamondBalance || 0) - cost;
      await updateCurrentUser({ diamondBalance: newDiamondBalance });
      setActiveSubscriptions(prev => new Set(prev).add(username));
      await addAuditLog("PREMIUM_SUBSCRIPTION", `Subscribed to @${username} for ${cost} Diamonds.`);
    } catch (e: any) { throw new Error(e.message); }
  };

  const cancelSubscription = async (username: string) => {
    try {
      setActiveSubscriptions(prev => {
        const next = new Set(prev);
        next.delete(username);
        return next;
      });
      await addAuditLog("SUBSCRIPTION_CANCELLED", `Severed premium link with @${username}.`);
    } catch (e: any) { throw new Error(e.message); }
  };

  const unlockPost = async (postId: string, cost: number) => {
    if (!currentUser.id) return;
    try {
      const newGoldBalance = (currentUser.goldBalance || 0) - cost;
      await updateCurrentUser({ goldBalance: newGoldBalance });
      setUnlockedPostIds(prev => new Set(prev).add(postId));
      await addAuditLog("POST_UNLOCKED", `Unlocked post ${postId} for ${cost} Gold.`);
    } catch (e: any) { throw new Error(e.message); }
  };

  const processGiftTransaction = async (cost: number, currency: 'GOLD' | 'DIAMOND') => {
    try {
      const field = currency === 'GOLD' ? 'goldBalance' : 'diamondBalance';
      const newBalance = (currentUser as any)[field] - cost;
      await updateCurrentUser({ [field]: newBalance });
      await addAuditLog("GIFT_SENT", `Sent ${cost} ${currency} gift pulse.`);
    } catch (e: any) { throw new Error(e.message); }
  };

  const promoteUser = async (username: string, role: 'FINANCIAL' | 'MODERATOR') => {
    const userProfile = connections.find(c => c.username === username);
    if (userProfile && userProfile.$id) {
      try {
        await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userProfile.$id, { role });
        await addAuditLog("NODE_PROMOTED", `Identity @${username} granted ${role} authority.`);
        await refreshAdminData();
      } catch (e: any) { throw new Error(e.message); }
    }
  };

  const demoteUser = async (username: string) => {
    const userProfile = connections.find(c => c.username === username);
    if (userProfile && userProfile.$id) {
      try {
        await databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userProfile.$id, { role: 'USER' });
        await addAuditLog("NODE_DEMOTED", `Identity @${username} authority revoked.`);
        await refreshAdminData();
      } catch (e: any) { throw new Error(e.message); }
    }
  };

  const contextValue = useMemo(() => ({ 
    currentUser, posts, connections, clusters, staff, auditLogs, campaigns, adStats, intelligenceMetrics, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings, callState, stories, withdrawalHistory, paymentRequests, referralLink: "vimore.app/join/" + currentUser.username, pendingTransaction, activeSubscriptions,
    login, signup, logout, resendVerification, checkSession, forgotPassword, resetPassword, uploadMedia, setSearchOpen: (open: boolean) => { triggerHaptic(5); setIsSearchOpen(open); }, setSelectedChatId: (id: string | null) => setSelectedChatId(id), setSelectedPostId: (id: string | null) => setSelectedPostId(id), setSelectedImageUrl: (url: string | null) => setSelectedImageUrl(url), openCommentHub: (id: string) => { triggerHaptic(5); setActiveCommentPostId(id); }, closeCommentHub: () => { triggerHaptic(5); setActiveCommentPostId(null); }, openGiftHub: (u: User) => { setTargetUserForGift(u); setIsGiftHubOpen(true); }, closeGiftHub: () => { setTargetUserForGift(null); setIsGiftHubOpen(false); }, setActiveStoryIndex: (idx: number | null) => setActiveStoryIndex(idx), addPost, deletePost, addStory, addComment: async (postId: string, text: string) => { await databases.createDocument(APPWRITE_DATABASE_ID, COMMENTS_COLLECTION_ID, ID.unique(), { postId, userId: currentUser.id, text, timestamp: Date.now() }); await refreshFeed(); }, addReply: async (postId: string, commentId: string, text: string) => { await databases.createDocument(APPWRITE_DATABASE_ID, COMMENTS_COLLECTION_ID, ID.unique(), { postId, userId: currentUser.id, text, parentId: commentId, timestamp: Date.now() }); await refreshFeed(); }, voteOnStoryPoll: async () => {}, toggleMuteUser: (u: string) => setMutedUserNames(prev => [...prev, u]), togglePinPost, archivePost, updateGatewaySettings: (data: any) => setGatewaySettings(data), addAuditLog, toggleLikePost, toggleUnlikePost: (id: string) => setUnlikedPostIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }), toggleSavePost: (id: string) => setSavedPostIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }), toggleFollowUser, updateSettings, initiateTransaction: (d: any) => setPendingTransaction(d), cancelTransaction: () => setPendingTransaction(null), createPaymentRequest, approvePaymentRequest, rejectPaymentRequest, recordWithdrawal, processWithdrawal, triggerReferralPulse: () => {}, verifyUser: (cost: number, currency: any) => updateCurrentUser({ [(currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance')]: Math.max(0, (currentUser as any)[(currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance')] - cost), isVerified: true, hasEverBeenVerified: true }), processGiftTransaction, unlockPost, subscribeToCreator, cancelSubscription, recordAdMaterialization: () => {}, recordAdHandshake: () => {}, updateIntelligence: (data: any) => setIntelligenceMetrics(prev => ({ ...prev, ...data })), isPostLiked: (id: string) => likedPostIds.has(id), isPostUnliked: (id: string) => unlikedPostIds.has(id), isPostSaved: (id: string) => savedPostIds.has(id), isPostUnlocked: (id: string) => unlockedPostIds.has(id), isFollowing: (u: string) => followingUsernames.has(u), isSubscribed: (u: string) => activeSubscriptions.has(u), triggerHaptic, createCluster, addMemberToCluster, leaveCluster, promoteUser, demoteUser, initiateCall, receiveCall, acceptCall, endCall, refreshAdminData, fetchProfileByUsername, incrementShareCount, addCampaign: () => {}, deleteCampaign: () => {}, toggleCampaignStatus: () => {}, recordCampaignClick: () => {}, boostNode
  }), [currentUser, posts, connections, clusters, staff, auditLogs, campaigns, adStats, intelligenceMetrics, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings, callState, stories, withdrawalHistory, paymentRequests, pendingTransaction, triggerHaptic, approvePaymentRequest, rejectPaymentRequest, recordWithdrawal, processWithdrawal, promoteUser, demoteUser, refreshAdminData, receiveCall, endCall, fetchProfileByUsername, updateCurrentUser, mutedUserNames, activeSubscriptions, incrementShareCount]);

  return <PostContext.Provider value={contextValue}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) throw new Error('usePosts must be used within a PostProvider');
  return context;
}
