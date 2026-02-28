
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
import { aiAuditGiftHandshake } from "@/app/actions/ai";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// Gift Data Generators
const GOLD_BASE_NAMES = ["Pulse", "Rose", "Zap", "Star", "Heart", "Rocket", "Crown", "Gem", "Fire", "Vibe"];
const QUALITIES = ["Neon", "Golden", "Cyber", "Infinity", "Stellar", "Crystal", "Radiant", "Phantom", "Cosmic", "Zenith"];

const GOLD_GIFTS = Array.from({ length: 100 }, (_, i) => {
  const nameIdx = i % 10;
  const qualIdx = Math.floor(i / 10);
  return {
    id: `g-${i}`,
    name: `${QUALITIES[qualIdx]} ${GOLD_BASE_NAMES[nameIdx]}`,
    cost: 10 + (qualIdx * 35) + nameIdx,
    icon: nameIdx % 2 === 0 ? Heart : Star
  };
});

const DIAMOND_GIFTS = Array.from({ length: 70 }, (_, i) => ({
  id: `d-${i}`,
  name: `Shard ${i + 1}`,
  cost: 1 + Math.floor(i / 1.4),
  icon: Gem
}));

export function GiftHub() {
  const { isGiftHubOpen, closeGiftHub, currentUser, targetUserForGift, processGiftTransaction, triggerHaptic } = usePosts();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("gold");
  const [selectedGift, setSelectedGift] = useState<any | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSelectGift = (gift: any) => {
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
      const result = await aiAuditGiftHandshake({
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
      <SheetContent side="bottom" className="rounded-t-[3rem] p-0 border-primary/10 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-3xl h-[65vh] flex flex-col transition-all duration-500 overflow-hidden">
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

        <div className="flex-1 flex flex-col min-h-0 relative">
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
            <Tabs defaultValue="gold" className="flex-1 flex flex-col" onValueChange={setActiveTab}>
              <div className="px-6 py-4 flex items-center justify-between bg-white/20 dark:bg-black/20">
                <TabsList className="bg-secondary/40 rounded-xl h-10 p-1">
                  <TabsTrigger value="gold" className="rounded-lg text-[10px] font-black uppercase px-6">Gold Gifts</TabsTrigger>
                  <TabsTrigger value="diamond" className="rounded-lg text-[10px] font-black uppercase px-6">Diamond Gifts</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 text-primary">70/30 SPLIT ACTIVE</Badge>
                </div>
              </div>

              <div className="flex-1 min-h-0">
                <TabsContent value="gold" className="h-full m-0 p-0">
                  <ScrollArea className="h-full px-6 py-4">
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
                            "h-12 w-12 rounded-xl flex items-center justify-center transition-all",
                            selectedGift?.id === gift.id ? "bg-primary text-white" : "bg-primary/5 text-primary group-hover:scale-110"
                          )}>
                            <gift.icon className="h-6 w-6" />
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

                <TabsContent value="diamond" className="h-full m-0 p-0">
                  <ScrollArea className="h-full px-6 py-4">
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
                            "h-12 w-12 rounded-xl flex items-center justify-center transition-all",
                            selectedGift?.id === gift.id ? "bg-cyan-500 text-white" : "bg-cyan-500/5 text-cyan-500 group-hover:scale-110"
                          )}>
                            <gift.icon className="h-6 w-6" />
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
                    <span className="text-lg font-black italic uppercase tracking-tighter">{selectedGift.name}</span>
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
