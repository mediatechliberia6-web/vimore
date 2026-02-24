
"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

export interface User {
  name: string;
  username: string;
  avatar: string;
  isVerified?: boolean;
  isOnline?: boolean;
  followers?: number;
  pronouns?: 'His' | 'Her';
  joinDate?: string;
  relationshipStatus?: string;
  links?: Array<{ label: string; url: string; icon: any }>;
}

export interface Mention {
  username: string;
  x: string | number; // percentage or pixels
  y: string | number; // percentage or pixels
}

export interface StoryPoll {
  question: string;
  options: { text: string; votes: number }[];
}

export interface StorySegment {
  id: string;
  image: string;
  type: 'image' | 'video';
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
  commentsDisabled?: boolean;
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
}

const PostContext = createContext<PostContextType | undefined>(undefined);

const USER_PROFILE: User = {
  name: "John Doe",
  username: "johndoe_creative",
  avatar: "https://picsum.photos/seed/me/200/200",
  pronouns: "His",
  joinDate: "January 2024",
  relationshipStatus: "Single"
};

const initialMockStories: Story[] = [
  {
    id: "s1",
    user: { name: "Alex Rivera", avatar: "https://picsum.photos/seed/1/100/100" },
    isCloseFriends: true,
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
      },
      { id: "seg2", image: "https://picsum.photos/seed/s22/800/1200", type: 'image' }
    ]
  },
  {
    id: "s2",
    user: { name: "Sarah Chen", avatar: "https://picsum.photos/seed/2/100/100" },
    segments: [
      { 
        id: "seg3", 
        image: "https://picsum.photos/seed/s3/800/1200", 
        type: 'image',
        mentions: [{ username: "schen_dev", x: "50%", y: "60%" }]
      }
    ]
  },
  {
    id: "s3",
    user: { name: "John Doe", avatar: "https://picsum.photos/seed/me/200/200" },
    viewCount: 245,
    segments: [
      { id: "seg4", image: "https://picsum.photos/seed/s4/800/1200", type: 'image' }
    ]
  },
  {
    id: "s4",
    user: { name: "Elena Gilbert", avatar: "https://picsum.photos/seed/4/100/100" },
    isCloseFriends: true,
    segments: [
      { id: "seg5", image: "https://picsum.photos/seed/s5/800/1200", type: 'image' }
    ]
  },
  {
    id: "s5",
    user: { name: "Tech Insider", avatar: "https://picsum.photos/seed/10/100/100" },
    segments: [
      { id: "seg6", image: "https://picsum.photos/seed/s6/800/1200", type: 'image' }
    ]
  }
];

const initialHighlights: Highlight[] = [
  { id: "h1", title: "SF Trip", coverImage: "https://picsum.photos/seed/h1/200/200", segments: [] },
  { id: "h2", title: "Design", coverImage: "https://picsum.photos/seed/h2/200/200", segments: [] },
  { id: "h3", title: "Vibes", coverImage: "https://picsum.photos/seed/h3/200/200", segments: [] },
  { id: "h4", title: "Work", coverImage: "https://picsum.photos/seed/h4/200/200", segments: [] },
];

const initialMockPosts: Post[] = [
  {
    id: "1",
    user: { 
      name: "Julianne Moore", 
      username: "jmoore", 
      avatar: "https://picsum.photos/seed/50/200/200",
      isVerified: true,
      isOnline: true,
      followers: 1500
    },
    content: "Just started using **ViMore** and I'm loving the clean aesthetic! Check out the multi-image carousel test. ✨ https://vimore.io",
    time: "5m",
    likes: 24,
    unlikes: 2,
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
    id: "2",
    user: { 
      name: "Tech Explorer", 
      username: "techex", 
      avatar: "https://picsum.photos/seed/51/200/200",
      isOnline: false,
      followers: 12000
    },
    content: "What should my next deep-dive tech video be about? Vote below! 🚀 https://youtube.com/tech",
    time: "22m",
    likes: 156,
    unlikes: 12,
    comments: 12,
    hashtags: ["GenAI", "Productivity"],
    poll: {
      question: "Next Video Topic?",
      options: [
        { text: "Llama 3 Local Setup", votes: 45 },
        { text: "Next.js 15 Server Actions", votes: 89 },
        { text: "WebGPU in the Browser", votes: 32 }
      ],
      totalVotes: 166,
      duration: "24 Hours"
    }
  },
  {
    id: "3",
    user: { 
      name: "Sarah Chen", 
      username: "schen_dev", 
      avatar: "https://picsum.photos/seed/53/200/200",
      isVerified: true,
      isOnline: true,
      followers: 4200
    },
    content: "Working on a new project today. Feeling _inspired_ by the community here! SF vibes are great today. 🌅",
    time: "1h",
    likes: 89,
    unlikes: 1,
    comments: 8,
    hashtags: ["BuildingInPublic", "Developer"],
    feeling: { emoji: "🚀", text: "Productive" }
  }
];

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(initialMockPosts);
  const [stories, setStories] = useState<Story[]>(initialMockStories);
  const [highlights] = useState<Highlight[]>(initialHighlights);
  const [mutedUserNames, setMutedUserNames] = useState<string[]>([]);
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);

  const addPost = (newPostData: Omit<Post, 'id' | 'time' | 'likes' | 'unlikes' | 'comments'>) => {
    const newPost: Post = {
      ...newPostData,
      id: Date.now().toString(),
      time: "Just now",
      likes: 0,
      unlikes: 0,
      comments: 0,
    };
    setPosts([newPost, ...posts]);
  };

  const addStory = (segmentData: Omit<StorySegment, 'id'>) => {
    const userStoryIndex = stories.findIndex(s => s.user.username === USER_PROFILE.username || s.user.name === USER_PROFILE.name);
    
    const newSegment: StorySegment = {
      ...segmentData,
      id: Date.now().toString(),
    };

    if (userStoryIndex !== -1) {
      setStories(prev => {
        const updated = [...prev];
        updated[userStoryIndex] = {
          ...updated[userStoryIndex],
          segments: [newSegment, ...updated[userStoryIndex].segments]
        };
        return updated;
      });
    } else {
      const newStory: Story = {
        id: Date.now().toString(),
        user: USER_PROFILE,
        segments: [newSegment],
        viewCount: 0
      };
      setStories([newStory, ...stories]);
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
          newOptions[optionIndex] = {
            ...newOptions[optionIndex],
            votes: newOptions[optionIndex].votes + 1
          };
          return {
            ...segment,
            poll: { ...segment.poll, options: newOptions }
          };
        })
      };
    }));
  };

  const toggleMuteUser = (username: string) => {
    setMutedUserNames(prev => 
      prev.includes(username) 
        ? prev.filter(u => u !== username) 
        : [...prev, username]
    );
  };

  return (
    <PostContext.Provider value={{ 
      posts, 
      stories, 
      highlights, 
      mutedUserNames,
      activeStoryIndex, 
      setActiveStoryIndex, 
      addPost, 
      addStory, 
      voteOnStoryPoll,
      toggleMuteUser
    }}>
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
