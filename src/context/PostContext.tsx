'use client';

import { createContext, useContext, useState, startTransition, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  account, databases, storage, ID, Query, Models,
  COL, BUCKET, DATABASE_ID,
  getFileUrl, extractFileId, formatTimeAgo, avatarFallback,
} from '@/lib/appwrite';

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
  defaultStream: 'foryou';
  goldRate: number;
  diamondRate: number;
  ldMultiplier: number;
  isMusicEnabled: boolean;
  isGiftingEnabled: boolean;
  isAiVerificationActive: boolean;
  isSensitivityFilterActive: boolean;
  isFreeMode: boolean;
}

export interface User {
  $id: string;
  name: string;
  username: string;
  vimoreId?: string;
  phone?: string;
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
  introUrl?: string;
}

export interface StorySegment {
  $id: string;
  type: 'image' | 'video' | 'text';
  mediaUrl?: string;
  text?: string;
  duration?: number;
  overlays?: any[];
  poll?: { options: string[]; votes: number[] };
  orderIndex?: number;
}

export interface Post {
  $id: string;
  $createdAt?: string;
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
  imageFilter?: string;
  feeling?: string;
  location?: string;
  commentsDisabled?: boolean;
  poll?: any;
  isLocked?: boolean;
  unlockPrice?: number;
  isBoosted?: boolean;
  boostTargetViews?: number;
  boostCurrentViews?: number;
  boostExpiry?: number;
  commentNodes?: PostComment[];
  sharedPost?: Post;
  type?: string;
  timestamp?: string | number;
  mediaUrls?: string[];
  isPinned?: boolean;
}

export interface PostComment {
  $id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  time: string;
  parentId?: string;
  timestamp: number;
}

export interface Cluster {
  $id: string;
  name: string;
  adminUsername: string;
  avatar?: string;
  cover?: string;
  isAddLocked?: boolean;
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
  $id: string;
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
  $id?: string;
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
  login: (identifier: string, p: string) => Promise<{ success: boolean; message?: string; requiresVerification?: boolean }>;
  signup: (d: any) => Promise<{ success: boolean; message?: string; requiresVerification?: boolean }>;
  logout: () => Promise<void>;
  resetPassword: (userId: string, secret: string, password: string) => Promise<void>;
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
  toggleFollowUser: (username: string) => Promise<void>;
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
  viewedPostIds: Set<string>;
  createCluster: (name: string, members: any[]) => Promise<void>;
  addMemberToCluster: (clusterId: string, member: any) => Promise<void>;
  leaveCluster: (clusterId: string) => Promise<void>;
  updateCluster: (clusterId: string, updates: { name?: string; cover?: string; isAddLocked?: boolean }) => Promise<void>;
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
  submitTicket: (data: { subject: string; message: string; category: string; priority?: string }) => Promise<void>;
  sendChatMessage: (recipientId: string, message: Partial<ChatMessage>) => Promise<void>;
  purgeVibeCache: () => Promise<void>;
  archiveIdentityNode: () => Promise<void>;
  boostNode: (nodeId: string, promisedViews: number, duration: number, cost: number, currency: 'DIAMOND' | 'STAR', type: 'POST' | 'SONIC') => Promise<void>;
  enrollHardwareBiometrics: () => Promise<boolean>;
  verifyHardwareBiometrics: () => Promise<boolean>;
  blockUser: (username: string) => Promise<void>;
  unblockUser: (username: string) => Promise<void>;
  blockedUsernames: string[];
  submitReport: (data: { reportedUsername: string; reason: string; details: string }) => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const INITIAL_SETTINGS: AppSettings = {
  theme: 'light', hapticIntensity: 50, isGhostMode: false, playbackQuality: 'standard',
  fontScale: 1, isAutoFollowEnabled: true, activeSoundSet: 'cyberpunk', isBiometricActive: false,
  isHardwareEnrolled: false, taggingPrivacy: 'everyone', discoveryVisibility: 'everyone',
  showReadReceipts: true, legacyContact: null, isSilenceActive: false, silenceStart: "22:00",
  silenceEnd: "07:00", defaultStream: 'foryou', goldRate: 0.01, diamondRate: 0.25,
  ldMultiplier: 190, isMusicEnabled: true, isGiftingEnabled: true,
  isAiVerificationActive: true, isSensitivityFilterActive: false, isFreeMode: false,
};

const OFFICIAL_GATEWAY = {
  orangeName: "Amos Kortu",
  orangeNumber: "+231778451835",
  mtnName: "Amos Kortu",
  mtnNumber: "+231889322188",
};

function mapDocToUser(authUser: Models.User<Models.Preferences>, doc: Models.Document): User {
  return {
    $id: authUser.$id,
    name: doc.name || authUser.name,
    username: doc.username || '',
    vimoreId: authUser.email,
    phone: doc.phone || undefined,
    avatar: doc.avatar_id ? getFileUrl(BUCKET.AVATARS, doc.avatar_id) : avatarFallback(doc.name || authUser.name),
    cover: doc.cover_id ? getFileUrl(BUCKET.COVERS, doc.cover_id) : undefined,
    isVerified: doc.is_verified || false,
    isEmailVerified: authUser.emailVerification,
    followers: doc.followers_count || 0,
    following: doc.following_count || 0,
    friendsCount: doc.friends_count || 0,
    posts: doc.posts_count || 0,
    bio: doc.bio || '',
    category: doc.category || '',
    gender: doc.gender as 'Male' | 'Female' | undefined,
    nationality: doc.nationality || '',
    dateOfBirth: doc.date_of_birth || '',
    goldBalance: doc.gold_balance || 0,
    diamondBalance: doc.diamond_balance || 0,
    starBalance: doc.star_balance || 0,
    referralCount: doc.referral_count || 0,
    role: (doc.role as 'SUPER' | 'FINANCIAL' | 'MODERATOR' | 'USER') || 'USER',
    joinDate: doc.join_date || authUser.$createdAt,
    hasEverBeenVerified: doc.has_ever_been_verified || false,
    language: doc.language || '',
  };
}

function mapProfileDocToUser(doc: Models.Document): User {
  return {
    $id: doc.$id,
    name: doc.name || '',
    username: doc.username || '',
    vimoreId: doc.email || '',
    avatar: doc.avatar_id ? getFileUrl(BUCKET.AVATARS, doc.avatar_id) : avatarFallback(doc.name || 'U'),
    cover: doc.cover_id ? getFileUrl(BUCKET.COVERS, doc.cover_id) : undefined,
    isVerified: doc.is_verified || false,
    followers: doc.followers_count || 0,
    following: doc.following_count || 0,
    friendsCount: doc.friends_count || 0,
    posts: doc.posts_count || 0,
    bio: doc.bio || '',
    category: doc.category || '',
    gender: doc.gender as 'Male' | 'Female' | undefined,
    nationality: doc.nationality || '',
    dateOfBirth: doc.date_of_birth || '',
    goldBalance: doc.gold_balance || 0,
    diamondBalance: doc.diamond_balance || 0,
    starBalance: doc.star_balance || 0,
    referralCount: doc.referral_count || 0,
    role: (doc.role as 'SUPER' | 'FINANCIAL' | 'MODERATOR' | 'USER') || 'USER',
    joinDate: doc.join_date || doc.$createdAt,
    hasEverBeenVerified: doc.has_ever_been_verified || false,
    language: doc.language || '',
  };
}

function mapDocToPost(doc: Models.Document, authorDoc?: Models.Document): Post {
  const mediaIds: string[] = doc.media_ids || [];
  const images = mediaIds.map((id: string) => getFileUrl(BUCKET.POST_MEDIA, id));
  const videoId = doc.video_id;

  const author: User = authorDoc ? {
    $id: doc.author_id,
    name: authorDoc.name || 'Unknown',
    username: authorDoc.username || 'unknown',
    avatar: authorDoc.avatar_id ? getFileUrl(BUCKET.AVATARS, authorDoc.avatar_id) : avatarFallback(authorDoc.name || 'U'),
    isVerified: authorDoc.is_verified || false,
  } : {
    $id: doc.author_id,
    name: 'Unknown',
    username: 'unknown',
    avatar: avatarFallback('U'),
    isVerified: false,
  };

  let poll = undefined;
  if (doc.poll) {
    try { poll = typeof doc.poll === 'string' ? JSON.parse(doc.poll) : doc.poll; } catch { /* ignore */ }
  }

  return {
    $id: doc.$id,
    $createdAt: doc.$createdAt,
    user: author,
    content: doc.content || '',
    time: formatTimeAgo(doc.$createdAt),
    likes: doc.likes_count || 0,
    unlikes: doc.unlikes_count || 0,
    comments: doc.comments_count || 0,
    shares: doc.shares_count || 0,
    views: doc.views_count || 0,
    image: images[0],
    images: images.length > 0 ? images : undefined,
    videoUrl: videoId ? getFileUrl(BUCKET.POST_MEDIA, videoId) : undefined,
    theme: doc.theme,
    imageFilter: doc.image_filter,
    feeling: doc.feeling,
    location: doc.location,
    commentsDisabled: doc.comments_disabled || false,
    isLocked: doc.is_locked || false,
    unlockPrice: doc.unlock_price,
    isBoosted: doc.is_boosted || false,
    boostTargetViews: doc.boost_target_views,
    boostCurrentViews: doc.boost_current_views || 0,
    poll,
  };
}

function mapDocToComment(doc: Models.Document): PostComment {
  return {
    $id: doc.$id,
    userId: doc.user_id,
    userName: doc.user_name || 'Unknown',
    userAvatar: doc.user_avatar ? doc.user_avatar : avatarFallback(doc.user_name || 'U'),
    text: doc.content || '',
    time: formatTimeAgo(doc.$createdAt),
    timestamp: new Date(doc.$createdAt).getTime(),
    parentId: doc.parent_id || undefined,
  };
}

export function PostProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const router = useRouter();

  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [posts, setPostsState] = useState<Post[]>([]);
  const [activeComments, setActiveComments] = useState<PostComment[]>([]);
  const [isLoading, setIsLoadingState] = useState(true);
  const [initError] = useState<string | null>(null);
  const [settings, setSettingsState] = useState<AppSettings>(INITIAL_SETTINGS);

  const [clusters, setClustersState] = useState<Cluster[]>([]);
  const [connections, setConnectionsState] = useState<Connection[]>([]);
  const [stories, setStoriesState] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [campaigns, setCampaignsState] = useState<any[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<any[]>([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [blockedUsernames, setBlockedUsernames] = useState<string[]>([]);

  const [likedPostIds, setLikedPostIdsState] = useState<Set<string>>(new Set());
  const [unlikedPostIds, setUnlikedPostIdsState] = useState<Set<string>>(new Set());
  const [viewedPostIds, setViewedPostIdsState] = useState<Set<string>>(new Set());
  const [savedPostIds, setSavedPostIdsState] = useState<Set<string>>(new Set());
  const [unlockedPostIds, setUnlockedPostIdsState] = useState<Set<string>>(new Set());
  const [seenPostIds, setSeenPostIdsState] = useState<Set<string>>(new Set());

  const [followingUsernames, setFollowingUsernamesState] = useState<Set<string>>(new Set());
  const [followerUsernames, setFollowerUsernamesState] = useState<Set<string>>(new Set());
  const [friendUsernames, setFriendUsernamesState] = useState<Set<string>>(new Set());
  const [sentRequestUsernames, setSentRequestUsernamesState] = useState<Set<string>>(new Set());
  const [receivedRequestUsernames, setReceivedRequestUsernamesState] = useState<Set<string>>(new Set());
  const [acceptedStrangerUsernames] = useState<Set<string>>(new Set());
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

  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate && settings.hapticIntensity > 0) {
      window.navigator.vibrate((intensity * settings.hapticIntensity) / 50);
    }
  }, [settings.hapticIntensity]);

  const loadFeed = useCallback(async () => {
    try {
      const postsResult = await databases.listDocuments(DATABASE_ID, COL.POSTS, [
        Query.orderDesc('$createdAt'),
        Query.limit(25),
      ]);

      const authorIds = [...new Set(postsResult.documents.map((p: any) => p.author_id).filter(Boolean))];
      let authorsMap: Record<string, any> = {};

      if (authorIds.length > 0) {
        try {
          const authorsResult = await databases.listDocuments(DATABASE_ID, COL.USERS, [
            Query.equal('$id', authorIds),
          ]);
          authorsMap = Object.fromEntries(authorsResult.documents.map((u: any) => [u.$id, u]));
        } catch { /* ignore */ }
      }

      const mapped = postsResult.documents.map((doc: any) => mapDocToPost(doc, authorsMap[doc.author_id]));
      setPostsState(mapped);
    } catch (err) {
      console.error('loadFeed error:', err);
    }
  }, []);

  const loadSocialGraph = useCallback(async (userId: string) => {
    try {
      const [
        followingResult,
        followersResult,
        sentResult,
        receivedResult,
        acceptedSentResult,
        acceptedReceivedResult,
        likesResult,
        bookmarksResult,
        unlocksResult,
        subscriptionsResult,
        blockedUsersResult,
      ] = await Promise.allSettled([
        databases.listDocuments(DATABASE_ID, COL.FOLLOWS, [Query.equal('follower_id', userId), Query.limit(500)]),
        databases.listDocuments(DATABASE_ID, COL.FOLLOWS, [Query.equal('following_id', userId), Query.limit(500)]),
        databases.listDocuments(DATABASE_ID, COL.FRIEND_REQUESTS, [Query.equal('sender_id', userId), Query.equal('status', 'PENDING'), Query.limit(500)]),
        databases.listDocuments(DATABASE_ID, COL.FRIEND_REQUESTS, [Query.equal('receiver_id', userId), Query.equal('status', 'PENDING'), Query.limit(500)]),
        databases.listDocuments(DATABASE_ID, COL.FRIEND_REQUESTS, [Query.equal('sender_id', userId), Query.equal('status', 'ACCEPTED'), Query.limit(500)]),
        databases.listDocuments(DATABASE_ID, COL.FRIEND_REQUESTS, [Query.equal('receiver_id', userId), Query.equal('status', 'ACCEPTED'), Query.limit(500)]),
        databases.listDocuments(DATABASE_ID, COL.POST_REACTIONS, [Query.equal('user_id', userId), Query.equal('reaction_type', 'LIKE'), Query.limit(500)]),
        databases.listDocuments(DATABASE_ID, COL.BOOKMARKS, [Query.equal('user_id', userId), Query.limit(500)]),
        databases.listDocuments(DATABASE_ID, COL.POST_UNLOCKS, [Query.equal('user_id', userId), Query.limit(500)]),
        databases.listDocuments(DATABASE_ID, COL.SUBSCRIPTIONS, [Query.equal('subscriber_id', userId), Query.equal('is_active', true), Query.limit(500)]),
        databases.listDocuments(DATABASE_ID, COL.BLOCKED_USERS, [Query.equal('blocker_id', userId), Query.limit(200)]),
      ]);

      if (followingResult.status === 'fulfilled') {
        setFollowingUsernamesState(new Set(followingResult.value.documents.map((f: any) => f.following_username).filter(Boolean)));
      }
      if (followersResult.status === 'fulfilled') {
        setFollowerUsernamesState(new Set(followersResult.value.documents.map((f: any) => f.follower_username).filter(Boolean)));
      }
      if (sentResult.status === 'fulfilled') {
        setSentRequestUsernamesState(new Set(sentResult.value.documents.map((r: any) => r.receiver_username).filter(Boolean)));
      }
      if (receivedResult.status === 'fulfilled') {
        setReceivedRequestUsernamesState(new Set(receivedResult.value.documents.map((r: any) => r.sender_username).filter(Boolean)));
      }
      const friendNames = new Set<string>();
      if (acceptedSentResult.status === 'fulfilled') {
        acceptedSentResult.value.documents.forEach((r: any) => r.receiver_username && friendNames.add(r.receiver_username));
      }
      if (acceptedReceivedResult.status === 'fulfilled') {
        acceptedReceivedResult.value.documents.forEach((r: any) => r.sender_username && friendNames.add(r.sender_username));
      }
      setFriendUsernamesState(friendNames);

      if (likesResult.status === 'fulfilled') {
        setLikedPostIdsState(new Set(likesResult.value.documents.map((r: any) => r.post_id).filter(Boolean)));
      }
      if (bookmarksResult.status === 'fulfilled') {
        setSavedPostIdsState(new Set(bookmarksResult.value.documents.map((b: any) => b.post_id).filter(Boolean)));
      }
      if (unlocksResult.status === 'fulfilled') {
        setUnlockedPostIdsState(new Set(unlocksResult.value.documents.map((u: any) => u.post_id).filter(Boolean)));
      }
      if (subscriptionsResult.status === 'fulfilled') {
        setActiveSubscriptionsState(new Set(subscriptionsResult.value.documents.map((s: any) => s.creator_username).filter(Boolean)));
      }
      if (blockedUsersResult.status === 'fulfilled') {
        setBlockedUsernames(blockedUsersResult.value.documents.map((b: any) => b.blocked_username).filter(Boolean));
      }
    } catch (err) {
      console.error('loadSocialGraph error:', err);
    }
  }, []);

  const loadConnections = useCallback(async (userId: string) => {
    try {
      const followsResult = await databases.listDocuments(DATABASE_ID, COL.FOLLOWS, [
        Query.equal('follower_id', userId),
        Query.limit(100),
      ]);
      if (followsResult.documents.length === 0) { setConnectionsState([]); return; }

      const followingIds = followsResult.documents.map((f: any) => f.following_id).filter(Boolean);
      const usersResult = await databases.listDocuments(DATABASE_ID, COL.USERS, [Query.equal('$id', followingIds)]);

      const conns: Connection[] = usersResult.documents.map((u: any) => ({
        $id: u.$id,
        name: u.name || '',
        username: u.username || '',
        email: u.email || '',
        avatar: u.avatar_id ? getFileUrl(BUCKET.AVATARS, u.avatar_id) : avatarFallback(u.name || 'U'),
        cover: u.cover_id ? getFileUrl(BUCKET.COVERS, u.cover_id) : undefined,
        isVerified: u.is_verified || false,
        isGroup: false as const,
        isOnline: false,
        followsYou: false,
      }));
      setConnectionsState(conns);
    } catch { /* ignore */ }
  }, []);

  const loadStories = useCallback(async () => {
    try {
      const now = new Date().toISOString();
      const storiesResult = await databases.listDocuments(DATABASE_ID, COL.STORIES, [
        Query.greaterThan('expiry', now),
        Query.orderDesc('$createdAt'),
        Query.limit(30),
      ]);

      const authorIds = [...new Set(storiesResult.documents.map((s: any) => s.author_id).filter(Boolean))];
      let authorsMap: Record<string, any> = {};
      if (authorIds.length > 0) {
        try {
          const ar = await databases.listDocuments(DATABASE_ID, COL.USERS, [Query.equal('$id', authorIds)]);
          authorsMap = Object.fromEntries(ar.documents.map((u: any) => [u.$id, u]));
        } catch { /* ignore */ }
      }

      const storyIds = storiesResult.documents.map((s: any) => s.$id);
      let segmentsMap: Record<string, Models.Document[]> = {};
      if (storyIds.length > 0) {
        try {
          const segsResult = await databases.listDocuments(DATABASE_ID, COL.STORY_SEGMENTS, [
            Query.equal('story_id', storyIds),
            Query.orderAsc('order'),
            Query.limit(200),
          ]);
          segsResult.documents.forEach((seg: any) => {
            if (!segmentsMap[seg.story_id]) segmentsMap[seg.story_id] = [];
            segmentsMap[seg.story_id].push(seg);
          });
        } catch { /* ignore */ }
      }

      const mapped = storiesResult.documents.map((doc: any) => {
        const authorDoc = authorsMap[doc.author_id];
        const segments = (segmentsMap[doc.$id] || []).map(seg => ({
          $id: seg.$id,
          type: seg.type || 'image',
          mediaUrl: seg.media_id ? getFileUrl(BUCKET.STORY_MEDIA, seg.media_id) : undefined,
          text: seg.text,
          duration: seg.duration || 5,
        }));
        return {
          $id: doc.$id,
          user: authorDoc ? mapProfileDocToUser(authorDoc) : { $id: doc.author_id, name: 'Unknown', username: 'unknown', avatar: avatarFallback('U'), isVerified: false },
          segments,
          expiry: doc.expiry,
          viewCount: doc.view_count || 0,
        };
      });
      setStoriesState(mapped);
    } catch (err) {
      console.error('loadStories error:', err);
    }
  }, []);

  const loadClusters = useCallback(async (userId: string) => {
    try {
      const membershipsResult = await databases.listDocuments(DATABASE_ID, COL.CLUSTER_MEMBERS, [
        Query.equal('user_id', userId),
        Query.limit(50),
      ]);
      if (membershipsResult.documents.length === 0) { setClustersState([]); return; }

      const clusterIds = membershipsResult.documents.map((m: any) => m.cluster_id).filter(Boolean);
      const clustersResult = await databases.listDocuments(DATABASE_ID, COL.CLUSTERS, [
        Query.equal('$id', clusterIds),
      ]);

      const allMembersResult = await databases.listDocuments(DATABASE_ID, COL.CLUSTER_MEMBERS, [
        Query.equal('cluster_id', clusterIds),
        Query.limit(500),
      ]);

      const memberUserIds = [...new Set(allMembersResult.documents.map(m => m.user_id).filter(Boolean))];
      let memberUsersMap: Record<string, Models.Document> = {};
      if (memberUserIds.length > 0) {
        try {
          const ur = await databases.listDocuments(DATABASE_ID, COL.USERS, [Query.equal('$id', memberUserIds)]);
          memberUsersMap = Object.fromEntries(ur.documents.map(u => [u.$id, u]));
        } catch { /* ignore */ }
      }

      const mapped: Cluster[] = clustersResult.documents.map(cl => {
        const clMembers = allMembersResult.documents.filter(m => m.cluster_id === cl.$id);
        const members: User[] = clMembers.map(m => {
          const uDoc = memberUsersMap[m.user_id];
          return uDoc ? mapProfileDocToUser(uDoc) : {
            $id: m.user_id, name: m.username || 'Unknown', username: m.username || 'unknown',
            avatar: avatarFallback(m.username || 'U'), isVerified: false,
          };
        });
        return {
          $id: cl.$id,
          name: cl.name,
          adminUsername: cl.admin_username || '',
          avatar: cl.avatar_id ? getFileUrl(BUCKET.AVATARS, cl.avatar_id) : undefined,
          cover: cl.cover_id ? getFileUrl(BUCKET.COVERS, cl.cover_id) : undefined,
          isAddLocked: cl.is_add_locked || false,
          members,
          isGroup: true as const,
        };
      });
      setClustersState(mapped);
    } catch { /* ignore */ }
  }, []);

  const loadChatMessages = useCallback(async (userId: string, otherId: string) => {
    try {
      const [sent, received] = await Promise.all([
        databases.listDocuments(DATABASE_ID, COL.MESSAGES, [
          Query.equal('sender_id', userId),
          Query.equal('receiver_id', otherId),
          Query.orderAsc('$createdAt'),
          Query.limit(100),
        ]),
        databases.listDocuments(DATABASE_ID, COL.MESSAGES, [
          Query.equal('sender_id', otherId),
          Query.equal('receiver_id', userId),
          Query.orderAsc('$createdAt'),
          Query.limit(100),
        ]),
      ]);

      const all = [...sent.documents, ...received.documents]
        .sort((a, b) => new Date(a.$createdAt).getTime() - new Date(b.$createdAt).getTime());

      const msgs: ChatMessage[] = all.map(doc => ({
        $id: doc.$id,
        sender: doc.sender_id === userId ? 'me' : 'them',
        senderId: doc.sender_id,
        text: doc.content,
        time: formatTimeAgo(doc.$createdAt),
        status: doc.is_read ? 'read' : 'delivered',
        type: (doc.type || 'text') as ChatMessage['type'],
        mediaUrl: doc.media_id ? getFileUrl(BUCKET.MESSAGE_MEDIA, doc.media_id) : undefined,
        isViewOnce: doc.is_view_once || false,
        isViewed: doc.is_viewed || false,
      }));

      setChatMessages(prev => ({ ...prev, [otherId]: msgs }));
    } catch { /* ignore */ }
  }, []);

  const checkSession = useCallback(async () => {
    setIsLoadingState(true);
    try {
      const authUser = await account.get();
      const profileDoc = await databases.getDocument(DATABASE_ID, COL.USERS, authUser.$id);
      const user = mapDocToUser(authUser, profileDoc);
      setCurrentUserState(user);

      if (authUser.emailVerification) {
        await Promise.allSettled([
          loadFeed(),
          loadSocialGraph(authUser.$id),
          loadConnections(authUser.$id),
          loadStories(),
          loadClusters(authUser.$id),
        ]);
      }
    } catch {
      setCurrentUserState(null);
    } finally {
      setIsLoadingState(false);
    }
  }, [loadFeed, loadSocialGraph, loadConnections, loadStories, loadClusters]);

  useEffect(() => { checkSession(); }, [checkSession]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const credId = localStorage.getItem('vimore_biometric_cred_id');
    if (credId) {
      setSettingsState(prev => ({ ...prev, isHardwareEnrolled: true }));
    }
  }, []);

  useEffect(() => {
    if (selectedChatId && currentUser) {
      loadChatMessages(currentUser.$id, selectedChatId);
    }
  }, [selectedChatId, currentUser, loadChatMessages]);

  const login = useCallback(async (identifier: string, password: string) => {
    setIsLoadingState(true);
    const vimoreId = identifier.includes('@') ? identifier : `${identifier}@vimore.cfd`;
    try {
      let authUser;
      try {
        authUser = await account.get();
      } catch {
        authUser = null;
      }
      if (!authUser) {
        await account.createEmailPasswordSession(vimoreId, password);
        authUser = await account.get();
      }
      const profileDoc = await databases.getDocument(DATABASE_ID, COL.USERS, authUser.$id);
      const user = mapDocToUser(authUser, profileDoc);
      setCurrentUserState(user);

      await Promise.allSettled([
        loadFeed(),
        loadSocialGraph(authUser.$id),
        loadConnections(authUser.$id),
        loadStories(),
        loadClusters(authUser.$id),
      ]);
      setIsLoadingState(false);
      toast({ title: "Welcome back!", description: "You are now signed in." });
      return { success: true };
    } catch (err: any) {
      setIsLoadingState(false);
      const msg = err?.message || 'Invalid credentials. Please try again.';
      return { success: false, message: msg };
    }
  }, [toast, loadFeed, loadSocialGraph, loadConnections, loadStories, loadClusters]);

  const signup = useCallback(async (data: any) => {
    setIsLoadingState(true);
    try {
      const vimoreId = data.vimoreId.includes('@') ? data.vimoreId : `${data.vimoreId}@vimore.cfd`;
      const authUser = await account.create(ID.unique(), vimoreId, data.password, data.name);
      await account.createEmailPasswordSession(vimoreId, data.password);

      const parts = data.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);
      const username = parts.length >= 2 ? `${parts[0]}.${parts[parts.length - 1]}` : parts[0] || 'user';
      const referralCode = `VM${username.toUpperCase().slice(0, 6)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

      const existingUsers = await databases.listDocuments(DATABASE_ID, COL.USERS, [Query.limit(1)]);
      const assignedRole = existingUsers.total === 0 ? 'SUPER' : 'USER';

      await databases.createDocument(DATABASE_ID, COL.USERS, authUser.$id, {
        name: data.name,
        username,
        email: vimoreId,
        bio: '',
        category: '',
        is_verified: false,
        has_ever_been_verified: false,
        followers_count: 0,
        following_count: 0,
        friends_count: 0,
        posts_count: 0,
        gold_balance: 0,
        diamond_balance: 0,
        star_balance: 0,
        role: assignedRole,
        join_date: new Date().toISOString(),
        nationality: data.nationality || '',
        date_of_birth: data.dob || '',
        referral_code: referralCode,
        referral_count: 0,
        language: 'en',
        security_question: data.securityQuestion || '',
        security_answer: (data.securityAnswer || '').toLowerCase().trim(),
      });

      setIsLoadingState(false);
      return { success: true };
    } catch (err: any) {
      setIsLoadingState(false);
      const msg = err?.message || 'Signup failed. Please try again.';
      return { success: false, message: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await account.deleteSession('current'); } catch { /* ignore */ }
    setCurrentUserState(null);
    setPostsState([]);
    setStoriesState([]);
    setConnectionsState([]);
    setClustersState([]);
    setChatMessages({});
    setLikedPostIdsState(new Set());
    setUnlikedPostIdsState(new Set());
    setSavedPostIdsState(new Set());
    setUnlockedPostIdsState(new Set());
    setFollowingUsernamesState(new Set());
    setFollowerUsernamesState(new Set());
    setFriendUsernamesState(new Set());
    setSentRequestUsernamesState(new Set());
    setReceivedRequestUsernamesState(new Set());
    setActiveSubscriptionsState(new Set());
    toast({ title: "Signed out", description: "See you next time!" });
    router.push("/login");
  }, [router, toast]);

  const uploadMedia = useCallback(async (file: File, bucketId: string = BUCKET.POST_MEDIA): Promise<string> => {
    const result = await storage.createFile(bucketId, ID.unique(), file);
    return getFileUrl(bucketId, result.$id);
  }, []);

  const updateCurrentUser = useCallback(async (data: Partial<User>) => {
    if (!currentUser) return;
    const updateData: Record<string, any> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.nationality !== undefined) updateData.nationality = data.nationality;
    if (data.dateOfBirth !== undefined) updateData.date_of_birth = data.dateOfBirth;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.phone !== undefined) updateData.phone = data.phone;

    if (data.avatar !== undefined) {
      const fileId = extractFileId(data.avatar);
      if (fileId) updateData.avatar_id = fileId;
    }
    if (data.cover !== undefined) {
      const fileId = extractFileId(data.cover);
      if (fileId) updateData.cover_id = fileId;
    }

    if (Object.keys(updateData).length > 0) {
      await databases.updateDocument(DATABASE_ID, COL.USERS, currentUser.$id, updateData);
    }
    setCurrentUserState(prev => prev ? { ...prev, ...data } : null);
    toast({ title: "Profile updated" });
  }, [currentUser, toast]);

  const updateSettings = (data: Partial<AppSettings>) => {
    setSettingsState(prev => ({ ...prev, ...data }));
  };

  const refreshFeed = useCallback(async () => { await loadFeed(); }, [loadFeed]);
  const refreshStories = useCallback(async () => { if (currentUser) await loadStories(); }, [currentUser, loadStories]);

  const refreshAdminData = useCallback(async () => {
    try {
      const [reportsRes, ticketsRes, campaignsRes, payReqRes, wdRes, logsRes, staffRes] = await Promise.allSettled([
        databases.listDocuments(DATABASE_ID, COL.REPORTS, [Query.orderDesc('$createdAt'), Query.limit(100)]),
        databases.listDocuments(DATABASE_ID, COL.SUPPORT_TICKETS, [Query.orderDesc('$createdAt'), Query.limit(100)]),
        databases.listDocuments(DATABASE_ID, COL.AD_CAMPAIGNS, [Query.orderDesc('$createdAt'), Query.limit(100)]),
        databases.listDocuments(DATABASE_ID, COL.PAYMENT_REQUESTS, [Query.orderDesc('$createdAt'), Query.limit(100)]),
        databases.listDocuments(DATABASE_ID, COL.WITHDRAWAL_REQUESTS, [Query.orderDesc('$createdAt'), Query.limit(100)]),
        databases.listDocuments(DATABASE_ID, COL.AUDIT_LOGS, [Query.orderDesc('$createdAt'), Query.limit(100)]),
        databases.listDocuments(DATABASE_ID, COL.USERS, [Query.notEqual('role', 'USER'), Query.limit(50)]),
      ]);

      if (reportsRes.status === 'fulfilled') setReports(reportsRes.value.documents);
      if (ticketsRes.status === 'fulfilled') setTickets(ticketsRes.value.documents);
      if (campaignsRes.status === 'fulfilled') setCampaignsState(campaignsRes.value.documents);
      if (payReqRes.status === 'fulfilled') setPaymentRequests(payReqRes.value.documents);
      if (wdRes.status === 'fulfilled') setWithdrawalHistory(wdRes.value.documents);
      if (logsRes.status === 'fulfilled') setAuditLogs(logsRes.value.documents);
      if (staffRes.status === 'fulfilled') setStaff(staffRes.value.documents.map(mapProfileDocToUser));
    } catch (err) {
      console.error('refreshAdminData error:', err);
    }
  }, []);

  const addPost = async (p: any) => {
    if (!currentUser) return;

    const mediaIds: string[] = [];
    let videoId: string | undefined;

    if (p.images && Array.isArray(p.images)) {
      p.images.forEach((url: string) => {
        const fid = extractFileId(url);
        if (fid) mediaIds.push(fid);
      });
    } else if (p.image) {
      const fid = extractFileId(p.image);
      if (fid) mediaIds.push(fid);
    }
    if (p.videoUrl) {
      videoId = extractFileId(p.videoUrl) || undefined;
    }

    const docData: Record<string, any> = {
      author_id: currentUser.$id,
      content: p.content || '',
      media_ids: mediaIds,
      likes_count: 0,
      unlikes_count: 0,
      comments_count: 0,
      shares_count: 0,
      views_count: 0,
      is_locked: p.isLocked || false,
      is_boosted: false,
      boost_current_views: 0,
      comments_disabled: p.commentsDisabled || false,
      visibility: 'public',
    };

    if (videoId) docData.video_id = videoId;
    if (p.theme) docData.theme = p.theme;
    if (p.imageFilter) docData.image_filter = p.imageFilter;
    if (p.feeling) docData.feeling = p.feeling;
    if (p.location) docData.location = p.location;
    if (p.unlockPrice) docData.unlock_price = p.unlockPrice;
    if (p.poll) docData.poll = JSON.stringify(p.poll);

    try {
      const doc = await databases.createDocument(DATABASE_ID, COL.POSTS, ID.unique(), docData);
      const newPost = mapDocToPost(doc, undefined);
      newPost.user = currentUser;
      if (p.images && p.images.length > 0) { newPost.images = p.images; newPost.image = p.images[0]; }
      if (p.videoUrl) newPost.videoUrl = p.videoUrl;
      setPostsState(prev => [newPost, ...prev]);

      await databases.updateDocument(DATABASE_ID, COL.USERS, currentUser.$id, {
        posts_count: (currentUser.posts as number || 0) + 1,
      });
      setCurrentUserState(prev => prev ? { ...prev, posts: (prev.posts as number || 0) + 1 } : null);
      toast({ title: "Post published!" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to publish post", description: err?.message });
    }
  };

  const deletePost = async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, COL.POSTS, id);
      setPostsState(prev => prev.filter(p => p.$id !== id));
      toast({ title: "Post deleted" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to delete post", description: err?.message });
    }
  };

  const toggleLikePost = async (id: string) => {
    if (!currentUser) return;
    const wasLiked = likedPostIds.has(id);
    const wasUnliked = unlikedPostIds.has(id);

    setLikedPostIdsState(prev => { const n = new Set(prev); if (wasLiked) n.delete(id); else n.add(id); return n; });
    setUnlikedPostIdsState(prev => { const n = new Set(prev); n.delete(id); return n; });
    setPostsState(prev => prev.map(p => p.$id === id ? {
      ...p,
      likes: Math.max(0, p.likes + (wasLiked ? -1 : 1)),
      unlikes: wasUnliked ? Math.max(0, p.unlikes - 1) : p.unlikes,
    } : p));

    try {
      if (wasLiked) {
        const existing = await databases.listDocuments(DATABASE_ID, COL.POST_REACTIONS, [
          Query.equal('post_id', id), Query.equal('user_id', currentUser.$id), Query.equal('reaction_type', 'LIKE'),
        ]);
        for (const doc of existing.documents) {
          await databases.deleteDocument(DATABASE_ID, COL.POST_REACTIONS, doc.$id);
        }
        await databases.updateDocument(DATABASE_ID, COL.POSTS, id, { likes_count: Math.max(0, (posts.find(p => p.$id === id)?.likes || 1) - 1) });
      } else {
        if (wasUnliked) {
          const existing = await databases.listDocuments(DATABASE_ID, COL.POST_REACTIONS, [
            Query.equal('post_id', id), Query.equal('user_id', currentUser.$id), Query.equal('reaction_type', 'UNLIKE'),
          ]);
          for (const doc of existing.documents) {
            await databases.deleteDocument(DATABASE_ID, COL.POST_REACTIONS, doc.$id);
          }
        }
        await databases.createDocument(DATABASE_ID, COL.POST_REACTIONS, ID.unique(), {
          post_id: id, user_id: currentUser.$id, reaction_type: 'LIKE',
        });
        const post = posts.find(p => p.$id === id);
        await databases.updateDocument(DATABASE_ID, COL.POSTS, id, { likes_count: (post?.likes || 0) + (wasLiked ? 0 : 1) });
      }
    } catch { /* ignore - state already updated optimistically */ }
  };

  const toggleUnlikePost = async (id: string) => {
    if (!currentUser) return;
    const wasUnliked = unlikedPostIds.has(id);
    const wasLiked = likedPostIds.has(id);

    setUnlikedPostIdsState(prev => { const n = new Set(prev); if (wasUnliked) n.delete(id); else n.add(id); return n; });
    setLikedPostIdsState(prev => { const n = new Set(prev); n.delete(id); return n; });
    setPostsState(prev => prev.map(p => p.$id === id ? {
      ...p,
      unlikes: Math.max(0, p.unlikes + (wasUnliked ? -1 : 1)),
      likes: wasLiked ? Math.max(0, p.likes - 1) : p.likes,
    } : p));

    try {
      if (wasUnliked) {
        const existing = await databases.listDocuments(DATABASE_ID, COL.POST_REACTIONS, [
          Query.equal('post_id', id), Query.equal('user_id', currentUser.$id), Query.equal('reaction_type', 'UNLIKE'),
        ]);
        for (const doc of existing.documents) {
          await databases.deleteDocument(DATABASE_ID, COL.POST_REACTIONS, doc.$id);
        }
      } else {
        if (wasLiked) {
          const existing = await databases.listDocuments(DATABASE_ID, COL.POST_REACTIONS, [
            Query.equal('post_id', id), Query.equal('user_id', currentUser.$id), Query.equal('reaction_type', 'LIKE'),
          ]);
          for (const doc of existing.documents) {
            await databases.deleteDocument(DATABASE_ID, COL.POST_REACTIONS, doc.$id);
          }
        }
        await databases.createDocument(DATABASE_ID, COL.POST_REACTIONS, ID.unique(), {
          post_id: id, user_id: currentUser.$id, reaction_type: 'UNLIKE',
        });
      }
    } catch { /* ignore */ }
  };

  const addComment = async (postId: string, text: string) => {
    if (!currentUser) return;
    const optimistic: PostComment = {
      $id: 'c_' + Date.now(), userId: currentUser.$id, userName: currentUser.name,
      userAvatar: currentUser.avatar, text, time: 'Just now', timestamp: Date.now(),
    };
    setActiveComments(prev => [...prev, optimistic]);
    startTransition(() => {
      setPostsState(prev => prev.map(p =>
        p.$id === postId ? { ...p, comments: p.comments + 1, commentNodes: [...(p.commentNodes || []), optimistic] } : p
      ));
    });

    try {
      const doc = await databases.createDocument(DATABASE_ID, COL.POST_COMMENTS, ID.unique(), {
        post_id: postId, user_id: currentUser.$id, user_name: currentUser.name,
        user_avatar: currentUser.avatar, content: text,
      });
      const real = mapDocToComment(doc);
      setActiveComments(prev => prev.map(c => c.$id === optimistic.$id ? real : c));
      await databases.updateDocument(DATABASE_ID, COL.POSTS, postId, {
        comments_count: (posts.find(p => p.$id === postId)?.comments || 0) + 1,
      });
    } catch { /* keep optimistic */ }
  };

  const addReply = async (postId: string, parentId: string, text: string) => {
    if (!currentUser) return;
    const optimistic: PostComment = {
      $id: 'r_' + Date.now(), userId: currentUser.$id, userName: currentUser.name,
      userAvatar: currentUser.avatar, text, time: 'Just now', timestamp: Date.now(), parentId,
    };
    setActiveComments(prev => [...prev, optimistic]);
    startTransition(() => {
      setPostsState(prev => prev.map(p =>
        p.$id === postId ? { ...p, commentNodes: [...(p.commentNodes || []), optimistic] } : p
      ));
    });
    try {
      await databases.createDocument(DATABASE_ID, COL.POST_COMMENTS, ID.unique(), {
        post_id: postId, user_id: currentUser.$id, user_name: currentUser.name,
        user_avatar: currentUser.avatar, content: text, parent_id: parentId,
      });
    } catch { /* keep optimistic */ }
  };

  const addStory = async (segment: any) => {
    if (!currentUser) return;
    try {
      const expiry = new Date(Date.now() + 86400000).toISOString();
      const storyDoc = await databases.createDocument(DATABASE_ID, COL.STORIES, ID.unique(), {
        author_id: currentUser.$id,
        expiry,
        view_count: 0,
      });

      let mediaId: string | undefined;
      if (segment.mediaUrl) {
        mediaId = extractFileId(segment.mediaUrl) || undefined;
      }

      const segData: Record<string, any> = {
        story_id: storyDoc.$id,
        author_id: currentUser.$id,
        type: segment.type || 'image',
        order_index: 0,
        duration: segment.duration || 5,
      };
      if (mediaId) segData.media_id = mediaId;
      if (segment.text) segData.text = segment.text;

      await databases.createDocument(DATABASE_ID, COL.STORY_SEGMENTS, ID.unique(), segData);

      const newStory = {
        $id: storyDoc.$id,
        user: currentUser,
        segments: [{ $id: 'seg_tmp', ...segment }],
        expiry,
        viewCount: 0,
      };
      setStoriesState(prev => [newStory, ...prev]);
      toast({ title: "Story posted!" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to post story", description: err?.message });
    }
  };

  const sendFriendRequest = useCallback(async (targetUsername: string) => {
    if (!currentUser) return;
    setSentRequestUsernamesState(p => new Set(p).add(targetUsername));

    try {
      const targetResult = await databases.listDocuments(DATABASE_ID, COL.USERS, [
        Query.equal('username', targetUsername), Query.limit(1),
      ]);
      const targetDoc = targetResult.documents[0];
      if (!targetDoc) throw new Error('User not found');

      await databases.createDocument(DATABASE_ID, COL.FRIEND_REQUESTS, ID.unique(), {
        sender_id: currentUser.$id,
        receiver_id: targetDoc.$id,
        sender_username: currentUser.username,
        receiver_username: targetUsername,
        status: 'PENDING',
      });
      toast({ title: "Friend request sent!" });
    } catch { /* keep optimistic */ }
  }, [currentUser, toast]);

  const confirmFriendRequest = useCallback(async (username: string) => {
    if (!currentUser) return;
    setFriendUsernamesState(p => new Set(p).add(username));
    setReceivedRequestUsernamesState(p => { const n = new Set(p); n.delete(username); return n; });

    try {
      const existing = await databases.listDocuments(DATABASE_ID, COL.FRIEND_REQUESTS, [
        Query.equal('sender_username', username),
        Query.equal('receiver_id', currentUser.$id),
        Query.equal('status', 'PENDING'),
      ]);
      for (const doc of existing.documents) {
        await databases.updateDocument(DATABASE_ID, COL.FRIEND_REQUESTS, doc.$id, { status: 'ACCEPTED' });
      }
    } catch { /* ignore */ }
  }, [currentUser]);

  const cancelFriendRequest = useCallback(async (username: string) => {
    if (!currentUser) return;
    setSentRequestUsernamesState(p => { const n = new Set(p); n.delete(username); return n; });

    try {
      const existing = await databases.listDocuments(DATABASE_ID, COL.FRIEND_REQUESTS, [
        Query.equal('sender_id', currentUser.$id),
        Query.equal('receiver_username', username),
        Query.equal('status', 'PENDING'),
      ]);
      for (const doc of existing.documents) {
        await databases.deleteDocument(DATABASE_ID, COL.FRIEND_REQUESTS, doc.$id);
      }
    } catch { /* ignore */ }
  }, [currentUser]);

  const unfriendUser = useCallback(async (username: string) => {
    if (!currentUser) return;
    setFriendUsernamesState(p => { const n = new Set(p); n.delete(username); return n; });

    try {
      const [sent, recv] = await Promise.all([
        databases.listDocuments(DATABASE_ID, COL.FRIEND_REQUESTS, [
          Query.equal('sender_id', currentUser.$id), Query.equal('receiver_username', username), Query.equal('status', 'ACCEPTED'),
        ]),
        databases.listDocuments(DATABASE_ID, COL.FRIEND_REQUESTS, [
          Query.equal('receiver_id', currentUser.$id), Query.equal('sender_username', username), Query.equal('status', 'ACCEPTED'),
        ]),
      ]);
      for (const doc of [...sent.documents, ...recv.documents]) {
        await databases.deleteDocument(DATABASE_ID, COL.FRIEND_REQUESTS, doc.$id);
      }
    } catch { /* ignore */ }
    toast({ title: "Unfriended" });
  }, [currentUser, toast]);

  const sendChatMessage = useCallback(async (recipientId: string, message: Partial<ChatMessage>) => {
    if (!currentUser) return;
    const optimistic: ChatMessage = {
      $id: 'msg_' + Date.now(),
      sender: 'me',
      senderId: currentUser.$id,
      text: message.text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
      type: message.type || 'text',
      ...message,
    };
    setChatMessages(prev => ({ ...prev, [recipientId]: [...(prev[recipientId] || []), optimistic] }));

    try {
      const docData: Record<string, any> = {
        sender_id: currentUser.$id,
        receiver_id: recipientId,
        content: message.text || '',
        type: message.type || 'text',
        is_read: false,
        is_view_once: message.isViewOnce || false,
        is_viewed: false,
      };
      if (message.mediaUrl) {
        const fid = extractFileId(message.mediaUrl);
        if (fid) docData.media_id = fid;
      }
      await databases.createDocument(DATABASE_ID, COL.MESSAGES, ID.unique(), docData);
    } catch { /* keep optimistic */ }
  }, [currentUser]);

  const unlockPost = useCallback(async (postId: string, cost: number) => {
    if (!currentUser) return;
    const balance = currentUser.goldBalance || 0;
    if (balance < cost) {
      throw new Error(`Insufficient Gold balance. You need ${cost} Gold but only have ${balance}.`);
    }
    const creatorShare = Math.floor(cost * 0.7);
    const platformFee = cost - creatorShare;

    setUnlockedPostIdsState(p => new Set(p).add(postId));
    setCurrentUserState(prev => prev ? { ...prev, goldBalance: balance - cost } : null);

    try {
      await Promise.all([
        databases.createDocument(DATABASE_ID, COL.POST_UNLOCKS, ID.unique(), {
          post_id: postId, user_id: currentUser.$id, gold_spent: cost,
        }),
        databases.updateDocument(DATABASE_ID, COL.USERS, currentUser.$id, {
          gold_balance: balance - cost,
        }),
        databases.createDocument(DATABASE_ID, COL.TRANSACTIONS, ID.unique(), {
          user_id: currentUser.$id,
          amount: cost,
          currency: 'GOLD',
          type: 'POST_UNLOCK',
          reference_id: postId,
          status: 'COMPLETED',
        }),
      ]);
    } catch { /* keep optimistic */ }
    toast({ title: "Post unlocked!", description: `${creatorShare} Gold sent to creator · ${platformFee} platform fee` });
  }, [currentUser, toast]);

  const subscribeToCreator = useCallback(async (username: string, cost: number) => {
    if (!currentUser) return;
    const balance = currentUser.diamondBalance || 0;
    if (balance < cost) {
      throw new Error(`Insufficient Diamond balance. You need ${cost} Diamonds but only have ${balance}.`);
    }
    const creatorShare = Math.floor(cost * 0.7);
    const platformFee = cost - creatorShare;

    setActiveSubscriptionsState(p => new Set(p).add(username));
    setCurrentUserState(prev => prev ? { ...prev, diamondBalance: balance - cost } : null);

    try {
      await Promise.all([
        databases.createDocument(DATABASE_ID, COL.SUBSCRIPTIONS, ID.unique(), {
          subscriber_id: currentUser.$id,
          creator_username: username,
          diamond_spent: cost,
          is_active: true,
        }),
        databases.updateDocument(DATABASE_ID, COL.USERS, currentUser.$id, { diamond_balance: balance - cost }),
      ]);
    } catch { /* keep optimistic */ }
    toast({ title: "Subscribed!", description: `${creatorShare} Diamonds sent to @${username} · ${platformFee} platform fee` });
  }, [currentUser, toast]);

  const cancelSubscription = useCallback(async (username: string) => {
    if (!currentUser) return;
    setActiveSubscriptionsState(p => { const n = new Set(p); n.delete(username); return n; });

    try {
      const existing = await databases.listDocuments(DATABASE_ID, COL.SUBSCRIPTIONS, [
        Query.equal('subscriber_id', currentUser.$id),
        Query.equal('creator_username', username),
        Query.equal('is_active', true),
      ]);
      for (const doc of existing.documents) {
        await databases.updateDocument(DATABASE_ID, COL.SUBSCRIPTIONS, doc.$id, { is_active: false });
      }
    } catch { /* ignore */ }
    toast({ title: "Subscription cancelled" });
  }, [currentUser, toast]);

  const processGiftTransaction = useCallback(async (cost: number, currency: 'GOLD' | 'DIAMOND') => {
    if (!currentUser) throw new Error("Not logged in");
    const goldBal = currentUser.goldBalance || 0;
    const diamondBal = currentUser.diamondBalance || 0;
    if (currency === 'GOLD' && goldBal < cost) {
      throw new Error(`Insufficient Gold balance. You need ${cost} Gold but only have ${goldBal}.`);
    }
    if (currency === 'DIAMOND' && diamondBal < cost) {
      throw new Error(`Insufficient Diamond balance. You need ${cost} Diamonds but only have ${diamondBal}.`);
    }
    const creatorShare = Math.floor(cost * 0.7);
    const platformFee = cost - creatorShare;

    const newBalance = currency === 'GOLD' ? { gold_balance: goldBal - cost } : { diamond_balance: diamondBal - cost };
    setCurrentUserState(prev => {
      if (!prev) return null;
      return currency === 'GOLD' ? { ...prev, goldBalance: goldBal - cost } : { ...prev, diamondBalance: diamondBal - cost };
    });

    try {
      await databases.updateDocument(DATABASE_ID, COL.USERS, currentUser.$id, newBalance);
    } catch { /* ignore */ }
    toast({ title: "Gift sent!", description: `${creatorShare} ${currency} sent to creator · ${platformFee} platform fee` });
  }, [currentUser, toast]);

  const verifyUser = useCallback(async (cost: number, currency: 'DIAMOND' | 'STAR') => {
    if (!currentUser) return;
    setCurrentUserState(prev => {
      if (!prev) return null;
      return currency === 'DIAMOND'
        ? { ...prev, isVerified: true, diamondBalance: (prev.diamondBalance || 0) - cost }
        : { ...prev, isVerified: true, starBalance: (prev.starBalance || 0) - cost };
    });

    try {
      const updateData: Record<string, any> = { is_verified: true, has_ever_been_verified: true };
      if (currency === 'DIAMOND') updateData.diamond_balance = (currentUser.diamondBalance || 0) - cost;
      else updateData.star_balance = (currentUser.starBalance || 0) - cost;

      await Promise.all([
        databases.updateDocument(DATABASE_ID, COL.USERS, currentUser.$id, updateData),
        databases.createDocument(DATABASE_ID, COL.VERIFICATION_RECORDS, ID.unique(), {
          user_id: currentUser.$id,
          currency,
          cost,
          status: 'APPROVED',
        }),
      ]);
    } catch { /* ignore */ }
    toast({ title: "Verified! ✅" });
  }, [currentUser, toast]);

  const fetchProfileByUsername = useCallback(async (username: string): Promise<User | null> => {
    try {
      const result = await databases.listDocuments(DATABASE_ID, COL.USERS, [
        Query.equal('username', username), Query.limit(1),
      ]);
      if (result.documents.length === 0) return null;
      return mapProfileDocToUser(result.documents[0]);
    } catch {
      return null;
    }
  }, []);

  const fetchComments = useCallback(async (postId: string) => {
    try {
      const result = await databases.listDocuments(DATABASE_ID, COL.POST_COMMENTS, [
        Query.equal('post_id', postId),
        Query.orderAsc('$createdAt'),
        Query.limit(100),
      ]);
      setActiveComments(result.documents.map(mapDocToComment));
    } catch { /* ignore */ }
  }, []);

  const refreshClusters = useCallback(async () => {
    if (currentUser) await loadClusters(currentUser.$id);
  }, [currentUser, loadClusters]);

  const refreshProfiles = useCallback(async () => {
    try {
      const result = await databases.listDocuments(DATABASE_ID, COL.USERS, [Query.limit(50)]);
      return result.documents.map(mapProfileDocToUser);
    } catch { return []; }
  }, []);

  const addAuditLog = useCallback(async (action: string, details: string) => {
    const newLog = {
      $id: 'log_' + Date.now(),
      action,
      details,
      performed_by: currentUser?.username || 'system',
      performed_by_avatar: currentUser?.avatar,
      $createdAt: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
    try {
      await databases.createDocument(DATABASE_ID, COL.AUDIT_LOGS, ID.unique(), {
        action, details,
        performed_by: currentUser?.username || 'system',
        performed_by_avatar: currentUser?.avatar || '',
      });
    } catch { /* ignore */ }
  }, [currentUser]);

  const createPaymentRequest = useCallback(async (screenshotUrl: string) => {
    if (!currentUser) return;
    const screenshotFileId = extractFileId(screenshotUrl) || screenshotUrl;
    const req: Record<string, any> = {
      $id: 'pay_' + Date.now(),
      user_id: currentUser.$id,
      username: currentUser.username,
      package_name: pendingTransaction?.packageName || 'Package',
      amount: pendingTransaction?.amount || '0',
      currency: pendingTransaction?.currency || 'USD',
      code: pendingTransaction?.code || '',
      screenshot_id: screenshotFileId,
      status: 'PENDING',
    };
    setPaymentRequests(prev => [req, ...prev]);

    try {
      await databases.createDocument(DATABASE_ID, COL.PAYMENT_REQUESTS, ID.unique(), {
        user_id: currentUser.$id,
        username: currentUser.username,
        package_name: req.package_name,
        amount: String(req.amount),
        currency: req.currency,
        code: req.code,
        screenshot_id: screenshotFileId,
        status: 'PENDING',
      });
    } catch { /* keep optimistic */ }
    toast({ title: "Payment request submitted!" });
  }, [currentUser, pendingTransaction, toast]);

  const approvePaymentRequest = async (id: string) => {
    setPaymentRequests(prev => prev.map(r => r.$id === id ? { ...r, status: 'APPROVED' } : r));
    try { await databases.updateDocument(DATABASE_ID, COL.PAYMENT_REQUESTS, id, { status: 'APPROVED' }); } catch { /* ignore */ }
  };

  const rejectPaymentRequest = async (id: string) => {
    setPaymentRequests(prev => prev.map(r => r.$id === id ? { ...r, status: 'REJECTED' } : r));
    try { await databases.updateDocument(DATABASE_ID, COL.PAYMENT_REQUESTS, id, { status: 'REJECTED' }); } catch { /* ignore */ }
  };

  const recordWithdrawal = async (n: any) => {
    if (!currentUser) return;
    const wd: Record<string, any> = {
      $id: 'wd_' + Date.now(), ...n, status: 'PENDING', $createdAt: new Date().toISOString(),
    };
    setWithdrawalHistory(prev => [wd, ...prev]);
    try {
      await databases.createDocument(DATABASE_ID, COL.WITHDRAWAL_REQUESTS, ID.unique(), {
        user_id: currentUser.$id, username: currentUser.username,
        amount_usd: parseFloat(n.amount || 0), currency_type: n.currency || 'USD',
        phone_number: n.phoneNumber || '', payment_method: n.method || 'MOBILE_MONEY',
        status: 'PENDING',
      });
    } catch { /* keep optimistic */ }
  };

  const processWithdrawal = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    setWithdrawalHistory(prev => prev.map(w => w.$id === id ? { ...w, status } : w));
    try { await databases.updateDocument(DATABASE_ID, COL.WITHDRAWAL_REQUESTS, id, { status }); } catch { /* ignore */ }
  };

  const createCluster = async (name: string, members: any[]) => {
    if (!currentUser) return;
    try {
      const clDoc = await databases.createDocument(DATABASE_ID, COL.CLUSTERS, ID.unique(), {
        name, admin_id: currentUser.$id, admin_username: currentUser.username, is_add_locked: false,
      });

      const allMembers = [currentUser, ...members];
      await Promise.all(allMembers.map(m =>
        databases.createDocument(DATABASE_ID, COL.CLUSTER_MEMBERS, ID.unique(), {
          cluster_id: clDoc.$id, user_id: m.$id, username: m.username,
        })
      ));

      const newCluster: Cluster = {
        $id: clDoc.$id, name, adminUsername: currentUser.username,
        members: allMembers as User[], isGroup: true,
      };
      setClustersState(prev => [...prev, newCluster]);
      toast({ title: "Cluster created!" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to create cluster", description: err?.message });
    }
  };

  const addMemberToCluster = async (clusterId: string, member: any) => {
    setClustersState(prev => prev.map(cl =>
      cl.$id === clusterId ? { ...cl, members: [...cl.members, member] } : cl
    ));
    try {
      await databases.createDocument(DATABASE_ID, COL.CLUSTER_MEMBERS, ID.unique(), {
        cluster_id: clusterId, user_id: member.$id, username: member.username,
      });
    } catch { /* keep optimistic */ }
  };

  const leaveCluster = async (clusterId: string) => {
    if (!currentUser) return;
    const cluster = clusters.find(cl => cl.$id === clusterId);
    if (!cluster) return;

    if (cluster.adminUsername === currentUser.username) {
      setClustersState(prev => prev.filter(cl => cl.$id !== clusterId));
      try { await databases.deleteDocument(DATABASE_ID, COL.CLUSTERS, clusterId); } catch { /* ignore */ }
      toast({ title: "Cluster dissolved" });
    } else {
      setClustersState(prev => prev.map(cl =>
        cl.$id === clusterId ? { ...cl, members: cl.members.filter(m => m.username !== currentUser.username) } : cl
      ));
      try {
        const existing = await databases.listDocuments(DATABASE_ID, COL.CLUSTER_MEMBERS, [
          Query.equal('cluster_id', clusterId), Query.equal('user_id', currentUser.$id),
        ]);
        for (const doc of existing.documents) {
          await databases.deleteDocument(DATABASE_ID, COL.CLUSTER_MEMBERS, doc.$id);
        }
      } catch { /* ignore */ }
      toast({ title: "Left cluster" });
    }
  };

  const updateCluster = async (clusterId: string, updates: { name?: string; cover?: string; isAddLocked?: boolean }) => {
    setClustersState(prev => prev.map(cl => cl.$id === clusterId ? { ...cl, ...updates } : cl));
    try {
      const dbUpdates: Record<string, any> = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.isAddLocked !== undefined) dbUpdates.is_add_locked = updates.isAddLocked;
      if (updates.cover !== undefined) {
        const fid = extractFileId(updates.cover);
        if (fid) dbUpdates.cover_id = fid;
      }
      if (Object.keys(dbUpdates).length > 0) {
        await databases.updateDocument(DATABASE_ID, COL.CLUSTERS, clusterId, dbUpdates);
      }
    } catch { /* ignore */ }
  };

  const addCampaign = async (d: any) => {
    if (!currentUser) return;
    try {
      const doc = await databases.createDocument(DATABASE_ID, COL.AD_CAMPAIGNS, ID.unique(), {
        user_id: currentUser.$id,
        title: d.title || '',
        content: d.content || '',
        type: d.type || 'photo',
        placement: d.placement || 'feed',
        media_url: d.mediaUrl || '',
        action_url: d.actionUrl || '',
        action_label: d.actionLabel || 'Learn More',
        is_active: true,
        impressions: 0,
        clicks: 0,
      });
      setCampaignsState(prev => [doc, ...prev]);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to create campaign", description: err?.message || "Please try again." });
      throw err;
    }
  };

  const deleteCampaign = async (id: string) => {
    setCampaignsState(prev => prev.filter(c => c.$id !== id));
    try { await databases.deleteDocument(DATABASE_ID, COL.AD_CAMPAIGNS, id); } catch { /* ignore */ }
  };

  const toggleCampaignStatus = async (id: string) => {
    setCampaignsState(prev => prev.map(c => c.$id === id ? { ...c, is_active: !c.is_active } : c));
    const camp = campaigns.find(c => c.$id === id);
    try { await databases.updateDocument(DATABASE_ID, COL.AD_CAMPAIGNS, id, { is_active: !camp?.is_active }); } catch { /* ignore */ }
  };

  const recordView = useCallback(async (id: string) => {
    if (viewedPostIds.has(id)) return;
    setViewedPostIdsState(prev => new Set(prev).add(id));
    setPostsState(prev => prev.map(p => p.$id === id ? { ...p, views: p.views + 1 } : p));
    try {
      await databases.updateDocument(DATABASE_ID, COL.POSTS, id, {
        views_count: (posts.find(p => p.$id === id)?.views || 0) + 1,
      });
    } catch { /* ignore */ }
  }, [viewedPostIds, posts]);

  const recordStoryView = async (id: string) => {
    setStoriesState(prev => prev.map(s => s.$id === id ? { ...s, viewCount: (s.viewCount || 0) + 1 } : s));
    if (currentUser) {
      try {
        await Promise.all([
          databases.createDocument(DATABASE_ID, COL.STORY_VIEWS, ID.unique(), {
            story_id: id, viewer_id: currentUser.$id,
          }),
          databases.updateDocument(DATABASE_ID, COL.STORIES, id, {
            view_count: (stories.find(s => s.$id === id)?.viewCount || 0) + 1,
          }),
        ]);
      } catch { /* ignore */ }
    }
  };

  const submitTicket = async (data: { subject: string; message: string; category: string; priority?: string }) => {
    if (!currentUser) return;
    const ticket: Record<string, any> = {
      $id: 'tkt_' + Date.now(),
      username: currentUser.username,
      avatar: currentUser.avatar,
      subject: data.subject, message: data.message,
      category: data.category, status: 'OPEN',
      priority: data.priority || 'MEDIUM',
      $createdAt: new Date().toISOString(),
    };
    setTickets(prev => [ticket, ...prev]);
    try {
      await databases.createDocument(DATABASE_ID, COL.SUPPORT_TICKETS, ID.unique(), {
        user_id: currentUser.$id,
        username: currentUser.username,
        subject: data.subject, message: data.message,
        category: data.category, status: 'OPEN',
        priority: data.priority || 'MEDIUM',
      });
    } catch { /* keep optimistic */ }
  };

  const handleReportAction = async (reportId: string, action: any) => {
    setReports(prev => prev.map((r: any) => r.$id === reportId ? { ...r, status: action } : r));
    try { await databases.updateDocument(DATABASE_ID, COL.REPORTS, reportId, { status: action }); } catch { /* ignore */ }
  };

  const handleTicketAction = async (ticketId: string, status: any) => {
    setTickets(prev => prev.map((t: any) => t.$id === ticketId ? { ...t, status } : t));
    try { await databases.updateDocument(DATABASE_ID, COL.SUPPORT_TICKETS, ticketId, { status }); } catch { /* ignore */ }
  };

  const updateUserIdentity = async (userId: string, data: Partial<User>) => {
    setStaff(prev => prev.map((s: any) => s.$id === userId ? { ...s, ...data } : s));
    try {
      const dbData: Record<string, any> = {};
      if (data.name) dbData.name = data.name;
      if (data.role) dbData.role = data.role;
      if (Object.keys(dbData).length > 0) {
        await databases.updateDocument(DATABASE_ID, COL.USERS, userId, dbData);
      }
    } catch { /* ignore */ }
  };

  const promoteUser = async (username: string, role: any) => {
    setStaff(prev => {
      const existing = prev.find((s: any) => s.username === username);
      if (existing) return prev.map((s: any) => s.username === username ? { ...s, role } : s);
      return prev;
    });
    try {
      const res = await databases.listDocuments(DATABASE_ID, COL.USERS, [Query.equal('username', username), Query.limit(1)]);
      if (res.documents[0]) {
        await databases.updateDocument(DATABASE_ID, COL.USERS, res.documents[0].$id, { role });
      }
    } catch { /* ignore */ }
  };

  const demoteUser = async (username: string) => {
    setStaff(prev => prev.filter((s: any) => s.username !== username));
    try {
      const res = await databases.listDocuments(DATABASE_ID, COL.USERS, [Query.equal('username', username), Query.limit(1)]);
      if (res.documents[0]) {
        await databases.updateDocument(DATABASE_ID, COL.USERS, res.documents[0].$id, { role: 'USER' });
      }
    } catch { /* ignore */ }
  };

  const boostNode = async (nodeId: string, promisedViews: number, duration: number, cost: number, currency: 'DIAMOND' | 'STAR', type: 'POST' | 'SONIC') => {
    if (!currentUser) return;
    const expiry = Date.now() + duration * 86400000;
    if (type === 'POST') {
      setPostsState(prev => prev.map(p => p.$id === nodeId ? { ...p, isBoosted: true, boostTargetViews: promisedViews, boostExpiry: expiry } : p));
      try {
        const updateData: Record<string, any> = { is_boosted: true, boost_target_views: promisedViews };
        if (currency === 'DIAMOND') updateData.diamond_balance = (currentUser.diamondBalance || 0) - cost;
        else updateData.star_balance = (currentUser.starBalance || 0) - cost;
        await Promise.all([
          databases.updateDocument(DATABASE_ID, COL.POSTS, nodeId, { is_boosted: true, boost_target_views: promisedViews }),
          databases.updateDocument(DATABASE_ID, COL.USERS, currentUser.$id, updateData),
        ]);
        setCurrentUserState(prev => {
          if (!prev) return null;
          return currency === 'DIAMOND'
            ? { ...prev, diamondBalance: (prev.diamondBalance || 0) - cost }
            : { ...prev, starBalance: (prev.starBalance || 0) - cost };
        });
      } catch { /* ignore */ }
    }
  };

  const initiateCall = useCallback(async (contact: any, type: 'audio' | 'video') => {
    const channelName = `vimore_${Date.now()}`;
    const uid = Math.floor(Math.random() * 100000);
    let token = '';
    try {
      const { generateAgoraToken } = await import('@/app/actions/call');
      token = await generateAgoraToken(channelName, uid);
    } catch { token = ''; }
    setCallState({ type, status: 'outgoing', contact, channelName, token });
  }, []);

  const acceptCall = useCallback(async () => {
    setCallState(prev => ({ ...prev, status: 'active' }));
  }, []);

  const endCall = useCallback(async (duration?: string) => {
    if (currentUser && callState.contact && duration) {
      try {
        await databases.createDocument(DATABASE_ID, COL.CALL_LOGS, ID.unique(), {
          caller_id: currentUser.$id,
          callee_id: callState.contact.$id || callState.contact.username,
          type: callState.type,
          duration: duration || '0:00',
          status: 'COMPLETED',
        });
      } catch { /* ignore */ }
    }
    setCallState({ type: 'video', status: 'idle', contact: null });
  }, [currentUser, callState]);

  const value: PostContextType = {
    currentUser, isAuthenticated: !!currentUser, posts, activeComments, isLoading, initError,
    likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, seenPostIds, viewedPostIds,
    followingUsernames, followerUsernames, friendUsernames, sentRequestUsernames,
    receivedRequestUsernames, acceptedStrangerUsernames,
    activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, selectedVideoUrl,
    isSearchOpen, isGiftHubOpen, targetUserForGift, activeCommentPostId,
    settings, gatewaySettings: OFFICIAL_GATEWAY, callState, stories, campaigns,
    reports, tickets, mutedUserNames, connections, clusters, auditLogs,
    staff, adStats: (() => {
      const revenue = campaigns.reduce((sum, c) => sum + ((c.clicks || 0) * 0.05 + (c.impressions || 0) * 0.001), 0);
      const handshakes = campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0);
      return { revenue: Math.round(revenue * 100) / 100, handshakes };
    })(),
    intelligenceMetrics: (() => {
      const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);
      const totalUnlikes = posts.reduce((sum, p) => sum + (p.unlikes || 0), 0);
      const sentiment = totalLikes + totalUnlikes > 0
        ? Math.min(99, Math.round((totalLikes / (totalLikes + totalUnlikes)) * 100))
        : 0;
      const oneDayAgo = new Date(Date.now() - 86400000).toISOString();
      const recentPosts = posts.filter(p => (p.$createdAt || '') > oneDayAgo).length;
      const velocity = recentPosts > 20 ? 'HIGH' : recentPosts > 5 ? 'MEDIUM' : recentPosts > 0 ? 'LOW' : 'IDLE';
      return { sentiment, velocity };
    })(),
    withdrawalHistory, paymentRequests,
    referralLink: "https://www.vimore.app/join/" + (currentUser?.username || "guest"),
    pendingTransaction, activeSubscriptions, chatMessages,

    login, signup, logout, checkSession,
    resetPassword: async (userId: string, secret: string, password: string) => {
      await account.updateRecovery(userId, secret, password);
    },
    uploadMedia,
    addPost, deletePost, toggleLikePost, toggleUnlikePost,
    toggleSavePost: async (id: string) => {
      const wasSaved = savedPostIds.has(id);
      setSavedPostIdsState(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n; });
      if (!currentUser) return;
      try {
        if (wasSaved) {
          const existing = await databases.listDocuments(DATABASE_ID, COL.BOOKMARKS, [
            Query.equal('post_id', id), Query.equal('user_id', currentUser.$id),
          ]);
          for (const doc of existing.documents) {
            await databases.deleteDocument(DATABASE_ID, COL.BOOKMARKS, doc.$id);
          }
        } else {
          await databases.createDocument(DATABASE_ID, COL.BOOKMARKS, ID.unique(), {
            post_id: id, user_id: currentUser.$id,
          });
        }
      } catch { /* ignore */ }
    },
    updateCurrentUser, updateSettings,
    setSearchOpen: setIsSearchOpenState,
    setSelectedChatId: setSelectedChatIdState,
    setSelectedPostId: setSelectedPostIdState,
    setSelectedImageUrl: setSelectedImageUrlState,
    setSelectedVideoUrl: setSelectedVideoUrlState,
    openCommentHub: (id: string) => setActiveCommentPostIdState(id),
    closeCommentHub: () => setActiveCommentPostIdState(null),
    openGiftHub: (u: User) => { setTargetUserForGiftState(u); setIsGiftHubOpenState(true); },
    closeGiftHub: () => setIsGiftHubOpenState(false),
    setActiveStoryIndex: setActiveStoryIndexState,
    triggerHaptic,
    isPostLiked: (id: string) => likedPostIds.has(id),
    isPostUnliked: (id: string) => unlikedPostIds.has(id),
    isPostSaved: (id: string) => savedPostIds.has(id),
    isPostUnlocked: (id: string) => unlockedPostIds.has(id),
    isFollowing: (u: string) => followingUsernames.has(u),
    toggleFollowUser: async (username: string) => {
      if (!currentUser) return;
      const isNowFollowing = followingUsernames.has(username);
      if (isNowFollowing) {
        setFollowingUsernamesState(prev => { const n = new Set(prev); n.delete(username); return n; });
        try {
          const existing = await databases.listDocuments(DATABASE_ID, COL.FOLLOWS, [
            Query.equal('follower_id', currentUser.$id),
            Query.equal('following_username', username),
          ]);
          for (const doc of existing.documents) {
            await databases.deleteDocument(DATABASE_ID, COL.FOLLOWS, doc.$id);
          }
          await databases.updateDocument(DATABASE_ID, COL.USERS, currentUser.$id, {
            following_count: Math.max(0, (currentUser.following as number || 0) - 1),
          });
        } catch { /* keep optimistic */ }
      } else {
        setFollowingUsernamesState(prev => new Set(prev).add(username));
        try {
          const targetRes = await databases.listDocuments(DATABASE_ID, COL.USERS, [
            Query.equal('username', username), Query.limit(1),
          ]);
          const targetDoc = targetRes.documents[0];
          if (targetDoc) {
            await databases.createDocument(DATABASE_ID, COL.FOLLOWS, ID.unique(), {
              follower_id: currentUser.$id,
              following_id: targetDoc.$id,
              follower_username: currentUser.username,
              following_username: username,
            });
            await databases.updateDocument(DATABASE_ID, COL.USERS, currentUser.$id, {
              following_count: (currentUser.following as number || 0) + 1,
            });
            await databases.updateDocument(DATABASE_ID, COL.USERS, targetDoc.$id, {
              followers_count: (targetDoc.followers_count || 0) + 1,
            });
          }
        } catch { /* keep optimistic */ }
      }
    },
    isFriend: (u: string) => friendUsernames.has(u),
    isRequestSent: (u: string) => sentRequestUsernames.has(u),
    isRequestReceived: (u: string) => receivedRequestUsernames.has(u),
    isSubscribed: (u: string) => activeSubscriptions.has(u),
    sendFriendRequest, confirmFriendRequest, cancelFriendRequest, unfriendUser,
    acceptMessageRequest: async () => {},
    declineMessageRequest: async () => {},
    addComment, addReply, addStory,
    voteOnStoryPoll: async () => {},
    voteOnPostPoll: async (postId: string, optionIndex: number) => {
      if (!currentUser) return;
      setPostsState(prev => prev.map(post => {
        if (post.$id !== postId || !post.poll) return post;
        const poll = { ...post.poll };
        const voters = { ...(poll.voters || {}) };
        const options = poll.options.map((o: any) => ({ ...o }));
        const previousVote = voters[currentUser.username];
        if (previousVote === optionIndex) {
          delete voters[currentUser.username];
          options[optionIndex].votes = Math.max(0, (options[optionIndex].votes || 0) - 1);
          const totalVotes = Math.max(0, (poll.totalVotes || 0) - 1);
          return { ...post, poll: { ...poll, options, voters, totalVotes } };
        }
        if (previousVote !== undefined) {
          options[previousVote].votes = Math.max(0, (options[previousVote].votes || 0) - 1);
        }
        voters[currentUser.username] = optionIndex;
        options[optionIndex].votes = (options[optionIndex].votes || 0) + 1;
        const totalVotes = previousVote !== undefined ? (poll.totalVotes || 0) : (poll.totalVotes || 0) + 1;
        return { ...post, poll: { ...poll, options, voters, totalVotes } };
      }));
    },
    toggleMuteUser: (u: string) => setMutedUserNames(p => p.includes(u) ? p.filter(x => x !== u) : [...p, u]),
    togglePinPost: async () => {},
    archivePost: async () => {},
    addAuditLog,
    submitTicket,
    initiateTransaction: (d: any) => setPendingTransactionState(d),
    cancelTransaction: () => setPendingTransactionState(null),
    createPaymentRequest, approvePaymentRequest, rejectPaymentRequest,
    recordWithdrawal, processWithdrawal,
    verifyUser, processGiftTransaction, unlockPost, subscribeToCreator, cancelSubscription,
    incrementShareCount: async (id: string) => {
      setPostsState(prev => prev.map(p => p.$id === id ? { ...p, shares: p.shares + 1 } : p));
      try {
        await databases.updateDocument(DATABASE_ID, COL.POSTS, id, {
          shares_count: (posts.find(p => p.$id === id)?.shares || 0) + 1,
        });
      } catch { /* ignore */ }
    },
    createCluster, addMemberToCluster, leaveCluster, updateCluster,
    promoteUser, demoteUser,
    addCampaign, deleteCampaign, toggleCampaignStatus, recordCampaignClick: async () => {},
    initiateCall, acceptCall, endCall, refreshAdminData,
    fetchProfileByUsername, fetchComments,
    refreshProfiles,
    refreshClusters,
    refreshFeed, refreshStories,
    recordView, recordStoryView,
    updateUserIdentity,
    handleReportAction, handleTicketAction,
    sendChatMessage,
    purgeVibeCache: async () => setSeenPostIdsState(new Set()),
    archiveIdentityNode: async () => {},
    boostNode,
    enrollHardwareBiometrics: async (): Promise<boolean> => {
      if (typeof window === 'undefined' || !window.PublicKeyCredential) return false;
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (!available) return false;
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        const userId = crypto.getRandomValues(new Uint8Array(16));
        const credential = await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: "ViMore", id: window.location.hostname },
            user: { id: userId, name: currentUser?.username || "vimore-user", displayName: currentUser?.name || "ViMore User" },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
            authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", requireResidentKey: false },
            timeout: 60000,
          },
        }) as PublicKeyCredential | null;
        if (credential) {
          const credId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
          localStorage.setItem('vimore_biometric_cred_id', credId);
          setSettingsState(prev => ({ ...prev, isBiometricActive: true, isHardwareEnrolled: true }));
          return true;
        }
        return false;
      } catch { return false; }
    },
    verifyHardwareBiometrics: async (): Promise<boolean> => {
      if (typeof window === 'undefined' || !window.PublicKeyCredential) return false;
      try {
        const challenge = crypto.getRandomValues(new Uint8Array(32));
        const credIdBase64 = localStorage.getItem('vimore_biometric_cred_id');
        const allowCredentials: PublicKeyCredentialDescriptor[] = credIdBase64
          ? [{ type: "public-key", id: Uint8Array.from(atob(credIdBase64), c => c.charCodeAt(0)), transports: ["internal" as AuthenticatorTransport] }]
          : [];
        const credential = await navigator.credentials.get({
          publicKey: { challenge, timeout: 60000, userVerification: "required", rpId: window.location.hostname, allowCredentials },
        });
        return credential !== null;
      } catch { return false; }
    },
    blockedUsernames,
    blockUser: async (username: string) => {
      if (!currentUser) return;
      setBlockedUsernames(prev => [...prev, username]);
      try {
        await databases.createDocument(DATABASE_ID, COL.BLOCKED_USERS, ID.unique(), {
          blocker_id: currentUser.$id,
          blocked_username: username,
        });
      } catch { /* keep optimistic */ }
    },
    unblockUser: async (username: string) => {
      if (!currentUser) return;
      setBlockedUsernames(prev => prev.filter(u => u !== username));
      try {
        const existing = await databases.listDocuments(DATABASE_ID, COL.BLOCKED_USERS, [
          Query.equal('blocker_id', currentUser.$id),
          Query.equal('blocked_username', username),
        ]);
        for (const doc of existing.documents) {
          await databases.deleteDocument(DATABASE_ID, COL.BLOCKED_USERS, doc.$id);
        }
      } catch { /* keep optimistic */ }
    },
    submitReport: async (data: { reportedUsername: string; reason: string; details: string }) => {
      if (!currentUser) return;
      try {
        await databases.createDocument(DATABASE_ID, COL.REPORTS, ID.unique(), {
          reporter_id: currentUser.$id,
          reported_username: data.reportedUsername,
          reason: data.reason,
          details: data.details,
          status: 'PENDING',
        });
      } catch { /* ignore */ }
    },
  };

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) throw new Error('usePosts must be used within a PostProvider');
  return context;
}
