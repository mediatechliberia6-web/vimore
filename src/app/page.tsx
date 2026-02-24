
"use client";

import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { CreatePost } from "@/components/post/create-post";
import { PostCard } from "@/components/post/post-card";
import { Toaster } from "@/components/ui/toaster";

const mockPosts = [
  {
    id: "1",
    user: { name: "Julianne Moore", username: "jmoore", avatar: "https://picsum.photos/seed/50/200/200" },
    content: "Just started using ViMore and I'm loving the clean aesthetic! The lavender background is so calming. ✨",
    time: "5m",
    likes: 24,
    comments: 4,
    hashtags: ["NewBeginnings", "SocialMedia"]
  },
  {
    id: "2",
    user: { name: "Tech Explorer", username: "techex", avatar: "https://picsum.photos/seed/51/200/200" },
    content: "The AI post enhancement tool on ViMore is a game changer for content creators. Suggesting hashtags and summaries in real-time is so efficient!",
    image: "https://picsum.photos/seed/52/800/600",
    time: "22m",
    likes: 156,
    comments: 12,
    hashtags: ["GenAI", "Productivity"]
  },
  {
    id: "3",
    user: { name: "Sarah Chen", username: "schen_dev", avatar: "https://picsum.photos/seed/53/200/200" },
    content: "Working on a new project today. Feeling inspired by the community here!",
    time: "1h",
    likes: 89,
    comments: 8,
    hashtags: ["BuildingInPublic", "Developer"]
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_360px] gap-8 px-4">
        {/* Left Sidebar - Navigation */}
        <aside className="hidden md:block sticky top-0 h-screen border-r border-primary/5">
          <MainNav />
        </aside>

        {/* Main Feed */}
        <main className="py-6 space-y-8">
          <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
            <header className="sticky top-0 z-10 py-2 bg-background/80 backdrop-blur-md">
              <h1 className="font-headline font-bold text-3xl text-primary tracking-tight">Feed</h1>
            </header>
            
            <CreatePost />

            <div className="space-y-6">
              {mockPosts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Trends & Suggestions */}
        <aside className="hidden lg:block">
          <RightSidebar />
        </aside>
      </div>
      <Toaster />
    </div>
  );
}
