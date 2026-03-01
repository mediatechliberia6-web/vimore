"use client";

import { useState, useRef, useEffect } from "react";
import { 
  ArrowLeft, 
  Coins, 
  Gem, 
  CheckCircle2, 
  Copy, 
  Upload, 
  AlertTriangle, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  Trash2,
  X,
  CreditCard,
  Building2,
  Loader2,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { useNotifications } from "@/context/NotificationContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { aiGenerateVerificationCode } from "@/app/actions/ai";
import { BiometricGate } from "@/components/layout/biometric-gate";
import { BannerAdNode } from "@/components/ad/banner-ad-node";

const GOLD_PACKAGES = [
  { id: "g1", gd: 200, priceLD: 500, priceUSD: 2.50, label: "Starter Pulse" },
  { id: "g2", gd: 500, priceLD: 1000, priceUSD: 5.00, label: "Active Hub" },
  { id: "g3", gd: 1000, priceLD: 2000, priceUSD: 10.00, label: "VIP Cluster", isVIP: true },
  { id: "g4", gd: 3000, priceLD: 6000, priceUSD: 30.00, label: "V.VIP Network", isVVIP: true },
];

const DIAMOND_PACKAGES = [
  { id: "d1", d: 25, priceLD: 1300, priceUSD: 6.50, label: "Gem Spike" },
  { id: "d2", d: 50, priceLD: 2600, priceUSD: 13.00, label: "Vault Refill" },
  { id: "d3", d: 100, priceLD: 5000, priceUSD: 25.00, label: "VIP Crystalline", isVIP: true },
];

export default function CurrencyHub() {
  const { currentUser, initiateTransaction, pendingTransaction, cancelTransaction, triggerHaptic, createPaymentRequest, gatewaySettings } = usePosts();
  const { currentTrack, isExpanded } = useMusic();
  const { addSignal } = useNotifications();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState("gold");
  const [currencyMode, setCurrencyMode] = useState<"USD" | "LD">("LD");
  const [selectedPackage, setSelectedPackage] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"ORANGE" | "MTN" | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [uploadedScreenshot, setUploadedScreenshot] = useState<string | null>(null);

  const isPlayerActive = currentTrack && !isExpanded;

  const handleCopy = (text: string, label: string) => {
    triggerHaptic(5);
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${label} synced to clipboard.` });
  };

  const handlePackageSelect = (pkg: any, type: 'Gold' | 'Diamond') => {
    triggerHaptic(15);
    setSelectedPackage({ ...pkg, type });
  };

  const handleProceedToPayment = async () => {
    if (!selectedPackage) return;
    triggerHaptic(20);
    setIsGeneratingCode(true);
    
    // AI Code Generation Phase
    try {
      const { code } = await aiGenerateVerificationCode({ packageName: selectedPackage.label });
      const amount = currencyMode === 'LD' ? selectedPackage.priceLD : selectedPackage.priceUSD;
      
      initiateTransaction({
        packageId: selectedPackage.id,
        packageName: selectedPackage.label,
        amount: amount.toString(),
        currency: currencyMode,
        type: selectedPackage.type,
        code: `VBC-${code}`
      });
      
      setSelectedPackage(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Protocol Error", description: "Could not materialize security code." });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleScreenshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic(10);
      const reader = new FileReader();
      reader.onloadend = () => setUploadedScreenshot(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitForReview = () => {
    if (!uploadedScreenshot) return;
    setIsUploading(true);
    triggerHaptic(50);
    
    setTimeout(() => {
      // Logic: Materialize Payment Node in Review Cluster
      createPaymentRequest(uploadedScreenshot);
      
      setIsUploading(false);
      
      // Global Notification Sync
      addSignal({
        type: 'SYSTEM',
        title: 'Review Node Active',
        content: `Your receipt for **${pendingTransaction?.packageName}** is now in the review cluster. We will notify you upon approval.`,
        image: uploadedScreenshot || undefined
      });

      toast({
        title: "Submission Received",
        description: "Review node materialized. Returning to feed..."
      });
      
      cancelTransaction();
      router.push("/");
    }, 3000);
  };

  return (
    <BiometricGate title="Currency Hub">
      <div className="min-h-screen bg-[#F0F2F5] dark:bg-[#050505] transition-colors duration-300">
        <header className="sticky top-0 z-50 bg-white/80 dark:bg-card/80 backdrop-blur-md border-b border-border h-16 px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/menu">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-secondary/80 active:scale-90 transition-all">
                <ArrowLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div className="flex flex-col">
              <h1 className="text-lg font-black italic uppercase tracking-tighter text-foreground">Currency Hub</h1>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Financial Handshake</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <Coins className="h-3 w-3 text-amber-500" />
                <span className="text-xs font-bold">{currentUser.goldBalance || 0}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gem className="h-3 w-3 text-cyan-500" />
                <span className="text-xs font-bold">{currentUser.diamondBalance || 0}</span>
              </div>
            </div>
            <Avatar className="h-9 w-9 border-2 border-primary/10">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className={cn(
          "max-w-2xl mx-auto p-4 sm:p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500",
          isPlayerActive ? "pt-[80px]" : "pt-4"
        )}>
          
          <Tabs defaultValue={pendingTransaction ? "complete" : "gold"} value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-14 bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-1 gap-1">
              <TabsTrigger value="gold" className="flex-1 rounded-xl font-black italic uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-white">Buy Gold</TabsTrigger>
              <TabsTrigger value="diamond" className="flex-1 rounded-xl font-black italic uppercase tracking-widest text-[10px] data-[state=active]:bg-cyan-600 data-[state=active]:text-white">Buy Diamond</TabsTrigger>
              <TabsTrigger value="complete" className="flex-1 rounded-xl font-black italic uppercase tracking-widest text-[10px] data-[state=active]:bg-emerald-600 data-[state=active]:text-white relative">
                Complete Payment
                {pendingTransaction && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping" />
                )}
              </TabsTrigger>
            </TabsList>

            <div className="mt-8 flex justify-center">
              <div className="bg-secondary/30 p-1 rounded-full flex items-center gap-1">
                <button 
                  onClick={() => { triggerHaptic(5); setCurrencyMode("USD"); }}
                  className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", currencyMode === "USD" ? "bg-white dark:bg-card text-primary shadow-md" : "text-muted-foreground")}
                >
                  USD ($)
                </button>
                <button 
                  onClick={() => { triggerHaptic(5); setCurrencyMode("LD"); }}
                  className={cn("px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", currencyMode === "LD" ? "bg-white dark:bg-card text-primary shadow-md" : "text-muted-foreground")}
                >
                  LD (L$)
                </button>
              </div>
            </div>

            <TabsContent value="gold" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GOLD_PACKAGES.map((pkg) => (
                  <div 
                    key={pkg.id}
                    onClick={() => handlePackageSelect(pkg, 'Gold')}
                    className={cn(
                      "group relative p-6 rounded-[2rem] border transition-all cursor-pointer overflow-hidden",
                      pkg.isVVIP ? "bg-gradient-to-br from-amber-500 to-orange-600 border-amber-400 text-white shadow-xl shadow-amber-500/20" : 
                      pkg.isVIP ? "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700" :
                      "bg-white dark:bg-card border-border hover:border-primary/40"
                    )}
                  >
                    <div className="relative z-10 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className={cn("p-3 rounded-2xl", pkg.isVVIP ? "bg-white/20" : "bg-amber-500/10")}>
                          <Coins className={cn("h-6 w-6", pkg.isVVIP ? "text-white" : "text-amber-500")} />
                        </div>
                        {(pkg.isVIP || pkg.isVVIP) && (
                          <Badge className="bg-white/20 text-[8px] font-black uppercase border-none">{pkg.isVVIP ? 'V.VIP TIER' : 'VIP TIER'}</Badge>
                        )}
                      </div>
                      <div>
                        <h3 className={cn("text-2xl font-black italic uppercase tracking-tighter", pkg.isVVIP ? "text-white" : "text-foreground")}>{pkg.gd} GD</h3>
                        <p className={cn("text-xs font-bold uppercase tracking-widest", pkg.isVVIP ? "text-white/70" : "text-muted-foreground")}>{pkg.label}</p>
                      </div>
                      <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                        <span className="text-xl font-black">{currencyMode === 'USD' ? `$${pkg.priceUSD.toFixed(2)}` : `L$ ${pkg.priceLD}`}</span>
                        <ChevronRight className="h-5 w-5 opacity-40" />
                      </div>
                    </div>
                    {pkg.isVVIP && <Zap className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 rotate-12" />}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="diamond" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DIAMOND_PACKAGES.map((pkg) => (
                  <div 
                    key={pkg.id}
                    onClick={() => handlePackageSelect(pkg, 'Diamond')}
                    className={cn(
                      "group relative p-6 rounded-[2rem] border transition-all cursor-pointer overflow-hidden",
                      pkg.isVIP ? "bg-gradient-to-br from-cyan-500 to-blue-600 border-cyan-400 text-white shadow-xl shadow-cyan-500/20" : 
                      "bg-white dark:bg-card border-border hover:border-cyan-400/40"
                    )}
                  >
                    <div className="relative z-10 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div className={cn("p-3 rounded-2xl", pkg.isVIP ? "bg-white/20" : "bg-cyan-500/10")}>
                          <Gem className={cn("h-6 w-6", pkg.isVIP ? "text-white" : "text-cyan-500")} />
                        </div>
                        {pkg.isVIP && (
                          <Badge className="bg-white/20 text-[8px] font-black uppercase border-none">VIP TIER</Badge>
                        )}
                      </div>
                      <div>
                        <h3 className={cn("text-2xl font-black italic uppercase tracking-tighter", pkg.isVIP ? "text-white" : "text-foreground")}>{pkg.d} D</h3>
                        <p className={cn("text-xs font-bold uppercase tracking-widest", pkg.isVIP ? "text-white/70" : "text-muted-foreground")}>{pkg.label}</p>
                      </div>
                      <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                        <span className="text-xl font-black">{currencyMode === 'USD' ? `$${pkg.priceUSD.toFixed(2)}` : `L$ ${pkg.priceLD}`}</span>
                        <ChevronRight className="h-5 w-5 opacity-40" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="complete" className="space-y-6 pt-4">
              {!pendingTransaction ? (
                <div className="py-20 text-center space-y-6 bg-white dark:bg-card rounded-[2.5rem] border border-dashed border-border shadow-xl shadow-black/5">
                  <div className="h-20 w-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">No Active Pulses</h3>
                    <p className="text-muted-foreground text-sm font-medium max-w-xs mx-auto">You don't have any unfinished payments. Select a package to initiate a financial handshake.</p>
                  </div>
                  <Button variant="outline" className="rounded-full border-primary text-primary font-black uppercase text-[10px] tracking-widest" onClick={() => setActiveTab("gold")}>Browse Packages</Button>
                </div>
              ) : (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] p-8 text-center space-y-4">
                    <div className="h-16 w-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="h-8 w-8 text-white" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter text-emerald-600 dark:text-emerald-400">Sync Active</h3>
                      <p className="text-xs font-bold uppercase tracking-widest text-emerald-600/60">Node: {pendingTransaction.packageName}</p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <div className="bg-white/50 dark:bg-white/5 px-6 py-3 rounded-2xl border border-emerald-500/10">
                        <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1">AMOUNT</span>
                        <span className="text-xl font-black">{pendingTransaction.currency === 'USD' ? '$' : 'L$'} {pendingTransaction.amount}</span>
                      </div>
                      <div className="bg-white/50 dark:bg-white/5 px-6 py-3 rounded-2xl border border-emerald-500/10 relative group">
                        <span className="text-[10px] font-black uppercase text-muted-foreground block mb-1">EASY VERIFICATION</span>
                        <span className="text-xl font-black tracking-widest font-mono text-primary">{pendingTransaction.code}</span>
                        <button onClick={() => handleCopy(pendingTransaction.code, "Code")} className="absolute -top-2 -right-2 bg-primary text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Copy className="h-3 w-3" /></button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="font-black italic uppercase tracking-widest text-sm">Receipt Submission</h3>
                      <button onClick={() => { triggerHaptic(5); cancelTransaction(); }} className="text-[10px] font-black text-destructive uppercase tracking-widest flex items-center gap-1.5"><Trash2 className="h-3 w-3" /> Cancel Node</button>
                    </div>
                    
                    <div 
                      className={cn(
                        "relative aspect-video w-full rounded-[2.5rem] bg-white dark:bg-card border-2 border-dashed flex flex-col items-center justify-center cursor-pointer group transition-all",
                        uploadedScreenshot ? "border-emerald-500/40" : "border-border hover:border-primary/40"
                      )}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadedScreenshot ? (
                        <>
                          <Image src={uploadedScreenshot} alt="Receipt" fill className="object-cover rounded-[2.5rem] opacity-40" />
                          <div className="relative z-10 flex flex-col items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl"><CheckCircle2 className="h-8 w-8" /></div>
                            <p className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Receipt Attached</p>
                            <Button variant="ghost" className="text-destructive font-black uppercase text-[10px] h-8" onClick={(e) => { e.stopPropagation(); setUploadedScreenshot(null); }}>Change Visual</Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-center px-8">
                          <div className="p-6 rounded-3xl bg-secondary/30 group-hover:scale-110 transition-transform"><Upload className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" /></div>
                          <div>
                            <p className="text-sm font-black italic uppercase tracking-widest">Click to upload screenshot</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">Upload the confirmation message screenshot from your device.</p>
                          </div>
                        </div>
                      )}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleScreenshotUpload} />
                    </div>
                  </div>

                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-6 flex gap-4">
                    <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />
                    <p className="text-xs font-bold text-amber-600/80 leading-relaxed uppercase tracking-tighter">
                      THIS TAKE UP A LITTLE LONG TO REVIEW AND APPROVE PLEASE GO BACK ON THE HOME FEED WE WILL NOTIFY YOU WHEN DONE WITH A NOTIFICATION
                    </p>
                  </div>

                  <Button 
                    className={cn(
                      "w-full h-16 rounded-3xl font-black italic uppercase tracking-[0.2em] text-lg transition-all",
                      uploadedScreenshot && !isUploading ? "bg-emerald-600 text-white shadow-xl shadow-emerald-600/20" : "bg-secondary text-muted-foreground/40 cursor-not-allowed"
                    )}
                    disabled={!uploadedScreenshot || isUploading}
                    onClick={handleSubmitForReview}
                  >
                    {isUploading ? <><Clock className="mr-2 h-6 w-6 animate-spin" /> SYNCHRONIZING...</> : "Submit for Review"}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Banner Ad Integration */}
          <BannerAdNode />

          {selectedPackage && (
            <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col animate-in fade-in duration-500 overflow-hidden">
              <header className="h-20 px-6 flex items-center justify-between shrink-0 bg-black/40 border-b border-white/5">
                <Button variant="ghost" size="icon" className="text-white bg-white/5 rounded-full" onClick={() => setSelectedPackage(null)}>
                  <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="flex flex-col items-center">
                  <h2 className="text-sm font-black italic uppercase tracking-widest text-white">Handshake Protocol</h2>
                  <span className="text-[10px] font-bold text-primary uppercase">{selectedPackage.label}</span>
                </div>
                <div className="w-10" />
              </header>

              <main className="flex-1 overflow-y-auto p-6 sm:p-12">
                <div className="max-w-md mx-auto space-y-10">
                  
                  <div className="bg-red-500/10 border-2 border-red-500/20 rounded-[2.5rem] p-8 text-center space-y-4">
                    <div className="h-16 w-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-red-500/20">
                      <AlertTriangle className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-red-500">Critical Warning</h3>
                    <p className="text-sm font-bold text-red-500/80 leading-relaxed uppercase tracking-widest">
                      PLEASE SEND THE EXACT AMOUNT WE GIVE FOR THIS PACKAGE ANY MORE OR LESS WILL NOT BE APPROVED
                    </p>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 text-center">Select Payment Node</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => { triggerHaptic(10); setPaymentMethod("ORANGE"); }}
                        className={cn(
                          "h-24 rounded-3xl border flex flex-col items-center justify-center gap-2 transition-all group",
                          paymentMethod === "ORANGE" ? "bg-orange-500 border-orange-400 text-white shadow-xl shadow-orange-500/20" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                        )}
                      >
                        <Building2 className="h-6 w-6" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Orange Money</span>
                      </button>
                      <button 
                        onClick={() => { triggerHaptic(10); setPaymentMethod("MTN"); }}
                        className={cn(
                          "h-24 rounded-3xl border flex flex-col items-center justify-center gap-2 transition-all group",
                          paymentMethod === "MTN" ? "bg-yellow-500 border-yellow-400 text-black shadow-xl shadow-yellow-500/20" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                        )}
                      >
                        <Building2 className="h-6 w-6" />
                        <span className="text-[10px] font-black uppercase tracking-widest">MTN Momo</span>
                      </button>
                    </div>
                  </div>

                  {paymentMethod && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6">
                        <div className="space-y-4">
                          <div className="group relative">
                            <span className="text-[10px] font-black uppercase text-white/30 block mb-1 ml-1">ACCOUNT NAME</span>
                            <div className="bg-white/5 h-14 rounded-2xl flex items-center justify-between px-6 border border-white/5">
                              <span className="text-lg font-black text-white">
                                {paymentMethod === 'ORANGE' ? gatewaySettings.orangeName : gatewaySettings.mtnName}
                              </span>
                              <button onClick={() => handleCopy(paymentMethod === 'ORANGE' ? gatewaySettings.orangeName : gatewaySettings.mtnName, "Name")} className="text-primary hover:text-white transition-colors"><Copy className="h-4 w-4" /></button>
                            </div>
                          </div>
                          <div className="group relative">
                            <span className="text-[10px] font-black uppercase text-white/30 block mb-1 ml-1">ACCOUNT NUMBER</span>
                            <div className="bg-white/5 h-14 rounded-2xl flex items-center justify-between px-6 border border-white/5">
                              <span className="text-lg font-black text-white">{paymentMethod === 'ORANGE' ? gatewaySettings.orangeNumber : gatewaySettings.mtnNumber}</span>
                              <button onClick={() => handleCopy(paymentMethod === 'ORANGE' ? gatewaySettings.orangeNumber : gatewaySettings.mtnNumber, "Number")} className="text-primary hover:text-white transition-colors"><Copy className="h-4 w-4" /></button>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/5 space-y-4">
                          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-center relative group">
                            <span className="text-[10px] font-black uppercase text-primary block mb-1">PLEASE ADD THIS CODE WHEN SENDING FOR EASY VERIFICATION</span>
                            <div className="flex items-center justify-center gap-3">
                              {isGeneratingCode ? (
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                              ) : (
                                <span className="text-2xl font-black tracking-widest text-white font-mono animate-in zoom-in duration-300">VBC-XXXXXX</span>
                              )}
                              {!isGeneratingCode && <Info className="h-4 w-4 text-primary/40" />}
                            </div>
                            <p className="text-[8px] font-bold text-primary/60 uppercase mt-2">
                              {isGeneratingCode ? "CONSULTING AI PROTOCOL..." : "Code will generate on final handshake"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-[2rem] p-6 flex gap-4 border border-white/5">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0"><CheckCircle2 className="h-5 w-5" /></div>
                        <p className="text-[10px] font-black text-white/60 uppercase leading-relaxed tracking-tighter">
                          GO SEND THE MONEY AND SCREENSHOT THE CONFIRMATION MESSAGE COME BACK, WHEN BACK CLICK ON THE BUY CURRENCY PAGE AND YOU WILL SEE COMPLETE PAYMENT UNDER THE THE GOLD AND DIAMOND AND UPLOAD THE THE SCREENSHOT AND SUBMIT IT
                        </p>
                      </div>

                      <Button 
                        className="w-full h-16 rounded-3xl bg-primary text-white font-black italic uppercase tracking-[0.2em] text-lg shadow-2xl shadow-primary/20"
                        onClick={handleProceedToPayment}
                        disabled={isGeneratingCode}
                      >
                        {isGeneratingCode ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> GENERATING...</> : "Materialize Node"}
                      </Button>
                    </div>
                  )}
                </div>
              </main>
            </div>
          )}

        </main>
      </div>
    </BiometricGate>
  );
}
