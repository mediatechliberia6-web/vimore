"use client";

import { useState } from "react";
import { 
  X, 
  Gem, 
  Coins, 
  CheckCircle2, 
  Loader2,
  Zap
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
];

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
];

export function GiftHub() {
  const { isGiftHubOpen, closeGiftHub, currentUser, targetUserForGift, processGiftTransaction, triggerHaptic } = usePosts();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("gold");
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelectGift = (gift: GiftItem) => {
    triggerHaptic(10);
    setSelectedGift(gift);
  };

  const handleConfirmSend = async () => {
    if (!selectedGift || !targetUserForGift) return;
    
    setIsSyncing(true);
    triggerHaptic(30);

    try {
      // VI-MORE PAYMENT VERIFICATION SYSTEM: Deterministic Handshake
      await processGiftTransaction(selectedGift.cost, activeTab.toUpperCase() as 'GOLD' | 'DIAMOND');
      
      setIsSuccess(true);
      triggerHaptic(100);
      
      toast({
        title: "Gift Pulse Materialized",
        description: `Successfully sent ${selectedGift.name} to @${targetUserForGift.username}.`
      });

      setTimeout(() => {
        setIsSuccess(false);
        setSelectedGift(null);
        closeGiftHub();
      }, 2500);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Vault Handshake Failed",
        description: e.message
      });
    } finally {
      setIsSyncing(false);
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
              <SheetTitle className="text-xl font-black italic uppercase tracking-tighter text-foreground">Send Support</SheetTitle>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Target Node: @{targetUserForGift?.username}</p>
            </div>
            
            <div className="flex items-center gap-3 bg-secondary/40 p-1.5 rounded-2xl border border-white/5">
              <div className="flex flex-col items-end px-2">
                <div className="flex items-center gap-1.5">
                  <Coins className="h-3 w-3 text-amber-500" />
                  <span className="text-xs font-black tabular-nums text-foreground">{currentUser.goldBalance || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Gem className="h-3 w-3 text-cyan-500" />
                  <span className="text-xs font-black tabular-nums text-foreground">{currentUser.diamondBalance || 0}</span>
                </div>
              </div>
              <Link href="/currency" onClick={closeGiftHub}>
                <Button size="sm" className="bg-primary text-white text-[9px] font-black uppercase tracking-widest h-8 px-3 rounded-xl shadow-lg shadow-primary/20">
                  Top Up
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
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-foreground">Sync Confirmed</h3>
                <p className="text-sm text-muted-foreground uppercase font-bold">70% Energy Materialized in Creator Vault</p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="gold" className="flex-1 flex flex-col overflow-hidden" onValueChange={setActiveTab}>
              <div className="px-6 py-4 flex items-center justify-between bg-white/20 dark:bg-black/20 shrink-0">
                <TabsList className="bg-secondary/40 rounded-xl h-10 p-1">
                  <TabsTrigger value="gold" className="rounded-lg text-[10px] font-black uppercase px-6">Gold Gifts</TabsTrigger>
                  <TabsTrigger value="diamond" className="rounded-lg text-[10px] font-black uppercase px-6">Diamonds</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 text-primary">70/30 Split Active</Badge>
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
                              <span className="text-[10px] font-black tabular-nums text-foreground">{gift.cost}</span>
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
                              <span className="text-[10px] font-black tabular-nums text-foreground">{gift.cost}</span>
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

          {selectedGift && !isSuccess && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-[#050505] via-white/95 dark:via-[#050505]/95 to-transparent pt-12 z-50">
              <div className="max-w-xl mx-auto flex items-center gap-4 animate-in slide-in-from-bottom-full duration-500">
                <div className="flex-1 bg-secondary/40 rounded-2xl px-6 h-16 flex items-center justify-between border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">TRANSMITTING VIBE</span>
                    <span className="text-lg font-black italic uppercase tracking-tighter truncate max-w-[120px] text-foreground">
                      {selectedGift.name} {selectedGift.emoji}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activeTab === 'gold' ? <Coins className="h-5 w-5 text-amber-500" /> : <Gem className="h-5 w-5 text-cyan-500" />}
                    <span className="text-2xl font-black tabular-nums text-foreground">{selectedGift.cost}</span>
                  </div>
                </div>
                
                <Button 
                  className={cn(
                    "h-16 px-10 rounded-2xl font-black italic uppercase tracking-widest shadow-2xl transition-all active:scale-95",
                    activeTab === 'gold' ? "bg-primary text-white shadow-primary/20" : "bg-cyan-600 text-white shadow-cyan-500/20"
                  )}
                  onClick={handleConfirmSend}
                  disabled={isSyncing}
                >
                  {isSyncing ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> SYNCING...</>
                  ) : (
                    <>SEND PULSE</>
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