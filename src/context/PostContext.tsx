"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

export interface User {
  name: string;
  username: string;
  avatar: string;
  isVerified?: boolean;
  isOnline?: boolean;
  followers?: string | number;
  following?: string | number;
  posts?: string | number;
  bio?: string;
  category?: string;
  pronouns?: 'His' | 'Her';
  joinDate?: string;
  relationshipStatus?: string;
  links?: Array<{ label: string; url: string; icon: any }>;
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
  hashtags?: string[];
  images?: string[];
  image?: string;
  imageFilter?: string;
  feeling?: { emoji: string; text: string };
  location?: string;
  theme?: string;
  language?: string; // Captured at creation
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
  activeStoryIndex: number | null;
  setActiveStoryIndex: (index: number | null) => void;
  addPost: (post: Omit<Post, 'id' | 'time' | 'likes' | 'unlikes' | 'comments'>) => void;
  addStory: (segment: Omit<StorySegment, 'id'>) => void;
  voteOnStoryPoll: (storyId: string, segmentId: string, optionIndex: number) => void;
  toggleMuteUser: (username: string) => void;
  togglePinPost: (postId: string) => void;
  archivePost: (postId: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const CURRENT_USER: User = {
  name: "John Doe",
  username: "johndoe_creative",
  avatar: "https://picsum.photos/seed/me/400/400",
  bio: "Digital creator specializing in UI/UX and mobile photography. Building ViMore community. 🎨 ✨",
  category: "Digital Creator",
  pronouns: "His",
  joinDate: "January 2024",
  relationshipStatus: "Single",
  followers: "8.4k",
  following: "1.2k",
  posts: "142"
};

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
    content: "¡Hola a todos! Estoy emocionado de probar la nueva función de traducción automática en ViMore. ¿Qué les parece?",
    time: "45m",
    likes: 88,
    unlikes: 1,
    comments: 15,
    language: "es",
    hashtags: ["Hola", "ViMore", "Diseño"]
  }
];

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialMockPosts);
  const [stories, setStories] = useState<Story[]>(initialMockStories);
  const [highlights] = useState<Highlight[]>(initialHighlights);
  const [mutedUserNames, setMutedUserNames] = useState<string[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  const addPost = (newPostData: Omit<Post, 'id' | 'time' | 'likes' | 'unlikes' | 'comments'>) => {
    const detectedLanguage = newPostData.language || (typeof window !== 'undefined' ? window.navigator.language.split('-')[0] : 'en');
    
    const newPost: Post = {
      ...newPostData,
      id: Date.now().toString(),
      time: "Just now",
      likes: 0,
      unlikes: 0,
      comments: 0,
      language: detectedLanguage
    };
    setPosts([newPost, ...posts]);
  };

  const addStory = (segmentData: Omit<StorySegment, 'id'>) => {
    const userStoryIndex = stories.findIndex(s => s.user.username === CURRENT_USER.username);
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
      setStories([{ id: Date.now().toString(), user: CURRENT_USER, segments: [newSegment], viewCount: 0 }, ...stories]);
    }
  };

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

  return (
    <PostContext.Provider value={{ 
      currentUser: CURRENT_USER,
      posts, 
      stories, 
      highlights, 
      mutedUserNames,
      activeStoryIndex, 
      setActiveStoryIndex, 
      addPost, 
      addStory, 
      voteOnStoryPoll,
      toggleMuteUser,
      togglePinPost,
      archivePost
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
