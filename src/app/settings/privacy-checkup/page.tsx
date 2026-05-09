"use client";

import { useState } from "react";
import { 
  X, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  CheckCircle2, 
  Eye, 
  UserPlus, 
  Archive, 
  Lock, 
  AlertTriangle,
  Globe,
  Building2,
  Rocket,
  Shield,
  Search,
  MessageCircle,
  FileText,
  UserCheck,
  Heart,
  Coins,
  Music2,
  EyeOff,
  ShieldAlert,
  Smartphone,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { usePosts } from "@/context/PostContext";
import { useTranslation } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

type CheckupStep = "origin" | "rules" | "usage" | "calibration" | "complete";

export default function PrivacyCheckup() {
  const router = useRouter();
  const { settings, updateSettings, triggerHaptic } = usePosts();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<CheckupStep>("origin");
  
  const steps: CheckupStep[] = ["origin", "rules", "usage", "calibration", "complete"];
  const progress = ((steps.indexOf(currentStep) + 1) / steps.length) * 100;

  const handleNext = () => {
    triggerHaptic(15);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      router.push("/settings");
    }
  };

  const handleBack = () => {
    triggerHaptic(10);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2ECF7] dark:bg-[#050505] transition-colors duration-500 flex flex-col relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <header className="h-20 px-6 flex items-center justify-between bg-white/40 dark:bg-card/40 backdrop-blur-xl border-b border-border shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push("/settings")}>
            <X className="h-6 w-6" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-black italic uppercase tracking-widest leading-tight">Identity Audit</h1>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3 w-3 text-primary" />
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Handshake Protocol</span>
            </div>
          </div>
        </div>
        <div className="w-32">
          <Progress value={progress} className="h-1.5 bg-secondary" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 sm:p-12 relative z-10">
        <div className="max-w-xl mx-auto min-h-full flex flex-col">
          
          {currentStep === 'origin' && (
            <div className="flex-1 space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                  <div className="h-24 w-24 bg-primary rounded-[2rem] flex items-center justify-center text-white shadow-2xl relative z-10">
                    <Building2 className="h-12 w-12" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-4xl font-black italic uppercase tracking-tighter">The Origin Node</h2>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">{t('branding_mtl')}</p>
                </div>
              </div>

              <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/20 shadow-2xl space-y-8 leading-relaxed">
                <p className="text-lg font-bold italic text-foreground/90">
                  "In the heart of West Africa, a new frequency was born. <span className="text-primary">Media Tech Liberia</span> emerged not just as a tech group, but as a collective of digital architects committed to redefining how the world synchronizes."
                </p>
                
                <div className="space-y-6 pt-4 border-t border-primary/5">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0"><Zap className="h-5 w-5" /></div>
                    <div className="space-y-1">
                      <p className="text-sm font-black italic uppercase tracking-widest text-primary">{t('branding_amos')}</p>
                      <p className="text-xs font-bold text-muted-foreground uppercase">Founder & CEO — The visionary architect behind the ViMore logic.</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs font-medium text-muted-foreground italic pt-4">
                  ViMore is a high-fidelity spatial node materialized and managed exclusively by Media Tech Liberia. Every vibe within this network is governed by the protocols established by our Command Core.
                </p>
              </div>
            </div>
          )}

          {currentStep === 'rules' && (
            <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">The Social Contract</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Network Protocol Compliance</p>
              </div>

              <div className="space-y-3">
                {[
                  { id: 1, title: "Identity Integrity", desc: "Your signature must be authentic. Impersonation results in an immediate administrative purge.", icon: UserCheck, color: "text-blue-500" },
                  { id: 2, title: "Harmonic Interaction", desc: "High-velocity positive vibes only. Toxic pulses or harassment will sever your connection.", icon: Heart, color: "text-rose-500" },
                  { id: 3, title: "Monetization Trust", desc: "All financial nodes are audited by the Groq AI Engine. Fraudulent energy requests are illegal.", icon: Coins, color: "text-amber-500" },
                  { id: 4, title: "Sonic Rights", desc: "Respect the discography of our artists. Unauthorized sonic archival is strictly prohibited.", icon: Music2, color: "text-purple-500" },
                  { id: 5, title: "Spatial Privacy", desc: "Respect the silence of Ghost nodes. Do not attempt to force a handshake with off-grid users.", icon: EyeOff, color: "text-primary" },
                  { id: 6, title: "Authentic Content", desc: "Share original vibes. Stolen pixels or counterfeit reels will be neutralized.", icon: Zap, color: "text-yellow-500" },
                  { id: 7, title: "Network Stability", desc: "Avoid spamming clusters. Automated bot pulses are detected and purged by the AI Auditor.", icon: ShieldAlert, color: "text-orange-500" },
                  { id: 8, title: "Security Handshake", desc: "Maintain your vault credentials. You are the sole architect of your identity security.", icon: Lock, color: "text-green-500" },
                ].map((rule) => (
                  <div key={rule.id} className="p-5 bg-white/40 dark:bg-white/5 border border-white/20 rounded-2xl flex gap-4 hover:border-primary/30 transition-all group">
                    <div className={cn("h-10 w-10 rounded-xl bg-background flex items-center justify-center shrink-0 shadow-sm", rule.color)}>
                      <rule.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black italic uppercase tracking-widest text-sm">{rule.title}</h4>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">{rule.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'usage' && (
            <div className="flex-1 space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Information Pulse</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">How we use your digital footprint</p>
              </div>

              <div className="space-y-6">
                {[
                  { title: "Node Discovery", desc: "We use your profile node to build the global network graph, helping others find your unique signature.", icon: Search },
                  { title: "Vibe Calibration", desc: "Interaction heuristics (likes, comments) are used to tune the discovery stream algorithms for your device.", icon: Sparkles },
                  { title: "Financial Archival", desc: "Every Gold and Diamond pulse is logged to ensure peer-to-peer security and auditor verification.", icon: FileText },
                  { title: "Hardware Integrity", desc: "Device signatures are tracked to prevent unauthorized cluster access and materialization of fraudulent nodes.", icon: Smartphone },
                ].map((usage) => (
                  <div key={usage.title} className="p-6 bg-white/40 dark:bg-white/5 border border-white/20 rounded-[2rem] flex items-center gap-6 group hover:bg-white/60 transition-all">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <usage.icon className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-black italic uppercase tracking-widest text-sm">{usage.title}</h4>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed uppercase tracking-tight">{usage.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex gap-4">
                <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                <p className="text-[11px] font-bold text-primary/60 uppercase leading-relaxed tracking-tighter">
                  YOUR DATA IS NEVER LEAKED TO EXTERNAL CLUSTERS. ALL ARCHIVAL IS HANDLED BY MEDIA TECH LIBERIA NODES WITH END-TO-END ENCRYPTION.
                </p>
              </div>
            </div>
          )}

          {currentStep === 'calibration' && (
            <div className="flex-1 space-y-10 animate-in fade-in slide-in-from-right-4 duration-700">
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">Calibration</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tune your network visibility</p>
              </div>

              <div className="bg-white/40 dark:bg-white/5 border border-white/20 rounded-[2.5rem] p-8 space-y-8 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <EyeOff className="h-4 w-4 text-primary" />
                      <p className="font-bold text-base">{t('settings_ghost')}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black">Hide your pulse from the network</p>
                  </div>
                  <Switch checked={settings.isGhostMode} onCheckedChange={(val) => updateSettings({ isGhostMode: val })} />
                </div>

                <div className="h-px bg-border -mx-8" />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-primary" />
                      <p className="font-bold text-base">Discovery Hub</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black">Control node visibility</p>
                  </div>
                  <Select value={settings.discoveryVisibility} onValueChange={(val) => updateSettings({ discoveryVisibility: val as any })}>
                    <SelectTrigger className="w-[120px] h-9 rounded-xl bg-secondary/20 border-none font-black text-[9px] uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="everyone" className="text-[10px] font-black uppercase">Everyone</SelectItem>
                      <SelectItem value="mutual" className="text-[10px] font-black uppercase">Mutuals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-px bg-border -mx-8" />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-primary" />
                      <p className="font-bold text-base">Tagging Protocol</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black">Who can tag your signature?</p>
                  </div>
                  <Select value={settings.taggingPrivacy} onValueChange={(val) => updateSettings({ taggingPrivacy: val as any })}>
                    <SelectTrigger className="w-[120px] h-9 rounded-xl bg-secondary/20 border-none font-black text-[9px] uppercase">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="everyone" className="text-[10px] font-black uppercase">Everyone</SelectItem>
                      <SelectItem value="friends" className="text-[10px] font-black uppercase">Mutuals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs font-medium text-muted-foreground italic">You can recalibrate these anytime in the System Core.</p>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-700">
              <div className="relative">
                <div className="absolute -inset-8 bg-green-500/20 blur-3xl rounded-full animate-pulse" />
                <div className="h-32 w-32 bg-green-500 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl relative z-10 shadow-green-500/40">
                  <CheckCircle2 className="h-16 w-16" />
                </div>
              </div>
              
              <div className="text-center space-y-3">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Audit Complete</h2>
                <p className="text-sm text-muted-foreground font-medium max-w-xs uppercase tracking-widest">Your digital signature is now synchronized with network safety protocols.</p>
              </div>

              <div className="bg-primary/10 border border-primary/20 p-6 rounded-[2rem] text-center space-y-2 max-w-sm">
                <ShieldCheck className="h-6 w-6 text-primary mx-auto" />
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Verified by Media Tech Liberia</p>
                <p className="text-[9px] text-primary/60 font-bold uppercase">Integrity Stamp Materialized</p>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-primary/5 flex items-center justify-between">
            {currentStep !== 'origin' && currentStep !== 'complete' ? (
              <Button variant="ghost" className="rounded-xl h-12 px-6 font-black uppercase text-[10px] tracking-widest text-muted-foreground gap-2" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            ) : <div />}
            
            <Button 
              className="bg-primary hover:bg-primary/90 text-white rounded-xl h-14 px-10 font-black italic uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 gap-3 transition-all active:scale-95"
              onClick={handleNext}
            >
              {currentStep === 'complete' ? "Close Pulse" : currentStep === 'calibration' ? "Finalize Handshake" : "Next Segment"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      <footer className="h-16 flex items-center justify-center bg-white/20 dark:bg-black/20 shrink-0">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">ViMore v1.5.0 • MTL Command Core Active</p>
      </footer>
    </div>
  );
}
