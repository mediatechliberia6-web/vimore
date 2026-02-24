
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Post {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    isVerified?: boolean;
    isOnline?: boolean;
  };
  content: string;
  time: string;
  likes: number;
  comments: number;
  hashtags?: string[];
  images?: string[];
  image?: string;
  feeling?: { emoji: string; text: string };
  location?: string;
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
  };
  initialComments?: any[];
  sharedPost?: any;
}

interface PostContextType {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'time' | 'likes' | 'comments'>) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const initialMockPosts: Post[] = [
  {
    id: "1",
    user: { 
      name: "Julianne Moore", 
      username: "jmoore", 
      avatar: "https://picsum.photos/seed/50/200/200",
      isVerified: true,
      isOnline: true
    },
    content: "Just started using ViMore and I'm loving the clean aesthetic! Check out the multi-image carousel test. ✨ https://vimore.io",
    time: "5m",
    likes: 24,
    comments: 4,
    hashtags: ["NewBeginnings", "SocialMedia"],
    images: [
      "https://picsum.photos/seed/multi1/800/600",
      "https://picsum.photos/seed/multi2/800/600",
      "https://picsum.photos/seed/multi3/800/600"
    ],
    initialComments: [
      {
        id: "c1",
        user: { name: "Alex Rivera", avatar: "https://picsum.photos/seed/1/100/100" },
        text: "The aesthetic is indeed amazing! Love the carousel.",
        time: "2m",
        replies: [
          {
            id: "r1",
            user: { name: "Julianne Moore", avatar: "https://picsum.photos/seed/50/200/200" },
            text: "Thanks Alex! Glad you like it.",
            time: "1m"
          }
        ]
      }
    ]
  },
  {
    id: "share1",
    user: { 
      name: "Alex Rivera", 
      username: "arivera", 
      avatar: "https://picsum.photos/seed/1/100/100",
      isOnline: true 
    },
    content: "I totally agree with Julianne! This is a game changer for real-time social connection. 🚀",
    time: "10m",
    likes: 12,
    comments: 2,
    sharedPost: {
      id: "1",
      user: { name: "Julianne Moore", username: "jmoore", avatar: "https://picsum.photos/seed/50/200/200", isVerified: true },
      content: "Just started using ViMore and I'm loving the clean aesthetic!",
      time: "5m",
      likes: 24,
      comments: 4
    }
  },
  {
    id: "2",
    user: { 
      name: "Tech Explorer", 
      username: "techex", 
      avatar: "https://picsum.photos/seed/51/200/200",
      isOnline: false
    },
    content: "What should my next deep-dive tech video be about? Vote below! 🚀",
    time: "22m",
    likes: 156,
    comments: 12,
    hashtags: ["GenAI", "Productivity"],
    poll: {
      question: "Next Video Topic?",
      options: [
        { text: "Llama 3 Local Setup", votes: 45 },
        { text: "Next.js 15 Server Actions", votes: 89 },
        { text: "WebGPU in the Browser", votes: 32 }
      ],
      totalVotes: 166
    }
  },
  {
    id: "3",
    user: { 
      name: "Sarah Chen", 
      username: "schen_dev", 
      avatar: "https://picsum.photos/seed/53/200/200",
      isVerified: true,
      isOnline: true
    },
    content: "Working on a new project today. Feeling inspired by the community here! SF vibes are great today. 🌅",
    time: "1h",
    likes: 89,
    comments: 8,
    hashtags: ["BuildingInPublic", "Developer"],
    feeling: { emoji: "🚀", text: "Productive" }
  }
];

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialMockPosts);

  const addPost = (newPostData: Omit<Post, 'id' | 'time' | 'likes' | 'comments'>) => {
    const newPost: Post = {
      ...newPostData,
      id: Date.now().toString(),
      time: "Just now",
      likes: 0,
      comments: 0,
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <PostContext.Provider value={{ posts, addPost }}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
}
