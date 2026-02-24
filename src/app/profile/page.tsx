
"use client";

import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { PostCard } from "@/components/post/post-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit2, MapPin, Calendar, Link as LinkIcon } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_360px] gap-8 px-4">
        {/* Left Sidebar */}
        <aside className="hidden md:block sticky top-0 h-screen border-r border-primary/5">
          <MainNav />
        </aside>

        {/* Profile Content */}
        <main className="py-6">
          <div className="max-w-2xl mx-auto w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-primary/10">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-r from-primary to-accent relative" />
            
            {/* Profile Info */}
            <div className="px-6 pb-6 relative">
              <div className="flex justify-between items-end -mt-12 mb-6">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src="https://picsum.photos/seed/me/200/200" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Button className="rounded-full px-6 bg-accent hover:bg-accent/90 text-white font-bold gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h1 className="font-headline font-bold text-2xl tracking-tight">John Doe</h1>
                  <p className="text-muted-foreground text-sm">@johndoe_creative</p>
                </div>

                <p className="text-sm leading-relaxed">
                  Passionate digital creator & designer. Building the future of social connection on ViMore. 🎨 ✨
                </p>

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-medium">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    San Francisco, CA
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <LinkIcon className="h-3.5 w-3.5" />
                    vimore.io/johndoe
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Joined March 2024
                  </div>
                </div>

                <div className="flex gap-6 pt-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">1.2k</span>
                    <span className="text-xs text-muted-foreground font-medium">Following</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">8.4k</span>
                    <span className="text-xs text-muted-foreground font-medium">Followers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full rounded-none border-b border-t bg-transparent h-14 p-0">
                <TabsTrigger 
                  value="posts" 
                  className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary font-bold transition-all"
                >
                  Posts
                </TabsTrigger>
                <TabsTrigger 
                  value="replies" 
                  className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary font-bold transition-all"
                >
                  Replies
                </TabsTrigger>
                <TabsTrigger 
                  value="media" 
                  className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary font-bold transition-all"
                >
                  Media
                </TabsTrigger>
                <TabsTrigger 
                  value="likes" 
                  className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary font-bold transition-all"
                >
                  Likes
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="p-4 space-y-4">
                <PostCard 
                  id="p1"
                  user={{ name: "John Doe", username: "johndoe_creative", avatar: "https://picsum.photos/seed/me/200/200" }}
                  content="Excited to share that I'm working on something new! Stay tuned. 🚀"
                  time="2h"
                  likes={42}
                  comments={5}
                  hashtags={["Building", "Design"]}
                />
                <PostCard 
                  id="p2"
                  user={{ name: "John Doe", username: "johndoe_creative", avatar: "https://picsum.photos/seed/me/200/200" }}
                  content="The sunsets in SF are unmatched. 🌅"
                  image="https://picsum.photos/seed/99/800/600"
                  time="1d"
                  likes={128}
                  comments={12}
                  hashtags={["SF", "Photography"]}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden lg:block">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
