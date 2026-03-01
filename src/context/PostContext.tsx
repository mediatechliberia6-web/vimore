
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { account, ID, databases } from '@/lib/appwrite';
import { Models } from 'appwrite';

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
  // Phase 1
  goldRate: number; // USD per 1 Gold
  diamondRate: number; // USD per 1 Diamond
  ldMultiplier: number; // LD per 1 USD
  isReelsEnabled: boolean;
  isMusicEnabled: boolean;
  isGiftingEnabled: boolean;
  // Phase 3
  isAiVerificationActive: boolean;
  // Phase 5
  isSensitivityFilterActive: boolean;
}

export interface AuditLogNode {
  id: string;
  action: string;
  admin: string;
  timestamp: number;
  details: string;
}

export interface DisputeNode {
  id: string;
  username: string;
  type: 'PAYMENT' | 'WITHDRAWAL';
  reason: string;
  status: 'OPEN' | 'RESOLVED' | 'SEVERED';
  timestamp: number;
  originalTxId: string;
}

export interface Campaign {
  id: string;
  type: 'photo' | 'video' | 'link';
  content: string;
  mediaUrl?: string;
  actionUrl: string;
  actionLabel: string;
  isActive: boolean;
  clicks: number;
  timestamp: number;
}

export interface GatewaySettings {
  orangeName: string;
  orangeNumber: string;
  mtnName: string;
  mtnNumber: string;
}

export interface User {
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
  lastModifiedName?: number; // Timestamp
  lastModifiedDob?: number; // Timestamp
  pronouns?: string;
  joinDate?: string;
  introUrl?: string; 
  language?: string;
  goldBalance?: number;
  diamondBalance?: number;
  starBalance?: number;
  referralCount?: number;
  verificationExpiry?: number; // Timestamp
  hasEverBeenVerified?: boolean;
  role?: 'SUPER' | 'FINANCIAL' | 'MODERATOR' | 'USER';
  links?: Array<{ label: string; url: string; icon: any }>;
  profilePictureHistory?: string[];
  coverPhotoHistory?: string[];
}

export interface PendingTransaction {
  packageId: string;
  packageName: string;
  amount: string;
  currency: 'USD' | 'LD';
  code: string;
  type: 'Gold' | 'Diamond';
  timestamp: number;
}

export interface WithdrawalNode {
  id: string;
  username: string;
  method: string;
  amount: number;
  currency: string;
  payoutAmount: number;
  payoutCurrency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: number;
  accountName: string;
  accountNumber: string;
  riskScore?: number; // 0-100
}

export interface PaymentRequest {
  id: string;
  username: string;
  name: string;
  packageName: string;
  amount: string;
  currency: 'USD' | 'LD';
  type: 'Gold' | 'Diamond';
  code: string;
  screenshot: string;
  status: 'PENDING';
  timestamp: number;
}

export interface Connection {
  name: string;
  username: string;
  avatar: string;
  category: string;
  followsYou: boolean;
  isOnline?: boolean;
  connectionDate?: string;
  mutualFriends?: string[]; 
  followers?: string | number;
  lastInteraction?: number;
}

export interface Cluster {
  id: string;
  name: string;
  avatar?: string;
  adminUsername: string;
  members: Connection[];
  lastMessage?: string;
  lastMessageTime?: string;
  isGroup: true;
  lastInteraction?: number;
}

export interface Mention {
  username: string;
  x: string | number;
  y: string | number;
}

export interface StoryPoll {
  question: string;
  options: { text: string; votes: number }[];
}

export interface StorySegment {
  id: string;
  image: string;
  type: 'image' | 'video';
  background?: string;
  mentions?: Mention[];
  poll?: StoryPoll;
  filter?: string;
  textOverlays?: Array<{
    text: string;
    x: number;
    y: number;
    color: string;
  }>;
}

export interface Story {
  id: string;
  user: User;
  segments: StorySegment[];
  isCloseFriends?: boolean;
  viewCount?: number;
}

export interface Highlight {
  id: string;
  title: string;
  coverImage: string;
  segments: StorySegment[];
}

export interface PostComment {
  id: string;
  user: User;
  text: string;
  time: string;
  likes: number;
  replies: PostComment[];
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
  isSeries?: boolean;
  seriesTitle?: string;
  isLocked?: boolean;
  unlockPrice?: number;
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
    duration?: string;
  };
  commentNodes?: PostComment[];
  sharedPost?: any;
  isCampaign?: boolean;
  actionUrl?: string;
  actionLabel?: string;
  // Boost Metadata
  isBoosted?: boolean;
  boostTargetViews?: number;
  boostCurrentViews?: number;
  boostExpiry?: number;
}

export type CallType = 'video' | 'audio';
export type CallStatus = 'idle' | 'incoming' | 'outgoing' | 'active';

export interface CallState {
  type: CallType;
  status: CallStatus;
  contact: Connection | null;
  startTime?: number;
}

export interface AdStats {
  materializations: number;
  handshakes: number;
  revenue: number;
}

export interface IntelligenceMetrics {
  sentimentScore: number;
  sentimentVibe: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  sentimentSummary: string;
  botRisk: number;
  latency: number;
}

interface PostContextType {
  currentUser: User;
  posts: Post[];
  stories: Story[];
  highlights: Highlight[];
  campaigns: Campaign[];
  mutedUserNames: string[];
  likedPostIds: Set<string>;
  unlikedPostIds: Set<string>;
  savedPostIds: Set<string>;
  unlockedPostIds: Set<string>;
  activeSubscriptions: Set<string>;
  followingUsernames: Set<string>;
  activeStoryIndex: number | null;
  connections: Connection[];
  clusters: Cluster[];
  auditLogs: AuditLogNode[];
  disputes: DisputeNode[];
  staff: Array<{ username: string, role: 'SUPER' | 'FINANCIAL' | 'MODERATOR' }>;
  adStats: AdStats;
  intelligenceMetrics: IntelligenceMetrics;
  selectedChatId: string | null;
  selectedPostId: string | null;
  selectedImageUrl: string | null;
  isSearchOpen: boolean;
  isGiftHubOpen: boolean;
  targetUserForGift: User | null;
  pendingTransaction: PendingTransaction | null;
  withdrawalHistory: WithdrawalNode[];
  paymentRequests: PaymentRequest[];
  referralLink: string;
  settings: AppSettings;
  gatewaySettings: GatewaySettings;
  callState: CallState;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string, username: string) => Promise<void>;
  setSearchOpen: (open: boolean) => void;
  setSelectedChatId: (id: string | null) => void;
  setSelectedPostId: (id: string | null) => void;
  setSelectedImageUrl: (url: string | null) => void;
  openCommentHub: (postId: string) => void;
  closeCommentHub: () => void;
  openGiftHub: (user: User) => void;
  closeGiftHub: () => void;
  setActiveStoryIndex: (index: number | null) => void;
  addPost: (post: Omit<Post, 'id' | 'time' | 'likes' | 'unlikes' | 'comments' | 'shares'>) => void;
  deletePost: (postId: string) => void;
  addStory: (segment: Omit<StorySegment, 'id'>) => void;
  addComment: (postId: string, text: string) => void;
  addReply: (postId: string, commentId: string, text: string) => void;
  voteOnStoryPoll: (storyId: string, segmentId: string, optionIndex: number) => void;
  toggleMuteUser: (username: string) => void;
  togglePinPost: (postId: string) => void;
  archivePost: (postId: string) => void;
  updateCurrentUser: (data: Partial<User>) => void;
  updateSettings: (data: Partial<AppSettings>) => void;
  updateGatewaySettings: (data: Partial<GatewaySettings>) => void;
  addAuditLog: (action: string, details: string) => void;
  toggleLikePost: (postId: string) => void;
  toggleUnlikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  toggleFollowUser: (username: string) => void;
  initiateTransaction: (data: Omit<PendingTransaction, 'timestamp'>) => void;
  cancelTransaction: () => void;
  createPaymentRequest: (screenshot: string) => void;
  approvePaymentRequest: (id: string) => void;
  rejectPaymentRequest: (id: string) => void;
  recordWithdrawal: (node: WithdrawalNode) => void;
  processWithdrawal: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  triggerReferralPulse: (referralCode?: string) => void;
  verifyUser: (cost: number, currency: 'DIAMOND' | 'STAR') => void;
  processGiftTransaction: (cost: number, currency: 'GOLD' | 'DIAMOND') => void;
  unlockPost: (postId: string, cost: number) => void;
  subscribeToCreator: (username: string, cost: number) => void;
  cancelSubscription: (username: string) => void;
  recordAdMaterialization: () => void;
  recordAdHandshake: (revenue: number) => void;
  updateIntelligence: (data: Partial<IntelligenceMetrics>) => void;
  isPostLiked: (postId: string) => boolean;
  isPostUnliked: (postId: string) => boolean;
  isPostSaved: (postId: string) => boolean;
  isPostUnlocked: (postId: string) => boolean;
  isFollowing: (username: string) => boolean;
  isSubscribed: (username: string) => boolean;
  incrementShareCount: (postId: string) => void;
  triggerHaptic: (intensity?: number) => void;
  createCluster: (name: string, members: Connection[]) => void;
  addMemberToCluster: (clusterId: string, member: Connection) => void;
  leaveCluster: (clusterId: string) => void;
  resolveDispute: (id: string, action: 'RESTORE' | 'SEVER') => void;
  promoteUser: (username: string, role: 'FINANCIAL' | 'MODERATOR') => void;
  demoteUser: (username: string) => void;
  
  // Campaigns
  addCampaign: (campaign: Omit<Campaign, 'id' | 'timestamp' | 'clicks'>) => void;
  deleteCampaign: (id: string) => void;
  toggleCampaignStatus: (id: string) => void;
  recordCampaignClick: (id: string) => void;

  // Boost Logic
  boostNode: (nodeId: string, targetViews: number, durationDays: number, cost: number, currency: 'STAR' | 'DIAMOND') => void;

  // Call Handshakes
  initiateCall: (contact: Connection, type: CallType) => void;
  receiveCall: (contact: Connection, type: CallType) => void;
  acceptCall: () => void;
  endCall: () => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const INITIAL_USER: User = {
  name: "Guest Node",
  username: "johndoe_creative",
  avatar: "https://picsum.photos/seed/me/400/400",
  cover: "https://picsum.photos/seed/my_cover/1200/400",
  bio: "Digital creator and explorer of the ViMore network. 🎨 ✨",
  category: "New Member",
  goldBalance: 0,
  diamondBalance: 0,
  starBalance: 0,
  referralCount: 0,
  isOnline: true,
  isVerified: false,
  hasEverBeenVerified: false,
  role: 'USER',
  profilePictureHistory: [],
  coverPhotoHistory: []
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

const INITIAL_GATEWAY_SETTINGS: GatewaySettings = {
  orangeName: "Amos Kortu",
  orangeNumber: "+231778451835",
  mtnName: "Amos Kortu",
  mtnNumber: "+231889322188"
};

const MOCK_CONNECTIONS: Connection[] = [
  { 
    name: "Julianne Moore", 
    username: "jmoore", 
    avatar: "https://picsum.photos/seed/50/200/200", 
    category: "Content Creator", 
    followsYou: true,
    isOnline: true,
    connectionDate: "Feb 2024",
    mutualFriends: ["https://picsum.photos/seed/1/50/50", "https://picsum.photos/seed/2/50/50"],
    followers: "1.5k",
    lastInteraction: Date.now() - 1000 * 60 * 60 * 2 
  },
  { 
    name: "Tech Explorer", 
    username: "techex", 
    avatar: "https://picsum.photos/seed/51/200/200", 
    category: "Fullstack Developer", 
    followsYou: true,
    isOnline: false,
    connectionDate: "Jan 2024",
    mutualFriends: ["https://picsum.photos/seed/3/50/50"],
    followers: "12k",
    lastInteraction: Date.now() - 1000 * 60 * 60 * 24 
  },
  { 
    name: "Alex Rivera", 
    username: "arivera", 
    avatar: "https://picsum.photos/seed/1/100/100", 
    category: "Product Designer", 
    followsYou: false,
    isOnline: true,
    connectionDate: "Mar 2024",
    mutualFriends: ["https://picsum.photos/seed/4/50/50", "https://picsum.photos/seed/5/50/50", "https://picsum.photos/seed/6/50/50"],
    followers: "12.2k",
    lastInteraction: Date.now() - 1000 * 60 * 10 
  },
  { 
    name: "Sarah Chen", 
    username: "schen_dev", 
    avatar: "https://picsum.photos/seed/2/100/100", 
    category: "Software Engineer", 
    followsYou: true,
    isOnline: true,
    connectionDate: "Nov 2023",
    mutualFriends: ["https://picsum.photos/seed/7/50/50"],
    followers: "4.2k",
    lastInteraction: Date.now() - 1000 * 60 * 5 
  },
  { 
    name: "Marcus Stone", 
    username: "mstone", 
    avatar: "https://picsum.photos/seed/3/100/100", 
    category: "Photographer", 
    followsYou: false,
    isOnline: false,
    connectionDate: "Dec 2023",
    mutualFriends: ["https://picsum.photos/seed/8/50/50", "https://picsum.photos/seed/9/50/50"],
    followers: "25.1k",
    lastInteraction: Date.now() - 1000 * 60 * 60 * 5 
  }
];

const initialMockPosts: Post[] = [
  {
    id: "locked-1",
    user: { 
      name: "Marcus Stone", 
      username: "mstone", 
      avatar: "https://picsum.photos/seed/3/100/100",
      isVerified: false,
      followers: 25100
    },
    content: "Exclusive look behind the scenes of my latest project in the desert. 🌵 Locked for my core community.",
    time: "2m",
    likes: 42,
    unlikes: 0,
    comments: 12,
    shares: 5,
    isLocked: true,
    unlockPrice: 50,
    image: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg",
    commentNodes: []
  }
];

export function PostProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [gatewaySettings, setGatewaySettings] = useState<GatewaySettings>(INITIAL_GATEWAY_SETTINGS);
  const [posts, setPosts] = useState<Post[]>(initialMockPosts);
  const [stories, setStories] = useState<Story[]>([]);
  const [highlights] = useState<Highlight[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [mutedUserNames, setMutedUserNames] = useState<string[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [unlikedPostIds, setUnlikedPostIds] = useState<Set<string>>(new Set());
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [unlockedPostIds, setUnlockedPostIds] = useState<Set<string>>(new Set());
  const [activeSubscriptions, setActiveSubscriptions] = useState<Set<string>>(new Set());
  const [pendingTransaction, setPendingTransaction] = useState<PendingTransaction | null>(null);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalNode[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogNode[]>([]);
  const [disputes, setDisputes] = useState<DisputeNode[]>([]);
  const [staff, setStaff] = useState<Array<{ username: string, role: 'SUPER' | 'FINANCIAL' | 'MODERATOR' }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [adStats, setAdStats] = useState<AdStats>({ materializations: 842, handshakes: 124, revenue: 12.40 });
  const [intelligenceMetrics, setIntelligenceMetrics] = useState<IntelligenceMetrics>({
    sentimentScore: 82,
    sentimentVibe: 'POSITIVE',
    sentimentSummary: "Network vibe stable and synchronized.",
    botRisk: 4,
    latency: 142
  });

  const [followingUsernames, setFollowingUsernames] = useState<Set<string>>(new Set());
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [connections, setConnections] = useState<Connection[]>(MOCK_CONNECTIONS);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isGiftHubOpen, setIsGiftHubOpen] = useState(false);
  const [targetUserForGift, setTargetUserForGift] = useState<User | null>(null);

  const [callState, setCallState] = useState<CallState>({
    type: 'video',
    status: 'idle',
    contact: null
  });

  const referralLink = useMemo(() => {
    return `http://vimore.appwrite.network/join?ref=${currentUser.username}`;
  }, [currentUser.username]);

  const triggerHaptic = useCallback((intensity?: number) => {
    const finalIntensity = intensity ?? (settings.hapticIntensity / 2);
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(finalIntensity);
    }
  }, [settings.hapticIntensity]);

  const addAuditLog = useCallback((action: string, details: string) => {
    const newNode: AuditLogNode = {
      id: `LOG-${Date.now()}`,
      action,
      admin: currentUser.username || "PLATFORM_CORE",
      timestamp: Date.now(),
      details
    };
    setAuditLogs(prev => [newNode, ...prev].slice(0, 100));
  }, [currentUser.username]);

  // Appwrite Authentication Protocol
  const checkSession = useCallback(async () => {
    try {
      const user = await account.get();
      // In Phase 2, we would fetch the user document from the "Users" collection for balances etc.
      // For now, we map the account data to the context User object.
      setCurrentUser(prev => ({
        ...prev,
        name: user.name,
        username: user.email.split('@')[0], // Simulated username from email
        isOnline: true,
        joinDate: new Date(user.$createdAt).toLocaleDateString(),
        role: 'USER'
      }));
    } catch (error) {
      console.log("No active session detected.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    await account.createEmailPasswordSession(email, pass);
    await checkSession();
  };

  const signup = async (email: string, pass: string, name: string, username: string) => {
    await account.create(ID.unique(), email, pass, name);
    await account.createEmailPasswordSession(email, pass);
    // In Phase 4, we would create a document in the "Users" collection here.
    await checkSession();
  };

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const updateCurrentUser = (data: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...data }));
  };

  const updateSettings = (data: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...data }));
  };

  const updateGatewaySettings = (data: Partial<GatewaySettings>) => {
    setGatewaySettings(prev => ({ ...prev, ...data }));
  };

  const addPost = (newPostData: any) => {
    const newPost: Post = {
      ...newPostData,
      id: Date.now().toString(),
      time: "Just now",
      likes: 0,
      unlikes: 0,
      comments: 0,
      shares: 0,
      commentNodes: []
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const addComment = (postId: string, text: string) => {
    triggerHaptic(10);
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: (post.comments || 0) + 1,
          commentNodes: [{ id: `c-${Date.now()}`, user: currentUser, text, time: "Just now", likes: 0, replies: [] }, ...(post.commentNodes || [])]
        };
      }
      return post;
    }));
  };

  const addReply = (postId: string, commentId: string, text: string) => {
    triggerHaptic(15);
    // Simulated nested logic
  };

  const addStory = (segmentData: Omit<StorySegment, 'id'>) => {
    const newSegment: StorySegment = { ...segmentData, id: Date.now().toString() };
    setStories([{ id: Date.now().toString(), user: currentUser, segments: [newSegment], viewCount: 0 }, ...stories]);
  };

  const incrementShareCount = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, shares: (p.shares || 0) + 1 } : p));
  };

  const toggleLikePost = (postId: string) => {
    setLikedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else { next.add(postId); unlikedPostIds.delete(postId); }
      return next;
    });
  };

  const toggleUnlikePost = (postId: string) => {
    setUnlikedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else { next.add(postId); likedPostIds.delete(postId); }
      return next;
    });
  };

  const toggleSavePost = (postId: string) => {
    setSavedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const toggleFollowUser = (username: string) => {
    setFollowingUsernames(prev => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
      return next;
    });
  };

  const initiateTransaction = (data: any) => { setPendingTransaction({ ...data, timestamp: Date.now() }); };
  const cancelTransaction = () => { setPendingTransaction(null); };
  const createPaymentRequest = (screenshot: string) => { triggerHaptic(50); };
  const approvePaymentRequest = (id: string) => { triggerHaptic(100); };
  const rejectPaymentRequest = (id: string) => { triggerHaptic(50); };
  const recordWithdrawal = (node: any) => { setWithdrawalHistory(prev => [node, ...prev]); };
  const processWithdrawal = (id: string, status: any) => { triggerHaptic(50); };
  const triggerReferralPulse = (referralCode?: string) => { triggerHaptic(50); };
  const verifyUser = (cost: number, currency: any) => { triggerHaptic(100); };
  const processGiftTransaction = (cost: number, currency: any) => { triggerHaptic(150); };
  const unlockPost = (postId: string, cost: number) => { triggerHaptic(100); setUnlockedPostIds(prev => new Set(prev).add(postId)); };
  const subscribeToCreator = (username: string, cost: number) => { triggerHaptic(120); setActiveSubscriptions(prev => new Set(prev).add(username)); };
  const cancelSubscription = (username: string) => { triggerHaptic(30); setActiveSubscriptions(prev => { const n = new Set(prev); n.delete(username); return n; }); };
  
  const recordAdMaterialization = () => {};
  const recordAdHandshake = (revenue: number) => {};
  const updateIntelligence = (data: any) => { setIntelligenceMetrics(prev => ({ ...prev, ...data })); };

  const isPostLiked = (postId: string) => likedPostIds.has(postId);
  const isPostUnliked = (postId: string) => unlikedPostIds.has(postId);
  const isPostSaved = (postId: string) => savedPostIds.has(postId);
  const isPostUnlocked = (postId: string) => unlockedPostIds.has(postId);
  const isFollowing = (username: string) => followingUsernames.has(username);
  const isSubscribed = (username: string) => activeSubscriptions.has(username);

  const voteOnStoryPoll = (storyId: string, segmentId: string, optionIndex: number) => {};
  const toggleMuteUser = (username: string) => { setMutedUserNames(prev => prev.includes(username) ? prev.filter(u => u !== username) : [...prev, username]); };
  const togglePinPost = (postId: string) => { setPosts(prev => prev.map(p => p.id === postId ? { ...p, isPinned: !p.isPinned } : p)); };
  const archivePost = (postId: string) => { setPosts(prev => prev.filter(p => p.id !== postId)); };
  const setSearchOpen = (open: boolean) => { triggerHaptic(5); setIsSearchOpen(open); };
  const openCommentHub = (postId: string) => { triggerHaptic(5); setActiveCommentPostId(postId); };
  const closeCommentHub = () => { setActiveCommentPostId(null); };
  const openGiftHub = (user: User) => { triggerHaptic(15); setTargetUserForGift(user); setIsGiftHubOpen(true); };
  const closeGiftHub = () => { setIsGiftHubOpen(false); setTargetUserForGift(null); };

  const createCluster = (name: string, members: Connection[]) => {};
  const addMemberToCluster = (clusterId: string, member: Connection) => {};
  const leaveCluster = (clusterId: string) => {};
  const resolveDispute = (id: string, action: any) => {};
  const promoteUser = (username: string, role: any) => {};
  const demoteUser = (username: string) => {};
  const addCampaign = (data: any) => {};
  const deleteCampaign = (id: string) => {};
  const toggleCampaignStatus = (id: string) => {};
  const recordCampaignClick = (id: string) => {};
  const boostNode = (nodeId: string, targetViews: number, durationDays: number, cost: number, currency: any) => {};
  const initiateCall = (contact: Connection, type: CallType) => { triggerHaptic(30); setCallState({ type, status: 'outgoing', contact }); };
  const receiveCall = (contact: Connection, type: CallType) => { triggerHaptic(50); setCallState({ type, status: 'incoming', contact }); };
  const acceptCall = () => { triggerHaptic(20); setCallState(prev => ({ ...prev, status: 'active', startTime: Date.now() })); };
  const endCall = () => { triggerHaptic(100); setCallState({ type: 'video', status: 'idle', contact: null }); };

  return (
    <PostContext.Provider value={{ 
      currentUser, posts, stories, highlights, campaigns, mutedUserNames, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, activeSubscriptions, followingUsernames, activeStoryIndex, connections, clusters, auditLogs, disputes, staff, adStats, intelligenceMetrics, selectedChatId, selectedPostId, activeCommentPostId, selectedImageUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, pendingTransaction, withdrawalHistory, paymentRequests, referralLink, settings, gatewaySettings, callState, isLoading, login, signup, setSearchOpen, setSelectedChatId, setSelectedPostId, setSelectedImageUrl, openCommentHub, closeCommentHub, openGiftHub, closeGiftHub, setActiveStoryIndex, addPost, deletePost, addStory, addComment, addReply, incrementShareCount, voteOnStoryPoll, toggleMuteUser, togglePinPost, archivePost, updateCurrentUser, updateSettings, updateGatewaySettings, addAuditLog, toggleLikePost, toggleUnlikePost, toggleSavePost, toggleFollowUser, initiateTransaction, cancelTransaction, createPaymentRequest, approvePaymentRequest, rejectPaymentRequest, recordWithdrawal, processWithdrawal, triggerReferralPulse, verifyUser, processGiftTransaction, unlockPost, subscribeToCreator, cancelSubscription, recordAdMaterialization, recordAdHandshake, updateIntelligence, isPostLiked, isPostUnliked, isPostSaved, isPostUnlocked, isFollowing, isSubscribed, triggerHaptic, createCluster, addMemberToCluster, leaveCluster, resolveDispute, addCampaign, deleteCampaign, toggleCampaignStatus, recordCampaignClick, boostNode, promoteUser, demoteUser, initiateCall, receiveCall, acceptCall, endCall
    }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) throw new Error('usePosts must be used within a PostProvider');
  return context;
}
