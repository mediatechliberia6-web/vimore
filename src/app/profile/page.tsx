
"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { MainNav } from "@/components/layout/main-nav";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { PostCard } from "@/components/post/post-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMusic } from "@/context/MusicContext";
import { CreateStoryModal } from "@/components/feed/create-story-modal";
import { ImageRefinementPortal } from "@/components/profile/image-refinement-portal";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Camera, 
  Edit2, 
  MoreHorizontal, 
  LayoutDashboard,
  Plus,
  Volume2,
  Play,
  Star,
  Zap,
  Languages,
  AtSign,
  Briefcase,
  GraduationCap,
  Heart,
  Cake,
  Calendar,
  Lock,
  Clock,
  Music as MusicIcon,
  Trash2,
  Loader2,
  Clapperboard,
  Image as ImageIcon,
  CheckCircle2,
  Globe,
  Users
} from "lucide-react";
import Link from "next/link";
import { usePosts } from "@/context/PostContext";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { aiTranslatePost } from "@/app/actions/ai";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

const USER_CATEGORIES = [
  "Digital Creator",
  "Product Architect",
  "Visual Storyteller",
  "Fullstack Developer",
  "Sonic Producer"
];

const RELATIONSHIP_STATUSES = [
  "Single",
  "In a Handshake",
  "Synchronized",
  "Exploring"
];

const NATIONALITIES = [
  "Liberian", "American", "Nigerian", "Ghanian", "Guinean", "Sierra Leonean", "Ivory Coast", "European", "Asian", "Other"
];

export function InfoNode({ icon: Icon, label, value, colorClass }: { icon: any, label: string, value: string, colorClass: string }) {
  return (
    <div className="flex items-center gap-3 group/node">
      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center transition-transform group-hover/node:scale-110", colorClass)}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 leading-none mb-1">{label}</span>
        <span className="text-sm font-bold text-foreground leading-none truncate">{value}</span>
      </div>
    </div>
  );
}

export default function MyProfilePage() {
  const { currentUser, posts, updateCurrentUser, isPostSaved, addPost, followingUsernames, toggleFollowUser, setSelectedPostId, setSelectedImageUrl, triggerHaptic } = usePosts();
  const { currentTrack, isExpanded, userSongs } = useMusic();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedBio, setTranslatedBio] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isUploadingIntro, setIsUploadingIntro] = useState(false);
  const [deviceLanguage, setDeviceLanguage] = useState<string | null>(null);
  
  const [refiningImage, setRefiningImage] = useState<string | null>(null);
  const [refiningMode, setRefiningMode] = useState<"avatar" | "cover">("avatar");
  const [isRefinementOpen, setIsRefinementOpen] = useState(false);

  const [visualToDelete, setVisualToDelete] = useState<"avatar" | "cover" | null>(null);

  const isPlayerActive = currentTrack && !isExpanded;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const introInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDeviceLanguage(window.navigator.language.split('-')[0]);
    }
  }, []);

  const [editData, setEditData] = useState({
    name: currentUser.name,
    category: currentUser.category || USER_CATEGORIES[0],
    bio: currentUser.bio || "",
    pronouns: currentUser.pronouns || "",
    profession: currentUser.profession || "",
    school: currentUser.school || "",
    relationshipStatus: currentUser.relationshipStatus || RELATIONSHIP_STATUSES[0],
    dateOfBirth: currentUser.dateOfBirth || "",
    nationality: currentUser.nationality || NATIONALITIES[0],
    gender: currentUser.gender || 'Male'
  });

  const handleSaveProfile = () => {
    triggerHaptic(25);
    const updates: Partial<any> = { ...editData };
    const now = Date.now();
    if (editData.name !== currentUser.name) updates.lastModifiedName = now;
    if (editData.dateOfBirth !== currentUser.dateOfBirth) updates.lastModifiedDob = now;
    updateCurrentUser(updates);
    setIsEditModalOpen(false);
    toast({ title: "Identity Re-calibrated" });
  };

  const isNameLocked = currentUser.lastModifiedName ? (Date.now() - currentUser.lastModifiedName < NINETY_DAYS_MS) : false;
  const isDobLocked = currentUser.lastModifiedDob ? (Date.now() - currentUser.lastModifiedDob < NINETY_DAYS_MS) : false;

  const getNameLockRemaining = () => {
    if (!currentUser.lastModifiedName) return 0;
    const remaining = NINETY_DAYS_MS - (Date.now() - currentUser.lastModifiedName);
    return Math.ceil(remaining / (1000 * 60 * 60 * 24));
  };

  const getDobLockRemaining = () => {
    if (!currentUser.lastModifiedDob) return 0;
    const remaining = NINETY_DAYS_MS - (Date.now() - currentUser.lastModifiedDob);
    return Math.ceil(remaining / (1000 * 60 * 60 * 24));
  };

  const myPosts = useMemo(() => posts.filter(p => p.user.username === currentUser.username), [posts, currentUser.username]);
  const myReels = useMemo(() => myPosts.filter(p => p.videoUrl), [myPosts]);
  
  const postedImages = useMemo(() => {
    const list: string[] = [];
    myPosts.forEach(p => {
      if (p.image) list.push(p.image);
      if (p.images) list.push(...p.images);
    });
    return Array.from(new Set(list));
  }, [myPosts]);

  const formattedDob = useMemo(() => {
    if (!currentUser.dateOfBirth) return null;
    const date = new Date(currentUser.dateOfBirth);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }, [currentUser.dateOfBirth]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] dark:bg-background flex justify-center">
      <div className="max-w-[1440px] w-full grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[280px_1fr_360px] gap-8 px-0 md:px-4">
        
        <aside className={cn("hidden md:block sticky h-screen border-r border-border/50 transition-all duration-300", isPlayerActive ? "top-16" : "top-0")}>
          <MainNav />
        </aside>

        <main className={cn("w-full bg-white dark:bg-card min-h-screen shadow-sm transition-all duration-300", isPlayerActive ? "pt-[64px]" : "pt-0")}>
          <header className="sticky top-0 z-50 bg-white/95 dark:bg-card/95 backdrop-blur-sm border-b border-border h-14 px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/"><Button variant="ghost" size="icon" className="rounded-full"><ArrowLeft className="h-5 w-5" /></Button></Link>
              <div className="flex items-center gap-1">
                <h1 className="font-bold text-lg tracking-tight">Digital Workspace</h1>
                {currentUser.isVerified && <CheckCircle2 className="h-4 w-4 text-primary fill-primary text-white" />}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => { triggerHaptic(5); setIsEditModalOpen(true); }}><Edit2 className="h-5 w-5" /></Button>
                <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-primary/10">
                  <DialogHeader className="p-6 bg-primary/5 border-b border-primary/10"><DialogTitle className="font-black italic uppercase tracking-widest text-2xl">Identity Calibration</DialogTitle></DialogHeader>
                  <ScrollArea className="max-h-[70vh]">
                    <div className="p-6 space-y-8">
                      <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Spatial Lock</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Signature Label (Name)</Label>{isNameLocked && <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[8px] font-black h-4 px-2 uppercase"><Clock className="h-2.5 w-2.5 mr-1" /> LOCK: {getNameLockRemaining()}D</Badge>}</div>
                            <Input disabled={isNameLocked} value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} className="rounded-xl bg-secondary/20 border-none h-12" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Arrival Date (DOB)</Label>{isDobLocked && <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[8px] font-black h-4 px-2 uppercase"><Clock className="h-2.5 w-2.5 mr-1" /> LOCK: {getDobLockRemaining()}D</Badge>}</div>
                            <Input type="date" disabled={isDobLocked} value={editData.dateOfBirth} onChange={(e) => setEditData({ ...editData, dateOfBirth: e.target.value })} className="rounded-xl bg-secondary/20 border-none h-12" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Identity Tones</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nationality</Label>
                            <Select value={editData.nationality} onValueChange={(val) => setEditData({ ...editData, nationality: val })}><SelectTrigger className="h-12 rounded-xl bg-secondary/20 border-none px-4"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl">{NATIONALITIES.map(n => <SelectItem key={n} value={n} className="font-bold">{n}</SelectItem>)}</SelectContent></Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Gender Signature</Label>
                            <Select value={editData.gender} onValueChange={(val: any) => setEditData({ ...editData, gender: val })}><SelectTrigger className="h-12 rounded-xl bg-secondary/20 border-none px-4"><SelectValue /></SelectTrigger><SelectContent className="rounded-xl"><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select>
                          </div>
                        </div>
                        <div className="space-y-2"><Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Vibe Manifesto (Bio)</Label><Textarea value={editData.bio} onChange={(e) => setEditData({ ...editData, bio: e.target.value })} className="rounded-xl bg-secondary/20 border-none min-h-[100px] resize-none" placeholder="Share your network logic..." /></div>
                      </div>
                    </div>
                  </ScrollArea>
                  <div className="p-6 bg-secondary/10 border-t border-primary/10"><Button onClick={handleSaveProfile} className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase italic tracking-widest h-14 rounded-2xl shadow-xl shadow-primary/20">Sync Identity Pulse</Button></div>
                </DialogContent>
              </Dialog>
              <Button variant="ghost" size="icon" className="rounded-full"><MoreHorizontal className="h-5 w-5" /></Button>
            </div>
          </header>

          <div className="relative">
            <div className="relative h-48 sm:h-64 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 overflow-hidden group">
              <Image src={currentUser.cover || "https://picsum.photos/seed/my_cover/1200/400"} alt="Cover" fill className="object-cover dark:brightness-75 transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                <button onClick={() => coverInputRef.current?.click()} className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white hover:bg-white/40 transition-all"><Camera className="h-6 w-6" /></button>
              </div>
              <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setRefiningImage(reader.result as string); setRefiningMode('cover'); setIsRefinementOpen(true); }; reader.readAsDataURL(file); } }} />
            </div>

            <div className="px-4 pb-4">
              <div className="relative inline-block -mt-16 sm:-mt-24 ml-0 sm:ml-2">
                <div className="relative w-32 h-32 sm:w-44 sm:h-44 group">
                  <Avatar className="w-full h-full border-4 border-white dark:border-card shadow-xl ring-2 ring-primary/10"><AvatarImage src={currentUser.avatar} /><AvatarFallback>JD</AvatarFallback></Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => avatarInputRef.current?.click()} className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white hover:bg-white/40 transition-all"><Camera className="h-8 w-8" /></button>
                  </div>
                  <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => { setRefiningImage(reader.result as string); setRefiningMode('avatar'); setIsRefinementOpen(true); }; reader.readAsDataURL(file); } }} />
                </div>
              </div>

              <div className="mt-2 space-y-1 px-1">
                <div className="flex items-center flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{currentUser.name}</h1>
                    {currentUser.isVerified && <CheckCircle2 className="h-6 w-6 text-primary fill-primary text-white" />}
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] font-black h-5 px-3 uppercase tracking-widest">{currentUser.category || "Creator"}</Badge>
                </div>
                
                <div className="flex items-center gap-6 py-2">
                  <div className="flex flex-col items-start"><span className="font-bold text-lg leading-none">{currentUser.followers || 0}</span><span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Followers</span></div>
                  <div className="flex flex-col items-start"><span className="font-bold text-lg leading-none">{followingUsernames.size}</span><span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Following</span></div>
                  <div className="flex flex-col"><span className="font-bold text-lg leading-none">{myPosts.length}</span><span className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Posts</span></div>
                </div>

                {/* Identity Nodes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 py-6 my-4 border-y border-primary/5 bg-primary/[0.02] px-4 rounded-[2rem]">
                  <InfoNode icon={Globe} label="Spatial Origin" value={currentUser.nationality || NATIONALITIES[0]} colorClass="bg-blue-500/10 text-blue-500" />
                  <InfoNode icon={Users} label="Gender Signature" value={currentUser.gender || 'Male'} colorClass="bg-purple-500/10 text-purple-500" />
                  {formattedDob && <InfoNode icon={Cake} label="Arrival Date" value={formattedDob} colorClass="bg-amber-500/10 text-amber-500" />}
                  <InfoNode icon={Clock} label="Member Since" value={currentUser.joinDate || "Temporal Sync Active"} colorClass="bg-emerald-500/10 text-emerald-500" />
                </div>

                <div className="mt-3 relative group max-w-2xl"><p className="text-[15px] leading-relaxed text-foreground flex-1">{currentUser.bio}</p></div>

                <div className="mt-4 flex gap-2">
                  <Link href="/dashboard" className="flex-1"><Button className="w-full rounded-lg gap-2 bg-primary hover:bg-primary/90 h-11 font-bold text-white shadow-lg active:scale-95 transition-all"><LayoutDashboard className="h-5 w-5" /> Dashboard</Button></Link>
                  <Button variant="secondary" className="flex-1 rounded-lg gap-2 h-11 font-bold active:scale-95 transition-all" onClick={() => setIsStoryModalOpen(true)}><Plus className="h-5 w-5" /> Add Story</Button>
                </div>
              </div>
            </div>

            <Tabs defaultValue="all" className="w-full mt-2">
              <TabsList className="w-full h-12 bg-white dark:bg-card border-t border-b border-border/50 rounded-none p-0">
                <TabsTrigger value="all" className="flex-1 font-bold text-sm">Posts</TabsTrigger>
                <TabsTrigger value="reels" className="flex-1 font-bold text-sm">Reels</TabsTrigger>
                <TabsTrigger value="music" className="flex-1 font-bold text-sm">Music</TabsTrigger>
                <TabsTrigger value="media" className="flex-1 font-bold text-sm">Media</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="p-4 space-y-4">
                {myPosts.length > 0 ? myPosts.map(post => <PostCard key={post.id} {...post} />) : <div className="py-20 text-center opacity-40"><p className="font-bold">No active vibes</p></div>}
              </TabsContent>

              <TabsContent value="reels" className="p-4">
                <div className="grid grid-cols-3 gap-1">
                  {myReels.length > 0 ? myReels.map(reel => (
                    <div key={reel.id} onClick={() => router.push(`/reels?id=${reel.id}`)} className="aspect-[9/16] relative group overflow-hidden rounded-xl bg-black cursor-pointer">
                      <video src={reel.videoUrl} className="object-cover w-full h-full opacity-80" muted playsInline />
                      <div className="absolute inset-0 bg-black/20" />
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-[10px] font-black"><Clapperboard className="h-3 w-3" />{reel.likes}</div>
                    </div>
                  )) : <div className="col-span-3 py-20 text-center opacity-40"><p className="font-bold">No Reels yet</p></div>}
                </div>
              </TabsContent>

              <TabsContent value="music" className="p-4 space-y-8">
                {userSongs.length > 0 ? (
                  <div className="space-y-3">
                    {userSongs.map(song => (
                      <div key={song.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-2xl hover:bg-secondary/40 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 rounded-xl overflow-hidden shadow-lg"><Image src={song.cover} alt="Song" fill className="object-cover" /></div>
                          <div><p className="font-bold text-sm">{song.title}</p><p className="text-[10px] text-muted-foreground uppercase font-black">{song.artist}</p></div>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-full text-primary opacity-0 group-hover:opacity-100 transition-opacity"><Play className="h-4 w-4 fill-current" /></Button>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-center text-sm opacity-40 italic py-10">No songs published yet.</p>}
              </TabsContent>

              <TabsContent value="media" className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  {postedImages.map((url, i) => (
                    <div key={i} onClick={() => setSelectedImageUrl(url)} className="aspect-square relative rounded-xl overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform shadow-lg"><Image src={url} alt="Shared" fill className="object-cover" /></div>
                  ))}
                  {postedImages.length === 0 && <p className="col-span-3 text-center text-xs opacity-40 py-10">No images shared in the network.</p>}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <aside className={cn("hidden lg:block sticky h-screen transition-all duration-300", isPlayerActive ? "top-16" : "top-0")}>
          <RightSidebar />
        </aside>
      </div>
      
      <CreateStoryModal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} />
      <ImageRefinementPortal isOpen={isRefinementOpen} onClose={() => setIsRefinementOpen(false)} image={refiningImage} mode={refiningMode} onApply={(refinedUrl) => { triggerHaptic(30); updateCurrentUser({ [refiningMode]: refinedUrl }); toast({ title: "Presence Refreshed" }); }} />

      <AlertDialog open={!!visualToDelete} onOpenChange={(open) => !open && setVisualToDelete(null)}>
        <AlertDialogContent className="rounded-[2.5rem] sm:max-w-[400px]">
          <AlertDialogHeader><AlertDialogTitle className="font-black italic uppercase tracking-tighter text-3xl text-center">Purge Visual?</AlertDialogTitle><AlertDialogDescription className="text-base font-medium leading-relaxed text-center px-4">Remove this visual node from your current profile presence.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-3 pt-6"><AlertDialogCancel className="rounded-xl h-12 font-bold bg-secondary/50 border-none">Cancel</AlertDialogCancel><AlertDialogAction onClick={() => { if (visualToDelete === 'avatar') updateCurrentUser({ avatar: "https://picsum.photos/seed/default/400/400" }); else updateCurrentUser({ cover: "" }); setVisualToDelete(null); }} className="rounded-xl h-12 font-black italic uppercase bg-destructive text-white">Confirm Purge</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
