"use client";

import { useState, useMemo } from "react";
import { 
  X, 
  Zap, 
  Gem, 
  Coins, 
  ChevronRight, 
  Heart, 
  Star, 
  Rocket, 
  Gift, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  AlertTriangle,
  History,
  TrendingUp,
  Award,
  CircleDashed,
  Search
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useToast } from "@/hooks/use-toast";
import { aiAuditGiftHandshakeAction } from "@/app/actions/ai";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GiftItem {
  id: string;
  name: string;
  emoji: string;
  cost: number;
}

// 100 UNIQUE GOLD GIFTS
const GOLD_GIFTS: GiftItem[] = [
  { id: "g-1", name: "Small Heart", emoji: "❤️", cost: 10 },
  { id: "g-2", name: "Red Rose", emoji: "🌹", cost: 12 },
  { id: "g-3", name: "Coffee Cup", emoji: "☕", cost: 15 },
  { id: "g-4", name: "Ice Cream", emoji: "🍦", cost: 18 },
  { id: "g-5", name: "Cookie", emoji: "🍪", cost: 20 },
  { id: "g-6", name: "Candy", emoji: "🍬", cost: 22 },
  { id: "g-7", name: "Lollipop", emoji: "🍭", cost: 25 },
  { id: "g-8", name: "Balloon", emoji: "🎈", cost: 28 },
  { id: "g-9", name: "Ribbon", emoji: "🎀", cost: 30 },
  { id: "g-10", name: "Teddy Bear", emoji: "🧸", cost: 32 },
  { id: "g-11", name: "Cherry Blossom", emoji: "🌸", cost: 35 },
  { id: "g-12", name: "Daisy", emoji: "🌼", cost: 38 },
  { id: "g-13", name: "Sunflower", emoji: "🌻", cost: 40 },
  { id: "g-14", name: "Cactus", emoji: "🌵", cost: 42 },
  { id: "g-15", name: "Pine Tree", emoji: "🌲", cost: 45 },
  { id: "g-16", name: "Ocean Wave", emoji: "🌊", cost: 48 },
  { id: "g-17", name: "Cloud", emoji: "☁️", cost: 50 },
  { id: "g-18", name: "Sunny Day", emoji: "☀️", cost: 52 },
  { id: "g-19", name: "Moon", emoji: "🌙", cost: 55 },
  { id: "g-20", name: "Tiny Star", emoji: "⭐", cost: 58 },
  { id: "g-21", name: "Pizza Slice", emoji: "🍕", cost: 60 },
  { id: "g-22", name: "Burger", emoji: "🍔", cost: 62 },
  { id: "g-23", name: "French Fries", emoji: "🍟", cost: 65 },
  { id: "g-24", name: "Taco", emoji: "🌮", cost: 68 },
  { id: "g-25", name: "Sushi", emoji: "🍣", cost: 70 },
  { id: "g-26", name: "Bento Box", emoji: "🍱", cost: 72 },
  { id: "g-27", name: "Ramen", emoji: "🍜", cost: 75 },
  { id: "g-28", name: "Pasta", emoji: "🍝", cost: 78 },
  { id: "g-29", name: "Pie", emoji: "🥧", cost: 80 },
  { id: "g-30", name: "Birthday Cake", emoji: "🎂", cost: 85 },
  { id: "g-31", name: "Red Apple", emoji: "🍎", cost: 90 },
  { id: "g-32", name: "Pear", emoji: "🍐", cost: 92 },
  { id: "g-33", name: "Orange", emoji: "🍊", cost: 95 },
  { id: "g-34", name: "Lemon", emoji: "🍋", cost: 98 },
  { id: "g-35", name: "Banana", emoji: "🍌", cost: 100 },
  { id: "g-36", name: "Watermelon", emoji: "🍉", cost: 105 },
  { id: "g-37", name: "Grapes", emoji: "🍇", cost: 110 },
  { id: "g-38", name: "Strawberry", emoji: "🍓", cost: 115 },
  { id: "g-39", name: "Blueberry", emoji: "🫐", cost: 120 },
  { id: "g-40", name: "Kiwi", emoji: "🥝", cost: 125 },
  { id: "g-41", name: "Puppy", emoji: "🐶", cost: 130 },
  { id: "g-42", name: "Kitten", emoji: "🐱", cost: 135 },
  { id: "g-43", name: "Mouse", emoji: "🐭", cost: 140 },
  { id: "g-44", name: "Hamster", emoji: "🐹", cost: 145 },
  { id: "g-45", name: "Bunny", emoji: "🐰", cost: 150 },
  { id: "g-46", name: "Fox", emoji: "🦊", cost: 155 },
  { id: "g-47", name: "Bear", emoji: "🐻", cost: 160 },
  { id: "g-48", name: "Panda", emoji: "🐼", cost: 165 },
  { id: "g-49", name: "Lion", emoji: "🦁", cost: 170 },
  { id: "g-50", name: "Tiger", emoji: "🐯", cost: 175 },
  { id: "g-51", name: "Bird", emoji: "🐦", cost: 180 },
  { id: "g-52", name: "Penguin", emoji: "🐧", cost: 185 },
  { id: "g-53", name: "Duck", emoji: "🦆", cost: 190 },
  { id: "g-54", name: "Eagle", emoji: "🦅", cost: 195 },
  { id: "g-55", name: "Owl", emoji: "🦉", cost: 200 },
  { id: "g-56", name: "Honeybee", emoji: "🐝", cost: 205 },
  { id: "g-57", name: "Unicorn", emoji: "🦄", cost: 210 },
  { id: "g-58", name: "Butterfly", emoji: "🦋", cost: 215 },
  { id: "g-59", name: "Seashell", emoji: "🐚", cost: 220 },
  { id: "g-60", name: "Tropical Fish", emoji: "🐠", cost: 225 },
  { id: "g-61", name: "Guitar", emoji: "🎸", cost: 230 },
  { id: "g-62", name: "Piano", emoji: "🎹", cost: 235 },
  { id: "g-63", name: "Violin", emoji: "🎻", cost: 240 },
  { id: "g-64", name: "Drums", emoji: "🥁", cost: 245 },
  { id: "g-65", name: "Microphone", emoji: "🎤", cost: 250 },
  { id: "g-66", name: "Headphones", emoji: "🎧", cost: 255 },
  { id: "g-67", name: "Radio", emoji: "📻", cost: 260 },
  { id: "g-68", name: "Television", emoji: "📺", cost: 265 },
  { id: "g-69", name: "Camera", emoji: "📸", cost: 270 },
  { id: "g-70", name: "Movie Camera", emoji: "🎥", cost: 275 },
  { id: "g-71", name: "Soccer Ball", emoji: "⚽", cost: 280 },
  { id: "g-72", name: "Basketball", emoji: "🏀", cost: 285 },
  { id: "g-73", name: "Football", emoji: "🏈", cost: 290 },
  { id: "g-74", name: "Baseball", emoji: "⚾", cost: 295 },
  { id: "g-75", name: "Tennis", emoji: "🎾", cost: 300 },
  { id: "g-76", name: "Volleyball", emoji: "🏐", cost: 305 },
  { id: "g-77", name: "Golf", emoji: "⛳", cost: 310 },
  { id: "g-78", name: "Boxing Glove", emoji: "🥊", cost: 315 },
  { id: "g-79", name: "Skateboard", emoji: "🛹", cost: 320 },
  { id: "g-80", name: "Bicycle", emoji: "🚲", cost: 325 },
  { id: "g-81", name: "Diamond", emoji: "💎", cost: 330 },
  { id: "g-82", name: "Gold Ring", emoji: "💍", cost: 335 },
  { id: "g-83", name: "Crown", emoji: "👑", cost: 340 },
  { id: "g-84", name: "Gold Trophy", emoji: "🏆", cost: 345 },
  { id: "g-85", name: "Medal", emoji: "🎖️", cost: 350 },
  { id: "g-86", name: "Gift Box", emoji: "🎁", cost: 355 },
  { id: "g-87", name: "Envelope", emoji: "✉️", cost: 360 },
  { id: "g-88", name: "Love Letter", emoji: "💌", cost: 365 },
  { id: "g-89", name: "Golden Key", emoji: "🗝️", cost: 370 },
  { id: "g-90", name: "Lantern", emoji: "🏮", cost: 375 },
  { id: "g-91", name: "Rocket", emoji: "🚀", cost: 380 },
  { id: "g-92", name: "UFO", emoji: "🛸", cost: 382 },
  { id: "g-93", name: "Saturn", emoji: "🪐", cost: 385 },
  { id: "g-94", name: "Volcano", emoji: "🌋", cost: 388 },
  { id: "g-95", name: "Rainbow", emoji: "🌈", cost: 390 },
  { id: "g-96", name: "Castle", emoji: "🏰", cost: 392 },
  { id: "g-97", name: "Ferris Wheel", emoji: "🎡", cost: 395 },
  { id: "g-98", name: "Helicopter", emoji: "🚁", cost: 397 },
  { id: "g-99", name: "Speedboat", emoji: "🛥️", cost: 399 },
  { id: "g-100", name: "Racing Car", emoji: "🏎️", cost: 400 },
];

// 70 UNIQUE DIAMOND GIFTS
const DIAMOND_GIFTS: GiftItem[] = [
  { id: "d-1", name: "Quartz", emoji: "💎", cost: 1 },
  { id: "d-2", name: "Amethyst", emoji: "🔮", cost: 2 },
  { id: "d-3", name: "Sapphire", emoji: "💠", cost: 3 },
  { id: "d-4", name: "Emerald Ring", emoji: "💍", cost: 4 },
  { id: "d-5", name: "Ruby Ring", emoji: "💍", cost: 5 },
  { id: "d-6", name: "Evil Eye", emoji: "🧿", cost: 6 },
  { id: "d-7", name: "Prayer Beads", emoji: "📿", cost: 7 },
  { id: "d-8", name: "Shell", emoji: "🐚", cost: 8 },
  { id: "d-9", name: "Candle", emoji: "🕯️", cost: 9 },
  { id: "d-10", name: "Ancient Key", emoji: "🗝️", cost: 10 },
  { id: "d-11", name: "Sparkles", emoji: "✨", cost: 11 },
  { id: "d-12", name: "Glowing Star", emoji: "🌟", cost: 12 },
  { id: "d-13", name: "Dizzy Symbol", emoji: "💫", cost: 13 },
  { id: "d-14", name: "Collision", emoji: "💥", cost: 14 },
  { id: "d-15", name: "High Voltage", emoji: "⚡", cost: 15 },
  { id: "d-16", name: "Comet", emoji: "☄️", cost: 16 },
  { id: "d-17", name: "Wizard", emoji: "🧙", cost: 17 },
  { id: "d-18", name: "Fairy", emoji: "🧚", cost: 18 },
  { id: "d-19", name: "Genie", emoji: "🧞", cost: 19 },
  { id: "d-20", name: "Dragon", emoji: "🐉", cost: 20 },
  { id: "d-21", name: "Laptop", emoji: "💻", cost: 21 },
  { id: "d-22", name: "Smartphone", emoji: "📱", cost: 22 },
  { id: "d-23", name: "Battery", emoji: "🔋", cost: 23 },
  { id: "d-24", name: "Satellite Dish", emoji: "📡", cost: 24 },
  { id: "d-25", name: "Satellite", emoji: "🛰️", cost: 25 },
  { id: "d-26", name: "Microscope", emoji: "🔬", cost: 26 },
  { id: "d-27", name: "DNA", emoji: "🧬", cost: 27 },
  { id: "d-28", name: "Gear", emoji: "⚙️", cost: 28 },
  { id: "d-29", name: "Test Tube", emoji: "🧪", cost: 29 },
  { id: "d-30", name: "Telescope", emoji: "🔭", cost: 30 },
  { id: "d-31", name: "Rocket Ship", emoji: "🚀", cost: 31 },
  { id: "d-32", name: "Orbit", emoji: "🛰️", cost: 32 },
  { id: "d-33", name: "Flying Saucer", emoji: "🛸", cost: 33 },
  { id: "d-34", name: "Ringed Planet", emoji: "🪐", cost: 34 },
  { id: "d-35", name: "Milky Way", emoji: "🌌", cost: 35 },
  { id: "d-36", name: "Shooting Star", emoji: "🌠", cost: 36 },
  { id: "d-37", name: "Cosmos", emoji: "🔭", cost: 37 },
  { id: "d-38", name: "Deep Space", emoji: "🛸", cost: 38 },
  { id: "d-39", name: "Astronaut", emoji: "👨‍🚀", cost: 39 },
  { id: "d-40", name: "Alien Life", emoji: "👽", cost: 40 },
  { id: "d-41", name: "Palace", emoji: "🏰", cost: 41 },
  { id: "d-42", name: "Mosque", emoji: "🕌", cost: 42 },
  { id: "d-43", name: "Classical Building", emoji: "🏛️", cost: 43 },
  { id: "d-44", name: "Tokyo Tower", emoji: "🗼", cost: 44 },
  { id: "d-45", name: "Statue of Liberty", emoji: "🗽", cost: 45 },
  { id: "d-46", name: "Sailboat", emoji: "⛵", cost: 46 },
  { id: "d-47", name: "Motorboat", emoji: "🚤", cost: 47 },
  { id: "d-48", name: "Ship", emoji: "🛥️", cost: 48 },
  { id: "d-49", name: "Sports Car", emoji: "🏎️", cost: 49 },
  { id: "d-50", name: "Airplane", emoji: "✈️", cost: 50 },
  { id: "d-51", name: "Cyclone", emoji: "🌀", cost: 51 },
  { id: "d-52", name: "Water Drop", emoji: "💧", cost: 52 },
  { id: "d-53", name: "Wild Fire", emoji: "🔥", cost: 53 },
  { id: "d-54", name: "Super Sparkle", emoji: "✨", cost: 54 },
  { id: "d-55", name: "Snowflake", emoji: "❄️", cost: 55 },
  { id: "d-56", name: "Maple Leaf", emoji: "🍁", cost: 56 },
  { id: "d-57", name: "Mushroom", emoji: "🍄", cost: 57 },
  { id: "d-58", name: "Palm Tree", emoji: "🌴", cost: 58 },
  { id: "d-59", name: "Hibiscus", emoji: "🌺", cost: 59 },
  { id: "d-60", name: "Premium Rose", emoji: "🌹", cost: 60 },
  { id: "d-61", name: "Heart on Fire", emoji: "❤️‍🔥", cost: 61 },
  { id: "d-62", name: "Mending Heart", emoji: "❤️‍🩹", cost: 62 },
  { id: "d-63", name: "Heart with Arrow", emoji: "💘", cost: 63 },
  { id: "d-64", name: "Two Hearts", emoji: "💕", cost: 64 },
  { id: "d-65", name: "Sparkling Heart", emoji: "💖", cost: 65 },
  { id: "d-66", name: "Growing Heart", emoji: "💗", cost: 66 },
  { id: "d-67", name: "Beating Heart", emoji: "💓", cost: 67 },
  { id: "d-68", name: "Revolving Hearts", emoji: "💞", cost: 68 },
  { id: "d-69", name: "Heart Decoration", emoji: "💟", cost: 69 },
  { id: "d-70", name: "Heavy Heart", emoji: "❣", cost: 50 },
];

export function GiftHub() {
  const { isGiftHubOpen, closeGiftHub, currentUser, targetUserForGift, processGiftTransaction, triggerHaptic } = usePosts();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("gold");
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelectGift = (gift: GiftItem) => {
    triggerHaptic(10);
    setSelectedGift(gift);
  };

  const handleConfirmSend = async () => {
    if (!selectedGift || !targetUserForGift) return;
    
    setIsAuditing(true);
    triggerHaptic(30);

    const balance = activeTab === 'gold' ? (currentUser.goldBalance || 0) : (currentUser.diamondBalance || 0);
    
    try {
      // AI AUDITOR HANDSHAKE
      const result = await aiAuditGiftHandshakeAction({
        userBalance: balance,
        giftCost: selectedGift.cost,
        currencyType: activeTab.toUpperCase() as 'GOLD' | 'DIAMOND'
      });

      if (result.approved) {
        // Financial Logic Sync
        processGiftTransaction(selectedGift.cost, activeTab.toUpperCase() as 'GOLD' | 'DIAMOND');
        setIsSuccess(true);
        triggerHaptic(100);
        
        toast({
          title: "Pulse Successful",
          description: result.message
        });

        setTimeout(() => {
          setIsSuccess(false);
          setSelectedGift(null);
          closeGiftHub();
        }, 3000);
      } else {
        toast({
          variant: "destructive",
          title: "Handshake Failed",
          description: result.message
        });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Protocol Error", description: "Audit node unreachable." });
    } finally {
      setIsAuditing(false);
    }
  };

  if (!isGiftHubOpen) return null;

  return (
    <Sheet open={isGiftHubOpen} onOpenChange={(open) => !open && closeGiftHub()}>
      <SheetContent 
        side="bottom" 
        className="rounded-t-[3rem] p-0 border-primary/10 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-3xl h-[85vh] flex flex-col transition-all duration-500 overflow-hidden"
      >
        <div className="mx-auto w-12 h-1.5 bg-primary/20 rounded-full mt-4 mb-2 shrink-0" />
        
        <SheetHeader className="px-6 py-4 border-b border-primary/5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <SheetTitle className="text-xl font-black italic uppercase tracking-tighter">Send Support</SheetTitle>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Target: @{targetUserForGift?.username}</p>
            </div>
            
            <div className="flex items-center gap-3 bg-secondary/40 p-1.5 rounded-2xl border border-white/5">
              <div className="flex flex-col items-end px-2">
                <div className="flex items-center gap-1.5">
                  <Coins className="h-3 w-3 text-amber-500" />
                  <span className="text-xs font-black tabular-nums">{currentUser.goldBalance || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Gem className="h-3 w-3 text-cyan-500" />
                  <span className="text-xs font-black tabular-nums">{currentUser.diamondBalance || 0}</span>
                </div>
              </div>
              <Link href="/currency" onClick={closeGiftHub}>
                <Button size="sm" className="bg-primary text-white text-[9px] font-black uppercase tracking-widest h-8 px-3 rounded-xl shadow-lg shadow-primary/20">
                  Buy Energy
                </Button>
              </Link>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
          {isSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="h-24 w-24 bg-green-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-green-500/20">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Handshake Confirmed</h3>
                <p className="text-sm text-muted-foreground uppercase font-bold">70% energy synced to creator vault</p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="gold" className="flex-1 flex flex-col overflow-hidden" onValueChange={setActiveTab}>
              <div className="px-6 py-4 flex items-center justify-between bg-white/20 dark:bg-black/20 shrink-0">
                <TabsList className="bg-secondary/40 rounded-xl h-10 p-1">
                  <TabsTrigger value="gold" className="rounded-lg text-[10px] font-black uppercase px-6">Gold Gifts</TabsTrigger>
                  <TabsTrigger value="diamond" className="rounded-lg text-[10px] font-black uppercase px-6">Diamond Gifts</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 text-primary">70/30 SPLIT ACTIVE</Badge>
                </div>
              </div>

              <div className="flex-1 min-h-0 relative">
                <TabsContent value="gold" className="h-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col">
                  <ScrollArea className="flex-1 px-6 py-4">
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 pb-32">
                      {GOLD_GIFTS.map((gift) => (
                        <button
                          key={gift.id}
                          onClick={() => handleSelectGift(gift)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all group relative overflow-hidden",
                            selectedGift?.id === gift.id ? "bg-primary/10 ring-2 ring-primary/40 scale-105" : "hover:bg-secondary/40"
                          )}
                        >
                          <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center transition-all text-2xl",
                            selectedGift?.id === gift.id ? "bg-primary text-white" : "bg-primary/5 group-hover:scale-110"
                          )}>
                            {gift.emoji}
                          </div>
                          <div className="text-center min-w-0 w-full">
                            <p className="text-[8px] font-black uppercase truncate text-muted-foreground">{gift.name}</p>
                            <div className="flex items-center justify-center gap-1 mt-0.5">
                              <Coins className="h-2 w-2 text-amber-500" />
                              <span className="text-[10px] font-black tabular-nums">{gift.cost}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="diamond" className="h-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col">
                  <ScrollArea className="flex-1 px-6 py-4">
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 pb-32">
                      {DIAMOND_GIFTS.map((gift) => (
                        <button
                          key={gift.id}
                          onClick={() => handleSelectGift(gift)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all group relative overflow-hidden",
                            selectedGift?.id === gift.id ? "bg-cyan-500/10 ring-2 ring-cyan-500/40 scale-105" : "hover:bg-secondary/40"
                          )}
                        >
                          <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center transition-all text-2xl",
                            selectedGift?.id === gift.id ? "bg-cyan-500 text-white" : "bg-cyan-500/5 group-hover:scale-110"
                          )}>
                            {gift.emoji}
                          </div>
                          <div className="text-center min-w-0 w-full">
                            <p className="text-[8px] font-black uppercase truncate text-muted-foreground">{gift.name}</p>
                            <div className="flex items-center justify-center gap-1 mt-0.5">
                              <Gem className="h-2 w-2 text-cyan-500" />
                              <span className="text-[10px] font-black tabular-nums">{gift.cost}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          )}

          {/* Fixed Action Bar */}
          {selectedGift && !isSuccess && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-[#050505] via-white/95 dark:via-[#050505]/95 to-transparent pt-12 z-50">
              <div className="max-w-xl mx-auto flex items-center gap-4 animate-in slide-in-from-bottom-full duration-500">
                <div className="flex-1 bg-secondary/40 rounded-2xl px-6 h-16 flex items-center justify-between border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">SYNCING VIBE</span>
                    <span className="text-lg font-black italic uppercase tracking-tighter truncate max-w-[120px]">
                      {selectedGift.name} {selectedGift.emoji}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeTab === 'gold' ? <Coins className="h-5 w-5 text-amber-500" /> : <Gem className="h-5 w-5 text-cyan-500" />}
                    <span className="text-2xl font-black tabular-nums">{selectedGift.cost}</span>
                  </div>
                </div>
                
                <Button 
                  className={cn(
                    "h-16 px-10 rounded-2xl font-black italic uppercase tracking-widest shadow-2xl transition-all active:scale-95",
                    activeTab === 'gold' ? "bg-primary text-white shadow-primary/20" : "bg-cyan-600 text-white shadow-cyan-500/20"
                  )}
                  onClick={handleConfirmSend}
                  disabled={isAuditing}
                >
                  {isAuditing ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> AUDITING...</>
                  ) : (
                    <>CONFIRM PULSE</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
