
"use client";

import { useState } from "react";
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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePosts } from "@/context/PostContext";
import { useMusic } from "@/context/MusicContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function AuthModal() {
  const { currentUser, login, signup, triggerHaptic } = usePosts();
  const { toast } = useToast();
  
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  // If user is already materialized in context, don't show the gate
  if (currentUser && currentUser.username !== 'johndoe_creative') return null;
  // Temporary bypass for prototype logic if needed, but for now we enforce live auth
  if (currentUser?.isOnline && currentUser.username !== 'johndoe_creative') return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    triggerHaptic(20);

    try {
      if (mode === "login") {
        await login(email, password);
        toast({ title: "Identity Synced", description: "Welcome back to the ViMore network." });
      } else {
        if (!name || !username) {
          toast({ variant: "destructive", title: "Missing Data", description: "All identity fields are required." });
          setIsLoading(false);
          return;
        }
        await signup(email, password, name, username);
        toast({ title: "Node Materialized", description: "Your digital signature is now live." });
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Handshake Failed", 
        description: error.message || "Could not synchronize with Appwrite." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    triggerHaptic(5);
    setMode(mode === "login" ? "signup" : "login");
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#050505] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/20 blur-[120px] rounded-full animate-pulse delay-700" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
      </div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-10 animate-in fade-in zoom-in-95 duration-700">
        
        <header className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-[1.25rem] flex items-center justify-center text-white shadow-2xl shadow-primary/20 transition-transform hover:scale-105 active:scale-95 cursor-pointer">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                <path d="M3 7L10 19L17 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 15L17 7L21 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">ViMore</h1>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Spatial Connection Node</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
          <div className="space-y-4">
            {mode === "signup" && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Name</Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <Input 
                      placeholder="John Doe" 
                      className="h-12 pl-11 bg-white/5 border-none rounded-xl text-white font-bold focus-visible:ring-primary/40"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Username</Label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <Input 
                      placeholder="johndoe" 
                      className="h-12 pl-11 bg-white/5 border-none rounded-xl text-white font-bold focus-visible:ring-primary/40"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase())}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Email Node</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input 
                  type="email"
                  placeholder="sync@vimore.com" 
                  className="h-12 pl-11 bg-white/5 border-none rounded-xl text-white font-bold focus-visible:ring-primary/40"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Security Node</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                <Input 
                  type="password"
                  placeholder="••••••••" 
                  className="h-12 pl-11 bg-white/5 border-none rounded-xl text-white font-bold focus-visible:ring-primary/40"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full h-14 rounded-2xl bg-primary text-white font-black italic uppercase tracking-[0.2em] text-sm shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
              <span className="flex items-center gap-2">
                {mode === "login" ? "Launch Pulse" : "Materialize Signature"}
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <div className="pt-2 text-center">
            <button 
              type="button"
              onClick={toggleMode}
              className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary transition-colors"
            >
              {mode === "login" ? "Don't have a signature? Create One" : "Already synchronized? Sign In"}
            </button>
          </div>
        </form>

        <footer className="w-full flex flex-col items-center gap-4 opacity-40">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Appwrite Cloud Handshake Active</span>
          </div>
          <p className="text-[9px] font-bold text-white uppercase tracking-widest">ViMore Live v1.0.0 — MTL Command Core</p>
        </footer>
      </div>
    </div>
  );
}
