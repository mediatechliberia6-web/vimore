
"use client";

import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { PostCard } from "@/components/post/post-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Camera, 
  Edit2, 
  Search, 
  MoreHorizontal, 
  ChevronDown,
  LayoutDashboard,
  Plus,
  MapPin,
  GraduationCap,
  Instagram,
  Briefcase,
  Cake,
  Home as HomeIcon,
  Rss
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const user = {
    name: "John Doe",
    username: "johndoe_creative",
    followers: "8.4k",
    following: "1.2k",
    posts: "142",
    bio: "Digital creator specializing in UI/UX and mobile photography. Building ViMore community. 🎨 ✨",
    category: "Digital Creator",
    location: "Monrovia, Liberia",
    education: "Start University",
    social: "Instagram",
    socialHandle: "@johndoe_inst",
    hometown: "Lagos, Nigeria",
    birthday: "March 15"
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-background flex justify-center">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_360px] gap-8 px-0 md:px-4">
        
        {/* Left Sidebar */}
        <aside className="hidden md:block sticky top-0 h-screen border-r border-border/50">
          <MainNav />
        </aside>

        {/* Profile Content */}
        <main className="w-full bg-white dark:bg-card min-h-screen shadow-sm">
          {/* Navigation Header */}
          <header className="sticky top-0 z-50 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-b border-border h-14 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-1 cursor-pointer group">
                <span className="font-bold text-lg truncate max-w-[120px] sm:max-w-none">{user.name}</span>
                <div className="relative">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  <Badge className="absolute -top-3 -right-4 h-5 min-w-[20px] px-1 flex items-center justify-center bg-destructive text-white border-2 border-white dark:border-card text-[9px] font-bold">
                    9+
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Edit2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </header>

          <div className="relative">
            {/* Hero Section - Cover Photo */}
            <div className="relative h-48 sm:h-64 md:h-72 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 overflow-hidden">
              <Avatar className="w-full h-full rounded-none">
                <AvatarImage src="https://picsum.photos/seed/cover/1200/400" className="object-cover" />
                <AvatarFallback className="rounded-none">Cover</AvatarFallback>
              </Avatar>
              <Button 
                size="icon" 
                variant="secondary" 
                className="absolute bottom-4 right-4 rounded-full shadow-lg h-9 w-9 bg-white/90 hover:bg-white"
              >
                <Camera className="h-5 w-5 text-foreground" />
              </Button>
            </div>

            {/* Profile Identity - Avatar Overlap */}
            <div className="px-4 pb-4">
              <div className="relative inline-block -mt-16 sm:-mt-24 ml-0 sm:ml-2">
                <div className="relative w-32 h-32 sm:w-44 sm:h-44">
                  <Avatar className="w-full h-full border-4 border-white dark:border-card shadow-xl">
                    <AvatarImage src="https://picsum.photos/seed/me/400/400" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute bottom-2 right-2 rounded-full border-2 border-white dark:border-card shadow-md h-8 w-8 sm:h-10 sm:w-10 bg-[#E4E6EB] hover:bg-[#D8DADF]"
                  >
                    <Camera className="h-4 w-4 sm:h-5 w-5 text-foreground" />
                  </Button>
                </div>
              </div>

              {/* Identity Info */}
              <div className="mt-2 space-y-1 px-1">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{user.name}</h1>
                
                {/* Stats Row */}
                <div className="flex items-center gap-6 py-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-none">{user.followers}</span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Followers</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-none">{user.following}</span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Following</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-none">{user.posts}</span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Posts</span>
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-3">
                  <p className="text-[15px] leading-relaxed text-foreground">
                    {user.bio} <span className="font-bold cursor-pointer hover:underline">See more</span>
                  </p>
                </div>

                {/* Metadata Badges */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 text-[15px]">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{user.category}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[15px]">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">From <span className="font-bold">{user.location}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-[15px]">
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">Went to <span className="font-bold">{user.education}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-[15px]">
                    <Instagram className="h-5 w-5 text-muted-foreground" />
                    <span className="font-bold text-primary flex items-center gap-1">
                      {user.social} <span className="text-muted-foreground font-normal">({user.socialHandle})</span>
                    </span>
                  </div>
                </div>

                {/* Main Action Bar */}
                <div className="mt-6 flex gap-2">
                  <Button className="flex-1 rounded-lg gap-2 bg-primary hover:bg-primary/90 h-11 font-bold">
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Button>
                  <Button variant="secondary" className="flex-1 rounded-lg gap-2 h-11 bg-secondary hover:bg-secondary/80 font-bold">
                    <Plus className="h-5 w-5" />
                    Add to story
                  </Button>
                </div>
              </div>
            </div>

            {/* Tabs & Content */}
            <Tabs defaultValue="all" className="w-full mt-2">
              <TabsList className="w-full h-12 bg-white dark:bg-card border-t border-b border-border/50 rounded-none p-0">
                <TabsTrigger 
                  value="all" 
                  className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-primary font-bold text-sm"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="reels" 
                  className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-primary font-bold text-sm"
                >
                  Reels
                </TabsTrigger>
                <TabsTrigger 
                  value="photos" 
                  className="flex-1 h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-primary font-bold text-sm"
                >
                  Photos
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="p-4 space-y-6">
                {/* Personal Details Card */}
                <Card className="rounded-2xl border border-border shadow-sm overflow-hidden bg-white dark:bg-card/50">
                  <CardHeader className="pb-3 pt-4 px-4 flex flex-row items-center justify-between border-b border-border/50">
                    <CardTitle className="text-lg font-bold">Personal details</CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-5 py-5 px-4">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 bg-secondary rounded-full flex items-center justify-center shrink-0">
                        <HomeIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">Home Town</span>
                        <span className="font-bold text-[15px]">{user.hometown}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 bg-secondary rounded-full flex items-center justify-center shrink-0">
                        <MapPin className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">Current City</span>
                        <span className="font-bold text-[15px]">{user.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 bg-secondary rounded-full flex items-center justify-center shrink-0">
                        <Cake className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">Birthday</span>
                        <span className="font-bold text-[15px]">{user.birthday}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 bg-secondary rounded-full flex items-center justify-center shrink-0">
                        <Rss className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none mb-1">Followed by</span>
                        <span className="font-bold text-[15px]">{user.followers} people</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Post Feed Example */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg px-1">Recent Activity</h3>
                  <PostCard 
                    id="p1"
                    user={{ name: "John Doe", username: "johndoe_creative", avatar: "https://picsum.photos/seed/me/200/200", isVerified: true }}
                    content="The sunsets in SF are unmatched. 🌅 This is why I love building here. #Design #SF"
                    image="https://picsum.photos/seed/99/800/600"
                    time="1d"
                    likes={128}
                    unlikes={5}
                    comments={12}
                  />
                </div>
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
