
"use client";

import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { PostCard } from "@/components/post/post-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
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
  Rss,
  Copy,
  Calendar,
  Heart,
  Globe,
  ExternalLink,
  Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import { usePosts } from "@/context/PostContext";
import Image from "next/image";

export default function ProfilePage() {
  const { highlights } = usePosts();
  const { toast } = useToast();
  
  const user = {
    name: "John Doe",
    username: "johndoe_creative",
    pronouns: "His" as const,
    joinDate: "January 2024",
    relationshipStatus: "Single",
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
    birthday: "March 15",
    links: [
      { label: "Portfolio", url: "https://johndoe.design", icon: Globe },
      { label: "Latest Project", url: "https://vimore.io", icon: ExternalLink }
    ]
  };

  const handleCopyBio = () => {
    navigator.clipboard.writeText(user.bio);
    toast({
      description: "Bio copied to clipboard!",
    });
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
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{user.name}</h1>
                  <Badge variant="secondary" className="bg-secondary/50 text-[10px] font-bold py-0.5 px-2">
                    {user.pronouns}
                  </Badge>
                </div>
                
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

                {/* Bio & Links */}
                <div className="mt-3 relative group">
                  <p className="text-[15px] leading-relaxed text-foreground pr-8">
                    {user.bio}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-0 top-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleCopyBio}
                    title="Copy bio"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>

                {/* Link-in-Bio Tree */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {user.links.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/30 hover:bg-secondary/50 rounded-full text-xs font-bold transition-colors border border-primary/5"
                    >
                      <link.icon className="h-3 w-3 text-primary" />
                      {link.label}
                    </a>
                  ))}
                </div>

                {/* Metadata Badges */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <div className="flex items-center gap-3 text-[14px]">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground">Category: <span className="font-bold text-foreground">{user.category}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-[14px]">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground">From <span className="font-bold text-foreground">{user.location}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-[14px]">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground">Education: <span className="font-bold text-foreground">{user.education}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-[14px]">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground">Joined <span className="font-bold text-foreground">{user.joinDate}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-[14px]">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-muted-foreground">Status: <span className="font-bold text-foreground">{user.relationshipStatus}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-[14px]">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold text-primary flex items-center gap-1">
                      {user.social} <span className="text-muted-foreground font-normal text-xs">({user.socialHandle})</span>
                    </span>
                  </div>
                </div>

                {/* Main Action Bar */}
                <div className="mt-8 flex gap-2">
                  <Button className="flex-1 rounded-lg gap-2 bg-primary hover:bg-primary/90 h-11 font-bold text-white shadow-lg shadow-primary/20">
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Button>
                  <Button variant="secondary" className="flex-1 rounded-lg gap-2 h-11 bg-secondary hover:bg-secondary/80 font-bold">
                    <Plus className="h-5 w-5" />
                    Add to story
                  </Button>
                </div>

                {/* Highlights Section */}
                <div className="mt-8">
                  <ScrollArea className="w-full whitespace-nowrap">
                    <div className="flex w-max space-x-4 p-1 pb-4">
                      {highlights.map((highlight) => (
                        <div key={highlight.id} className="flex flex-col items-center gap-2 group cursor-pointer">
                          <div className="relative h-20 w-20 rounded-full p-1 border-2 border-primary/20 group-hover:border-primary transition-colors">
                            <div className="relative h-full w-full rounded-full overflow-hidden">
                              <Image 
                                src={highlight.coverImage} 
                                alt={highlight.title} 
                                fill 
                                className="object-cover transition-transform group-hover:scale-110 duration-500" 
                              />
                            </div>
                          </div>
                          <span className="text-xs font-bold text-foreground">{highlight.title}</span>
                        </div>
                      ))}
                      <div className="flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="h-20 w-20 rounded-full border-2 border-dashed border-border flex items-center justify-center group-hover:bg-secondary transition-colors">
                          <Plus className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">New</span>
                      </div>
                    </div>
                    <ScrollBar orientation="horizontal" className="opacity-0" />
                  </ScrollArea>
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
