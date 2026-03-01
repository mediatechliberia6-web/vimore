
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import client, { account, ID, databases, storage, APPWRITE_BUCKET_ID, APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, LIKES_COLLECTION_ID, COMMENTS_COLLECTION_ID, FOLLOWS_COLLECTION_ID, CLUSTERS_COLLECTION_ID } from '@/lib/appwrite';
import { Query } from 'appwrite';

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
  startTime?: number;
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
  addStory: (segment: any) => void;
  voteOnStoryPoll: (storyId: string, segmentId: string, optionIndex: number) => void;
  toggleMuteUser: (username: string) => void;
  togglePinPost: (postId: string) => void;
  archivePost: (postId: string) => void;
  updateGatewaySettings: (data: any) => void;
  addAuditLog: (action: string, details: string) => void;
  initiateTransaction: (data: any) => void;
  cancelTransaction: () => void;
  createPaymentRequest: (screenshot: string) => void;
  approvePaymentRequest: (id: string) => void;
  rejectPaymentRequest: (id: string) => void;
  recordWithdrawal: (node: any) => void;
  processWithdrawal: (id: string, status: any) => void;
  triggerReferralPulse: (referralCode?: string) => void;
  verifyUser: (cost: number, currency: any) => void;
  processGiftTransaction: (cost: number, currency: any) => void;
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
  promoteUser: (username: string, role: any) => void;
  demoteUser: (username: string) => void;
  addCampaign: (data: any) => void;
  deleteCampaign: (id: string) => void;
  toggleCampaignStatus: (id: string) => void;
  recordCampaignClick: (id: string) => void;
  boostNode: (nodeId: string, targetViews: number, durationDays: number, cost: number, currency: any) => void;
  initiateCall: (contact: any, type: CallType) => void;
  receiveCall: (contact: any, type: CallType) => void;
  acceptCall: () => void;
  endCall: () => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const INITIAL_USER: User = {
  name: "Guest Node",
  username: "johndoe_creative",
  avatar: "https://picsum.photos/seed/me/400/400",
  bio: "Digital creator and explorer of the ViMore network. 🎨 ✨",
  isOnline: true,
  isVerified: false,
  role: 'USER'
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

const MOCK_CONNECTIONS: Connection[] = [
  { name: "Alex Rivera", username: "arivera", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop", category: "Product Designer", followers: "12.2k", followsYou: true, isGroup: false },
  { name: "Sarah Chen", username: "schen_dev", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop", category: "Fullstack Architect", followers: "4.2k", followsYou: true, isGroup: false },
  { name: "Marcus Stone", username: "mstone", avatar: "https://images.unsplash.com/photo-1607031542107-f6f46b5d54e9?w=100&h=100&fit=crop", category: "Visual Storyteller", followers: "25.1k", followsYou: false, isGroup: false },
  { name: "Joy Moore", username: "jmoore", avatar: "https://picsum.photos/seed/joy/100/100", category: "Vocalist", followers: "1.5k", followsYou: true, isGroup: false },
  { name: "Tech Insider", username: "techex", avatar: "https://picsum.photos/seed/51/100/100", category: "Tech Node", followers: "800", followsYou: false, isGroup: false },
];

export function PostProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  
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

  const checkSession = useCallback(async () => {
    try {
      const user = await account.get();
      setCurrentUser(prev => ({
        ...prev,
        name: user.name,
        username: user.email.split('@')[0], 
        isOnline: true,
        role: 'USER'
      }));
      await Promise.all([refreshFeed(), refreshSocialGraph(), refreshClusters()]);
    } catch (error) {
      console.log("No active signature node.");
    } finally {
      setIsLoading(false);
    }
  }, [refreshFeed, refreshSocialGraph, refreshClusters]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, pass: string) => {
    await account.createEmailPasswordSession(email, pass);
    await checkSession();
  };

  const signup = async (email: string, pass: string, name: string, username: string) => {
    await account.create(ID.unique(), email, pass, name);
    await account.createEmailPasswordSession(email, pass);
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

      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        POSTS_COLLECTION_ID,
        ID.unique(),
        docData
      );

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
        const response = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          LIKES_COLLECTION_ID,
          [Query.equal('postId', postId), Query.equal('userId', user.$id)]
        );
        if (response.documents.length > 0) {
          await databases.deleteDocument(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, response.documents[0].$id);
        }
        await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, {
          likes: Math.max(0, post.likes - 1)
        });
      } else {
        await databases.createDocument(APPWRITE_DATABASE_ID, LIKES_COLLECTION_ID, ID.unique(), {
          postId,
          userId: user.$id
        });
        await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, {
          likes: post.likes + 1
        });
      }
      refreshFeed();
    } catch (e) {
      console.error("Like handshake failed:", e);
    }
  };

  const addComment = async (postId: string, text: string) => {
    const user = await account.get();
    try {
      await databases.createDocument(APPWRITE_DATABASE_ID, COMMENTS_COLLECTION_ID, ID.unique(), {
        postId,
        userId: user.$id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        text,
        time: "Just now"
      });

      const post = posts.find(p => p.id === postId);
      if (post) {
        await databases.updateDocument(APPWRITE_DATABASE_ID, POSTS_COLLECTION_ID, postId, {
          comments: post.comments + 1
        });
      }
      refreshFeed();
    } catch (e) {
      console.error("Comment sync failed:", e);
    }
  };

  const toggleFollowUser = async (username: string) => {
    const isCurrentlyFollowing = followingUsernames.has(username);
    const user = await account.get();

    setFollowingUsernames(prev => {
      const next = new Set(prev);
      if (isCurrentlyFollowing) next.delete(username);
      else next.add(username);
      return next;
    });

    try {
      if (isCurrentlyFollowing) {
        const response = await databases.listDocuments(
          APPWRITE_DATABASE_ID,
          FOLLOWS_COLLECTION_ID,
          [Query.equal('followerId', user.$id), Query.equal('followingUsername', username)]
        );
        if (response.documents.length > 0) {
          await databases.deleteDocument(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, response.documents[0].$id);
        }
      } else {
        await databases.createDocument(APPWRITE_DATABASE_ID, FOLLOWS_COLLECTION_ID, ID.unique(), {
          followerId: user.$id,
          followingUsername: username,
          followingId: 'unknown'
        });
      }
      refreshSocialGraph();
    } catch (e) {
      console.error("Social handshake failure:", e);
    }
  };

  const createCluster = async (name: string, members: any[]) => {
    try {
      const allMembers = [currentUser, ...members];
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        CLUSTERS_COLLECTION_ID,
        ID.unique(),
        {
          name,
          adminUsername: currentUser.username,
          members: JSON.stringify(allMembers),
          avatar: `https://picsum.photos/seed/${name}/400/400`
        }
      );
      await refreshClusters();
    } catch (e) {
      console.error("Cluster creation failed:", e);
    }
  };

  const addMemberToCluster = async (clusterId: string, member: any) => {
    try {
      const cluster = clusters.find(c => c.id === clusterId);
      if (!cluster) return;
      const updatedMembers = [...cluster.members, member];
      await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        CLUSTERS_COLLECTION_ID,
        clusterId,
        { members: JSON.stringify(updatedMembers) }
      );
      await refreshClusters();
    } catch (e) {
      console.error("Member sync failed:", e);
    }
  };

  const leaveCluster = async (clusterId: string) => {
    try {
      const cluster = clusters.find(c => c.id === clusterId);
      if (!cluster) return;
      const updatedMembers = cluster.members.filter(m => m.username !== currentUser.username);
      if (updatedMembers.length === 0) {
        await databases.deleteDocument(APPWRITE_DATABASE_ID, CLUSTERS_COLLECTION_ID, clusterId);
      } else {
        await databases.updateDocument(
          APPWRITE_DATABASE_ID,
          CLUSTERS_COLLECTION_ID,
          clusterId,
          { members: JSON.stringify(updatedMembers) }
        );
      }
      await refreshClusters();
    } catch (e) {
      console.error("Cluster detachment failed:", e);
    }
  };

  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(intensity);
    }
  }, []);

  const updateCurrentUser = (data: Partial<User>) => setCurrentUser(prev => ({ ...prev, ...data }));
  const updateSettings = (data: Partial<AppSettings>) => setSettings(prev => ({ ...prev, ...data }));
  
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

  const isPostLiked = (postId: string) => likedPostIds.has(postId);
  const isPostUnliked = (postId: string) => unlikedPostIds.has(postId);
  const isPostSaved = (postId: string) => savedPostIds.has(postId);
  const isPostUnlocked = (postId: string) => unlockedPostIds.has(postId);
  const isFollowing = (username: string) => followingUsernames.has(username);

  const openCommentHub = (postId: string) => setActiveCommentPostId(postId);
  const closeCommentHub = () => setActiveCommentPostId(null);
  const openGiftHub = (user: User) => { setTargetUserForGift(user); setIsGiftHubOpen(true); };
  const closeGiftHub = () => { setIsGiftHubOpen(false); setTargetUserForGift(null); };

  return (
    <PostContext.Provider value={{ 
      currentUser, posts, isLoading, likedPostIds, unlikedPostIds, savedPostIds, unlockedPostIds, followingUsernames, activeStoryIndex, selectedChatId, selectedPostId, selectedImageUrl, isSearchOpen, isGiftHubOpen, targetUserForGift, settings, gatewaySettings: {}, callState, stories: [], campaigns: [], mutedUserNames: [], connections: MOCK_CONNECTIONS, clusters, auditLogs: [], disputes: [], staff: [], adStats: {}, intelligenceMetrics: {}, withdrawalHistory: [], paymentRequests: [], referralLink: "",
      login, signup, uploadMedia, setSearchOpen: (open) => setIsSearchOpen(open), setSelectedChatId: (id) => setSelectedChatId(id), setSelectedPostId: (id) => setSelectedPostId(id), setSelectedImageUrl: (url) => setSelectedImageUrl(url), openCommentHub, closeCommentHub, openGiftHub, closeGiftHub, setActiveStoryIndex: (idx) => setActiveStoryIndex(idx), addPost, deletePost, addStory: () => {}, addComment, addReply: () => {}, incrementShareCount: () => {}, voteOnStoryPoll: () => {}, toggleMuteUser: () => {}, togglePinPost: () => {}, archivePost: () => {}, updateCurrentUser, updateSettings, updateGatewaySettings: () => {}, addAuditLog: () => {}, toggleLikePost, toggleUnlikePost, toggleSavePost, toggleFollowUser, initiateTransaction: () => {}, cancelTransaction: () => {}, createPaymentRequest: () => {}, approvePaymentRequest: () => {}, rejectPaymentRequest: () => {}, recordWithdrawal: () => {}, processWithdrawal: () => {}, triggerReferralPulse: () => {}, verifyUser: () => {}, processGiftTransaction: () => {}, unlockPost: (id) => setUnlockedPostIds(prev => new Set(prev).add(id)), subscribeToCreator: () => {}, cancelSubscription: () => {}, recordAdMaterialization: () => {}, recordAdHandshake: () => {}, updateIntelligence: () => {}, isPostLiked, isPostUnliked, isPostSaved, isPostUnlocked, isFollowing, isSubscribed: () => false, triggerHaptic, createCluster, addMemberToCluster, leaveCluster, resolveDispute: () => {}, addCampaign: () => {}, deleteCampaign: () => {}, toggleCampaignStatus: () => {}, recordCampaignClick: () => {}, boostNode: () => {}, promoteUser: () => {}, demoteUser: () => {}, initiateCall: () => {}, receiveCall: () => {}, acceptCall: () => {}, endCall: () => {}
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
