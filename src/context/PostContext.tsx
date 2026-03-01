"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';

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
  // Phase 1
  goldRate: number; // USD per 1 Gold
  diamondRate: number; // USD per 1 Diamond
  ldMultiplier: number; // LD per 1 USD
  isReelsEnabled: boolean;
  isMusicEnabled: boolean;
  isGiftingEnabled: boolean;
  // Phase 3
  isAiVerificationActive: boolean;
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
  adStats: AdStats;
  intelligenceMetrics: IntelligenceMetrics;
  selectedChatId: string | null;
  selectedPostId: string | null;
  activeCommentPostId: string | null;
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
  
  // Campaigns
  addCampaign: (campaign: Omit<Campaign, 'id' | 'timestamp' | 'clicks'>) => void;
  deleteCampaign: (id: string) => void;
  toggleCampaignStatus: (id: string) => void;
  recordCampaignClick: (id: string) => void;

  // Call Handshakes
  initiateCall: (contact: Connection, type: CallType) => void;
  receiveCall: (contact: Connection, type: CallType) => void;
  acceptCall: () => void;
  endCall: () => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const INITIAL_USER: User = {
  name: "John Doe",
  username: "johndoe_creative",
  avatar: "https://picsum.photos/seed/me/400/400",
  cover: "https://picsum.photos/seed/my_cover/1200/400",
  bio: "Digital creator specializing in UI/UX and mobile photography. Building ViMore community. 🎨 ✨",
  category: "Digital Creator",
  profession: "Lead Product Architect at ViMore Labs",
  school: "University of Digital Arts",
  relationshipStatus: "Single",
  dateOfBirth: "1995-10-24",
  pronouns: "His",
  joinDate: "January 2024",
  followers: "8.4k",
  following: "1.2k",
  posts: "142",
  language: "en",
  goldBalance: 500,
  diamondBalance: 25,
  starBalance: 15000,
  referralCount: 0,
  introUrl: "",
  isOnline: true,
  isVerified: false,
  hasEverBeenVerified: false,
  lastModifiedName: 0,
  lastModifiedDob: 0,
  profilePictureHistory: ["https://picsum.photos/seed/me/400/400"],
  coverPhotoHistory: ["https://picsum.photos/seed/my_cover/1200/400"]
};

const INITIAL_SETTINGS: AppSettings = {
  theme: 'system',
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
  // Phase 1
  goldRate: 0.01,
  diamondRate: 0.25,
  ldMultiplier: 190, 
  isReelsEnabled: true,
  isMusicEnabled: true,
  isGiftingEnabled: true,
  // Phase 3
  isAiVerificationActive: true
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
  },
  {
    name: "Neon Architect",
    username: "neon_arch",
    avatar: "https://picsum.photos/seed/leader1/100/100",
    category: "Elite Creator",
    followsYou: false,
    isOnline: true,
    connectionDate: "Apr 2024",
    followers: "142k",
    lastInteraction: Date.now() - 1000 * 60 * 15 
  },
  {
    name: "Paul Node",
    username: "paul",
    avatar: "https://picsum.photos/seed/paul/100/100",
    category: "Producer",
    followsYou: true,
    isOnline: true,
    connectionDate: "May 2024",
    followers: "156",
    lastInteraction: Date.now() - 1000 * 60 * 2 
  }
];

const initialMockStories: Story[] = [
  {
    id: "s1",
    user: { name: "Alex Rivera", username: "arivera", avatar: "https://picsum.photos/seed/1/100/100" },
    isCloseFriends: true,
    viewCount: 42,
    segments: [
      { 
        id: "seg1", 
        image: "https://picsum.photos/seed/s2/800/1200", 
        type: 'image',
        mentions: [{ username: "arivera", x: "20%", y: "40%" }],
        poll: {
          question: "Best coffee spot in SF?",
          options: [{ text: "Blue Bottle", votes: 12 }, { text: "Philz", votes: 8 }]
        }
      }
    ]
  },
  {
    id: "s2",
    user: { name: "Sarah Chen", username: "schen_dev", avatar: "https://picsum.photos/seed/2/100/100" },
    viewCount: 156,
    segments: [
      { 
        id: "seg3", 
        image: "https://picsum.photos/seed/s3/800/1200", 
        type: 'image'
      }
    ]
  }
];

const initialHighlights: Highlight[] = [
  { id: "h1", title: "SF Trip", coverImage: "https://picsum.photos/seed/h1/200/200", segments: [] },
  { id: "h2", title: "Design", coverImage: "https://picsum.photos/seed/h2/200/200", segments: [] },
  { id: "h3", title: "Vibes", coverImage: "https://picsum.photos/seed/h3/200/200", segments: [] },
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
    image: "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxkZXNlcnR8ZW58MHx8fHwxNzcxOTIxNDkzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    commentNodes: []
  },
  {
    id: "1",
    user: { 
      name: "Julianne Moore", 
      username: "jmoore", 
      avatar: "https://picsum.photos/seed/50/200/200",
      isVerified: true,
      followers: 1500
    },
    content: "Just started using **ViMore** and I'm loving the clean aesthetic! Check out the multi-image carousel test. ✨ http://vimore.appwrite.network",
    time: "5m",
    likes: 24,
    unlikes: 2,
    comments: 1,
    shares: 1,
    language: "en",
    hashtags: ["NewBeginnings", "SocialMedia"],
    images: [
      "https://images.unsplash.com/photo-1615118265620-d8decf628275?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxuYXR1cmUlMjBsYW5kc2NhcGV8ZW58MHx8fHwxNzcxODUwMDM3fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1519662978799-2f05096d3636?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBhcmNoaXRlY3R1cmV8ZW58MHx8fHwxNzcxOTIxNDkzfDA&ixlib=rb-4.1.0&q=80&w=1080"
    ],
    commentNodes: [
      {
        id: "c1",
        user: { name: "Alex Rivera", username: "arivera", avatar: "https://picsum.photos/seed/1/100/100" },
        text: "The high-velocity aesthetic is incredible! 🚀",
        time: "2m ago",
        likes: 5,
        replies: []
      }
    ]
  },
  {
    id: "locked-2",
    user: { 
      name: "Neon Architect", 
      username: "neon_arch", 
      avatar: "https://picsum.photos/seed/leader1/100/100",
      isVerified: true,
      followers: 142000
    },
    content: "Materializing the next evolution of spatial design. Full 4K reel unlocked for Gold contributors only. ⚡️",
    time: "15m",
    likes: 856,
    unlikes: 2,
    comments: 42,
    shares: 120,
    isLocked: true,
    unlockPrice: 150,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-man-dancing-in-a-dark-room-with-neon-lights-40028-preview.mp4",
    commentNodes: []
  }
];

const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-init",
    type: "photo",
    content: "Materialize your verified signature today and join the elite creator loop. 🚀",
    mediaUrl: "https://picsum.photos/seed/verify_campaign/800/400",
    actionUrl: "/verification",
    actionLabel: "GET VERIFIED",
    isActive: true,
    clicks: 142,
    timestamp: Date.now()
  }
];

export function PostProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [gatewaySettings, setGatewaySettings] = useState<GatewaySettings>(INITIAL_GATEWAY_SETTINGS);
  const [posts, setPosts] = useState<Post[]>(initialMockPosts);
  const [stories, setStories] = useState<Story[]>(initialMockStories);
  const [highlights] = useState<Highlight[]>(initialHighlights);
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
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
  
  const [adStats, setAdStats] = useState<AdStats>({ materializations: 842, handshakes: 124, revenue: 12.40 });
  const [intelligenceMetrics, setIntelligenceMetrics] = useState<IntelligenceMetrics>({
    sentimentScore: 82,
    sentimentVibe: 'POSITIVE',
    sentimentSummary: "Network vibe stable and synchronized. Strong community alignment detected in the latest content pulses.",
    botRisk: 4,
    latency: 142
  });

  const [followingUsernames, setFollowingUsernames] = useState<Set<string>>(new Set(["jmoore", "arivera", "schen_dev", "paul"]));
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

  const safePersist = (key: string, value: any) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn(`Storage quota exceeded for key: ${key}. Calibrating cache...`);
    }
  };

  const addAuditLog = useCallback((action: string, details: string) => {
    const newNode: AuditLogNode = {
      id: `LOG-${Date.now()}`,
      action,
      admin: "PLATFORM_CORE",
      timestamp: Date.now(),
      details
    };
    setAuditLogs(prev => [newNode, ...prev].slice(0, 100));
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('vimore_user');
    const savedSettings = localStorage.getItem('vimore_settings');
    const savedGateway = localStorage.getItem('vimore_gateway');
    const savedLikes = localStorage.getItem('vimore_liked_posts');
    const savedUnlikes = localStorage.getItem('vimore_unliked_posts');
    const savedSaves = localStorage.getItem('vimore_saved_posts');
    const savedUnlocked = localStorage.getItem('vimore_unlocked_posts');
    const savedSubs = localStorage.getItem('vimore_subscriptions');
    const savedFollowing = localStorage.getItem('vimore_following');
    const savedLocalPosts = localStorage.getItem('vimore_local_posts');
    const savedPending = localStorage.getItem('vimore_pending_transaction');
    const savedWithdrawals = localStorage.getItem('vimore_withdrawal_history');
    const savedPayments = localStorage.getItem('vimore_payment_requests');
    const savedClusters = localStorage.getItem('vimore_clusters');
    const savedLogs = localStorage.getItem('vimore_audit_logs');
    const savedDisputes = localStorage.getItem('vimore_disputes');
    const savedAdStats = localStorage.getItem('vimore_ad_stats');
    const savedCampaigns = localStorage.getItem('vimore_campaigns');

    if (savedUser) try { setCurrentUser(JSON.parse(savedUser)); } catch (e) {}
    if (savedSettings) try { setSettings({ ...INITIAL_SETTINGS, ...JSON.parse(savedSettings) }); } catch (e) {}
    if (savedGateway) try { setGatewaySettings({ ...INITIAL_GATEWAY_SETTINGS, ...JSON.parse(savedGateway) }); } catch (e) {}
    if (savedLikes) setLikedPostIds(new Set(JSON.parse(savedLikes)));
    if (savedUnlikes) setUnlikedPostIds(new Set(JSON.parse(savedUnlikes)));
    if (savedSaves) setSavedPostIds(new Set(JSON.parse(savedSaves)));
    if (savedUnlocked) setUnlockedPostIds(new Set(JSON.parse(savedUnlocked)));
    if (savedSubs) setActiveSubscriptions(new Set(JSON.parse(savedSubs)));
    if (savedFollowing) setFollowingUsernames(new Set(JSON.parse(savedFollowing)));
    if (savedPending) setPendingTransaction(JSON.parse(savedPending));
    if (savedWithdrawals) setWithdrawalHistory(JSON.parse(savedWithdrawals));
    if (savedPayments) setPaymentRequests(JSON.parse(savedPayments));
    if (savedClusters) setClusters(JSON.parse(savedClusters));
    if (savedLogs) setAuditLogs(JSON.parse(savedLogs));
    if (savedDisputes) setDisputes(JSON.parse(savedDisputes));
    if (savedAdStats) try { setAdStats(JSON.parse(savedAdStats)); } catch (e) {}
    if (savedCampaigns) try { setCampaigns(JSON.parse(savedCampaigns)); } catch (e) {}
    
    if (savedLocalPosts) {
      try {
        setPosts([...JSON.parse(savedLocalPosts), ...initialMockPosts]);
      } catch (e) {}
    }
  }, []);

  // Update root class for Dark/Light mode support
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      const isDark = settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  }, [settings.theme]);

  useEffect(() => { safePersist('vimore_liked_posts', Array.from(likedPostIds)); }, [likedPostIds]);
  useEffect(() => { safePersist('vimore_unliked_posts', Array.from(unlikedPostIds)); }, [unlikedPostIds]);
  useEffect(() => { safePersist('vimore_saved_posts', Array.from(savedPostIds)); }, [savedPostIds]);
  useEffect(() => { safePersist('vimore_unlocked_posts', Array.from(unlockedPostIds)); }, [unlockedPostIds]);
  useEffect(() => { safePersist('vimore_subscriptions', Array.from(activeSubscriptions)); }, [activeSubscriptions]);
  useEffect(() => { safePersist('vimore_following', Array.from(followingUsernames)); }, [followingUsernames]);
  useEffect(() => { safePersist('vimore_settings', settings); }, [settings]);
  useEffect(() => { safePersist('vimore_gateway', gatewaySettings); }, [gatewaySettings]);
  useEffect(() => { safePersist('vimore_withdrawal_history', withdrawalHistory); }, [withdrawalHistory]);
  useEffect(() => { safePersist('vimore_payment_requests', paymentRequests); }, [paymentRequests]);
  useEffect(() => { safePersist('vimore_clusters', clusters); }, [clusters]);
  useEffect(() => { safePersist('vimore_audit_logs', auditLogs); }, [auditLogs]);
  useEffect(() => { safePersist('vimore_disputes', disputes); }, [disputes]);
  useEffect(() => { safePersist('vimore_ad_stats', adStats); }, [adStats]);
  useEffect(() => { safePersist('vimore_campaigns', campaigns); }, [campaigns]);

  const recordAdMaterialization = useCallback(() => {
    setAdStats(prev => ({ ...prev, materializations: prev.materializations + 1 }));
  }, []);

  const recordAdHandshake = useCallback((revenue: number) => {
    setAdStats(prev => ({ 
      ...prev, 
      handshakes: prev.handshakes + 1,
      revenue: prev.revenue + revenue
    }));
  }, []);

  const updateIntelligence = (data: Partial<IntelligenceMetrics>) => {
    setIntelligenceMetrics(prev => ({ ...prev, ...data }));
  };

  const toggleFollowUser = (username: string) => {
    setFollowingUsernames(prev => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else {
        next.add(username);
      }
      return next;
    });
  };

  const triggerReferralPulse = useCallback((referralCode?: string) => {
    triggerHaptic(50);
    setCurrentUser(prev => {
      const updated = {
        ...prev,
        starBalance: (prev.starBalance || 0) + 5000,
        referralCount: (prev.referralCount || 0) + 1
      };
      safePersist('vimore_user', updated);
      return updated;
    });

    if (settings.isAutoFollowEnabled && referralCode) {
      toggleFollowUser(referralCode);
    }
  }, [triggerHaptic, settings.isAutoFollowEnabled]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const referralCode = params.get('ref');
      
      if (referralCode) {
        const sessionKey = `vimore_processed_ref_${referralCode}`;
        if (!sessionStorage.getItem(sessionKey)) {
          triggerReferralPulse(referralCode);
          sessionStorage.setItem(sessionKey, 'true');
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }
      }
    }
  }, [triggerReferralPulse]);

  const updateCurrentUser = (data: Partial<User>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...data };
      if (data.avatar && data.avatar !== prev.avatar) {
        updated.profilePictureHistory = [...(prev.profilePictureHistory || []), data.avatar].slice(-10);
      }
      if (data.cover && data.cover !== prev.cover) {
        updated.coverPhotoHistory = [...(prev.coverPhotoHistory || []), data.cover].slice(-10);
      }
      safePersist('vimore_user', updated);
      return updated;
    });
  };

  const verifyUser = (cost: number, currency: 'DIAMOND' | 'STAR') => {
    triggerHaptic(100);
    setCurrentUser(prev => {
      const updated = {
        ...prev,
        diamondBalance: currency === 'DIAMOND' ? (prev.diamondBalance || 0) - cost : prev.diamondBalance,
        starBalance: currency === 'STAR' ? (prev.starBalance || 0) - cost : prev.starBalance,
        isVerified: true,
        hasEverBeenVerified: true,
        verificationExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000) 
      };
      safePersist('vimore_user', updated);
      return updated;
    });
  };

  const processGiftTransaction = (cost: number, currency: 'GOLD' | 'DIAMOND') => {
    triggerHaptic(150);
    setCurrentUser(prev => {
      const updated = {
        ...prev,
        goldBalance: currency === 'GOLD' ? (prev.goldBalance || 0) - cost : prev.goldBalance,
        diamondBalance: currency === 'DIAMOND' ? (prev.diamondBalance || 0) - cost : prev.diamondBalance
      };
      safePersist('vimore_user', updated);
      return updated;
    });
  };

  const unlockPost = (postId: string, cost: number) => {
    triggerHaptic(100);
    setUnlockedPostIds(prev => {
      const next = new Set(prev);
      next.add(postId);
      return next;
    });
    setCurrentUser(prev => {
      const updated = { ...prev, goldBalance: (prev.goldBalance || 0) - cost };
      safePersist('vimore_user', updated);
      return updated;
    });
  };

  const subscribeToCreator = (username: string, cost: number) => {
    triggerHaptic(120);
    setActiveSubscriptions(prev => {
      const next = new Set(prev);
      next.add(username);
      return next;
    });
    setCurrentUser(prev => {
      const updated = { ...prev, diamondBalance: (prev.diamondBalance || 0) - cost };
      safePersist('vimore_user', updated);
      return updated;
    });
  };

  const cancelSubscription = (username: string) => {
    triggerHaptic(30);
    setActiveSubscriptions(prev => {
      const next = new Set(prev);
      next.delete(username);
      return next;
    });
  };

  const updateSettings = (data: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...data };
      safePersist('vimore_settings', updated);
      return updated;
    });
  };

  const updateGatewaySettings = (data: Partial<GatewaySettings>) => {
    setGatewaySettings(prev => {
      const updated = { ...prev, ...data };
      safePersist('vimore_gateway', updated);
      return updated;
    });
  };

  const addPost = (newPostData: Omit<Post, 'id' | 'time' | 'likes' | 'unlikes' | 'comments' | 'shares'>) => {
    const detectedLanguage = newPostData.language || (typeof window !== 'undefined' ? window.navigator.language.split('-')[0] : 'en');
    const newPost: Post = {
      ...newPostData,
      id: Date.now().toString(),
      time: "Just now",
      likes: 0,
      unlikes: 0,
      comments: 0,
      shares: 0,
      language: detectedLanguage,
      commentNodes: []
    };
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    const userOnlyPosts = updatedPosts.filter(p => p.user.username === currentUser.username).slice(0, 10);
    safePersist('vimore_local_posts', userOnlyPosts);
  };

  const deletePost = (postId: string) => {
    setPosts(prev => {
      const updated = prev.filter(p => p.id !== postId);
      const userOnlyPosts = updated.filter(p => p.user.username === currentUser.username).slice(0, 10);
      safePersist('vimore_local_posts', userOnlyPosts);
      return updated;
    });
  };

  const addComment = (postId: string, text: string) => {
    triggerHaptic(10);
    setPosts(prev => {
      const updated = prev.map(post => {
        if (post.id === postId) {
          const newComment: PostComment = {
            id: `c-${Date.now()}`,
            user: currentUser,
            text,
            time: "Just now",
            likes: 0,
            replies: []
          };
          return {
            ...post,
            comments: (post.comments || 0) + 1,
            commentNodes: [newComment, ...(post.commentNodes || [])]
          };
        }
        return post;
      });
      const userOnlyPosts = updated.filter(p => p.user.username === currentUser.username).slice(0, 10);
      safePersist('vimore_local_posts', userOnlyPosts);
      return updated;
    });
  };

  const addReply = (postId: string, commentId: string, text: string) => {
    triggerHaptic(15);
    setPosts(prev => {
      const updated = prev.map(post => {
        if (post.id === postId) {
          const findAndReply = (comments: PostComment[]): PostComment[] => {
            return comments.map(c => {
              if (c.id === commentId) {
                const newReply: PostComment = {
                  id: `r-${Date.now()}`,
                  user: currentUser,
                  text,
                  time: "Just now",
                  likes: 0,
                  replies: []
                };
                return { ...c, replies: [...c.replies, newReply] };
              }
              if (c.replies.length > 0) return { ...c, replies: findAndReply(c.replies) };
              return c;
            });
          };
          return {
            ...post,
            comments: (post.comments || 0) + 1,
            commentNodes: findAndReply(post.commentNodes || [])
          };
        }
        return post;
      });
      const userOnlyPosts = updated.filter(p => p.user.username === currentUser.username).slice(0, 10);
      safePersist('vimore_local_posts', userOnlyPosts);
      return updated;
    });
  };

  const addStory = (segmentData: Omit<StorySegment, 'id'>) => {
    const userStoryIndex = stories.findIndex(s => s.user.username === currentUser.username);
    const newSegment: StorySegment = { ...segmentData, id: Date.now().toString() };
    if (userStoryIndex !== -1) {
      setStories(prev => {
        const updated = [...prev];
        updated[userStoryIndex] = {
          ...updated[userStoryIndex],
          segments: [newSegment, ...updated[userStoryIndex].segments].slice(0, 10),
          viewCount: updated[userStoryIndex].viewCount || 0
        };
        return updated;
      });
    } else {
      setStories([{ id: Date.now().toString(), user: currentUser, segments: [newSegment], viewCount: 0 }, ...stories]);
    }
  };

  const incrementShareCount = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, shares: (p.shares || 0) + 1 } : p));
  };

  const toggleLikePost = (postId: string) => {
    setLikedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else {
        next.add(postId);
        unlikedPostIds.delete(postId);
        setUnlikedPostIds(new Set(unlikedPostIds));
      }
      return next;
    });
  };

  const toggleUnlikePost = (postId: string) => {
    setUnlikedPostIds(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else {
        next.add(postId);
        likedPostIds.delete(postId);
        setLikedPostIds(new Set(likedPostIds));
      }
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

  const initiateTransaction = (data: Omit<PendingTransaction, 'timestamp'>) => {
    triggerHaptic(20);
    const tx: PendingTransaction = { ...data, timestamp: Date.now() };
    setPendingTransaction(tx);
  };

  const cancelTransaction = () => { setPendingTransaction(null); };

  const createPaymentRequest = (screenshot: string) => {
    if (!pendingTransaction) return;
    triggerHaptic(50);
    const request: PaymentRequest = {
      id: `PAY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      username: currentUser.username,
      name: currentUser.name,
      packageName: pendingTransaction.packageName,
      amount: pendingTransaction.amount,
      currency: pendingTransaction.currency,
      type: pendingTransaction.type,
      code: pendingTransaction.code,
      screenshot,
      status: 'PENDING',
      timestamp: Date.now()
    };
    setPaymentRequests(prev => [request, ...prev].slice(0, 50));
  };

  const approvePaymentRequest = (id: string) => {
    triggerHaptic(100);
    setPaymentRequests(prev => prev.map(req => {
      if (req.id === id) {
        const amountNum = parseFloat(req.packageName.split(' ')[0]) || 0; 
        
        setCurrentUser(user => ({
          ...user,
          goldBalance: req.type === 'Gold' ? (user.goldBalance || 0) + amountNum : user.goldBalance,
          diamondBalance: req.type === 'Diamond' ? (user.diamondBalance || 0) + amountNum : user.diamondBalance
        }));

        addAuditLog("PAYMENT_APPROVED", `Authorized ${amountNum} ${req.type} for @${req.username}`);
        return { ...req, status: 'APPROVED' };
      }
      return req;
    }));
  };

  const rejectPaymentRequest = (id: string) => {
    triggerHaptic(50);
    setPaymentRequests(prev => prev.map(req => {
      if (req.id === id) {
        // Create a dispute node automatically for the user to appeal
        const dispute: DisputeNode = {
          id: `DISP-${Date.now()}`,
          username: req.username,
          type: 'PAYMENT',
          reason: "Administrative purge during initial handshake. Please verify receipt details.",
          status: 'OPEN',
          timestamp: Date.now(),
          originalTxId: req.id
        };
        setDisputes(prev => [dispute, ...prev]);
        addAuditLog("PAYMENT_REJECTED", `Purged payment handshake for @${req.username}. Dispute node opened.`);
        return { ...req, status: 'REJECTED' };
      }
      return req;
    }));
  };

  const recordWithdrawal = (node: WithdrawalNode) => {
    setWithdrawalHistory(prev => [node, ...prev].slice(0, 50));
  };

  const processWithdrawal = (id: string, status: 'APPROVED' | 'REJECTED') => {
    triggerHaptic(status === 'APPROVED' ? 50 : 100);
    setWithdrawalHistory(prev => prev.map(node => {
      if (node.id === id) {
        if (status === 'REJECTED') {
          const dispute: DisputeNode = {
            id: `DISP-${Date.now()}`,
            username: node.username,
            type: 'WITHDRAWAL',
            reason: "Withdrawal handshake severed by Auditor. Potential risk mismatch detected.",
            status: 'OPEN',
            timestamp: Date.now(),
            originalTxId: node.id
          };
          setDisputes(prev => [dispute, ...prev]);
        }
        addAuditLog(status === 'APPROVED' ? "WITHDRAWAL_AUTHORIZED" : "WITHDRAWAL_PURGED", `${status} payout of ${node.payoutCurrency} ${node.payoutAmount} to @${node.username}`);
        return { ...node, status };
      }
      return node;
    }));
  };

  const resolveDispute = (id: string, action: 'RESTORE' | 'SEVER') => {
    triggerHaptic(action === 'RESTORE' ? 50 : 100);
    setDisputes(prev => prev.map(d => {
      if (d.id === id) {
        addAuditLog("DISPUTE_RESOLVED", `${action} action taken on dispute node ${id} for @${d.username}`);
        return { ...d, status: action === 'RESTORE' ? 'RESOLVED' : 'SEVERED' };
      }
      return d;
    }));
  };

  const addCampaign = (data: Omit<Campaign, 'id' | 'timestamp' | 'clicks'>) => {
    triggerHaptic(50);
    const newCamp: Campaign = {
      ...data,
      id: `camp-${Date.now()}`,
      timestamp: Date.now(),
      clicks: 0
    };
    setCampaigns(prev => [newCamp, ...prev]);
    addAuditLog("CAMPAIGN_MATERIALIZED", `Launched ${data.type} campaign: ${data.content.slice(0, 30)}...`);
  };

  const deleteCampaign = (id: string) => {
    triggerHaptic(20);
    setCampaigns(prev => prev.filter(c => c.id !== id));
    addAuditLog("CAMPAIGN_PURGED", `Removed campaign node ${id}`);
  };

  const toggleCampaignStatus = (id: string) => {
    triggerHaptic(10);
    setCampaigns(prev => prev.map(c => i === id ? { ...c, isActive: !c.isActive } : c));
  };

  const recordCampaignClick = (id: string) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, clicks: c.clicks + 1 } : c));
  };

  const openCommentHub = (postId: string) => { triggerHaptic(5); setActiveCommentPostId(postId); };
  const closeCommentHub = () => { setActiveCommentPostId(null); };
  const openGiftHub = (user: User) => { if (user.username === currentUser.username || !settings.isGiftingEnabled) return; triggerHaptic(15); setTargetUserForGift(user); setIsGiftHubOpen(true); };
  const closeGiftHub = () => { setIsGiftHubOpen(false); setTargetUserForGift(null); };

  const isPostLiked = (postId: string) => likedPostIds.has(postId);
  const isPostUnliked = (postId: string) => unlikedPostIds.has(postId);
  const isPostSaved = (postId: string) => savedPostIds.has(postId);
  const isPostUnlocked = (postId: string) => unlockedPostIds.has(postId);
  const isFollowing = (username: string) => followingUsernames.has(username);
  const isSubscribed = (username: string) => activeSubscriptions.has(username);

  const voteOnStoryPoll = (storyId: string, segmentId: string, optionIndex: number) => {
    setStories(prev => prev.map(story => {
      if (story.id !== storyId) return story;
      return { ...story, segments: story.segments.map(segment => {
        if (segment.id !== segmentId || !segment.poll) return segment;
        const newOptions = [...segment.poll.options];
        newOptions[optionIndex] = { ...newOptions[optionIndex], votes: newOptions[optionIndex].votes + 1 };
        return { ...segment, poll: { ...segment.poll, options: newOptions } };
      })};
    }));
  };

  const toggleMuteUser = (username: string) => { setMutedUserNames(prev => prev.includes(username) ? prev.filter(u => u !== username) : [...prev, username]); };
  const togglePinPost = (postId: string) => { setPosts(prev => prev.map(p => p.id === postId ? { ...p, isPinned: !p.isPinned } : p)); };
  const archivePost = (postId: string) => { setPosts(prev => prev.filter(p => p.id !== postId)); };
  const setSearchOpen = (open: boolean) => { triggerHaptic(5); setIsSearchOpen(open); };

  const createCluster = (name: string, members: Connection[]) => {
    triggerHaptic(50);
    const newCluster: Cluster = { id: `cluster-${Date.now()}`, name, members, adminUsername: currentUser.username, isGroup: true, lastMessage: "Cluster materialized.", lastMessageTime: "Just now", lastInteraction: Date.now() };
    setClusters(prev => [newCluster, ...prev].slice(0, 20));
  };

  const addMemberToCluster = (clusterId: string, member: Connection) => {
    triggerHaptic(20);
    setClusters(prev => prev.map(c => {
      if (c.id === clusterId) {
        if (c.members.some(m => m.username === member.username)) return c;
        return { ...c, members: [...c.members, member], lastMessage: `@${member.username} joined the cluster.`, lastMessageTime: "Just now", lastInteraction: Date.now() };
      }
      return c;
    }));
  };

  const leaveCluster = (clusterId: string) => { triggerHaptic(30); setClusters(prev => prev.filter(c => c.id !== clusterId)); if (selectedChatId === clusterId) setSelectedChatId(null); };
  const initiateCall = (contact: Connection, type: CallType) => { triggerHaptic(30); setCallState({ type, status: 'outgoing', contact }); };
  const receiveCall = (contact: Connection, type: CallType) => { triggerHaptic(50); setCallState({ type, status: 'incoming', contact }); };
  const acceptCall = () => { triggerHaptic(20); setCallState(prev => ({ ...prev, status: 'active', startTime: Date.now() })); };
  const endCall = () => { triggerHaptic(100); setCallState({ type: 'video', status: 'idle', contact: null }); };

  return (
    <PostContext.Provider value={{ 
      currentUser, posts, stories, highlights, campaigns, mutedUserNames, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, activeSubscriptions, followingUsernames, activeStoryIndex, connections, clusters, auditLogs, disputes, adStats, intelligenceMetrics, selectedChatId, selectedPostId, activeCommentPostId, selectedImageUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, pendingTransaction, withdrawalHistory, paymentRequests, referralLink, settings, gatewaySettings, callState, setSearchOpen, setSelectedChatId, setSelectedPostId, setSelectedImageUrl, openCommentHub, closeCommentHub, openGiftHub, closeGiftHub, setActiveStoryIndex, addPost, deletePost, addStory, addComment, addReply, incrementShareCount, voteOnStoryPoll, toggleMuteUser, togglePinPost, archivePost, updateCurrentUser, updateSettings, updateGatewaySettings, addAuditLog, toggleLikePost, toggleUnlikePost, toggleSavePost, toggleFollowUser, initiateTransaction, cancelTransaction, createPaymentRequest, approvePaymentRequest, rejectPaymentRequest, recordWithdrawal, processWithdrawal, triggerReferralPulse, verifyUser, processGiftTransaction, unlockPost, subscribeToCreator, cancelSubscription, recordAdMaterialization, recordAdHandshake, updateIntelligence, isPostLiked, isPostUnliked, isPostSaved, isPostUnlocked, isFollowing, isSubscribed, triggerHaptic, createCluster, addMemberToCluster, leaveCluster, resolveDispute, addCampaign, deleteCampaign, toggleCampaignStatus, recordCampaignClick, initiateCall, receiveCall, acceptCall, endCall
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
