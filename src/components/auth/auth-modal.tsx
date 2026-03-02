"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  AtSign, 
  User,
  Sparkles,
  ChevronRight,
  Globe,
  Calendar,
  Users,
  CheckCircle2,
  MailQuestion,
  X,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const NATIONALITIES = [
  "Liberian", "American", "Nigerian", "Ghanian", "Guinean", "Sierra Leonean", "Ivory Coast", "European", "Asian", "Other"
];

export function AuthModal() {
  const { currentUser, login, signup, verifyCode, forgotPassword, triggerHaptic } = usePosts();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<"login" | "signup" | "verify" | "forgot">("login");
  const [signupStep, setSignupStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewAccount, setIsNewAccount] = useState(false);
  
  // Auth Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  
  // Identity Nodes State
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("Liberian");
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  
  // Verification State
  const [vCode, setVCode] = useState("");

  // Calibration: Trigger verification ONLY if this is a fresh signup pulse
  useEffect(() => {
    if (currentUser?.id && isNewAccount) {
      if (!currentUser.isEmailVerified && mode !== 'verify') {
        setMode('verify');
      }
    }
  }, [currentUser?.id, currentUser?.isEmailVerified, mode, isNewAccount]);

  // Terminal Handshake: Hide gate if user is fully synchronized or a test user
  if (currentUser?.id && currentUser.isEmailVerified) return null;
  if (currentUser?.username === 'johndoe_creative') return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    triggerHaptic(20);
    try {
      await login(email, password);
      toast({ title: "Identity Synced" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Handshake Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupStep === 1) {
      // Step 1 Validation Pulse
      if (!email.includes('@')) {
        toast({ variant: "destructive", title: "Invalid Node", description: "Email protocol mismatch." });
        return;
      }
      if (password.length < 8) {
        toast({ variant: "destructive", title: "Weak Signature", description: "Password must be 8+ characters for vault security." });
        return;
      }
      if (!name.trim() || !username.trim()) {
        toast({ variant: "destructive", title: "Missing Data", description: "All identity fields are required." });
        return;
      }
      
      setSignupStep(2);
      triggerHaptic(10);
      return;
    }

    // Step 2 Validation Pulse
    if (!dob) {
      toast({ variant: "destructive", title: "Temporal Error", description: "Arrival date (DOB) is required for synchronization." });
      return;
    }

    setIsLoading(true);
    triggerHaptic(30);
    
    try {
      const result = await signup({ email, password, name, username, dob, nationality, gender });
      setIsNewAccount(true);
      
      // Prototype Feedback Pulse: Show the code since no email server is active
      toast({ 
        title: "Node Initialized", 
        description: `Identity pulse generated. Your Verification Code is: ${result.code}`,
        duration: 10000 
      });
    } catch (error: any) {
      console.error("Signup Pulse Failure:", error);
      toast({ 
        variant: "destructive", 
        title: "Handshake Failed", 
        description: error.message || "An unexpected error occurred during node materialization." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (vCode.length < 6) return;
    setIsLoading(true);
    triggerHaptic(50);
    try {
      const success = await verifyCode(vCode);
      if (success) {
        setIsNewAccount(false);
        toast({ title: "Signature Verified", description: "Welcome to the ViMore network." });
      } else {
        toast({ variant: "destructive", title: "Invalid Code", description: "The AI pulse did not match. Please try again." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    triggerHaptic(20);
    try {
      await forgotPassword(email);
      toast({ title: "Recovery Pulse Sent", description: "Check your email for the signature reset link." });
      setMode("login");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Request Failed" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#050505] flex items-center justify-center p-6 overflow-hidden">
      {/* Aurora Ambient Pulse */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-md flex flex-col items-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
        
        <header className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <path d="M3 7L10 19L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 15L17 7L21 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">ViMore</h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Spatial Connection Node</p>
          </div>
        </header>

        <div className="w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
          
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-white/40 ml-1">Email Node</Label>
                  <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" /><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-11 bg-white/5 border-none rounded-xl text-white font-bold" placeholder="sync@vimore.com" /></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1"><Label className="text-[10px] font-black uppercase text-white/40">Security Node</Label><button type="button" onClick={() => setMode('forgot')} className="text-[9px] font-bold text-primary uppercase hover:underline">Forgot Signature?</button></div>
                  <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" /><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pl-11 bg-white/5 border-none rounded-xl text-white font-bold" placeholder="••••••••" /></div>
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl bg-primary text-white font-black italic uppercase tracking-[0.2em]">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Launch Pulse"}</Button>
              <div className="text-center"><button type="button" onClick={() => { setMode('signup'); setSignupStep(1); }} className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-primary transition-all">Create New Identity</button></div>
            </form>
          )}

          {mode === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-6 animate-in slide-in-from-bottom-4">
              {signupStep === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-white/40 ml-1">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 bg-white/5 border-none rounded-xl text-white font-bold" placeholder="John Doe" /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-white/40 ml-1">Username</Label><Input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} className="h-12 bg-white/5 border-none rounded-xl text-white font-bold" placeholder="johndoe" /></div>
                  </div>
                  <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-white/40 ml-1">Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 bg-white/5 border-none rounded-xl text-white font-bold" placeholder="sync@vimore.com" /></div>
                  <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-white/40 ml-1">Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 bg-white/5 border-none rounded-xl text-white font-bold" placeholder="••••••••" /></div>
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <button type="button" onClick={() => setSignupStep(1)} className="flex items-center gap-2 text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors mb-2">
                    <ArrowLeft className="h-3 w-3" /> Back to Core
                  </button>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/40 ml-1">Arrival Date (DOB)</Label>
                    <div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" /><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="h-12 pl-11 bg-white/5 border-none rounded-xl text-white font-bold" /></div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/40 ml-1">Nationality</Label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <select value={nationality} onChange={(e) => setNationality(e.target.value)} className="w-full h-12 pl-11 bg-white/5 border-none rounded-xl text-white font-bold appearance-none outline-none focus:ring-2 ring-primary/40">
                        {NATIONALITIES.map(n => <option key={n} value={n} className="bg-zinc-900">{n}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/40 ml-1">Gender Signature</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setGender('Male')} className={cn("h-12 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest", gender === 'Male' ? "bg-primary border-primary text-white" : "border-white/5 bg-white/5 text-white/40")}>Male</button>
                      <button type="button" onClick={() => setGender('Female')} className={cn("h-12 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-black uppercase text-[10px] tracking-widest", gender === 'Female' ? "bg-primary border-primary text-white" : "border-white/5 bg-white/5 text-white/40")}>Female</button>
                    </div>
                  </div>
                </div>
              )}
              <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl bg-primary text-white font-black italic uppercase tracking-[0.2em]">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : signupStep === 1 ? "Next Protocol" : "Materialize Identity"}</Button>
              <div className="text-center"><button type="button" onClick={() => setMode('login')} className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-primary transition-all">Back to Sync</button></div>
            </form>
          )}

          {mode === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-8 animate-in zoom-in-95 duration-500 text-center">
              <div className="space-y-2">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 animate-pulse"><ShieldCheck className="h-8 w-8" /></div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Identity Challenge</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Groq AI generated a unique code for node validation.</p>
              </div>
              <div className="space-y-4">
                <Input value={vCode} onChange={(e) => setVCode(e.target.value.toUpperCase().slice(0, 6))} placeholder="XXXXXX" className="h-20 bg-white/5 border-primary/20 rounded-2xl text-center text-4xl font-black tracking-[0.5em] text-white focus-visible:ring-primary/40 uppercase" />
                <p className="text-[9px] font-black text-primary uppercase animate-pulse">Syncing Code with Central Vault...</p>
              </div>
              <Button type="submit" disabled={isLoading || vCode.length < 6} className="w-full h-14 rounded-2xl bg-primary text-white font-black italic uppercase tracking-[0.2em]">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Handshake"}</Button>
              <div className="text-center"><button type="button" onClick={() => { setIsNewAccount(false); setMode('login'); }} className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-destructive transition-all">Cancel Node Sync</button></div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="space-y-4 text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4"><MailQuestion className="h-8 w-8" /></div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Vault Recovery</h3>
                <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Input your registered email node to receive a reset pulse.</p>
              </div>
              <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-white/40 ml-1">Email Node</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 pl-11 bg-white/5 border-none rounded-xl text-white font-bold" placeholder="sync@vimore.com" /></div>
              <Button type="submit" disabled={isLoading || !email} className="w-full h-14 rounded-2xl bg-primary text-white font-black italic uppercase tracking-[0.2em]">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Launch Recovery"}</Button>
              <div className="text-center"><button type="button" onClick={() => setMode('login')} className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-primary transition-all">Cancel Request</button></div>
            </form>
          )}

        </div>

        <footer className="w-full flex flex-col items-center gap-4 opacity-40">
          <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /><span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">MTL Command Core Protected</span></div>
          <p className="text-[9px] font-bold text-white uppercase tracking-widest text-center">ViMore v1.5.0-SYNC • High-Velocity Identity Hub</p>
        </footer>
      </div>
    </div>
  );
}
