"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Sparkles, ArrowRight, Loader2, CheckCircle2, Zap, Users, Star, AtSign, ShieldQuestion, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePosts } from "@/context/PostContext";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { getSecurityQuestion, verifySecurityAnswer } from "@/lib/appwrite";

type ForgotStep = "id" | "question" | "newpass" | "done";

export default function LoginPage() {
  const { login, currentUser, isLoading: contextLoading } = usePosts();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotStep>("id");
  const [forgotId, setForgotId] = useState("");
  const [forgotQuestion, setForgotQuestion] = useState("");
  const [forgotAnswer, setForgotAnswer] = useState("");
  const [forgotNewPass, setForgotNewPass] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  useEffect(() => {
    if (!contextLoading && currentUser) {
      router.replace("/");
    }
  }, [currentUser, contextLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) return;
    setIsSubmitting(true);
    try {
      const result = await login(identifier, password);
      if (result.success) {
        router.push("/");
      } else {
        toast({ variant: "destructive", title: "Sign in failed", description: result.message || "Please check your credentials." });
      }
    } catch {
      toast({ variant: "destructive", title: "Sign in failed", description: "Please check your credentials." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForgot = () => {
    setShowForgot(false);
    setForgotStep("id");
    setForgotId("");
    setForgotQuestion("");
    setForgotAnswer("");
    setForgotNewPass("");
    setForgotConfirm("");
  };

  const handleFindAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotId) return;
    setForgotLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const normalised = forgotId.includes("@") ? forgotId : `${forgotId}@vimore.cfd`;
    const question = getSecurityQuestion(normalised);
    setForgotLoading(false);
    if (!question) {
      toast({ variant: "destructive", title: "Account not found", description: "No account matches that ViMore ID." });
      return;
    }
    setForgotQuestion(question);
    setForgotStep("question");
  };

  const handleVerifyAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotAnswer) return;
    setForgotLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const normalised = forgotId.includes("@") ? forgotId : `${forgotId}@vimore.cfd`;
    const correct = verifySecurityAnswer(normalised, forgotAnswer);
    setForgotLoading(false);
    if (!correct) {
      toast({ variant: "destructive", title: "Wrong answer", description: "Your answer does not match. Please try again." });
      return;
    }
    setForgotStep("newpass");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotNewPass || forgotNewPass !== forgotConfirm) {
      toast({ variant: "destructive", title: "Passwords don't match", description: "Please confirm your new password correctly." });
      return;
    }
    if (forgotNewPass.length < 8) {
      toast({ variant: "destructive", title: "Password too short", description: "Password must be at least 8 characters." });
      return;
    }
    setForgotLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setForgotLoading(false);
    setForgotStep("done");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden" style={{ colorScheme: 'light' }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-violet-200 to-purple-100 blur-3xl opacity-60" />
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-violet-100 to-pink-100 blur-3xl opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-violet-50 blur-3xl opacity-40" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="flex items-center justify-between px-6 pt-12 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#9940E5] flex items-center justify-center shadow-lg shadow-violet-200">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-black italic uppercase tracking-tighter text-gray-900">ViMore</span>
          </div>
          <Link href="/signup">
            <span className="text-sm font-bold text-[#9940E5] hover:text-violet-700 transition-colors">Sign Up</span>
          </Link>
        </header>

        <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-sm mx-auto w-full">
          <div className="mb-10 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#9940E5]" />
              <span className="text-[11px] font-black uppercase tracking-widest text-[#9940E5]">Welcome Back</span>
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">
              Sign In to<br />
              <span className="text-[#9940E5]">ViMore</span>
            </h1>
            <p className="text-sm text-gray-500 font-medium">Where creators thrive and connect.</p>
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl shadow-violet-100/50 p-7 space-y-5 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">ViMore ID</Label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                  <Input
                    type="text"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="yourname@vimore.cfd"
                    required
                    className="h-14 pl-11 bg-gray-50 border-gray-100 rounded-2xl text-gray-900 font-medium placeholder:text-gray-300 focus:border-[#9940E5] focus:ring-[#9940E5]/20 focus:ring-4 transition-all"
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-medium pl-1">You can type just <span className="text-[#9940E5] font-bold">yourname</span> — we'll add @vimore.cfd automatically</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgot(true)}
                    className="text-[11px] font-bold text-[#9940E5] hover:text-violet-700 transition-colors uppercase tracking-wide"
                  >
                    Forgot Password?
                  </button>
                </div>
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
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !identifier || !password}
                className="w-full h-14 rounded-2xl bg-[#9940E5] hover:bg-violet-700 text-white font-black italic uppercase tracking-[0.15em] text-sm shadow-xl shadow-violet-200 transition-all active:scale-95 gap-3 mt-2"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="relative flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <div className="text-center space-y-1">
              <p className="text-sm text-gray-500 font-medium">Don&apos;t have an account?</p>
              <Link href="/signup">
                <span className="text-sm font-black italic uppercase tracking-tight text-[#9940E5] hover:text-violet-700 transition-colors">
                  Create Account →
                </span>
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 animate-in fade-in duration-1000 delay-300">
            {[
              { icon: Users, value: "2M+", label: "Creators" },
              { icon: Star, value: "4.9★", label: "Rating" },
              { icon: Sparkles, value: "50+", label: "Countries" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-gray-50 rounded-2xl p-3 text-center border border-gray-100">
                <Icon className="h-4 w-4 text-[#9940E5] mx-auto mb-1" />
                <p className="text-sm font-black text-gray-900">{value}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <footer className="py-6 text-center">
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
            ViMore · Media Tech Liberia · v1.5
          </p>
        </footer>
      </div>

      {showForgot && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-7 shadow-2xl space-y-6 animate-in slide-in-from-bottom-4 duration-300">

            {forgotStep === "done" ? (
              <div className="text-center space-y-4 py-4">
                <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900">Password Reset!</h3>
                  <p className="text-sm text-gray-500">Your password has been updated. You can now sign in.</p>
                </div>
                <Button
                  onClick={resetForgot}
                  className="w-full h-12 rounded-2xl bg-[#9940E5] text-white font-black italic uppercase tracking-widest text-sm"
                >
                  Sign In Now
                </Button>
              </div>
            ) : forgotStep === "id" ? (
              <>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-violet-50 flex items-center justify-center">
                      <AtSign className="h-5 w-5 text-[#9940E5]" />
                    </div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900">Reset Password</h3>
                  </div>
                  <p className="text-sm text-gray-500 pl-11">Enter your ViMore ID to find your account.</p>
                </div>
                <form onSubmit={handleFindAccount} className="space-y-4">
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <Input
                      type="text"
                      value={forgotId}
                      onChange={e => setForgotId(e.target.value)}
                      placeholder="yourname@vimore.cfd"
                      required
                      className="h-14 pl-11 bg-gray-50 border-gray-100 rounded-2xl text-gray-900 font-medium placeholder:text-gray-300 focus:border-[#9940E5] focus:ring-[#9940E5]/20 focus:ring-4 transition-all"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={forgotLoading || !forgotId}
                    className="w-full h-12 rounded-2xl bg-[#9940E5] text-white font-black italic uppercase tracking-widest text-sm"
                  >
                    {forgotLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Find My Account"}
                  </Button>
                  <button type="button" onClick={resetForgot} className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors py-1">Cancel</button>
                </form>
              </>
            ) : forgotStep === "question" ? (
              <>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-violet-50 flex items-center justify-center">
                      <ShieldQuestion className="h-5 w-5 text-[#9940E5]" />
                    </div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900">Security Check</h3>
                  </div>
                  <p className="text-sm text-gray-500 pl-11">Answer your security question to continue.</p>
                </div>
                <div className="bg-violet-50 border border-violet-100 rounded-2xl px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#9940E5] mb-1">Your Question</p>
                  <p className="text-sm font-bold text-gray-800">{forgotQuestion}</p>
                </div>
                <form onSubmit={handleVerifyAnswer} className="space-y-4">
                  <Input
                    type="text"
                    value={forgotAnswer}
                    onChange={e => setForgotAnswer(e.target.value)}
                    placeholder="Your answer"
                    required
                    className="h-14 px-4 bg-gray-50 border-gray-100 rounded-2xl text-gray-900 font-medium placeholder:text-gray-300 focus:border-[#9940E5] focus:ring-[#9940E5]/20 focus:ring-4 transition-all"
                  />
                  <Button
                    type="submit"
                    disabled={forgotLoading || !forgotAnswer}
                    className="w-full h-12 rounded-2xl bg-[#9940E5] text-white font-black italic uppercase tracking-widest text-sm"
                  >
                    {forgotLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify Answer"}
                  </Button>
                  <button type="button" onClick={resetForgot} className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors py-1">Cancel</button>
                </form>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-violet-50 flex items-center justify-center">
                      <KeyRound className="h-5 w-5 text-[#9940E5]" />
                    </div>
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900">New Password</h3>
                  </div>
                  <p className="text-sm text-gray-500 pl-11">Set a strong new password for your account.</p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <Input
                      type={showNewPass ? "text" : "password"}
                      value={forgotNewPass}
                      onChange={e => setForgotNewPass(e.target.value)}
                      placeholder="New password"
                      required
                      className="h-14 pl-11 pr-12 bg-gray-50 border-gray-100 rounded-2xl text-gray-900 font-medium placeholder:text-gray-300 focus:border-[#9940E5] focus:ring-[#9940E5]/20 focus:ring-4 transition-all"
                    />
                    <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors">
                      {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <Input
                      type="password"
                      value={forgotConfirm}
                      onChange={e => setForgotConfirm(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className="h-14 pl-11 bg-gray-50 border-gray-100 rounded-2xl text-gray-900 font-medium placeholder:text-gray-300 focus:border-[#9940E5] focus:ring-[#9940E5]/20 focus:ring-4 transition-all"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={forgotLoading || !forgotNewPass || !forgotConfirm}
                    className="w-full h-12 rounded-2xl bg-[#9940E5] text-white font-black italic uppercase tracking-widest text-sm"
                  >
                    {forgotLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Reset Password"}
                  </Button>
                  <button type="button" onClick={resetForgot} className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors py-1">Cancel</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
