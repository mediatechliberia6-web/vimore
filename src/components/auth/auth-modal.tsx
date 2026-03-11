
"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Zap, 
  Mail, 
  Lock, 
  Loader2, 
  ShieldCheck, 
  AtSign, 
  User,
  Globe,
  Calendar,
  AlertTriangle,
  Smartphone,
  ArrowLeft,
  CheckCircle2,
  Clock,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePosts } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const NATIONALITIES = [
  "Liberian", "American", "Nigerian", "Ghanian", "Guinean", "Sierra Leonean", "Ivory Coast", "European", "Asian", "Other"
];

const VERIFICATION_LIMIT = 120; // 2 minutes

export function AuthModal() {
  const { currentUser, login, signup, sendVerificationCode, verifyCode, triggerHaptic } = usePosts();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<"login" | "signup" | "verify">("login");
  const [signupStep, setSignupStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Auth Form State
  const [identifier, setIdentifier] = useState(""); 
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  
  // Identity Nodes State
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("Liberian");
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');

  // Verification State
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(VERIFICATION_LIMIT);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (mode === 'verify' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [mode, timeLeft]);

  // Terminal Handshake
  if (currentUser?.id && currentUser.username !== 'guest_node' && currentUser.isEmailVerified) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    triggerHaptic(20);
    try {
      const res = await login(identifier, password);
      if (res.success) {
        toast({ title: "Identity Synced" });
      } else {
        setAuthError(res.message || "Credential handshake rejected.");
      }
    } catch (error: any) {
      setAuthError(String(error.message || error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupInit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (signupStep === 1) {
      const isEmail = identifier.includes('@');
      const isPhone = /^\+?\d+$/.test(identifier.replace(/[-\s]/g, ''));

      if (!isEmail && !isPhone) {
        setAuthError("Invalid identifier pulse.");
        return;
      }
      if (isPhone && !identifier.startsWith('+')) {
        setAuthError("Include country code (e.g. +231)");
        return;
      }
      if (password.length < 8) {
        setAuthError("Security signature too weak. (Min 8 chars)");
        return;
      }
      if (!name.trim() || !username.trim()) {
        setAuthError("All nodes must be filled.");
        return;
      }
      setSignupStep(2);
      triggerHaptic(10);
      return;
    }

    if (!dob) {
      setAuthError("Arrival date required for synchronization.");
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    triggerHaptic(30);
    
    try {
      const sanitizedUsername = username.toLowerCase().trim().replace(/\s+/g, '_');
      const res = await signup({
        email: identifier.includes('@') ? identifier : undefined,
        phone: !identifier.includes('@') ? identifier : undefined,
        password,
        name,
        username: sanitizedUsername,
        dob,
        nationality,
        gender
      });

      if (res && res.success) {
        // Force state transition to verification mode
        setMode('verify');
        setTimeLeft(VERIFICATION_LIMIT);
        setCanResend(false);
        toast({ title: "Identity Materialized", description: "Verification pulse transmitted." });
        
        // Background pulse to trigger OTP
        sendVerificationCode(identifier);
      } else {
        setAuthError(res?.message || "Identity node creation rejected.");
      }
    } catch (error: any) {
      setAuthError("Node materialization failed. Attempting recovery...");
      // Recovery handshake: Check if session exists anyway
      setTimeout(() => window.location.reload(), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== "") && index === 5) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleVerify = async (code: string) => {
    setIsLoading(true);
    triggerHaptic(30);
    setAuthError(null);

    try {
      const res = await verifyCode(identifier, code);
      if (res.success) {
        triggerHaptic(100);
        toast({ title: "Node Synchronized", description: "Welcome to the high-velocity network." });
        window.location.reload(); 
      } else {
        setAuthError(res.message || "Invalid security signature.");
        setOtp(["", "", "", "", "", ""]);
        otpRefs.current[0]?.focus();
      }
    } catch (e: any) {
      setAuthError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    triggerHaptic(15);
    setIsLoading(true);
    try {
      const res = await sendVerificationCode(identifier);
      if (res.success) {
        setTimeLeft(VERIFICATION_LIMIT);
        setCanResend(false);
        toast({ title: "New Pulse Transmitted" });
      }
    } catch (e) {}
    setIsLoading(false);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#050505] flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
        
        <header className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl">
              <Zap className="h-10 w-10 fill-current" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">ViMore</h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">
              {mode === 'verify' ? "Security Handshake Active" : "High-Velocity Identity Hub"}
            </p>
          </div>
        </header>

        <div className="w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
          
          {authError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3 animate-in shake-vibe">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-destructive uppercase tracking-widest mb-1">VAULT REJECTION</span>
                <p className="text-[11px] font-bold text-destructive uppercase leading-tight tracking-tight">{authError}</p>
              </div>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6 animate-in slide-in-from-bottom-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-white/40 ml-1">Email or Phone Node</Label>
                  <div className="relative">
                    {identifier.includes('@') ? <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" /> : <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />}
                    <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="h-12 pl-11 bg-white/5 border-none rounded-xl text-white font-bold" placeholder="Email or Phone Number" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-white/40 ml-1">Security Signature</Label>
                  <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" /><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 pl-11 bg-white/5 border-none rounded-xl text-white font-bold" placeholder="••••••••" /></div>
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl bg-primary text-white font-black italic uppercase tracking-[0.2em]">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sync Identity"}</Button>
              <div className="text-center"><button type="button" onClick={() => { setMode('signup'); setSignupStep(1); setAuthError(null); }} className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-primary transition-all">Materialize New Identity</button></div>
            </form>
          ) : mode === 'signup' ? (
            <form onSubmit={handleSignupInit} className="space-y-6 animate-in slide-in-from-bottom-4">
              {signupStep === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-white/40 ml-1">Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="h-12 bg-white/5 border-none rounded-xl text-white font-bold" placeholder="Identity Label" /></div>
                    <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-white/40 ml-1">Username</Label><Input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))} className="h-12 bg-white/5 border-none rounded-xl text-white font-bold" placeholder="signature_id" /></div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/40 ml-1">Email or Phone</Label>
                    <Input value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="h-12 bg-white/5 border-none rounded-xl text-white font-bold" placeholder="e.g. +231778451835 (no zero)" />
                    <p className="text-[8px] font-bold text-white/20 uppercase ml-1">Include country code and skip the leading zero.</p>
                  </div>
                  <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-white/40 ml-1">Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 bg-white/5 border-none rounded-xl text-white font-bold" placeholder="••••••••" /></div>
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <button type="button" onClick={() => setSignupStep(1)} className="flex items-center gap-2 text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors mb-2"><ArrowLeft className="h-3 w-3" /> Back to Protocol</button>
                  <div className="space-y-2"><Label className="text-[10px] font-black uppercase text-white/40 ml-1">Arrival Date (DOB)</Label><div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" /><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="h-12 pl-11 bg-white/5 border-none rounded-xl text-white font-bold" /></div></div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/40 ml-1">Nationality</Label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                      <select 
                        value={nationality} 
                        onChange={(e) => setNationality(e.target.value)} 
                        className="w-full h-12 pl-11 bg-white/5 border-none rounded-xl text-white font-bold appearance-none outline-none"
                      >
                        {NATIONALITIES.map(n => (
                          <option key={n} value={n} className="bg-zinc-900">{n}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-white/40 ml-1">Gender Node</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setGender('Male')} className={cn("h-12 rounded-xl border-2 transition-all font-black uppercase text-[10px]", gender === 'Male' ? "bg-primary border-primary text-white" : "border-white/5 bg-white/5 text-white/40")}>Male</button>
                      <button type="button" onClick={() => setGender('Female')} className={cn("h-12 rounded-xl border-2 transition-all font-black uppercase text-[10px]", gender === 'Female' ? "bg-primary border-primary text-white" : "border-white/5 bg-white/5 text-white/40")}>Female</button>
                    </div>
                  </div>
                </div>
              )}
              <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl bg-primary text-white font-black italic uppercase tracking-[0.2em]">{isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : signupStep === 1 ? "Next Protocol" : "Materialize Identity"}</Button>
              <div className="text-center"><button type="button" onClick={() => { setMode('login'); setSignupStep(1); setAuthError(null); }} className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-primary transition-all">Back to Sync</button></div>
            </form>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">Check your Device</h2>
                <p className="text-xs text-white/40 font-medium">We transmitted a 6-digit security signature to **{identifier}**. Enter it to synchronize.</p>
              </div>

              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => e.key === 'Backspace' && !otp[i] && i > 0 && otpRefs.current[i - 1]?.focus()}
                    className="w-full h-14 bg-white/5 border-none rounded-xl text-center text-xl font-black text-white focus:ring-2 ring-primary transition-all"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Clock className="h-3 w-3 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest tabular-nums">{formatTime(timeLeft)} Remaining</span>
                  </div>
                  <button 
                    disabled={!canResend || isLoading} 
                    onClick={handleResend}
                    className={cn("text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1", canResend ? "text-primary hover:text-primary/80" : "text-white/20")}
                  >
                    <RefreshCcw className="h-3 w-3" /> Resend Pulse
                  </button>
                </div>
                
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex gap-3">
                  <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                  <p className="text-[9px] font-bold text-primary/60 uppercase leading-relaxed tracking-tighter">
                    Signature valid for 2 minutes. Failure to sync within this window requires a new pulse.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        <footer className="w-full flex flex-col items-center gap-4 opacity-40">
          <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-primary" /><span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Command Cluster v1.5</span></div>
          <p className="text-[9px] font-bold text-white uppercase tracking-widest text-center">ViMore Logic • Automated Identity Vault</p>
        </footer>
      </div>
    </div>
  );
}
