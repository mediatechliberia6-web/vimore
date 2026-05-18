
"use client";

import { useState, useEffect, use } from "react";
import {
  Zap,
  Mail,
  Lock,
  Loader2,
  ShieldCheck,
  User,
  Globe,
  Calendar,
  AlertTriangle,
  Smartphone,
  ArrowLeft,
  Star,
  CheckCircle2,
  Gift,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePosts } from "@/context/PostContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { databases, DATABASE_ID, COL, Query, BUCKET, getFileUrl } from "@/lib/appwrite";
import Link from "next/link";

const NATIONALITIES = [
  "Liberian", "American", "Nigerian", "Ghanian", "Guinean",
  "Sierra Leonean", "Ivory Coast", "European", "Asian", "Other",
];

export default function JoinPage({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = use(params);
  const referrerUsername = resolvedParams.username;

  const { signup, currentUser, triggerHaptic } = usePosts();
  const { toast } = useToast();
  const router = useRouter();

  const [referrerProfile, setReferrerProfile] = useState<{ name: string; avatar: string; isVerified: boolean } | null>(null);
  const [loadingReferrer, setLoadingReferrer] = useState(true);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("Liberian");
  const [gender, setGender] = useState<"Male" | "Female">("Male");

  // Store referrer in localStorage and fetch their profile
  useEffect(() => {
    try { localStorage.setItem("vimore_referrer", referrerUsername); } catch { /* ignore */ }

    (async () => {
      try {
        const res = await databases.listDocuments(DATABASE_ID, COL.USERS, [
          Query.equal("username", referrerUsername),
          Query.limit(1),
        ]);
        if (res.documents.length > 0) {
          const doc = res.documents[0];
          setReferrerProfile({
            name: doc.name || referrerUsername,
            avatar: doc.avatar_id ? getFileUrl(BUCKET.AVATARS, doc.avatar_id) : "",
            isVerified: doc.is_verified || false,
          });
        }
      } catch { /* ignore */ }
      finally { setLoadingReferrer(false); }
    })();
  }, [referrerUsername]);

  // If already logged in, redirect to feed
  useEffect(() => {
    if (currentUser?.username && currentUser.username !== "guest_node") {
      router.replace("/");
    }
  }, [currentUser, router]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const isEmail = identifier.includes("@");
    const isPhone = /^\+?\d+$/.test(identifier.replace(/[-\s]/g, ""));
    if (!isEmail && !isPhone) {
      setAuthError("Use a valid email or phone number (+231...).");
      return;
    }
    if (password.length < 8) {
      setAuthError("Password must be at least 8 characters.");
      return;
    }
    if (!name.trim()) {
      setAuthError("Please enter your full name.");
      return;
    }
    triggerHaptic(10);
    setStep(2);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!dob) {
      setAuthError("Date of birth is required.");
      return;
    }

    setIsLoading(true);
    triggerHaptic(30);

    try {
      const isEmail = identifier.includes("@");
      const res = await signup({
        email: isEmail ? identifier : undefined,
        phone: !isEmail ? identifier : undefined,
        password,
        name,
        dob,
        nationality,
        gender,
        referredBy: referrerUsername,
      });

      if (res?.success) {
        try { localStorage.removeItem("vimore_referrer"); } catch { /* ignore */ }
        setSuccess(true);
        triggerHaptic(50);
        setTimeout(() => router.replace("/"), 2500);
      } else {
        setAuthError(res?.message || "Account creation failed. Please try again.");
      }
    } catch (err: any) {
      setAuthError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 space-y-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/15 blur-[120px] rounded-full animate-pulse delay-700" />
        </div>
        <div className="relative z-10 flex flex-col items-center gap-6 animate-in zoom-in-95 fade-in duration-500 text-center">
          <div className="h-20 w-20 bg-emerald-500 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Welcome to ViMore!</h2>
            <p className="text-white/50 text-sm font-bold">Your account is ready. Taking you to the feed...</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center gap-3">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
            <p className="text-[11px] font-black text-white/70 uppercase tracking-widest">
              @{referrerUsername} just earned 5,000 Stars for inviting you!
            </p>
          </div>
          <Loader2 className="h-5 w-5 text-primary animate-spin mt-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-6 animate-in fade-in zoom-in-95 duration-700">

        {/* Logo */}
        <header className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-primary rounded-[1.125rem] flex items-center justify-center text-white shadow-2xl">
              <Zap className="h-8 w-8 fill-current" />
            </div>
          </div>
          <div className="space-y-0.5">
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">ViMore</h1>
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.4em]">Liberia's Super App</p>
          </div>
        </header>

        {/* Referrer invitation card */}
        <div className="w-full bg-primary/10 border border-primary/20 rounded-[2rem] p-5 flex items-center gap-4">
          {loadingReferrer ? (
            <div className="h-14 w-14 rounded-2xl bg-white/10 animate-pulse shrink-0" />
          ) : (
            <Avatar className="h-14 w-14 rounded-2xl border-2 border-primary/30 shrink-0">
              <AvatarImage src={referrerProfile?.avatar} className="object-cover" />
              <AvatarFallback className="rounded-2xl bg-primary/20 text-white font-black text-lg">
                {(referrerProfile?.name || referrerUsername)[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-black text-white text-base leading-tight">
                {referrerProfile?.name || `@${referrerUsername}`}
              </p>
              {referrerProfile?.isVerified && (
                <CheckCircle2 className="h-4 w-4 text-primary fill-primary shrink-0" />
              )}
            </div>
            <p className="text-[10px] text-white/40 font-bold">@{referrerUsername}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Gift className="h-3 w-3 text-amber-400" />
              <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                Invited you to join ViMore
              </p>
            </div>
          </div>
        </div>

        {/* Stars reward notice */}
        <div className="w-full flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3">
          <Star className="h-4 w-4 text-amber-400 fill-amber-400 shrink-0" />
          <p className="text-[10px] font-black text-amber-400/90 uppercase tracking-widest leading-relaxed">
            When you join, @{referrerUsername} earns <span className="text-amber-400">5,000 Stars</span> instantly.
          </p>
        </div>

        {/* Signup form card */}
        <div className="w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-6">

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3">
            {[1, 2].map(s => (
              <div key={s} className="flex items-center gap-3">
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 transition-all",
                  step === s ? "bg-primary border-primary text-white" :
                  step > s ? "bg-primary/20 border-primary/40 text-primary" :
                  "bg-white/5 border-white/10 text-white/30"
                )}>
                  {step > s ? <CheckCircle2 className="h-3.5 w-3.5" /> : s}
                </div>
                {s < 2 && <div className={cn("h-px w-8 transition-all", step > s ? "bg-primary/40" : "bg-white/10")} />}
              </div>
            ))}
          </div>

          {authError && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-[11px] font-bold text-destructive leading-tight">{authError}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleNext} className="space-y-4 animate-in slide-in-from-bottom-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 text-center">Step 1 — Your Identity</p>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-white/40 ml-1">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="h-12 pl-11 bg-white/5 border-white/10 rounded-xl text-white font-bold placeholder:text-white/20"
                    placeholder="Your Full Name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-white/40 ml-1">Email or Phone</Label>
                <div className="relative">
                  {identifier.includes("@")
                    ? <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                    : <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />}
                  <Input
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    className="h-12 pl-11 bg-white/5 border-white/10 rounded-xl text-white font-bold placeholder:text-white/20"
                    placeholder="Email or +231..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-white/40 ml-1">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-12 pl-11 bg-white/5 border-white/10 rounded-xl text-white font-bold placeholder:text-white/20"
                    placeholder="Min 8 characters"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-14 rounded-2xl bg-primary text-white font-black italic uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
              >
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4 animate-in slide-in-from-right-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-white/30 text-center">Step 2 — About You</p>
              <button
                type="button"
                onClick={() => { setStep(1); setAuthError(null); }}
                className="flex items-center gap-2 text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-white/40 ml-1">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <Input
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    className="h-12 pl-11 bg-white/5 border-white/10 rounded-xl text-white font-bold"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-white/40 ml-1">Nationality</Label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <select
                    value={nationality}
                    onChange={e => setNationality(e.target.value)}
                    className="w-full h-12 pl-11 bg-white/5 border border-white/10 rounded-xl text-white font-bold appearance-none outline-none"
                  >
                    {NATIONALITIES.map(n => (
                      <option key={n} value={n} className="bg-zinc-900">{n}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-white/40 ml-1">Gender</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["Male", "Female"] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={cn(
                        "h-12 rounded-xl border-2 transition-all font-black uppercase text-[10px]",
                        gender === g ? "bg-primary border-primary text-white" : "border-white/10 bg-white/5 text-white/40"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-2xl bg-primary text-white font-black italic uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Account"}
              </Button>
              <p className="text-[9px] text-white/30 text-center leading-relaxed px-2">
                By joining, you agree to our{" "}
                <Link href="/terms" className="text-white/50 hover:text-primary underline">Terms</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-white/50 hover:text-primary underline">Privacy Policy</Link>.
              </p>
            </form>
          )}

          <div className="text-center pt-1">
            <Link href="/" className="text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-primary transition-all">
              Already have an account? Log in
            </Link>
          </div>
        </div>

        <footer className="w-full flex flex-col items-center gap-3 opacity-30">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">Media Tech Liberia • ViMore v1.5</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
