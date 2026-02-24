
"use client";

import { useState, useEffect } from "react";
import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { PostCard } from "@/components/post/post-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
  Volume2,
  Play,
  Users,
  Trophy,
  Star,
  Users2,
  Bookmark,
  AtSign,
  Pin,
  Gift,
  Languages,
  Zap,
  Check,
  BriefcaseBusiness
} from "lucide-react";
import Link from "next/link";
import { usePosts } from "@/context/PostContext";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { aiTranslatePost } from "@/app/actions/ai";

export default function ProfilePage() {
  const { highlights } = usePosts();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedBio, setTranslatedBio] = useState<string | null>(null);
  
  // Skills state
  const [skills, setSkills] = useState([
    { name: "UI/UX Design", count: 42, endorsed: false },
    { name: "Mobile Photography", count: 28, endorsed: false },
    { name: "Brand Strategy", count: 15, endorsed: false },
    { name: "React Development", count: 33, endorsed: false }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Profile Visit",
        description: "Sarah Chen just visited your profile.",
      });
    }, 1200);
    return () => clearTimeout(timer);
  }, [toast]);
  
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
    hasCoverVideo: true,
    coverVideoUrl: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    links: [
      { label: "Portfolio", url: "https://johndoe.design", icon: Globe },
      { label: "Latest Project", url: "https://vimore.io", icon: ExternalLink }
    ],
    portfolio: [
      { id: 1, title: "ViMore App UI", image: "https://picsum.photos/seed/p1/400/300", tag: "Design" },
      { id: 2, title: "Sunset Series", image: "https://picsum.photos/seed/p2/400/300", tag: "Photography" },
      { id: 3, title: "Brand Identity", image: "https://picsum.photos/seed/p3/400/300", tag: "Branding" }
    ],
    mutualFriends: [
      { name: "Sarah Chen", avatar: "https://picsum.photos/seed/2/100/100" },
      { name: "Alex Rivera", avatar: "https://picsum.photos/seed/1/100/100" },
      { name: "Marcus Stone", avatar: "https://picsum.photos/seed/3/100/100" }
    ],
    mutualCount: 15,
    topContributors: [
      { name: "Elena Gilbert", avatar: "https://picsum.photos/seed/4/100/100", role: "Top Fan", color: "bg-yellow-500" },
      { name: "Marcus Stone", avatar: "https://picsum.photos/seed/3/100/100", role: "Rising Star", color: "bg-blue-500" },
      { name: "Sarah Chen", avatar: "https://picsum.photos/seed/2/100/100", role: "Supporter", color: "bg-green-500" }
    ],
    followsYou: true
  };

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handleCopyBio = () => {
    triggerHaptic();
    navigator.clipboard.writeText(user.bio);
    toast({
      description: "Bio copied to clipboard!",
    });
  };

  const toggleVoiceIntro = () => {
    triggerHaptic();
    setIsPlayingIntro(!isPlayingIntro);
    toast({
      description: isPlayingIntro ? "Voice intro stopped." : "Playing voice intro...",
    });
  };

  const handleTranslateBio = async () => {
    if (translatedBio) {
      setTranslatedBio(null);
      return;
    }
    triggerHaptic();
    setIsTranslating(true);
    try {
      const res = await aiTranslatePost({ postContent: user.bio, targetLanguage: "Spanish" });
      setTranslatedBio(res.translation);
      toast({ description: "Bio translated to Spanish ✨" });
    } catch (e) {
      toast({ variant: "destructive", description: "Translation failed" });
    } finally {
      setIsTranslating(false);
    }
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

  const handleSendGift = () => {
    triggerHaptic();
    toast({
      title: "Gifting Initialized",
      description: "Redirecting to secure virtual gift store...",
    });
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
              <div className="flex items-center gap-1 cursor-pointer group">
                {isLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  <>
                    <span className="font-bold text-lg truncate max-w-[120px] sm:max-w-none">{user.name}</span>
                    <div className="relative">
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      <Badge className="absolute -top-3 -right-4 h-5 min-w-[20px] px-1 flex items-center justify-center bg-destructive text-white border-2 border-white dark:border-card text-[9px] font-bold">
                        9+
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleSendGift}>
                <Gift className="h-5 w-5 text-primary" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Edit2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </header>

          <div className="relative">
            <div className="relative h-48 sm:h-64 md:h-72 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 overflow-hidden group/cover">
              {isLoading ? (
                <Skeleton className="w-full h-full rounded-none" />
              ) : user.hasCoverVideo ? (
                <video 
                  src={user.coverVideoUrl} 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                  className="w-full h-full object-cover dark:brightness-75 transition-all duration-700"
                />
              ) : (
                <Image 
                  src="https://picsum.photos/seed/cover/1200/400" 
                  alt="Cover" 
                  fill 
                  className="object-cover dark:brightness-75" 
                />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/10 transition-colors" />
              <Button 
                size="icon" 
                variant="secondary" 
                className="absolute bottom-4 right-4 rounded-full shadow-lg h-9 w-9 bg-white/90 hover:bg-white z-10"
              >
                <Camera className="h-5 w-5 text-foreground" />
              </Button>
            </div>

            <div className="px-4 pb-4">
              <div className="relative inline-block -mt-16 sm:-mt-24 ml-0 sm:ml-2">
                <div className="relative w-32 h-32 sm:w-44 sm:h-44">
                  {isLoading ? (
                    <Skeleton className="w-full h-full rounded-full border-4 border-white dark:border-card shadow-xl" />
                  ) : (
                    <Avatar className="w-full h-full border-4 border-white dark:border-card shadow-xl">
                      <AvatarImage src="https://picsum.photos/seed/me/400/400" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                  )}
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute bottom-2 right-2 rounded-full border-2 border-white dark:border-card shadow-md h-8 w-8 sm:h-10 sm:w-10 bg-[#E4E6EB] hover:bg-[#D8DADF]"
                  >
                    <Camera className="h-4 w-4 sm:h-5 w-5 text-foreground" />
                  </Button>
                </div>
              </div>

              <div className="mt-2 space-y-1 px-1">
                <div className="flex items-center flex-wrap gap-2">
                  {isLoading ? (
                    <Skeleton className="h-8 w-48" />
                  ) : (
                    <>
                      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{user.name}</h1>
                      <Badge variant="secondary" className="bg-secondary/50 text-[10px] font-bold py-0.5 px-2">
                        {user.pronouns}
                      </Badge>
                      {user.followsYou && (
                        <Badge variant="outline" className="text-[9px] font-bold text-muted-foreground uppercase py-0.5 px-2 border-muted-foreground/20">
                          Follows You
                        </Badge>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "h-7 px-2 rounded-full gap-1.5 font-bold text-[11px] transition-all",
                          isPlayingIntro ? "bg-primary text-white" : "bg-secondary/40 text-muted-foreground hover:bg-secondary"
                        )}
                        onClick={toggleVoiceIntro}
                      >
                        {isPlayingIntro ? <Volume2 className="h-3.5 w-3.5 animate-pulse" /> : <Play className="h-3.5 w-3.5" />}
                        {isPlayingIntro ? "Playing Intro" : "Play Intro"}
                      </Button>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-6 py-2">
                  {isLoading ? (
                    [1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-16" />)
                  ) : (
                    <>
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
                    </>
                  )}
                </div>

                <div className="py-2">
                  {isLoading ? (
                    <Skeleton className="h-6 w-64" />
                  ) : (
                    <div className="flex items-center gap-2 group cursor-pointer">
                      <div className="flex -space-x-2">
                        {user.mutualFriends.map((friend, idx) => (
                          <Avatar key={idx} className="h-6 w-6 border-2 border-white dark:border-card">
                            <AvatarImage src={friend.avatar} />
                            <AvatarFallback>{friend.name[0]}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <p className="text-[12px] text-muted-foreground">
                        Followed by <span className="font-bold text-foreground hover:underline">{user.mutualFriends[0].name}</span> and <span className="font-bold text-foreground">{user.mutualCount} others</span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-3 relative group">
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start gap-4">
                        <p className="text-[15px] leading-relaxed text-foreground flex-1">
                          {translatedBio || user.bio}
                        </p>
                        <div className="flex flex-col gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleCopyBio}
                            title="Copy bio"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={cn("h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity", translatedBio && "text-primary opacity-100")}
                            onClick={handleTranslateBio}
                            disabled={isTranslating}
                            title="Translate bio"
                          >
                            {isTranslating ? <Zap className="h-3.5 w-3.5 animate-spin" /> : <Languages className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {isLoading ? (
                    <Skeleton className="h-8 w-32" />
                  ) : user.links.map((link, idx) => (
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
                          skill.endorsed 
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" 
                            : "bg-white dark:bg-card border-border hover:border-primary/40 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {skill.name}
                        <span className={cn(
                          "px-1.5 py-0.5 rounded-md text-[10px]",
                          skill.endorsed ? "bg-white/20" : "bg-secondary"
                        )}>
                          {skill.count}
                        </span>
                        {skill.endorsed && <Check className="h-3 w-3" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex gap-2">
                  <Button 
                    className="flex-1 rounded-lg gap-2 bg-primary hover:bg-primary/90 h-11 font-bold text-white shadow-lg shadow-primary/20"
                    onClick={() => { triggerHaptic(); }}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="flex-1 rounded-lg gap-2 h-11 bg-secondary hover:bg-secondary/80 font-bold"
                    onClick={() => { triggerHaptic(); }}
                  >
                    <Plus className="h-5 w-5" />
                    Add to story
                  </Button>
                </div>

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

            <div className="px-4 py-6 border-t border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-primary" /> Portfolio Showcase
                </h3>
                <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">View full portfolio</Button>
              </div>
              <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex w-max space-x-4 pb-4">
                  {user.portfolio.map((item) => (
                    <div key={item.id} className="relative w-72 group cursor-pointer">
                      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-sm">
                        <Image src={item.image} alt={item.title} fill className="object-cover transition-transform group-hover:scale-105 duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                          <Button variant="secondary" size="sm" className="rounded-full gap-2 h-8 text-[11px] font-bold">
                            View Case Study <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                        <Badge className="absolute top-3 left-3 bg-white/90 text-black border-none text-[10px] font-bold">
                          {item.tag}
                        </Badge>
                      </div>
                      <h4 className="mt-2 text-sm font-bold px-1 group-hover:text-primary transition-colors">{item.title}</h4>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" className="opacity-0" />
              </ScrollArea>
            </div>

            <Tabs defaultValue="all" className="w-full mt-2">
              <TabsList className="w-full h-12 bg-white dark:bg-card border-t border-b border-border/50 rounded-none p-0 overflow-x-auto">
                <TabsTrigger 
                  value="all" 
                  className="flex-1 min-w-[80px] h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-primary font-bold text-sm"
                >
                  All
                </TabsTrigger>
                <TabsTrigger 
                  value="tagged" 
                  className="flex-1 min-w-[80px] h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-primary font-bold text-sm"
                >
                  Tagged
                </TabsTrigger>
                <TabsTrigger 
                  value="saved" 
                  className="flex-1 min-w-[80px] h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-primary font-bold text-sm"
                >
                  Saved
                </TabsTrigger>
                <TabsTrigger 
                  value="reels" 
                  className="flex-1 min-w-[80px] h-full rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[3px] data-[state=active]:border-primary data-[state=active]:text-primary font-bold text-sm"
                >
                  Reels
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="p-4 space-y-6">
                <Card className="rounded-2xl border border-border shadow-sm overflow-hidden bg-white dark:bg-card/50">
                  <CardHeader className="pb-3 pt-4 px-4 flex flex-row items-center justify-between border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <CardTitle className="text-lg font-bold">Top Contributors</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary text-xs font-bold">See all</Button>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-4">
                      {user.topContributors.map((contributor, idx) => (
                        <div key={idx} className="flex items-center justify-between group">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10 border border-primary/10">
                                <AvatarImage src={contributor.avatar} />
                                <AvatarFallback>{contributor.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className={cn("absolute -bottom-1 -right-1 rounded-full p-0.5 border-2 border-white dark:border-card", contributor.color)}>
                                <Star className="h-2 w-2 text-white fill-current" />
                              </div>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">{contributor.name}</span>
                              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">{contributor.role}</span>
                            </div>
                          </div>
                          <Button variant="secondary" size="sm" className="h-8 rounded-full text-[11px] font-bold bg-secondary hover:bg-primary hover:text-white transition-all">
                            Send thanks
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-lg">Recent Activity</h3>
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                      <Pin className="h-3 w-3 text-primary" /> Pinned posts first
                    </div>
                  </div>
                  
                  <PostCard 
                    id="p_pinned"
                    user={{ name: "John Doe", username: "johndoe_creative", avatar: "https://picsum.photos/seed/me/200/200", isVerified: true, followers: 8400 }}
                    content="Always excited to share new UI explorations. This is my latest project for a social hub. ✨ #UIUX #Design"
                    image="https://picsum.photos/seed/pinned/800/600"
                    time="Pinned"
                    likes={1540}
                    unlikes={12}
                    comments={88}
                    isPinned={true}
                  />

                  <PostCard 
                    id="p1"
                    user={{ name: "John Doe", username: "johndoe_creative", avatar: "https://picsum.photos/seed/me/200/200", isVerified: true, followers: 8400 }}
                    content="The sunsets in SF are unmatched. 🌅 This is why I love building here. #Design #SF"
                    image="https://picsum.photos/seed/99/800/600"
                    time="1d"
                    likes={128}
                    unlikes={5}
                    comments={12}
                  />
                </div>
              </TabsContent>

              <TabsContent value="tagged" className="p-4 space-y-4">
                 <div className="flex flex-col items-center justify-center py-12 text-center bg-secondary/10 rounded-2xl border-2 border-dashed border-border/50">
                    <AtSign className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-bold text-lg">Posts you're tagged in</h3>
                    <p className="text-sm text-muted-foreground max-w-[240px] mt-1">When people tag you in photos or videos, they'll appear here.</p>
                 </div>
                 <PostCard 
                    id="t1"
                    user={{ name: "Sarah Chen", username: "schen_dev", avatar: "https://picsum.photos/seed/2/200/200", isVerified: true }}
                    content="Collaborating with @johndoe_creative on this new feature has been incredible! 🚀"
                    image="https://picsum.photos/seed/tag1/800/600"
                    time="2d"
                    likes={342}
                    unlikes={2}
                    comments={24}
                  />
              </TabsContent>

              <TabsContent value="saved" className="p-4 space-y-4">
                 <div className="flex items-center justify-between px-1 mb-2">
                    <div className="flex items-center gap-2">
                       <Bookmark className="h-5 w-5 text-primary" />
                       <h3 className="font-bold text-lg">Your Saved Items</h3>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary px-2 py-1 rounded-md">Private to you</span>
                 </div>
                 <PostCard 
                    id="s1"
                    user={{ name: "Tech Insider", username: "tech_hub", avatar: "https://picsum.photos/seed/10/200/200", isVerified: true }}
                    content="Top 10 Design Trends for 2024. Save this for your next project! 🎨"
                    image="https://picsum.photos/seed/saved1/800/600"
                    time="Saved 3h ago"
                    likes={4500}
                    unlikes={45}
                    comments={320}
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
