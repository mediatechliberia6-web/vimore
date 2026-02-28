
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';

export interface AppSettings {
  hapticIntensity: number;
  isGhostMode: boolean;
  playbackQuality: 'standard' | 'pro-hd';
  fontScale: number;
  isAutoFollowEnabled: boolean;
  activeSoundSet: 'cyberpunk' | 'lofi';
  isBiometricActive: boolean;
  taggingPrivacy: 'everyone' | 'friends';
  legacyContact: string | null;
  isSilenceActive: boolean;
  silenceStart: string;
  silenceEnd: string;
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
  method: string;
  amount: number;
  currency: string;
  payoutAmount: number;
  payoutCurrency: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: number;
  accountName: string;
  accountNumber: string;
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
  lastTime?: string;
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
}

export type CallType = 'video' | 'audio';
export type CallStatus = 'idle' | 'incoming' | 'outgoing' | 'active';

export interface CallState {
  type: CallType;
  status: CallStatus;
  contact: Connection | null;
  startTime?: number;
}

interface PostContextType {
  currentUser: User;
  posts: Post[];
  stories: Story[];
  highlights: Highlight[];
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
  selectedChatId: string | null;
  selectedPostId: string | null;
  activeCommentPostId: string | null;
  selectedImageUrl: string | null;
  isSearchOpen: boolean;
  isGiftHubOpen: boolean;
  targetUserForGift: User | null;
  pendingTransaction: PendingTransaction | null;
  withdrawalHistory: WithdrawalNode[];
  referralLink: string;
  settings: AppSettings;
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
  toggleLikePost: (postId: string) => void;
  toggleUnlikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  toggleFollowUser: (username: string) => void;
  initiateTransaction: (data: Omit<PendingTransaction, 'timestamp'>) => void;
  cancelTransaction: () => void;
  recordWithdrawal: (node: WithdrawalNode) => void;
  triggerReferralPulse: (referralCode?: string) => void;
  verifyUser: (cost: number, currency: 'DIAMOND' | 'STAR') => void;
  processGiftTransaction: (cost: number, currency: 'GOLD' | 'DIAMOND') => void;
  unlockPost: (postId: string, cost: number) => void;
  subscribeToCreator: (username: string, cost: number) => void;
  cancelSubscription: (username: string) => void;
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
  hapticIntensity: 50,
  isGhostMode: false,
  playbackQuality: 'standard',
  fontScale: 1,
  isAutoFollowEnabled: true,
  activeSoundSet: 'cyberpunk',
  isBiometricActive: false,
  taggingPrivacy: 'everyone',
  legacyContact: null,
  isSilenceActive: false,
  silenceStart: "22:00",
  silenceEnd: "07:00"
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
    lastInteraction: Date.now() - 1000 * 60 * 60 * 2 // 2 hours ago
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
    lastInteraction: Date.now() - 1000 * 60 * 60 * 24 // Yesterday
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
    lastInteraction: Date.now() - 1000 * 60 * 10 // 10 mins ago
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
    lastInteraction: Date.now() - 1000 * 60 * 5 // 5 mins ago
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
    lastInteraction: Date.now() - 1000 * 60 * 60 * 5 // 5 hours ago
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
    lastInteraction: Date.now() - 1000 * 60 * 15 // 15 mins ago
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
    lastInteraction: Date.now() - 1000 * 60 * 2 // 2 mins ago
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
  },
  {
    id: "2",
    user: { 
      name: "Tech Explorer", 
      username: "techex", 
      avatar: "https://picsum.photos/seed/51/200/200",
      followers: 12000
    },
    content: "What should my next deep-dive tech video be about? Vote below! 🚀",
    time: "22m",
    likes: 156,
    unlikes: 12,
    comments: 0,
    shares: 8,
    language: "en",
    poll: {
      question: "Next Video Topic?",
      options: [
        { text: "Llama 3 Local Setup", votes: 45 },
        { text: "Next.js 15 Server Actions", votes: 89 }
      ],
      totalVotes: 134,
      duration: "24 Hours"
    },
    commentNodes: []
  }
];

export function PostProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [posts, setPosts] = useState<Post[]>(initialMockPosts);
  const [stories, setStories] = useState<Story[]>(initialMockStories);
  const [highlights] = useState<Highlight[]>(initialHighlights);
  const [mutedUserNames, setMutedUserNames] = useState<string[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [unlikedPostIds, setUnlikedPostIds] = useState<Set<string>>(new Set());
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [unlockedPostIds, setUnlockedPostIds] = useState<Set<string>>(new Set());
  const [activeSubscriptions, setActiveSubscriptions] = useState<Set<string>>(new Set());
  const [pendingTransaction, setPendingTransaction] = useState<PendingTransaction | null>(null);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalNode[]>([]);
  
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
      // If we hit a quota limit, try to clear non-essential cache
      if (key === 'vimore_local_posts') {
        // Keep only top 5 if quota hit
        try {
          localStorage.setItem(key, JSON.stringify(value.slice(0, 5)));
        } catch (innerE) {}
      }
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('vimore_user');
    const savedSettings = localStorage.getItem('vimore_settings');
    const savedLikes = localStorage.getItem('vimore_liked_posts');
    const savedUnlikes = localStorage.getItem('vimore_unliked_posts');
    const savedSaves = localStorage.getItem('vimore_saved_posts');
    const savedUnlocked = localStorage.getItem('vimore_unlocked_posts');
    const savedSubs = localStorage.getItem('vimore_subscriptions');
    const savedFollowing = localStorage.getItem('vimore_following');
    const savedLocalPosts = localStorage.getItem('vimore_local_posts');
    const savedPending = localStorage.getItem('vimore_pending_transaction');
    const savedWithdrawals = localStorage.getItem('vimore_withdrawal_history');
    const savedClusters = localStorage.getItem('vimore_clusters');

    if (savedUser) try { setCurrentUser(JSON.parse(savedUser)); } catch (e) {}
    if (savedSettings) try { setSettings({ ...INITIAL_SETTINGS, ...JSON.parse(savedSettings) }); } catch (e) {}
    if (savedLikes) setLikedPostIds(new Set(JSON.parse(savedLikes)));
    if (savedUnlikes) setUnlikedPostIds(new Set(JSON.parse(savedUnlikes)));
    if (savedSaves) setSavedPostIds(new Set(JSON.parse(savedSaves)));
    if (savedUnlocked) setUnlockedPostIds(new Set(JSON.parse(savedUnlocked)));
    if (savedSubs) setActiveSubscriptions(new Set(JSON.parse(savedSubs)));
    if (savedFollowing) setFollowingUsernames(new Set(JSON.parse(savedFollowing)));
    if (savedPending) setPendingTransaction(JSON.parse(savedPending));
    if (savedWithdrawals) setWithdrawalHistory(JSON.parse(savedWithdrawals));
    if (savedClusters) setClusters(JSON.parse(savedClusters));
    
    if (savedLocalPosts) {
      try {
        setPosts([...JSON.parse(savedLocalPosts), ...initialMockPosts]);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (currentUser.isVerified && currentUser.verificationExpiry) {
      if (Date.now() > currentUser.verificationExpiry) {
        updateCurrentUser({ isVerified: false });
      }
    }
  }, []);

  useEffect(() => { safePersist('vimore_liked_posts', Array.from(likedPostIds)); }, [likedPostIds]);
  useEffect(() => { safePersist('vimore_unliked_posts', Array.from(unlikedPostIds)); }, [unlikedPostIds]);
  useEffect(() => { safePersist('vimore_saved_posts', Array.from(savedPostIds)); }, [savedPostIds]);
  useEffect(() => { safePersist('vimore_unlocked_posts', Array.from(unlockedPostIds)); }, [unlockedPostIds]);
  useEffect(() => { safePersist('vimore_subscriptions', Array.from(activeSubscriptions)); }, [activeSubscriptions]);
  useEffect(() => { safePersist('vimore_following', Array.from(followingUsernames)); }, [followingUsernames]);
  useEffect(() => { safePersist('vimore_settings', settings); }, [settings]);
  useEffect(() => { safePersist('vimore_withdrawal_history', withdrawalHistory); }, [withdrawalHistory]);
  useEffect(() => { safePersist('vimore_clusters', clusters); }, [clusters]);

  useEffect(() => {
    if (pendingTransaction) {
      safePersist('vimore_pending_transaction', pendingTransaction);
    } else {
      localStorage.removeItem('vimore_pending_transaction');
    }
  }, [pendingTransaction]);

  const toggleFollowUser = (username: string) => {
    setFollowingUsernames(prev => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
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
        verificationExpiry: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 Days
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

  const finalCurrentUser = useMemo(() => {
    return {
      ...currentUser,
      isOnline: settings.isGhostMode ? false : currentUser.isOnline
    };
  }, [currentUser, settings.isGhostMode]);

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
              if (c.replies.length > 0) {
                return { ...c, replies: findAndReply(c.replies) };
              }
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
          segments: [newSegment, ...updated[userStoryIndex].segments].slice(0, 10), // Limit segments
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
    const tx: PendingTransaction = {
      ...data,
      timestamp: Date.now()
    };
    setPendingTransaction(tx);
  };

  const cancelTransaction = () => {
    setPendingTransaction(null);
  };

  const recordWithdrawal = (node: WithdrawalNode) => {
    setWithdrawalHistory(prev => [node, ...prev].slice(0, 20));
  };

  const openCommentHub = (postId: string) => {
    triggerHaptic(5);
    setActiveCommentPostId(postId);
  };

  const closeCommentHub = () => {
    setActiveCommentPostId(null);
  };

  const openGiftHub = (user: User) => {
    if (user.username === currentUser.username) return;
    triggerHaptic(15);
    setTargetUserForGift(user);
    setIsGiftHubOpen(true);
  };

  const closeGiftHub = () => {
    setIsGiftHubOpen(false);
    setTargetUserForGift(null);
  };

  const isPostLiked = (postId: string) => likedPostIds.has(postId);
  const isPostUnliked = (postId: string) => unlikedPostIds.has(postId);
  const isPostSaved = (postId: string) => savedPostIds.has(postId);
  const isPostUnlocked = (postId: string) => unlockedPostIds.has(postId);
  const isFollowing = (username: string) => followingUsernames.has(username);
  const isSubscribed = (username: string) => activeSubscriptions.has(username);

  const voteOnStoryPoll = (storyId: string, segmentId: string, optionIndex: number) => {
    setStories(prev => prev.map(story => {
      if (story.id !== storyId) return story;
      return {
        ...story,
        segments: story.segments.map(segment => {
          if (segment.id !== segmentId || !segment.poll) return segment;
          const newOptions = [...segment.poll.options];
          newOptions[optionIndex] = { ...newOptions[optionIndex], votes: newOptions[optionIndex].votes + 1 };
          return { ...segment, poll: { ...segment.poll, options: newOptions } };
        })
      };
    }));
  };

  const toggleMuteUser = (username: string) => {
    setMutedUserNames(prev => prev.includes(username) ? prev.filter(u => u !== username) : [...prev, username]);
  };

  const togglePinPost = (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isPinned: !p.isPinned } : p));
  };

  const archivePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
  };

  const setSearchOpen = (open: boolean) => {
    triggerHaptic(5);
    setIsSearchOpen(open);
  };

  const createCluster = (name: string, members: Connection[]) => {
    triggerHaptic(50);
    const newCluster: Cluster = {
      id: `cluster-${Date.now()}`,
      name,
      members,
      adminUsername: currentUser.username,
      isGroup: true,
      lastMessage: "Cluster materialized.",
      lastTime: "Just now",
      lastInteraction: Date.now()
    };
    setClusters(prev => [newCluster, ...prev].slice(0, 20)); // Limit clusters
  };

  const addMemberToCluster = (clusterId: string, member: Connection) => {
    triggerHaptic(20);
    setClusters(prev => prev.map(c => {
      if (c.id === clusterId) {
        if (c.members.some(m => m.username === member.username)) return c;
        return {
          ...c,
          members: [...c.members, member],
          lastMessage: `@${member.username} joined the cluster.`,
          lastTime: "Just now",
          lastInteraction: Date.now()
        };
      }
      return c;
    }));
  };

  const leaveCluster = (clusterId: string) => {
    triggerHaptic(30);
    setClusters(prev => prev.filter(c => c.id !== clusterId));
    if (selectedChatId === clusterId) setSelectedChatId(null);
  };

  const initiateCall = (contact: Connection, type: CallType) => {
    triggerHaptic(30);
    setCallState({
      type,
      status: 'outgoing',
      contact
    });
  };

  const receiveCall = (contact: Connection, type: CallType) => {
    triggerHaptic(50);
    setCallState({
      type,
      status: 'incoming',
      contact
    });
  };

  const acceptCall = () => {
    triggerHaptic(20);
    setCallState(prev => ({
      ...prev,
      status: 'active',
      startTime: Date.now()
    }));
  };

  const endCall = () => {
    triggerHaptic(100);
    setCallState({
      type: 'video',
      status: 'idle',
      contact: null
    });
  };

  return (
    <PostContext.Provider value={{ 
      currentUser: finalCurrentUser,
      posts, 
      stories, 
      highlights, 
      mutedUserNames,
      likedPostIds,
      unlikedPostIds,
      savedPostIds,
      unlockedPostIds,
      activeSubscriptions,
      followingUsernames,
      activeStoryIndex, 
      connections,
      clusters,
      selectedChatId,
      selectedPostId,
      activeCommentPostId,
      selectedImageUrl,
      isSearchOpen,
      isGiftHubOpen,
      targetUserForGift,
      pendingTransaction,
      withdrawalHistory,
      referralLink,
      settings,
      callState,
      setSearchOpen,
      setSelectedChatId,
      setSelectedPostId,
      setSelectedImageUrl,
      openCommentHub,
      closeCommentHub,
      openGiftHub,
      closeGiftHub,
      setActiveStoryIndex, 
      addPost, 
      deletePost,
      addStory, 
      addComment,
      addReply,
      incrementShareCount,
      voteOnStoryPoll,
      toggleMuteUser,
      togglePinPost,
      archivePost,
      updateCurrentUser,
      updateSettings,
      toggleLikePost,
      toggleUnlikePost,
      toggleSavePost,
      toggleFollowUser,
      initiateTransaction,
      cancelTransaction,
      recordWithdrawal,
      triggerReferralPulse,
      verifyUser,
      processGiftTransaction,
      unlockPost,
      subscribeToCreator,
      cancelSubscription,
      isPostLiked,
      isPostUnliked,
      isPostSaved,
      isPostUnlocked,
      isFollowing,
      isSubscribed,
      triggerHaptic,
      createCluster,
      addMemberToCluster,
      leaveCluster,
      initiateCall,
      receiveCall,
      acceptCall,
      endCall
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
