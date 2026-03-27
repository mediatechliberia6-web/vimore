"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Mail, Lock, User, Globe, Calendar, ArrowRight, Loader2,
  CheckCircle2, Zap, Search, X, Sparkles, RefreshCw, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePosts } from "@/context/PostContext";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

const COUNTRIES = [
  { name: "Algeria", flag: "🇩🇿" }, { name: "Angola", flag: "🇦🇴" }, { name: "Benin", flag: "🇧🇯" },
  { name: "Botswana", flag: "🇧🇼" }, { name: "Burkina Faso", flag: "🇧🇫" }, { name: "Burundi", flag: "🇧🇮" },
  { name: "Cabo Verde", flag: "🇨🇻" }, { name: "Cameroon", flag: "🇨🇲" }, { name: "Central African Republic", flag: "🇨🇫" },
  { name: "Chad", flag: "🇹🇩" }, { name: "Comoros", flag: "🇰🇲" }, { name: "DR Congo", flag: "🇨🇩" },
  { name: "Republic of Congo", flag: "🇨🇬" }, { name: "Djibouti", flag: "🇩🇯" }, { name: "Egypt", flag: "🇪🇬" },
  { name: "Equatorial Guinea", flag: "🇬🇶" }, { name: "Eritrea", flag: "🇪🇷" }, { name: "Ethiopia", flag: "🇪🇹" },
  { name: "Gabon", flag: "🇬🇦" }, { name: "Gambia", flag: "🇬🇲" }, { name: "Ghana", flag: "🇬🇭" },
  { name: "Guinea", flag: "🇬🇳" }, { name: "Guinea-Bissau", flag: "🇬🇼" }, { name: "Ivory Coast", flag: "🇨🇮" },
  { name: "Kenya", flag: "🇰🇪" }, { name: "Lesotho", flag: "🇱🇸" }, { name: "Liberia", flag: "🇱🇷" },
  { name: "Libya", flag: "🇱🇾" }, { name: "Madagascar", flag: "🇲🇬" }, { name: "Malawi", flag: "🇲🇼" },
  { name: "Mali", flag: "🇲🇱" }, { name: "Mauritania", flag: "🇲🇷" }, { name: "Mauritius", flag: "🇲🇺" },
  { name: "Morocco", flag: "🇲🇦" }, { name: "Mozambique", flag: "🇲🇿" }, { name: "Namibia", flag: "🇳🇦" },
  { name: "Niger", flag: "🇳🇪" }, { name: "Nigeria", flag: "🇳🇬" }, { name: "Rwanda", flag: "🇷🇼" },
  { name: "São Tomé & Príncipe", flag: "🇸🇹" }, { name: "Senegal", flag: "🇸🇳" }, { name: "Seychelles", flag: "🇸🇨" },
  { name: "Sierra Leone", flag: "🇸🇱" }, { name: "Somalia", flag: "🇸🇴" }, { name: "South Africa", flag: "🇿🇦" },
  { name: "South Sudan", flag: "🇸🇸" }, { name: "Sudan", flag: "🇸🇩" }, { name: "Eswatini", flag: "🇸🇿" },
  { name: "Tanzania", flag: "🇹🇿" }, { name: "Togo", flag: "🇹🇬" }, { name: "Tunisia", flag: "🇹🇳" },
  { name: "Uganda", flag: "🇺🇬" }, { name: "Zambia", flag: "🇿🇲" }, { name: "Zimbabwe", flag: "🇿🇼" },
  { name: "Afghanistan", flag: "🇦🇫" }, { name: "Armenia", flag: "🇦🇲" }, { name: "Azerbaijan", flag: "🇦🇿" },
  { name: "Bahrain", flag: "🇧🇭" }, { name: "Bangladesh", flag: "🇧🇩" }, { name: "Bhutan", flag: "🇧🇹" },
  { name: "Brunei", flag: "🇧🇳" }, { name: "Cambodia", flag: "🇰🇭" }, { name: "China", flag: "🇨🇳" },
  { name: "Georgia", flag: "🇬🇪" }, { name: "India", flag: "🇮🇳" }, { name: "Indonesia", flag: "🇮🇩" },
  { name: "Iran", flag: "🇮🇷" }, { name: "Iraq", flag: "🇮🇶" }, { name: "Japan", flag: "🇯🇵" },
  { name: "Jordan", flag: "🇯🇴" }, { name: "Kazakhstan", flag: "🇰🇿" }, { name: "Kuwait", flag: "🇰🇼" },
  { name: "Kyrgyzstan", flag: "🇰🇬" }, { name: "Laos", flag: "🇱🇦" }, { name: "Lebanon", flag: "🇱🇧" },
  { name: "Malaysia", flag: "🇲🇾" }, { name: "Maldives", flag: "🇲🇻" }, { name: "Mongolia", flag: "🇲🇳" },
  { name: "Myanmar", flag: "🇲🇲" }, { name: "Nepal", flag: "🇳🇵" }, { name: "North Korea", flag: "🇰🇵" },
  { name: "Oman", flag: "🇴🇲" }, { name: "Pakistan", flag: "🇵🇰" }, { name: "Palestine", flag: "🇵🇸" },
  { name: "Philippines", flag: "🇵🇭" }, { name: "Qatar", flag: "🇶🇦" }, { name: "Saudi Arabia", flag: "🇸🇦" },
  { name: "Singapore", flag: "🇸🇬" }, { name: "South Korea", flag: "🇰🇷" }, { name: "Sri Lanka", flag: "🇱🇰" },
  { name: "Syria", flag: "🇸🇾" }, { name: "Taiwan", flag: "🇹🇼" }, { name: "Tajikistan", flag: "🇹🇯" },
  { name: "Thailand", flag: "🇹🇭" }, { name: "Turkmenistan", flag: "🇹🇲" }, { name: "United Arab Emirates", flag: "🇦🇪" },
  { name: "Uzbekistan", flag: "🇺🇿" }, { name: "Vietnam", flag: "🇻🇳" }, { name: "Yemen", flag: "🇾🇪" },
  { name: "Albania", flag: "🇦🇱" }, { name: "Austria", flag: "🇦🇹" }, { name: "Belgium", flag: "🇧🇪" },
  { name: "Bosnia & Herzegovina", flag: "🇧🇦" }, { name: "Bulgaria", flag: "🇧🇬" }, { name: "Croatia", flag: "🇭🇷" },
  { name: "Cyprus", flag: "🇨🇾" }, { name: "Czech Republic", flag: "🇨🇿" }, { name: "Denmark", flag: "🇩🇰" },
  { name: "Estonia", flag: "🇪🇪" }, { name: "Finland", flag: "🇫🇮" }, { name: "France", flag: "🇫🇷" },
  { name: "Germany", flag: "🇩🇪" }, { name: "Greece", flag: "🇬🇷" }, { name: "Hungary", flag: "🇭🇺" },
  { name: "Iceland", flag: "🇮🇸" }, { name: "Ireland", flag: "🇮🇪" }, { name: "Italy", flag: "🇮🇹" },
  { name: "Latvia", flag: "🇱🇻" }, { name: "Lithuania", flag: "🇱🇹" }, { name: "Luxembourg", flag: "🇱🇺" },
  { name: "Malta", flag: "🇲🇹" }, { name: "Netherlands", flag: "🇳🇱" }, { name: "Norway", flag: "🇳🇴" },
  { name: "Poland", flag: "🇵🇱" }, { name: "Portugal", flag: "🇵🇹" }, { name: "Romania", flag: "🇷🇴" },
  { name: "Russia", flag: "🇷🇺" }, { name: "Serbia", flag: "🇷🇸" }, { name: "Slovakia", flag: "🇸🇰" },
  { name: "Slovenia", flag: "🇸🇮" }, { name: "Spain", flag: "🇪🇸" }, { name: "Sweden", flag: "🇸🇪" },
  { name: "Switzerland", flag: "🇨🇭" }, { name: "Turkey", flag: "🇹🇷" }, { name: "Ukraine", flag: "🇺🇦" },
  { name: "United Kingdom", flag: "🇬🇧" }, { name: "Argentina", flag: "🇦🇷" }, { name: "Barbados", flag: "🇧🇧" },
  { name: "Bolivia", flag: "🇧🇴" }, { name: "Brazil", flag: "🇧🇷" }, { name: "Canada", flag: "🇨🇦" },
  { name: "Chile", flag: "🇨🇱" }, { name: "Colombia", flag: "🇨🇴" }, { name: "Costa Rica", flag: "🇨🇷" },
  { name: "Cuba", flag: "🇨🇺" }, { name: "Dominican Republic", flag: "🇩🇴" }, { name: "Ecuador", flag: "🇪🇨" },
  { name: "El Salvador", flag: "🇸🇻" }, { name: "Guatemala", flag: "🇬🇹" }, { name: "Guyana", flag: "🇬🇾" },
  { name: "Haiti", flag: "🇭🇹" }, { name: "Honduras", flag: "🇭🇳" }, { name: "Jamaica", flag: "🇯🇲" },
  { name: "Mexico", flag: "🇲🇽" }, { name: "Nicaragua", flag: "🇳🇮" }, { name: "Panama", flag: "🇵🇦" },
  { name: "Paraguay", flag: "🇵🇾" }, { name: "Peru", flag: "🇵🇪" }, { name: "Trinidad & Tobago", flag: "🇹🇹" },
  { name: "United States", flag: "🇺🇸" }, { name: "Uruguay", flag: "🇺🇾" }, { name: "Venezuela", flag: "🇻🇪" },
  { name: "Australia", flag: "🇦🇺" }, { name: "Fiji", flag: "🇫🇯" }, { name: "New Zealand", flag: "🇳🇿" },
  { name: "Papua New Guinea", flag: "🇵🇬" }, { name: "Samoa", flag: "🇼🇸" }, { name: "Solomon Islands", flag: "🇸🇧" },
  { name: "Vanuatu", flag: "🇻🇺" },
];

function generateUsername(name: string, existingUsernames: string[] = []): string {
  const base = name.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).join("").substring(0, 15);
  if (!base) return `user${Math.floor(1000 + Math.random() * 9000)}`;
  let username = `${base}${Math.floor(100 + Math.random() * 900)}`;
  let attempts = 0;
  while (existingUsernames.includes(username) && attempts < 20) {
    username = `${base}${Math.floor(100 + Math.random() * 9000)}`;
    attempts++;
  }
  return username;
}

function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  if (!password) return { level: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { level: 1, label: "Weak", color: "#ef4444" };
  if (score <= 2) return { level: 2, label: "Fair", color: "#f97316" };
  if (score <= 3) return { level: 3, label: "Good", color: "#eab308" };
  if (score <= 4) return { level: 4, label: "Strong", color: "#22c55e" };
  return { level: 5, label: "Very Strong", color: "#9940E5" };
}

function calculateAge(dob: string): string {
  if (!dob) return "";
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  if (age < 0) return "";
  return `${age} years old`;
}

export default function SignupPage() {
  const { signup, currentUser, isLoading: contextLoading } = usePosts();
  const { toast } = useToast();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [username, setUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCountryDialog, setShowCountryDialog] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  useEffect(() => {
    if (!contextLoading && currentUser) {
      router.replace("/");
    }
  }, [currentUser, contextLoading, router]);

  useEffect(() => {
    if (name.trim().length > 0) {
      const generated = generateUsername(name);
      setUsername(generated);
    } else {
      setUsername("");
    }
  }, [name]);

  const regenerateUsername = () => {
    if (name.trim()) {
      setUsername(generateUsername(name));
    }
  };

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const age = useMemo(() => calculateAge(dob), [dob]);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const filteredCountries = useMemo(() =>
    COUNTRIES.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())),
    [countrySearch]
  );

  const maxDob = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 13);
    return d.toISOString().split("T")[0];
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords don't match", description: "Please confirm your password correctly." });
      return;
    }
    if (password.length < 8) {
      toast({ variant: "destructive", title: "Password too short", description: "Password must be at least 8 characters." });
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await signup({ name, email, password, dob, nationality, username });
      if (result.success) {
        setIsSuccess(true);
      } else if (!result.success && result.message) {
        toast({ variant: "destructive", title: "Signup failed", description: result.message });
      }
    } catch {
      toast({ variant: "destructive", title: "Signup failed", description: "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6" style={{ colorScheme: 'light' }}>
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-200 to-purple-100 blur-3xl opacity-60" />
          <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-violet-100 to-pink-100 blur-3xl opacity-50" />
        </div>
        <div className="relative z-10 text-center space-y-6 animate-in zoom-in-95 fade-in duration-500 max-w-sm w-full">
          <div className="h-24 w-24 bg-[#9940E5] rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-violet-300">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">You&apos;re In!</h2>
            <p className="text-gray-600 font-medium">
              Welcome to ViMore, <span className="font-bold text-gray-900">{name}</span>.
            </p>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              Your account is ready. Sign in now to start connecting.
            </p>
            <div className="inline-flex items-center gap-2 bg-violet-50 rounded-full px-4 py-2 mt-2">
              <span className="text-[#9940E5] font-black text-sm">@{username}</span>
            </div>
          </div>
          <button
            onClick={() => router.replace("/")}
            className="inline-flex items-center justify-center w-full h-12 rounded-2xl bg-[#9940E5] text-white font-black italic uppercase tracking-widest text-sm shadow-xl shadow-violet-200 transition-all hover:bg-violet-700"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden" style={{ colorScheme: 'light' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-200 to-purple-100 blur-3xl opacity-60" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-violet-100 to-pink-100 blur-3xl opacity-50" />
        <div className="absolute top-1/3 right-1/4 w-32 h-32 rounded-full bg-violet-50 blur-2xl opacity-60" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-6 pt-12 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#9940E5] flex items-center justify-center shadow-lg shadow-violet-200">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-black italic uppercase tracking-tighter text-gray-900">ViMore</span>
          </div>
          <Link href="/login">
            <span className="text-sm font-bold text-[#9940E5] hover:text-violet-700 transition-colors">Sign In</span>
          </Link>
        </header>

        <div className="flex-1 px-6 py-4 max-w-sm mx-auto w-full">
          <div className="mb-8 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#9940E5]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#9940E5]">New Account</span>
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
              Join the<br />
              <span className="text-[#9940E5]">Creator Grid</span>
            </h1>
            <p className="text-sm text-gray-500 font-medium">Create your account in seconds.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-violet-100/50 p-7 space-y-5">
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <Input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="h-14 pl-11 bg-gray-50 border-gray-100 rounded-2xl text-gray-900 font-medium placeholder:text-gray-300 focus:border-[#9940E5] focus:ring-[#9940E5]/20 focus:ring-4 transition-all"
                  />
                </div>

                {username && (
                  <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-300">
                    <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-3 py-1.5 flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-gray-400">@</span>
                      <span className="text-sm font-black text-[#9940E5] truncate">{username}</span>
                    </div>
                    <button
                      type="button"
                      onClick={regenerateUsername}
                      className="h-8 w-8 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center text-[#9940E5] hover:bg-violet-100 transition-colors shrink-0"
                      title="Generate new username"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="h-14 pl-11 bg-gray-50 border-gray-100 rounded-2xl text-gray-900 font-medium placeholder:text-gray-300 focus:border-[#9940E5] focus:ring-[#9940E5]/20 focus:ring-4 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 pointer-events-none" />
                  <Input
                    type="date"
                    value={dob}
                    onChange={e => setDob(e.target.value)}
                    max={maxDob}
                    required
                    className="h-14 pl-11 bg-gray-50 border-gray-100 rounded-2xl text-gray-900 font-medium focus:border-[#9940E5] focus:ring-[#9940E5]/20 focus:ring-4 transition-all"
                  />
                </div>
                {age && (
                  <p className="text-[11px] font-bold text-[#9940E5] pl-2 animate-in fade-in duration-200">
                    · {age}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Nationality</Label>
                <button
                  type="button"
                  onClick={() => setShowCountryDialog(true)}
                  className="w-full h-14 pl-4 pr-4 bg-gray-50 border border-gray-100 rounded-2xl text-left flex items-center gap-3 focus:border-[#9940E5] focus:ring-[#9940E5]/20 focus:ring-4 transition-all outline-none"
                >
                  <Globe className="h-4 w-4 text-gray-300 shrink-0" />
                  {nationality ? (
                    <span className="text-gray-900 font-medium text-sm flex items-center gap-2">
                      <span className="text-xl">{COUNTRIES.find(c => c.name === nationality)?.flag}</span>
                      {nationality}
                    </span>
                  ) : (
                    <span className="text-gray-300 text-sm font-medium">Select your country</span>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-violet-100/50 p-7 space-y-5">
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-14 pl-11 pr-12 bg-gray-50 border-gray-100 rounded-2xl text-gray-900 font-medium placeholder:text-gray-300 focus:border-[#9940E5] focus:ring-[#9940E5]/20 focus:ring-4 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div
                          key={i}
                          className="h-1.5 flex-1 rounded-full transition-all duration-300"
                          style={{
                            backgroundColor: i <= passwordStrength.level ? passwordStrength.color : "#f3f4f6"
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] font-bold pl-1" style={{ color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Confirm Password</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`h-14 pl-11 pr-12 bg-gray-50 rounded-2xl text-gray-900 font-medium placeholder:text-gray-300 focus:ring-4 transition-all border ${
                      passwordsMatch ? "border-green-200 focus:border-green-400 focus:ring-green-100" :
                      passwordsMismatch ? "border-red-200 focus:border-red-400 focus:ring-red-100" :
                      "border-gray-100 focus:border-[#9940E5] focus:ring-[#9940E5]/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {passwordsMatch && (
                    <CheckCircle2 className="absolute right-12 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  )}
                </div>
                {passwordsMismatch && (
                  <p className="text-[11px] font-bold text-red-400 pl-1 animate-in fade-in duration-200">Passwords do not match</p>
                )}
              </div>
            </div>

            <div className="px-2">
              <p className="text-[11px] text-gray-400 font-medium text-center leading-relaxed">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-[#9940E5] font-bold">Terms</Link> and{" "}
                <Link href="/privacy" className="text-[#9940E5] font-bold">Privacy Policy</Link>.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !name || !email || !dob || !nationality || !password || !confirmPassword || passwordsMismatch}
              className="w-full h-14 rounded-2xl bg-[#9940E5] hover:bg-violet-700 text-white font-black italic uppercase tracking-[0.15em] text-sm shadow-xl shadow-violet-200 transition-all active:scale-95 gap-3"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="h-5 w-5" />
                </>
              )}
            </Button>

            <div className="text-center pb-10">
              <p className="text-sm text-gray-500 font-medium">
                Already have an account?{" "}
                <Link href="/login" className="font-black italic uppercase tracking-tight text-[#9940E5] hover:text-violet-700 transition-colors">
                  Sign In →
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {showCountryDialog && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200">
          <div className="bg-white rounded-t-[2rem] w-full max-w-lg shadow-2xl flex flex-col animate-in slide-in-from-bottom-4 duration-300" style={{ height: "75vh" }}>
            <div className="p-6 pb-4 space-y-4 shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900">Select Country</h3>
                <button
                  onClick={() => { setShowCountryDialog(false); setCountrySearch(""); }}
                  className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <Input
                  type="text"
                  value={countrySearch}
                  onChange={e => setCountrySearch(e.target.value)}
                  placeholder="Search country..."
                  autoFocus
                  className="h-12 pl-11 bg-gray-50 border-gray-100 rounded-2xl text-gray-900 font-medium placeholder:text-gray-300 focus:border-[#9940E5] focus:ring-[#9940E5]/20 focus:ring-4 transition-all"
                />
              </div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{filteredCountries.length} countries</p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
              {filteredCountries.map(country => (
                <button
                  key={country.name}
                  type="button"
                  onClick={() => {
                    setNationality(country.name);
                    setShowCountryDialog(false);
                    setCountrySearch("");
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left ${
                    nationality === country.name
                      ? "bg-violet-50 border border-violet-100"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <span className="text-2xl">{country.flag}</span>
                  <span className={`text-sm font-bold ${nationality === country.name ? "text-[#9940E5]" : "text-gray-700"}`}>
                    {country.name}
                  </span>
                  {nationality === country.name && (
                    <CheckCircle2 className="h-4 w-4 text-[#9940E5] ml-auto" />
                  )}
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <div className="py-12 text-center">
                  <Globe className="h-8 w-8 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-400">No countries found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
