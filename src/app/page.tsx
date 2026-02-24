"use client";

import { Header } from "@/components/layout/header";
import { CreatePost } from "@/components/post/create-post";
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
    content: "Just started using ViMore and I'm loving the clean aesthetic! The lavender background is so calming. ✨ Check out my new studio progress!",
    time: "5m",
    likes: 24,
    comments: 4,
    hashtags: ["NewBeginnings", "SocialMedia"]
  },
  {
    id: "2",
    user: { 
      name: "Tech Explorer", 
      username: "techex", 
      avatar: "https://picsum.photos/seed/51/200/200",
      isOnline: false
    },
    content: "The AI post enhancement tool on ViMore is a game changer for content creators. Suggesting hashtags and summaries in real-time is so efficient! 🚀",
    image: "https://picsum.photos/seed/52/800/600",
    time: "22m",
    likes: 156,
    comments: 12,
    hashtags: ["GenAI", "Productivity"]
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
    hashtags: ["BuildingInPublic", "Developer"]
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center">
      <Header />
      
      <div className="w-full max-w-[1440px] grid grid-cols-1 lg:grid-cols-[280px_1fr_360px] gap-8 px-4 py-6">
        {/* Left Sidebar - Navigation (Hidden on mobile) */}
        <aside className="hidden lg:block sticky top-[76px] h-[calc(100vh-76px)] overflow-y-auto">
          <MainNav />
        </aside>

        {/* Main Feed */}
        <main className="flex flex-col gap-4 w-full max-w-[680px] mx-auto">
          <Stories />
          <CreatePost />
          
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
