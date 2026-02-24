
"use client";

import { useState, useEffect, use } from "react";
import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { PostCard } from "@/components/post/post-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Edit2, 
  MoreHorizontal, 
  ChevronDown,
  LayoutDashboard,
  Plus,
  Volume2,
  Play,
  Star,
  AtSign,
  Zap,
  Check,
  BriefcaseBusiness,
  Trophy,
  UserPlus,
  MessageCircle,
  ExternalLink,
  Globe
} from "lucide-react";
import Link from "next/link";
import { usePosts } from "@/context/PostContext";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { aiTranslatePost } from "@/app/actions/ai";

const CURRENT_USER = {
  name: "John Doe",
  username: "johndoe_creative",
  avatar: "https://picsum.photos/seed/me/400/400"
};

const MOCK_USERS: Record<string, any> = {
  "arivera": {
    name: "Alex Rivera",
    username: "arivera",
    bio: "Product Designer & Coffee Enthusiast. Living life one pixel at a time. ☕️🎨",
    avatar: "https://picsum.photos/seed/1/400/400",
    followers: "12.2k",
    following: "890",
    posts: "342",
    category: "Designer",
    isVerified: true
  },
  "schen_dev": {
    name: "Sarah Chen",
    username: "schen_dev",
    bio: "Fullstack Dev | Building the future of social. Loves React and SF vibes. 💻🌉",
    avatar: "https://picsum.photos/seed/2/400/400",
    followers: "4.2k",
    following: "450",
    posts: "128",
    category: "Developer",
    isVerified: true
  },
  "mstone": {
    name: "Marcus Stone",
    username: "mstone",
    bio: "Photography & Travel. Capturing the world through a wide lens. 📸✈️",
    avatar: "https://picsum.photos/seed/3/400/400",
    followers: "25.1k",
    following: "1.1k",
    posts: "892",
    category: "Photographer",
    isVerified: false
  },
  "techex": {
    name: "Tech Explorer",
    username: "techex",
    bio: "Exploring the bleeding edge of AI, WebGPU, and Next.js. Let's build the future. 🚀",
    avatar: "https://picsum.photos/seed/51/200/200",
    followers: "12k",
    following: "200",
    posts: "85",
    category: "Tech Content Creator",
    isVerified: true
  },
  "jmoore": {
    name: "Julianne Moore",
    username: "jmoore",
    bio: "Aesthete and lover of clean UI. Sharing my journey in the creative space. ✨",
    avatar: "https://picsum.photos/seed/50/200/200",
    followers: "1.5k",
    following: "300",
    posts: "42",
    category: "Creative",
    isVerified: true
  }
};

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  const isMe = username === CURRENT_USER.username;
  
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedBio, setTranslatedBio] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Get user data or fallback to a generic profile for the given username
  const displayUser = MOCK_USERS[username] || {
    name: username.charAt(0).toUpperCase() + username.slice(1),
    username: username,
    bio: "Digital creator and explorer of the ViMore community. 🎨 ✨",
    avatar: `https://picsum.photos/seed/${username}/400/400`,
    followers: "1.2k",
    following: "400",
    posts: "12",
    category: "ViMore Member",
    isVerified: false
  };

  const [skills, setSkills] = useState([
    { name: "UI/UX Design", count: 42, endorsed: false },
    { name: "Mobile Photography", count: 28, endorsed: false },
    { name: "Brand Strategy", count: 15, endorsed: false },
    { name: "React Development", count: 33, endorsed: false }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator?.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handleFollow = () => {
    triggerHaptic();
    setIsFollowing(!isFollowing);
    toast({
      description: isFollowing ? `Unfollowed ${displayUser.name}` : `Following ${displayUser.name}`,
    });
  };

  const handleEndorseSkill = (idx: number) => {
    triggerHaptic();
    const newSkills = [...skills];
    if (newSkills[idx].endorsed) {
      newSkills[idx].count--;
      newSkills[idx].endorsed = false;
    } else {
      newSkills[idx].count++;
      newSkills[idx].endorsed = true;
      toast({ description: `Endorsed ${newSkills[idx].name}!` });
    }
    setSkills(newSkills);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-background flex justify-center">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_360px] gap-8 px-0 md:px-4">
        
        <aside className="hidden md:block sticky top-0 h-screen border-r border-border/50">
          <MainNav />
        </aside>

        <main className="w-full bg-white dark:bg-card min-h-screen shadow-sm">
          <header className="sticky top-0 z-50 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-b border-border h-14 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-1 cursor-pointer">
                <span className="font-bold text-lg truncate">{displayUser.name}</span>
                {displayUser.isVerified && <Check className="h-4 w-4 text-primary" />}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isMe && (
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Edit2 className="h-5 w-5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </header>

          <div className="relative">
            <div className="relative h-48 sm:h-64 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 overflow-hidden">
              <Image 
                src={`https://picsum.photos/seed/cover_${username}/1200/400`} 
                alt="Cover" 
                fill 
                className="object-cover dark:brightness-75" 
              />
            </div>

            <div className="px-4 pb-4">
              <div className="relative inline-block -mt-16 sm:-mt-24 ml-0 sm:ml-2">
                <div className="relative w-32 h-32 sm:w-44 sm:h-44">
                  <Avatar className="w-full h-full border-4 border-white dark:border-card shadow-xl">
                    <AvatarImage src={displayUser.avatar} />
                    <AvatarFallback>{displayUser.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="mt-2 space-y-1 px-1">
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{displayUser.name}</h1>
                  {isMe && (
                    <Badge variant="secondary" className="bg-secondary/50 text-[10px] font-bold">
                      His
                    </Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={cn(
                      "h-7 px-2 rounded-full gap-1.5 font-bold text-[11px]",
                      isPlayingIntro ? "bg-primary text-white" : "bg-secondary/40"
                    )}
                    onClick={() => { triggerHaptic(); setIsPlayingIntro(!isPlayingIntro); }}
                  >
                    {isPlayingIntro ? <Volume2 className="h-3.5 w-3.5 animate-pulse" /> : <Play className="h-3.5 w-3.5" />}
                    Intro
                  </Button>
                </div>
                
                <div className="flex items-center gap-6 py-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-none">{displayUser.followers}</span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Followers</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-none">{displayUser.following}</span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Following</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-none">{displayUser.posts}</span>
                    <span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Posts</span>
                  </div>
                </div>

                <p className="text-[15px] leading-relaxed mt-2">
                  {translatedBio || displayUser.bio}
                </p>

                <div className="mt-4 flex gap-2">
                  {isMe ? (
                    <>
                      <Button className="flex-1 rounded-lg gap-2 bg-primary hover:bg-primary/90 h-11 font-bold text-white shadow-lg shadow-primary/20">
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                      </Button>
                      <Button variant="secondary" className="flex-1 rounded-lg gap-2 h-11 font-bold">
                        <Plus className="h-5 w-5" />
                        Add to story
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={handleFollow}
                        className={cn(
                          "flex-1 rounded-lg gap-2 h-11 font-bold transition-all",
                          isFollowing ? "bg-secondary text-foreground hover:bg-secondary/80" : "bg-primary text-white shadow-lg shadow-primary/20"
                        )}
                      >
                        {isFollowing ? <Check className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
                        {isFollowing ? "Following" : "Follow"}
                      </Button>
                      <Link href="/messages" className="flex-1">
                        <Button variant="secondary" className="w-full rounded-lg gap-2 h-11 font-bold">
                          <MessageCircle className="h-5 w-5" />
                          Message
                        </Button>
                      </Link>
                    </>
                  )}
                </div>

                <div className="mt-6">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Star className="h-3.5 w-3.5 text-yellow-500" /> Professional Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleEndorseSkill(idx)}
                        className={cn(
                          "px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all",
                          skill.endorsed ? "bg-primary text-white" : "bg-white dark:bg-card"
                        )}
                      >
                        {skill.name}
                        <span className="bg-black/10 px-1.5 rounded">{skill.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full mt-2">
              <TabsList className="w-full h-12 bg-white dark:bg-card border-t border-b border-border/50 rounded-none p-0">
                <TabsTrigger value="all" className="flex-1 font-bold text-sm">Posts</TabsTrigger>
                <TabsTrigger value="tagged" className="flex-1 font-bold text-sm">Tagged</TabsTrigger>
                <TabsTrigger value="saved" className="flex-1 font-bold text-sm">Media</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="p-4 space-y-4">
                <PostCard 
                  id={`p_${username}`}
                  user={{ name: displayUser.name, username: displayUser.username, avatar: displayUser.avatar, isVerified: displayUser.isVerified }}
                  content={`Hello everyone! This is my first post as a ${displayUser.category}. Excited to be here on ViMore! 🚀`}
                  image={`https://picsum.photos/seed/post_${username}/800/600`}
                  time="2h ago"
                  likes={142}
                  unlikes={1}
                  comments={12}
                />
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <aside className="hidden lg:block">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
}
