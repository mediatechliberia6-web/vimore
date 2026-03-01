
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback, useRef } from 'react';
import client, { 
  account, 
  ID, 
  Databases,
  Storage,
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
  SONGS_COLLECTION_ID,
  ALBUMS_COLLECTION_ID,
  PLAYLISTS_COLLECTION_ID,
  VERIFICATION_NODES_COLLECTION_ID,
  Query
} from '@/lib/appwrite';
import { generateAgoraToken } from '@/app/actions/call';
import { aiGenerateVerificationCode } from '@/app/actions/ai';

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
  login: (email: string, pass: string) => Promise<void>;
  signup: (data: { email: string, pass: string, name: string, username: string, dob: string, nationality: string, gender: 'Male' | 'Female' }) => Promise<void>;
  verifyCode: (code: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (userId: string, secret: string, pass: string) => Promise<void>;
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
  isSubscribed: (username: string) => boolean;
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
  const [gatewaySettings, setGatewaySettings] = useState({ orangeName: "MTL Official", orangeNumber: "+231778451835", mtnName: "MTL Official", mtnNumber: "+231881234567" });
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [mutedUserNames, setMutedUserNames] = useState<string[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<Set<string>>(new Set());
  
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
      await client.databases.createDocument(APPWRITE_DATABASE_ID, AUDIT_LOGS_COLLECTION_ID, ID.unique(), {
        admin: currentUser.username,
        action,
        details,
        timestamp: Date.now()
      });
    } catch (e) { console.error("Audit log failed:", e); }
  }, [currentUser.username]);

  const refreshStories = useCallback(async () => {
    try {
      const now = Date.now();
      const response = await client.databases.listDocuments(APPWRITE_DATABASE_ID, STORIES_COLLECTION_ID, [Query.greaterThan('expiresAt', now)]);
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
      const response = await client.databases.listDocuments(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(50)]);
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
        unlockPrice: doc.unlockPrice
      })) as Post[]);
    } catch (error) {}
  }, []);

  const refreshSocialGraph = useCallback(async (userId: string) => {
    try {
      const followResponse = await client.databases.listDocuments(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, [Query.equal('followerId', userId)]);
      setFollowingUsernames(new Set(followResponse.documents.map(d => d.followingUsername)));
    } catch (e) {}
  }, []);

  const refreshProfiles = useCallback(async () => {
    try {
      const response = await client.databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(100)]);
      setConnections(response.documents.map(doc => ({ ...doc, isGroup: false } as any)));
    } catch (e) {}
  }, []);

  const refreshClusters = useCallback(async () => {
    try {
      const response = await client.databases.listDocuments(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID);
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
        client.databases.listDocuments(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, [Query.equal('userId', userId)]),
        client.databases.listDocuments(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, [Query.equal('userId', userId)])
      ]);
      setWithdrawalHistory(withdraws.documents);
      setPaymentRequests(payments.documents);
    } catch (e) {}
  }, []);

  const fetchProfileByUsername = useCallback(async (username: string): Promise<User | null> => {
    try {
      const response = await client.databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.equal('username', username)]);
      if (response.documents.length === 0) return null;
      const profile = response.documents[0];
      return { id: profile.$id, name: profile.name, username: profile.username, avatar: profile.avatar, isVerified: profile.isVerified, followers: profile.followers, following: profile.following, posts: profile.posts, bio: profile.bio, category: profile.category, role: profile.role, goldBalance: profile.goldBalance, diamondBalance: profile.diamondBalance, starBalance: profile.starBalance, referralCount: profile.referralCount, hasEverBeenVerified: profile.hasEverBeenVerified, dateOfBirth: profile.dateOfBirth, nationality: profile.nationality, gender: profile.gender } as User;
    } catch (e) { return null; }
  }, []);

  const refreshAdminData = useCallback(async () => {
    if (!currentUser.role || currentUser.role === 'USER') return;
    try {
      const [withdraws, payments, profiles, logs] = await Promise.all([
        client.databases.listDocuments(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(100)]),
        client.databases.listDocuments(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(100)]),
        client.databases.listDocuments(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, [Query.limit(100)]),
        client.databases.listDocuments(APPWRITE_DATABASE_ID, AUDIT_LOGS_COLLECTION_ID, [Query.orderDesc('$createdAt'), Query.limit(100)])
      ]);
      setWithdrawalHistory(withdraws.documents);
      setPaymentRequests(payments.documents);
      setStaff(profiles.documents.filter(p => p.role && p.role !== 'USER'));
      setConnections(profiles.documents.map(p => ({ ...p, isGroup: false } as any)));
      setAuditLogs(logs.documents);
    } catch (e) {}
  }, [currentUser.role]);

  const receiveCall = useCallback((contact: any, type: CallType, channelName: string, token: string, callId: string) => {
    activeCallIdRef.current = callId;
    setCallState({ type, status: 'incoming', contact, channelName, token, callId });
  }, []);

  const endCall = useCallback(async (duration?: string) => {
    const callId = activeCallIdRef.current;
    if (callId) {
      try {
        await client.databases.updateDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, callId, { status: 'ended' });
        await addAuditLog("SPATIAL_HANDSHAKE_ENDED", `Call with ${callState.contact?.name || 'Unknown'} ended. Duration: ${duration || 'N/A'}.`);
      } catch (e) {}
    }
    activeCallIdRef.current = null;
    setCallState({ type: 'audio', status: 'idle', contact: null });
  }, [callState.contact, addAuditLog]);

  const checkSession = useCallback(async () => {
    try {
      const user = await client.account.get();
      let profile;
      try { profile = await client.databases.getDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, user.$id); }
      catch (e) { profile = await client.databases.createDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, user.$id, { userId: user.$id, name: user.name, username: user.email.split('@')[0], avatar: INITIAL_USER.avatar, goldBalance: 0, diamondBalance: 0, starBalance: 0, role: 'USER' }); }
      
      setCurrentUser({ id: user.$id, name: profile.name, username: profile.username, avatar: profile.avatar, isOnline: true, isVerified: profile.isVerified || false, role: profile.role || 'USER', goldBalance: profile.goldBalance || 0, diamondBalance: profile.diamondBalance || 0, starBalance: profile.starBalance || 0, referralCount: profile.referralCount || 0, hasEverBeenVerified: profile.hasEverBeenVerified || false, dateOfBirth: profile.dateOfBirth, nationality: profile.nationality, gender: profile.gender, isEmailVerified: profile.isEmailVerified });
      
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
      console.warn("Session pulse silent. User is likely off-grid.");
    }
    finally { setIsLoading(false); }
  }, [refreshFeed, refreshStories, refreshSocialGraph, refreshProfiles, refreshClusters, refreshEconomy, refreshAdminData]);

  useEffect(() => { checkSession(); }, [checkSession]);

  const login = async (email: string, pass: string) => { await client.account.createEmailPasswordSession(email, pass); await checkSession(); };
  
  const signup = async (data: { email: string, pass: string, name: string, username: string, dob: string, nationality: string, gender: 'Male' | 'Female' }) => {
    const user = await client.account.create(ID.unique(), data.email, data.pass, data.name);
    await client.account.createEmailPasswordSession(data.email, data.pass);
    
    await client.databases.createDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, user.$id, { 
      userId: user.$id, 
      name: data.name, 
      username: data.username, 
      avatar: INITIAL_USER.avatar, 
      goldBalance: 0, 
      diamondBalance: 0, 
      starBalance: 0, 
      role: 'USER',
      dateOfBirth: data.dob,
      nationality: data.nationality,
      gender: data.gender,
      isEmailVerified: false 
    });

    const { code } = await aiGenerateVerificationCode({ packageName: "IDENTITY_VERIFICATION" });
    await client.databases.createDocument(APPWRITE_DATABASE_ID, VERIFICATION_NODES_COLLECTION_ID, ID.unique(), {
      userId: user.$id,
      code,
      expiresAt: Date.now() + (15 * 60 * 1000)
    });

    console.log(`REAL PULSE: Verification code ${code} generated for ${data.email}`);
    await checkSession();
  };

  const verifyCode = async (code: string): Promise<boolean> => {
    if (!currentUser.id) return false;
    try {
      const response = await client.databases.listDocuments(APPWRITE_DATABASE_ID, VERIFICATION_NODES_COLLECTION_ID, [
        Query.equal('userId', currentUser.id),
        Query.equal('code', code.toUpperCase()),
        Query.greaterThan('expiresAt', Date.now())
      ]);

      if (response.documents.length > 0) {
        await client.databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, { isEmailVerified: true });
        await client.databases.deleteDocument(APPWRITE_DATABASE_ID, VERIFICATION_NODES_COLLECTION_ID, response.documents[0].$id);
        setCurrentUser(prev => ({ ...prev, isEmailVerified: true }));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const forgotPassword = async (email: string) => {
    await client.account.createRecovery(email, `${window.location.origin}/auth/recovery`);
  };

  const resetPassword = async (userId: string, secret: string, pass: string) => {
    await client.account.updateRecovery(userId, secret, pass, pass);
  };

  const uploadMedia = async (file: File): Promise<string> => {
    const response = await client.storage.createFile(APPWRITE_BUCKET_ID, ID.unique(), file);
    return `${client.client.config.endpoint}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${response.$id}/view?project=${client.client.config.project}`;
  };

  const addPost = async (newPostData: any) => {
    const docData = { content: newPostData.content, user: JSON.stringify(newPostData.user), image: newPostData.image, images: JSON.stringify(newPostData.images || []), videoUrl: newPostData.videoUrl, theme: newPostData.theme, language: newPostData.language, isLocked: newPostData.isLocked || false, unlockPrice: newPostData.unlockPrice || 0, likes: 0, unlikes: 0, comments: 0, shares: 0 };
    await client.databases.createDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, ID.unique(), docData);
    await refreshFeed();
  };

  const deletePost = async (postId: string) => { await client.databases.deleteDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId); await refreshFeed(); };
  
  const toggleLikePost = async (postId: string) => {
    const isCurrentlyLiked = likedPostIds.has(postId);
    const user = await client.account.get();
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;
      if (isCurrentlyLiked) {
        const response = await client.databases.listDocuments(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, [Query.equal('postId', postId), Query.equal('userId', user.$id)]);
        if (response.documents.length > 0) await client.databases.deleteDocument(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, response.documents[0].$id);
        await client.databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { likes: Math.max(0, post.likes - 1) });
        setLikedPostIds(prev => { const n = new Set(prev); n.delete(postId); return n; });
      } else {
        await client.databases.createDocument(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, ID.unique(), { postId, userId: user.$id });
        await client.databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { likes: post.likes + 1 });
        setLikedPostIds(prev => { const n = new Set(prev); n.add(postId); return n; });
      }
      await refreshFeed();
    } catch (e) {}
  };

  const toggleUnlikePost = (postId: string) => {
    setUnlikedPostIds(prev => { const n = new Set(prev); if(n.has(postId)) n.delete(postId); else n.add(postId); return n; });
  };

  const toggleSavePost = (postId: string) => {
    setSavedPostIds(prev => { const n = new Set(prev); if(n.has(postId)) n.delete(postId); else n.add(postId); return n; });
  };

  const toggleFollowUser = async (username: string) => {
    const isCurrentlyFollowing = followingUsernames.has(username);
    const user = await client.account.get();
    try {
      if (isCurrentlyFollowing) {
        const res = await client.databases.listDocuments(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, [Query.equal('followerId', user.$id), Query.equal('followingUsername', username)]);
        if (res.documents.length > 0) await client.databases.deleteDocument(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, res.documents[0].$id);
      } else { await client.databases.createDocument(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, ID.unique(), { followerId: user.$id, followingUsername: username }); }
      await refreshSocialGraph(user.$id);
    } catch (e) {}
  };

  const addComment = async (postId: string, text: string) => {
    await client.databases.createDocument(APPWRITE_DATABASE_ID, COMMENTS_COLLECTION_ID, ID.unique(), { postId, userId: currentUser.id, userName: currentUser.name, userAvatar: currentUser.avatar, text, likes: 0 });
    const post = posts.find(p => p.id === postId);
    if (post) await client.databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, { comments: (post.comments || 0) + 1 });
    await refreshFeed();
  };

  const processWithdrawal = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await client.databases.updateDocument(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, id, { status });
      const withdrawal = withdrawalHistory.find(w => w.$id === id);
      await addAuditLog("WITHDRAWAL_PROCESSED", `Withdrawal ${id} for @${withdrawal?.username || 'unknown'} was ${status.toLowerCase()}.`);
      if (currentUser.id) await refreshEconomy(currentUser.id);
      await refreshAdminData();
    } catch (e) { console.error("Withdrawal processing failed:", e); }
  };

  const approvePaymentRequest = async (id: string) => {
    const r = paymentRequests.find(p => p.$id === id);
    if (!r) return;
    await client.databases.updateDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, id, { status: 'APPROVED' });
    const profile = await client.databases.getDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, r.userId);
    const updates: any = {};
    if (r.packageName.includes('Gold')) updates.goldBalance = (profile.goldBalance || 0) + r.amount;
    else updates.diamondBalance = (profile.diamondBalance || 0) + r.amount;
    await client.databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, r.userId, updates);
    await addAuditLog("PAYMENT_APPROVED", `Authorized ${r.amount} for @${r.username}`);
    await refreshAdminData();
  };

  const createPaymentRequest = async (screenshot: string) => {
    if (!currentUser.id) return;
    try {
      await client.databases.createDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, ID.unique(), {
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
    } catch (e) { console.error("Payment request failed:", e); }
  };

  const recordWithdrawal = async (node: any) => {
    await client.databases.createDocument(APPWRITE_DATABASE_ID, WITHDRAWALS_COLLECTION_ID, ID.unique(), { userId: currentUser.id, username: node.username, amount: node.amount, currency: node.currency, payoutAmount: node.payoutAmount, payoutCurrency: node.payoutCurrency, method: node.method, status: 'PENDING', accountName: node.accountName, accountNumber: node.accountNumber });
    await refreshEconomy(currentUser.id!);
  };

  const initiateCall = async (contact: any, type: CallType) => {
    const channelName = `vimore_${currentUser.id}_${contact.id || contact.username}`;
    const token = await generateAgoraToken(channelName, 0); 
    const callDoc = await client.databases.createDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, ID.unique(), { caller: JSON.stringify(currentUser), callerId: currentUser.id, calleeId: contact.id || contact.username, channelName, token, type, status: 'ringing' });
    activeCallIdRef.current = callDoc.$id;
    setCallState({ type, status: 'outgoing', contact, channelName, token, callId: callDoc.$id });
  };

  const acceptCall = async () => {
    if (activeCallIdRef.current) {
      await client.databases.updateDocument(APPWRITE_DATABASE_ID, CALLS_COLLECTION_ID, activeCallIdRef.current, { status: 'active' });
      setCallState(prev => ({ ...prev, status: 'active', startTime: Date.now() }));
    }
  };

  const updateCurrentUser = (data: Partial<User>) => {
    if (currentUser.id) client.databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, currentUser.id, data).then(() => setCurrentUser(prev => ({ ...prev, ...data })));
  };

  const promoteUser = async (username: string, role: 'FINANCIAL' | 'MODERATOR') => {
    const userProfile = connections.find(c => c.username === username);
    if (userProfile && userProfile.id) {
      await client.databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userProfile.id, { role });
      await addAuditLog("NODE_PROMOTED", `Identity @${username} granted ${role} authority.`);
      await refreshAdminData();
    }
  };

  const demoteUser = async (username: string) => {
    const userProfile = connections.find(c => c.username === username);
    if (userProfile && userProfile.id) {
      await client.databases.updateDocument(APPWRITE_DATABASE_ID, PROFILES_COLLECTION_ID, userProfile.id, { role: 'USER' });
      await addAuditLog("NODE_DEMOTED", `Identity @${username} authority revoked.`);
      await refreshAdminData();
    }
  };

  const boostNode = (nodeId: string, targetViews: number, durationDays: number, cost: number, currency: 'DIAMOND' | 'STAR') => {
    const balanceKey = currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance';
    const currentBalance = (currentUser as any)[balanceKey] || 0;
    updateCurrentUser({ [balanceKey]: Math.max(0, currentBalance - cost) });
    addAuditLog("NODE_BOOSTED", `Node ${nodeId} amplified for ${durationDays} days.`);
  };

  const contextValue = useMemo(() => ({ 
    currentUser, posts, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings, callState, stories, campaigns: [], mutedUserNames, connections, clusters, auditLogs, staff, adStats: { revenue: 0, handshakes: 0 }, intelligenceMetrics: { sentimentScore: 75, sentimentVibe: 'POSITIVE', sentimentSummary: "System optimal.", botRisk: 5, latency: 45 }, withdrawalHistory, paymentRequests, referralLink: "vimore.app/join/" + currentUser.username, pendingTransaction, activeSubscriptions,
    login, signup, verifyCode, forgotPassword, resetPassword, uploadMedia, setSearchOpen: (open: boolean) => { triggerHaptic(5); setIsSearchOpen(open); }, setSelectedChatId: (id: string | null) => setSelectedChatId(id), setSelectedPostId: (id: string | null) => setSelectedPostId(id), setSelectedImageUrl: (url: string | null) => setSelectedImageUrl(url), openCommentHub: (id: string) => { triggerHaptic(5); setActiveCommentPostId(id); }, closeCommentHub: () => { triggerHaptic(5); setActiveCommentPostId(null); }, openGiftHub: (u: User) => { setTargetUserForGift(u); setIsGiftHubOpen(true); }, closeGiftHub: () => { setTargetUserForGift(null); setIsGiftHubOpen(false); }, setActiveStoryIndex: (idx: number | null) => setActiveStoryIndex(idx), addPost, deletePost, addStory: async () => {}, addComment, addReply: () => {}, voteOnStoryPoll: async () => {}, toggleMuteUser: (u: string) => setMutedUserNames(prev => [...prev, u]), togglePinPost: () => {}, archivePost: () => {}, updateCurrentUser, updateSettings: (s: any) => setSettings(prev => ({ ...prev, ...s })), updateGatewaySettings: () => {}, addAuditLog, toggleLikePost, toggleUnlikePost: () => {}, toggleSavePost: () => {}, toggleFollowUser, initiateTransaction: (d: any) => setPendingTransaction(d), cancelTransaction: () => setPendingTransaction(null), createPaymentRequest, approvePaymentRequest, rejectPaymentRequest: (id: string) => client.databases.updateDocument(APPWRITE_DATABASE_ID, PAYMENTS_COLLECTION_ID, id, { status: 'REJECTED' }).then(() => refreshAdminData()), recordWithdrawal, processWithdrawal, triggerReferralPulse: () => {}, verifyUser: (cost: number, currency: any) => updateCurrentUser({ [(currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance')]: Math.max(0, (currentUser as any)[(currency === 'DIAMOND' ? 'diamondBalance' : 'starBalance')] - cost), isVerified: true, hasEverBeenVerified: true }), processGiftTransaction: (cost: number, currency: any) => updateCurrentUser({ [(currency === 'GOLD' ? 'goldBalance' : 'diamondBalance')]: Math.max(0, (currentUser as any)[(currency === 'GOLD' ? 'goldBalance' : 'diamondBalance')] - cost) }), unlockPost: (id: string) => setUnlockedPostIds(prev => new Set(prev).add(id)), subscribeToCreator: () => {}, cancelSubscription: (u: string) => {}, recordAdMaterialization: () => {}, recordAdHandshake: () => {}, updateIntelligence: (data: any) => {}, isPostLiked: (id: string) => likedPostIds.has(id), isPostUnliked: (id: string) => unlikedPostIds.has(id), isPostSaved: (id: string) => savedPostIds.has(id), isPostUnlocked: (id: string) => unlockedPostIds.has(id), isFollowing: (u: string) => followingUsernames.has(u), isSubscribed: (u: string) => activeSubscriptions.has(u), triggerHaptic, createCluster: (n: string, m: any[]) => client.databases.createDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, ID.unique(), { name: n, adminUsername: currentUser.username, members: JSON.stringify(m) }).then(() => refreshClusters()), addMemberToCluster: (c: string, m: any) => Promise.resolve(), leaveCluster: (c: string) => client.databases.deleteDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, c).then(() => refreshClusters()), promoteUser, demoteUser, initiateCall, receiveCall, acceptCall, endCall, refreshAdminData, fetchProfileByUsername, incrementShareCount: () => {}
  }), [currentUser, posts, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId, settings, gatewaySettings, callState, stories, auditLogs, withdrawalHistory, paymentRequests, pendingTransaction, triggerHaptic, approvePaymentRequest, recordWithdrawal, promoteUser, demoteUser, boostNode, refreshAdminData, receiveCall, endCall, fetchProfileByUsername, updateCurrentUser, mutedUserNames, refreshClusters, activeSubscriptions]);

  return <PostContext.Provider value={contextValue}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) throw new Error('usePosts must be used within a PostProvider');
  return context;
}
