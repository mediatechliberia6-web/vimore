"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';

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
  pronouns?: string;
  joinDate?: string;
  relationshipStatus?: string;
  introUrl?: string; 
  language?: string;
  goldBalance?: number;
  diamondBalance?: number;
  links?: Array<{ label: string; url: string; icon: any }>;
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

export interface Connection {
  name: string;
  username: string;
  avatar: string;
  category: string;
  followsYou: boolean;
  isOnline?: boolean;
  connectionDate?: string;
  mutualFriends?: string[]; 
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
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
    duration?: string;
  };
  initialComments?: any[];
  sharedPost?: any;
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
  followingUsernames: Set<string>;
  activeStoryIndex: number | null;
  connections: Connection[];
  selectedPostId: string | null;
  isSearchOpen: boolean;
  pendingTransaction: PendingTransaction | null;
  setSearchOpen: (open: boolean) => void;
  setSelectedPostId: (id: string | null) => void;
  setActiveStoryIndex: (index: number | null) => void;
  addPost: (post: Omit<Post, 'id' | 'time' | 'likes' | 'unlikes' | 'comments' | 'shares'>) => void;
  deletePost: (postId: string) => void;
  addStory: (segment: Omit<StorySegment, 'id'>) => void;
  voteOnStoryPoll: (storyId: string, segmentId: string, optionIndex: number) => void;
  toggleMuteUser: (username: string) => void;
  togglePinPost: (postId: string) => void;
  archivePost: (postId: string) => void;
  updateCurrentUser: (data: Partial<User>) => void;
  toggleLikePost: (postId: string) => void;
  toggleUnlikePost: (postId: string) => void;
  toggleSavePost: (postId: string) => void;
  toggleFollowUser: (username: string) => void;
  initiateTransaction: (data: Omit<PendingTransaction, 'timestamp'>) => void;
  cancelTransaction: () => void;
  isPostLiked: (postId: string) => boolean;
  isPostUnliked: (postId: string) => boolean;
  isPostSaved: (postId: string) => boolean;
  isFollowing: (username: string) => boolean;
  incrementShareCount: (postId: string) => void;
  triggerHaptic: (intensity?: number) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const INITIAL_USER: User = {
  name: "John Doe",
  username: "johndoe_creative",
  avatar: "https://picsum.photos/seed/me/400/400",
  cover: "https://picsum.photos/seed/my_cover/1200/400",
  bio: "Digital creator specializing in UI/UX and mobile photography. Building ViMore community. 🎨 ✨",
  category: "Digital Creator",
  pronouns: "His",
  joinDate: "January 2024",
  relationshipStatus: "Single",
  followers: "8.4k",
  following: "1.2k",
  posts: "142",
  language: "en",
  goldBalance: 0,
  diamondBalance: 0,
  introUrl: ""
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
    mutualFriends: ["https://picsum.photos/seed/1/50/50", "https://picsum.photos/seed/2/50/50"]
  },
  { 
    name: "Tech Explorer", 
    username: "techex", 
    avatar: "https://picsum.photos/seed/51/200/200", 
    category: "Fullstack Developer", 
    followsYou: true,
    isOnline: false,
    connectionDate: "Jan 2024",
    mutualFriends: ["https://picsum.photos/seed/3/50/50"]
  },
  { 
    name: "Alex Rivera", 
    username: "arivera", 
    avatar: "https://picsum.photos/seed/1/100/100", 
    category: "Product Designer", 
    followsYou: false,
    isOnline: true,
    connectionDate: "Mar 2024",
    mutualFriends: ["https://picsum.photos/seed/4/50/50", "https://picsum.photos/seed/5/50/50", "https://picsum.photos/seed/6/50/50"]
  },
  { 
    name: "Sarah Chen", 
    username: "schen_dev", 
    avatar: "https://picsum.photos/seed/2/100/100", 
    category: "Software Engineer", 
    followsYou: true,
    isOnline: true,
    connectionDate: "Nov 2023",
    mutualFriends: ["https://picsum.photos/seed/7/50/50"]
  },
  { 
    name: "Marcus Stone", 
    username: "mstone", 
    avatar: "https://picsum.photos/seed/3/100/100", 
    category: "Photographer", 
    followsYou: false,
    isOnline: false,
    connectionDate: "Dec 2023",
    mutualFriends: ["https://picsum.photos/seed/8/50/50", "https://picsum.photos/seed/9/50/50"]
  },
  {
    name: "Paul Node",
    username: "paul",
    avatar: "https://picsum.photos/seed/paul/100/100",
    category: "Producer",
    followsYou: true,
    isOnline: true,
    connectionDate: "May 2024"
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
    id: "1",
    user: { 
      name: "Julianne Moore", 
      username: "jmoore", 
      avatar: "https://picsum.photos/seed/50/200/200",
      isVerified: true,
      followers: 1500
    },
    content: "Just started using **ViMore** and I'm loving the clean aesthetic! Check out the multi-image carousel test. ✨ https://vimore.io",
    time: "5m",
    likes: 24,
    unlikes: 2,
    comments: 4,
    shares: 1,
    language: "en",
    hashtags: ["NewBeginnings", "SocialMedia"],
    images: [
      "https://picsum.photos/seed/multi1/800/600",
      "https://picsum.photos/seed/multi2/800/600"
    ]
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
    comments: 12,
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
    }
  },
  {
    id: "3",
    user: { 
      name: "Alex Rivera", 
      username: "arivera", 
      avatar: "https://picsum.photos/seed/1/100/100",
      followers: 12200
    },
    content: "¡Hola a todos! Estoy emocionado de probar la new función de traducción automática en ViMore. ¿Qué les parece?",
    time: "45m",
    likes: 88,
    unlikes: 1,
    comments: 15,
    shares: 3,
    language: "es",
    hashtags: ["Hola", "ViMore", "Diseño"]
  }
];

export function PostProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [posts, setPosts] = useState<Post[]>(initialMockPosts);
  const [stories, setStories] = useState<Story[]>(initialMockStories);
  const [highlights] = useState<Highlight[]>(initialHighlights);
  const [mutedUserNames, setMutedUserNames] = useState<string[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [unlikedPostIds, setUnlikedPostIds] = useState<Set<string>>(new Set());
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());
  const [pendingTransaction, setPendingTransaction] = useState<PendingTransaction | null>(null);
  
  const [followingUsernames, setFollowingUsernames] = useState<Set<string>>(new Set(["jmoore", "arivera", "schen_dev", "paul"]));
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [connections, setConnections] = useState<Connection[]>(MOCK_CONNECTIONS);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const triggerHaptic = useCallback((intensity: number = 10) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(intensity);
    }
  }, []);

  const safePersist = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      if (e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
        console.warn(`Storage quota exceeded for key: ${key}. Attempting recovery...`);
        if (key === 'vimore_local_posts' && Array.isArray(value)) {
          const tries = [3, 1, 0]; 
          for (const count of tries) {
            try {
              localStorage.setItem(key, JSON.stringify(value.slice(0, count)));
              return;
            } catch (innerE) {}
          }
        } 
        if (key === 'vimore_user') {
          localStorage.removeItem('vimore_local_posts');
          try {
            localStorage.setItem(key, JSON.stringify(value));
            return;
          } catch (innerE) {}
        }
      }
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('vimore_user');
    const savedLikes = localStorage.getItem('vimore_liked_posts');
    const savedUnlikes = localStorage.getItem('vimore_unliked_posts');
    const savedSaves = localStorage.getItem('vimore_saved_posts');
    const savedFollowing = localStorage.getItem('vimore_following');
    const savedLocalPosts = localStorage.getItem('vimore_local_posts');
    const savedPending = localStorage.getItem('vimore_pending_transaction');

    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {}
    }
    if (savedLikes) setLikedPostIds(new Set(JSON.parse(savedLikes)));
    if (savedUnlikes) setUnlikedPostIds(new Set(JSON.parse(savedUnlikes)));
    if (savedSaves) setSavedPostIds(new Set(JSON.parse(savedSaves)));
    if (savedFollowing) setFollowingUsernames(new Set(JSON.parse(savedFollowing)));
    if (savedPending) setPendingTransaction(JSON.parse(savedPending));
    
    if (savedLocalPosts) {
      try {
        setPosts([...JSON.parse(savedLocalPosts), ...initialMockPosts]);
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    safePersist('vimore_liked_posts', Array.from(likedPostIds));
  }, [likedPostIds]);

  useEffect(() => {
    safePersist('vimore_unliked_posts', Array.from(unlikedPostIds));
  }, [unlikedPostIds]);

  useEffect(() => {
    safePersist('vimore_saved_posts', Array.from(savedPostIds));
  }, [savedPostIds]);

  useEffect(() => {
    safePersist('vimore_following', Array.from(followingUsernames));
  }, [followingUsernames]);

  useEffect(() => {
    if (pendingTransaction) {
      localStorage.setItem('vimore_pending_transaction', JSON.stringify(pendingTransaction));
    } else {
      localStorage.removeItem('vimore_pending_transaction');
    }
  }, [pendingTransaction]);

  const updateCurrentUser = (data: Partial<User>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...data };
      safePersist('vimore_user', updated);
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
      language: detectedLanguage
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

  const addStory = (segmentData: Omit<StorySegment, 'id'>) => {
    const userStoryIndex = stories.findIndex(s => s.user.username === currentUser.username);
    const newSegment: StorySegment = { ...segmentData, id: Date.now().toString() };

    if (userStoryIndex !== -1) {
      setStories(prev => {
        const updated = [...prev];
        updated[userStoryIndex] = {
          ...updated[userStoryIndex],
          segments: [newSegment, ...updated[userStoryIndex].segments],
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

  const toggleFollowUser = (username: string) => {
    setFollowingUsernames(prev => {
      const next = new Set(prev);
      if (next.has(username)) next.delete(username);
      else next.add(username);
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

  const isPostLiked = (postId: string) => likedPostIds.has(postId);
  const isPostUnliked = (postId: string) => unlikedPostIds.has(postId);
  const isPostSaved = (postId: string) => savedPostIds.has(postId);
  const isFollowing = (username: string) => followingUsernames.has(username);

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

  return (
    <PostContext.Provider value={{ 
      currentUser,
      posts, 
      stories, 
      highlights, 
      mutedUserNames,
      likedPostIds,
      unlikedPostIds,
      savedPostIds,
      followingUsernames,
      activeStoryIndex, 
      connections,
      selectedPostId,
      isSearchOpen,
      pendingTransaction,
      setSearchOpen,
      setSelectedPostId,
      setActiveStoryIndex, 
      addPost, 
      deletePost,
      addStory, 
      incrementShareCount,
      voteOnStoryPoll,
      toggleMuteUser,
      togglePinPost,
      archivePost,
      updateCurrentUser,
      toggleLikePost,
      toggleUnlikePost,
      toggleSavePost,
      toggleFollowUser,
      initiateTransaction,
      cancelTransaction,
      isPostLiked,
      isPostUnliked,
      isPostSaved,
      isFollowing,
      triggerHaptic
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
