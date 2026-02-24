"use client";

import { Header } from "@/components/layout/header";
import { PostCard } from "@/components/post/post-card";
import { Stories } from "@/components/feed/stories";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { MainNav } from "@/components/layout/main-nav";
import { Toaster } from "@/components/ui/toaster";

const mockPosts = [
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

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#080808] flex flex-col items-center transition-colors duration-300">
      <Header />
      
      <div className="w-full max-w-[1440px] grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-8 px-4 py-6">
        {/* Left Sidebar - Navigation (Hidden on mobile) */}
        <aside className="hidden lg:block sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto">
          <MainNav />
        </aside>

        {/* Main Feed */}
        <main className="flex flex-col gap-4 w-full max-w-[680px] mx-auto">
          <Stories />
          
          <div className="flex flex-col gap-1">
            {mockPosts.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}
          </div>
        </main>

        {/* Right Sidebar - Trends & Suggestions (Hidden on mobile) */}
        <aside className="hidden lg:block sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto">
          <RightSidebar />
        </aside>
      </div>
      
      <Toaster />
    </div>
  );
}
